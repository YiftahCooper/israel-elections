// Who took each seat at the Knesset's first sitting. The results notice declares who the count elected; a candidate it
// declared elected who did not sit at the opening (withdrew, resigned from the list, declined) is "not seated", and the seat
// passes down the list, as the 1999 notice already records for Aryeh Deri and Benny Begin. One rule for every election,
// from records already in the repository:
//  - the opening membership: data/research/knesset-member-changes/kN.json (Knesset OData, a term starting by the opening);
//  - who each candidate is: data/meta/bios/kN.json (a certain Knesset identity only, scripts/lib/build/bios.ts).
// A candidate the count elected is not seated when their certain identity has no term at the opening, or, with no
// identity on record (never an MK), when they are the only unconfirmed name left in the seats and a candidate below the
// seats sat at the opening on this list. Nothing is guessed: an ambiguous list fails the build, and every candidate this
// marks must carry an official note saying why (data/meta/candidate-notes.json, or the list's own note).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { knessetMemberSure } from './bios.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
type Tenure = { personId: number; start: string };
type Bio = { knessetPersonId?: number | null; confidence?: string; basis?: string };

/** A seat change found by the opening membership: the candidates the count elected who did not sit, and those below
 *  the seats who sat in their place. */
export interface SeatTakers { listId: string; seats: number; notSeated: string[]; tookSeat: string[] }

export function seatTakers(ds: Pick<ElectionDataset, 'id' | 'lists' | 'officialSeats'>, root = ROOT): SeatTakers[] {
  const changesFile = join(root, 'data', 'research', 'knesset-member-changes', `${ds.id}.json`);
  const biosFile = join(root, 'data', 'meta', 'bios', `${ds.id}.json`);
  if (!existsSync(changesFile) || !existsSync(biosFile)) return [];
  const ch = JSON.parse(readFileSync(changesFile, 'utf8')) as { tenures: Tenure[]; checks: { openingDateReported?: string | null } };
  const opening = ch.checks.openingDateReported;
  // before the Knesset opens no one has a term in it: the count stands
  if (!opening || !ch.tenures.length) return [];
  const atOpening = new Set(ch.tenures.filter((t) => t.start <= opening).map((t) => t.personId));
  const bios = (JSON.parse(readFileSync(biosFile, 'utf8')) as { candidates: Record<string, Bio> }).candidates;
  const person = (id: string) => { const b = bios[id]; return b?.knessetPersonId && knessetMemberSure(b) ? b.knessetPersonId : null; };
  const out: SeatTakers[] = [];
  for (const l of ds.lists) {
    const seats = ds.officialSeats?.[l.id] ?? 0;
    if (!seats || l.withdrawn) continue;
    const skipped = new Set(l.candidates.filter((c) => c.notSeated).map((c) => c.id));
    const inSeats = () => l.candidates.filter((c) => !skipped.has(c.id)).slice(0, seats);
    const before = new Set(inSeats().map((c) => c.id));
    const marked: string[] = [];
    // each pass hands the seat to the next on the list, who may in turn not have sat (2026 Shas: Nos. 1 and 6, then 7)
    for (let guard = 0; guard <= l.candidates.length; guard++) {
      const seated = inSeats();
      const ids = new Set(seated.map((c) => c.id));
      const gone = seated.filter((c) => { const p = person(c.id); return p !== null && !atOpening.has(p); });
      const below = l.candidates.filter((c) => !ids.has(c.id) && !skipped.has(c.id) && (() => { const p = person(c.id); return p !== null && atOpening.has(p); })());
      if (gone.length) { for (const c of gone) { skipped.add(c.id); marked.push(c.id); } continue; }
      if (!below.length) break;
      // someone below the seats sat at the opening on this list: the seat is one of those still unconfirmed
      const unknown = seated.filter((c) => person(c.id) === null);
      if (unknown.length !== below.length) throw new Error(`${l.id}: ${below.map((c) => c.id).join(', ')} sat at the opening below the seats, but ${unknown.length} elected candidates have no Knesset identity (${unknown.map((c) => c.id).join(', ') || 'none'}): cannot tell who did not sit`);
      for (const c of unknown) { skipped.add(c.id); marked.push(c.id); }
    }
    if (!marked.length) continue;
    const after = inSeats().map((c) => c.id);
    out.push({ listId: l.id, seats, notSeated: marked, tookSeat: after.filter((id) => !before.has(id)) });
  }
  return out;
}

/** Marks the candidates the count elected who did not take their seat at the Knesset's first sitting (see above). */
export function applySeatTakers(ds: ElectionDataset): ElectionDataset {
  const found = seatTakers(ds);
  if (!found.length) return ds;
  const marked = new Set(found.flatMap((f) => f.notSeated));
  return { ...ds, lists: ds.lists.map((l) => {
    if (!l.candidates.some((c) => marked.has(c.id))) return l;
    return { ...l, candidates: l.candidates.map((c) => {
      if (!marked.has(c.id)) return c;
      // the official record of why must be on the screen with the mark
      const why = c.notes?.length || l.notesHe?.some((t) => t.includes(c.nameHe) || t.includes(`(מקום ${c.rank})`));
      if (!why) throw new Error(`${c.id} ${c.nameHe}: elected by the count but not at the Knesset's opening, and no note says why (data/meta/candidate-notes.json)`);
      return { ...c, notSeated: true as const };
    }) };
  }) };
}
