/** Build-only compiler for party history and "compared with last time" (docs/features/party-history.md).
 *  Per election: whole-list votes and seats, colours, short names, the registered parties of each list, its leading
 *  party and the elected members per party (joint facts). No constituent vote figure exists anywhere: votes belong to
 *  the whole list. Logos and sources stay in the datasets and metadata. */
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';

type Appearance = { electionId: string; listId: string; partyId: string; role: string };
type Party = { id: string; entityType: string; nameHe: string; nameEn?: string | null; aliases?: { id: string }[] };
type Fact = { listId: string; headPartyId?: string | null; unknownElected: number; parties: { id: string; elected: number }[] };

/** A party on a list: [id, elected or -1, and where its usual short name was not yet (or no longer) its name at that
 *  election, the name it ran under then: Hebrew, English or null]. See nameAtElection below. */
export type PackedParty = readonly [string, number] | readonly [string, number, string, string | null];
/** One list: [id, votes, seats, colour, shortHe, shortEn, letters, lead, parties, unknownElected, 1 if it withdrew before
 *  the vote (registered, not on the ballot: a party did not run on it) else 0] */
export type PackedList = readonly [string, number, number, string, string, string | null, string, string | null, readonly PackedParty[], number, number];
export interface HistoryRuntime {
  version: 1;
  elections: { id: string; date: string; valid: number; pending: boolean; lists: PackedList[] }[];
  /** party id → [short Hebrew name, short English name or null, 1 for a registered party, 0 for a one-election vehicle] */
  parties: Record<string, readonly [string, string | null, number]>;  /** retired party id → its canonical id (the registry's aliases), so the app needs no registry to read lineage */
  aliases: Record<string, string>;
}

const stripNote = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, '').trim();
/** The words of a party name, to tell a different name from another form of the same one: no quote marks, dashes,
 *  notes in brackets or "led by …"; in Hebrew a leading ה is dropped, in English case, apostrophes and "the". */
const STOP = new Set(['the', 'of', 'and', 'for', 'a']);
export function nameWords(s: string, lang: 'he' | 'en'): string[] {
  const t = s.replace(/\([^)]*\)/g, ' ').replace(/\s(בראשות|בהנהגת|עם|led by)\s.*$/i, '').replace(/[״׳"'’`.,!]/g, '').replace(/[-–—־/]/g, ' ');
  const w = t.split(/\s+/).filter(Boolean);
  return lang === 'he' ? w.map((x) => x.length > 3 ? x.replace(/^ה/, '') : x) : w.map((x) => x.toLowerCase()).filter((x) => !STOP.has(x));
}
/** One letter apart, for transliterations of one Hebrew word (Hatnua, Hatnuah; Mizrahi, Mizrachi) */
const near = (a: string, b: string) => {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 5) return false;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return a.slice(i + (a.length >= b.length ? 1 : 0)) === b.slice(i + (b.length >= a.length ? 1 : 0));
};
/** Is `name` the usual name, or a longer form of it? Every word of the usual name is in it ("מפלגת העבודה הישראלית" is
 *  a form of "העבודה"; "תקומה" is not a form of "האיחוד הלאומי – תקומה", which came later). In English a one-letter
 *  spelling difference and an abbreviation of the whole name count as the same (NRP, National Religious Party). */
export function formOf(name: string, usual: string, lang: 'he' | 'en'): boolean {
  const n = nameWords(name, lang), u = nameWords(usual, lang);
  if (!u.length || !n.length) return false;
  if (u.every((w) => n.some((x) => lang === 'en' ? near(x, w) : x === w))) return true;
  const initials = (ws: string[]) => ws.map((x) => x[0]).join('');
  return lang === 'en' && ((n.length === 1 && n[0] === initials(u)) || (u.length === 1 && u[0] === initials(n)));
}
/** The name a party is shown under at each election it ran in, in one language (cx-parties-01, 12 Nov 2026). Its usual
 *  short name (from the latest list it ran alone on, else its latest name among a list's parties) only from the first to
 *  the last election it ran under that name; before that name existed, or after it was replaced, the name it ran under
 *  then: the list's short name where it ran alone, else its name among the list's parties. New Right ran as "הימין
 *  החדש" in April 2019, so it is not shown as "ימינה", the joint list formed for September 2019. null: the usual name.
 *  `same`: elections where the other language's names already show it is the usual name (Hebrew "מד״ע" and "המפלגה
 *  הדמוקרטית הערבית" are both "Arab Democratic Party"). */
