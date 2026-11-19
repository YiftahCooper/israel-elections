import { markerLead } from '../compare/copyText.ts';
import { errorText } from '../../model/messages.ts';
import { copyOriginOf } from '../../model/editScopes.ts';
import { ScenarioSave, UnsavedMark } from './ScenarioSave.tsx';
import { createPortal } from 'react-dom';
import { isFactAction } from '../../model/actionClassification.ts';
import { listLabel } from '../derive.ts';
import { useFloating } from '../floating.tsx';
import { useCloseOnFocusAway } from '../focusReturn.ts';
import { ScenarioSwitcher } from './ScenarioSwitcher.tsx';
import { useActiveReference } from '../useActiveReference.ts';
import { ElectionAbout } from './ElectionContext.tsx';
import { changeText } from '../changeValue.tsx';
import { electionContext } from '../../data/electionContext.ts';
import { exportAnnotations } from '../scenarioExport.ts';
import { baselineOf, changeCount, editPathLabel, markerReference, referenceChanges, resultChanges } from '../derive.ts';
import { liveScenarioColor, savedColor } from '../scenarioIdentity.ts';
import { describe } from '../actionDescription.ts';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { csvEscape, download } from '../format.ts';
import { deleteSaved, dispatch, getSetting, setLevel, setSetting, toggleTheme, useSetting, duplicateCurrent, importScenarioJson, openElection, openImported, openSaved, replay, redo, resetAll, scenarioKey, setState, shareLink, toast, undo, useShown, useStore } from '../store.ts';
import { compareWith } from '../compare/mode.ts';
import { ChevronDown, Copy, Download, FolderOpen, Link2, Menu, Moon, Redo2, RotateCcw, Save, Share2, Sun, Table2, Trash2, Undo2, Upload, Settings, X } from 'lucide-react';
import { PersonalSettings } from './PersonalSettings.tsx';
import { AppMenu } from './AppMenu.tsx';
import { Seg } from './ui.tsx';
import './topbar-phone.css';
import { LEVEL_LABELS, ownChoices } from '../features.ts';

export { electionLabel } from '../electionLabel.ts';
import { ElectionPicker } from './ElectionPicker.tsx';

/** Phones get their own one-row bar (owner, 9 Nov 2026): width alone decides, the same breakpoint as styles.css. */
const PHONE = '(max-width: 600px)';
const subscribePhone = (fn: () => void) => { const m = globalThis.matchMedia?.(PHONE); m?.addEventListener('change', fn); return () => m?.removeEventListener('change', fn); };
const usePhone = () => useSyncExternalStore(subscribePhone, () => globalThis.matchMedia?.(PHONE).matches === true, () => false);

const fileName = (n: string) => (n || 'scenario').replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'scenario';

