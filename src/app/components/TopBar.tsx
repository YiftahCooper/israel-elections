import { ChoicePicker } from './ChoicePicker.tsx';
import { ScenarioSwitcher } from './ScenarioSwitcher.tsx';
import { useActiveReference } from '../useActiveReference.ts';
import { ElectionAbout } from './ElectionContext.tsx';
import { changeText } from '../changeValue.tsx';
import { electionContext } from '../../data/electionContext.ts';
import { exportAnnotations } from '../scenarioExport.ts';
import { baselineOf, editPathLabel, referenceChanges } from '../derive.ts';
import { savedColor } from '../scenarioIdentity.ts';
import { describe } from '../actionDescription.ts';
import { useEffect, useRef, useState } from 'react';
import type { ElectionDataset, ElectionId, ElectionIndexEntry } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { csvEscape, download } from '../format.ts';
import { dispatch, duplicateCurrent, getState, importScenarioJson, openElection, redo, resetAll, saveCurrent, setState, shareLink, toast, undo, useStore } from '../store.ts';
import { ChevronDown, Copy, Download, FolderOpen, Link2, Moon, Redo2, RotateCcw, Save, Share2, Sun, Table2, Trash2, Undo2, Upload } from 'lucide-react';
import { Seg } from './ui.tsx';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HE = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];
const ordinalEn = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
/** "2026 · 26th"; the month is added when two elections fall in the same year (2019). */
export function electionLabel(e: ElectionIndexEntry, all: ElectionIndexEntry[], lang: 'he' | 'en') {
  const year = e.date.slice(0, 4);
  const month = Number(e.date.slice(5, 7)) - 1;
  const when = all.filter((x) => x.date.slice(0, 4) === year).length > 1 ? `${(lang === 'he' ? MONTHS_HE : MONTHS_EN)[month]} ${year}` : year;
  return lang === 'he' ? `${when} · הכנסת ה-${e.knesset}` : `${when} · ${ordinalEn(e.knesset)} Knesset`;
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  // the menu closes on Escape (focus returns to its button) or a press outside it, not on mouse leave,
  // so keyboard and touch users can use it
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); menuButton.current?.focus(); } };
    const onDown = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [menu]);
  const [shareUrl, setShareUrl] = useState('');

  const exportCsv = () => {
    if (!s || !r || !baseR) return;
    const markerBase = reference || (ds ? baselineOf(ds) : s);
    const marked = referenceChanges(s, markerBase);
    const head = ['edited', 'letters', 'list', 'votes', 'pct_valid', 'qualified', 'whole_quota_seats', 'seats', 'historical_seats'];
    const rows = s.lists.map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return [marked.filter(p => p[0] === 'lists' && p[1] === l.id).map(p => editPathLabel(s, p, lang, markerBase) + ' · ' + L('Edited: was ', 'נערך: קודם ') + (changeText(markerBase, p, lang))).join('; '), l.letters, l.nameHe, l.votes, ((l.votes / Number(r.totalValid)) * 100).toFixed(6), lr.qualified, lr.initialSeats, lr.seats, baseR.lists.find((x) => x.id === l.id)?.seats ?? '']; });
    download(`${s.electionId}-${fileName(s.name)}.csv`, '﻿' + [head, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
  };

  return (
    <header className="band">
      <span className="brand">{L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}</span>
      <ChoicePicker confirmLabel={L('Open', 'פתיחה')} className="election" label={L('Election', 'בחירות')} value={pmContestId ?? electionId} options={[
        ...elections.map(e => ({ value: e.id, label: electionLabel(e, elections, lang), detail: e.date + (e.date.startsWith('2019') ? (e.knesset === 21 ? ' · 2019a' : ' · 2019b') : '') + (e.available ? '' : L(' — not yet available', ' — עדיין לא זמין')), group: Number(e.date.slice(0, 4)) >= 2015 ? L('2015–present · 3.25%', '2015–היום · 3.25%') : Number(e.date.slice(0, 4)) >= 2003 ? '2003–2013 · 2%' : Number(e.date.slice(0, 4)) >= 1992 ? '1992–1999 · 1.5%' : '1949–1988 · 1%', disabled: !e.available })),
        ...electionContext.pmContests.filter(c => c.contestType === 'prime-minister-only').map(c => ({ value: c.id, label: c.effectiveDate.slice(0, 4) + ' · ' + L('Prime Minister only', 'ראש הממשלה בלבד'), detail: c.effectiveDate, group: L('Direct election · separate contest', 'בחירה ישירה · הליך נפרד') }))
      ].sort((a, b) => b.detail.slice(0, 10).localeCompare(a.detail.slice(0, 10)))} onChange={async value => { const pm = electionContext.pmContests.find(c => c.id === value && c.contestType === 'prime-minister-only'); if (await openElection(pm?.electionId ?? value as ElectionId)) onContestChange?.(pm?.id ?? null); }} />
      {ds && !pmContestId && <ElectionAbout electionId={ds.id} />}
      {s && ds && <ScenarioSwitcher s={s} ds={ds} />}

      <Seg<'simple' | 'standard' | 'expert' | 'custom'> label={L('Detail level', 'רמת פירוט')} value={custom ? 'custom' : level} onChange={(v) => { if (v === 'custom') return; setState({ level: v, customFeatures: null, ...(v === 'simple' ? { voteSource: { kind: 'proportional' as const } } : {}) }); }} options={[{ v: 'simple', label: L('Simple', 'פשוט') }, { v: 'standard', label: L('Standard', 'רגיל') }, { v: 'expert', label: L('Expert', 'מומחה') }]} /><button className="btn small band-custom" aria-pressed={custom !== null} title={custom ? L('Custom · based on ', 'מותאם · על בסיס ') + L({simple:'Simple',standard:'Standard',expert:'Expert'}[level], {simple:'פשוט',standard:'רגיל',expert:'מומחה'}[level]) : L('Custom','מותאם')} onClick={() => setState({ tool: 'custom' })}>{custom ? L('Custom', 'מותאם') + ' · ' + L('based on ', 'על בסיס ') + L({simple:'Simple',standard:'Standard',expert:'Expert'}[level], {simple:'פשוט',standard:'רגיל',expert:'מומחה'}[level]) : L('Custom', 'מותאם')}</button>
      <span className="spacer" />
      {!pmContestId && <>
      <button className="tool" onClick={undo} disabled={!canUndo} title={undoName + ' (Ctrl+Z)'} aria-label={undoName}><Undo2 className="icon" aria-hidden /></button>
      <button className="tool" onClick={redo} disabled={!canRedo} title={redoName + ' (Ctrl+Y)'} aria-label={redoName}><Redo2 className="icon" aria-hidden /></button>
      <button className="tool" aria-label={L('Start over', 'התחלה מחדש')} title={L('Start over', 'התחלה מחדש')} onClick={() => { if (!s?.log.length || confirm(L('Reset the whole election to the historical result? (Undo can restore it.)', 'לאפס את כל הבחירות לתוצאה ההיסטורית? (ניתן לבטל)'))) resetAll(); }} disabled={!s?.log.length}>
        <RotateCcw className="icon" aria-hidden /><span className="label">{L('Start over', 'התחלה מחדש')}</span></button>
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button className="tool" aria-label={L('Save & share', 'שמירה ושיתוף')} title={L('Save & share', 'שמירה ושיתוף')} ref={menuButton} aria-expanded={menu} aria-controls="scenarios-menu" onClick={() => setMenu((m) => !m)}>
          <Share2 className="icon" aria-hidden /><span className="label">{L('Save & share', 'שמירה ושיתוף')}</span><ChevronDown className="icon sm" aria-hidden /></button>
        {menu && (
          <div className="menu-pop" id="scenarios-menu">
            {s && <ScenarioName key={`${s.id}-${s.name}`} name={s.name} placeholder={L('Untitled scenario', 'תרחיש ללא שם')} label={L('Scenario name', 'שם התרחיש')} />}
            <button className="btn small" onClick={() => { if (saveCurrent(getState().scenario?.name || undefined)) toast('info', L('Saved in this browser.', 'נשמר בדפדפן זה.')); setMenu(false); }} disabled={!s}><Save className="icon sm" aria-hidden />{L('Save in this browser', 'שמירה בדפדפן')}</button>
            <button className="btn small" onClick={async () => {
              const url = await shareLink(); setShareUrl(url);
              try { await navigator.clipboard.writeText(url); toast('info', L(`Share link copied (${url.length} characters).`, `קישור השיתוף הועתק (${url.length} תווים).`)); }
              catch { toast('info', L('Copy the link from the field below.', 'העתיקו את הקישור מהשדה שלמטה.')); }
            }}><Link2 className="icon sm" aria-hidden />{L('Copy a share link', 'העתקת קישור שיתוף')}</button>
            {shareUrl && <input type="text" readOnly value={shareUrl} aria-label={L('Share link', 'קישור שיתוף')} onFocus={(e) => e.target.select()} style={{ width: '100%' }} />}
            <button className="btn small" onClick={() => { duplicateCurrent(); setMenu(false); }}><Copy className="icon sm" aria-hidden />{L('Duplicate as a new scenario', 'שכפול לתרחיש חדש')}</button>
            <button className="btn small" onClick={() => { if (s && ds) download(`${s.electionId}-${fileName(s.name)}.json`, JSON.stringify({ ...s, ...exportAnnotations(s, lang), datasetBuiltAt: ds.buildInfo.builtAt }, null, 1), 'application/json'); setMenu(false); }}><Download className="icon sm" aria-hidden />{L('Export scenario (JSON)', 'ייצוא תרחיש (JSON)')}</button>
            <button className="btn small" onClick={() => fileRef.current?.click()}><Upload className="icon sm" aria-hidden />{L('Import scenario (JSON)', 'ייבוא תרחיש (JSON)')}</button>
            <button className="btn small" onClick={() => { exportCsv(); setMenu(false); }}><Table2 className="icon sm" aria-hidden />{L('Export results table (CSV)', 'ייצוא טבלת תוצאות (CSV)')}</button>
            <button className="btn small" onClick={() => { setState({ tool: 'scenarios' }); setMenu(false); }}><FolderOpen className="icon sm" aria-hidden />{L('All scenarios: names, descriptions, results', 'כל התרחישים: שמות, תיאורים ותוצאות')}</button>
            <div className="section-title" style={{ margin: '8px 0 2px' }}>{L('Saved in this browser', 'שמורים בדפדפן')}</div>
            {saved.length === 0 && <p className="small muted" style={{ margin: 0 }}>{L('Nothing saved yet.', 'אין עדיין.')}</p>}
            {saved.map((x) => (
              <div key={x.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <button className="btn small ghost" style={{ justifyContent: 'flex-start', minWidth: 0 }} onClick={() => { openElection(x.electionId, { name: x.name, log: x.log, baseBuiltAt: x.baseBuiltAt }).then(() => setState((st) => ({ scenario: st.scenario ? { ...st.scenario, id: x.id } : null }))); setMenu(false); }}>
                  <span className="swatch" style={{ background: savedColor(x.log) }} /><span className="clip" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.name}</span> <span className="muted">({elections.find((e) => e.id === x.electionId)?.date.slice(0, 4) ?? x.electionId})</span></button>
                <span className="row" style={{ flexWrap: 'nowrap', gap: 2 }}>
                  <button className="btn small ghost" onClick={() => { setState({ compareWith: x.id }); setMenu(false); }} disabled={x.electionId !== electionId || x.id === s?.id}>{L('compare', 'השוואה')}</button>
                  <button className="btn small ghost danger icon-only" aria-label={L('Delete', 'מחיקה')} onClick={() => setState((st) => ({ saved: st.saved.filter((y) => y.id !== x.id) }))}><Trash2 className="icon sm" aria-hidden /></button>
                </span>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try {
            const sc = importScenarioJson(await f.text());
            await openElection(sc.electionId);
            const st = getState(); setState({ scenario: sc, reference: sc, past: st.scenario && st.scenario.electionId === sc.electionId ? [...st.past, st.scenario] : st.past, future: [] });
            toast('info', L('Scenario imported.', 'התרחיש יובא.'));
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

/** One rename per commit (Enter or leaving the field), not one undo step per keystroke; Escape restores. */
function ScenarioName({ name, placeholder, label }: { name: string; placeholder: string; label: string }) {
  const [v, setV] = useState(name);
  const commit = () => { const t = v.trim(); if (t !== name) dispatch({ type: 'rename', name: t }); };
  return <input type="text" className="scenario-name-field" value={v} placeholder={placeholder} aria-label={label}
    onChange={(e) => setV(e.target.value)} onBlur={commit}
    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { e.stopPropagation(); setV(name); } }} />;
}
