// Merges the sourced party/bloc/colour research (data/meta/kNN.json, decision 0087) into a dataset:
//  - constituent parties of joint lists (ListRecord.parties) and each candidate's party (Candidate.partyId);
//  - bloc schemes per election (ElectionDataset.blocSchemes, defaultBlocScheme), normalised to ids;
//  - colours: constituent-party colours, and each list's associated colour where the research rates it
//    medium or high and it stays distinguishable from its seat-order neighbours (otherwise the app's
//    cross-election colour is kept).
// It never changes votes, seats, rosters or the elected list, and it fails loudly on any reference to a
// list, rank or party that does not exist, so a roster correction cannot silently misassign people.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BlocScheme, ElectionDataset } from '../../../src/data/schema.ts';

const META = join(import.meta.dirname, '..', '..', '..', 'data', 'meta');

interface MetaParty { id: string; nameHe: string; nameEn: string; candidateRanks?: number[]; confidence?: string }
interface MetaList { letters: string; parties?: MetaParty[] }
interface MetaMember { letters?: string; party?: string; parties?: string[]; ranks?: number[]; note?: string; joined?: string }
interface MetaScheme { id: string; nameHe: string; nameEn: string; kind: string; date?: string; notes?: unknown;
  blocs: { id: string; nameHe: string; nameEn: string; color: string; members: MetaMember[] }[] }
interface MetaColour { letters?: string; party?: string; color: string; confidence?: string }
interface Meta { electionId: string; lists: MetaList[]; blocSchemes?: MetaScheme[]; colours?: MetaColour[] }

const HEX = /^#[0-9a-fA-F]{6}$/;
const KINDS = new Set(['government', 'parliamentary', 'pre-election']);

// CIE Lab ΔE76, copied from scripts/check-colours.ts so the build and the CI check agree exactly
const lab = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const [x, y, z] = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]].map((r, i) => (r[0] * c[0] + r[1] * c[1] + r[2] * c[2]) / [0.95047, 1, 1.08883][i]);
  const f = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
