import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { sweepThreshold } from '../src/engine/analysis.ts';
import { runTask } from '../src/app/analysisTasks.ts';
import { rat } from '../src/engine/rational.ts';

beforeEach(() => { const data: Record<string, string> = {}; vi.stubGlobal('localStorage', { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; }, removeItem: (k: string) => { delete data[k]; } }); });
afterEach(() => { vi.unstubAllGlobals(); });
for (const id of ['k1', 'k25', 'k26']) test(`${id}: persisted sweep and threshold results equal live exact arithmetic`, async () => {
  const { retainAnalysis } = await import('../src/app/analysisCache.ts');
  const s = scenarioFromDataset(JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')));
  const input = toEngineInput(s), target = s.lists[0];
  const task = { kind: 'sweep' as const, input, target: target.id, from: BigInt(target.votes), to: BigInt(target.votes + 10) };
  const live = runTask(task);
  retainAnalysis(task, live);
  const key = { kind: 'threshold', input, loR: rat(1, 100), hiR: rat(5, 100) };
  const threshold = sweepThreshold(input, key.loR, key.hiR);
  retainAnalysis(key, threshold);
  vi.resetModules(); // fresh memory: read back the browser-persisted result, including bigints
  const { readAnalysis } = await import('../src/app/analysisCache.ts');
  expect(readAnalysis(task)).toEqual(live);
  expect(readAnalysis(key)).toEqual(threshold);
  expect(readAnalysis({ ...task, to: task.to + 1n })).toBeUndefined();
});
test('denied storage still computes and reuses memory', async () => {
  vi.stubGlobal('localStorage', { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } });
  const { cachedAnalysis } = await import('../src/app/analysisCache.ts');
  const compute = vi.fn(() => ({ votes: 9n }));
  expect(cachedAnalysis('denied-storage', compute)).toEqual({ votes: 9n });
  expect(cachedAnalysis('denied-storage', compute)).toEqual({ votes: 9n });
  expect(compute).toHaveBeenCalledTimes(1);
});
// results kept before the search fixes of 12 Nov 2026 (complete sweeps, settled flips, the candidate cap) are not read,
// and are cleared when a new result is kept (audit c-analysis-code-01 to -03; the cache comment asks for a bump)
test('results kept by an earlier version are never read and are cleared', async () => {
  const store: Record<string, string> = {};
  Object.defineProperties(store, {
    getItem: { value: (k: string) => store[k] ?? null }, setItem: { value: (k: string, v: string) => { store[k] = v; } },
    removeItem: { value: (k: string) => { delete store[k]; } },
  });
  vi.stubGlobal('localStorage', store);
  const { retainAnalysis } = await import('../src/app/analysisCache.ts');
  retainAnalysis('version-check', { votes: 1n });
  const [now] = Object.keys(store);
  expect(now).toMatch(/^israel-elections:analysis:v2:/);
  const old = now.replace(':v2:', ':v1:');
  store[old] = store[now]; delete store[now];
  vi.resetModules();
  const fresh = await import('../src/app/analysisCache.ts');
  expect(fresh.readAnalysis('version-check')).toBeUndefined();
  store['israel-elections:v1'] = '{}';
  fresh.retainAnalysis('another', { votes: 2n });
  expect(Object.keys(store).sort()).toEqual([expect.stringMatching(/^israel-elections:analysis:v2:/), 'israel-elections:v1']);
});
