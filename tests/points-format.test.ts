// A non-zero percentage or point change is never written as 0 (audit 12 Nov 2026, ax-screens-d-04): the Localities
// map's hover text rounded Givat Shmuel's 3-vote lead in 2022 to "+0 pp" while its selected result said "<1 pp".
import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { fmtPctNum, fmtPoints, nonZeroFixed, trimDecimal } from '../src/app/format.ts';

test('the 2022 Givat Shmuel lead reads <1 pp at no decimals, as the selected locality does', () => {
  const data = JSON.parse(readFileSync(new URL('../public/data/k25-localities.json', import.meta.url), 'utf8')) as { rows: { code: number; valid: number; votes: number[] }[] };
  const row = data.rows.find(r => r.code === 681)!;
  const [first, second] = [...row.votes].sort((a, b) => b - a);
  expect(first - second).toBe(3);
  const lead = (first - second) / row.valid * 100;
  expect(trimDecimal(lead.toFixed(0))).toBe('0'); // what the hover text used to say
  expect(fmtPoints(lead, 0, true)).toBe('<1');
  expect(fmtPoints(lead, 2, true)).toBe('0.02');
});

test('never a non-zero value as 0, at every decimal setting', () => {
  for (const d of [0, 1, 2, 3]) {
    expect(nonZeroFixed(0, d)).toBe('0');
    expect(Number(nonZeroFixed(10 ** -(d + 2), d).replace('<', ''))).toBeGreaterThan(0);
  }
  expect(nonZeroFixed(0.004, 2)).toBe('<0.01');
  expect(nonZeroFixed(12.5, 2)).toBe('12.5');
  expect(fmtPoints(-0.3, 0)).toBe('−<1');
  expect(fmtPoints(2.25, 1)).toBe('+2.3');
  expect(fmtPctNum(0.3, 0)).toBe('<1%');
  expect(fmtPctNum(64.25, 1)).toBe('64.3%');
  expect(fmtPctNum(100, 2)).toBe('100%');
});
