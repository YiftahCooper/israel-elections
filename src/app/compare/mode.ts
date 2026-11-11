// Comparing as a mode (owner, 9 and 12 Nov 2026, "Design A"): the screen you are on is your work; the compared result is a
// reference you look at and never edit there. The reference is any election's official result, a saved scenario of any
// election, a frozen copy of your work, this election's official result, or the work Swap set aside. Turning comparing on
// or off, choosing what to compare with and Swap are not undo steps, like changing tabs; each copy into your work is one.
// This module is in the main bundle: it must not import the party registry (match.ts), which the strip does not need.
import { useEffect } from 'react';
import type { ElectionDataset, ElectionId, ElectionIndexEntry } from '../../data/schema.ts';
import type { Scenario } from '../../model/scenario.ts';
import { baselineOf } from '../factionDefaults.ts';
import { resultChanges } from '../derive.ts';
import { electionLabel } from '../electionLabel.ts';
import { getSetting, getState, loadDataset, replay, scenarioKey, setState, toast, useStore, type SavedScenario, type ScenarioSession, type State } from '../store.ts';

const ELECTION = 'election:', SAVED = 'saved:';

/** The previous election with data before `id` (none for the first Knesset). */
export function previousElection(elections: ElectionIndexEntry[], id: string): ElectionIndexEntry | undefined {
  const at = elections.findIndex((e) => e.id === id);
  return at < 0 ? undefined : elections.slice(at + 1).find((e) => e.available);
}
/** "2022", or "April 2019" where a year had two elections. */
export function yearOf(elections: ElectionIndexEntry[], id: string, lang: 'he' | 'en'): string {
  const e = elections.find((x) => x.id === id);
  return e ? electionLabel(e, elections, lang).split(' · ')[0] : id;
}

/** The election a reference key names, before its data is loaded (null: nothing to compare with). */
export function referenceElection(key: string, work: Scenario, st: Pick<State, 'elections' | 'saved' | 'compare'>): ElectionId | null {
  if (key === 'prev') return (previousElection(st.elections, work.electionId)?.id ?? null) as ElectionId | null;
  if (key.startsWith(ELECTION)) return key.slice(ELECTION.length) as ElectionId;
  if (key.startsWith(SAVED)) return st.saved.find((x) => x.id === key.slice(SAVED.length))?.electionId ?? null;
  if (key === 'snapshot') return st.compare.snapshot?.electionId ?? null;
  if (key === 'swapped') return st.compare.swapped?.scenario.electionId ?? null;
  return work.electionId; // 'official'
}
/** The reference's own id: its Side by side draft is kept under it ('prev' is the election it stands for). */
export function referenceId(key: string, work: Scenario, st: Pick<State, 'elections' | 'saved' | 'compare'>): string | null {
  const e = referenceElection(key, work, st);
  if (!e) return null;
  if (key === 'prev' || key.startsWith(ELECTION)) return e === work.electionId ? `official:${e}` : `${ELECTION}${e}`;
  if (key === 'official') return `official:${e}`;
  return key;
}

export interface Reference {
  /** what was chosen ('prev', 'election:k25', 'saved:…', 'official', 'snapshot', 'swapped') */
  key: string;
  /** its draft key (Side by side edits) */
  id: string;
  /** the result shown: the reference, with any Side by side edits */
  sc: Scenario;
  /** where it started before any Side by side edit (Start over goes back here) */
  initial: Scenario;
  /** its election's official result: markers, and the copy methods that copy an edit, compare with it */
  start: Scenario;
  ds: ElectionDataset;
  /** "2022" */
  year: string;
  /** "Official result", a saved scenario's name, "Your work (frozen copy)"… with " · draft" once edited in Side by side */
  name: string;
  /** an unedited official result (a copy from it is marked "From 2022") */
  official: boolean;
  /** within the work's own election */
  same: boolean;
  /** the saved scenario it is, if any (Swap opens it under its own identity) */
  saved?: SavedScenario;
}
export type ReferenceState =
  | { status: 'off' }
  | { status: 'loading'; key: string }
  /** first: there is no earlier election; same: it is exactly what you are looking at */
  | { status: 'none'; key: string; why: 'first' | 'same' | 'gone' }
  | { status: 'ready'; ref: Reference };

