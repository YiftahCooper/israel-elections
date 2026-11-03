// Construction of dataset records shared by every election: list records with the app's
// presentation metadata, agreement records and the seat-diagram order.
import type { AgreementRecord, ListRecord } from '../../../src/data/schema.ts';
import { META, neutralColor } from '../list-meta.ts';

export interface ListFields {
  letters: string; nameHe: string; votes: number;
  /** Short Hebrew name when list-meta.ts has none (defaults to nameHe). */
  fallbackShortHe?: string;
  sponsorsHe?: string; partiesHe?: string[] | null; withdrawn?: boolean;
  candidates?: ListRecord['candidates']; candidatesSource?: string; candidatesSecondary?: boolean;
  notesHe?: string[];
  candidatesUnavailable?: boolean; candidatesTruncated?: boolean;
}

/** Serialized key order of a list record. Eras differ only in where they place keys; the order has
 *  no meaning but is kept so rebuilt files stay byte-identical. Roster flags are emitted only when
 *  set in the fields (see roster.ts for each era's convention). */
export const LIST_KEYS = ['id', 'letters', 'nameHe', 'shortHe', 'shortEn', 'sponsorsHe', 'partiesHe', 'votes', 'withdrawn', 'color', 'bloc',
  'candidates', 'candidatesSource', 'candidatesSecondary', 'notesHe', 'candidatesUnavailable', 'candidatesTruncated'] as const;

/** A list record for Knesset `n`, list index `index` (for the neutral fallback colour). Short names,
 *  colours and blocs come from list-meta.ts (app-assigned, not official data). */
export function listRecord(n: number, index: number, f: ListFields, keys: readonly string[] = LIST_KEYS): ListRecord {
  const id = `${n}-${f.letters}`;
  const m = META[id];
  const all: Record<string, unknown> = {
    id, letters: f.letters, nameHe: f.nameHe, shortHe: m?.he ?? f.fallbackShortHe ?? f.nameHe, shortEn: m?.en ?? null,
    sponsorsHe: f.sponsorsHe ?? '', partiesHe: f.partiesHe ?? null, votes: f.votes, withdrawn: f.withdrawn ?? false,
    color: m?.color ?? neutralColor(index), bloc: m?.bloc ?? null,
    candidates: f.candidates ?? [], candidatesSource: f.candidatesSource ?? '', candidatesSecondary: f.candidatesSecondary ?? false,
    notesHe: f.notesHe ?? [], candidatesUnavailable: f.candidatesUnavailable, candidatesTruncated: f.candidatesTruncated,
  };
  return inKeyOrder(all, keys) as unknown as ListRecord;
}

/** Copies `obj` with its keys in `keys` order, dropping undefined values. Fails if `obj` has a
 *  defined key that `keys` does not place, so a new field can never be silently lost. */
export function inKeyOrder(obj: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  const extra = Object.keys(obj).filter(k => obj[k] !== undefined && !keys.includes(k));
  if (extra.length) throw new Error(`records: no serialization position for ${extra.join(', ')}`);
  const out: Record<string, unknown> = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

export const agreementRecords = (n: number, pairs: readonly (readonly [string, string])[], sourceId: string): AgreementRecord[] =>
  pairs.map(([a, b], i) => ({ id: `${n}-agr-${i + 1}`, members: [`${n}-${a}`, `${n}-${b}`], sourceId }));

export const officialSeatsOf = (n: number, rows: readonly { letters: string; seats: number }[]) =>
  Object.fromEntries(rows.map(r => [`${n}-${r.letters}`, r.seats]));

/** Seat-diagram order: app-defined order (validated colour adjacency), then by votes. */
export const seatOrder = <T extends { id: string; votes: number }>(lists: readonly T[]) =>
  [...lists].sort((a, b) => (META[a.id]?.order ?? 999) - (META[b.id]?.order ?? 999) || b.votes - a.votes);
