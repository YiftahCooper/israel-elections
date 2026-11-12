import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocationOf, baselineOf, resultChanges } from '../src/app/derive.ts';
import { applyAction } from '../src/model/actions.ts';
import { hasAppearance, isFactAction } from '../src/model/actionClassification.ts';
import { copyOriginOf } from '../src/model/editScopes.ts';
import { percentToRational } from '../src/engine/rational.ts';
import { votesCast, type Action, type Scenario } from '../src/model/scenario.ts';
import { getState, replay, setState } from '../src/app/store.ts';
import { alreadySame, duplicatePeople, planAgreements, planColour, planRoster, planRules, planTotals, planVotes, planWholeList, type CopySource, type Plan } from '../src/app/compare/copy.ts';
import { matchRows, memberKey } from '../src/app/compare/match.ts';
import { comparisonLink, comparisonOf, dispatchSide, readComparison, redoSide, startOverSide, undoSide } from '../src/app/compare/sides.ts';
import { stayingHome } from '../src/app/voteEdit.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const ds25 = load('k25'), ds26 = load('k26');
const k25 = baselineOf(ds25), k26 = baselineOf(ds26);
const from25: CopySource = { sc: k25, start: k25, name: '2022', official: true };
const ctx = { base: k26 };
const ok = (p: Plan) => { if (!p.ok) throw new Error(p.reason.en); return p; };
const votes = (s: Scenario, id: string) => s.lists.find((l) => l.id === id)!.votes;
const seats = (s: Scenario, id: string) => allocationOf(s).lists.find((l) => l.id === id)!.seats;
const valid = (s: Scenario) => s.lists.reduce((t, l) => t + l.votes, 0);
/** exact nearest integer of a·b/c, halves up (independent of the planner's helper) */
const near = (a: number, b: number, c: number) => Number((2n * BigInt(a) * BigInt(b) + BigInt(c)) / (2n * BigInt(c)));
const likud = [{ src: ['25-מחל'], dst: ['26-מחל'] }];

