/** Which of a member's Knesset faction records the app shows, and in what order (the MK history and the seat cards).
 *  The records come from the Knesset database (data/research/knesset-member-changes/kN.json); they stay there as they
 *  are. Three rules, each from the audit of 12 Nov 2026 (.backup-scratch/audit-1112/cx-factions):
 *  - A record that starts and ends at the same midnight lasts no time at all. It is not evidence that the member
 *    belonged to that faction, so it is not shown: no faction, no change of faction, no bar (Bennett, 15 Aug 2022).
 *    A record with times of day lasts that long and is shown (Yasinov, 1 Feb 2006, 10:01–10:59).
 *  - Records starting on one day are in time order, and a record that continues past that day comes after those that
 *    end on it, so the path ends in the faction that continues.
 *  - A faction is shown only while the member sat in the Knesset: a record that starts before the member's own term
 *    or ends after it is cut to the term (Baruchi: faction from 1 Jul 2025, term from 2 Jul 2025). */
export interface FactionRow { factionId: number; start: string; end: string | null; startTime?: string; endTime?: string }

/** Lasts no time: same start and end, no times of day. */
export const zeroLength = (f: FactionRow) => f.end !== null && f.end === f.start && !f.startTime && !f.endTime;

/** Same-day records before the one that continues, each day in time order. */
export const rowOrder = (a: FactionRow, b: FactionRow) => {
  const ends = (f: FactionRow) => f.end !== null && f.end <= f.start ? 0 : 1;
  return a.start.localeCompare(b.start) || ends(a) - ends(b) || (a.startTime ?? '').localeCompare(b.startTime ?? '');
};

/** The records shown for one term, cut to the term and in order. */
export function shownRows<T extends FactionRow>(rows: readonly T[], term: { start: string; end: string | null }): T[] {
  return rows.filter((f) => !zeroLength(f)).map((f) => ({
    ...f,
    start: f.start < term.start ? term.start : f.start,
    end: term.end !== null && (f.end === null || f.end > term.end) ? term.end : f.end,
  })).sort(rowOrder);
}
