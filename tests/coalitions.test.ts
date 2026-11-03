// The pruned search must return exactly what the former exhaustive enumeration returned, in order.
import { describe, expect, it } from 'vitest';
import { minimalWinning } from '../src/app/coalitions.ts';

function brute(items: { id: string; n: number }[], majority: number, picked: string[]) {
  const out: { ids: string[]; n: number }[] = [];
  const N = items.length;
  for (let mask = 1; mask < 1 << N; mask++) {
    let n = 0; const ids: string[] = []; let minSeat = Infinity;
    for (let i = 0; i < N; i++) if (mask & (1 << i)) { n += items[i].n; ids.push(items[i].id); minSeat = Math.min(minSeat, items[i].n); }
    if (n < majority || n - minSeat >= majority) continue;
    if (!picked.every((p) => ids.includes(p))) continue;
    out.push({ ids, n });
  }
  return out.sort((a, b) => a.ids.length - b.ids.length || a.n - b.n);
}

describe('minimal winning coalitions', () => {
  it('match the exhaustive enumeration on random chambers', () => {
    let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let t = 0; t < 400; t++) {
      const N = 2 + Math.floor(rnd() * 13);
      let left = 120; const items = Array.from({ length: N }, (_, i) => ({ id: `L${i}`, n: 0 }));
      for (let k = 0; k < 120; k++) items[Math.floor(rnd() ** 1.6 * N)].n++, left--;
      const seated = items.filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
      const picked = seated.filter(() => rnd() < 0.15).map((x) => x.id);
      expect(minimalWinning(seated, 61, picked).coalitions).toEqual(brute(seated, 61, picked));
    }
  });
  it('handles more lists than the old 18-list limit, and reports truncation', () => {
    // 20 seated lists: three large ones and seventeen with two seats (120 in all)
    const items = [{ id: 'A', n: 36 }, { id: 'B', n: 30 }, { id: 'C', n: 20 }, ...Array.from({ length: 17 }, (_, i) => ({ id: `s${i}`, n: 2 }))];
    const r = minimalWinning(items, 61);
    expect(r.truncated).toBe(false);
    expect(r.coalitions).toEqual(brute(items, 61, []));
    expect(minimalWinning(items, 61, [], 10).truncated).toBe(true);
  });
});
