// While comparing, each list's line and bar in the Lists panel: what it stood at in the reference (compare/listRows.ts).
// Figures are the official results (public/data): Likud 32 seats in 2022 and 27 in 2026.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { applyAction } from '../src/model/actions.ts';
import { allocationOf, baselineOf } from '../src/app/derive.ts';
import { refRows } from '../src/app/compare/listRows.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const k26 = baselineOf(load('k26')), k25 = baselineOf(load('k25'));
const id = (s: typeof k26, en: string) => s.lists.find((l) => l.shortEn === en)!.id;
const seats = (s: typeof k26, en: string) => allocationOf(s).lists.find((l) => l.id === id(s, en))!.seats;

describe('the Lists panel while comparing 2026 with 2022', () => {
  const rows = refRows(k26, k25, [], true, '2022', 'en');
  const line = (en: string) => rows.byList.get(id(k26, en))!;
  it('gives each list its 2022 seats, the name it ran under and what happened', () => {
    expect(seats(k25, 'Likud')).toBe(32);
    expect(seats(k26, 'Likud')).toBe(27);
    expect(line('Likud')).toMatchObject({ kind: 'pair', seats: 32, names: 'Likud', how: '', bar: true });
    expect(line('Together (Bennett)')).toMatchObject({ seats: seats(k25, 'Yesh Atid'), names: 'Yesh Atid', how: '(joined)', bar: true });
    expect(line('Joint List')).toMatchObject({ names: "Hadash–Ta'al + Balad", how: '(ran separately)' });
    expect(line('The Democrats')).toMatchObject({ names: 'Labor + Meretz', how: '(ran separately)', seats: seats(k25, 'Labor') + seats(k25, 'Meretz') });
  });
  it('names a party that ran inside another 2022 list, without counting it', () => {
    expect(line('Likud').notCounted).toEqual(['New Hope not counted: it ran inside National Unity in 2022.']);
  });
  it('counts a split list against all of its successors, with no bar of its own', () => {
    const rz = line('Otzma Yehudit');
    expect(rz).toMatchObject({ seats: seats(k25, 'Religious Zionism'), names: 'Religious Zionism', how: '(split into 3)', bar: false });
    expect(rz.together).toHaveLength(3);
  });
  it('says a new list had no list of its own, and folds 2022 lists with no list now', () => {
    expect(line('Yashar!')).toMatchObject({ kind: 'new', bar: false });
    expect(rows.only.map((x) => x.name)).toContain('The Jewish Home');
    expect(rows.only.find((x) => x.name === 'The Jewish Home')!.votes).toBe(k25.lists.find((l) => l.shortEn === 'The Jewish Home')!.votes);
    // the bars share one scale with the largest reference seat count drawn
    expect(rows.maxSeats).toBe(32);
  });
  it('writes the Hebrew line in Hebrew', () => {
    const he = refRows(k26, k25, [], true, '2022', 'he');
    expect(he.byList.get(id(k26, 'Together (Bennett)'))!.how).toBe('(הצטרפה)');
    expect(he.byList.get(id(k26, 'Likud'))!.notCounted[0]).toMatch(/לא נספרה/);
  });
});

describe('other references', () => {
  it('a later election as the reference (after Swap): 2022 lists against 2026', () => {
    const rows = refRows(k25, k26, [], false, '2026', 'en');
    expect(rows.byList.get(id(k25, 'Likud'))).toMatchObject({ seats: 27, names: 'Likud', bar: true });
    expect(rows.byList.get(id(k25, 'Yesh Atid'))).toMatchObject({ names: 'Together (Bennett)', how: '(joined)' });
  });
  it('a later reference says what happened next in its own words: lists that ran together later did not split', () => {
    const en = refRows(k25, k26, [], false, '2026', 'en'), he = refRows(k25, k26, [], false, '2026', 'he');
    expect(en.byList.get(id(k25, 'Labor'))).toMatchObject({ names: 'The Democrats', how: '(ran jointly)', bar: false });
    expect(en.byList.get(id(k25, 'Meretz'))).toMatchObject({ names: 'The Democrats', how: '(ran jointly)' });
    expect(en.byList.get(id(k25, "Hadash–Ta'al"))).toMatchObject({ names: 'Joint List', how: '(ran jointly)' });
    expect(he.byList.get(id(k25, 'Labor'))!.how).toBe('(רצו יחד)');
    // the real split is still a split, counted against all of its successors
    expect(en.byList.get(id(k25, 'Religious Zionism'))).toMatchObject({ how: '(split into 3)', seats: seats(k26, 'Religious Zionism–Zehut') + seats(k26, 'Otzma Yehudit') + seats(k26, 'Noam') });
    expect(he.byList.get(id(k25, 'Religious Zionism'))!.how).toBe('(התפצלה ל־3)');
  });
  it('a later reference after a recorded merger: the General Zionists 1959 merged into the Liberal Party 1961', () => {
    const k4 = baselineOf(load('k4')), k5 = baselineOf(load('k5'));
    const en = refRows(k4, k5, [], false, '1961', 'en'), he = refRows(k4, k5, [], false, '1961', 'he');
    const gz = k4.lists.find((l) => l.shortEn === 'General Zionists')!.id;
    expect(en.byList.get(gz)).toMatchObject({ names: 'Liberal Party', how: '(merged)' });
    expect(he.byList.get(gz)!.how).toBe('(התאחדו)');
  });
  it('within one election, a list keeps its plain line and the name only when it differs', () => {
    const edited = applyAction(k26, { type: 'setVotes', listId: id(k26, 'Likud'), votes: 1_300_000 }, undefined, { base: k26 });
    const rows = refRows(edited, k26, [], true, 'Official result', 'en');
    expect(rows.byList.get(id(k26, 'Likud'))).toMatchObject({ kind: 'pair', seats: 27, names: '', how: '', bar: true });
    expect(rows.only).toEqual([]);
  });
});