const deltaE = (a: string, b: string) => { const [p, q] = [lab(a), lab(b)]; return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
export const MIN_DELTA_E = 20;

export function applyMeta(ds: ElectionDataset): ElectionDataset {
  const file = join(META, `${ds.id}.json`);
  if (!existsSync(file)) return ds;
  const meta: Meta = JSON.parse(readFileSync(file, 'utf8'));
  const fail = (msg: string): never => { throw new Error(`data/meta/${ds.id}.json: ${msg}`); };
  if (meta.electionId !== ds.id) fail(`electionId ${meta.electionId}`);
  const listId = (letters: string) => { const l = ds.lists.find((x) => x.letters === letters); if (!l) fail(`no list ${letters}`); return l!.id; };

  // ---- parties of joint lists, and each candidate's party
  // a party can run on more than one list in one election (e.g. Black Panthers members in 1977)
  const partyLists = new Map<string, Set<string>>(); // party id -> list ids
  const partyOfCandidate = new Map<string, string>();
  const partiesByList = new Map<string, { id: string; nameHe: string; nameEn: string; color?: string }[]>();
  for (const ml of meta.lists) {
    const parties = ml.parties ?? [];
    if (parties.length < 2) continue; // a single party is not an alliance
    const lid = listId(ml.letters);
    const list = ds.lists.find((l) => l.id === lid)!;
    const ranks = new Map(list.candidates.map((c) => [c.rank, c.id]));
    for (const p of parties) {
      if (!p.id || !p.nameHe || !p.nameEn) fail(`${ml.letters}: party without id or names`);
      if (!partyLists.has(p.id)) partyLists.set(p.id, new Set());
      partyLists.get(p.id)!.add(lid);
      for (const r of p.candidateRanks ?? []) {
        const cid = ranks.get(r);
        if (!cid) continue; // a rank beyond a truncated roster: nothing to tag
        if (partyOfCandidate.has(cid) && partyOfCandidate.get(cid) !== p.id) fail(`${ml.letters} #${r} in two parties`);
        partyOfCandidate.set(cid, p.id);
      }
    }
    partiesByList.set(lid, parties.map((p) => ({ id: p.id, nameHe: p.nameHe, nameEn: p.nameEn })));
  }

  // ---- colours
  // an associated colour is used only when rated medium or high and readable as a seat fill in both
  // themes (CIE L* between 25 and 82: not near-black like a black logo, not near-white)
  const readable = (hex: string) => { const L = lab(hex)[0]; return L >= 25 && L <= 82; };
  const strong = (c: MetaColour) => HEX.test(c.color) && (c.confidence === 'high' || c.confidence === 'medium') && readable(c.color);
  for (const c of meta.colours ?? []) {
    if (!HEX.test(c.color)) fail(`bad colour ${c.color}`);
    if (c.party && strong(c)) for (const lid of partyLists.get(c.party) ?? []) { const p = partiesByList.get(lid)?.find((x) => x.id === c.party); if (p) p.color = c.color.toLowerCase(); }
  }
  // list colours: take the associated colour, then undo any that collide with a seat-order neighbour
  const associated = new Map<string, string>();
  for (const c of meta.colours ?? []) if (c.letters && strong(c)) associated.set(listId(c.letters), c.color.toLowerCase());
  let lists = ds.lists.map((l) => {
    const parties = partiesByList.get(l.id);
    return {
      ...l,
      color: associated.get(l.id) ?? l.color,
      ...(parties ? { parties } : {}),
      candidates: l.candidates.map((c) => (partyOfCandidate.has(c.id) ? { ...c, partyId: partyOfCandidate.get(c.id)! } : c)),
    };
  });
  // the same seat-winning set as scripts/check-colours.ts (2026 has no official seat table yet)
  const thr = Number(ds.ruleSetId.split('-').pop()) / 100;
  const wins = (l: { id: string; votes: number }) => (ds.officialSeats ? (ds.officialSeats[l.id] ?? 0) > 0 : l.votes >= thr * ds.totals.valid);
  for (let pass = 0; pass < 10; pass++) {
    const winners = lists.filter(wins); // already in seat order
    let changed = false;
    for (let i = 1; i < winners.length; i++) {
      const a = winners[i - 1], b = winners[i];
      if (deltaE(a.color, b.color) >= MIN_DELTA_E) continue;
      // keep the associated colour of the larger list; the smaller falls back to the app colour
      const victim = [b, a].find((x) => associated.has(x.id) && x.color !== ds.lists.find((o) => o.id === x.id)!.color);
      if (!victim) continue;
      lists = lists.map((l) => (l.id === victim.id ? { ...l, color: ds.lists.find((o) => o.id === l.id)!.color } : l));
      associated.delete(victim.id);
      changed = true;
    }
    if (!changed) break;
  }

  // ---- bloc schemes
  const schemes: BlocScheme[] = (meta.blocSchemes ?? []).map((s) => {
    if (!KINDS.has(s.kind)) fail(`scheme ${s.id}: kind ${s.kind}`);
    return {
      id: s.id, kind: s.kind as BlocScheme['kind'], nameHe: s.nameHe, nameEn: s.nameEn, ...(s.date ? { date: s.date } : {}),
      blocs: s.blocs.map((b) => {
        if (!HEX.test(b.color)) fail(`scheme ${s.id} bloc ${b.id}: colour ${b.color}`);
        const out = { id: b.id, nameHe: b.nameHe, nameEn: b.nameEn, color: b.color.toLowerCase(), lists: [] as string[], parties: [] as string[], candidates: [] as string[] };
        for (const m of b.members) {
          if (m.party) { if (!partyLists.has(m.party)) fail(`scheme ${s.id}: unknown party ${m.party}`); out.parties.push(m.party); continue; }
          if (!m.letters) fail(`scheme ${s.id}: member without list or party`);
          const lid = listId(m.letters!);
          if (m.parties) { for (const p of m.parties) { if (!partyLists.get(p)?.has(lid)) fail(`scheme ${s.id}: ${p} not on ${m.letters}`); out.parties.push(p); } continue; }
          if (m.ranks) {
            const list = lists.find((l) => l.id === lid)!;
            for (const r of m.ranks) { const c = list.candidates.find((x) => x.rank === r); if (!c) fail(`scheme ${s.id}: ${m.letters} #${r} not in roster`); out.candidates.push(c!.id); }
            continue;
          }
          out.lists.push(lid);
        }
        return out;
      }),
    };
  });
  // default (decision 0087): the first government formed after this election, else its pre-election blocs,
  // else any other sourced grouping (e.g. an outgoing government, or recommendations to the President)
  const pick = schemes.find((s) => s.id === 'first-government') ?? schemes.find((s) => s.kind === 'pre-election') ?? schemes.find((s) => s.kind === 'government') ?? schemes[0];
  return { ...ds, lists, ...(schemes.length ? { blocSchemes: schemes, defaultBlocScheme: pick!.id } : {}) };
}