export function nameAtElection(usual: string, then: readonly (string | null)[], lang: 'he' | 'en', same: readonly boolean[] = []): (string | null)[] {
  const is = then.map((n, i) => !!n && (formOf(n, usual, lang) || !!same[i]));
  const first = is.indexOf(true), last = is.lastIndexOf(true);
  return then.map((n, i) => n && !is[i] && (first < 0 || i < first || i > last) ? n : null);
}

export function compileHistoryRuntime(root = process.cwd()): HistoryRuntime {
  const read = (path: string) => JSON.parse(readFileSync(`${root}/${path}`, 'utf8'));
  const registry = read('data/meta/parties.json') as { parties: Party[]; partyAppearances: Appearance[] };
  const canonical = new Map<string, string>(registry.parties.flatMap((p) => [[p.id, p.id] as [string, string], ...(p.aliases ?? []).map((a) => [a.id, p.id] as [string, string])]));
  const canon = (id: string) => canonical.get(id) ?? id;
  const facts = new Map((read('data/meta/joint-facts.json') as Fact[]).map((f) => [f.listId, f]));
  // an alliance record named by an identity relation is an organisation in its own right (the Hadash front, 1977–88)
  // the same relations the app reads (src/history/relations.ts): edges, and pending items with both ends (merged-into by default)
  type Raw = { relation?: string; from?: string[]; to?: string[] };
  const lineage = read('data/meta/party-lineage.json') as { edges: Raw[]; pending?: Raw[] };
  const rels = [...lineage.edges.map((e) => ({ ...e, relation: e.relation ?? '' })), ...(lineage.pending ?? []).map((e) => ({ ...e, relation: e.relation ?? 'merged-into' }))];
  const identity = new Set(rels.filter((e) => e.from?.length && e.to?.length && ['renamed-to', 'merged-into', 'absorbed-into', 'same-organisation'].includes(e.relation)).flatMap((e) => [...e.from!, ...e.to!].map(canon)));
  const byList = new Map<string, string[]>();
  for (const a of registry.partyAppearances) {
    if (a.role === 'alliance' && !identity.has(canon(a.partyId))) continue;
    const k = `${a.electionId}|${a.listId}`, id = canon(a.partyId);
    const ps = byList.get(k) ?? []; if (!ps.includes(id)) ps.push(id); byList.set(k, ps);
  }
  // short party names: the list's own short name where the party ran alone (latest), else its constituent name
  const shortName = new Map<string, [string, string | null]>();
  const constituentName = new Map<string, [string, string | null]>();
  // each party's name at each election (list id → party id → name), kept below where it differs from the usual one
  const nameThen = new Map<string, Map<string, [string, string | null]>>();
  const elections = Array.from({ length: 26 }, (_, i) => {
    const d = read(`public/data/k${i + 1}.json`) as ElectionDataset;
    const seats = (d.officialSeats ?? {}) as Record<string, number>;
    const lists = d.lists.map((l): PackedList => {
      const ps = byList.get(`${d.id}|${l.id}`) ?? [];
      const f = facts.get(l.id);
      const first = l.candidates.find((c) => !c.notSeated)?.partyId;
      const lead = ps.length <= 1 ? ps[0] ?? null : first && ps.includes(canon(first)) ? canon(first) : f?.headPartyId && ps.includes(canon(f.headPartyId)) ? canon(f.headPartyId) : ps[0];
      // a list that withdrew before the vote names a party only when no list it ran on does (audit 12 Nov 2026,
      // c-screens-people-02): it never overrides a name the party was on the ballot under
      if (ps.length === 1 && (!l.withdrawn || !shortName.has(ps[0]))) shortName.set(ps[0], [l.shortHe, l.shortEn ?? null]);
      for (const p of l.parties ?? []) if (!l.withdrawn || !constituentName.has(canon(p.id))) constituentName.set(canon(p.id), [stripNote(p.nameHe), p.nameEn ? stripNote(p.nameEn) : null]);
      const then = new Map<string, [string, string | null]>();
      if (l.withdrawn) { /* no name at an election it did not run in */ }
      else if (ps.length === 1) then.set(ps[0], [l.shortHe, l.shortEn ?? null]);
      else for (const p of l.parties ?? []) if (ps.includes(canon(p.id)) && !then.has(canon(p.id))) then.set(canon(p.id), [stripNote(p.nameHe), p.nameEn ? stripNote(p.nameEn) : null]);
      nameThen.set(l.id, then);
      const elected = new Map(f?.parties.map((p) => [canon(p.id), p.elected]) ?? []);
      return [l.id, l.votes, seats[l.id] ?? 0, l.color, l.shortHe, l.shortEn ?? null, l.letters, lead,
        ps.map((p) => [p, ps.length === 1 ? seats[l.id] ?? 0 : elected.get(p) ?? -1] as const), f?.unknownElected ?? 0, l.withdrawn ? 1 : 0];
    });
    return { id: d.id, date: d.electionDate, valid: d.totals.valid, pending: d.status.stage !== 'official-final', lists };
  });
  const used = new Set(elections.flatMap((e) => e.lists.flatMap((l) => l[8].map(([p]) => p))));
  const parties: HistoryRuntime['parties'] = {};
  for (const p of registry.parties) {
    if (!used.has(p.id)) continue;
    const n = shortName.get(p.id) ?? constituentName.get(p.id) ?? [stripNote(p.nameHe), p.nameEn ? stripNote(p.nameEn) : null];
    parties[p.id] = [n[0], n[1], p.entityType === 'party' ? 1 : 0];
  }
  // each party's names, election by election (the list it ran on), then the ones shown instead of its usual name, in
  // each language on its own (the English and Hebrew records do not always change name at the same election)
  const shown = new Map<string, Map<number, [string, string | null]>>();
  for (const [id, usual] of Object.entries(parties)) {
    const then = elections.map((e) => { const l = e.lists.find((x) => !x[10] && x[8].some(([p]) => p === id)); return l ? nameThen.get(l[0])?.get(id) ?? null : null; });
    // English names tell a short form of a Hebrew name from a new one; not the other way round (a Hebrew record can give
    // the registered name where the English one gives the name the party was known by: Blue and White (Israel Resilience), 2022)
    const sameEn = then.map((n) => !!usual[1] && !!n?.[1] && formOf(n[1], usual[1], 'en'));
    const he = nameAtElection(usual[0], then.map((n) => n?.[0] ?? null), 'he', sameEn);
    const en = usual[1] ? nameAtElection(usual[1], then.map((n) => n?.[1] ?? null), 'en') : then.map(() => null);
    then.forEach((n, i) => { if (n && (he[i] || en[i])) (shown.get(id) ?? shown.set(id, new Map()).get(id)!).set(i, [he[i] ?? usual[0], en[i] ?? usual[1]]); });
  }
  elections.forEach((e, i) => { e.lists = e.lists.map((l) => [l[0], l[1], l[2], l[3], l[4], l[5], l[6], l[7], l[8].map(([p, n]): PackedParty => {
    const x = l[10] ? undefined : shown.get(p)?.get(i);
    return x ? [p, n, x[0], x[1]] : [p, n];
  }), l[9], l[10]]); });
  const aliases: Record<string, string> = {};
  for (const p of registry.parties) for (const a of p.aliases ?? []) aliases[a.id] = p.id;
  return { version: 1, elections, parties, aliases };
}
