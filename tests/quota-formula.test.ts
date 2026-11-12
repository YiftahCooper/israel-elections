import { describe, expect, it } from 'vitest';
import { quotaFormula } from '../src/app/derive.ts';
import type { SimRules } from '../src/model/scenario.ts';

// The Overview's "Votes per seat" card once wrote the 1949 quota as ÷ 120 beside a figure that is right only for ÷ 121.
const rules = (over: Partial<SimRules>) => ({ seats: 120, quotaRounding: 'floor', remainderMethod: 'bader-ofer', ...over }) as SimRules;
const none = { warnings: [] };

describe('the quota written out', () => {
  it('divides by the seats plus one under the 1949 rules', () => {
    const q = quotaFormula(none, rules({ quotaSeatOffset: 1, remainderMethod: 'largest-remainder' }), 434684n, 120);
    expect(q).toEqual({ text: '⌊ 434,684 ÷ 121 ⌋', divisor: 121 });
    expect(434684n / 121n).toBe(3592n);
  });
  it('divides by the seats under today’s rules', () => {
    expect(quotaFormula(none, rules({}), 4764742n, 120)).toEqual({ text: '⌊ 4,764,742 ÷ 120 ⌋', divisor: 120 });
  });
  it('writes the Droop quota with its added one', () => {
    expect(quotaFormula(none, rules({ remainderMethod: 'droop' }), 10000n, 5)).toEqual({ text: '⌊ 10,000 ÷ 6 ⌋ + 1', divisor: 6 });
  });
  it('shows the exact fallback when the rounded quota over-allocates', () => {
    const r = { warnings: [{ code: 'quota-over-allocation', message: '', data: { initialTotal: 121 } }] } as never;
    expect(quotaFormula(r, rules({ quotaSeatOffset: 1 }), 500n, 120)).toEqual({ text: '500 ÷ 120', divisor: 120 });
  });
});
