// Find an MK over the seat chart: what a typed name matches.
import { expect, test } from 'vitest';
import { findMks, foldName, foundSeat, type MkEntry } from '../src/app/components/FindMk.tsx';

const entries: MkEntry[] = [
  { seat: 3, names: ['דני דנון', 'Danny Danon'], label: 'Danny Danon · Likud #15' },
  { seat: 7, names: ['אלי כהן', 'Eli Cohen'], label: 'Eli Cohen · Likud #3' },
  { seat: 9, names: ['מאיר כהן', 'Meir Cohen'], label: 'Meir Cohen · Yesh Atid #3' },
  { seat: 11, names: ['אוריה ג׳ונסון', "Oriya Jo'hnson"], label: 'x' },
];

test('a surname, in Hebrew or English, in any case, finds the member', () => {
  expect(findMks(entries, 'danon').map((e) => e.seat)).toEqual([3]);
  expect(findMks(entries, 'דנון').map((e) => e.seat)).toEqual([3]);
  expect(findMks(entries, '  DAN ').map((e) => e.seat)).toEqual([3]);
});
test('every word typed must start one of the name\'s words', () => {
  expect(findMks(entries, 'cohen').map((e) => e.seat)).toEqual([7, 9]);
  expect(findMks(entries, 'meir coh').map((e) => e.seat)).toEqual([9]);
  expect(findMks(entries, 'ohen')).toEqual([]);
  expect(findMks(entries, '')).toEqual([]);
});
test('quotes, geresh and niqqud do not get in the way', () => {
  expect(foldName('ג׳ונסון')).toBe('ג ונסון');
  expect(findMks(entries, 'ג׳ונ').map((e) => e.seat)).toEqual([11]);
  expect(findMks(entries, 'דָּנִי').map((e) => e.seat)).toEqual([3]);
});
test('one match is found at once; among several, only the one chosen', () => {
  expect(foundSeat(entries, 'danon', null)).toBe(3);
  expect(foundSeat(entries, 'cohen', null)).toBe(null);
  expect(foundSeat(entries, 'cohen', 9)).toBe(9);
  expect(foundSeat(entries, 'cohen', 3)).toBe(null);
});

// Review V3 F2 (19 Nov 2026): everyone who entered after election day was "No MK by that name in this Knesset". The
// search now also holds those who entered after the first sitting, from the Knesset's membership records.
import { readFileSync } from 'node:fs';
import { compileMkHistory, type MkReview } from '../scripts/mk-history-runtime.ts';
import { laterMembers } from '../src/app/components/FindMk.tsx';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';

test('everyone who sat in that Knesset is found: those who entered later too, with the day they entered', () => {
  const rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview);
  const seatedIds = (k: number) => { const ds = JSON.parse(readFileSync(`public/data/k${k}.json`, 'utf8')); const s = scenarioFromDataset(ds); return s.lists.flatMap((l) => electedOf(l, ds.officialSeats[l.id] ?? 0).map((c) => c.id)); };
  const find = (k: number, q: string) => findMks([...laterMembers(rt, k, seatedIds(k), 'en')], q);
  // the reviewer's cases: Orna Starkmann (24th), Tehila Friedman (23rd), Tzvi Sukkot, Roni Malkai, Akram Hasson (25th),
  // Haim Ramon (10th, 1983), Ari Ankorion (5th)
  for (const [k, q] of [[24, 'Starkmann'], [23, 'Tehila'], [25, 'Sukkot'], [25, 'Malkai'], [25, 'Hasson'], [10, 'Ramon'], [5, 'Ankorion']] as const) {
    const m = find(k, q);
    expect(m.length, `k${k} ${q}`).toBeGreaterThanOrEqual(1);
    expect(m[0].later!.from > rt.elections[k].opening!, `k${k} ${q}`).toBe(true);
    expect(m[0].seat, 'never rings a seat').toBeLessThan(0);
  }
  expect(find(24, 'Starkmann')[0].label).toMatch(/· from 13 Sept? 2022$/);
  // in Hebrew too, by the Knesset's own name
  expect(findMks(laterMembers(rt, 24, seatedIds(24), 'he'), 'שטרקמן').length).toBe(1);
  // someone on the chart is not listed twice: Idit Silman sat from the first sitting (2021)
  expect(find(24, 'Silman')).toEqual([]);
  // the Knesset's records count: every term that began after the opening is findable (all 25 Knessets)
  for (let k = 1; k <= 25; k++) {
    const later = laterMembers(rt, k, seatedIds(k), 'en');
    const ids = new Set(later.map((e) => e.later!.personId));
    const ch = JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')) as { tenures: { personId: number; start: string }[]; checks: { openingDateReported: string } };
    const atOpening = new Set(ch.tenures.filter((t) => t.start <= ch.checks.openingDateReported).map((t) => t.personId));
    for (const t of ch.tenures) if (t.start > ch.checks.openingDateReported && !atOpening.has(t.personId)) expect(ids.has(t.personId), `k${k} person ${t.personId}`).toBe(true);
  }
});
