import type { Scenario } from '../model/scenario.ts';

/** Declared bloc order, with unassigned members between its two halves. Physical left → right. */
export function blocDisplayOrder(s: Pick<Scenario, 'blocs'>): (string | null)[] {
  const ids: (string | null)[] = s.blocs.map(b => b.id);
  ids.splice(Math.floor(ids.length / 2), 0, null);
  return ids;
}
