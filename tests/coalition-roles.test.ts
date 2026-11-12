// Coalition roles in Play: members, outside support, arranged abstention and out; the confidence-vote
// arithmetic (more for than against) beside the 61 majority; and the roles' life as a scenario change.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { applyAction } from '../src/model/actions.ts';
import { NO_COALITION, scenarioFromDataset, toEngineInput, validateScenario, withCoalitionRole, type Scenario } from '../src/model/scenario.ts';
import { ACTION_CLASSIFICATION, factLog, isFactAction } from '../src/model/actionClassification.ts';
import { coalitionPieces, groupingOnly, referenceChanges, resultChanges } from '../src/app/derive.ts';
import { governmentVote, minimalWinning, recordedRoles, recordedVoteGap } from '../src/app/coalitions.ts';
import { aftermathRecords } from '../src/data/aftermath-runtime.ts';
import { describe as describeAction } from '../src/app/actionDescription.ts';
import { computeWhatIf } from '../src/app/whatIf.ts';

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;

describe('confidence-vote arithmetic', () => {
  it('counts outside support for, not as members: 56 members + 5 outside support = 61', () => {
    const v = governmentVote({ members: 56, support: 5, abstain: 0, total: 120 });
    expect(v).toMatchObject({ members: 56, support: 5, votesFor: 61, against: 59, majority: 61, passes: true, stable: true, forNeeded: 61 });
  });
  it('investiture needs more for than against, not 61: arranged abstentions lower the bar', () => {
    // 56 for, 10 abstain, 54 against: formed (Basic Law: The Knesset §25), but short of 61
    expect(governmentVote({ members: 56, support: 0, abstain: 10, total: 120 })).toMatchObject({ votesFor: 56, against: 54, passes: true, stable: false, forNeeded: 56 });
    // a tie fails: more for than against is strict
    expect(governmentVote({ members: 55, support: 0, abstain: 10, total: 120 })).toMatchObject({ votesFor: 55, against: 55, passes: false });
    // with no abstentions the two tests coincide at 61 of 120
    expect(governmentVote({ members: 60, support: 0, abstain: 0, total: 120 })).toMatchObject({ passes: false, stable: false, forNeeded: 61 });
  });
  it('the smallest winning search takes outside support as given votes for', () => {
    const items = [{ id: 'A', n: 44 }, { id: 'B', n: 12 }, { id: 'C', n: 6 }, { id: 'D', n: 32 }];
    // 5 outside support: members need 61 - 5 = 56, so A+B is minimal; without it, A+B+C
    expect(minimalWinning(items, 61 - 5).coalitions.map((c) => c.ids)).toContainEqual(['A', 'B']);
    expect(minimalWinning(items, 61).coalitions.map((c) => c.ids)).not.toContainEqual(['A', 'B']);
  });
});

