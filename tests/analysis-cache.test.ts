import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
// Results worked out by other code (another version of the engine or the analysis tasks) are never read, and are
// cleared when a new result is kept (audit c-analysis-code-07: the version follows the build, it is not bumped by hand).
test('results kept by an earlier version are never read and are cleared', async () => {
  const store: Record<string, string> = {};
  Object.defineProperties(store, {
    getItem: { value: (k: string) => store[k] ?? null }, setItem: { value: (k: string, v: string) => { store[k] = v; } },
    removeItem: { value: (k: string) => { delete store[k]; } },
  });
  vi.stubGlobal('localStorage', store);
  const { retainAnalysis, ANALYSIS_VERSION } = await import('../src/app/analysisCache.ts');
  const prefix = `israel-elections:analysis:${ANALYSIS_VERSION}:`;
  retainAnalysis('version-check', { votes: 1n });
  const now = Object.keys(store).find((k) => k !== `${prefix}index`)!;
  expect(now.startsWith(prefix)).toBe(true);
  const old = now.replace(`:${ANALYSIS_VERSION}:`, ':v2:');
  store[old] = store[now]; delete store[now];
  vi.resetModules();
  const fresh = await import('../src/app/analysisCache.ts');
  expect(fresh.readAnalysis('version-check')).toBeUndefined();
  store['israel-elections:v1'] = '{}';
  fresh.retainAnalysis('another', { votes: 2n });
  expect(Object.keys(store).filter((k) => k.startsWith('israel-elections:analysis:')).every((k) => k.startsWith(prefix))).toBe(true);
  expect(store['israel-elections:v1']).toBe('{}');
});

test('c-analysis-code-07: the cache version is the hash of the engine and analysis sources, and changes with them', async () => {
  const { analysisVersion, ANALYSIS_SOURCES } = await import('../scripts/analysis-version.ts');
  const { ANALYSIS_VERSION } = await import('../src/app/analysisCache.ts');
  // the app is built with the version of the code it runs (vite.config.ts define)
  expect(ANALYSIS_VERSION).toBe(analysisVersion());
  // any change to any of those files gives another version
  const root = mkdtempSync(join(tmpdir(), 'analysis-version-'));
  try {
    for (const src of ANALYSIS_SOURCES) cpSync(src, join(root, src), { recursive: true });
    expect(analysisVersion(root)).toBe(ANALYSIS_VERSION);
    for (const file of ['src/engine/allocate.ts', 'src/engine/analysis.ts', 'src/app/analysisTasks.ts']) {
      const path = join(root, file), text = readFileSync(path, 'utf8');
      writeFileSync(path, text.replace('export', 'export ')); // a one-character change
      expect(analysisVersion(root), file).not.toBe(ANALYSIS_VERSION);
      writeFileSync(path, text);
    }
    expect(analysisVersion(root)).toBe(ANALYSIS_VERSION);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

/** A browser storage that holds at most `quota` characters, keys and values together, as browsers do. */
function quotaStorage(quota: number) {
  const data = new Map<string, string>();
  const used = () => [...data].reduce((n, [k, v]) => n + k.length + v.length, 0);
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { const before = data.get(k); data.set(k, v); if (used() > quota) { if (before === undefined) data.delete(k); else data.set(k, before); throw new DOMException('full', 'QuotaExceededError'); } },
    removeItem: (k: string) => void data.delete(k),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
  };
  return { storage: new Proxy(storage, { ownKeys: () => [...data.keys()], getOwnPropertyDescriptor: (_, k) => (data.has(String(k)) ? { enumerable: true, configurable: true, value: data.get(String(k)) } : undefined) }), data, used };
}

test('c-analysis-code-04: the cache stays within its budget, oldest out first', async () => {
  const { storage, data } = quotaStorage(20_000_000);
  vi.stubGlobal('localStorage', storage);
  const { retainAnalysis, readAnalysis, STORED_CHARS, STORED_ENTRIES } = await import('../src/app/analysisCache.ts');
  const big = 'x'.repeat(150_000); // about the size of one list panel's results
  for (let i = 0; i < 60; i++) retainAnalysis(`panel-${i}`, big);
  const kept = [...data].filter(([k]) => k.startsWith('israel-elections:analysis:') && !k.endsWith(':index'));
  expect(kept.length).toBeLessThanOrEqual(STORED_ENTRIES);
  expect(kept.reduce((n, [, v]) => n + v.length, 0)).toBeLessThanOrEqual(STORED_CHARS);
  vi.resetModules(); // a later visit reads the newest back from storage, not the oldest
  const later = await import('../src/app/analysisCache.ts');
  expect(later.readAnalysis('panel-59')).toBe(big);
  expect(later.readAnalysis('panel-0')).toBeUndefined();
  for (let i = 0; i < 60; i++) retainAnalysis(`small-${i}`, i);
  expect([...data.keys()].filter((k) => k.startsWith('israel-elections:analysis:') && !k.endsWith(':index')).length).toBeLessThanOrEqual(STORED_ENTRIES);
  expect(readAnalysis('small-59')).toBe(59);
});
