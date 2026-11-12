// The Copy votes box's methods, re-derived from the official results (public/data): Likud 2022 → 2026.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { applyAction } from '../src/model/actions.ts';
import { allocationOf, baselineOf } from '../src/app/derive.ts';
import { planVotes, ratioText, type CopyMode } from '../src/app/compare/copy.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const k26 = baselineOf(load('k26')), k25 = baselineOf(load('k25'));
const id = (s: typeof k26, en: string) => s.lists.find((l) => l.shortEn === en)!.id;
const L25 = k25.lists.find((l) => l.shortEn === 'Likud')!, L26 = k26.lists.find((l) => l.shortEn === 'Likud')!;
const valid = (s: typeof k26) => s.lists.reduce((t, l) => t + l.votes, 0);
const unit = { src: [L25.id], dst: [L26.id] };
const copy = (mode: CopyMode, from = k25, policy: { kind: 'proportional' } | { kind: 'new' } = { kind: 'proportional' }) => {
  const p = planVotes({ from: { sc: from, start: k25, name: '2022', official: from === k25 }, to: k26, ctx: { base: k26 }, units: [unit], mode, policy });
  if (!p.ok) throw new Error(p.reason.en);
  return { votes: p.result.lists.find((l) => l.id === L26.id)!.votes, seats: allocationOf(p.result).lists.find((l) => l.id === L26.id)!.seats, p };
};
const near = (n: bigint, d: bigint) => Number((2n * n + d) / (2n * d));

describe('Copy votes: what stays the same', () => {
  it('the same share of all eligible voters (the default)', () => {
    const want = near(BigInt(L25.votes) * BigInt(k26.registered), BigInt(k25.registered));
    expect(L25.votes).toBe(1_115_336);
    expect(want).toBe(1_204_575);
    const c = copy('eligible');
    expect(c.votes).toBe(want);
    expect(c.seats).toBe(28);
    expect((c.p.action as { provenance: { value?: string; mode?: string } }).provenance).toMatchObject({ mode: 'eligible', value: expect.stringMatching(/^16\.4/) });
  });
  it('the same share of the valid votes', () => {
    const c = copy('share');
    expect(c.votes).toBe(near(BigInt(L25.votes) * BigInt(valid(k26)), BigInt(valid(k25))));
    expect(c.votes).toBe(1_332_255);
    expect(c.seats).toBe(30);
  });
  it('the same number of votes', () => {
    const c = copy('count');
    expect(c.votes).toBe(1_115_336);
    expect(c.seats).toBe(26);
  });
  it('the same growth since its start: 10% more in an edited 2022 gives 10% more here', () => {
    const edited = applyAction(k25, { type: 'setVotes', listId: L25.id, votes: Math.round(L25.votes * 1.1) }, undefined, { base: k25 });
    const c = copy('ratio', edited);
    expect(c.votes).toBe(near(BigInt(L26.votes) * BigInt(Math.round(L25.votes * 1.1)), BigInt(L25.votes)));
    expect(ratioText(Math.round(L25.votes * 1.1), L25.votes)).toBe('×1.10');
  });
  it('extra votes can come from people who stayed home, never more than stayed home', () => {
    const c = copy('eligible', k25, { kind: 'new' });
    expect(c.votes).toBe(1_204_575);
    expect(valid(c.p.result)).toBe(valid(k26) + (1_204_575 - L26.votes));
    expect(id(k26, 'Likud')).toBe(L26.id);
  });
});
