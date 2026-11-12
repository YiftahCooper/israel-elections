// Regression tests built from the independent (Codex) review's failing inputs.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { goals, minimalChange, perturb, sweepThreshold, sweepVotes } from '../src/engine/analysis.ts';
import { rat } from '../src/engine/rational.ts';
import { simple } from './helpers.ts';

const lists7 = (v: number[]) => Object.fromEntries(v.map((x, i) => [String(i), x]));

describe('minimal-change search is exact even when the outcome is not monotonic', () => {
  it('finds 5, not 7 (non-monotonic small-vote case)', () => {
    const input = simple(lists7([218, 297, 350, 161, 346, 157, 342]), [['0', '1']]);
    const r = minimalChange(input, '0', { kind: 'transfer', listId: '2' }, goals.seatGain('0'));
    expect(r.votes).toBe(5n);
    expect(r.exact).toBe(true);
    for (let k = 1n; k < 5n; k++) expect(goals.seatGain('0')(allocate(perturb(input, '0', { kind: 'transfer', listId: '2' }, k)!), r.before)).toBe(false);
  });
});

describe('vote sweeps', () => {
  it('every count in a reported segment really has that allocation (exhaustive range)', () => {
    const input = simple(lists7([280, 183, 196, 95, 368, 281, 436]), [['0', '1']]);
    const res = sweepVotes(input, '0', 0n, 1500n);
    expect(res.exact).toBe(true);
    for (const seg of res.segments) for (let v = seg.from; v <= seg.to; v++) {
      const r = allocate({ ...input, lists: input.lists.map((l) => (l.id === '0' ? { ...l, votes: v } : l)) });
      expect([v, Object.fromEntries(r.lists.filter((l) => l.seats).map((l) => [l.id, l.seats]))]).toEqual([v, seg.seats]);
    }
  });
  // c-analysis-code-02: a wide range is evaluated on a grid, and every change between grid points is then found from
  // the decision records, so the result is the vote-by-vote one (it read "a change could be missed" on every first view)
  it('wide ranges are complete: the same segments as a vote-by-vote scan, including changes that reverse within a grid step', () => {
    for (const [votes, to, grid] of [[[280, 183, 196, 95, 368, 281, 436], 60_000n, 50], [[1966, 21, 86, 4, 900], 4_000n, 7], [[1169, 12, 38, 64], 3_000n, 9]] as const) {
      const input = simple(lists7([...votes]), [['0', '1']]);
      const res = sweepVotes(input, '0', 0n, to, grid);
      expect(res.step).toBeGreaterThan(1n);
      expect(res.exact).toBe(true);
      expect(res.segments).toEqual(sweepVotes(input, '0', 0n, to, Number(to) + 1).segments);
    }
  });
});

describe('threshold sweeps', () => {
  it('use the engine’s denominator (withdrawn lists excluded)', () => {
    const input = { ...simple({ a: 600, b: 400, w: 1000 }), lists: [{ id: 'a', votes: 600n }, { id: 'b', votes: 400n }, { id: 'w', votes: 1000n, withdrawn: true }] };
    const segs = sweepThreshold(input, rat(30n, 100n), rat(50n, 100n));
    const at40 = segs.find((s) => s.fromPct.num * 100n < 40n * s.fromPct.den && s.toPct.num * 100n >= 40n * s.toPct.den)!;
    expect(at40.qualified.sort()).toEqual(['a', 'b']);
  });
  it('keep qualification changes even when seats do not change', () => {
    const segs = sweepThreshold(simple({ a: 600, b: 400 }, [], { seats: 1 }), rat(10n, 100n), rat(50n, 100n));
    const last = segs[segs.length - 1];
    expect(last.qualified).toEqual(['a']);
    expect(segs.some((s) => s.qualified.includes('b'))).toBe(true);
  });
});