export function TopBar({ s, r, ds, baseR, pmContestId = null, onContestChange }: { s: Scenario | null; r: AllocationResult | null; ds: ElectionDataset | undefined; baseR: AllocationResult | null; pmContestId?: string | null; onContestChange?: (id: string | null) => void }) {
  const L = useL();
  const lang = useLang();
  const electionId = useStore((st) => st.electionId);
  // with nothing open, the election that could not be loaded (its page says so), never another one
  const failedId = useStore((st) => (!st.scenario ? st.loadError?.id : undefined));
  const index = useStore((st) => st.elections);
  // the open election always has a correctly labelled option, even if the index lacks it
  const elections = ds && !index.some((e) => e.id === ds.id)
    ? [...index, { id: ds.id, knesset: ds.knesset, date: ds.electionDate, nameHe: ds.nameHe, nameEn: ds.nameEn, available: true, status: { stage: ds.status.stage } }].sort((a, b) => b.date.localeCompare(a.date))
    : index;
  const { markerReference: reference } = useActiveReference();
  const theme = useStore((st) => st.theme);
  const themeChoice = useSetting('theme');
  const custom = useStore(st => st.customFeatures);
  const scenariosShown = useShown('scenarios');
  const level = useStore((st) => st.level);
  const canUndo = useStore((st) => st.past.length > 0);
  const canRedo = useStore((st) => st.future.length > 0);
  const future = useStore(st => st.future);
  const last = s?.log.at(-1);
  const next = future.at(-1)?.log.at(-1);
  const undoName = last && s ? L('Undo: ', 'ביטול: ') + describe(last.action, s, lang) : L('Undo', 'ביטול');
  const redoName = next && s ? L('Redo: ', 'ביצוע מחדש: ') + describe(next.action, future.at(-1)!, lang) : L('Redo', 'ביצוע מחדש');
  const saved = useStore((st) => st.saved);
  const dirty = useStore(st => { const key = scenarioKey(st); return !!key && key !== 'official' && !st.saved.some(x => x.id === key); });
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useFloating(popupRef, () => menuButton.current?.getBoundingClientRect(), menu);
  // the menu closes on Escape (focus returns to its button) or a press outside it, not on mouse leave,
  // so keyboard and touch users can use it
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); menuButton.current?.focus({preventScroll:true}); } };
    const onDown = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [menu]);
  // and when focus leaves it, so it never covers the control Tab moved to
  useCloseOnFocusAway(menu, t => !!menuRef.current?.contains(t), () => setMenu(false));
  const [shareUrl, setShareUrl] = useState('');
  // A link describes one snapshot; never offer an older snapshot after an edit.
  useEffect(() => setShareUrl(''), [s]);

  /** Save & share: the same items in the desktop popup and in the phone menu */
  const shareItems = (close: () => void) => <>
            {s && <ScenarioName key={`${s.id}-${s.name}`} name={s.name} placeholder={L('Untitled scenario', 'תרחיש ללא שם')} label={L('Scenario name', 'שם התרחיש')} />}{dirty && <UnsavedMark />}
            <ScenarioSave onSaved={() => close()} className="btn small" disabled={!s}><Save className="icon sm" aria-hidden />{L('Save in this browser', 'שמירה בדפדפן')}</ScenarioSave>
            <ScenarioSave as onSaved={() => close()} className="btn small" disabled={!s}>{L('Save as…', 'שמירה בשם…')}</ScenarioSave>
            <button className="btn small" onClick={async () => {
              const url = await shareLink(); setShareUrl(url);
              try { await navigator.clipboard.writeText(url); toast('info', L('Share link copied', 'קישור השיתוף הועתק')); }
              catch { toast('info', L('Copy the link from the field below.', 'העתיקו את הקישור מהשדה שלמטה.')); }
            }}><Link2 className="icon sm" aria-hidden />{L('Copy a share link', 'העתקת קישור שיתוף')}</button>
            {shareUrl && <input type="text" readOnly value={shareUrl} aria-label={L('Share link', 'קישור שיתוף')} onFocus={(e) => e.target.select()} style={{ width: '100%' }} />}
            <button className="btn small" onClick={() => { duplicateCurrent(); toast('info', L('Saved as a copy in this browser.', 'נשמר עותק בדפדפן זה.')); close(); }}><Copy className="icon sm" aria-hidden />{L('Duplicate scenario', 'שכפול תרחיש')}</button>
            <button className="btn small" onClick={() => { if (s && ds) download(`${s.electionId}-${fileName(s.name)}.json`, JSON.stringify({ ...s, ...exportAnnotations(s, lang), datasetBuiltAt: ds.buildInfo.builtAt }, null, 1), 'application/json'); close(); }}><Download className="icon sm" aria-hidden />{L('Export scenario (JSON)', 'ייצוא תרחיש (JSON)')}</button>
            <button className="btn small" onClick={() => fileRef.current?.click()}><Upload className="icon sm" aria-hidden />{L('Import scenario (JSON)', 'ייבוא תרחיש (JSON)')}</button>
            <button className="btn small" onClick={() => { exportCsv(); close(); }}><Table2 className="icon sm" aria-hidden />{L('Export results table (CSV)', 'ייצוא טבלת תוצאות (CSV)')}</button>
            {scenariosShown && <button className="btn small" onClick={() => { setState({ tool: 'scenarios' }); close(); }}><FolderOpen className="icon sm" aria-hidden />{L('All scenarios', 'כל התרחישים')}</button>}
            <div className="section-title" style={{ margin: '8px 0 2px' }}>{L('Saved in this browser', 'שמורים בדפדפן')}</div>
            {saved.length === 0 && <p className="small muted" style={{ margin: 0 }}>{L('Nothing saved yet.', 'עדיין לא נשמר דבר.')}</p>}
            {saved.map((x) => (
              <div key={x.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <button className="btn small ghost" style={{ justifyContent: 'flex-start', minWidth: 0 }} aria-current={x.id === s?.id ? 'true' : undefined} disabled={x.id === s?.id && !dirty} onClick={() => { void openSaved(x); close(); }}>
                  <span className="swatch" style={{ background: (ds?.id===x.electionId?resultChanges(replay(ds,x.name,x.log,x.factionSplitBaseline??false).scenario,baselineOf(ds)).length:x.log.some(isFactAction)) ? savedColor(x.log) : 'var(--muted)' }} /><span className="clip" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.name}{x.id === s?.id && dirty && <UnsavedMark />}</span> <span className="muted">({elections.find((e) => e.id === x.electionId)?.date.slice(0, 4) ?? x.electionId})</span>{x.id === s?.id && <span aria-hidden>✓</span>}</button>
                <span className="row" style={{ flexWrap: 'nowrap', gap: 2 }}>
                  <button className="btn small ghost" onClick={() => { compareWith(`saved:${x.id}`); close(); }} disabled={x.id === s?.id}>{L('Compare', 'השוואה')}</button>
                  <button className="btn small ghost danger icon-only" aria-label={L(`Delete ${x.name}`, `מחיקת ${x.name}`)} onClick={() => { if (confirm(L(`Delete “${x.name}” from this browser?`, `למחוק את "${x.name}" מהדפדפן?`))) deleteSaved(x.id); }}><Trash2 className="icon sm" aria-hidden /></button>
                </span>
              </div>
            ))}
  </>;

  const exportCsv = () => {
    if (!s || !r || !baseR) return;
    const markerBase = reference || (ds ? baselineOf(ds) : s);
    const marked = referenceChanges(s, markerBase);
    const head = ['edited', 'letters', 'list', 'votes', 'pct_valid', 'qualified', 'whole_quota_seats', 'seats', 'historical_seats'];
    const rows = s.lists.map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return [marked.filter(p => p[0] === 'lists' && p[1] === l.id).map(p => editPathLabel(s, p, lang, markerBase) + ' · ' + markerLead(copyOriginOf(s, p)?.provenance, lang, s.electionId) + (changeText(markerReference(s,markerBase,p), p, lang))).join('; '), l.letters, listLabel(l, lang), l.votes, ((l.votes / Number(r.totalValid)) * 100).toFixed(6), lr.qualified, lr.initialSeats, lr.seats, baseR.lists.find((x) => x.id === l.id)?.seats ?? '']; });
    download(`${s.electionId}-${fileName(s.name)}.csv`, '﻿' + [head, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
  };

  const phone = usePhone();
  const [phoneMenu, setPhoneMenu] = useState(false);
  const [scenarioPanel, setScenarioPanel] = useState(false);
  const [toolsPanel, setToolsPanel] = useState(false);
  const fileInput = <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      if (await openImported(importScenarioJson(await f.text()))) toast('info', L('Scenario imported.', 'התרחיש יובא.'));
    } catch (err) { toast('error', errorText(err, lang)); }
    e.target.value = ''; setMenu(false); setPhoneMenu(false); setScenarioPanel(false);
  }} />;
  const startOver = () => { if (!s?.log.length || !getSetting('confirmStartOver') || confirm(L('Start over from the official result? (Undo can restore it.)', 'להתחיל מחדש מהתוצאה הרשמית? (ניתן לבטל)'))) resetAll(); };
  const undoRedo = <>
      <button className="tool" onClick={undo} disabled={!canUndo} title={undoName + ' (Ctrl+Z)'} aria-label={undoName}><Undo2 className="icon rtl-mirror" aria-hidden /></button>
      <button className="tool" onClick={redo} disabled={!canRedo} title={redoName + ' (Ctrl+Y)'} aria-label={redoName}><Redo2 className="icon rtl-mirror" aria-hidden /></button></>;
  const pickElection = (arrows: boolean) => <ElectionPicker arrows={arrows} elections={elections} value={pmContestId ?? failedId ?? electionId} onChange={async value => { const pm = electionContext.pmContests.find(c => c.id === value && c.contestType === 'prime-minister-only'); if (await openElection(pm?.electionId ?? value as ElectionId)) onContestChange?.(pm?.id ?? null); }} />;
  /** Custom, naming the level it is based on (bar and phone menu alike) */
  /** the user's own choices for this level, named and counted beside the level; it opens them in Settings (owner,
   *  16 Nov 2026: one place to see and undo them). Nothing shows while there are none. */
  const own = ownChoices(custom, level).length;
  const ownChip = (before?: () => void) => own > 0 && <button type="button" className="btn small band-custom band-own" aria-haspopup="dialog"
    title={L(`${own} of your own choices for ${LEVEL_LABELS[level][0]}: open in Settings`, `${own} בחירות שלכם לרמת "${LEVEL_LABELS[level][1]}": פתיחה בהגדרות`)}
    aria-label={L(`${own} of your own choices for ${LEVEL_LABELS[level][0]}`, `${own} בחירות שלכם לרמת "${LEVEL_LABELS[level][1]}"`)}
    onClick={() => { before?.(); setState({ settingsOpen: true, settingsFocus: 'own' }); }}><span><bdi dir="ltr">+{own}</bdi> {L('own', 'משלכם')}</span></button>;
  const settingsPortal = createPortal(<PersonalSettings />, document.body);

  // the View controls, in the three-lines panel on a phone (the bar has no room for them there)
  const phoneView = <section aria-labelledby="pm-view">
          <h2 id="pm-view">{L('View', 'תצוגה')}</h2>
          <div className="phone-menu-field"><span>{L('Detail level', 'רמת פירוט')}</span>
            <span className="band-levels"><Seg<'simple' | 'standard' | 'expert'> label={L('Detail level', 'רמת פירוט')} value={level} onChange={setLevel} options={(['simple', 'standard', 'expert'] as const).map(v => ({ v, label: L(...LEVEL_LABELS[v]) }))} />
              {ownChip(() => { document.querySelector<HTMLElement>('.band-menu-btn')?.focus({ preventScroll: true }); setPhoneMenu(false); })}</span></div>
          <div className="phone-menu-field"><span>{L('Language', 'שפה')}</span>
            <Seg label={L('Language', 'שפה')} value={lang} onChange={(v) => setState({ lang: v })} options={[{ v: 'he', label: 'עברית', lang: 'he' }, { v: 'en', label: 'English', lang: 'en' }]} /></div>
          <div className="phone-menu-field"><span>{L('Theme', 'ערכת צבעים')}</span>
            <Seg label={L('Theme', 'ערכת צבעים')} value={themeChoice} onChange={(v) => setSetting('theme', v)} options={[{ v: 'device', label: L('Device', 'לפי המכשיר') }, { v: 'light', label: L('Light', 'בהיר') }, { v: 'dark', label: L('Dark', 'כהה') }]} /></div>
          {/* Settings gives focus back to its opener on closing; the menu is gone by then, so that is the Menu button */}
          <button className="btn small" aria-haspopup="dialog" onClick={() => { document.querySelector<HTMLElement>('.band-menu-btn')?.focus({ preventScroll: true }); setPhoneMenu(false); setState({ settingsOpen: true }); }}><Settings className="icon sm" aria-hidden />{L('Settings', 'הגדרות')}</button>
        </section>;

  // Two buttons, two jobs (owner, 16 Nov 2026): the three lines open the tools and the view; the scenario button opens
  // the scenario (switch, start over, save and share).
  if (phone) return (
    <header className="band band-phone" ref={trackBandHeight}>
      {/* the page's top heading: the bar has no room for the name on a phone */}
      <h1 className="sr-only">{L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}</h1>
      <button className="tool band-menu-btn" aria-label={L('Menu', 'תפריט') + (publicationPending(ds) ? ' · ' + L('Gazette not yet verified', 'הפרסום ברשומות טרם אומת') : '')} title={L('Menu', 'תפריט')} aria-expanded={phoneMenu} aria-controls="app-menu"
        onClick={() => { setScenarioPanel(false); setPhoneMenu(m => !m); }}>{phoneMenu ? <X className="icon" aria-hidden /> : <Menu className="icon" aria-hidden />}{publicationPending(ds) && !phoneMenu && <span className="band-menu-flag" aria-hidden>!</span>}</button>
      {pickElection(false)}
      {!pmContestId && s && <PhoneStatus s={s} ds={ds} open={scenarioPanel} onOpen={() => { setPhoneMenu(false); setScenarioPanel(o => !o); }} />}
      {!pmContestId && s && <span className="band-undo">{undoRedo}</span>}
      {phoneMenu && <AppMenu onClose={() => setPhoneMenu(false)}>
        {phoneView}
        {ds && !pmContestId && <section aria-labelledby="pm-about"><h2 id="pm-about">{L('This election', 'הבחירות האלה')}</h2><ElectionAbout electionId={ds.id} /></section>}
      </AppMenu>}
      {scenarioPanel && !pmContestId && s && ds && <PhoneMenu onClose={() => setScenarioPanel(false)} label={L('Scenario', 'תרחיש')}>
        <section className="phone-menu-scenario" aria-labelledby="pm-scenario">
          <h2 id="pm-scenario">{L('Scenario', 'תרחיש')}</h2>
          <ScenarioSwitcher s={s} ds={ds} onPicked={() => setScenarioPanel(false)} />
          <div className="phone-menu-row">
            <button className="btn small" onClick={() => { startOver(); }} disabled={!s.log.length}><RotateCcw className="icon sm" aria-hidden />{L('Start over', 'התחלה מחדש')}</button>
          </div>
          <div className="phone-menu-share"><h2>{L('Save & share', 'שמירה ושיתוף')}</h2>
            <div className="phone-menu-share-items">{shareItems(() => setScenarioPanel(false))}</div></div>
        </section>
      </PhoneMenu>}
      {fileInput}
      {settingsPortal}
    </header>
  );

  return (
    <header className="band" ref={trackBandHeight}>
      {/* short or narrow screens: the tools in a side panel, since the tab rows scroll away or are cut there */}
      <button type="button" className="tool band-tools-btn" aria-label={L('Tools', 'כלים')} title={L('Tools', 'כלים')} aria-expanded={toolsPanel} aria-controls="app-menu" onClick={() => setToolsPanel(o => !o)}><Menu className="icon" aria-hidden /></button>
      {toolsPanel && <AppMenu onClose={() => setToolsPanel(false)} />}
      <h1 className="brand" aria-label={L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}><span className="brand-full">{L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}</span><span className="brand-short">{L('Elections', 'סייר הבחירות')}</span></h1>
      {pickElection(true)}
      {ds && !pmContestId && <ElectionAbout electionId={ds.id} />}
      {s && ds && <ScenarioSwitcher s={s} ds={ds} />}

      <span className="band-levels"><Seg<'simple' | 'standard' | 'expert'> label={L('Detail level', 'רמת פירוט')} value={level} onChange={setLevel} options={(['simple', 'standard', 'expert'] as const).map(v => ({ v, label: L(...LEVEL_LABELS[v]) }))} />{ownChip()}</span>
      <span className="spacer" />
      <div className="band-actions">
      {/* scenario tools need a scenario: hidden while an election loads or after it failed to load */}
      {!pmContestId && s && <>
      {undoRedo}
      <button className="tool" aria-label={L('Start over', 'התחלה מחדש')} title={L('Start over', 'התחלה מחדש')} onClick={startOver} disabled={!s?.log.length}>
        <RotateCcw className="icon" aria-hidden /><span className="label">{L('Start over', 'התחלה מחדש')}</span></button>
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button className="tool" aria-label={L('Save & share', 'שמירה ושיתוף')} title={L('Save & share', 'שמירה ושיתוף')} ref={menuButton} aria-expanded={menu} aria-controls="scenarios-menu" onClick={() => setMenu((m) => !m)}>
          <Share2 className="icon" aria-hidden /><span className="label">{L('Save & share', 'שמירה ושיתוף')}</span><ChevronDown className="icon sm" aria-hidden /></button>
        {menu && (
          <div ref={popupRef} className="menu-pop" id="scenarios-menu">
            {shareItems(() => setMenu(false))}
          </div>
        )}
        {fileInput}
      </div>
      </>}
      <button className="tool" aria-haspopup="dialog" title={L('Settings', 'הגדרות')} aria-label={L('Settings', 'הגדרות')} onClick={() => setState({ settingsOpen: true })}><Settings className="icon" aria-hidden /></button>
      {/* outside the dark top bar, so none of the bar's own control styles reach the popup */}
      {settingsPortal}
      <Seg label={L('Language', 'שפה')} value={lang} onChange={(v) => setState({ lang: v })} options={[{ v: 'he', label: 'עב', lang: 'he', name: 'עברית' }, { v: 'en', label: 'EN', lang: 'en', name: 'English' }]} />
      <button className="tool" title={theme === 'dark' ? L('Light theme', 'מצב בהיר') : L('Dark theme', 'מצב כהה')} aria-label={theme === 'dark' ? L('Light theme', 'מצב בהיר') : L('Dark theme', 'מצב כהה')} onClick={toggleTheme}>
        {theme === 'dark' ? <Sun className="icon" aria-hidden /> : <Moon className="icon" aria-hidden />}</button>
      </div>
    </header>
  );
}