describe('copy votes between elections', () => {
  it('as share, balanced by the other lists in proportion: Likud 2022’s 23.41% gives 30 seats in 2026', () => {
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'proportional' } }));
    const expected = near(votes(k25, '25-מחל'), valid(k26), valid(k25));
    expect(expected).toBe(1_332_255);
    expect(votes(p.result, '26-מחל')).toBe(expected);
    expect(valid(p.result)).toBe(valid(k26)); // total fixed
    expect(seats(p.result, '26-מחל')).toBe(30);
    expect(seats(p.result, '26-דרך')).toBe(19);
    expect(seats(p.result, '26-עם')).toBe(7);
    expect(p.result.lists.reduce((t, l) => t + allocationOf(p.result).lists.find((x) => x.id === l.id)!.seats, 0)).toBe(120);
    expect(p.targets).toEqual([{ listId: '26-מחל', before: votes(k26, '26-מחל'), after: expected }]);
  });
  it('as share with new voters: the others keep their votes and Likud reaches the same share of a larger total', () => {
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'new' } }));
    const others = valid(k26) - votes(k26, '26-מחל');
    // x = p·O/(1−p) = s·O/(S−s)
    const s = votes(k25, '25-מחל'), S = valid(k25);
    expect(votes(p.result, '26-מחל')).toBe(near(s, others, S - s));
    expect(votes(p.result, '26-מחל')).toBe(1_382_580);
    for (const l of k26.lists.filter((l) => l.id !== '26-מחל')) expect(votes(p.result, l.id)).toBe(l.votes);
    expect(seats(p.result, '26-מחל')).toBe(30);
  });
  it('as share from one donor: only Yashar! gives the votes', () => {
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'transfer', listId: '26-דרך' } }));
    const gain = votes(p.result, '26-מחל') - votes(k26, '26-מחל');
    expect(votes(p.result, '26-דרך')).toBe(votes(k26, '26-דרך') - gain);
    for (const l of k26.lists.filter((l) => !['26-מחל', '26-דרך'].includes(l.id))) expect(votes(p.result, l.id)).toBe(l.votes);
    expect(seats(p.result, '26-מחל')).toBe(31);
  });
  it('as count: the exact number of votes', () => {
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'count', policy: { kind: 'proportional' } }));
    expect(votes(p.result, '26-מחל')).toBe(votes(k25, '25-מחל'));
    expect(votes(p.result, '26-מחל')).toBe(1_115_336);
    expect(valid(p.result)).toBe(valid(k26));
    expect(seats(p.result, '26-מחל')).toBe(26);
    expect(seats(p.result, '26-שס')).toBe(7);
  });
  it('as change: the source’s change in share is added to the destination’s share', () => {
    const edited = applyAction(k25, { type: 'setVotes', listId: '25-מחל', votes: 1_300_000 }, undefined, { base: k25 });
    const p = ok(planVotes({ from: { sc: edited, start: k25, name: 'Mine', official: false }, to: k26, ctx, units: likud, mode: 'change', policy: { kind: 'proportional' } }));
    const v = votes(k26, '26-מחל'), V = valid(k26), s = 1_300_000, S = valid(edited), s0 = votes(k25, '25-מחל'), S0 = valid(k25);
    // x = V·(v/V + s/S − s0/S0) = (v·S·S0 + s·V·S0 − s0·V·S) / (S·S0)
    const num = BigInt(v) * BigInt(S) * BigInt(S0) + BigInt(s) * BigInt(V) * BigInt(S0) - BigInt(s0) * BigInt(V) * BigInt(S);
    const den = BigInt(S) * BigInt(S0);
    expect(votes(p.result, '26-מחל')).toBe(Number((2n * num + den) / (2n * den)));
    expect((p.action as Extract<Action, { type: 'copyFrom' }>).provenance.mode).toBe('change');
  });
  it('copies a split group as a whole, keeping the destination lists’ own balance', () => {
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: [{ src: ['25-ט'], dst: ['26-ט', '26-ב', '26-ני'] }], mode: 'share', policy: { kind: 'proportional' } }));
    const total = near(votes(k25, '25-ט'), valid(k26), valid(k25));
    expect(['26-ט', '26-ב', '26-ני'].reduce((t, id) => t + votes(p.result, id), 0)).toBe(total);
    expect(p.targets.map((t) => t.after)).toEqual([285_754, 321_399, 9_764]);
  });
  it('copies several rows in one step', () => {
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: [...likud, { src: ['25-שס'], dst: ['26-שס'] }], mode: 'count', policy: { kind: 'proportional' } }));
    expect(votes(p.result, '26-מחל')).toBe(votes(k25, '25-מחל'));
    expect(votes(p.result, '26-שס')).toBe(votes(k25, '25-שס'));
    expect(valid(p.result)).toBe(valid(k26));
  });
  it('reinstates a withdrawn list before giving it votes', () => {
    expect(k26.lists.find((l) => l.id === '26-כן')!.withdrawn).toBe(true);
    const p = ok(planVotes({ from: from25, to: k26, ctx, units: [{ src: ['25-כן'], dst: ['26-כן'] }], mode: 'count', policy: { kind: 'proportional' } }));
    const inner = (p.action as Extract<Action, { type: 'copyFrom' }>).actions;
    expect(inner[0]).toEqual({ type: 'setWithdrawn', listId: '26-כן', withdrawn: false });
    expect(p.result.lists.find((l) => l.id === '26-כן')!.withdrawn).toBeFalsy();
    expect(votes(p.result, '26-כן')).toBe(votes(k25, '25-כן'));
  });
  it('never lets rounding move a list across the threshold its exact share is on', () => {
    // search a source vote count whose exact share sits on one side of 3.25% while the nearest vote lands on the other
    const t = percentToRational(k26.rules.thresholdPct), V = BigInt(valid(k26));
    // two degrees of freedom: Ra'am's votes and another source list's (Shas), so a straddling case exists
    const base = BigInt(valid(k25) - votes(k25, '25-עם'));
    let found: { s: number; d: number; above: boolean } | null = null;
    for (let d = 0; d < 2000 && !found; d++) {
      const others = base + BigInt(d), star = (t.num * others) / (t.den - t.num);
      for (const s of [star - 1n, star, star + 1n, star + 2n]) {
        const S = others + s, exactAbove = s * t.den >= t.num * S;
        const x = (2n * s * V + S) / (2n * S);
        if (exactAbove !== x * t.den >= t.num * V) { found = { s: Number(s), d, above: exactAbove }; break; }
      }
    }
    expect(found).not.toBeNull();
    const src = [{ type: 'setVotes', listId: '25-עם', votes: found!.s }, { type: 'setVotes', listId: '25-שס', votes: votes(k25, '25-שס') + found!.d }].reduce<Scenario>((s, a) => applyAction(s, a as Action, undefined, { base: k25 }), k25);
    const p = ok(planVotes({ from: { sc: src, start: k25, name: 'x', official: false }, to: k26, ctx, units: [{ src: ['25-עם'], dst: ['26-עם'] }], mode: 'share', policy: { kind: 'proportional' } }));
    const x = BigInt(votes(p.result, '26-עם'));
    expect(x * t.den >= t.num * V).toBe(found!.above);
  });
  it('refuses a share the other lists could not make room for', () => {
    // a source where one list holds every vote: share 100%
    const all = k25.lists.reduce((s, l) => l.id === '25-מחל' ? s : applyAction(s, { type: 'setVotes', listId: l.id, votes: 0 }, undefined, { base: k25 }), k25);
    const p = planVotes({ from: { sc: all, start: k25, name: 'x', official: false }, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'proportional' } });
    expect(p.ok).toBe(false);
    if (!p.ok) { expect(p.reason.en).toMatch(/negative votes/); expect(p.reason.he).toMatch(/שליליים|שלילי/); }
  });
  it('refuses a donor without enough votes', () => {
    const p = planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'transfer', listId: '26-נף' } });
    expect(p.ok).toBe(false);
    if (!p.ok) expect(p.reason.en).toMatch(/has only/);
  });
  it('caps new voters at those staying home for one list, and refuses for several', () => {
    const few = applyAction(k26, { type: 'setTotals', registered: votesCast(k26) + 1000 }, undefined, ctx);
    const one = ok(planVotes({ from: from25, to: few, ctx, units: likud, mode: 'share', policy: { kind: 'new' } }));
    expect(one.capped).toBe(1000);
    expect(votes(one.result, '26-מחל')).toBe(votes(k26, '26-מחל') + 1000);
    expect(stayingHome(one.result)).toBe(0);
    const two = planVotes({ from: from25, to: few, ctx, units: [...likud, { src: ['25-שס'], dst: ['26-שס'] }], mode: 'share', policy: { kind: 'new' } });
    expect(two.ok).toBe(false);
  });
  it('refuses to copy from a list that withdrew', () => {
    const w = applyAction(k25, { type: 'setWithdrawn', listId: '25-מחל', withdrawn: true }, undefined, { base: k25 });
    expect(planVotes({ from: { sc: w, start: k25, name: 'x', official: false }, to: k26, ctx, units: likud, mode: 'count', policy: { kind: 'proportional' } }).ok).toBe(false);
  });
});

