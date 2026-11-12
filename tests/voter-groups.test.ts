import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyAction } from '../src/model/actions.ts';
import { startEffect } from '../src/model/partEffect.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { groupAction, groupChange, parseVoterGroups, resolveGroup, validateVoterGroup, VOTER_GROUP_KIND, type GroupFacts, type VoterGroupPreset } from '../src/model/voterGroups.ts';
import { isEnvelopeRow, type LocalityDataset } from '../src/data/schema.ts';
import { loadDataset } from './helpers.ts';

const base = scenarioFromDataset(loadDataset('k25'));
const loc: LocalityDataset = JSON.parse(readFileSync('public/data/k25-localities.json', 'utf8'));
const preset = (over: Partial<VoterGroupPreset> = {}): VoterGroupPreset => ({ kind: VOTER_GROUP_KIND, schemaVersion: 1, id: 'vg-1', name: 'Arab localities', createdAt: '2026-11-05T00:00:00Z', members: { type: 'sourced', groupId: 'arab' }, turnoutChange: 10, vote: { type: 'observed' }, ...over });

describe('voter groups', () => {
  it('measures a sourced group from its own localities, excluding envelopes', () => {
    const f = resolveGroup(base, loc, { type: 'sourced', groupId: 'arab' }) as GroupFacts;
    const g = loc.groups!.find((x) => x.id === 'arab')!;
    expect(f.localities).toBe(g.coverage.localities);
    expect(f.electorate).toBe(g.coverage.registered);
    const rows = loc.rows.filter((r) => r.code !== null && g.codes.includes(r.code) && !isEnvelopeRow(r));
    expect(f.cast).toBe(rows.reduce((t, r) => t + r.votesCast, 0));
    // the mix is the group's own historical votes mapped onto the scenario lists: valid votes only
    expect(Math.round(f.mix!.reduce((a, b) => a + b, 0))).toBe(g.coverage.valid);
  });

  it('needs locality data, registered counts and the same election as the vote-share definition', () => {
    expect(resolveGroup(base, null, { type: 'sourced', groupId: 'arab' })).toBe('needs-localities');
    expect(resolveGroup(base, loc, { type: 'sourced', groupId: 'nope' })).toBe('unknown-group');
    expect(resolveGroup(base, loc, { type: 'voteShare', electionId: 'k24', listIds: [base.lists[0].id], minPct: 50 })).toBe('other-election');
    const noReg = { ...loc, rows: loc.rows.map((r) => ({ ...r, registered: null })) };
    expect(resolveGroup(base, noReg, { type: 'sourced', groupId: 'arab' })).toBe('no-registered');
  });

  it('vote-share groups select localities where the chosen lists together reach the cutoff', () => {
    const ids = base.lists.slice(0, 1).map((l) => l.id);
    const f = resolveGroup(base, loc, { type: 'voteShare', electionId: 'k25', listIds: ids, minPct: 60 }) as GroupFacts;
    const k = loc.listIds.indexOf(ids[0]);
    expect(f.localities).toBe(loc.rows.filter((r) => !isEnvelopeRow(r) && r.valid > 0 && r.votes[k] * 100 >= 60 * r.valid).length);
  });

  it('adds and removes exact ballots with the measured invalid rate, and the action replays', () => {
    const f: GroupFacts = { electorate: 1000, cast: 500, invalid: 50, mix: base.lists.map((_, i) => (i === 0 ? 300 : i === 1 ? 150 : 0)) };
    const up = groupChange(base, f, 10, f.mix!);
    expect(up).toMatchObject({ delta: 100, invalid: 10 });
    expect(up.allocations).toEqual([{ listId: base.lists[0].id, votes: 60 }, { listId: base.lists[1].id, votes: 30 }]);
    const s1 = applyAction(base, groupAction(up, 'test +10'));
    expect(s1.lists[0].votes - base.lists[0].votes).toBe(60);
    expect(s1.invalid - base.invalid).toBe(10);
    const down = groupChange(base, f, -10, f.mix!);
    expect(down).toMatchObject({ delta: -100, invalid: -10 });
    const a = groupAction(down, 'test −10');
    expect(a).toMatchObject({ type: 'addVoters', demographic: true });
    expect(applyAction(base, a).lists[0].votes - base.lists[0].votes).toBe(-60);
    expect(validateScenario({ ...base, log: [{ action: a, at: 'x' }] })).toEqual([]);
  });

  it('refuses turnout outside 0–100%, an empty split and removing more votes than a list has', () => {
    const f: GroupFacts = { electorate: 1000, cast: 500, invalid: 0 };
    expect(groupChange(base, f, 51, base.lists.map(() => 1)).error).toBe('range');
    expect(groupChange(base, f, 10, base.lists.map(() => 0)).error).toBe('no-split');
    const tiny = { ...base, lists: base.lists.map((l, i) => ({ ...l, votes: i === 0 ? 5 : l.votes })) };
    expect(groupChange(tiny, f, -50, base.lists.map((_, i) => (i === 0 ? 1 : 0))).error).toBe('too-few');
    expect(groupChange(base, f, 0, base.lists.map(() => 1))).toMatchObject({ delta: 0, allocations: [] });
  });

  it('presets round-trip through a file and reject malformed input', () => {
    const p = preset();
    expect(validateVoterGroup(p)).toEqual([]);
    expect(parseVoterGroups(JSON.stringify(p))).toEqual([p]);
    expect(parseVoterGroups(JSON.stringify({ groups: [p, { ...p, id: 'vg-2' }] }))).toHaveLength(2);
    expect(() => parseVoterGroups('not json')).toThrow('This file is not a voter group file this app can open.');
    expect(() => parseVoterGroups(JSON.stringify({ ...p, kind: 'scenario' }))).toThrow('Voter group 1 in the file is not valid, so nothing was imported.');
    expect(validateVoterGroup(preset({ members: { type: 'manual', electorate: 1000, turnoutPct: 50, invalidPct: 1 } }))).toContain('vote: typed numbers have no observed mix');
    expect(validateVoterGroup(preset({ vote: { type: 'shares', electionId: 'k25', shares: { a: -1 } } }))).toContain('vote.shares');
    expect(validateVoterGroup(preset({ turnoutChange: 500 }))).toContain('turnoutChange');
  });
});