/** The tools strip sticks directly under the band, whose height grows when its tools wrap (tablets). */
let bandObserver: ResizeObserver | null = null;
function trackBandHeight(band: HTMLElement | null) {
  bandObserver?.disconnect();
  if (!band || typeof ResizeObserver === 'undefined') return;
  bandObserver = new ResizeObserver(() => document.documentElement.style.setProperty('--band-h', `${band.offsetHeight}px`));
  bandObserver.observe(band);
}

/** One rename per commit (Enter or leaving the field), not one undo step per keystroke; Escape restores. */
function ScenarioName({ name, placeholder, label }: { name: string; placeholder: string; label: string }) {
  const [v, setV] = useState(name);
  const commit = () => { const t = v.trim(); if (t !== name) dispatch({ type: 'rename', name: t }); };
  return <input type="text" className="scenario-name-field" value={v} placeholder={placeholder} aria-label={label}
    onChange={(e) => setV(e.target.value)} onBlur={commit}
    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { e.stopPropagation(); setV(name); } }} />;
}

/** The result's publication is not yet verified (the About line says so on wider screens). */
const publicationPending = (ds: ElectionDataset | undefined) => !!ds && electionContext.events.some(e => e.electionId === ds.id && e.type === 'publication-status');

/** Phone bar: what is on screen, at a glance (mark every edit): the official result, or the scenario's name and how
 *  many changes it holds. Pressing it opens the scenario panel (the three lines open the tools and view). */
