import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset, ElectionIndexEntry } from '../src/data/schema.ts';
import { baselineOf } from '../src/app/derive.ts';
import { applyAction } from '../src/model/actions.ts';
import { copyUnit, matchRows, mirrorRows, sharedCandidates, type MatchRow } from '../src/app/compare/match.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const elections: ElectionIndexEntry[] = JSON.parse(readFileSync('public/data/elections.json', 'utf8'));
const k25 = baselineOf(load('k25')), k26 = baselineOf(load('k26'));
const rowOf = (rows: MatchRow[], side: 'left' | 'right', id: string) => rows.find((r) => r[side].includes(id));

describe('matching k25 → k26 from party records only', () => {
  const rows = matchRows(k25, k26);
  it.each([
    ['25-מחל', '26-מחל'], ['25-שס', '26-שס'], ['25-ג', '26-ג'], ['25-ל', '26-ל'], ['25-עם', '26-עם'],
  ])('pairs %s with %s as the same list', (l, r) => {
    const row = rowOf(rows, 'left', l)!;
    expect(row.right).toEqual([r]);
    expect(row.tag).toBe('same');
    expect(row.reason.kind).toBe('leading-party');
  });
  it('notes that Likud now runs with New Hope, and that New Hope left National Unity', () => {
    expect(rowOf(rows, 'left', '25-מחל')!.notes).toEqual([{ side: 'right', kind: 'with', partyIds: ['new-hope'] }]);
    expect(rowOf(rows, 'left', '25-כן')!.notes).toEqual([{ side: 'left', kind: 'moved', partyIds: ['new-hope'], listId: '26-מחל' }]);
  });
  it('Hadash–Ta’al and Balad ran jointly as the Joint List (no recorded merger)', () => {
    const row = rowOf(rows, 'right', '26-ודם')!;
    expect(row.tag).toBe('ran-jointly');
    expect(new Set(row.left)).toEqual(new Set(['25-ום', '25-ד']));
  });
  it('groups Religious Zionism’s successors as one split, copied only as a group', () => {
    const g = rows.filter((r) => r.group === 'split:25-ט');
    expect(g.map((r) => r.right[0]).sort()).toEqual(['26-ב', '26-ט', '26-ני'].sort());
    expect(g.filter((r) => r.left.length)).toHaveLength(1); // the left numbers sit on one row only
    expect(g.filter((r) => r.inLeft === '25-ט')).toHaveLength(2);
    for (const r of g) expect(copyUnit(r, rows, 'toRight')).toEqual({ src: ['25-ט'], dst: expect.arrayContaining(['26-ט', '26-ב', '26-ני']) });
    expect(copyUnit(g[0], rows, 'toLeft')!.dst).toEqual(['25-ט']);
  });
  it('pairs Labor, renamed The Democrats (probable), and Meretz, which ran jointly with it; the political union is not a merger', () => {
    const row = rowOf(rows, 'right', '26-אמת')!;
    expect(row.tag).toBe('ran-jointly');
    expect(new Set(row.left)).toEqual(new Set(['25-אמת', '25-מרצ']));
    expect(row.check).toBeUndefined();
    expect(rowOf(rows, 'left', '25-אמת')!.reason).toMatchObject({ kind: 'lineage', edgeId: 'labor-democrats-rename' });
  });
  it('marks lists that joined another list', () => {
    expect(rowOf(rows, 'left', '25-פה')).toMatchObject({ tag: 'joined', right: ['26-רק'] });
    expect(rowOf(rows, 'left', '25-יז')).toMatchObject({ tag: 'joined', right: ['26-די'] });
  });
  it('leaves Yashar! new and the Jewish Home ended, never matched by name or rank', () => {
    expect(rowOf(rows, 'right', '26-דרך')).toMatchObject({ tag: 'new', left: [] });
    expect(rowOf(rows, 'left', '25-ב')).toMatchObject({ tag: 'ended', right: [] });
    for (const r of rows.filter((x) => x.tag === 'new' || x.tag === 'ended')) expect(copyUnit(r, rows, 'toRight')).toBeNull();
  });
});