describe('marking every copied value', () => {
  const p = ok(planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'proportional' } }));
  it('records where the value came from, as one step in the log', () => {
    expect(p.result.log.at(-1)!.action.type).toBe('copyFrom');
    expect(p.result.log).toHaveLength(k26.log.length + 1);
    const origin = copyOriginOf(p.result, ['lists', '26-מחל', 'votes'])!;
    expect(origin.provenance).toMatchObject({ electionId: 'k25', sourceName: '2022', official: true, field: 'votes', mode: 'share', policy: 'proportional', sourceListIds: ['25-מחל'], targetListIds: ['26-מחל'], value: '23.4%' }); // the share as shown: Max decimal places (1 at the default Simple level)
    expect(isFactAction(p.action)).toBe(true);
    expect(resultChanges(p.result, k26).length).toBeGreaterThan(0);
  });
  it('drops the origin when the copied value is edited again, and keeps it through other edits', () => {
    const other = applyAction(p.result, { type: 'setTotals', registered: k26.registered + 5 }, undefined, ctx);
    expect(copyOriginOf(other, ['lists', '26-מחל', 'votes'])).toBeDefined();
    const edited = applyAction(p.result, { type: 'setVotes', listId: '26-מחל', votes: 1_000_000 }, undefined, ctx);
    expect(copyOriginOf(edited, ['lists', '26-מחל', 'votes'])).toBeUndefined();
  });
  it('replays from the saved log to the same values and the same origin', () => {
    const r = replay(ds26, 'x', p.result.log.map((e) => e.action), false);
    expect(r.failed).toBe(0);
    expect(r.scenario.lists.map((l) => l.votes)).toEqual(p.result.lists.map((l) => l.votes));
    expect(copyOriginOf(r.scenario, ['lists', '26-מחל', 'votes'])?.provenance.electionId).toBe('k25');
  });
  it('refuses a malformed copy step', () => {
    expect(() => applyAction(k26, { type: 'copyFrom', provenance: (p.action as Extract<Action, { type: 'copyFrom' }>).provenance, actions: [] }, undefined, ctx)).toThrow();
    expect(() => applyAction(k26, { type: 'copyFrom', provenance: (p.action as Extract<Action, { type: 'copyFrom' }>).provenance, actions: [p.action] }, undefined, ctx)).toThrow();
  });
});

