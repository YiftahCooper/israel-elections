import type { AllocationResult } from '../engine/types.ts';
import type { Scenario } from '../model/scenario.ts';
import { comparisonGroups } from './derive.ts';

/** Structural edits compare connected origins once; a split never inherits the whole baseline per child. */
export function changedSeatKeys(s: Scenario, r: AllocationResult, base: Scenario, br: AllocationResult) {
  const gained = new Set<string>(), lost = new Set<string>();
  for (const g of comparisonGroups(s, r, base, br)) {
    const mark = (ids: string[], result: AllocationResult, count: number, out: Set<string>) => {
      const keys = ids.flatMap(id => Array.from({ length: result.lists.find(l => l.id === id)?.seats ?? 0 }, (_, i) => `${id}:${i}`));
      keys.slice(Math.max(0, keys.length - count)).forEach(k => out.add(k));
    };
    if (g.seatsB > g.seatsA) mark(g.bIds, r, g.seatsB - g.seatsA, gained);
    if (g.seatsA > g.seatsB) mark(g.aIds, br, g.seatsA - g.seatsB, lost);
  }
  return { gained, lost };
}