const L = (lang: 'he' | 'en', en: string, he: string) => lang === 'he' ? he : en;
// a roster edit alone is something to compare too (Side by side lists the candidates entering and leaving)
const sameRoster = (a: Scenario['lists'][number]['candidates'], b: Scenario['lists'][number]['candidates']) =>
  a === b || (a.length === b.length && a.every((c, i) => c.id === b[i].id));
const sameVotes = (a: Scenario, b: Scenario) => a.electionId === b.electionId && a.lists.length === b.lists.length
  && a.lists.every((l, i) => b.lists[i]?.id === l.id && b.lists[i].votes === l.votes && !!b.lists[i].withdrawn === !!l.withdrawn)
  && a.lists.every((l, i) => b.lists[i].bloc === l.bloc && sameRoster(l.candidates, b.lists[i].candidates)) && a.registered === b.registered && a.invalid === b.invalid && JSON.stringify(a.rules) === JSON.stringify(b.rules) && JSON.stringify(a.agreements) === JSON.stringify(b.agreements);

// one replayed saved scenario per log, so every reader (strip, lists, chamber) shares it and memoised views stay stable
const replayed = new WeakMap<SavedScenario, WeakMap<ElectionDataset, Scenario>>();
function savedScenario(x: SavedScenario, ds: ElectionDataset): Scenario {
  let m = replayed.get(x); if (!m) replayed.set(x, m = new WeakMap());
  let s = m.get(ds); if (!s) m.set(ds, s = { ...replay(ds, x.name, x.log, x.factionSplitBaseline ?? false).scenario, id: x.id });
  return s;
}

/** Resolves what the work is compared with, from the store (pure apart from reading datasets already loaded). */
export function resolveReference(work: Scenario, st: Pick<State, 'comparing' | 'elections' | 'saved' | 'compare' | 'datasets' | 'lang'>): ReferenceState {
  const key = st.comparing;
  if (!key) return { status: 'off' };
  const e = referenceElection(key, work, st);
  if (!e) return { status: 'none', key, why: key === 'prev' ? 'first' : 'gone' };
  const ds = st.datasets[e];
  if (!ds) return { status: 'loading', key };
  const id = referenceId(key, work, st)!;
  const lang = st.lang;
  const base = baselineOf(ds);
  let initial: Scenario, name: string, saved: SavedScenario | undefined;
  if (key.startsWith(SAVED)) { saved = st.saved.find((x) => x.id === key.slice(SAVED.length))!; initial = savedScenario(saved, ds); name = saved.name; }
  else if (key === 'snapshot') { initial = st.compare.snapshot!; name = L(lang, 'Your work (frozen copy)', 'העבודה שלכם (עותק מוקפא)'); }
  else if (key === 'swapped') { const w = st.compare.swapped!.scenario; initial = w; name = resultChanges(w, base).length ? `${w.name || L(lang, 'Your work', 'העבודה שלכם')} · ${L(lang, 'unsaved draft', 'טיוטה שלא נשמרה')}` : L(lang, 'Official result', 'התוצאה הרשמית'); }
  else { initial = base; name = L(lang, 'Official result', 'התוצאה הרשמית'); }
  const draft = st.compare.drafts[id];
  const sc = draft?.scenario ?? initial;
  const edited = !!draft && draft.scenario !== initial && resultChanges(sc, initial).length > 0;
  if (edited) name = `${name} · ${L(lang, 'draft', 'טיוטה')}`;
  if (sameVotes(sc, work)) return { status: 'none', key, why: 'same' };
  return { status: 'ready', ref: { key, id, sc, initial, start: base, ds, year: yearOf(st.elections, e, lang), name, official: resultChanges(sc, base).length === 0, same: e === work.electionId, ...(saved ? { saved } : {}) } };
}

/** The reference for the open work, loading its election's data when needed. */
export function useReference(work: Scenario | null): ReferenceState {
  const comparing = useStore((st) => st.comparing);
  const elections = useStore((st) => st.elections), saved = useStore((st) => st.saved), compare = useStore((st) => st.compare);
  const datasets = useStore((st) => st.datasets), lang = useStore((st) => st.lang);
  const state = work ? resolveReference(work, { comparing, elections, saved, compare, datasets, lang }) : { status: 'off' as const };
  const need = work && comparing ? referenceElection(comparing, work, { elections, saved, compare }) : null;
  useEffect(() => {
    if (need && !datasets[need]) loadDataset(need).catch(() => { toast('error', lang === 'he' ? 'לא ניתן לטעון את הבחירות האלה.' : 'Could not load this election.'); setState({ comparing: null }); });
  }, [need, datasets, lang]);
  return state;
}