describe('copy other inputs', () => {
  it('copies turnout as the percentage, exactly to the vote', () => {
    const p = ok(planTotals({ from: from25, to: k26, ctx, field: 'turnout' }));
    expect(votesCast(p.result)).toBe(near(k26.registered, votesCast(k25), k25.registered));
    expect(p.result.registered).toBe(k26.registered);
  });
  it('copies registered voters and invalid ballots', () => {
    expect(ok(planTotals({ from: from25, to: k26, ctx, field: 'invalid' })).result.invalid).toBe(k25.invalid);
    const reg = planTotals({ from: from25, to: k26, ctx, field: 'registered' });
    if (votesCast(k26) > k25.registered) expect(reg.ok).toBe(false); else expect(ok(reg).result.registered).toBe(k25.registered);
  });
  it('copies the 1949 threshold into 1951, switching to experimental rules', () => {
    const k1 = baselineOf(load('k1')), k2 = baselineOf(load('k2'));
    const p = ok(planRules({ from: { sc: k1, start: k1, name: '1949', official: true }, to: k2, ctx: { base: k2 }, what: 'threshold' }));
    expect((p.action as Extract<Action, { type: 'copyFrom' }>).actions).toEqual([{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { thresholdPct: k1.rules.thresholdPct } }]);
    expect(p.result.mode).toBe('experimental');
    expect(p.result.rules.thresholdPct).toBe(k1.rules.thresholdPct);
    expect(copyOriginOf(p.result, ['rules', 'thresholdPct'])).toBeDefined();
  });
  it('maps surplus agreements through one-to-one pairings and lists the ones it cannot map', () => {
    const p = planAgreements({ from: from25, to: k26, ctx, rows: matchRows(k25, k26), direction: 'toRight' });
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.result.agreements.map((a) => [...a.members].sort())).toEqual([['26-ג', '26-שס'].sort()]);
    // Labor–Meretz (a pairing to check), Likud–RZ (a split), National Unity–Yesh Atid (withdrew / joined), the small pair (ended)
    expect(p.skipped!.map((s) => [...s.members].sort())).toEqual([['25-אמת', '25-מרצ'], ['25-מחל', '25-ט'], ['25-כן', '25-פה'], ['25-נק', '25-ף']].map((m) => m.sort()));
  });
  it('imports a roster with its origin, as the destination list’s candidates', () => {
    const p = ok(planRoster({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל' }));
    const list = p.result.lists.find((l) => l.id === '26-מחל')!;
    expect(list.candidates.map((c) => c.id)).toEqual(k25.lists.find((l) => l.id === '25-מחל')!.candidates.map((c) => c.id));
    expect(list.candidates.every((c) => c.originListId === '26-מחל' && c.importedFrom?.electionId === 'k25' && c.importedFrom.listId === '25-מחל')).toBe(true);
    expect(copyOriginOf(p.result, ['lists', '26-מחל', 'candidates'])).toBeDefined();
  });
  it('copies a colour as appearance only: no change to the result and no marker', () => {
    const src = applyAction(k25, { type: 'setListMeta', listId: '25-ל', patch: { color: '#0a7e8c' } }, undefined, { base: k25 });
    const p = ok(planColour({ from: { ...from25, sc: src }, to: k26, ctx, srcId: '25-ל', dstId: '26-ל' }));
    expect(p.result.lists.find((l) => l.id === '26-ל')!.color).toBe('#0a7e8c');
    expect(resultChanges(p.result, k26)).toEqual([]);
    expect(hasAppearance(p.result)).toBe(true);
    expect(isFactAction(p.action)).toBe(false);
  });
});

describe('whole list', () => {
  const opts = { votes: true, candidates: true, identity: false, appearance: false, mode: 'share' as const, policy: { kind: 'proportional' as const } };
  it('replaces a list’s votes and candidates in one step', () => {
    const p = ok(planWholeList({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל', opts }));
    expect(seats(p.result, '26-מחל')).toBe(30);
    expect(p.result.lists.find((l) => l.id === '26-מחל')!.candidates[0].importedFrom).toEqual({ electionId: 'k25', listId: '25-מחל' });
    expect(p.result.log).toHaveLength(k26.log.length + 1);
    expect(copyOriginOf(p.result, ['lists', '26-מחל', 'votes'])?.provenance.field).toBe('list');
  });
  it('copies over a joint list counted by its parties: the split is undone before the roster changes', () => {
    const split = applyAction(k26, { type: 'setFactionSplit', listId: '26-מחל', split: true }, undefined, ctx);
    expect(split.factionSplits).toContain('26-מחל');
    const p = ok(planWholeList({ from: from25, to: split, ctx, srcId: '25-מחל', dstId: '26-מחל', opts }));
    expect(p.result.factionSplits ?? []).not.toContain('26-מחל');
    expect(seats(p.result, '26-מחל')).toBe(30);
  });
  it('adds a list beside the existing ones', () => {
    const p = ok(planWholeList({ from: from25, to: k26, ctx, srcId: '25-ב', dstId: null, opts }));
    const added = p.result.lists.find((l) => l.id === 'sim-k25-25-ב')!;
    expect(added.votes).toBe(near(votes(k25, '25-ב'), valid(k26), valid(k25)));
    expect(added.candidates).toHaveLength(k25.lists.find((l) => l.id === '25-ב')!.candidates.length);
    expect(p.result.lists).toHaveLength(k26.lists.length + 1);
  });
});

describe('the other side’s own history', () => {
  beforeEach(() => setState({ compare: { drafts: {}, overrides: {}, snapshot: null, swapped: null, chamber: 'work', back: null } }));
  it('makes each copy one undoable step, with redo and Start over', () => {
    const p = ok(planVotes({ from: { sc: k26, start: k26, name: '2026', official: true }, to: k25, ctx: { base: k25 }, units: [{ src: ['26-מחל'], dst: ['25-מחל'] }], mode: 'count', policy: { kind: 'proportional' } }));
    const key = 'election:k25';
    expect(dispatchSide(key, k25, k25, p.action)).toBe(true);
    expect(votes(getState().compare.drafts[key].scenario, '25-מחל')).toBe(votes(k26, '26-מחל'));
    undoSide(key);
    expect(getState().compare.drafts[key].scenario).toBe(k25);
    redoSide(key);
    expect(votes(getState().compare.drafts[key].scenario, '25-מחל')).toBe(votes(k26, '26-מחל'));
    startOverSide(key);
    expect(getState().compare.drafts[key].scenario).toBe(k25);
    undoSide(key);
    expect(votes(getState().compare.drafts[key].scenario, '25-מחל')).toBe(votes(k26, '26-מחל'));
  });
});

it('shares a comparison as a link that reads back both sides and the pairings', async () => {
  vi.stubGlobal('location', { origin: 'https://example.test', pathname: '/' });
  const p = ok(planVotes({ from: from25, to: k26, ctx, units: likud, mode: 'share', policy: { kind: 'proportional' } }));
  const c = comparisonOf(p.result, k25, [{ left: '25-אמת', right: '26-אמת', status: 'accepted' }]);
  const url = await comparisonLink(c);
  expect(url).toMatch(/^https:\/\/example\.test\/#c=[A-Za-z0-9_-]+$/);
  const back = await readComparison(url.slice(url.indexOf('#')));
  expect(back).toEqual(JSON.parse(JSON.stringify(c)));
  expect(await readComparison('#c=broken')).toBeNull();
  const r = replay(ds26, back!.main.n, back!.main.l, back!.main.f);
  expect(r.scenario.lists.map((l) => l.votes)).toEqual(p.result.lists.map((l) => l.votes));
  vi.unstubAllGlobals();
});

describe('a person on two lists after an import', () => {
  const names = (s: Scenario, id: string) => duplicatePeople(s, id).map((d) => [d.candidate.nameEn, d.otherListId]);
  it('names each person and the other list, by confirmed Knesset record only', () => {
    expect(names(ok(planRoster({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל' })).result, '26-מחל')).toEqual([['Tally Gotliv', '26-ב']]);
    // National Unity 2022 into Yashar!: Sa'ar now on Likud, Ginzburg on Together. Probable links (Elkin, Haskel) are not identity.
    expect(names(ok(planRoster({ from: from25, to: k26, ctx, srcId: '25-כן', dstId: '26-דרך' })).result, '26-דרך')).toEqual([['Gideon Sa\'ar', '26-מחל'], ['Eitan Ginzburg', '26-רק']]);
    const probable = k26.lists.flatMap((l) => l.candidates).filter((c) => c.bio?.probable && c.bio.knesset && !c.bio.memberConfirmed);
    expect(probable.length).toBeGreaterThan(0);
    for (const c of probable) expect(memberKey(c)).toBeUndefined();
    // a probable Hebrew Wikipedia link does not hide an official Knesset identity: Almog Cohen, Otzma Yehudit 2022 #7, Likud 2026
    expect(names(ok(planRoster({ from: from25, to: k26, ctx, srcId: '25-ט', dstId: '26-ב' })).result, '26-ב')).toContainEqual(['Almog Cohen', '26-מחל']);
  });
  it('never removes anyone unless asked; a chosen removal is an ordinary, marked edit of the other list in the same step', () => {
    const kept = ok(planRoster({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל' }));
    expect(kept.result.lists.find((l) => l.id === '26-ב')!.candidates).toEqual(k26.lists.find((l) => l.id === '26-ב')!.candidates);
    const [d] = duplicatePeople(kept.result, '26-מחל');
    const p = ok(planRoster({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל', remove: [{ listId: d.otherListId, candidateId: d.otherCandidateId }] }));
    const otzma = p.result.lists.find((l) => l.id === '26-ב')!;
    expect(otzma.candidates.some((c) => c.id === d.otherCandidateId)).toBe(false);
    expect(otzma.candidates).toHaveLength(k26.lists.find((l) => l.id === '26-ב')!.candidates.length - 1);
    expect(duplicatePeople(p.result, '26-מחל')).toEqual([]);
    expect(p.result.log).toHaveLength(k26.log.length + 1);
    expect(resultChanges(p.result, k26).map((x) => x.join('/'))).toContain('lists/26-ב/candidates');
    expect(copyOriginOf(p.result, ['lists', '26-ב', 'candidates'])).toBeUndefined(); // an edit, not a copy
    expect(copyOriginOf(p.result, ['lists', '26-מחל', 'candidates'])).toBeDefined();
  });
  it('applies the same choice to a whole-list replacement', () => {
    const opts = { votes: true, candidates: true, identity: false, appearance: false, mode: 'share' as const, policy: { kind: 'proportional' as const } };
    const base = ok(planWholeList({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל', opts }));
    const [d] = duplicatePeople(base.result, '26-מחל');
    const p = ok(planWholeList({ from: from25, to: k26, ctx, srcId: '25-מחל', dstId: '26-מחל', opts, remove: [{ listId: d.otherListId, candidateId: d.otherCandidateId }] }));
    expect(duplicatePeople(p.result, '26-מחל')).toEqual([]);
    expect(seats(p.result, '26-מחל')).toBe(30);
  });
});

describe('the band’s arrows rest only when a copy would change nothing', () => {
  const k24 = baselineOf(load('k24'));
  const rows = matchRows(k24, k26);
  it('2021 and 2026 both have six surplus agreements, but different ones: the copy is offered and changes them', () => {
    const n = (s: Scenario) => s.agreements.filter((a) => a.enabled).length;
    expect([n(k24), n(k26)]).toEqual([6, 6]);
    expect(alreadySame('agreements', k24, k26, rows, 'toRight')).toBe(false);
    const p = planAgreements({ from: { sc: k24, start: k24, name: '2021', official: true }, to: k26, ctx, rows, direction: 'toRight' });
    expect(p.ok).toBe(true);
    expect(alreadySame('agreements', ok(p).result, ok(p).result, matchRows(k26, k26), 'toRight')).toBe(true);
  });
  it('turnout is judged on the exact votes cast, never on the rounded percentage shown', () => {
    const near = applyAction(k26, { type: 'setTotals', invalid: k26.invalid + 1 }, undefined, ctx);
    expect(alreadySame('turnout', near, k26, [], 'toRight')).toBe(false);
    expect(planTotals({ from: { sc: near, start: near, name: 'x', official: false }, to: k26, ctx, field: 'turnout' }).ok).toBe(true);
    expect(alreadySame('turnout', k26, k26, [], 'toRight')).toBe(true);
  });
  it('the rules are judged on the whole rule set, not the seat method’s name', () => {
    const other = applyAction(applyAction(k26, { type: 'setMode', mode: 'experimental' }, undefined, ctx), { type: 'setRules', patch: { thresholdPct: '2' } }, undefined, ctx);
    expect(alreadySame('rules', other, k26, [], 'toRight')).toBe(false);
    expect(alreadySame('rules', k26, k26, [], 'toRight')).toBe(true);
  });
});
