// After the election's research records (data/meta/aftermath/kN.json), one chunk per election, fetched the first time
// a page needs that election's record (After the election, Coalitions, Sources) or when the page is idle with that tab
// in reach. Until it arrives the panel shows the tab's own loading line (the Suspense fallback around every tool page).
// Tests read every record at once through src/data/aftermath-runtime.ts.
import { use } from 'react';
import type { Aftermath } from '../data/aftermath-model.ts';
import type { ElectionId } from '../data/schema.ts';
import { rememberFailedCode } from './failedCode.ts';

const files = import.meta.glob<Aftermath>('../../data/meta/aftermath/k*.json', { import: 'default' });
const fileOf = new Map(Object.entries(files).map(([path, load]) => [path.match(/(k\d+)\.json$/)![1], load]));
/** records already here (an election without a file is known at once to have none) */
const records = new Map<string, Aftermath | undefined>();
const pending = new Map<string, Promise<unknown>>();

/** Starts fetching an election's record (a no-op once it is here or on its way). One retry for a dropped request; a
 *  second failure reaches the panel's error boundary and stays failed until Try again or opening a tab asks again, as a
 *  tab's code does (src/app/App.tsx, lazyPanel). */
export function loadAftermath(id: ElectionId): Promise<unknown> {
  const load = fileOf.get(id);
  if (!load) { records.set(id, undefined); return Promise.resolve(); }
  if (records.has(id)) return Promise.resolve();
  let p = pending.get(id);
  if (!p) {
    p = load().catch(load).then((r) => { records.set(id, r); pending.delete(id); }, (e) => { rememberFailedCode(() => { pending.delete(id); }); throw e; });
    pending.set(id, p);
  }
  return p;
}

/** The reviewed records of these elections (undefined where none is reviewed); suspends until all of them are here.
 *  Every fetch starts before the first wait, so two records arrive together rather than one after the other. */
export function useReviewedAftermath(...ids: ElectionId[]): (Aftermath | undefined)[] {
  const waits = ids.map((id) => records.has(id) || !fileOf.has(id) ? null : loadAftermath(id));
  for (const w of waits) if (w) use(w);
  return ids.map((id) => { const r = records.get(id); return r?.status === 'reviewed' ? r : undefined; });
}
