/** Build-only compiler for party history and "compared with last time" (docs/design/party-history.md §6).
 *  Per election: whole-list votes and seats, colours, short names, the registered parties of each list, its leading
 *  party and the elected members per party (joint facts). No constituent vote figure exists anywhere: votes belong to
 *  the whole list. Logos and sources stay in the datasets and metadata. */
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';

type Appearance = { electionId: string; listId: string; partyId: string; role: string };
type Party = { id: string; entityType: string; nameHe: string; nameEn?: string | null; aliases?: { id: string }[] };
type Fact = { listId: string; headPartyId?: string | null; unknownElected: number; parties: { id: string; elected: number }[] };

/** One list: [id, votes, seats, colour, shortHe, shortEn, letters, lead, parties [id, elected|-1][], unknownElected] */
export type PackedList = readonly [string, number, number, string, string, string | null, string, string | null, readonly (readonly [string, number])[], number];
export interface HistoryRuntime {
  version: 1;
  elections: { id: string; date: string; valid: number; pending: boolean; lists: PackedList[] }[];
  /** party id → [short Hebrew name, short English name or null, 1 for a registered party, 0 for a one-election vehicle] */
  parties: Record<string, readonly [string, string | null, number]>;  /** retired party id → its canonical id (the registry's aliases), so the app needs no registry to read lineage */
  aliases: Record<string, string>;
}

const stripNote = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, '').trim();

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
  const elections = Array.from({ length: 26 }, (_, i) => {
    const d = read(`public/data/k${i + 1}.json`) as ElectionDataset;
    const seats = (d.officialSeats ?? {}) as Record<string, number>;
    const lists = d.lists.map((l): PackedList => {
      const ps = byList.get(`${d.id}|${l.id}`) ?? [];
      const f = facts.get(l.id);
      const first = l.candidates.find((c) => !c.notSeated)?.partyId;
      const lead = ps.length <= 1 ? ps[0] ?? null : first && ps.includes(canon(first)) ? canon(first) : f?.headPartyId && ps.includes(canon(f.headPartyId)) ? canon(f.headPartyId) : ps[0];
      if (ps.length === 1) shortName.set(ps[0], [l.shortHe, l.shortEn ?? null]);
      for (const p of l.parties ?? []) constituentName.set(canon(p.id), [stripNote(p.nameHe), p.nameEn ? stripNote(p.nameEn) : null]);
      const elected = new Map(f?.parties.map((p) => [canon(p.id), p.elected]) ?? []);
      return [l.id, l.votes, seats[l.id] ?? 0, l.color, l.shortHe, l.shortEn ?? null, l.letters, lead,
        ps.map((p) => [p, ps.length === 1 ? seats[l.id] ?? 0 : elected.get(p) ?? -1] as const), f?.unknownElected ?? 0];
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
  const aliases: Record<string, string> = {};
  for (const p of registry.parties) for (const a of p.aliases ?? []) aliases[a.id] = p.id;
  return { version: 1, elections, parties, aliases };
}
