// Compare's two sides. The right side IS the main scenario (an edit there is an Overview edit, with the same undo);
// the other side is a separate draft per comparator, kept for the session with its own undo, redo and Start over.
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import { ActionError, applyAction } from '../../model/actions.ts';
import { validAction, type Action, type Scenario } from '../../model/scenario.ts';
import { baselineOf } from '../factionDefaults.ts';
import { getState, loadDataset, openElection, replay, setState, toast } from '../store.ts';
import type { MatchOverride } from './match.ts';

/** Owner default (7 Nov): the main scenario is the right-hand side; Swap only changes which side is drawn where. */
export const COMPARE_MAIN_SIDE: 'left' | 'right' = 'right';
/** Owner default (7 Nov): copy arrows show on hover, focus or selection; on touch screens (no hover) always. */
export const COPY_ARROWS: 'hover' | 'always' = 'hover';

const ELECTION = 'election:';
/** The draft key of a comparator: another election is the same draft whatever is open; this election's choices are per election. */
export const sideKey = (mainElection: ElectionId, value: string) => value.startsWith(ELECTION) ? value : `${mainElection}:${value}`;
export const pairKey = (a: ElectionId, b: ElectionId) => [a, b].sort().join('|');

/** Undo, redo and Start over for the other side; each copy into it is one step. */
export function dispatchSide(key: string, start: Scenario, ctxBase: Scenario, action: Action): boolean {
  const st = getState();
  const cur = st.compare.drafts[key] ?? { scenario: start, past: [], future: [], reference: start };
  try {
    const next = applyAction(cur.scenario, action, undefined, { base: ctxBase });
    setState({ compare: { ...st.compare, drafts: { ...st.compare.drafts, [key]: { ...cur, scenario: next, past: [...cur.past.slice(-199), cur.scenario], future: [] } } } });
    return true;
  } catch (e) {
    toast('error', e instanceof ActionError ? e.message : String(e));
    return false;
  }
}
export function undoSide(key: string) {
  const st = getState(), d = st.compare.drafts[key];
  if (!d?.past.length) return;
  setState({ compare: { ...st.compare, drafts: { ...st.compare.drafts, [key]: { ...d, scenario: d.past.at(-1)!, past: d.past.slice(0, -1), future: [d.scenario, ...d.future] } } } });
}
export function redoSide(key: string) {
  const st = getState(), d = st.compare.drafts[key];
  if (!d?.future.length) return;
  setState({ compare: { ...st.compare, drafts: { ...st.compare.drafts, [key]: { ...d, scenario: d.future[0], past: [...d.past, d.scenario], future: d.future.slice(1) } } } });
}
/** Back to the side's starting point, as one undoable step. */
export function startOverSide(key: string) {
  const st = getState(), d = st.compare.drafts[key];
  if (!d || d.scenario === d.reference) return;
  setState({ compare: { ...st.compare, drafts: { ...st.compare.drafts, [key]: { ...d, scenario: d.reference!, past: [...d.past, d.scenario], future: [] } } } });
}
export function setSwap(swap: boolean) { const st = getState(); setState({ compare: { ...st.compare, swap } }); }
export function setOverrides(pair: string, list: MatchOverride[]) { const st = getState(); setState({ compare: { ...st.compare, overrides: { ...st.compare.overrides, [pair]: list } } }); }

// ---- share link (#c=): both sides as their change logs, plus the pairings. Same encoding as the scenario link (#s=).
const b64url = (bytes: Uint8Array) => { let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) { return new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer()); }

/** One side of a shared or saved comparison: the election, a name and the change log (empty: the official result). */
export interface SideLink { e: ElectionId; n: string; f: boolean; l: Action[] }
export interface ComparisonLink { v: 1; main: SideLink; other: SideLink; swap: boolean | null; m: MatchOverride[] }
const sideOf = (s: Scenario): SideLink => ({ e: s.electionId, n: s.name, f: s.factionSplitBaseline ?? false, l: s.log.map((x) => x.action) });
export const comparisonOf = (main: Scenario, other: Scenario, swap: boolean | null, m: MatchOverride[]): ComparisonLink => ({ v: 1, main: sideOf(main), other: sideOf(other), swap, m });

