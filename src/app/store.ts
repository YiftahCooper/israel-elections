// Application state. One authoritative Scenario per open election; everything visible is derived
// from it. Undo/redo keeps whole snapshots (scenarios share unchanged lists structurally).
import { useSyncExternalStore } from 'react';
import type { ElectionDataset, ElectionId } from '../data/schema.ts';
import { ActionError, applyAction } from '../model/actions.ts';
import { scenarioFromDataset, validateScenario, type Action, type ActionContext, type Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import type { SourceChoice } from './voteEdit.ts';

export interface SavedScenario { id: string; name: string; electionId: ElectionId; savedAt: string; baseBuiltAt: string; log: Action[] }

export interface State {
  datasets: Partial<Record<ElectionId, ElectionDataset>>;
  electionId: ElectionId;
  scenario: Scenario | null;
  past: Scenario[];
  future: Scenario[];
  selectedListId: string | null;
  compareWith: string; // 'historical' or a saved scenario id
  lang: Lang;
  theme: 'light' | 'dark';
  level: 'explore' | 'advanced';
  digits: number;
  layout: 'hemicycle' | 'blocks';
  colorBy: 'list' | 'bloc' | 'party';
  saved: SavedScenario[];
  toast: { kind: 'error' | 'info'; text: string } | null;
  loadError: string | null;
  notice: string | null;
  /** how every vote edit on a list is balanced (shared by all vote controls) */
  voteSource: SourceChoice;
  /** per-election work kept while switching elections (scenario + undo history) */
  sessions: Partial<Record<ElectionId, { scenario: Scenario; past: Scenario[]; future: Scenario[] }>>;
}

const LS = 'israel-elections:v1';
const persisted = (() => { try { return JSON.parse(globalThis.localStorage?.getItem(LS) ?? '{}'); } catch { return {}; } })();

let state: State = {
  datasets: {}, electionId: 'k26', scenario: null, past: [], future: [], selectedListId: null, compareWith: 'historical',
  lang: persisted.lang ?? 'he', theme: persisted.theme ?? (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  level: persisted.level ?? 'explore', digits: persisted.digits ?? 2, layout: 'hemicycle', colorBy: 'list',
  saved: persisted.saved ?? [], toast: null, loadError: null, notice: null, voteSource: { kind: 'proportional' }, sessions: {},
};
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
/** Writes settings and saved scenarios; returns false if the browser refused (full or disabled). */
const persist = (): boolean => {
  try { localStorage.setItem(LS, JSON.stringify({ lang: state.lang, theme: state.theme, level: state.level, digits: state.digits, saved: state.saved })); return true; }
  catch { return false; }
};

export const getState = () => state;
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  persist();
  emit();
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => sel(state));
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(kind: 'error' | 'info', text: string) {
  setState({ toast: { kind, text } });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setState({ toast: null }), kind === 'error' ? 7000 : 3500);
}

const baseCache = new WeakMap<ElectionDataset, Scenario>();
/** The historical scenario of a dataset: what reset/restore actions resolve against. */
export function baseContext(ds: ElectionDataset | undefined): ActionContext {
  if (!ds) return {};
  let b = baseCache.get(ds);
  if (!b) { b = scenarioFromDataset(ds, 'historical'); baseCache.set(ds, b); }
  return { base: b };
}

/** Applies an action to the current scenario. Returns false (and shows why) when it is rejected. */
export function dispatch(action: Action): boolean {
  const s = state.scenario;
  if (!s) return false;
  try {
    const next = applyAction(s, action, undefined, baseContext(state.datasets[s.electionId]));
    setState({ scenario: next, past: [...state.past.slice(-199), s], future: [] });
    return true;
  } catch (e) {
    toast('error', e instanceof ActionError ? e.message : String(e));
    return false;
  }
}

/** Applies several actions as one undoable step (all or nothing). */
export function dispatchMany(actions: Action[]): boolean {
  const s = state.scenario;
  if (!s || !actions.length) return false;
  try {
    const ctx = baseContext(state.datasets[s.electionId]);
    const next = actions.reduce((x, a) => applyAction(x, a, undefined, ctx), s);
    setState({ scenario: next, past: [...state.past.slice(-199), s], future: [] });
    return true;
  } catch (e) {
    toast('error', e instanceof ActionError ? e.message : String(e));
    return false;
  }
}

export function undo() {
  const { past, scenario, future } = state;
  if (!past.length || !scenario) return;
  setState({ scenario: past[past.length - 1], past: past.slice(0, -1), future: [scenario, ...future] });
}
export function redo() {
  const { past, scenario, future } = state;
  if (!future.length || !scenario) return;
  setState({ scenario: future[0], past: [...past, scenario], future: future.slice(1) });
}

export async function loadDataset(id: ElectionId): Promise<ElectionDataset> {
  const have = state.datasets[id];
  if (have) return have;
  const res = await fetch(`data/${id}.json`);
  if (!res.ok) throw new Error(`data/${id}.json: HTTP ${res.status}`);
  const ds = (await res.json()) as ElectionDataset;
  setState((s) => ({ datasets: { ...s.datasets, [id]: ds } }));
  return ds;
}

