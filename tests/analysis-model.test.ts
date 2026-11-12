import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { compareAllocations, goals, minimalChange, perturb, sweepThreshold, sweepVotes, type VoteSource } from '../src/engine/analysis.ts';
import { rat } from '../src/engine/rational.ts';
import { ActionError, apportion, applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validVotes } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
import { arcLayout, bandCuts } from '../src/app/layout.ts';

const k25 = loadDataset('k25');
const base = scenarioFromDataset(k25);
const input = toEngineInput(base);
const seats = (r: ReturnType<typeof allocate>, id: string) => r.lists.find((l) => l.id === id)!.seats;

describe('marginal votes (exact, verified at k and k−1)', () => {
  it('Meretz 2022 needs 4,198 additional (new) votes to pass the threshold', () => {
    // 400(v+k) ≥ 13(V+k) ⇔ k ≥ (13V − 400v)/387 = 1,624,446/387 = 4,197.5…
    const r = minimalChange(input, '25-מרצ', { kind: 'new' }, goals.qualify('25-מרצ'));
    expect(r.votes).toBe(4198n);
    expect(allocate(perturb(input, '25-מרצ', { kind: 'new' }, 4197n)!).lists.find((l) => l.id === '25-מרצ')!.qualified).toBe(false);
  });

  it('…but only 4,062 votes if they are transferred from Labor (valid total unchanged)', () => {
    const r = minimalChange(input, '25-מרצ', { kind: 'transfer', listId: '25-אמת' }, goals.qualify('25-מרצ'));
    expect(r.votes).toBe(4062n); // ⌈1,624,446/400⌉
  });

  it('seat-gain answers are the true minimum for each source', () => {
    for (const source of [{ kind: 'new' }, { kind: 'transfer', listId: '25-מחל' }, { kind: 'proportional', listIds: [] }] as VoteSource[]) {
      const r = minimalChange(input, '25-שס', source, goals.seatGain('25-שס'));
      expect(r.found).toBe(true);
      const at = allocate(perturb(input, '25-שס', source, r.votes!)!);
      const below = allocate(perturb(input, '25-שס', source, r.votes! - 1n)!);
      expect(seats(at, '25-שס')).toBe(12);
      // one vote fewer: 11 seats, or an exact tie for the 12th, decided by lot (the answer is the first certain count;
      // c-results-engine-02): with new voters, 27,327 ties Shas with UTJ inside their surplus pair
      if (r.lotteryFrom === r.votes! - 1n) expect([...below.remainderSteps, ...below.internalDivisions.flatMap((d) => d.steps)].some((x) => x.tie?.tiedUnitIds.includes('25-שס'))).toBe(true);
      else expect(seats(below, '25-שס')).toBe(11);
    }
  }, 10_000); // the proportional source is scanned vote by vote (about 1 s locally)

  it('inverse: the most votes Likud can lose without losing a seat', () => {
    const r = minimalChange(input, '25-מחל', { kind: 'new' }, goals.seatLoss('25-מחל'), 'lose');
    expect(r.found).toBe(true);
    const keep = allocate(perturb(input, '25-מחל', { kind: 'new' }, r.votes! - 1n, 'lose')!);
    expect(seats(keep, '25-מחל')).toBe(32);
    expect(seats(r.after!, '25-מחל')).toBe(31);
  });

  it('reports "already" when the goal holds before any change', () => {
    expect(minimalChange(input, '25-מחל', { kind: 'new' }, goals.qualify('25-מחל')).reason).toBe('already');
  });
});

describe('sweeps', () => {
  it('vote sweep segments are contiguous with exact boundaries', () => {
    const { segments: segs } = sweepVotes(input, '25-מרצ', 140_000n, 200_000n, 120);
    expect(segs[0].from).toBe(140_000n);
    expect(segs.at(-1)!.to).toBe(200_000n);
    for (let i = 1; i < segs.length; i++) expect(segs[i].from).toBe(segs[i - 1].to + 1n);
    const crossing = segs.find((s) => s.qualified.includes('25-מרצ'))!;
    // the first count at which Meretz qualifies: 400v ≥ 13(V − 150,793 + v) → v ≥ 13(V−150,793)/387
    const V0 = 4_764_742n - 150_793n;
    expect(crossing.from).toBe((13n * V0 + 386n) / 387n);
  });

  it('threshold sweep is exact: qualification changes only at votes/total', () => {
    const segs = sweepThreshold(input, rat(1n, 100n), rat(5n, 100n));
    for (const s of segs) expect(Object.values(s.seats).reduce((a, b) => a + b, 0)).toBe(120);
    const at325 = segs.find((s) => s.fromPct.num * 400n < 13n * s.fromPct.den && s.toPct.num * 400n >= 13n * s.toPct.den)!;
    expect(at325.seats).toEqual(Object.fromEntries(allocate(input).lists.filter((l) => l.seats).map((l) => [l.id, l.seats])));
  });
});

