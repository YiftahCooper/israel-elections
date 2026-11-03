// Builds the app datasets in public/data/ from the raw official sources in data/raw/.
//   node scripts/build-datasets.ts
// Every figure is derived from a raw file listed in data/raw/SOURCES.json; the script fails loudly
// on any internal inconsistency (totals that do not reconcile, rank gaps, unknown letters).
// Each election has its own module in scripts/lib/historical/; shared rules live in scripts/lib/build/.
// Files whose content is unchanged are not rewritten and keep their buildInfo.builtAt (see output.ts).
import { join } from 'node:path';
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
import { seatOrder } from './lib/build/records.ts';
import { manifest, OUT } from './lib/build/sources.ts';

interface Built { ds: ElectionDataset; loc?: LocalityDataset | null; warnings?: string[] }
type Job = () => Built | Promise<Built>;
/** Builders either return release jobs after their evidence gates (an empty list means the
 *  election is verified but not released) or build their dataset directly. */
type Builder = () => Job[] | Promise<Built>;
const BUILDERS: Builder[] = [buildK1, buildK2, buildK3, buildK4, buildK5, buildK6, buildK7, buildK8, buildK9, buildK10, buildK11, buildK12,
  buildK13, buildK14, buildK15, buildK16, buildK17, buildK18, buildK19, buildK20, buildK21, buildK22, buildK23, buildK24, buildK25, buildK26];

const warnings: string[] = [];
let written = 0; let unchanged = 0;
const write = (file: string, value: object, serialize?: (v: object) => string) => {
  if (writeIfChanged(join(OUT, file), value, serialize) === 'written') written++; else unchanged++;
};

for (const builder of BUILDERS) {
  const registered = builder();
  const jobs: Job[] = Array.isArray(registered) ? registered : [() => registered];
  for (const job of jobs) {
    const built = await job();
    const ds = { ...built.ds, lists: seatOrder(built.ds.lists) };
    const loc = built.loc;
    write(`${ds.id}.json`, ds);
    if (loc) write(`${ds.id}-localities.json`, loc);
    warnings.push(...built.warnings ?? []);
    const cands = ds.lists.reduce((s, l) => s + l.candidates.length, 0);
    console.log(`${ds.id}: ${ds.lists.length} lists, ${cands} candidates, ${ds.agreements.length} agreements, valid ${ds.totals.valid}, ${loc?.rows.length ?? 0} locality rows`);
  }
}
write('sources.json', manifest().map(({ id, ...rest }) => ({ id, ...rest })), v => JSON.stringify(v, null, 1));
for (const w of warnings) console.warn(w);
console.log(`public/data: ${written} file(s) written, ${unchanged} unchanged`);
