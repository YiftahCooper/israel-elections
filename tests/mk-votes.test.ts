// MKs who vote apart from their list in the Coalitions tool (owner, 16 Nov 2026). Each shifts one seat's vote; toward
// 61, a government MK who votes against leaves the count and one who abstains stays (June 2021: Chikli against,
// Alkharumi abstaining gives the recorded 60 for · 59 against and 61 of 120).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validAction, withCoalitionRole, NO_COALITION, type Action } from '../src/model/scenario.ts';
import { coalitionPieces } from '../src/app/derive.ts';
import { governmentVote, recordedRoles, roleVote } from '../src/app/coalitions.ts';
import { aftermathRecords } from '../src/data/aftermath-runtime.ts';
import { describe as describeAction } from '../src/app/actionDescription.ts';

describe('MKs apart from their list', () => {
  it('June 2021: the recorded first government with Chikli against and Alkharumi abstaining is 60 for, 59 against, 61 toward the majority', () => {
    const s = scenarioFromDataset(JSON.parse(readFileSync('public/data/k24.json', 'utf8')) as ElectionDataset);
    const pieces = coalitionPieces(s, allocate(toEngineInput(s)));
    const g = aftermathRecords.k24!.government!;
    const { choices } = recordedRoles(g.coalition, s.lists, pieces.map((p) => ({ id: p.id, listId: p.listId })));
    const seats = (ids: string[]) => pieces.filter((p) => ids.includes(p.id)).reduce((n, p) => n + p.n, 0);
    const before = governmentVote({ members: seats(choices!.in), support: seats(choices!.support), abstain: seats(choices!.abstain), total: 120 });
    expect([before.votesFor, before.against, before.backing]).toEqual([62, 58, 62]);
    const shifts = g.individuals!.map((ind) => ({ from: 'for' as const, to: ind.vote as 'against' | 'abstain' }));
    const v = governmentVote({ members: seats(choices!.in), support: seats(choices!.support), abstain: seats(choices!.abstain), total: 120, shifts });
    expect([v.votesFor, v.against, v.abstain]).toEqual([g.confidenceVote!.for, g.confidenceVote!.against, g.confidenceVote!.abstain]);
    expect([v.backing, v.stable, v.passes, v.apart]).toEqual([61, true, true, 2]);
  });
  it('an MK of another list voting for joins the count; one voting as their list changes nothing', () => {
    const v = governmentVote({ members: 60, support: 0, abstain: 0, total: 120, shifts: [{ from: 'against', to: 'for' }, { from: 'for', to: 'for' }] });
    expect([v.votesFor, v.against, v.backing, v.stable, v.apart]).toEqual([61, 59, 61, true, 1]);
  });
  it('a list in a role votes: In and Support for, Abstain abstains, Out and Any against', () => {
    expect((['in', 'support', 'abstain', 'out', 'any'] as const).map(roleVote)).toEqual(['for', 'for', 'abstain', 'against', 'against']);
  });
  it('are kept with the coalition choices, survive a role change, and History says how many', () => {
    const s = scenarioFromDataset(JSON.parse(readFileSync('public/data/k25.json', 'utf8')) as ElectionDataset);
    const a: Action = { type: 'setCoalition', coalition: { ...NO_COALITION, in: ['x'], breaks: [{ unit: 'x', vote: 'against' }, { unit: 'x', vote: 'abstain', mk: { id: 'c1', nameHe: 'א' } }] } };
    expect(validAction(a)).toBe(true);
    expect(validAction({ type: 'setCoalition', coalition: { ...NO_COALITION, breaks: [{ unit: 'x', vote: 'maybe' }] } } as unknown as Action)).toBe(false);
    const after = applyAction(s, a);
    expect(withCoalitionRole(after.coalition!, 'y', 'out').breaks).toHaveLength(2);
    expect(describeAction(a, s, 'en')).toContain('2 apart from their list');
  });
});