describe('scenario actions', () => {
  it('a transfer preserves the valid total; added voters increase it', () => {
    const t = applyAction(base, { type: 'transfer', from: '25-מחל', to: '25-מרצ', votes: 10_000 });
    expect(validVotes(t)).toBe(validVotes(base));
    const n = applyAction(base, { type: 'addVoters', allocations: [{ listId: '25-ד', votes: 20_000 }], invalid: 100 });
    expect(validVotes(n)).toBe(validVotes(base) + 20_000);
    expect(n.invalid).toBe(base.invalid + 100);
  });

  it('rejects impossible transfers and negative or fractional votes', () => {
    expect(() => applyAction(base, { type: 'transfer', from: '25-נף', to: '25-מחל', votes: 1_000_000 })).toThrow(ActionError);
    expect(() => applyAction(base, { type: 'setVotes', listId: '25-מחל', votes: -1 })).toThrow(ActionError);
    expect(() => applyAction(base, { type: 'setVotes', listId: '25-מחל', votes: 1.5 })).toThrow(ActionError);
  });

  it('merging Labor and Meretz sums votes, combines candidates and drops their agreements', () => {
    const m = applyAction(base, { type: 'merge', ids: ['25-אמת', '25-מרצ'], newId: 'sim-1', nameHe: 'העבודה–מרצ', letters: 'אמת', color: '#e00', retentionPct: 100, candidateOrder: 'interleave', nonRetained: 'abstain' });
    const merged = m.lists.find((l) => l.id === 'sim-1')!;
    expect(merged.votes).toBe(175_992 + 150_793);
    expect(merged.candidates[0].id).toBe('25-אמת#1');
    expect(merged.candidates[1].id).toBe('25-מרצ#1');
    expect(merged.originIds).toEqual(['25-אמת', '25-מרצ']);
    expect(m.agreements.some((a) => a.members.includes('25-אמת'))).toBe(false);
    const r = allocate(toEngineInput(m));
    expect(r.seatsAllocated).toBe(120);
    expect(r.lists.find((l) => l.id === 'sim-1')!.qualified).toBe(true);
    const diff = compareAllocations(allocate(input), base.lists, r, m.lists);
    const g = diff.find((d) => d.bIds.includes('sim-1'))!;
    expect(g.aIds.sort()).toEqual(['25-אמת', '25-מרצ']);
    expect(g.seatsA).toBe(4);
  });

  it('merge retention below 100% removes votes exactly', () => {
    const m = applyAction(base, { type: 'merge', ids: ['25-אמת', '25-מרצ'], newId: 'sim-1', nameHe: 'x', letters: 'x', color: '#000', retentionPct: 90, candidateOrder: 'concat', nonRetained: 'abstain' });
    expect(m.lists.find((l) => l.id === 'sim-1')!.votes).toBe(Math.floor((326_785 * 90) / 100));
  });

  it('a split partitions votes and candidates', () => {
    const orig = base.lists.find((l) => l.id === '25-ט')!;
    const ids = orig.candidates.map((c) => c.id);
    const s = applyAction(base, { type: 'split', id: '25-ט', parts: [
      { newId: 'sim-a', nameHe: 'הציונות הדתית', letters: 'ט', color: '#a80', votes: 250_000, candidateIds: ids.filter((_, i) => i % 2 === 0) },
      { newId: 'sim-b', nameHe: 'עוצמה יהודית', letters: 'ב', color: '#ec0', votes: 266_470, candidateIds: ids.filter((_, i) => i % 2 === 1) },
    ] });
    expect(validVotes(s)).toBe(validVotes(base));
    expect(s.lists.find((l) => l.id === 'sim-a')!.originIds).toEqual(['25-ט']);
    expect(() => applyAction(base, { type: 'split', id: '25-ט', parts: [
      { newId: 'a', nameHe: 'a', letters: 'a', color: '#000', votes: 516_470, candidateIds: [] },
      { newId: 'b', nameHe: 'b', letters: 'b', color: '#000', votes: 1, candidateIds: [] },
    ] })).toThrow(/more than the list's 516,470/);
  });

  it('historical mode locks the rules and the two-list agreement structure', () => {
    expect(() => applyAction(base, { type: 'setRules', patch: { thresholdPct: '2' } })).toThrow(/experimental/);
    expect(() => applyAction(base, { type: 'setAgreement', agreement: { id: 'x', members: ['25-ד', '25-ום', '25-עם'], enabled: true } })).toThrow(/exactly two/);
    const exp = applyAction(base, { type: 'setMode', mode: 'experimental' });
    const t2 = applyAction(exp, { type: 'setRules', patch: { thresholdPct: '2' } });
    expect(allocate(toEngineInput(t2)).lists.find((l) => l.id === '25-מרצ')!.qualified).toBe(true);
    const back = applyAction(t2, { type: 'setMode', mode: 'historical' });
    expect(back.rules.thresholdPct).toBe('3.25');
  });

  it('every change is logged in order', () => {
    const a = applyAction(applyAction(base, { type: 'setVotes', listId: '25-ד', votes: 160_000 }), { type: 'rename', name: 'Balad passes' });
    expect(a.log.map((e) => e.action.type)).toEqual(['setVotes', 'rename']);
  });

  it('apportion is exact', () => {
    expect(apportion(10, [1, 1, 1])).toEqual([4, 3, 3]);
    expect(apportion(7, [5, 0, 5]).reduce((a, b) => a + b, 0)).toBe(7);
  });
});

describe('chamber geometry', () => {
  it('lays out exactly the configured number of seats', async () => {
    const { arcLayout } = await import('../src/app/layout.ts');
    for (const n of [1, 7, 61, 120, 151, 500]) expect(arcLayout(n).seats).toHaveLength(n);
  });
  it('pushes overlapping labels apart', async () => {
    const { placeLabels } = await import('../src/app/layout.ts');
    const deg = (d: number) => (d * Math.PI) / 180;
    const out = placeLabels([{ id: 'a', n: 21, a: deg(95.6), text: 'ישר! 21' }, { id: 'b', n: 6, a: deg(86), text: 'הציונות הדתית–זהות 6' }], 500, 470, 400);
    const [p, q] = out.map((x) => x.box);
    expect(p[0] < q[2] && p[2] > q[0] && p[1] < q[3] && p[3] > q[1]).toBe(false);
  });
});

describe('bloc regions behind the chamber', () => {
  // seat i belongs to region band[i]; on its row its angle must lie strictly between the region's two edges
  const check = (n: number, sizes: number[], descending: boolean) => {
    const { seats } = arcLayout(n);
    const placed = descending ? seats : [...seats].reverse();
    const band = sizes.flatMap((k, j) => Array(k).fill(j));
    const { radii, cuts } = bandCuts(placed, band, sizes.length, descending);
    const start = descending ? Math.PI : 0, end = descending ? 0 : Math.PI;
    placed.forEach((p, i) => {
      const row = radii.findIndex((r) => Math.abs(r - Math.hypot(p.x, p.y)) < 1e-6);
      const j = band[i];
      const left = j === 0 ? start : cuts[j - 1][row], right = j === sizes.length - 1 ? end : cuts[j][row];
      const [lo, hi] = [Math.min(left, right), Math.max(left, right)];
      expect(p.a > lo - 1e-9 && p.a < hi + 1e-9, `seat ${i} (region ${j}) at ${p.a} outside ${lo}..${hi}`).toBe(true);
      // an edge shared with a neighbouring bloc never runs through a seat (the arc's own ends at 0 and π may)
      const shared = (e: number) => Math.abs(e) > 1e-9 && Math.abs(e - Math.PI) > 1e-9;
      if (j > 0 && shared(left)) expect(Math.abs(p.a - left)).toBeGreaterThan(1e-6);
      if (j < sizes.length - 1 && shared(right)) expect(Math.abs(p.a - right)).toBeGreaterThan(1e-6);
    });
  };
  it('keeps every seat inside its own bloc region, left to right and right to left', () => {
    for (const sizes of [[53, 48, 19], [61, 59], [1, 118, 1], [27, 21, 12, 11, 8, 8, 7, 7, 7, 6, 6], [40, 0, 80].filter(Boolean)]) {
      check(120, sizes, true);
      check(120, sizes, false);
    }
    check(25, [10, 15], true);
  });
});
