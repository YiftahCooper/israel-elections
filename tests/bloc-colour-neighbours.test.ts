// Every ready-made grouping keeps neighbouring blocs apart (owner card col-blocs, 16 Nov 2026): in the order the blocs
// are drawn (seat chart, Blocs strip), any two side by side differ by a colour distance (CIEDE2000) of 20 or more.
import { expect, test } from 'vitest';
import { blocDisplayOrder } from '../src/app/blocOrder.ts';
import { deltaE2000 } from '../src/data/colour.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, type Scenario } from '../src/model/scenario.ts';
import { dataset } from './graphics-cases.ts';

const MIN = 20;
const groupings = (n: number): { name: string; s: Scenario }[] => {
  const base = scenarioFromDataset(dataset(n));
  return [{ name: `k${n} default`, s: base }, ...(base.blocSchemes ?? []).map((g) => ({ name: `k${n} ${g.id}`, s: applyAction(base, { type: 'applyBlocScheme', schemeId: g.id }) }))];
};

test('every grouping of every election: neighbouring blocs are at least 20 apart in colour', () => {
  const problems: string[] = [];
  for (let n = 1; n <= 26; n++) for (const { name, s } of groupings(n)) {
    const order = blocDisplayOrder(s).filter((id): id is string => !!id);
    const colour = (id: string) => s.blocs.find((b) => b.id === id)?.color;
    for (let i = 1; i < order.length; i++) {
      const a = colour(order[i - 1]), b = colour(order[i]);
      if (a && b && deltaE2000(a, b) < MIN) problems.push(`${name}: ${order[i - 1]} ${a} / ${order[i]} ${b} = ${deltaE2000(a, b).toFixed(1)}`);
    }
  }
  expect(problems).toEqual([]);
});

test('2022 and 2026: the Arab lists bloc is ochre (#8a6d1f, or the nearest colour the bloc tints allow)', () => {
  for (const n of [25, 26]) {
    const ds = dataset(n);
    expect(ds.blocs.find((b: { id: string }) => b.id === 'arab')?.color).toBe('#8a6d1f');
    for (const scheme of ds.blocSchemes ?? []) for (const b of scheme.blocs) if (b.id === 'arab') expect(deltaE2000(b.color, '#8a6d1f'), `k${n} ${scheme.id}`).toBeLessThan(8);
  }
});
