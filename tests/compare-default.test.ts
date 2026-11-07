import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { ElectionDataset, ElectionIndexEntry } from '../src/data/schema.ts';
import { Compare } from '../src/app/components/Compare.tsx';
import { baselineOf, allocationOf } from '../src/app/derive.ts';
import { getState, setState } from '../src/app/store.ts';
import { LangContext } from '../src/app/i18n.ts';

// Server rendering has no subscription lifecycle; read each real store snapshot.
vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useSyncExternalStore: (_subscribe: unknown, snapshot: () => unknown) => snapshot() };
});

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const datasets = { k26: load('k26'), k25: load('k25'), k1: load('k1') };
const elections: ElectionIndexEntry[] = JSON.parse(readFileSync('public/data/elections.json', 'utf8'));
elections.sort((a, b) => b.date.localeCompare(a.date));
beforeEach(() => setState({ datasets, elections, compareWith: 'auto', saved: [], reference: null, markOfficial: false }));
function render(id: keyof typeof datasets = 'k26', edited = false) {
  const ds = datasets[id], base = baselineOf(ds);
  const s = edited ? { ...base, registered: base.registered + 1 } : base;
  return renderToStaticMarkup(createElement(LangContext.Provider, { value: 'en' }, createElement(Compare, { s, r: allocationOf(s), base, ds })));
}
// the workbench is its own lazy chunk: start loading it once, so server rendering returns the panel, not its fallback
beforeAll(async () => {
  setState({ datasets, elections, compareWith: 'auto', saved: [], reference: null, markOfficial: false });
  render();
  await import('../src/app/compare/Workbench.tsx');
  await new Promise((r) => setTimeout(r, 0));
});
it('opens an unchanged result on the previous election without writing the target', () => {
  expect(render()).toContain('data-value="election:k25"');
  expect(getState().compareWith).toBe('auto');
});
it('uses the same default with saved scenarios', () => {
  setState({ saved: [{ id: 'saved', name: 'Saved', electionId: 'k26', savedAt: '', baseBuiltAt: '', log: [] }] });
  expect(render()).toContain('data-value="election:k25"');
});
it('shows scenario versus official after an edit and returns on undo', () => {
  expect(render('k26', true)).toContain('data-value="historical"');
  expect(render()).toContain('data-value="election:k25"');
});
it.each(['historical', 'official', 'election:k1', 'saved'])('respects the explicit target %s', target => {
  setState({ compareWith: target, saved: [{ id: 'saved', name: 'Saved', electionId: 'k26', savedAt: '', baseBuiltAt: '', log: [] }] });
  const html = render();
  if (target === 'election:k1') expect(html).toContain('data-value="election:k1"');
  else expect(html).toContain('cmp-empty');
});
it('retains the chooser for the earliest election', () => {
  expect(render('k1')).toContain('cmp-empty');
  expect(render('k1')).not.toContain('cmp-chambers');
});
it('compares an unchanged active reference with the previous election', () => {
  const base = baselineOf(datasets.k26);
  setState({ reference: { ...base, name: 'Reference' } });
  expect(render()).toContain('data-value="election:k25"');
});
