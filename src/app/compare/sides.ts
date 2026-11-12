// Compare's two sides. The right side IS the main scenario (an edit there is an Overview edit, with the same undo);
// the other side is a separate draft per comparator, kept for the session with its own undo, redo and Start over.
import { useSyncExternalStore } from 'react';
import { ELECTION_IDS, type ElectionDataset, type ElectionId } from '../../data/schema.ts';
import { applyAction } from '../../model/actions.ts';
import { errorText } from '../../model/messages.ts';
import { validAction, type Action, type Scenario } from '../../model/scenario.ts';
import { baselineOf } from '../factionDefaults.ts';
import { getState, loadDataset, noteStorageLoss, openElection, replay, setState, toast } from '../store.ts';
import type { MatchOverride } from './match.ts';

/** Owner default (7 Nov): a list row's copy button (once arrows, now "Copy votes…") shows on hover, focus or selection;
 *  on touch screens (no hover) always. The key numbers' Copy buttons always show. */
export const COPY_ARROWS: 'hover' | 'always' = 'hover';

const ELECTION = 'election:';
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
    toast('error', errorText(e, getState().lang));
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
export function setOverrides(pair: string, list: MatchOverride[]) { const st = getState(); setState({ compare: { ...st.compare, overrides: { ...st.compare.overrides, [pair]: list } } }); }

// ---- share link (#c=): both sides as their change logs, plus the pairings. Same encoding as the scenario link (#s=).
const b64url = (bytes: Uint8Array) => { let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) { return new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer()); }

/** One side of a shared or saved comparison: the election, a name and the change log (empty: the official result). */
export interface SideLink { e: ElectionId; n: string; f: boolean; l: Action[] }
export interface ComparisonLink { v: 1; main: SideLink; other: SideLink; m: MatchOverride[] }
const sideOf = (s: Scenario): SideLink => ({ e: s.electionId, n: s.name, f: s.factionSplitBaseline ?? false, l: s.log.map((x) => x.action) });
export const comparisonOf = (main: Scenario, other: Scenario, m: MatchOverride[]): ComparisonLink => ({ v: 1, main: sideOf(main), other: sideOf(other), m });

export async function comparisonLink(c: ComparisonLink): Promise<string> {
  const z = await pipe(new TextEncoder().encode(JSON.stringify(c)), new CompressionStream('deflate-raw'));
  return `${location.origin}${location.pathname}#c=${b64url(z)}`;
}
/** Copies a comparison's link and says so (Compare's head and the Scenarios page). */
export async function copyComparisonLink(c: ComparisonLink) {
  const he = getState().lang === 'he';
  try { await navigator.clipboard.writeText(await comparisonLink(c)); toast('info', he ? 'הקישור הועתק. הוא פותח את שני הצדדים ואת ההתאמות שלכם.' : 'Link copied. It opens both sides and your pairings.'); }
  catch { toast('error', he ? 'הדפדפן סירב להעתיק את הקישור.' : 'The browser refused to copy the link.'); }
}
const validSide = (x: unknown): x is SideLink => !!x && typeof x === 'object' && ELECTION_IDS.includes((x as SideLink).e) && typeof (x as SideLink).n === 'string' && Array.isArray((x as SideLink).l) && (x as SideLink).l.every(validAction);
const validLink = (c: unknown): c is ComparisonLink => !!c && typeof c === 'object' && (c as ComparisonLink).v === 1 && validSide((c as ComparisonLink).main) && validSide((c as ComparisonLink).other) && Array.isArray((c as ComparisonLink).m);
export async function readComparison(hash: string): Promise<ComparisonLink | null> {
  const m = hash.match(/#c=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const c = JSON.parse(new TextDecoder().decode(await pipe(unb64url(m[1]), new DecompressionStream('deflate-raw'))));
    return validLink(c) ? c : null;
  } catch { return null; }
}

/** Opens a comparison: the main side as the open scenario (unsaved, named as shared), the other side as the reference
 *  (its changes as the reference's Side by side draft), on the Side by side page. */
export async function openComparison(c: ComparisonLink): Promise<boolean> {
  const he = getState().lang === 'he';
  if (!(await openElection(c.main.e, { name: c.main.n || (he ? 'תרחיש משותף' : 'Shared scenario'), log: c.main.l, factionSplitBaseline: c.main.f }))) return false;
  let ods: ElectionDataset;
  try { ods = await loadDataset(c.other.e); } catch { return false; }
  const value = c.other.e === c.main.e ? 'official' : `${ELECTION}${c.other.e}`;
  const key = c.other.e === c.main.e ? `official:${c.other.e}` : value;
  const start = baselineOf(ods);
  const drafts = { ...getState().compare.drafts };
  if (c.other.l.length) {
    const r = replay(ods, c.other.n, c.other.l, c.other.f);
    drafts[key] = { scenario: r.scenario, past: [], future: [], reference: start };
  } else delete drafts[key];
  const st = getState();
  setState({ tool: 'compare', comparing: value, compare: { ...st.compare, drafts, back: st.tool === 'compare' ? st.compare.back : st.tool, overrides: c.m.length ? { ...st.compare.overrides, [pairKey(c.main.e, c.other.e)]: c.m } : st.compare.overrides } });
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
const validSaved = (c: unknown): c is SavedComparison => !!c && typeof c === 'object' && typeof (c as SavedComparison).id === 'string' && typeof (c as SavedComparison).name === 'string'
  && typeof (c as SavedComparison).savedAt === 'string' && validLink((c as SavedComparison).link);
const SAVED = 'israel-elections:comparisons';
export interface SavedComparison { id: string; name: string; savedAt: string; link: ComparisonLink }
/** The readable saved comparisons; any that cannot be read are left out and said to be (once, in the storage line). */
const read = (): SavedComparison[] => {
  let raw: string | null;
  try { raw = localStorage.getItem(SAVED); } catch { return []; } // storage blocked: nothing to read
  if (raw === null) return [];
  let x: unknown;
  try { x = JSON.parse(raw); } catch { x = null; }
  const ok = Array.isArray(x) ? x.filter(validSaved) : [];
  const lost = Array.isArray(x) ? x.length - ok.length : -1;
  // read while a screen renders, so it is reported (and the readable ones kept on their own) just after
  if (lost) queueMicrotask(() => { try { localStorage.setItem(SAVED, JSON.stringify(ok)); } catch { /* refused: said again next time */ } noteStorageLoss({ comparisons: lost }); });
  return ok;
};
// one snapshot, refreshed on every change here, so Compare's picker and the Scenarios page stay in step
let cache: SavedComparison[] | null = null;
const listeners = new Set<() => void>();
const changed = () => { cache = null; listeners.forEach((f) => f()); };
export const savedComparisons = (): SavedComparison[] => (cache ??= read());
export const useSavedComparisons = () => useSyncExternalStore((f) => { listeners.add(f); return () => { listeners.delete(f); }; }, savedComparisons, savedComparisons);
export function saveComparison(name: string, link: ComparisonLink): boolean {
  const list = savedComparisons().filter((c) => c.name !== name);
  try { localStorage.setItem(SAVED, JSON.stringify([{ id: crypto.randomUUID(), name, savedAt: new Date().toISOString(), link }, ...list])); changed(); return true; } catch { return false; }
}
export function deleteComparison(id: string) { try { localStorage.setItem(SAVED, JSON.stringify(savedComparisons().filter((c) => c.id !== id))); changed(); } catch { /* storage refused */ } }
