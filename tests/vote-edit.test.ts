import { describe, expect, it } from 'vitest';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validVotes, votesCast } from '../src/model/scenario.ts';
import { minimalChange, goals } from '../src/engine/analysis.ts';
import { clampTarget, deltaAction, stayingHome, toVoteSource, votesForShare, type SourceChoice } from '../src/app/voteEdit.ts';
import { loadDataset } from './helpers.ts';

const base = scenarioFromDataset(loadDataset('k26'));
const likud = base.lists.find((l) => l.id === '26-מחל')!;
// the largest list below the threshold
const allocateBelow = () => [...base.lists].filter((l) => !l.withdrawn && l.votes > 0 && l.votes / validVotes(base) < Number(base.rules.thresholdPct) / 100).sort((a, b) => b.votes - a.votes)[0].id;
const edit = (target: number, src: SourceChoice) => {
  const s0 = base; const l = s0.lists.find((x) => x.id === likud.id)!;
  const a = deltaAction(s0, l, clampTarget(s0, l, target, src) - l.votes, src)!;
  return applyAction(s0, a);
};

describe('every vote edit follows the chosen source', () => {
  it('proportional: national total unchanged, other lists shrink in proportion', () => {
    const s = edit(likud.votes + 100_000, { kind: 'proportional' });
    expect(validVotes(s)).toBe(validVotes(base));
    expect(s.lists.find((l) => l.id === likud.id)!.votes).toBe(likud.votes + 100_000);
    const y0 = base.lists.find((l) => l.id === '26-דרך')!, y1 = s.lists.find((l) => l.id === '26-דרך')!;
    expect(Math.abs((y0.votes - y1.votes) / y0.votes - 100_000 / (validVotes(base) - likud.votes))).toBeLessThan(1e-5);
  });
  it('proportional loss goes back to the others; total unchanged', () => {
    const s = edit(likud.votes - 50_000, { kind: 'proportional' });
    expect(validVotes(s)).toBe(validVotes(base));
  });
  it('new voters: total changes by exactly the difference', () => {
    expect(validVotes(edit(likud.votes + 7, { kind: 'new' }))).toBe(validVotes(base) + 7);
  });
  it('new voters never push turnout past 100%: they come only from voters staying home', () => {
    const home = stayingHome(base);
    expect(home).toBe(base.registered - votesCast(base));
    const s = edit(likud.votes + 10_000_000, { kind: 'new' });
    expect(s.lists.find((l) => l.id === likud.id)!.votes).toBe(likud.votes + home);
    expect(votesCast(s)).toBe(s.registered);
    expect(stayingHome(s)).toBe(0);
    const l = s.lists.find((x) => x.id === likud.id)!;
    expect(clampTarget(s, l, l.votes + 1, { kind: 'new' })).toBe(l.votes); // nobody left at home
    expect(clampTarget(s, l, l.votes - 1, { kind: 'new' })).toBe(l.votes - 1); // losing voters to home is always possible
  });
  it('searches with new voters respect the same cap', () => {
    const below = allocateBelow();
    const src = toVoteSource({ kind: 'new' }, base);
    expect(src).toEqual({ kind: 'new', max: BigInt(stayingHome(base)) });
    const open = minimalChange(toEngineInput(base), below, src, goals.qualify(below));
    expect(open.found).toBe(true);
    const tight = { ...base, registered: votesCast(base) + Number(open.votes) - 1 };
    expect(minimalChange(toEngineInput(tight), below, toVoteSource({ kind: 'new' }, tight), goals.qualify(below)).found).toBe(false);
  });
  it('transfer: only the two lists change', () => {
    const s = edit(likud.votes + 1000, { kind: 'transfer', listId: '26-ב' });
    const changed = s.lists.filter((l) => l.votes !== base.lists.find((b) => b.id === l.id)!.votes).map((l) => l.id).sort();
    expect(changed).toEqual(['26-ב', '26-מחל'].sort());
  });
  it('a transfer larger than the source is clamped, never negative', () => {
    const s = edit(likud.votes + 10_000_000, { kind: 'transfer', listId: '26-נף' });
    expect(s.lists.find((l) => l.id === '26-נף')!.votes).toBe(0);
  });
  it('typing a percentage lands on that share for each source', () => {
    for (const src of [{ kind: 'new' }, { kind: 'proportional' }] as SourceChoice[]) {
      const t = votesForShare(base, likud, 30, src)!;
      const s = edit(t, src);
      expect(Math.abs((s.lists.find((l) => l.id === likud.id)!.votes / validVotes(s)) * 100 - 30)).toBeLessThan(0.0001);
    }
    expect(votesForShare(base, likud, 100, { kind: 'new' })).toBeNull();
  });
});

describe('turnout and restore actions', () => {
  it('setTurnout scales every list and the invalid ballots to the exact target', () => {
    const s = applyAction(base, { type: 'setTurnout', pct: 70 });
    expect(validVotes(s) + s.invalid).toBe(Math.round(base.registered * 0.7));
    expect(s.registered).toBe(base.registered);
  });
  it('restore brings back the historical agreements and totals', () => {
    let s = applyAction(base, { type: 'removeAgreement', id: base.agreements[0].id });
    s = applyAction(s, { type: 'setTotals', registered: 1, invalid: 2 });
    s = applyAction(s, { type: 'restore', what: 'agreements', agreements: base.agreements });
    s = applyAction(s, { type: 'restore', what: 'totals', registered: base.registered, invalid: base.invalid });
    expect(s.agreements).toEqual(base.agreements);
    expect([s.registered, s.invalid]).toEqual([base.registered, base.invalid]);
  });
});
