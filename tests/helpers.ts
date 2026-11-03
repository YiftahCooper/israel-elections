import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { rat } from '../src/engine/rational.ts';
import { ISRAEL_2014 } from '../src/engine/rules.ts';
import type { AllocationInput, RuleSet } from '../src/engine/types.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';

export const loadDataset = (id: 'k25' | 'k26'): ElectionDataset =>
  JSON.parse(readFileSync(join(import.meta.dirname, '..', 'public', 'data', `${id}.json`), 'utf8'));

export const allocateDataset = (id: 'k25' | 'k26') => {
  const ds = loadDataset(id);
  const s = scenarioFromDataset(ds);
  return { ds, s, res: allocate(toEngineInput(s)) };
};

export const seatsOf = (res: ReturnType<typeof allocate>) => Object.fromEntries(res.lists.filter((l) => l.seats > 0).map((l) => [l.id, l.seats]));

export const rules = (patch: Partial<RuleSet> = {}): RuleSet => ({ ...ISRAEL_2014, ...patch });

export const simple = (votes: Record<string, number>, agreements: string[][] = [], patch: Partial<RuleSet> = {}, lotteryWinners?: Record<string, string>): AllocationInput => ({
  rules: rules(patch),
  lists: Object.entries(votes).map(([id, v]) => ({ id, votes: BigInt(v) })),
  agreements: agreements.map((m, i) => ({ id: `A${i + 1}`, members: m })),
  lotteryWinners,
});

/** Independent D'Hondt implementation (used only to cross-check the engine). */
export function dhondt(votes: Record<string, number>, seats: number, thresholdPct: number): Record<string, number> {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const q = Object.entries(votes).filter(([, v]) => v * 10000 >= thresholdPct * 100 * total);
  const s: Record<string, number> = Object.fromEntries(q.map(([k]) => [k, 0]));
  for (let i = 0; i < seats; i++) {
    let best = ''; let bn = -1n; let bd = 1n;
    for (const [k, v] of q) {
      const n = BigInt(v); const d = BigInt(s[k] + 1);
      if (n * bd > bn * d) { best = k; bn = n; bd = d; }
    }
    s[best]++;
  }
  return Object.fromEntries(Object.entries(s).filter(([, v]) => v > 0));
}

export { rat };
