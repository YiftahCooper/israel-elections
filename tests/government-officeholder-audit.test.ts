import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const evidence = read('data/meta/government-support-evidence.json');
const member = (r: any) => ['member-with-ministries', 'member-without-ministries'].includes(r.role);

// This detects contradictory records, not an alleged legal prohibition: Basic Law section 25(a)
// does not require a deputy minister's whole faction to enter the coalition.
function officeholderStatus(rows: any[], personId: number, appointmentId: number, appointments: any[] = []) {
  const matches = rows.filter(r => (r.cites ?? []).some((c: any) =>
    new RegExp(`PersonToPositionID[\\s":]*${appointmentId}(?!\\d)`).test(c.quote ?? '')));
  const independent = rows.find(r => r.personId === personId && r.countedInFactionSeats === false && member(r));
  if (independent) return 'individual-member';
  if (!matches.length) {
    const appointment = appointments.find(a => a.PersonToPositionID === appointmentId);
    const factions = new Set((appointment?.factions ?? []).map((f: any) => f.FactionName.trim()));
    for (const sample of appointments) {
      if (!(sample.factions ?? []).some((f: any) => factions.has(f.FactionName.trim()))) continue;
      for (const row of rows) if ((row.cites ?? []).some((c: any) =>
        new RegExp(`PersonToPositionID[\\s":]*${sample.PersonToPositionID}(?!\\d)`).test(c.quote ?? ''))) matches.push(row);
    }
  }
  if (!matches.length) return 'unassessed';
  if (matches.some(r => !member(r))) return 'review';
  return 'member-evidence';
}

it('flags a minister recorded with a nonmember role; accepts an explicit independent membership', () => {
  const row = { role: 'other', cites: [{ quote: 'PersonToPositionID 12; PersonID 7' }] };
  expect(officeholderStatus([row], 7, 12)).toBe('review');
  expect(officeholderStatus([row, { personId: 7, countedInFactionSeats: false, role: 'member-with-ministries' }], 7, 12)).toBe('individual-member');
  expect(officeholderStatus([], 7, 12)).toBe('unassessed');
});

it('checks initial appointment evidence for all 37 governments without certifying uncovered rows', () => {
  const snapshots = Array.from({ length: 26 }, (_, i) => read(`data/meta/aftermath/k${i + 1}.json`).government)
    .filter(Boolean).flatMap(g => [g, ...(g.changes ?? []).filter((c: any) => c.number && c.coalition)]);
  const numbers = new Set(snapshots.map(g => g.number));
  expect([...numbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 37 }, (_, i) => i + 1));
  const flags: string[] = [];
  let inspected = 0;
  for (const [num, record] of Object.entries(evidence.governments) as [string, any][]) {
    const snapshot = snapshots.find(g => g.number === Number(num));
    expect(snapshot, `government ${num}`).toBeDefined();
    for (const r of record.rows) {
      inspected++;
      if (officeholderStatus([...snapshot.coalition, ...(snapshot.individuals ?? [])], r.PersonID, r.PersonToPositionID, record.rows) === 'review') {
        flags.push(`${num}/${r.PersonToPositionID}`);
      }
    }
  }
  expect(inspected).toBeGreaterThan(500);
  expect(flags).toEqual([]);
});

it('keeps the documented Eichler appointment visible without fabricating faction-wide re-entry', () => {
  const events = read('data/research/knesset-events/k25.json').events;
  const appointment = events.find((e: any) => e.id === 'k25-eichler-appointed');
  expect(appointment.date).toBe('2026-01-19');
  expect(appointment.who.personIds).toEqual([1057]);
  expect(appointment.seatsAfter).toBeNull();
  expect(appointment.sources.some((s: any) => s.type === 'official')).toBe(true);
});