function PhoneStatus({ s, ds, open, onOpen }: { s: Scenario; ds: ElectionDataset | undefined; open: boolean; onOpen: () => void }) {
  const L = useL();
  const saved = useStore(st => st.saved);
  const key = useStore(st => scenarioKey(st));
  const official = !key || key === 'official';
  const count = official ? 0 : changeCount(s, null);
  const changed = !official && !!ds && resultChanges(s, baselineOf(ds)).length > 0;
  const name = official ? L('Official', 'רשמי') : s.name || L('Untitled', 'ללא שם');
  const changes = count === 1 ? L('1 change', 'שינוי אחד') : L(`${count} changes`, `${count} שינויים`);
  return <button type="button" className="band-status" aria-expanded={open} aria-controls="phone-menu" data-official={official ? '' : undefined}
    aria-label={(official ? L('Official result', 'התוצאה הרשמית') : `${name} · ${changes}`) + ' · ' + L('Scenario menu', 'תפריט התרחיש')} onClick={onOpen}>
    <span className="swatch" style={{ background: changed ? liveScenarioColor(s, saved) : 'var(--muted)' }} aria-hidden />
    <span className="band-status-name">{name}</span>
    {!official && <span className="band-status-count" aria-hidden>{count}</span>}
  </button>;
}

