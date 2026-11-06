// Seeded property tests for scenario actions: random action sequences on every dataset must keep
// vote accounting exact, never mutate their input, export and re-import unchanged, and replay
// from the action log to the same scenario.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ActionError, applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validateScenario, validVotes, type Action, type Scenario } from '../src/model/scenario.ts';
import { datasetIds, loadDs, randomAction, rng } from './differential.cases.ts';

const SCALE = Number(process.env.PROPERTY_SCALE ?? 1);
const fixed = (id: string): Scenario => ({ ...scenarioFromDataset(loadDs(id)), id: `${id}-fixed` });

/** What each successful action must conserve. */
function checkConservation(a: Action, s: Scenario, next: Scenario, msg: string) {
  const dv = validVotes(next) - validVotes(s); const di = next.invalid - s.invalid;
  switch (a.type) {
    case 'transfer': case 'redistribute': case 'split': expect([dv, di], msg).toEqual([0, 0]); break;
    case 'setWithdrawn': expect(dv + di, msg).toBe(0); break;
    case 'addVoters': expect([dv, di], msg).toEqual([a.allocations.reduce((t, x) => t + x.votes, 0), a.invalid]); break;
    case 'merge': {
      const total = a.ids.reduce((t, id) => t + s.lists.find((l) => l.id === id)!.votes, 0);
      const kept = next.lists.find((l) => l.id === a.newId)!.votes;
      expect(dv, msg).toBe(kept - total);
      expect(di, msg).toBe(a.nonRetained === 'invalid' ? total - kept : 0);
      if (a.retentionPct === 100) expect(kept, msg).toBe(total);
      break;
    }
  }
}

describe('random action sequences', () => {
  it('keep accounting exact, inputs untouched, exports importable and logs replayable', () => {
    const r = rng(0x5ce7a);
    const ids = datasetIds();
    for (let q = 0; q < 30 * SCALE; q++) {
      const base = fixed(ids[q % ids.length]);
      const ctx = { base };
      let s = base;
      for (let i = 0; i < 25; i++) {
        const a = randomAction(r, s) as Action;
        const msg = `sequence ${q} step ${i} ${JSON.stringify(a).slice(0, 160)}`;
        const snapshot = structuredClone(s);
        let next: Scenario;
        try { next = applyAction(s, a, `T${i}`, ctx); } catch (e) {
          expect(e, msg).toBeInstanceOf(ActionError);
          expect(s, msg).toEqual(snapshot);
          continue;
        }
        expect(s, `${msg}: input mutated`).toEqual(snapshot);
        const logged = a.type==='setBlocs'&&!a.unassignAll&&a.blocs.length===s.blocs.length&&a.blocs.every((b,j)=>s.blocs[j]?.id===b.id)?{type:'setBlocAppearance',blocs:a.blocs,...(a.name!==undefined?{name:a.name}:{})}:a;
        expect(next.log, msg).toEqual([...s.log, { at: `T${i}`, action: logged }]);
        checkConservation(a, s, next, msg);
        const exported = JSON.parse(JSON.stringify(next));
        expect(validateScenario(exported), `${msg}: export does not re-import`).toEqual([]);
        expect(exported, msg).toEqual(next);
        const res = allocate(toEngineInput(next));
        expect(res.seatsAllocated, msg).toBeLessThanOrEqual(next.rules.seats);
        s = next;
      }
      const replayed = s.log.reduce((x, e) => applyAction(x, e.action, e.at, ctx), base);
      expect(replayed, `sequence ${q}: replay`).toEqual(s);
    }
  }, 60_000);
});

describe('round trips', () => {
  it('withdrawing and reinstating any list restores every count', () => {
    for (const id of ['k1', 'k9', 'k25', 'k26']) {
      const base = fixed(id);
      for (const l of base.lists.filter((x) => !x.withdrawn)) {
        const w = applyAction(base, { type: 'setWithdrawn', listId: l.id, withdrawn: true });
        const back = applyAction(w, { type: 'setWithdrawn', listId: l.id, withdrawn: false });
        expect([back.lists, back.invalid], `${id} ${l.id}`).toEqual([base.lists, base.invalid]);
      }
    }
  });
  it('moving votes there and back restores every count', () => {
    const base = fixed('k26');
    const [a, b] = base.lists;
    const there = applyAction(base, { type: 'transfer', from: a.id, to: b.id, votes: 12_345 });
    expect(applyAction(there, { type: 'transfer', from: b.id, to: a.id, votes: 12_345 }).lists).toEqual(base.lists);
  });
});
