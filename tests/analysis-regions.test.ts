// The exact skipping in minimalChange/sweepVotes rests on one property of the engine's recorded
// decisions (PreparedAllocation.run's `decisions`): when every list's votes move linearly with a
// count k (new voters, or a transfer between two lists), the counts sharing one decision record form
// a contiguous range, and the record determines every list's seats and qualification. This test
// checks that property vote by vote on random elections under every rule semantic.
// REGION_CASES=5000 npx vitest run tests/analysis-regions.test.ts runs a longer check.
import { expect, it } from 'vitest';
import { prepareAllocation } from '../src/engine/allocate.ts';
import { RULESETS } from '../src/engine/rules.ts';
import type { AllocationInput } from '../src/engine/types.ts';
import { randomRules, rng, type Modules } from './differential.cases.ts';

const presets = { RULESETS } as Modules;

/** k ↦ votes for one linear family: target ± k, and the other list ∓ k for a transfer */
function family(r: ReturnType<typeof rng>, input: AllocationInput) {
  const n = input.lists.length;
  const t = r.int(n); const o = r.int(n);
  const transfer = o !== t && r.chance(0.6);
  const sign = r.chance(0.7) ? 1n : -1n;
  const base = input.lists.map((l) => l.votes);
  return (k: bigint) => {
    const v = [...base];
    v[t] += sign * k; if (transfer) v[o] -= sign * k;
    return v.some((x) => x < 0n) ? null : v;
  };
}

it('decision records are contiguous in k and determine seats and qualification', () => {
  const r = rng(0xd3c1);
  let checked = 0;
  const cases = Number(process.env.REGION_CASES ?? 200);
  for (let c = 0; c < cases; c++) {
    const rules = { ...(r.chance(0.5) ? r.pick(Object.values(RULESETS)) : randomRules(r, presets)) };
    // the experimental methods added on 4 Nov 2026 (not in the digest-locked corpus) must keep the property too
    if (c % 3 === 2) rules.remainderMethod = (['dhondt', 'modified-sainte-lague', 'droop'] as const)[c % 9 === 2 ? 0 : c % 9 === 5 ? 1 : 2];
    const n = 2 + r.int(7);
    const scale = r.pick([300, 3000, 30000]);
    const lists = Array.from({ length: n }, (_, i) => ({ id: `L${i}`, votes: BigInt(r.int(scale)), ...(r.chance(0.3) ? { candidateCount: r.int(40) } : {}), ...(r.chance(0.05) ? { withdrawn: true } : {}) }));
    const agreements = [];
    for (let i = 0; i + 1 < n; i += 2) if (r.chance(0.5)) agreements.push({ id: `P${i}`, members: [`L${i}`, `L${i + 1}`] });
    const input: AllocationInput = { rules: { ...rules, seats: r.pick([rules.seats, 7, 13, 25]) }, lists, agreements };
    const p = prepareAllocation(input);
    const votesAt = family(r, input);
    const from = BigInt(r.int(2 * scale)); const to = from + BigInt(Math.min(2 * scale, 3000));
    const firstSeen = new Map<string, bigint>(); const lastSeen = new Map<string, bigint>(); const outcome = new Map<string, string>();
    let previous: string | null = null;
    for (let k = from; k <= to; k++) {
      const v = votesAt(k);
      if (!v) { previous = null; continue; }
      const decisions: unknown[] = [];
      const res = p.run(v, false, decisions);
      const key = decisions.map(String).join(',');
      const seats = res.lists.map((l) => `${l.seats}${l.qualified ? 'q' : ''}`).join(',');
      if (outcome.has(key)) {
        expect(seats, `case ${c} k=${k}: equal records, different seats`).toBe(outcome.get(key));
        // a record seen before must continue the run that ended at the previous count
        expect(previous, `case ${c} k=${k}: record recurs after a gap (first at ${firstSeen.get(key)}, last at ${lastSeen.get(key)})`).toBe(key);
      } else { outcome.set(key, seats); firstSeen.set(key, k); }
      lastSeen.set(key, k);
      previous = key;
      checked++;
    }
  }
  expect(checked).toBeGreaterThan(cases * 300);
}, 600_000);
