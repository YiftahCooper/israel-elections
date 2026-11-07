import {localityLeaderIds} from '../../../src/data/locality-leaders.ts';
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
import type { BlocScheme, ElectionDataset, LocalityDataset } from '../../../src/data/schema.ts';

const META = join(import.meta.dirname, '..', '..', '..', 'data', 'meta');

interface MetaParty { id: string; nameHe: string; nameEn: string; candidateRanks?: number[]; confidence?: string }
interface MetaList { englishName?: import('../../../src/data/schema.ts').ListRecord['englishName']; letters: string; parties?: MetaParty[] }
interface MetaMember { letters?: string; party?: string; parties?: string[]; ranks?: number[]; note?: string; joined?: string }
interface MetaScheme { appDefined?: boolean; id: string; nameHe: string; nameEn: string; kind: string; date?: string; notes?: unknown;
  blocs: { appDefined?: boolean; id: string; nameHe: string; nameEn: string; color: string; members: MetaMember[] }[] }
interface MetaColour { letters?: string; party?: string; color: string; confidence?: string }
interface Meta { electionId: string; lists: MetaList[]; blocSchemes?: MetaScheme[]; colours?: MetaColour[] }

const HEX = /^#[0-9a-fA-F]{6}$/;
const KINDS = new Set(['government', 'parliamentary', 'pre-election']);

import {hexToLab} from '../../../src/data/colour.ts';
import {separateBlocColours,separateColours} from '../../../src/data/colourGuard.ts';


