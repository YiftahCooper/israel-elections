// Fail-loud validation shared by every election builder: national result tables, agreement
// membership and exact reproduction of the official seats by the application's own engine.
// Every check throws; CI relies on the build exiting non-zero on any inconsistency.
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';

export type Check = (ok: unknown, message: string) => asserts ok;
/** An assertion that throws `Error("<prefix>: <message>")`. */
export function checker(prefix: string): Check {
  return (ok, message) => { if (!ok) throw new Error(`${prefix}: ${message}`); };
}

export const whole = (n: unknown): n is number => Number.isSafeInteger(n) && (n as number) >= 0;
export const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

export interface NationalRow { letters: string; votes: number; seats: number; nameHe?: string }
export interface NationalTotals { valid: number; invalid?: number; votesCast?: number; registered?: number }
/** Invariants of a complete national result table: unique ballot letters, whole numbers,
 *  list votes summing to the valid total, 120 seats, cast = valid + invalid, turnout ≤ electorate.
 *  Elections whose printed gazette is internally inconsistent check only what holds and document
 *  the exception where they are built. */
export function checkNationalTable(check: Check, id: string, rows: readonly NationalRow[], totals: NationalTotals) {
  check(rows.length > 0 && new Set(rows.map(r => r.letters)).size === rows.length, `${id}: duplicate or empty ballot letters`);
  check(rows.every(r => r.letters && (r.nameHe === undefined || r.nameHe) && whole(r.votes) && whole(r.seats)), `${id}: invalid national row`);
  check(sum(rows.map(r => r.votes)) === totals.valid, `${id}: list votes do not sum to valid`);
  check(sum(rows.map(r => r.seats)) === 120, `${id}: official seats do not sum to 120`);
  if (totals.invalid !== undefined && totals.votesCast !== undefined) check(totals.valid + totals.invalid === totals.votesCast, `${id}: cast ≠ valid + invalid`);
  if (totals.registered !== undefined && totals.votesCast !== undefined) check(whole(totals.registered) && whole(totals.votesCast) && totals.registered >= totals.votesCast, `${id}: turnout exceeds electorate`);
}

/** Surplus-agreement pairs: two members each, no list in two agreements, every member a ballot letter. */
export function checkAgreementPairs(check: Check, id: string, pairs: readonly (readonly string[])[], letters: readonly string[]) {
  const members = pairs.flat();
  check(pairs.every(p => p.length === 2) && new Set(members).size === members.length && members.every(m => letters.includes(m)), `${id}: invalid agreement membership`);
}

export const allocateDataset = (ds: ElectionDataset) => allocate(toEngineInput(scenarioFromDataset(ds)));
export type Allocation = ReturnType<typeof allocateDataset>;

/** Lists whose computed seats differ from the dataset's officialSeats. */
export const seatDifferences = (ds: ElectionDataset, result: Allocation) =>
  result.lists.filter(l => l.seats !== ds.officialSeats![l.id]).map(l => ({ id: l.id, official: ds.officialSeats![l.id], computed: l.seats }));

/** The engine must allocate all 120 seats without warnings (no lottery) and match every official seat. */
export function checkReproducesOfficialSeats(check: Check, ds: ElectionDataset): Allocation {
  const result = allocateDataset(ds);
  check(result.seatsAllocated === 120 && result.warnings.length === 0, `${ds.id}: allocation incomplete or ambiguous`);
  const diff = seatDifferences(ds, result);
  check(diff.length === 0, `${ds.id}: engine does not reproduce official seats (${diff.map(d => `${d.id} ${d.computed}≠${d.official}`).join(', ')})`);
  return result;
}
