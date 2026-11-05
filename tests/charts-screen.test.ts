import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf } from '../src/app/derive.ts';
import { noSeatVotes, regionEdges } from '../src/app/chartGeometry.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(join(import.meta.dirname, '..', 'public', 'data', `${id}.json`), 'utf8'));

it('counts the 1949 lists that won no seat although no threshold applied', () => {
  const s = scenarioFromDataset(load('k1')), r = allocationOf(s);
  expect(r.unrepresentedVotes).toBe(0n); // no threshold, so the threshold-only figure is empty
  const losers = s.lists.filter((l) => !l.withdrawn && r.lists.find((x) => x.id === l.id)!.seats === 0);
  expect(losers.length).toBeGreaterThan(0);
  expect(noSeatVotes(s, r)).toBe(losers.reduce((t, l) => t + l.votes, 0));
  expect(noSeatVotes(s, r)).toBeGreaterThan(0);
});

it('equals the threshold-wasted votes when every passing list wins a seat', () => {
  const s = scenarioFromDataset(load('k25')), r = allocationOf(s);
  expect(noSeatVotes(s, r)).toBe(Number(r.unrepresentedVotes));
});

it('draws an edge only between unlike neighbouring squares', () => {
  // a 3-column grid: A A B / B B B / C
  const ids = ['A', 'A', 'B', 'B', 'B', 'B', 'C'];
  const e = regionEdges(ids, 3, 10, 2);
  const vertical = e.filter((x) => x.x1 === x.x2), horizontal = e.filter((x) => x.y1 === x.y2);
  expect(vertical).toEqual([{ x1: 19, y1: 0, x2: 19, y2: 9 }]); // between the second A and the first B
  // under the two A squares, and under the first B of row two (above C)
  expect(horizontal).toHaveLength(3);
  expect(horizontal.every((x) => x.y1 === 9 || x.y1 === 19)).toBe(true);
  expect(regionEdges(['A', 'A', 'A', 'A'], 2, 10, 2)).toEqual([]);
});
