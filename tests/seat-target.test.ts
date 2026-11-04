// Typing a seat count: the fewest votes that give it, under each vote source, verified by the
// same vote edit the app dispatches (deltaAction), so the search and the edit agree.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset, toEngineInput, type Scenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { allocate } from '../src/engine/allocate.ts';
import { seatTarget } from '../src/app/analysisTasks.ts';
import { deltaAction, toVoteSource, type SourceChoice } from '../src/app/voteEdit.ts';

const k26 = (): ElectionDataset => JSON.parse(readFileSync(join(import.meta.dirname, '..', 'public', 'data', 'k26.json'), 'utf8'));
const seatsOf = (s: Scenario, id: string) => allocate(toEngineInput(s)).lists.find((l) => l.id === id)!.seats;

function reach(s: Scenario, id: string, n: number, src: SourceChoice) {
  const l = s.lists.find((x) => x.id === id)!;
  const seats = seatsOf(s, id);
  const res = seatTarget(toEngineInput(s), toVoteSource(src), id, seats, n);
  expect(res.found).toBe(true);
  const k = Number(res.votes) * (n > seats ? 1 : -1);
  const at = (d: number) => { const a = deltaAction(s, l, d, src); return a ? applyAction(s, a) : s; };
  return { got: seatsOf(at(k), id), short: seatsOf(at(k - Math.sign(k)), id), exact: res.exact };
}

it('reaches a typed seat count with the fewest votes, for every vote source', () => {
  const s = scenarioFromDataset(k26());
  const r = allocate(toEngineInput(s));
  const big = r.lists.filter((l) => l.seats >= 6).sort((a, b) => b.seats - a.seats);
  const id = big[1].id; const now = big[1].seats; const donor = big[0].id;
  for (const src of [{ kind: 'proportional' }, { kind: 'new' }, { kind: 'transfer', listId: donor }] as SourceChoice[]) {
    for (const n of [now + 3, now - 2]) {
      const { got, short, exact } = reach(s, id, n, src);
      expect(got, `${src.kind} → ${n}`).toBe(n);
      // one vote fewer moved does not get there: the answer is the minimum
      if (exact) expect(short, `${src.kind} → ${n} minus one`).not.toBe(n);
    }
  }
});

it('a target inside the threshold gap lands on the nearest possible count', () => {
  const s = scenarioFromDataset(k26());
  const r = allocate(toEngineInput(s));
  const below = r.lists.filter((l) => !l.qualified).sort((a, b) => Number(b.votes - a.votes))[0];
  const { got } = reach(s, below.id, 1, { kind: 'proportional' });
  // passing the threshold brings several seats at once, so 1 seat is reported as the nearest count
  expect(got).toBeGreaterThan(1);
});