describe('section reset and copy choices', () => {
  const ctx = base;
  it('offers the official result only when the section differs from it', () => {
    expect(startEffect(base, { type: 'startPart', part: 'totals', source: 'official' }, ctx)).toBe('same');
    const edited = applyAction(base, { type: 'setTurnout', pct: 75 }, undefined, { base: ctx });
    expect(startEffect(edited, { type: 'startPart', part: 'totals', source: 'official' }, ctx)).toBe('change');
    expect(startEffect(base, { type: 'startPart', part: 'agreements', source: 'blank' }, ctx)).toBe('change');
    const cleared = applyAction(base, { type: 'startPart', part: 'agreements', source: 'blank' }, undefined, { base: ctx });
    expect(startEffect(cleared, { type: 'startPart', part: 'agreements', source: 'blank' }, ctx)).toBe('same');
  });
  it('list-scoped parts compare only that list', () => {
    const l = base.lists[0];
    const renamed = applyAction(base, { type: 'setListMeta', listId: base.lists[1].id, patch: { shortHe: 'אחר' } }, undefined, { base: ctx });
    expect(startEffect(renamed, { type: 'startPart', part: 'identity', listId: l.id, source: 'official' }, ctx)).toBe('same');
    expect(startEffect(renamed, { type: 'startPart', part: 'identity', listId: base.lists[1].id, source: 'official' }, ctx)).toBe('change');
  });
  it('reports a choice that cannot apply instead of hiding why', () => {
    const r = startEffect(base, { type: 'startPart', part: 'agreements', source: 'saved', snapshot: { agreements: [{ id: 'x', members: ['missing', base.lists[0].id], enabled: true } as never] } }, ctx);
    expect(r).toHaveProperty('error');
  });
});
