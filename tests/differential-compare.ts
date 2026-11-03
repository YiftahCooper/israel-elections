// Compares the differential corpus between two source trees and prints each family's digest.
// Use it when tests/differential.test.ts reports a changed digest, to find the first differing case:
//   git archive <old-rev> src | tar -x -C .backup-scratch/old
//   node tests/differential-compare.ts .backup-scratch/old/src src
// With one root it prints that tree's digests (to record a deliberate, reviewed output change).
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FAMILIES, families, type Modules } from './differential.cases.ts';

export async function loadModules(root: string): Promise<Modules> {
  const imp = (p: string) => import(pathToFileURL(join(resolve(root), p)).href);
  const [a, an, ac, sc, ru] = await Promise.all([imp('engine/allocate.ts'), imp('engine/analysis.ts'), imp('model/actions.ts'), imp('model/scenario.ts'), imp('engine/rules.ts')]);
  return { allocate: a.allocate, minimalChange: an.minimalChange, sweepVotes: an.sweepVotes, sweepThreshold: an.sweepThreshold, goals: an.goals,
    applyAction: ac.applyAction, scenarioFromDataset: sc.scenarioFromDataset, toEngineInput: sc.toEngineInput, validateScenario: sc.validateScenario,
    historicalRules: sc.historicalRules, electionRuleSetId: sc.electionRuleSetId, toRuleSet: sc.toRuleSet, ruleDepartures: ru.ruleDepartures, RULESETS: ru.RULESETS };
}

if (import.meta.main) {
  const roots = process.argv.slice(2);
  const mods = await Promise.all(roots.map(loadModules));
  for (const fam of FAMILIES) {
    const res = mods.map((m) => { const t = performance.now(); const r = families(m, undefined, roots.length > 1)[fam](); return { ...r, ms: performance.now() - t }; });
    console.log(`${fam.padEnd(11)} ${res.map((r, i) => `${roots[i]}: ${r.digest} (${r.count} cases, ${r.ms.toFixed(0)} ms)`).join(' | ')}`);
    if (res.length !== 2) continue;
    const [a, b] = res;
    let diffs = 0;
    for (let i = 0; i < Math.max(a.out.length, b.out.length); i++) {
      const [x, y] = [a.out[i]?.[1] ?? '', b.out[i]?.[1] ?? ''];
      if (a.out[i]?.[0] === b.out[i]?.[0] && x === y) continue;
      if (diffs++ < 3) {
        let p = 0; while (p < x.length && x[p] === y[p]) p++;
        console.log(`  DIFF ${a.out[i]?.[0]} at char ${p}:\n    A …${x.slice(Math.max(0, p - 150), p + 150)}\n    B …${y.slice(Math.max(0, p - 150), p + 150)}`);
      }
    }
    console.log(diffs ? `  ${diffs} differing cases` : '  identical');
  }
}