export async function comparisonLink(c: ComparisonLink): Promise<string> {
  const z = await pipe(new TextEncoder().encode(JSON.stringify(c)), new CompressionStream('deflate-raw'));
  return `${location.origin}${location.pathname}#c=${b64url(z)}`;
}
const validSide = (x: unknown): x is SideLink => !!x && typeof x === 'object' && typeof (x as SideLink).e === 'string' && typeof (x as SideLink).n === 'string' && Array.isArray((x as SideLink).l) && (x as SideLink).l.every(validAction);
export async function readComparison(hash: string): Promise<ComparisonLink | null> {
  const m = hash.match(/#c=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const c = JSON.parse(new TextDecoder().decode(await pipe(unb64url(m[1]), new DecompressionStream('deflate-raw'))));
    return c?.v === 1 && validSide(c.main) && validSide(c.other) && Array.isArray(c.m) ? c : null;
  } catch { return null; }
}

/** Opens a comparison: the main side as the open scenario (unsaved, named as shared), the other side as Compare's draft. */
export async function openComparison(c: ComparisonLink): Promise<boolean> {
  const he = getState().lang === 'he';
  if (!(await openElection(c.main.e, { name: c.main.n || (he ? 'תרחיש משותף' : 'Shared scenario'), log: c.main.l, factionSplitBaseline: c.main.f }))) return false;
  let ods: ElectionDataset;
  try { ods = await loadDataset(c.other.e); } catch { return false; }
  const value = c.other.e === c.main.e ? 'official' : `${ELECTION}${c.other.e}`;
  const key = sideKey(c.main.e, value);
  const start = baselineOf(ods);
  const drafts = { ...getState().compare.drafts };
  if (c.other.l.length) {
    const r = replay(ods, c.other.n, c.other.l, c.other.f);
    drafts[key] = { scenario: r.scenario, past: [], future: [], reference: start };
  } else delete drafts[key];
  const st = getState();
  setState({ tool: 'compare', compareWith: value, compare: { drafts, swap: c.swap, overrides: c.m.length ? { ...st.compare.overrides, [pairKey(c.main.e, c.other.e)]: c.m } : st.compare.overrides } });
  return true;
}

/** Address-bar links: a comparison (#c=) or, otherwise, the scenario link handler. */
export async function openComparisonFromHash(): Promise<boolean> {
  if (!/^#c=/.test(location.hash)) return false;
  const c = await readComparison(location.hash);
  if (!c || !(await openComparison(c))) {
    history.replaceState(null, '', location.pathname + location.search);
    toast('error', getState().lang === 'he' ? 'קישור ההשוואה פגום או חלקי; לא נפתחה השוואה.' : 'This comparison link is damaged or incomplete; no comparison was opened.');
    return false;
  }
  history.replaceState(null, '', location.pathname + location.search);
  return true;
}

// ---- saved comparisons (this browser): both sides and the pairings, reopened from Compare's head
const SAVED = 'israel-elections:comparisons';
export interface SavedComparison { id: string; name: string; savedAt: string; link: ComparisonLink }
export function savedComparisons(): SavedComparison[] {
  try { const x = JSON.parse(localStorage.getItem(SAVED) ?? '[]'); return Array.isArray(x) ? x.filter((c) => c && typeof c.name === 'string' && c.link?.v === 1) : []; } catch { return []; }
}
export function saveComparison(name: string, link: ComparisonLink): boolean {
  const list = savedComparisons().filter((c) => c.name !== name);
  try { localStorage.setItem(SAVED, JSON.stringify([{ id: crypto.randomUUID(), name, savedAt: new Date().toISOString(), link }, ...list])); return true; } catch { return false; }
}
export function deleteComparison(id: string) { try { localStorage.setItem(SAVED, JSON.stringify(savedComparisons().filter((c) => c.id !== id))); } catch { /* storage refused */ } }

