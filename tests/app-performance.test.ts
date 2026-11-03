// Performance changes in the interface must not change any figure: the shared number formatter
// matches toLocaleString exactly, and analysis tasks (run in workers, or on the main thread when
// workers are unavailable) give the same results as the direct searches they replaced.
import { describe, expect, it } from 'vitest';
import { goals, minimalChange } from '../src/engine/analysis.ts';
import { allocate } from '../src/engine/allocate.ts';
import { rat } from '../src/engine/rational.ts';
import { fmtInt, fmtRat, signed } from '../src/app/format.ts';
import { runTasks } from '../src/app/analysisPool.ts';
import { partsOf, runTask, securityPart, securityRow, type AnalysisTask, type SecurityItem } from '../src/app/analysisTasks.ts';
import { toVoteSource } from '../src/app/voteEdit.ts';
import { simple } from './helpers.ts';

describe('shared number formatter', () => {
  const numbers = [0, -0, 1, -1, 7, 999, 1000, 1001, -1234567, 2_147_483_648, Number.MAX_SAFE_INTEGER, 0.4, 0.5, 1.5, -0.4, -2.5, 1e21, NaN, Infinity, -Infinity];
  const bigints = [0n, 1n, -1n, 999n, 1000n, -1234567n, 12345678901234567890123n];
  it('fmtInt is identical to Math.round(n).toLocaleString / n.toLocaleString for en-US', () => {
    for (const n of numbers) expect(fmtInt(n)).toBe(Math.round(n).toLocaleString('en-US'));
    for (const n of bigints) expect(fmtInt(n)).toBe(n.toLocaleString('en-US'));
  });
  it('signed and fmtRat keep their exact output', () => {
    for (const n of [0, 3, -2, 12345, -1234567]) expect(signed(n)).toBe(`⁦${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n).toLocaleString('en-US')}⁩`);
    expect(fmtRat(rat(123456789n, 100n), 2)).toBe('1,234,567.89');
    expect(fmtRat(rat(-5000001n, 2n), 1)).toBe('-2,500,000.5');
  });
});

describe('seat-security tasks', () => {
  // three lists: one comfortably in, one in by a few hundred votes, one below the 3.25% threshold
  const input = simple({ A: 60_000, B: 30_000, C: 3_500, D: 2_600 });
  const res = allocate(input);
  const items: SecurityItem[] = res.lists.map((l) => ({ id: l.id, qualified: l.qualified, seats: l.qualified ? l.seats : 0 }));
  const src = toVoteSource({ kind: 'proportional' });

  it('give exactly the minima of the direct searches', () => {
    for (const item of items) {
      const row = securityRow(item, Object.fromEntries(partsOf(item).map((p) => [p, securityPart(input, src, p, item)])));
      if (!item.qualified) {
        const q = minimalChange(input, item.id, src, goals.qualify(item.id));
        expect(row).toEqual({ id: item.id, seats: 0, gain: null, lose: null, qualify: q.found ? Number(q.votes) : null });
      } else {
        const g = minimalChange(input, item.id, src, goals.seatGain(item.id));
        const lo = minimalChange(input, item.id, src, item.seats > 0 ? goals.seatLoss(item.id) : goals.disqualify(item.id), 'lose');
        expect(row).toEqual({ id: item.id, seats: item.seats, gain: g.found ? Number(g.votes) : null, lose: lo.found ? Number(lo.votes) - 1 : null, qualify: null });
      }
    }
    expect(items.some((x) => !x.qualified)).toBe(true);
  });

  it('run every task once on the main thread when workers are unavailable, and stop on request', async () => {
    expect(typeof Worker).toBe('undefined'); // Node: exercises the fallback path
    const tasks: AnalysisTask[] = [
      ...items.flatMap((item) => partsOf(item).map((part) => ({ kind: 'security' as const, input, src, part, item }))),
      { kind: 'groupTransfer', input, from: 'A', to: 'B', ids: ['B', 'C'], n: 61, below: false },
      { kind: 'sweep', input, target: 'C', from: 3_000n, to: 4_000n },
    ];
    const seen = new Map<number, unknown>();
    await new Promise<void>((resolve) => {
      runTasks(tasks, (k, value) => { seen.set(k, value); if (seen.size === tasks.length) resolve(); });
    });
    expect([...seen.keys()].sort((a, b) => a - b)).toEqual(tasks.map((_, k) => k));
    tasks.forEach((task, k) => expect(seen.get(k)).toEqual(runTask(task)));
    const transfer = seen.get(tasks.length - 2) as { found: boolean; votes: bigint | null };
    const direct = minimalChange(input, 'B', { kind: 'transfer', listId: 'A' }, goals.groupSeatsAtLeast(['B', 'C'], 61));
    expect(transfer).toMatchObject({ found: direct.found, votes: direct.votes, exact: direct.exact });

    let calls = 0;
    const stop = runTasks(tasks, () => { calls++; });
    stop();
    await new Promise((r) => setTimeout(r, 50));
    expect(calls).toBe(0);
  });
});
