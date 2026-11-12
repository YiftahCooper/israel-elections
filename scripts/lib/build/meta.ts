import {localityLeaderIds} from '../../../src/data/locality-leaders.ts';
// Merges the sourced party/bloc/colour research (data/meta/kNN.json, decision 0087) into a dataset:
//  - constituent parties of joint lists (ListRecord.parties) and each candidate's party (Candidate.partyId);
//  - bloc schemes per election (ElectionDataset.blocSchemes, defaultBlocScheme), normalised to ids;
//  - colours: constituent-party colours, and each list's colour from the research for that election (see below),
//    separated from the lists and party seats it shares the chamber with.
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

import {hexToLab,hexToOklch,MIN_LIST_DELTA_E,MIN_NEIGHBOUR_DELTA_E} from '../../../src/data/colour.ts';
import {MAP_UNASSIGNED_COLOUR} from '../../../src/app/locality-map-model.ts';
import {readableSeatColour,separateBlocColours,separateColours} from '../../../src/data/colourGuard.ts';
import {partyDisplayColor} from '../../../src/app/partyDisplayColor.ts';


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
  // list colours (decision 0087 §6): the colour the research records for the list in this election, whatever its
  // confidence (the low ones are the owner's to confirm). A joint list led by a party recorded with that same colour,
  // or with no list colour recorded and led by a party that has one, takes that party's seat colour, so the list and
  // its leading seats agree. Without research, the app's cross-election colour. A colour too dark or too light for a
  // seat fill moves to the nearest readable lightness, keeping its hue. Black, white or grey research (OKLCH chroma
  // under .03) would read as the map's mark for no winner (MAP_UNASSIGNED_COLOUR), so the app's colour is kept for
  // it, as before. Separation follows (distinctColours).
  const usable = (hex: string) => hexToOklch(hex)[1] >= 0.03;
  const listResearch = new Map<string, string>(), partyResearch = new Map<string, string>();
  for (const c of meta.colours ?? []) {
    if (c.letters && usable(c.color)) listResearch.set(listId(c.letters), c.color.toLowerCase());
    if (c.party && usable(c.color)) partyResearch.set(c.party, c.color.toLowerCase());
  }
  const seed = (l: ElectionDataset['lists'][number], parties: { id: string; nameHe: string; nameEn: string; color?: string }[] | undefined) => {
    const own = listResearch.get(l.id), first = l.candidates.find((c) => c.rank === 1), lead = first && partyOfCandidate.get(first.id);
    const leading = lead && parties ? partyResearch.get(lead) : undefined;
    return readableSeatColour(lead && leading && (!own || own === leading) ? partyDisplayColor({ id: l.id, color: l.color, parties: parties! }, lead) : own ?? l.color);
  };
  let lists = ds.lists.map((l) => {
    const parties = partiesByList.get(l.id);
    const englishName = meta.lists.find(x => x.letters === l.letters)?.englishName;
    if (englishName && (!englishName.label || /[\u0590-\u05ff]/.test(englishName.label) || !englishName.sourceId || !englishName.note || !['official','transliteration'].includes(englishName.kind))) fail(`${l.letters}: invalid English name provenance`);
    return {
      ...l,
      ...(englishName ? {shortEn: englishName.label, englishName} : {}),
      color: seed(l, parties),
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
  // the first-government grouping follows the researched support roles (data/meta/aftermath, docs/source-policy.md):
  // a list recorded as outside support, or as abstaining by arrangement, sits in its own group, never in
  // "Opposition"; and such a group holds only lists the research records in that role
  const research = join(META, 'aftermath', `${ds.id}.json`);
  const government = existsSync(research) ? JSON.parse(readFileSync(research, 'utf8')).government as { firstGovernmentSchemeRef?: string; coalition?: { letters?: string; role: string }[] } | undefined : undefined;
  const opening = government && schemes.find((s) => s.id === (government.firstGovernmentSchemeRef ?? 'first-government'));
  if (opening) for (const [role, group] of [['outside-support', 'outside-support'], ['abstained-by-arrangement', 'abstained-by-arrangement']] as const) {
    const recorded = (government!.coalition ?? []).filter((r) => r.role === role && r.letters).map((r) => listId(r.letters!));
    const held = opening.blocs.find((b) => b.id === group)?.lists ?? [];
    for (const id of recorded) if (!held.includes(id)) fail(`scheme ${opening.id}: ${id} is researched as ${role} but not in group ${group}`);
    for (const id of held) if (!recorded.includes(id)) fail(`scheme ${opening.id}: ${id} is in group ${group} without that researched role`);
  }
  // default (decision 0087): the first government formed after this election, else its pre-election blocs,
  // else any other sourced grouping (e.g. an outgoing government, or recommendations to the President)
  const pick = schemes.find((s) => s.id === 'first-government') ?? schemes.find((s) => s.kind === 'pre-election') ?? schemes.find((s) => s.kind === 'government') ?? schemes[0];
  // a list's colour never follows a researched support role: lists in an outside-support or arranged-abstention
  // group are separated in the place they hold without that group (the opposition side), so adding the group
  // recolours no list (party colour stability itself is decided elsewhere; this only keeps bloc data out of it)
  const roleGroups = new Set(['outside-support', 'abstained-by-arrangement']);
  const colourScheme = pick && pick.blocs.some((b) => roleGroups.has(b.id)) ? (() => {
    const rest = pick.blocs.filter((b) => !roleGroups.has(b.id)), moved = pick.blocs.filter((b) => roleGroups.has(b.id));
    const side = rest.find((b) => b.id === 'opposition') ?? rest[rest.length - 1];
    return { ...pick, blocs: rest.map((b) => (b === side ? { ...b, lists: [...b.lists, ...moved.flatMap((m) => m.lists)], parties: [...b.parties, ...moved.flatMap((m) => m.parties)], candidates: [...b.candidates, ...moved.flatMap((m) => m.candidates)] } : b)) };
  })() : pick;
  lists = distinctColours(ds, lists, colourScheme, localities);
  // bloc regions: each bloc's pale tint stands apart from the others' and from the neutral No bloc region
  for (const s of schemes) separateBlocColours(s.blocs.map((b) => b.color)).forEach((c, i) => { s.blocs[i].color = c; });
  return { ...ds, lists, ...(schemes.length ? { blocSchemes: schemes, defaultBlocScheme: pick!.id } : {}) };
}

/** Every pair of lists that can share the chamber is told apart by colour (decision 0087, revised 2026-11-04): the
 *  seat-winning lists of the official result (2026 has no official seat table yet: lists above the threshold), with a
 *  stricter difference for lists drawn side by side — in the default grouping's chamber order (blocs left to right,
 *  unassigned lists between their halves) and in the list column (most seats first). Larger lists keep their colour;
 *  a smaller one that clashes moves by the least perceptible amount (src/data/colour.ts). */
function distinctColours<T extends { id: string; votes: number; color: string; parties?: { id: string; nameHe: string; nameEn: string }[]; candidates: { id: string; partyId?: string; notSeated?: boolean }[] }>(ds: ElectionDataset, lists: T[], scheme: BlocScheme | undefined,localities?:Pick<LocalityDataset,'listIds'|'rows'>): T[] {
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
  // the default chamber draws a joint list's seats in its parties' colours (src/data/partyPalette.ts keeps parties of
  // different lists apart); a list drawn in its own colour also clears the other lists' seated parties, so no two
  // seats of different lists look alike (tests/chamber-seat-colours.test.ts)
  const elected = (l: T) => l.candidates.filter((c) => !c.notSeated).slice(0, ds.officialSeats?.[l.id] ?? 0);
  const ownParty = (l: T, c: { partyId?: string }) => (l.parties?.length ?? 0) > 1 && !!c.partyId && l.parties!.some((p) => p.id === c.partyId);
  const partySeats = new Map(winners.map((l) => [l.id, [...new Set(elected(l).filter((c) => ownParty(l, c)).map((c) => c.partyId!))].map((p) => partyDisplayColor(l, p))]));
  const drawnAsList = (l: T) => elected(l).some((c) => !ownParty(l, c));
  // and every list on the map stays apart from its mark for no winner (tests/colour-sweep.test.ts)
  const obstacles = (id: string) => [{ color: MAP_UNASSIGNED_COLOUR, min: MIN_NEIGHBOUR_DELTA_E }, ...(drawnAsList(lists.find((l) => l.id === id)!) ? winners.filter((o) => o.id !== id).flatMap((o) => (partySeats.get(o.id) ?? []).map((color) => ({ color, min: MIN_LIST_DELTA_E }))) : [])];
  const { colors } = separateColours([...winners].sort((a, b) => b.votes - a.votes).concat(extra.sort((a,b)=>b.votes-a.votes)).map((l) => ({ id: l.id, color: l.color, alternatives: appColour.get(l.id) === l.color ? [] : [appColour.get(l.id)!] })), neighbours, undefined, undefined, obstacles);
  return lists.map((l) => (colors.has(l.id) ? { ...l, color: colors.get(l.id)! } : l));
}
