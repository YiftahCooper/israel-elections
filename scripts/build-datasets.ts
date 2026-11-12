import { electionContext } from '../src/data/electionContext.ts';
import { validateAftermathRecords } from './lib/build/aftermath.ts';
import { verifySources } from './lib/build/sources.ts';
import { checkDatasetTotals } from './lib/build/validate.ts';
// Builds the app datasets in public/data/ from the raw official sources in data/raw/.
//   node scripts/build-datasets.ts            (BUILD_JOBS=1 builds serially in one thread)
// Every figure is derived from a raw file listed in data/raw/SOURCES.json; the script fails loudly
// on any internal inconsistency (totals that do not reconcile, rank gaps, unknown letters).
// Each election has its own module in scripts/lib/historical/; shared rules live in scripts/lib/build/.
// Elections are independent, so they are built in parallel worker threads; logs and files are
// still emitted in election order, and the first failure stops the build with a non-zero exit.
// Files whose content is unchanged are not rewritten and keep their buildInfo.builtAt (see output.ts).
import { attachDemographics } from './lib/build/demographics.ts';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { format } from 'node:util';
import { isMainThread, parentPort, Worker } from 'node:worker_threads';
import type { ElectionDataset, LocalityDataset } from '../src/data/schema.ts';
import { buildK1 } from './lib/historical/k1.ts';
import { buildK2 } from './lib/historical/k2.ts';
import { buildK3 } from './lib/historical/k3.ts';
import { buildK4 } from './lib/historical/k4.ts';
import { buildK5 } from './lib/historical/k5.ts';
import { buildK6 } from './lib/historical/k6.ts';
import { buildK7 } from './lib/historical/k7.ts';
import { buildK8 } from './lib/historical/k8.ts';
import { buildK9 } from './lib/historical/k9.ts';
import { buildK10 } from './lib/historical/k10.ts';
import { buildK11 } from './lib/historical/k11.ts';
import { buildK12 } from './lib/historical/k12.ts';
import { buildK13 } from './lib/historical/k13.ts';
import { buildK14 } from './lib/historical/k14.ts';
import { buildK15 } from './lib/historical/k15.ts';
import { buildK16 } from './lib/historical/k16.ts';
import { buildK17 } from './lib/historical/k17.ts';
import { buildK18 } from './lib/historical/k18.ts';
import { buildK19 } from './lib/historical/k19.ts';
import { buildK20 } from './lib/historical/k20.ts';
import { buildK21 } from './lib/historical/k21.ts';
import { buildK22 } from './lib/historical/k22.ts';
import { buildK23 } from './lib/historical/k23.ts';
import { buildK24 } from './lib/historical/k24.ts';
import { buildK25 } from './lib/historical/k25.ts';
import { buildK26 } from './lib/historical/k26.ts';
import { writeIfChanged } from './lib/build/output.ts';
import { finalizeDataset } from './lib/build/finalize.ts';
import { manifest, OUT } from './lib/build/sources.ts';

interface Built { ds: ElectionDataset; loc?: LocalityDataset | null; warnings?: string[] }
type Job = () => Built | Promise<Built>;
/** Builders either return release jobs after their evidence gates (an empty list means the
 *  election is verified but not released) or build their dataset directly. */
type Builder = () => Job[] | Promise<Built>;
const BUILDERS: Builder[] = [buildK1, buildK2, buildK3, buildK4, buildK5, buildK6, buildK7, buildK8, buildK9, buildK10, buildK11, buildK12,
  buildK13, buildK14, buildK15, buildK16, buildK17, buildK18, buildK19, buildK20, buildK21, buildK22, buildK23, buildK24, buildK25, buildK26];

/** One builder's outputs (lists already in seat order) and everything it logged. */
interface Result { outputs: Built[]; logs: { warn: boolean; text: string }[]; error?: string }