/** Rebuilds a scenario by replaying its action log on the current historical dataset. */
export function replay(ds: ElectionDataset, name: string, log: Action[]): { scenario: Scenario; failed: number } {
  let s = { ...scenarioFromDataset(ds, name) };
  let failed = 0;
  const ctx = baseContext(ds);
  for (const a of log) { try { s = applyAction(s, a, undefined, ctx); } catch { failed++; } }
  return { scenario: s, failed };
}

let openSeq = 0;
export async function openElection(id: ElectionId, from?: { name: string; log: Action[]; baseBuiltAt?: string }) {
  const seq = ++openSeq;
  try {
    const ds = await loadDataset(id);
    if (seq !== openSeq) return; // a later request superseded this one
    // keep the work of the election we are leaving, so switching back restores it (with undo)
    const leaving = state.scenario ? { [state.scenario.electionId]: { scenario: state.scenario, past: state.past, future: state.future } } : {};
    const sessions = { ...state.sessions, ...leaving };
    let scenario = scenarioFromDataset(ds);
    let past: Scenario[] = []; let future: Scenario[] = [];
    let notice: string | null = null;
    if (from) {
      const r = replay(ds, from.name, from.log);
      scenario = r.scenario;
      if (state.scenario?.electionId === id) past = [...state.past, state.scenario];
      const he = state.lang === 'he';
      if (r.failed) notice = he ? `${r.failed} שינויים לא ניתן היה להחיל מחדש על הנתונים הנוכחיים.` : `${r.failed} change(s) could not be re-applied to the current data.`;
      if (from.baseBuiltAt && from.baseBuiltAt !== ds.buildInfo.builtAt) notice = (notice ? notice + ' ' : '') + (he ? 'הנתונים ההיסטוריים נבנו מחדש מאז שהתרחיש נוצר; השינויים הוחלו מחדש על הנתונים הנוכחיים.' : 'The historical data has been rebuilt since this scenario was made; its changes were re-applied to the current data.');
    } else if (sessions[id]) {
      ({ scenario, past, future } = sessions[id]!);
    }
    delete sessions[id];
    setState({ electionId: id, scenario, past, future, sessions, selectedListId: null, compareWith: 'historical', loadError: null, notice });
  } catch (e) {
    if (seq === openSeq) setState({ loadError: String(e) });
  }
}

export function resetAll() {
  const ds = state.datasets[state.electionId];
  if (!ds || !state.scenario) return;
  const fresh = scenarioFromDataset(ds, '');
  setState({ scenario: fresh, past: [...state.past, state.scenario], future: [] });
}

export function saveCurrent(name?: string): boolean {
  const s = state.scenario;
  if (!s) return false;
  const he = state.lang === 'he';
  const entry: SavedScenario = { id: s.id, name: name || s.name || (he ? 'תרחיש' : 'Scenario'), electionId: s.electionId, savedAt: new Date().toISOString(), baseBuiltAt: s.baseBuiltAt, log: s.log.map((e) => e.action) };
  const before = state.saved;
  setState((st) => ({ saved: [entry, ...st.saved.filter((x) => x.id !== s.id)], scenario: { ...s, name: entry.name } }));
  if (!persist()) {
    setState({ saved: before });
    toast('error', he ? 'הדפדפן סירב לשמור (האחסון מלא או חסום). ייצאו את התרחיש כקובץ JSON במקום.' : 'The browser refused to save (storage full or blocked). Export the scenario as a JSON file instead.');
    return false;
  }
  return true;
}

export function duplicateCurrent() {
  const s = state.scenario;
  if (!s) return;
  const he = state.lang === 'he';
  const copy: Scenario = { ...s, id: `${s.electionId}-${Date.now().toString(36)}`, name: `${s.name || (he ? 'תרחיש' : 'Scenario')} (${he ? 'עותק' : 'copy'})` };
  setState({ scenario: copy, past: [...state.past, s], future: [] });
  saveCurrent(copy.name);
}

// ------------------------------------------------------------------ sharing (URL fragment)

const b64url = (bytes: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export async function shareLink(): Promise<string> {
  const s = state.scenario!;
  const payload = JSON.stringify({ e: s.electionId, n: s.name, b: s.baseBuiltAt, l: s.log.map((x) => x.action) });
  const z = await pipe(new TextEncoder().encode(payload), new CompressionStream('deflate-raw'));
  return `${location.origin}${location.pathname}#s=${b64url(z)}`;
}

export async function readSharedFromHash(): Promise<{ electionId: ElectionId; name: string; log: Action[]; baseBuiltAt: string } | null> {
  const m = location.hash.match(/#s=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const raw = await pipe(unb64url(m[1]), new DecompressionStream('deflate-raw'));
    const p = JSON.parse(new TextDecoder().decode(raw));
    return { electionId: p.e, name: p.n ?? '', log: p.l ?? [], baseBuiltAt: p.b };
  } catch { return null; }
}

export function importScenarioJson(text: string): Scenario {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('The file is not valid JSON.'); }
  const problems = validateScenario(parsed);
  if (problems.length) throw new Error(`Cannot import this scenario: ${problems.slice(0, 5).join('; ')}${problems.length > 5 ? '…' : ''}.`);
  return parsed as Scenario;
}

const PROPORTIONAL: SourceChoice = { kind: 'proportional' };
/** The vote source actually in force: Simple mode always balances proportionally. */
export function useVoteSource(): SourceChoice {
  const src = useStore((st) => st.voteSource);
  const advanced = useStore((st) => st.level === 'advanced');
  return advanced ? src : PROPORTIONAL;
}