/** Turns comparing on: the previous election (Settings → Compare with can make it the official result once you have
 *  changed something). Not an undo step. */
export function startComparing() {
  const st = getState();
  const s = st.scenario;
  const edited = !!s && !!st.datasets[s.electionId] && resultChanges(s, baselineOf(st.datasets[s.electionId]!)).length > 0;
  setState({ comparing: getSetting('compareWith') === 'official' && edited ? 'official' : 'prev', compare: { ...st.compare, chamber: 'work' } });
}
export function stopComparing() {
  const st = getState();
  setState({ comparing: null, compare: { ...st.compare, chamber: 'work' }, ...(st.tool === 'compare' ? { tool: st.compare.back } : {}) });
}
/** Chooses what to compare with. "Your work as it is now" freezes a copy. */
export function compareWith(key: string) {
  const st = getState();
  if (key === 'snapshot') { if (!st.scenario) return; setState({ comparing: 'snapshot', compare: { ...st.compare, snapshot: st.scenario, chamber: 'work' } }); return; }
  setState({ comparing: key, compare: { ...st.compare, chamber: 'work' } });
}
export const showChamber = (which: 'work' | 'ref') => { const st = getState(); if (st.compare.chamber !== which) setState({ compare: { ...st.compare, chamber: which } }); };

/** Side by side: today's two-sided page, opened from the strip; closing returns to the screen you came from. */
export function openSideBySide() {
  const st = getState();
  if (st.tool === 'compare') return;
  setState({ tool: 'compare', compare: { ...st.compare, back: st.tool } });
  window.scrollTo?.({ top: 0 });
}
export function closeSideBySide() {
  const st = getState();
  setState({ tool: st.compare.back && st.compare.back !== 'compare' ? st.compare.back : null });
}

/**
 * Swap: the reference becomes your work and your work becomes the reference, kept as an unsaved draft with its own undo
 * history (Swap again brings it back). Like choosing another scenario in the top bar, it is not an undo step itself.
 */
export function swapWithReference(ref: Reference): boolean {
  const st = getState();
  const work = st.scenario;
  if (!work) return false;
  const aside: ScenarioSession = { scenario: work, past: st.past, future: st.future, reference: st.reference };
  const draft = st.compare.drafts[ref.id];
  const incoming: ScenarioSession = ref.key === 'swapped'
    ? (draft ? { ...draft, reference: st.compare.swapped!.reference } : st.compare.swapped!)
    : { scenario: ref.sc, past: draft?.past ?? [], future: draft?.future ?? [], reference: ref.saved ? ref.initial : ref.key === 'snapshot' ? st.reference : null };
  const drafts = { ...st.compare.drafts }; delete drafts[ref.id]; delete drafts.swapped;
  const target = incoming.scenario.electionId;
  // unsaved work already waiting for that election stays reachable from the scenario switcher, never overwritten
  const sessions = { ...st.sessions }; let scenarioDrafts = st.scenarioDrafts;
  const waiting = target !== work.electionId ? sessions[target] : undefined;
  if (waiting) {
    const k = scenarioKey({ scenario: waiting.scenario, reference: waiting.reference, saved: st.saved, datasets: st.datasets });
    if (k && k !== 'official' && !st.saved.some((x) => x.id === k)) scenarioDrafts = { ...scenarioDrafts, [k]: waiting };
    delete sessions[target];
  }
  setState({
    electionId: target, scenario: incoming.scenario, past: incoming.past, future: incoming.future, reference: incoming.reference,
    sessions, scenarioDrafts, selectedListId: null, blocPanel: null, notice: null, comparing: 'swapped',
    compare: { ...st.compare, drafts, swapped: aside, chamber: 'work', snapshot: ref.key === 'snapshot' ? null : st.compare.snapshot },
  });
  return true;
}
