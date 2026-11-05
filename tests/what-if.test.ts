// What if… answers: exact, explained when no seat moves, and with every assumption stated.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { computeWhatIf } from '../src/app/whatIf.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(join(import.meta.dirname, '..', 'public', 'data', `${id}.json`), 'utf8'));
const ALL = Array.from({ length: 26 }, (_, i) => `k${i + 1}`);

/** Independent of the engine: Bader–Ofer gives the same totals as D'Hondt among the units that pass
 *  the threshold (an agreement pools its partners), followed by D'Hondt inside each agreement. */
function dhondt(votes: Record<string, number>, seats: number) {
  const s: Record<string, number> = Object.fromEntries(Object.keys(votes).map((k) => [k, 0]));
  for (let i = 0; i < seats; i++) {
    let best = ''; let bn = -1n; let bd = 1n;
    for (const [k, v] of Object.entries(votes)) { const d = BigInt(s[k] + 1); if (BigInt(v) * bd > bn * d) { best = k; bn = BigInt(v); bd = d; } }
    s[best]++;
  }
  return s;
}
function baderOfer(lists: { id: string; votes: number }[], agreements: string[][]) {
  const total = lists.reduce((t, l) => t + l.votes, 0);
  const passed = new Set(lists.filter((l) => l.votes * 400 >= 13 * total).map((l) => l.id));
  const votes = Object.fromEntries(lists.map((l) => [l.id, l.votes]));
  const units: Record<string, number> = {}; const inUnit = new Set<string>();
  for (const a of agreements) if (a.every((m) => passed.has(m))) { units[a.join('+')] = a.reduce((t, m) => t + votes[m], 0); a.forEach((m) => inUnit.add(m)); }
  for (const id of passed) if (!inUnit.has(id)) units[id] = votes[id];
  const out: Record<string, number> = {};
  for (const [u, n] of Object.entries(dhondt(units, 120))) {
    const members = u.split('+');
    Object.assign(out, members.length === 1 ? { [u]: n } : dhondt(Object.fromEntries(members.map((m) => [m, votes[m]])), n));
  }
  return out;
}

describe('2026 mergers that move no seat', () => {
  const ds = load('k26');
  const lists = ds.lists.filter((l) => !l.withdrawn).map((l) => ({ id: l.id, votes: l.votes }));
  const agreements = ds.agreements.map((a) => a.members);
  const before = baderOfer(lists, agreements);
  const results = computeWhatIf(ds, 'en');
  for (const [preset, ids] of [['bennett-yashar', ['26-רק', '26-דרך']], ['arab-joint', ['26-עם', '26-ודם']]] as const) {
    it(`${preset}: no seat moves, confirmed independently, and the row says why`, () => {
      const merged = [...lists.filter((l) => !ids.includes(l.id as never)), { id: 'M', votes: ids.reduce((t, id) => t + lists.find((l) => l.id === id)!.votes, 0) }];
      const after = baderOfer(merged, agreements.filter((a) => !a.some((m) => ids.includes(m as never))));
      for (const id of Object.keys(before)) if (!ids.includes(id as never)) expect(after[id] ?? 0, id).toBe(before[id]);
      expect(after.M).toBe(ids.reduce((t, id) => t + before[id], 0));
      const r = results.find((x) => x.p.id === preset)!;
      expect(r.changes).toEqual([]);
      expect(r.facts[0]).toMatchObject({ kind: 'joint', seats: after.M, parts: ids.map((id) => ({ seats: before[id] })) });
    });
  }
  it('a merger states what happens to the partners’ surplus agreements', () => {
    const body = (id: string) => results.find((x) => x.p.id === id)!.body;
    expect(body('bennett-yashar')).toContain('Their surplus agreements end: Together (Bennett) with Yisrael Beiteinu; Yashar! with The Democrats.');
    expect(body('arab-joint')).toContain('already shared surplus votes');
    expect(body('otzma-rz')).toMatch(/^As in 2022\..*Religious Zionism–Zehut with Likud/);
  });
});

describe('every election', () => {
  for (const id of ALL) it(`${id}: unchanged answers are explained, assumptions are stated in both languages`, () => {
    const ds = load(id);
    const en = computeWhatIf(ds, 'en'), he = computeWhatIf(ds, 'he');
    for (const [i, r] of en.entries()) {
      if (!r.actions) continue;
      // a bare "No seat changes" is never the whole answer
      if (!r.changes.length) expect(r.facts.length, `${id} ${r.p.id}`).toBeGreaterThan(0);
      for (const body of [r.body, he[i].body]) { expect(body.length).toBeGreaterThan(20); expect(body).not.toMatch(/undefined|NaN|—/); }
      expect(he[i].body).not.toMatch(/[A-Za-z]/);
      // proportional turnout keeps every share, and so (here, always) every seat
      if (r.p.id === 'turnout-80') { expect(r.changes).toEqual([]); expect(r.votes).toMatch(/same shares$/); }
    }
  });
});

it('a 2% threshold that crosses no list says so', () => {
  const r = computeWhatIf(load('k22'), 'en').find((x) => x.p.id === 'threshold-2')!;
  expect(r.changes).toEqual([]);
  expect(r.facts[0]).toEqual({ kind: 'band', from: '2', to: '3.25' });
});