/** The phone's scenario panel: a panel under the bar, outside it (so none of the dark bar's control styles reach it). It closes
 *  on Escape (focus returns to the scenario button), a press outside or focus moving outside; the scenario button
 *  toggles it. */
function PhoneMenu({ onClose, label, children }: { onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  // under the bar; when the bar has scrolled away (it is not sticky on phones), at the top of the screen instead of hidden
  useFloating(ref, () => { const r = document.querySelector('.band')?.getBoundingClientRect(); return r && { left: r.left, right: r.right, top: Math.max(r.top, 0), bottom: Math.max(r.bottom, 0) }; });
  // it covers the page: focus moving to the page behind it (Tab past its end, Shift+Tab before its start) closes it
  useCloseOnFocusAway(true, t => !!ref.current?.contains(t) || !!t.closest('.band-status'), () => close.current());
  useEffect(() => {
    const onClose = () => close.current();
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) { onClose(); document.querySelector<HTMLElement>('.band-status')?.focus({ preventScroll: true }); } };
    const onDown = (e: PointerEvent) => { const t = e.target as Element; if (!ref.current?.contains(t) && !t.closest?.('.band-status, dialog')) onClose(); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, []);
  return createPortal(<div ref={ref} id="phone-menu" className="phone-menu" role="dialog" aria-label={label} tabIndex={-1}>{children}</div>, document.body);
}