describe('matching invariants on every adjacent pair', () => {
  const ids = elections.filter((e) => e.available).sort((a, b) => a.date.localeCompare(b.date)).map((e) => e.id);
  const pairs = ids.slice(1).map((id, i) => [ids[i], id] as const);
  it.each(pairs)('%s → %s uses each list once and covers every list', (x, y) => {
    const a = baselineOf(load(x)), b = baselineOf(load(y));
    const rows = matchRows(a, b);
    const left = rows.flatMap((r) => r.left), right = rows.flatMap((r) => r.right);
    expect(new Set(left).size).toBe(left.length);
    expect(new Set(right).size).toBe(right.length);
    expect(new Set(left)).toEqual(new Set(a.lists.map((l) => l.id)));
    expect(new Set(right)).toEqual(new Set(b.lists.map((l) => l.id)));
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length);
  });
});

describe('the first Knessets', () => {
  const rows = matchRows(baselineOf(load('k1')), baselineOf(load('k2')));
  it('pairs Mapai, the General Zionists, Mapam, Herut, Maki and the Progressives', () => {
    for (const id of ['א', 'צ', 'מ', 'ח', 'ק', 'פ']) expect(rowOf(rows, 'left', `1-${id}`)).toMatchObject({ tag: 'same', right: [`2-${id}`] });
  });
  it('groups the United Religious Front’s four successors', () => {
    expect(rows.filter((r) => r.group === 'split:1-ב').map((r) => r.right[0]).sort()).toEqual(['2-ב', '2-ג', '2-ד', '2-ו']);
  });
});

describe('within one election', () => {
  it('pairs lists by origin, including a merger made in the scenario', () => {
    const merged = applyAction(k26, { type: 'merge', ids: ['26-שס', '26-ג'], newId: 'sim-m', nameHe: 'ש"ס–יהדות התורה', letters: 'שג', color: '#123456', retentionPct: 100, candidateOrder: 'concat', nonRetained: 'abstain' }, undefined, { base: k26 });
    const rows = matchRows(k26, merged);
    const row = rowOf(rows, 'right', 'sim-m')!;
    expect(new Set(row.left)).toEqual(new Set(['26-שס', '26-ג']));
    expect(row.reason.kind).toBe('origin');
    expect(rowOf(rows, 'left', '26-מחל')).toMatchObject({ right: ['26-מחל'], tag: 'same' });
  });
});

describe('user decisions about pairings', () => {
  it('accepts a pairing to check', () => {
    const row = rowOf(matchRows(k25, k26, [{ left: '25-אמת', right: '26-אמת', status: 'accepted' }]), 'right', '26-אמת')!;
    expect(row.tag).not.toBe('check');
    expect(row.check ?? []).toEqual([]);
  });
  it('rejects a pairing: both sides become unmatched', () => {
    const rows = matchRows(k25, k26, [{ left: '25-שס', right: null, status: 'rejected' }]);
    expect(rowOf(rows, 'left', '25-שס')).toMatchObject({ tag: 'ended', right: [] });
    expect(rowOf(rows, 'right', '26-שס')).toMatchObject({ tag: 'new', left: [] });
  });
  it('maps a new list by hand, marked as the user’s', () => {
    const rows = matchRows(k25, k26, [{ left: '25-ב', right: '26-דרך', status: 'user' }]);
    expect(rowOf(rows, 'right', '26-דרך')).toMatchObject({ tag: 'yours', left: ['25-ב'], reason: { kind: 'user' } });
    const left = rows.flatMap((r) => r.left);
    expect(new Set(left).size).toBe(left.length);
  });
});

it('ranks a hand mapping by candidates who ran on both lists', () => {
  const l = (s: typeof k25, id: string) => s.lists.find((x) => x.id === id)!;
  const yashar = l(k26, '26-דרך');
  const expected = (other: typeof yashar) => {
    const ids = new Set(other.candidates.map((c) => c.bio?.knesset).filter(Boolean));
    return new Set(yashar.candidates.map((c) => c.bio?.knesset).filter((k) => k && ids.has(k))).size;
  };
  expect(sharedCandidates(yashar, l(k25, '25-כן'))).toBe(expected(l(k25, '25-כן')));
  expect(sharedCandidates(yashar, l(k25, '25-כן'))).toBeGreaterThan(sharedCandidates(yashar, l(k25, '25-פה')));
});

