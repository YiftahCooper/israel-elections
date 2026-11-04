import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { referenceChanges } from '../src/app/derive.ts';


const ds = (): ElectionDataset => JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
const votesMarked = (s: ReturnType<typeof scenarioFromDataset>, base: typeof s) =>
  referenceChanges(s, base).filter(p => p[0] === 'lists' && p[2] === 'votes').map(p => p[1]);

it('a balanced vote edit marks only the list the user edited, not the lists that absorbed the balance', () => {
  const base = scenarioFromDataset(ds()), likud = base.lists[0];
  const s = applyAction(base, { type: 'redistribute', from: base.lists.slice(1).filter(l => !l.withdrawn && l.votes > 0).map(l => l.id), to: [{ listId: likud.id, share: 1 }], votes: 10000 });
  expect(s.lists.filter(l => l.votes !== base.lists.find(x => x.id === l.id)!.votes).length).toBeGreaterThan(5);
  expect(votesMarked(s, base)).toEqual([likud.id]);
  // a loss spreads to the others the other way round; still one mark
  const t = applyAction(base, { type: 'redistribute', from: [likud.id], to: base.lists.slice(1).filter(l => !l.withdrawn && l.votes > 0).map(l => ({ listId: l.id, share: l.votes })), votes: 10000 });
  expect(votesMarked(t, base)).toEqual([likud.id]);
});

it('a transfer marks both chosen lists and a whole-election edit marks every list', () => {
  const base = scenarioFromDataset(ds()), [a, b] = base.lists;
  const s = applyAction(base, { type: 'transfer', from: a.id, to: b.id, votes: 5000 });
  expect(votesMarked(s, base).sort()).toEqual([a.id, b.id].sort());
  const all = applyAction(base, { type: 'scaleAll', factorPct: 110 });
  expect(votesMarked(all, base).length).toBe(base.lists.filter(l => l.votes > 0).length);
});

