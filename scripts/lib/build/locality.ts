// Locality and polling-station rows: reading official tables, row arithmetic, aggregation of
// polling stations into localities, reconciliation against locality and national totals, and the
// published locality dataset. Era-specific codes and column spellings are passed in by the caller.
import { readFileSync } from 'node:fs';
import type { ListRecord, LocalityDataset } from '../../../src/data/schema.ts';
import { DATASET_SCHEMA_VERSION } from '../../../src/data/schema.ts';
import { sum, whole, type Check } from './validate.ts';

/** One locality or polling-station row; `votes` follows the caller's ballot-letter order. */
export interface VoteRow { code: number; nameHe: string; committee: number; registered: number; votesCast: number; invalid: number; valid: number; votes: number[] }
export const TOTAL_FIELDS = ['registered', 'votesCast', 'invalid', 'valid'] as const;

export const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();

export interface ReadRowsOptions {
  /** Datastore column holding a ballot letter's votes (default: the letter itself). */
  column?: (letter: string) => string;
  /** Electorate column (default 'בזב'). */
  registered?: string;
  /** 'column' reads סמל ועדה; 'optional' reads it when present, else 0; 'zero' always 0. */
  committee?: 'column' | 'optional' | 'zero';
  /** Locality name normalisation (default: collapse whitespace). */
  name?: (raw: string) => string;
  /** Columns retained in the source (withdrawn lists) that must hold 0 in every row. */
  zeroColumns?: readonly string[];
}
/** Reads a CKAN datastore dump (`{ fields, records }`). Every numeric field must be a nonnegative
 *  safe integer and every row must reconcile: list votes = valid, valid + invalid = cast. */
export function readDatastoreRows(path: string, letters: readonly string[], check: Check, o: ReadRowsOptions = {}): VoteRow[] {
  const { records } = JSON.parse(readFileSync(path, 'utf8')) as { records: Record<string, unknown>[] };
  check(records.length > 0, `${path}: no rows`);
  const column = o.column ?? ((l: string) => l);
  const name = o.name ?? collapse;
  return records.map((r, i) => {
    const num = (key: string) => { const v = Number(r[key]); check(r[key] !== null && r[key] !== undefined && whole(v), `${path} row ${i}: invalid ${key}`); return v; };
    const committee = o.committee === 'zero' || (o.committee === 'optional' && r['סמל ועדה'] === undefined) ? 0 : num('סמל ועדה');
    const row: VoteRow = { code: num('סמל ישוב'), nameHe: name(String(r['שם ישוב'])), committee, registered: num(o.registered ?? 'בזב'),
      votesCast: num('מצביעים'), invalid: num('פסולים'), valid: num('כשרים'), votes: letters.map(l => num(column(l))) };
    checkRowArithmetic(check, `${path} row ${i} (${row.code})`, row);
    for (const k of o.zeroColumns ?? []) check(num(k) === 0, `${path}: withdrawn ${k} has votes`);
    return row;
  });
}