describe('the later election drawn on the left', () => {
  // the open scenario stays on the right even when the other side is a later election: rows are matched earlier → later, then mirrored
  const rows = mirrorRows(matchRows(k25, k26));
  it('keeps the Joint List as one row, Balad included', () => {
    const row = rowOf(rows, 'left', '26-ודם')!;
    expect(row.tag).toBe('ran-jointly');
    expect(new Set(row.right)).toEqual(new Set(['25-ום', '25-ד']));
  });
  it('keeps the split group, its source now on the right', () => {
    const g = rows.filter((r) => r.group === 'split:25-ט');
    expect(g.filter((r) => r.inRight === '25-ט')).toHaveLength(2);
    expect(g.some((r) => r.inLeft)).toBe(false);
    for (const r of g) expect(copyUnit(r, rows, 'toLeft')).toEqual({ src: ['25-ט'], dst: expect.arrayContaining(['26-ט', '26-ב', '26-ני']) });
  });
  it('moves notes to the side they describe', () => {
    expect(rowOf(rows, 'right', '25-מחל')!.notes).toEqual([{ side: 'left', kind: 'with', partyIds: ['new-hope'] }]);
  });
  it('uses each list once', () => {
    const left = rows.flatMap((r) => r.left), right = rows.flatMap((r) => r.right);
    expect(new Set(left).size).toBe(left.length);
    expect(new Set(right).size).toBe(right.length);
  });
});

// The three matcher behaviours (party-history design audit, israel-elections-private docs/design/party-history.md §2.3) fixed with the shared relations
describe('matcher fixes', () => {
  const pair = (x: string, y: string) => matchRows(baselineOf(load(x)), baselineOf(load(y)));
  it('1. a documented split stays linked when its parent list joined a merged row (Independent Liberals 1965)', () => {
    const rows = pair('k5', 'k6');
    const il = rows.find((r) => r.right.some((id) => /^6-/.test(id)) && r.reason.kind === 'lineage' && r.reason.edgeId === 'independent-liberals-1965')!;
    expect(il).toBeDefined();
    expect(il.tag).toBe('split');
    const parent = rows.find((r) => r.left.includes(il.inLeft!))!;
    expect(parent.group).toBe(il.group);
    expect(parent.left.length).toBeGreaterThan(1); // Herut + Liberals ran as Gahal
  });
  it('2. a joint run is "Ran jointly", not Merged (Likud Beiteinu 2013)', () => {
    const rows = pair('k18', 'k19');
    const row = rows.find((r) => r.right.includes('19-מחל'))!;
    expect(row.tag).toBe('ran-jointly');
    expect(row.left.sort()).toEqual(['18-ל', '18-מחל'].sort());
  });
  it('2. a recorded merger is Merged (Likud 1988: Herut and the Liberals)', () => {
    const row = pair('k11', 'k12').find((r) => r.right.includes('12-מחל'))!;
    expect(row).toMatchObject({ tag: 'merged', left: ['11-מחל'], reason: { kind: 'lineage', edgeId: 'likud-party-1988' } });
  });
  it('2. a merger that also ran with a partner is "Ran jointly" (Alignment 1969: Labor’s merger, with Mapam)', () => {
    const row = pair('k6', 'k7').find((r) => r.right.includes('7-אמת'))!;
    expect(row.tag).toBe('ran-jointly');
    expect(new Set(row.left)).toEqual(new Set(['6-את', '6-כא', '6-מ']));
    expect(row.reason).toMatchObject({ kind: 'lineage', edgeId: 'labor-1968' });
  });
  it('3. Religious Zionism 2021 is grouped with Yamina 2020 (its leader’s list), not joined from Otzma’s 0-seat list', () => {
    const rows = pair('k23', 'k24');
    const rz = rows.find((r) => r.right.includes('24-ט'))!;
    expect(rz.tag).toBe('split');
    expect(rz.group).toMatch(/^split:23-/);
    const home = rows.filter((r) => r.group === rz.group).flatMap((r) => [...r.left, ...(r.inLeft ? [r.inLeft] : [])]);
    expect(home).toContain(rz.group!.slice(6));
    expect(rz.tag).not.toBe('joined');
  });
});