/** Runs builder `i`, capturing its console output so parallel builds report in election order. */
async function runBuilder(i: number): Promise<Result> {
  const logs: Result['logs'] = [];
  const { log, warn } = console;
  console.log = (...a: unknown[]) => { logs.push({ warn: false, text: format(...a) }); };
  console.warn = (...a: unknown[]) => { logs.push({ warn: true, text: format(...a) }); };
  try {
    const registered = BUILDERS[i]();
    const jobs: Job[] = Array.isArray(registered) ? registered : [() => registered];
    const outputs: Built[] = [];
    for (const job of jobs) {
      const built = await job();
      outputs.push({ ...built, ds: finalizeDataset(built.ds,built.loc??undefined) });
    }
    return { outputs, logs };
  } catch (e) {
    return { outputs: [], logs, error: e instanceof Error ? e.stack ?? e.message : String(e) };
  } finally {
    Object.assign(console, { log, warn });
  }
}

if (!isMainThread) {
  parentPort!.on('message', async (i: number) => parentPort!.postMessage(await runBuilder(i)));
} else {
  console.log(`aftermath: ${validateAftermathRecords()} government snapshots validated`);
  const jobs = Math.max(1, Math.min(Number(process.env.BUILD_JOBS) || Math.min(availableParallelism(), 8), BUILDERS.length));
  const results: Promise<Result>[] = jobs === 1 ? [] : Array(BUILDERS.length);
  if (jobs > 1) {
    // Later elections are the heaviest (PDF rosters, polling tables): start them first.
    const queue = BUILDERS.map((_, i) => i).reverse();
    const settle = new Map<number, (r: Result) => void>();
    BUILDERS.forEach((_, i) => { results[i] = new Promise(resolve => settle.set(i, resolve)); });
    const workers = Array.from({ length: jobs }, () => {
      const w = new Worker(new URL(import.meta.url));
      let current = -1;
      const next = () => { current = queue.shift() ?? -1; if (current >= 0) w.postMessage(current); else void w.terminate(); };
      w.on('message', (r: Result) => { settle.get(current)!(r); next(); });
      // A builder's own failure comes back as a Result; this is a crashed thread (e.g. a module
      // that fails to load). Fail its election and every queued one so nothing waits forever.
      w.on('error', (e: Error) => {
        const error = e.stack ?? String(e);
        for (const i of [current, ...queue.splice(0)]) settle.get(i)?.({ outputs: [], logs: [], error });
      });
      return next;
    });
    workers.forEach(start => start());
  }

  const contextSourceIds = [...JSON.stringify(electionContext).matchAll(/"sourceId":"([^"]+)"/g)].map(m => m[1]);
  verifySources(contextSourceIds, (ok, message) => { if (!ok) throw new Error(message); });
  const warnings: string[] = [];
  let written = 0; let unchanged = 0;
  const write = (file: string, value: object, serialize?: (v: object) => string) => {
    if (writeIfChanged(join(OUT, file), value, serialize) === 'written') written++; else unchanged++;
  };
  for (let i = 0; i < BUILDERS.length; i++) {
    const r = await (results[i] ?? runBuilder(i));
    for (const l of r.logs) (l.warn ? console.warn : console.log)(l.text);
    if (r.error) {
      console.error(r.error);
      process.exit(1);
    }
    for (const { ds, loc, warnings: w } of r.outputs) {
      checkDatasetTotals((ok, message) => { if (!ok) throw new Error(message); }, ds);
      write(`${ds.id}.json`, ds);
      if (loc) write(`${ds.id}-localities.json`, attachDemographics(ds, loc));
      warnings.push(...w ?? []);
      const cands = ds.lists.reduce((s, l) => s + l.candidates.length, 0);
      console.log(`${ds.id}: ${ds.lists.length} lists, ${cands} candidates, ${ds.agreements.length} agreements, valid ${ds.totals.valid}, ${loc?.rows.length ?? 0} locality rows`);
    }
  }
  write('sources.json', manifest().map(({ id, ...rest }) => ({ id, ...rest })), v => JSON.stringify(v, null, 1));
  for (const w of warnings) console.warn(w);
  console.log(`public/data: ${written} file(s) written, ${unchanged} unchanged (${jobs} build thread${jobs > 1 ? 's' : ''})`);
}