/** Reads a CEC results CSV (k26 expc/expb). Same columns and checks as the datastore reader. */
export function readCsvRows(path: string, letters: readonly string[], check: Check): VoteRow[] {
  const lines = readFileSync(path, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  const head = lines[0].split(',').map(h => h.trim());
  const ix = (k: string) => { const i = head.indexOf(k); check(i >= 0, `${path}: missing column ${k}`); return i; };
  return lines.slice(1).map((l, n) => {
    const c = l.split(',');
    const num = (k: string) => { const s = c[ix(k)]; const v = Number(s); check(s !== undefined && s.trim() !== '' && whole(v), `${path} row ${n}: invalid ${k}`); return v; };
    const row: VoteRow = { code: num('סמל ישוב'), nameHe: c[ix('שם ישוב')].trim(), committee: num('סמל ועדה'), registered: num('בזב'),
      votesCast: num('מצביעים'), invalid: num('פסולים'), valid: num('כשרים'), votes: letters.map(num) };
    checkRowArithmetic(check, `${path} row ${n} (${row.code})`, row);
    return row;
  });
}

export function checkRowArithmetic(check: Check, label: string, r: Pick<VoteRow, 'votesCast' | 'invalid' | 'valid' | 'votes'>) {
  check(sum(r.votes) === r.valid, `${label}: list votes ${sum(r.votes)} ≠ valid ${r.valid}`);
  check(r.valid + r.invalid === r.votesCast, `${label}: valid + invalid ≠ cast`);
}

export interface RowTotals { registered: number; votesCast: number; invalid: number; valid: number; votes: number[] }
export function sumRows(rows: readonly Omit<VoteRow, 'code' | 'nameHe' | 'committee'>[], width: number): RowTotals {
  const t: RowTotals = { registered: 0, votesCast: 0, invalid: 0, valid: 0, votes: Array(width).fill(0) };
  for (const r of rows) {
    for (const k of TOTAL_FIELDS) t[k] += r[k];
    r.votes.forEach((v, i) => t.votes[i] += v);
  }
  return t;
}

/** Sums rows sharing a locality code, in first-seen order; name and committee come from the first row. */
export function aggregateByCode<R extends VoteRow>(rows: readonly R[]): R[] {
  const out = new Map<number, R>();
  for (const r of rows) {
    const t = out.get(r.code);
    if (!t) { out.set(r.code, { ...r, votes: [...r.votes] }); continue; }
    for (const k of TOTAL_FIELDS) t[k] += r[k];
    r.votes.forEach((v, i) => t.votes[i] += v);
  }
  return [...out.values()];
}

/** Every locality row must equal the sum of its polling stations (ballot totals and votes per list),
 *  and every polling station must belong to a locality row. Registered voters are not compared:
 *  envelope stations carry none. */
export function checkLocalitiesMatchPolling(check: Check, id: string, localities: readonly VoteRow[], polling: readonly VoteRow[]) {
  const byCode = new Map(aggregateByCode(polling).map(r => [r.code, r]));
  check(new Set(localities.map(r => r.code)).size === localities.length, `${id}: duplicate locality code`);
  for (const r of localities) {
    const b = byCode.get(r.code);
    check(b, `${id}: locality ${r.code} (${r.nameHe}) has no polling stations`);
    check(b.votesCast === r.votesCast && b.invalid === r.invalid && b.valid === r.valid, `${id}: locality ${r.code} (${r.nameHe}) totals differ from its polling stations`);
    r.votes.forEach((v, i) => check(b.votes[i] === v, `${id}: locality ${r.code} (${r.nameHe}), list #${i + 1}: ${v} ≠ polling stations ${b.votes[i]}`));
  }
  check(byCode.size === localities.length, `${id}: polling stations cover localities without a locality row`);
}

/** Row sums must equal the national figures for the given total fields and every list. */
export function checkRowsMatchNational(check: Check, label: string, rows: readonly VoteRow[], national: Partial<Record<typeof TOTAL_FIELDS[number], number>> & { lists: readonly { letters: string; votes: number }[] }, fields: readonly (typeof TOTAL_FIELDS[number])[]) {
  const t = sumRows(rows, national.lists.length);
  for (const k of fields) check(t[k] === national[k], `${label}: ${k} ${t[k]} differs from national total ${national[k]}`);
  national.lists.forEach((l, i) => check(t.votes[i] === l.votes, `${label}: ${l.letters} ${t.votes[i]} differs from national result ${l.votes}`));
  return t;
}

/** Locality count and envelope votes for dataset totals. Envelope (double/external envelope) rows
 *  are not localities; their code differs by era (9999 from k20; 0/875 or a name earlier). */
export function geographyTotals<R extends { code: number | null; votesCast: number }>(rows: readonly R[], isEnvelope: (r: R) => boolean = r => r.code === 9999) {
  return { localities: rows.filter(r => !isEnvelope(r)).length, envelopeVotes: rows.find(isEnvelope)?.votesCast };
}

/** The published locality dataset: one row per locality with votes in the lists' (ballot) order. */
export function localityDataset(id: LocalityDataset['id'], rows: readonly VoteRow[], lists: readonly Pick<ListRecord, 'id'>[]): LocalityDataset {
  return { schemaVersion: DATASET_SCHEMA_VERSION, id, listIds: lists.map(l => l.id), rows: rows as VoteRow[] };
}
