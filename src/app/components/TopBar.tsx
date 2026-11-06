import { ScenarioSave, UnsavedMark } from './ScenarioSave.tsx';
import { listLabel } from '../derive.ts';
import { useFloating } from '../floating.tsx';
import { ScenarioSwitcher } from './ScenarioSwitcher.tsx';
import { useActiveReference } from '../useActiveReference.ts';
import { ElectionAbout } from './ElectionContext.tsx';
import { changeText } from '../changeValue.tsx';
import { electionContext } from '../../data/electionContext.ts';
import { exportAnnotations } from '../scenarioExport.ts';
import { baselineOf, editPathLabel, markerReference, referenceChanges } from '../derive.ts';
import { savedColor } from '../scenarioIdentity.ts';
import { describe } from '../actionDescription.ts';
import { useEffect, useRef, useState } from 'react';
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { csvEscape, download } from '../format.ts';
import { deleteSaved, dispatch, duplicateCurrent, importScenarioJson, openElection, openImported, openSaved, redo, resetAll, scenarioKey, setState, shareLink, toast, undo, useStore } from '../store.ts';
import { ChevronDown, Copy, Download, FolderOpen, Link2, Moon, Redo2, RotateCcw, Save, Share2, Sun, Table2, Trash2, Undo2, Upload } from 'lucide-react';
import { Seg } from './ui.tsx';
import { LEVEL_LABELS } from '../features.ts';

export { electionLabel } from '../electionLabel.ts';
import { ElectionPicker } from './ElectionPicker.tsx';

const fileName = (n: string) => (n || 'scenario').replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'scenario';

