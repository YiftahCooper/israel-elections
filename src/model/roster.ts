import type { SimList } from './scenario.ts';

const sorted = (_k: string, x: unknown) => x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]])) : x;

/** A list's roster as it travels between lists and elections: every candidate field except where the candidate was
 *  registered or copied from, the parties they stand for (colours are appearance) and the completeness flags. Two
 *  rosters with the same key are the same to a reader; a renamed candidate is a different roster. */
export function rosterKey(l: Pick<SimList, 'candidates' | 'parties' | 'rosterUnavailable' | 'rosterTruncated'>): string {
  return JSON.stringify({
    candidates: l.candidates.map(({ originListId: _o, importedFrom: _i, ...c }) => c),
    parties: (l.parties ?? []).map(({ color: _c, customColor: _cc, ...p }) => p),
    unavailable: !!l.rosterUnavailable, truncated: !!l.rosterTruncated,
  }, sorted);
}
