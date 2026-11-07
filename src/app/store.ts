import { resultDiffs } from '../model/editScopes.ts';
import { nextCopyName, scenarioDirty } from './scenarioDocument.ts';
import { ACTION_CLASSIFICATION, isFactAction, hasAppearance, hasAnalysis, factLog } from '../model/actionClassification.ts';
import { baselineOf, freshScenario, factionDefault, setFactionDefault } from './factionDefaults.ts';
import { validItemAnswers, validAnswers, sourceChoice, sourceValue, type PreferenceAnswers, type PreferenceAsk, type PreferenceId } from './preferences.ts';
import type { Family } from '../families/model.ts';
import { nextScenarioColor } from './scenarioIdentity.ts';
import { PRESETS, type FeatureId, type Visibility } from './features.ts';
// Application state. Undo/redo keeps immutable scenario snapshots; saved scenarios remain action logs.
import { useSyncExternalStore } from 'react';
import type { ElectionDataset, ElectionId, ElectionIndexEntry } from '../data/schema.ts';
import { ActionError, applyAction } from '../model/actions.ts';
import { validAction, scenarioFromDataset, validateScenario, type Action, type ActionContext, type ChangeEntry, type Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import type { SourceChoice } from './voteEdit.ts';

/** Interface level: what is shown, never what is computed. Simple = minimal; Standard = common,
 * consequential edits; Expert = every tool. */
export type Level = 'simple' | 'standard' | 'expert';
const LEVELS: Level[] = ['simple', 'standard', 'expert'];

export interface SavedScenario { id: string; name: string; description?: string; electionId: ElectionId; savedAt: string; baseBuiltAt: string; log: Action[]; factionSplitBaseline?: boolean }

export type ScenarioSession = { scenario: Scenario; past: Scenario[]; future: Scenario[]; reference: Scenario | null };

export interface State {
  /** A historical family lens, independent of scenario edits and browser saves. */
  familyView?: Family | null;
  datasets: Partial<Record<ElectionId, ElectionDataset>>;
  /** every election the project knows about (public/data/elections.json), newest first */
  elections: ElectionIndexEntry[];
  electionId: ElectionId;
  scenario: Scenario | null;
  /** a live, unlogged preview of the scenario while a control is being dragged (committed on release) */
  preview: Scenario | null;
  reference: Scenario | null;
  markOfficial: boolean;
  past: Scenario[];
  future: Scenario[];
  selectedListId: string | null;
  /** the bloc editor beside the chamber, opened on this bloc ('__none': the seats in no bloc), or closed */
  blocPanel: string | null;
  /** the open tool beside the chamber (null: the level's first tool) */
  tool: string | null;
  compareWith: string; // session-only: 'auto', 'historical', 'official', saved id or 'election:<id>'
  lang: Lang;
  theme: 'light' | 'dark';
  level: Level;
  customFeatures: Partial<Record<FeatureId, Visibility>> | null;
  /** the one-line Simple-mode hint was dismissed (remembered across visits) */
  hintDismissed: boolean;
  digits: number;
  layout: 'hemicycle' | 'blocks';
  showComponentSeats: boolean;
  colorBy: 'list' | 'bloc' | 'party';
  saved: SavedScenario[];
  toast: { kind: 'error' | 'info'; text: string } | null;
  /** the last election that failed to load, and why (the previous election stays open) */
  loadError: { id: ElectionId; message: string } | null;
  notice: string | null;
  /** how every vote edit on a list is balanced (shared by all vote controls) */
  voteSource: SourceChoice;
  preferences: PreferenceAnswers;
  settingsOpen?: boolean;
  preferenceAsk: PreferenceAsk | null;
  preferenceFor: Record<string, string> | null;
  /** per-election work kept while switching elections (scenario + undo history) */
  sessions: Partial<Record<ElectionId, ScenarioSession>>;
  /** Unsaved branches shared by the header and phone inspectors; deliberately session-only. */
  scenarioDrafts: Record<string, ScenarioSession>;
}

const LS = 'israel-elections:v1';
/** used until (or if) the election index cannot be loaded: the two elections the app has always had */
const FALLBACK_INDEX: ElectionIndexEntry[] = [
  { id: 'k26', knesset: 26, date: '2026-10-27', nameHe: 'הבחירות לכנסת ה-26', nameEn: 'Election to the 26th Knesset', available: true, status: { stage: 'official-final' } },
  { id: 'k25', knesset: 25, date: '2022-11-01', nameHe: 'הבחירות לכנסת ה-25', nameEn: 'Election to the 25th Knesset', available: true, status: { stage: 'official-final' } },
];

/** Loads the election index; keeps the fallback if it is missing or malformed. */
export async function loadElectionIndex() {
  try {
    const res = await fetch('data/elections.json');
    if (!res.ok) return;
    const rows = (await res.json()) as ElectionIndexEntry[];
    if (!Array.isArray(rows) || !rows.some((r) => r.available)) return;
    setState({ elections: [...rows].sort((a, b) => b.date.localeCompare(a.date)) });
  } catch { /* keep the fallback */ }
}
const ITEM_PREFERENCES_KEY = 'israel-elections:item-preferences';
const rememberedItems = (() => { try { return validItemAnswers(JSON.parse(globalThis.localStorage?.getItem(ITEM_PREFERENCES_KEY) ?? '{}')); } catch { return {}; } })();
const PREFERENCES_KEY = 'israel-elections:preferences';
const rememberedPreferences = (() => { try { const raw = globalThis.localStorage?.getItem(PREFERENCES_KEY); return raw ? validAnswers(JSON.parse(raw)) : {}; } catch { return {}; } })();
setFactionDefault(rememberedPreferences.jointSeats === 'on');
const persisted = (() => { try { return JSON.parse(globalThis.localStorage?.getItem(LS) ?? '{}'); } catch { return {}; } })();

let state: State = {
  datasets: {}, elections: FALLBACK_INDEX, electionId: 'k26', scenario: null, preview: null, reference: null, markOfficial: persisted.markOfficial === true, past: [], future: [], selectedListId: null, blocPanel: null, tool: null, compareWith: 'auto',
  lang: persisted.lang ?? 'he', theme: persisted.theme ?? (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  level: LEVELS.includes(persisted.level) ? persisted.level : 'simple', customFeatures: persisted.customFeatures ?? null, hintDismissed: persisted.hintDismissed === true, digits: persisted.digits ?? 2, layout: 'hemicycle', colorBy: 'list', showComponentSeats: persisted.showComponentSeats !== false,
  saved: persisted.saved ?? [], toast: null, loadError: null, notice: null, voteSource: sourceChoice(rememberedPreferences.voteSource ?? 'proportional'), preferences: rememberedPreferences, preferenceAsk: null, preferenceFor: rememberedItems, sessions: {}, scenarioDrafts: {},
};
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
/** Writes settings and saved scenarios; returns false if the browser refused (full or disabled). */
const persist = (): boolean => {
  try { localStorage.setItem(LS, JSON.stringify({ lang: state.lang, theme: state.theme, level: state.level, customFeatures: state.customFeatures, markOfficial: state.markOfficial, hintDismissed: state.hintDismissed, digits: state.digits, showComponentSeats: state.showComponentSeats, saved: state.saved}));
    // its own key, so the answer survives independently of the other settings
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(state.preferences));
    localStorage.setItem(ITEM_PREFERENCES_KEY, JSON.stringify(validItemAnswers(state.preferenceFor))); return true; }
  catch { return false; }
};

export const getState = () => state;
export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  // any committed change to the scenario ends a live preview
  state = { ...state, ...p, ...('scenario' in p && !('preview' in p) ? { preview: null } : {}) };
  if ('preview' in p && Object.keys(p).length === 1) { emit(); return; } // previews are never persisted
  // Keep the official palette independently of whichever scenario is currently open.
  if(p.scenario && Array.isArray(p.scenario.log) && !factLog(p.scenario).length) {
    try { localStorage.setItem(`israel-elections:appearance:${p.scenario.electionId}`,JSON.stringify(p.scenario.log.map(e=>e.action).filter(a=>ACTION_CLASSIFICATION[a.type]==='appearance'||ACTION_CLASSIFICATION[a.type]==='view'||a.type==='setListMeta'&&Object.keys(a.patch).every(k=>k==='color')).map(a=>a.type==='setBlocAppearance'?{type:a.type,blocs:a.blocs}:a))); } catch { /* workspace/save can still retain it */ }
  }
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

/** Resets use the same personal baseline as comparisons. */
export function baseContext(ds: ElectionDataset | undefined, splitBaseline = factionDefault()): ActionContext {
  return ds ? { base: splitBaseline === factionDefault() ? baselineOf(ds) : scenarioFromDataset(ds, 'historical', splitBaseline) } : {};
}

/** Applies an action to the current scenario. Returns false (and shows why) when it is rejected. */
export function dispatch(action: Action): boolean {
  const s = state.scenario;
  if (!s) return false;
  try {
    const next = applyAction(s, action, undefined, baseContext(state.datasets[s.electionId], s.factionSplitBaseline ?? false));
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
    const ctx = baseContext(state.datasets[s.electionId], s.factionSplitBaseline ?? false);
    const next = actions.reduce((x, a) => applyAction(x, a, undefined, ctx), s);
    setState({ scenario: next, past: [...state.past.slice(-199), s], future: [] });
    return true;
  } catch (e) {
    toast('error', e instanceof ActionError ? e.message : String(e));
    return false;
  }
}

/** Shows the result of an action live without logging it (a slider being dragged); null clears it. */
export function previewAction(action: Action | null) {
  const s = state.scenario;
  if (!s || !action) { if (state.preview) setState({ preview: null }); return; }
  try { setState({ preview: applyAction(s, action, undefined, baseContext(state.datasets[s.electionId], s.factionSplitBaseline ?? false)) }); }
  catch { /* an impossible intermediate value is simply not previewed */ }
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
export function replay(ds: ElectionDataset, name: string, log: Action[], splitBaseline = factionDefault()): { scenario: Scenario; failed: number } {
  let s = { ...scenarioFromDataset(ds, name, splitBaseline) };
  let failed = 0;
  const ctx = { base: scenarioFromDataset(ds, 'historical', splitBaseline) };
  for (const a of log) { try { s = applyAction(s, a, undefined, ctx); } catch { failed++; } }
  return { scenario: s, failed };
}

let openSeq = 0;
/** Opens an election (optionally replaying a saved or shared log). Resolves false if it could not be loaded.
 *  Replacing unsaved work in the same election first keeps it as a session draft (see stashCurrent). */
export async function openElection(id: ElectionId, from?: { id?: string; name: string; description?: string; log: Action[]; factionSplitBaseline?: boolean; baseBuiltAt?: string }): Promise<boolean> {
  const seq = ++openSeq;
  try {
    const ds = await loadDataset(id);
    if (seq !== openSeq) return false; // a later request superseded this one
    if (from && state.scenario?.electionId === id) stashCurrent();
    // keep the work of the election we are leaving, so switching back restores it (with undo)
    const leaving = state.scenario ? { [state.scenario.electionId]: { scenario: state.scenario, past: state.past, future: state.future, reference: state.reference } } : {};
    const sessions = { ...state.sessions, ...leaving };
    let scenario = officialAppearance(ds);
    let past: Scenario[] = []; let future: Scenario[] = [];
    let reference: Scenario | null = null;
    let notice: string | null = null;
    if (from) {
      const r = replay(ds, from.name, from.log, from.factionSplitBaseline ?? false);
      // a scenario's undo history is its own: undo never steps back into another scenario's identity
      scenario = { ...r.scenario, ...(from.description ? { description: from.description } : {}), ...(from.id ? { id: from.id } : {}) };
      reference = scenario;
      const he = state.lang === 'he';
      if (r.failed) notice = he ? `${r.failed} שינויים לא ניתן היה להחיל מחדש על הנתונים הנוכחיים.` : `${r.failed} change(s) could not be re-applied to the current data.`;
      if (from.baseBuiltAt && from.baseBuiltAt !== ds.buildInfo.builtAt) notice = (notice ? notice + ' ' : '') + (he ? 'הנתונים ההיסטוריים נבנו מחדש מאז שהתרחיש נוצר; השינויים הוחלו מחדש על הנתונים הנוכחיים.' : 'The historical data has been rebuilt since this scenario was made; its changes were re-applied to the current data.');
    } else if (sessions[id]) {
      ({ scenario, past, future, reference } = sessions[id]!);
    }
    delete sessions[id];
    setState({ electionId: id, scenario, reference, past, future, sessions, selectedListId: null, blocPanel: null, compareWith: 'auto', loadError: null, notice });
    return true;
  } catch (e) {
    if (seq === openSeq) setState({ loadError: { id, message: e instanceof Error ? e.message : String(e) } });
    return false;
  }
}

/** The scenario switcher's key for the current scenario: 'official', a saved scenario's id, or a key for
 *  unsaved work (changed since it was loaded, or never saved, such as an opened share link). */
export function scenarioKey(st: Pick<State, 'scenario' | 'reference'> & Partial<Pick<State, 'saved' | 'datasets'>> = state): string | null {
  const s = st.scenario;
  if (!s) return null;
  if((hasAppearance(s)||hasAnalysis(s))&&(!factLog(s).length||st.datasets?.[s.electionId]&&!resultDiffs(s,baselineOf(st.datasets[s.electionId]!)).length)) return 'official';
  const authored = s.log.some(e => e.action.type === 'rename' || e.action.type === 'setDescription');
  if (!st.saved?.some(x => x.id === s.id) && !factLog(s).length && !authored) return 'official';
  const entry = st.saved?.find(x => x.id === s.id);
  const ds = st.datasets?.[s.electionId];
  const checkpoint = entry && ds ? { ...replay(ds, entry.name, entry.log, entry.factionSplitBaseline ?? false).scenario, name: entry.name, description: entry.description } : st.reference;
  const dirty = !checkpoint || scenarioDirty(s, checkpoint);
  return dirty ? `draft:${s.id}:${s.log.at(-1)?.at ?? s.log.length}` : s.id;
}
const isUnsavedKey = (key: string | null, st: Pick<State, 'saved'> = state) => !!key && key !== 'official' && !st.saved.some((x) => x.id === key);

/** Keeps unsaved work, with its undo history, in the session drafts before another scenario replaces it. */
export function stashCurrent(): boolean {
  const s = state.scenario, key = scenarioKey();
  if (!s || !key || !isUnsavedKey(key)) return false;
  setState({ scenarioDrafts: { ...state.scenarioDrafts, [key]: { scenario: s, reference: state.reference, past: state.past, future: state.future } } });
  toast('info', state.lang === 'he' ? 'השינויים שלא נשמרו נשארים במחליף התרחישים למפגש זה.' : 'Unsaved changes kept in the scenario switcher for this session.');
  return true;
}

/** Opens a saved scenario under its own identity (the reference its markers compare with). */
export async function openSaved(x: SavedScenario): Promise<boolean> {
  return new Promise(resolve => askPreference({ id: 'comparison', key: x.id, title: x.name, cancel: () => resolve(false), run: value => {
    setState({ markOfficial: value === 'official' });
    void openElection(x.electionId, { id: x.id, name: x.name, description: x.description, log: x.log, factionSplitBaseline: x.factionSplitBaseline, baseBuiltAt: x.baseBuiltAt }).then(resolve);
  } }));
}

/** Official presentation is a browser preference as well as portable scenario data. */
function officialAppearance(ds:ElectionDataset):Scenario {
  let s=freshScenario(ds);
  try {
    const actions:unknown=JSON.parse(localStorage.getItem(`israel-elections:appearance:${ds.id}`)??'[]');
    if(Array.isArray(actions))for(const a of actions)if(validAction(a)&&!isFactAction(a as Action)&&ACTION_CLASSIFICATION[(a as Action).type]!=='metadata') {
      try{s=applyAction(s,a as Action,undefined,{base:baselineOf(ds)});}catch{/* obsolete palette entity */}
    }
  }catch{/* invalid browser preference */}
  return s;
}
/** Returns to the official result of the open election. */
export function openOfficial() {
  const ds = state.scenario && state.datasets[state.scenario.electionId];
  if (!ds || scenarioKey() === 'official') return;
  stashCurrent();
  setState({ scenario: officialAppearance(ds), reference: null, past: [], future: [], selectedListId: null, blocPanel: null, notice: null });
}

/** Resumes a session draft; it leaves the draft store while it is the current scenario. */
export function restoreDraft(key: string) {
  const draft = state.scenarioDrafts[key];
  if (!draft || key === scenarioKey()) return;
  stashCurrent();
  const { [key]: _resumed, ...rest } = state.scenarioDrafts;
  setState({ ...draft, scenarioDrafts: rest, selectedListId: null, blocPanel: null, notice: null });
}

/** Removes a saved scenario. If it is open, it stays open as unsaved work (nothing on screen is lost). */
export function deleteSaved(id: string) {
  setState((st) => ({ saved: st.saved.filter((x) => x.id !== id) }));
}

/** Opens an imported scenario file as a new, unsaved scenario with the file as its reference. */
export async function openImported(sc: Scenario): Promise<boolean> {
  if (!(await openElection(sc.electionId))) return false;
  stashCurrent();
  const fresh = { ...sc, id: `${sc.electionId}-${Date.now().toString(36)}` };
  setState({ scenario: fresh, reference: fresh, past: [], future: [], selectedListId: null, blocPanel: null });
  return true;
}

/** Opens a share link in the address bar (on start-up or when a link is pasted into an open tab). */
export async function openSharedFromHash(): Promise<boolean> {
  const sh = await readSharedFromHash();
  if (!sh) {
    if (!/^#s=/.test(location.hash)) return false;
    history.replaceState(null, '', location.pathname + location.search);
    toast('error', state.lang === 'he' ? 'קישור השיתוף פגום או חלקי; לא נפתח תרחיש.' : 'This share link is damaged or incomplete; no scenario was opened.');
    return false;
  }
  // the link is cleared only once it has opened, so a failed load can be retried by reloading
  // an unnamed shared scenario is named for where it came from, so it is recognisable among unsaved work
  const name = sh.name || (state.lang === 'he' ? 'תרחיש משותף' : 'Shared scenario');
  if (await openElection(sh.electionId, { ...sh, name })) history.replaceState(null, '', location.pathname + location.search);
  return true;
}

export function resetAll() {
  const ds = state.datasets[state.electionId];
  if (!ds || !state.scenario) return;
  let fresh = freshScenario(ds, '');
  const old=state.scenario;
  for(const l of fresh.lists){const from=old.lists.find(x=>x.id===l.id);if(!from)continue;
    if(from.color!==l.color)fresh=applyAction(fresh,{type:'setListMeta',listId:l.id,patch:{color:from.color}});
    for(const p of from.parties??[])if(p.color&&l.parties?.some(x=>x.id===p.id))fresh=applyAction(fresh,{type:'setPartyColor',listId:l.id,partyId:p.id,color:p.color});
  }
  fresh=applyAction(fresh,{type:'setBlocAppearance',blocs:fresh.blocs.map(b=>({...b,color:old.blocs.find(x=>x.id===b.id)?.color??b.color}))});
  setState({ scenario: fresh, past: [...state.past, state.scenario], future: [] });
}

export function saveCurrent(name?: string, options?: { newIdentity?: boolean; overwriteId?: string }): boolean {
  const original = state.scenario;
  if (!original) return false;
  const wanted = name?.trim() || original.name || (state.lang === 'he' ? 'תרחיש' : 'Scenario');
  const targetId = options?.overwriteId ?? (options?.newIdentity ? crypto.randomUUID() : original.id);
  if (state.saved.some(x => x.id !== targetId && x.name === wanted)) {
    toast('error', state.lang === 'he' ? 'השם כבר קיים. בחרו שמירה בשם…' : 'Name already exists. Choose Save as…');
    return false;
  }
  // Save-as is a new document; rename is encoded so replay cannot restore an older name.
  let prepared = { ...original, id: targetId };
  const lastRename = [...prepared.log].reverse().map(e => e.action).find(a => a.type === 'rename');
  if (prepared.name !== wanted || lastRename?.name !== wanted) prepared = applyAction(prepared, { type: 'rename', name: wanted });
  const s = prepared && !prepared.identityColor ? applyAction(prepared, { type: 'setIdentityColor', color: nextScenarioColor(state.saved.filter(x => x.id !== original.id), original.electionId) }) : prepared;
  if (!s) return false;
  const he = state.lang === 'he';
  const entry: SavedScenario = { id: s.id, name: wanted || s.name || (he ? 'תרחיש' : 'Scenario'), ...(s.description ? { description: s.description } : {}), electionId: s.electionId, savedAt: new Date().toISOString(), baseBuiltAt: s.baseBuiltAt, factionSplitBaseline: s.factionSplitBaseline ?? false, log: s.log.map((e) => e.action) };
  const before = state.saved;
  const oldReference = state.reference;
  const history = { past: state.past, future: state.future };
  setState((st) => ({ reference: { ...s, name: entry.name }, saved: [entry, ...st.saved.filter((x) => x.id !== s.id)], scenario: { ...s, name: entry.name }, ...(targetId !== original.id ? { past: [], future: [] } : {}) }));
  if (!persist()) {
    setState({ saved: before, reference: oldReference, scenario: original, ...history });
    toast('error', he ? 'הדפדפן סירב לשמור (האחסון מלא או חסום). ייצאו את התרחיש כקובץ JSON במקום.' : 'The browser refused to save (storage full or blocked). Export the scenario as a JSON file instead.');
    return false;
  }
  return true;
}

/** Saves a copy under a new identity: its own colour and its own (empty) undo history, so an undo can never
 *  turn the copy back into the original and a later save overwrite it. */
export function duplicateCurrent() {
  const s = state.scenario;
  if (!s) return;
  const he = state.lang === 'he';
  let id = `${s.electionId}-${Date.now().toString(36)}`;
  while (id === s.id || state.saved.some((x) => x.id === id)) id += 'x';
  const named: Scenario = { ...s, id, name: nextCopyName(s.name || (he ? 'תרחיש' : 'Scenario'), state.saved.map(x => x.name)) };
  const copy = applyAction(named, { type: 'setIdentityColor', color: nextScenarioColor(state.saved, s.electionId) });
  setState({ scenario: copy, past: [], future: [] });
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
  const payload = JSON.stringify({ e: s.electionId, n: s.name, ...(s.description ? { d: s.description } : {}), b: s.baseBuiltAt, f: s.factionSplitBaseline ?? false, l: s.log.map((x) => x.action) });
  const z = await pipe(new TextEncoder().encode(payload), new CompressionStream('deflate-raw'));
  return `${location.origin}${location.pathname}#s=${b64url(z)}`;
}

export async function readSharedFromHash(): Promise<{ electionId: ElectionId; name: string; description?: string; log: Action[]; factionSplitBaseline?: boolean; baseBuiltAt: string } | null> {
  const m = location.hash.match(/#s=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const raw = await pipe(unb64url(m[1]), new DecompressionStream('deflate-raw'));
    const p = JSON.parse(new TextDecoder().decode(raw));
    return { electionId: p.e, name: p.n ?? '', ...(typeof p.d === 'string' ? { description: p.d } : {}), log: p.l ?? [], factionSplitBaseline: p.f === true, baseBuiltAt: p.b };
  } catch { return null; }
}

export function importScenarioJson(text: string): Scenario {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('The file is not valid JSON.'); }
  const problems = validateScenario(parsed);
  if (problems.length) throw new Error(`Cannot import this scenario: ${problems.slice(0, 5).join('; ')}${problems.length > 5 ? '…' : ''}.`);
  return parsed as Scenario;
}

/** Only explicit completed actions call this; never a drag preview or keystroke stream.
 * A second action cannot replace an unanswered question. */
function preferenceKey(id: PreferenceId, key: string) {
  return `${id}:${id === 'voteSource' ? state.electionId : ''}:${key}`;
}
export function askPreference(ask: PreferenceAsk) {
  const st = getState();
  if (st.preferenceAsk) return;
  const saved = st.preferences[ask.id];
  const item = st.preferenceFor?.[preferenceKey(ask.id, ask.key)];
  const target = ask.key.startsWith('list:') ? st.scenario?.lists.some(l => l.id === ask.key.slice(5))
    : ask.key.startsWith('bloc:') ? ask.key === 'bloc:null' || st.scenario?.blocs.some(b => b.id === ask.key.slice(5)) : true;
  const answer = (target !== false ? item : undefined) ?? saved;
  // A named donor cannot be reused when absent, withdrawn or part of the edited target.
  const compatible = answer && (!answer.startsWith('t:') || st.scenario?.lists.some(l => l.id === answer.slice(2) && !l.withdrawn && !ask.exclude?.includes(l.id)));
  if (compatible) return ask.run(answer);
  setState({ preferenceAsk: ask });
}
export function setPreference(id: PreferenceId, value?: string) {
  if (id === 'jointSeats') {
    const on = value === 'on';
    setFactionDefault(on);
    const one = (s: Scenario): Scenario => {
      const ds = state.datasets[s.electionId];
      if (!ds) return s;
      // Replay under the new implicit baseline so resets and structure checkpoints
      // follow the same semantics on screen, after reload, and in a share link.
      let rebuilt = scenarioFromDataset(ds, s.name, on);
      const ctx = { base: scenarioFromDataset(ds, 'historical', on) };
      try {
        for (const e of s.log) rebuilt = applyAction(rebuilt, e.action, e.at, ctx);
      } catch { return s; } // malformed imported logs must not discard work
      return { ...s, factionSplitBaseline: on, factionSplits: rebuilt.factionSplits, log: rebuilt.log };
    };
    const session = (x: ScenarioSession): ScenarioSession => ({ scenario: one(x.scenario), reference: x.reference && one(x.reference), past: x.past.map(one), future: x.future.map(one) });
    state = { ...state, ...(state.scenario ? session({ scenario: state.scenario, reference: state.reference, past: state.past, future: state.future }) : {}), preview: null,
      sessions: Object.fromEntries(Object.entries(state.sessions).map(([k, x]) => [k, session(x!)])),
      scenarioDrafts: Object.fromEntries(Object.entries(state.scenarioDrafts).map(([k, x]) => [k, session(x)])) };
  }
  const preferences = { ...state.preferences };
  if (value) preferences[id] = value; else delete preferences[id];
  setState({ preferences, preferenceFor: Object.fromEntries(Object.entries(state.preferenceFor ?? {}).filter(([key]) => !key.startsWith(`${id}:`))), ...(id === 'voteSource' && value ? { voteSource: sourceChoice(value) } : {}), ...(id === 'comparison' && value ? { markOfficial: value === 'official' } : {}) });
}
export function answerPreference(value: string, scope: 'once' | 'item' | 'always') {
  const ask = state.preferenceAsk; if (!ask) return;
  if (scope === 'always') setPreference(ask.id, value);
  setState({ preferenceAsk: null, preferenceFor: scope === 'item' ? { ...state.preferenceFor, [preferenceKey(ask.id, ask.key)]: value } : state.preferenceFor });
  ask.run(value);
}
export function withSource(key: string, title: string, exclude: string[], run: (src: SourceChoice) => void) {
  askPreference({ id: 'voteSource', key, title, exclude, run: value => {
    const src = sourceChoice(value);
    setState({ voteSource: src });
    run(src);
  } });
}
/** Choosing the inline source is already an explicit answer for the current target. */
export function chooseSource(key: string, src: SourceChoice) {
  if (state.preferences.voteSource) setPreference('voteSource', sourceValue(src));
  setState({ voteSource: src, preferenceFor: { ...state.preferenceFor, [preferenceKey('voteSource', key)]: sourceValue(src) } });
}

export function useVoteSource(): SourceChoice {
  return useStore(st => st.voteSource);
}
/** Percentage precision in force: the precision setting is an Expert control, so other levels use 2. */
export function useDigits(): number {
  return useStore((st) => (st.level === 'expert' ? st.digits : 2));
}
/** Which interface level is on: `standard` is true for Standard and Expert. */
export function useLevel() {
  const level = useStore((st) => st.level);
  return { level, simple: level === 'simple', standard: level !== 'simple', expert: level === 'expert' };
}

export function featureVisibility(id: FeatureId): Visibility {
  return state.customFeatures?.[id] ?? PRESETS[state.level][id];
}
export function keepFeature(id: FeatureId, visibility: Visibility = 'show') {
  setState({ customFeatures: { ...state.customFeatures, [id]: visibility } });
}
export function useFeature(id: FeatureId) {
  return useStore(st => st.customFeatures?.[id] ?? PRESETS[st.level][id]);
}

// ---- Workspace restore: unsaved work survives a reload (owner decision 2026-11-04) ----
// The open scenario, each election's session and the session drafts are kept in this browser's storage as their
// change logs (never as computed results), and rebuilt by replaying the logs against the same datasets. Undo is
// rebuilt one change at a time. Nothing leaves the device.
const WS = 'israel-elections:workspace:v1';
type Snap = { factionSplitBaseline?: boolean; id: string; name: string; description?: string; identityColor?: string; electionId: ElectionId; log: ChangeEntry[]; ref: { factionSplitBaseline?: boolean; id: string; name: string; description?: string; log: ChangeEntry[] } | null };
type Workspace = { v: 1; electionId: ElectionId; current: Snap | null; sessions: Snap[]; drafts: [string, Snap][] };
const snapOf = (x: ScenarioSession): Snap => ({ factionSplitBaseline: x.scenario.factionSplitBaseline, id: x.scenario.id, name: x.scenario.name, description: x.scenario.description, identityColor: x.scenario.identityColor,
  electionId: x.scenario.electionId, log: x.scenario.log, ref: x.reference ? { factionSplitBaseline: x.reference.factionSplitBaseline, id: x.reference.id, name: x.reference.name, description: x.reference.description, log: x.reference.log } : null });
function writeWorkspace() {
  const st = state;
  if (!st.scenario) return;
  const ws: Workspace = { v: 1, electionId: st.scenario.electionId,
    current: { ...snapOf({ scenario: st.scenario, reference: st.reference, past: [], future: [] }) },
    sessions: Object.values(st.sessions).filter((x): x is ScenarioSession => !!x && (x.scenario.log.length > 0 || !!x.reference)).map(snapOf),
    drafts: Object.entries(st.scenarioDrafts).filter(([, x]) => !!x?.scenario).map(([k, x]) => [k, snapOf(x)]) };
  try { localStorage.setItem(WS, JSON.stringify(ws)); } catch { /* full or disabled storage: the session simply is not restored */ }
}
let wsTimer: ReturnType<typeof setTimeout> | null = null;
let wsLast: unknown[] = [];
listeners.add(() => {
  const now = [state.scenario, state.reference, state.sessions, state.scenarioDrafts];
  if (now.every((x, i) => x === wsLast[i])) return;
  wsLast = now;
  if (wsTimer) clearTimeout(wsTimer);
  wsTimer = setTimeout(() => { wsTimer = null; writeWorkspace(); }, 250);
});
// a reload or tab close inside the debounce still keeps the last edit
globalThis.addEventListener?.('pagehide', () => { if (wsTimer) { clearTimeout(wsTimer); wsTimer = null; writeWorkspace(); } });
/** Rebuilds a session from its log; its undo history is the log replayed one change at a time. */
function rebuild(ds: ElectionDataset, x: Snap): { session: ScenarioSession; failed: number } {
  const ctx = { base: scenarioFromDataset(ds, 'historical', x.factionSplitBaseline ?? false) };
  let failed = 0;
  const run = (name: string, entries: ChangeEntry[], splitBaseline: boolean, from?: Scenario) => {
    let s = from ?? scenarioFromDataset(ds, name, splitBaseline);
    const steps: Scenario[] = [];
    for (const e of entries.slice(from ? from.log.length : 0)) {
      steps.push(s);
      try { s = applyAction(s, e.action, undefined, ctx); s = { ...s, log: [...s.log.slice(0, -1), e] }; } catch { failed++; }
    }
    return { s, steps };
  };
  const ref = x.ref ? { ...run(x.ref.name, x.ref.log, x.ref.factionSplitBaseline ?? false).s, id: x.ref.id, name: x.ref.name, ...(x.ref.description ? { description: x.ref.description } : {}) } : null;
  const shared = ref && x.log.length >= ref.log.length && ref.log.every((e, i) => JSON.stringify(e) === JSON.stringify(x.log[i]));
  const { s, steps } = run(x.name, x.log, x.factionSplitBaseline ?? false, shared ? ref! : undefined);
  const scenario = { ...s, id: x.id, name: x.name, ...(x.description ? { description: x.description } : {}), ...(x.identityColor ? { identityColor: x.identityColor } : {}) };
  return { session: { scenario, reference: ref, past: steps.slice(-200), future: [] }, failed };
}
/** Restores the last workspace in this browser. Resolves false when there is none (or it cannot be read). */
export async function restoreWorkspace(): Promise<boolean> {
  let ws: Workspace | null = null;
  try { ws = JSON.parse(localStorage.getItem(WS) ?? 'null'); } catch { return false; }
  if (!ws || ws.v !== 1 || !ws.current) return false;
  const ids = [...new Set([ws.electionId, ...ws.sessions.map(x => x.electionId), ...ws.drafts.map(([, x]) => x.electionId)])];
  const loaded = await Promise.allSettled(ids.map(id => loadDataset(id)));
  const ds = (id: ElectionId) => { const i = ids.indexOf(id); const r = loaded[i]; return r?.status === 'fulfilled' ? r.value : undefined; };
  const main = ds(ws.electionId);
  if (!main) return false;
  let failed = 0;
  const one = (x: Snap) => { const d = ds(x.electionId); if (!d) return null; const r = rebuild(d, x); failed += r.failed; return r.session; };
  const current = one(ws.current)!;
  const sessions: State['sessions'] = {};
  for (const x of ws.sessions) if (x.electionId !== ws.electionId) { const r = one(x); if (r) sessions[x.electionId] = r; }
  const drafts: State['scenarioDrafts'] = {};
  for (const [k, x] of ws.drafts) { const r = one(x); if (r) drafts[k] = r; }
  const he = state.lang === 'he';
  setState({ electionId: ws.electionId, ...current, sessions, scenarioDrafts: drafts, selectedListId: null, blocPanel: null, loadError: null,
    notice: failed ? (he ? `${failed} שינויים מהביקור הקודם לא ניתן היה להחיל מחדש על הנתונים הנוכחיים.` : `${failed} change(s) from your last visit could not be re-applied to the current data.`) : null });
  return true;
}