describe('roles in the model', () => {
  const k13 = load('k13');
  const base = scenarioFromDataset(k13);
  const pieces = coalitionPieces(base, allocate(toEngineInput(base)));
  const unit = (letters: string) => pieces.find((p) => p.listId === `13-${letters}`)!.id;
  // 1992, Government 25: Labor, Meretz and Shas members; Hadash and the Arab Democratic Party outside support
  const rabin = { in: ['אמת', 'מרצ', 'שס'].map(unit), support: ['ו', 'ע'].map(unit), abstain: [], out: [] };

  it('recreates 1992: 62 members + 5 outside support = 67, the recorded 67–53', () => {
    const s = applyAction(base, { type: 'setCoalition', coalition: rabin });
    const seats = (ids: string[]) => pieces.filter((p) => ids.includes(p.id)).reduce((n, p) => n + p.n, 0);
    const v = governmentVote({ members: seats(s.coalition!.in), support: seats(s.coalition!.support), abstain: 0, total: 120 });
    expect(v).toMatchObject({ members: 62, support: 5, votesFor: 67, against: 53, passes: true, stable: true });
  });
  it('a role is one unit, one role; moving it keeps every other choice', () => {
    let c = withCoalitionRole(NO_COALITION, 'a', 'in');
    c = withCoalitionRole(c, 'b', 'support');
    c = withCoalitionRole(c, 'a', 'abstain');
    expect(c).toEqual({ in: [], support: ['b'], abstain: ['a'], out: [] });
    expect(withCoalitionRole(c, 'b', 'any')).toEqual({ in: [], support: [], abstain: ['a'], out: [] });
  });
  it('rejects overlapping roles and the former two-role shape (pre-release: no migration)', () => {
    expect(() => applyAction(base, { type: 'setCoalition', coalition: { ...rabin, out: [rabin.in[0]] } })).toThrow();
    expect(() => applyAction(base, { type: 'setCoalition', coalition: { in: rabin.in, out: [] } as never })).toThrow();
    const s = applyAction(base, { type: 'setCoalition', coalition: rabin });
    expect(validateScenario(s)).toEqual([]);
    expect(validateScenario({ ...s, coalition: { in: [], out: [] } })).toContain('invalid coalition choices');
  });
  it('a role change is a counted change that leaves votes and seats unchanged, with a named undo', () => {
    const action = { type: 'setCoalition', coalition: rabin } as const;
    expect(ACTION_CLASSIFICATION.setCoalition).toBe('edit');
    expect(isFactAction(action)).toBe(true);
    const s = applyAction(base, action);
    expect(toEngineInput(s)).toEqual(toEngineInput(base));
    expect(factLog(s)).toHaveLength(1);
    expect(resultChanges(s, base)).toEqual([['coalition', 'in'], ['coalition', 'support']]);
    expect(referenceChanges(s, base)).toEqual([['coalition', 'in'], ['coalition', 'support']]);
    expect(groupingOnly(s, base)).toBe(true);
    expect(describeAction(action, s, 'en')).toBe('Coalition: 3 in · 2 outside support');
    expect(describeAction(action, s, 'he')).toBe('קואליציה: 3 בפנים · 2 תמיכה מבחוץ');
    expect(describeAction({ type: 'setCoalition', coalition: NO_COALITION }, s, 'en')).toBe('Coalition choices cleared');
  });
});