export function applyMeta(ds: ElectionDataset, localities?:Pick<LocalityDataset,'listIds'|'rows'>): ElectionDataset {
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
  const readable = (hex: string) => { const L = hexToLab(hex)[0]; return L >= 25 && L <= 82; };
  const strong = (c: MetaColour) => HEX.test(c.color) && (c.confidence === 'high' || c.confidence === 'medium') && readable(c.color);
  for (const c of meta.colours ?? []) {
    if (!HEX.test(c.color)) fail(`bad colour ${c.color}`);
    if (c.party && strong(c)) for (const lid of partyLists.get(c.party) ?? []) { const p = partiesByList.get(lid)?.find((x) => x.id === c.party); if (p) p.color = c.color.toLowerCase(); }
  }
  // list colours: the associated colour where the research has one, else the app's cross-election colour
  const associated = new Map<string, string>();
  for (const c of meta.colours ?? []) if (c.letters && strong(c)) associated.set(listId(c.letters), c.color.toLowerCase());
  let lists = ds.lists.map((l) => {
    const parties = partiesByList.get(l.id);
    const englishName = meta.lists.find(x => x.letters === l.letters)?.englishName;
    if (englishName && (!englishName.label || /[\u0590-\u05ff]/.test(englishName.label) || !englishName.sourceId || !englishName.note || !['official','transliteration'].includes(englishName.kind))) fail(`${l.letters}: invalid English name provenance`);
    return {
      ...l,
      ...(englishName ? {shortEn: englishName.label, englishName} : {}),
      color: associated.get(l.id) ?? l.color,
      ...(parties ? { parties } : {}),
      candidates: l.candidates.map((c) => (partyOfCandidate.has(c.id) ? { ...c, partyId: partyOfCandidate.get(c.id)! } : c)),
    };
  });

  // ---- bloc schemes
  const schemes: BlocScheme[] = (meta.blocSchemes ?? []).map((s) => {
    if (!KINDS.has(s.kind)) fail(`scheme ${s.id}: kind ${s.kind}`);
    return {
      ...(s.appDefined ? { appDefined: true } : {}), id: s.id, kind: s.kind as BlocScheme['kind'], nameHe: s.nameHe, nameEn: s.nameEn, ...(s.date ? { date: s.date } : {}),
      blocs: s.blocs.map((b) => {
        if (!HEX.test(b.color)) fail(`scheme ${s.id} bloc ${b.id}: colour ${b.color}`);
        const out = { ...(b.appDefined || s.appDefined ? { appDefined: true } : {}), id: b.id, nameHe: b.nameHe, nameEn: b.nameEn, color: b.color.toLowerCase(), lists: [] as string[], parties: [] as string[], candidates: [] as string[] };
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
  lists = distinctColours(ds, lists, schemes.find((s) => s.id === pick?.id),localities);
  // bloc regions: each bloc's pale tint stands apart from the others' and from the neutral No bloc region
  for (const s of schemes) separateBlocColours(s.blocs.map((b) => b.color)).forEach((c, i) => { s.blocs[i].color = c; });
  return { ...ds, lists, ...(schemes.length ? { blocSchemes: schemes, defaultBlocScheme: pick!.id } : {}) };
}

/** Every pair of lists that can share the chamber is told apart by colour (decision 0087, revised 2026-11-04): the
 *  seat-winning lists of the official result (2026 has no official seat table yet: lists above the threshold), with a
 *  stricter difference for lists drawn side by side — in the default grouping's chamber order (blocs left to right,
 *  unassigned lists between their halves) and in the list column (most seats first). Larger lists keep their colour;
 *  a smaller one that clashes moves by the least perceptible amount (src/data/colour.ts). */
function distinctColours<T extends { id: string; votes: number; color: string; parties?: { id: string }[]; candidates: { id: string }[] }>(ds: ElectionDataset, lists: T[], scheme: BlocScheme | undefined,localities?:Pick<LocalityDataset,'listIds'|'rows'>): T[] {
  const thr = Number(ds.ruleSetId.split('-').pop()) / 100;
  const seats = (l: { id: string; votes: number }) => (ds.officialSeats ? ds.officialSeats[l.id] ?? 0 : l.votes >= thr * ds.totals.valid ? 1 : 0);
  const winners = lists.filter((l) => seats(l) > 0);
  const neighbours = new Set<string>();
  const link = (order: string[]) => order.forEach((id, i) => { if (i && order[i - 1] !== id) neighbours.add(`${order[i - 1]} ${id}`); });
  link(winners.map((l) => l.id)); // the dataset's own order (scripts/check-colours.ts)
  link([...winners].sort((a, b) => seats(b) - seats(a) || b.votes - a.votes).map((l) => l.id));
  if (scheme) {
    const blocsOf = (l: T) => scheme.blocs.filter((b) => b.lists.includes(l.id) || (l.parties ?? []).some((p) => b.parties.includes(p.id)) || l.candidates.some((c) => b.candidates.includes(c.id))).map((b) => b.id);
    const order: (string | null)[] = scheme.blocs.map((b) => b.id);
    order.splice(Math.floor(order.length / 2), 0, null);
    link(order.flatMap((bloc) => winners.filter((l) => (bloc === null ? !blocsOf(l).length : blocsOf(l).includes(bloc))).map((l) => l.id)));
  }
  const appColour = new Map(ds.lists.map((l) => [l.id, l.color]));
  // A national seat loser can still win a locality and appear beside the national winners on a map.
  const localityFile=join(META,'..','..','public','data',`${ds.id}-localities.json`);
  const localIds=localities?localityLeaderIds(localities):existsSync(localityFile)?localityLeaderIds(JSON.parse(readFileSync(localityFile,'utf8'))):new Set<string>();
  const extra=lists.filter(l=>localIds.has(l.id)&&!winners.some(w=>w.id===l.id));
  const { colors } = separateColours([...winners].sort((a, b) => b.votes - a.votes).concat(extra.sort((a,b)=>b.votes-a.votes)).map((l) => ({ id: l.id, color: l.color, alternatives: appColour.get(l.id) === l.color ? [] : [appColour.get(l.id)!] })), neighbours);
  return lists.map((l) => (colors.has(l.id) ? { ...l, color: colors.get(l.id)! } : l));
}
