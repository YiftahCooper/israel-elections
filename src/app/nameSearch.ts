// One way to find a list or party by name in every search box (22 Nov 2026): case and apostrophes, geresh and
// gershayim, hyphens and dashes do not matter, and a party's other spellings in the registry (data/meta/parties.json
// `searchNames`, such as "Together" or "B'Yachad" for Beyachad) find it too. Those spellings are for finding only and
// are never shown as the name.
import searchNames from 'virtual:party-search-names';

/** Lower case, without Hebrew points, apostrophes, geresh, gershayim, quotes, hyphens or dashes, single spaces. */
export const foldName = (s: string) => s.normalize('NFKD').replace(/[̀-֑ͯ-ׇ]/g, '').toLocaleLowerCase()
  .replace(/['’‘`´׳״"“”\-‐‑‒–—־]/g, '').replace(/\s+/g, ' ').trim();

/** Whether what was typed is part of any of the names (an empty query matches everything). */
export function matchesName(query: string, names: readonly (string | null | undefined)[]): boolean {
  const q = foldName(query);
  return !q || names.some((n) => !!n && foldName(n).includes(q));
}

/** A party's other spellings, for finding only. */
export const partySearchNames = (partyId: string): readonly string[] => searchNames[partyId] ?? [];

/** The names a list is found by: its own names and its parties' other spellings. */
export function listSearchNames(l: { nameHe?: string; shortHe?: string; shortEn?: string | null; parties?: readonly { id: string }[] }): string[] {
  return [l.nameHe, l.shortHe, l.shortEn, ...(l.parties ?? []).flatMap((p) => partySearchNames(p.id))].filter((n): n is string => !!n);
}