describe('the recorded first government as roles', () => {
  const rolesFor = (id: string) => {
    const s = scenarioFromDataset(load(id));
    const pieces = coalitionPieces(s, allocate(toEngineInput(s)));
    const out = recordedRoles(aftermathRecords[id as 'k13']!.government!.coalition, s.lists, pieces.map((p) => ({ id: p.id, listId: p.listId })));
    const seats = (ids: string[]) => pieces.filter((p) => ids.includes(p.id)).reduce((n, p) => n + p.n, 0);
    return { ...out, seats };
  };
  it('k13 loads members and the provisional outside support, never upgraded', () => {
    const { recorded, choices, seats } = rolesFor('k13');
    expect(seats(choices!.in)).toBe(62);
    expect(seats(choices!.support)).toBe(5);
    expect(recorded.filter((x) => x.role === 'support').map((x) => [x.r.letters, x.r.certainty])).toEqual([['ו', 'provisional'], ['ע', 'provisional']]);
  });
  it('a confidence vote alone or an unknown relationship stays Any', () => {
    const k1 = rolesFor('k1');
    expect(k1.recorded.filter((x) => x.r.role === 'confidence-vote-only').every((x) => x.role === null)).toBe(true);
    const k20 = rolesFor('k20');
    expect(k20.recorded.filter((x) => x.r.certainty === 'unknown').every((x) => x.role === null)).toBe(true);
  });
  it('is available for every election with a recorded government', () => {
    for (let k = 1; k <= 26; k++) if (aftermathRecords[`k${k}` as 'k13']?.government) expect(rolesFor(`k${k}`).choices, `k${k}`).not.toBeNull();
  });
  it('never silently disagrees with the record: the loaded roles match the recorded vote, or the gap is disclosed with reasons', () => {
    let checked = 0;
    for (let k = 1; k <= 26; k++) {
      const g = aftermathRecords[`k${k}` as 'k13']?.government;
      if (!g) continue;
      const { recorded, choices, seats } = rolesFor(`k${k}`);
      const v = governmentVote({ members: seats(choices!.in), support: seats(choices!.support), abstain: seats(choices!.abstain), total: 120 });
      const gap = recordedVoteGap(g, v, recorded, seats, 120);
      const cv = g.confidenceVote;
      if (!cv || (v.votesFor === cv.for && v.against === cv.against)) expect(gap, `k${k}`).toBeNull();
      else {
        expect(gap?.recorded, `k${k}`).toEqual({ for: cv.for, against: cv.against });
        expect(gap!.reasons.length, `k${k}`).toBeGreaterThan(0);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(15);
    // 2015: United Torah Judaism's membership is recorded (13 Nov 2026), so 61 member seats equal the recorded
    // 61 for · 59 against and there is no gap to disclose
    const k20 = rolesFor('k20');
    const v20 = governmentVote({ members: k20.seats(k20.choices!.in), support: 0, abstain: 0, total: 120 });
    expect(recordedVoteGap(aftermathRecords.k20!.government!, v20, k20.recorded, k20.seats, 120)).toBeNull();
    // 2003: one role is still unknown, and the gap says so
    const k16 = rolesFor('k16');
    const v16 = governmentVote({ members: k16.seats(k16.choices!.in), support: 0, abstain: 0, total: 120 });
    expect(recordedVoteGap(aftermathRecords.k16!.government!, v16, k16.recorded, k16.seats, 120)!.reasons.map((r) => r.kind)).toContain('unknown');
    // 1984: Alignment counted whole (37 of 44 took part) and seven individual MKs disclosed
    const k11 = rolesFor('k11');
    const v11 = governmentVote({ members: k11.seats(k11.choices!.in), support: 0, abstain: 0, total: 120 });
    const kinds11 = recordedVoteGap(aftermathRecords.k11!.government!, v11, k11.recorded, k11.seats, 120)!.reasons.map((r) => r.kind);
    expect(kinds11.filter((x) => x === 'individual')).toHaveLength(7);
    expect(kinds11).toContain('partial');
  });
  it('the first-government grouping holds outside support as its own group', () => {
    const g = load('k13').blocSchemes!.find((x) => x.id === 'first-government')!;
    expect(g.blocs.map((b) => [b.id, b.lists.length])).toEqual([['coalition', 3], ['outside-support', 2], ['opposition', 5]]);
    // the support group recolours no list: Shas and Moledet keep the colours they had before it existed (Moledet's
    // since 13 Nov from its researched navy #083d7b, lightened to a readable seat colour and kept apart: fx-families)
    const colour = (letters: string) => load('k13').lists.find((l) => l.letters === letters)!.color;
    expect([colour('שס'), colour('ט')]).toEqual(['#773bf8', '#6979d6']);
  });
});

describe('links and saves carry the roles', () => {
  const ds = load('k25');
  beforeEach(() => { vi.stubGlobal('localStorage', { setItem: vi.fn(), getItem: () => null }); vi.stubGlobal('location', { origin: 'https://example.test', pathname: '/', hash: '' }); });
  it('share link and saved scenario replay to the same four roles', async () => {
    const { setState, getState, dispatch, shareLink, readSharedFromHash, saveCurrent, replay } = await import('../src/app/store.ts');
    const s0: Scenario = { ...scenarioFromDataset(ds), id: 'roles' };
    const ids = coalitionPieces(s0, allocate(toEngineInput(s0))).map((p) => p.id);
    setState({ scenario: s0, reference: null, past: [], future: [], saved: [], datasets: { k25: ds }, electionId: 'k25' });
    const roles = { in: [ids[0]], support: [ids[1]], abstain: [ids[2]], out: [ids[3]] };
    dispatch({ type: 'setCoalition', coalition: roles });
    const url = await shareLink();
    saveCurrent('Roles');
    location.hash = new URL(url).hash;
    const shared = (await readSharedFromHash())!;
    for (const x of [shared, getState().saved[0]]) expect(replay(ds, x.name, x.log).scenario.coalition).toEqual(roles);
  });
});

describe('What if…: a minority government with outside support', () => {
  it('k26: the opposition bloc governs with the Arab lists’ outside support, seats computed by the engine', () => {
    const q = computeWhatIf(load('k26'), 'en').find((x) => x.p.id === 'minority-outside-support')!;
    expect(q.actions).toHaveLength(1);
    expect(q.changes).toEqual([]);
    expect(q.facts[0]).toMatchObject({ kind: 'government', vote: { members: 48, support: 19, votesFor: 67, against: 53, passes: true, stable: true } });
    expect(q.body).toContain('support it from outside with 19');
    const he = computeWhatIf(load('k26'), 'he').find((x) => x.p.id === 'minority-outside-support')!;
    expect(he.body).not.toMatch(/[A-Za-z]{3}/);
  });
  it('is offered only where its sourced grouping exists', () => {
    expect(computeWhatIf(load('k25'), 'en').some((x) => x.p.id === 'minority-outside-support')).toBe(false);
  });
});