export function TopBar({ s, r, ds, baseR, pmContestId = null, onContestChange }: { s: Scenario | null; r: AllocationResult | null; ds: ElectionDataset | undefined; baseR: AllocationResult | null; pmContestId?: string | null; onContestChange?: (id: string | null) => void }) {
  const L = useL();
  const lang = useLang();
  const electionId = useStore((st) => st.electionId);
  const index = useStore((st) => st.elections);
  // the open election always has a correctly labelled option, even if the index lacks it
  const elections = ds && !index.some((e) => e.id === ds.id)
    ? [...index, { id: ds.id, knesset: ds.knesset, date: ds.electionDate, nameHe: ds.nameHe, nameEn: ds.nameEn, available: true, status: { stage: ds.status.stage } }].sort((a, b) => b.date.localeCompare(a.date))
    : index;
  const { reference } = useActiveReference();
  const theme = useStore((st) => st.theme);
  const custom = useStore(st => st.customFeatures);
  const level = useStore((st) => st.level);
  const canUndo = useStore((st) => st.past.length > 0);
  const canRedo = useStore((st) => st.future.length > 0);
  const future = useStore(st => st.future);
  const last = s?.log.at(-1);
  const next = future.at(-1)?.log.at(-1);
  const undoName = last && s ? L('Undo: ', 'ביטול: ') + describe(last.action, s, lang) : L('Undo', 'ביטול');
  const redoName = next && s ? L('Redo: ', 'חזרה: ') + describe(next.action, future.at(-1)!, lang) : L('Redo', 'חזרה');
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
  const [shareUrl, setShareUrl] = useState('');
  // A link describes one snapshot; never offer an older snapshot after an edit.
  useEffect(() => setShareUrl(''), [s]);

  const exportCsv = () => {
    if (!s || !r || !baseR) return;
    const markerBase = reference || (ds ? baselineOf(ds) : s);
    const marked = referenceChanges(s, markerBase);
    const head = ['edited', 'letters', 'list', 'votes', 'pct_valid', 'qualified', 'whole_quota_seats', 'seats', 'historical_seats'];
    const rows = s.lists.map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return [marked.filter(p => p[0] === 'lists' && p[1] === l.id).map(p => editPathLabel(s, p, lang, markerBase) + ' · ' + L('Edited: was ', 'נערך: קודם ') + (changeText(markerReference(s,markerBase,p), p, lang))).join('; '), l.letters, listLabel(l, lang), l.votes, ((l.votes / Number(r.totalValid)) * 100).toFixed(6), lr.qualified, lr.initialSeats, lr.seats, baseR.lists.find((x) => x.id === l.id)?.seats ?? '']; });
    download(`${s.electionId}-${fileName(s.name)}.csv`, '﻿' + [head, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
  };

  return (
    <header className="band" ref={trackBandHeight}>
      <span className="brand"><span className="brand-full">{L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}</span><span className="brand-short">{L('Elections', 'סייר הבחירות')}</span></span>
      <ElectionPicker elections={elections} value={pmContestId ?? electionId} onChange={async value => { const pm = electionContext.pmContests.find(c => c.id === value && c.contestType === 'prime-minister-only'); if (await openElection(pm?.electionId ?? value as ElectionId)) onContestChange?.(pm?.id ?? null); }} />
      {ds && !pmContestId && <ElectionAbout electionId={ds.id} />}
      {s && ds && <ScenarioSwitcher s={s} ds={ds} />}

      <span className="band-levels"><Seg<'simple' | 'standard' | 'expert' | 'custom'> label={L('Detail level', 'רמת פירוט')} value={custom ? 'custom' : level} onChange={(v) => { if (v === 'custom') return; setState({ level: v, customFeatures: null, ...(v === 'simple' ? { voteSource: { kind: 'proportional' as const } } : {}) }); }} options={(['simple', 'standard', 'expert'] as const).map(v => ({ v, label: L(...LEVEL_LABELS[v]) }))} /><button className="btn small band-custom" aria-label={custom ? L('Custom', 'מותאם') + ' · ' + L('based on ', 'על בסיס ') + L(...LEVEL_LABELS[level]) : L('Custom', 'מותאם')} aria-pressed={custom !== null} title={custom ? L('Custom · based on ', 'מותאם · על בסיס ') + L(...LEVEL_LABELS[level]) : L('Custom', 'מותאם')} onClick={() => setState({ tool: 'custom' })}>{L('Custom', 'מותאם')}{custom && <span className="band-custom-base"> · {L('based on ', 'על בסיס ')}{L(...LEVEL_LABELS[level])}</span>}</button></span>
      <span className="spacer" />
      {/* scenario tools need a scenario: hidden while an election loads or after it failed to load */}
      {!pmContestId && s && <>
      <button className="tool" onClick={undo} disabled={!canUndo} title={undoName + ' (Ctrl+Z)'} aria-label={undoName}><Undo2 className="icon rtl-mirror" aria-hidden /></button>
      <button className="tool" onClick={redo} disabled={!canRedo} title={redoName + ' (Ctrl+Y)'} aria-label={redoName}><Redo2 className="icon rtl-mirror" aria-hidden /></button>
      <button className="tool" aria-label={L('Start over', 'התחלה מחדש')} title={L('Start over', 'התחלה מחדש')} onClick={() => { if (!s?.log.length || confirm(L('Start over from the official result? (Undo can restore it.)', 'להתחיל מחדש מהתוצאה הרשמית? (ניתן לבטל)'))) resetAll(); }} disabled={!s?.log.length}>
        <RotateCcw className="icon" aria-hidden /><span className="label">{L('Start over', 'התחלה מחדש')}</span></button>
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button className="tool" aria-label={L('Save & share', 'שמירה ושיתוף')} title={L('Save & share', 'שמירה ושיתוף')} ref={menuButton} aria-expanded={menu} aria-controls="scenarios-menu" onClick={() => setMenu((m) => !m)}>
          <Share2 className="icon" aria-hidden /><span className="label">{L('Save & share', 'שמירה ושיתוף')}</span><ChevronDown className="icon sm" aria-hidden /></button>
        {menu && (
          <div ref={popupRef} className="menu-pop" id="scenarios-menu">
            {s && <ScenarioName key={`${s.id}-${s.name}`} name={s.name} placeholder={L('Untitled scenario', 'תרחיש ללא שם')} label={L('Scenario name', 'שם התרחיש')} />}{dirty && <UnsavedMark />}
            <ScenarioSave onSaved={() => setMenu(false)} className="btn small" disabled={!s}><Save className="icon sm" aria-hidden />{L('Save in this browser', 'שמירה בדפדפן')}</ScenarioSave>
            <ScenarioSave as onSaved={() => setMenu(false)} className="btn small" disabled={!s}>{L('Save as…', 'שמירה בשם…')}</ScenarioSave>
            <button className="btn small" onClick={async () => {
              const url = await shareLink(); setShareUrl(url);
              try { await navigator.clipboard.writeText(url); toast('info', L('Share link copied', 'קישור השיתוף הועתק')); }
              catch { toast('info', L('Copy the link from the field below.', 'העתיקו את הקישור מהשדה שלמטה.')); }
            }}><Link2 className="icon sm" aria-hidden />{L('Copy a share link', 'העתקת קישור שיתוף')}</button>
            {shareUrl && <input type="text" readOnly value={shareUrl} aria-label={L('Share link', 'קישור שיתוף')} onFocus={(e) => e.target.select()} style={{ width: '100%' }} />}
            <button className="btn small" onClick={() => { duplicateCurrent(); toast('info', L('Saved as a copy in this browser.', 'נשמר עותק בדפדפן זה.')); setMenu(false); }}><Copy className="icon sm" aria-hidden />{L('Duplicate scenario', 'שכפול תרחיש')}</button>
            <button className="btn small" onClick={() => { if (s && ds) download(`${s.electionId}-${fileName(s.name)}.json`, JSON.stringify({ ...s, ...exportAnnotations(s, lang), datasetBuiltAt: ds.buildInfo.builtAt }, null, 1), 'application/json'); setMenu(false); }}><Download className="icon sm" aria-hidden />{L('Export scenario (JSON)', 'ייצוא תרחיש (JSON)')}</button>
            <button className="btn small" onClick={() => fileRef.current?.click()}><Upload className="icon sm" aria-hidden />{L('Import scenario (JSON)', 'ייבוא תרחיש (JSON)')}</button>
            <button className="btn small" onClick={() => { exportCsv(); setMenu(false); }}><Table2 className="icon sm" aria-hidden />{L('Export results table (CSV)', 'ייצוא טבלת תוצאות (CSV)')}</button>
            <button className="btn small" onClick={() => { setState({ tool: 'scenarios' }); setMenu(false); }}><FolderOpen className="icon sm" aria-hidden />{L('All scenarios', 'כל התרחישים')}</button>
            <div className="section-title" style={{ margin: '8px 0 2px' }}>{L('Saved in this browser', 'שמורים בדפדפן')}</div>
            {saved.length === 0 && <p className="small muted" style={{ margin: 0 }}>{L('Nothing saved yet.', 'אין עדיין.')}</p>}
            {saved.map((x) => (
              <div key={x.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <button className="btn small ghost" style={{ justifyContent: 'flex-start', minWidth: 0 }} aria-current={x.id === s?.id ? 'true' : undefined} disabled={x.id === s?.id && !dirty} onClick={() => { void openSaved(x); setMenu(false); }}>
                  <span className="swatch" style={{ background: savedColor(x.log) }} /><span className="clip" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.name}{x.id === s?.id && dirty && <UnsavedMark />}</span> <span className="muted">({elections.find((e) => e.id === x.electionId)?.date.slice(0, 4) ?? x.electionId})</span>{x.id === s?.id && <span aria-hidden>✓</span>}</button>
                <span className="row" style={{ flexWrap: 'nowrap', gap: 2 }}>
                  <button className="btn small ghost" onClick={() => { setState({ compareWith: x.id, tool: 'compare' }); setMenu(false); }} disabled={x.electionId !== electionId || x.id === s?.id}>{L('Compare', 'השוואה')}</button>
                  <button className="btn small ghost danger icon-only" aria-label={L(`Delete ${x.name}`, `מחיקת ${x.name}`)} onClick={() => { if (confirm(L(`Delete “${x.name}” from this browser?`, `למחוק את "${x.name}" מהדפדפן?`))) deleteSaved(x.id); }}><Trash2 className="icon sm" aria-hidden /></button>
                </span>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try {
            if (await openImported(importScenarioJson(await f.text()))) toast('info', L('Scenario imported.', 'התרחיש יובא.'));
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            toast('error', L(msg, `לא ניתן לייבא את התרחיש (${msg})`));
          }
          e.target.value = ''; setMenu(false);
        }} />
      </div>
      </>}
      <Seg label={L('Language', 'שפה')} value={lang} onChange={(v) => setState({ lang: v })} options={[{ v: 'he', label: 'עב' }, { v: 'en', label: 'EN' }]} />
      <button className="tool" title={theme === 'dark' ? L('Light theme', 'מצב בהיר') : L('Dark theme', 'מצב כהה')} aria-label={theme === 'dark' ? L('Light theme', 'מצב בהיר') : L('Dark theme', 'מצב כהה')} onClick={() => setState({ theme: theme === 'dark' ? 'light' : 'dark' })}>
        {theme === 'dark' ? <Sun className="icon" aria-hidden /> : <Moon className="icon" aria-hidden />}</button>
    </header>
  );
}

/** The tools strip sticks directly under the band, whose height grows when its tools wrap (tablets). */
let bandObserver: ResizeObserver | null = null;
function trackBandHeight(band: HTMLElement | null) {
  bandObserver?.disconnect();
  if (!band || typeof ResizeObserver === 'undefined') return;
  bandObserver = new ResizeObserver(() => document.documentElement.style.setProperty('--band-h', `${Math.round(band.getBoundingClientRect().height)}px`));
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
