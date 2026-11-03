import { useRef, useState } from 'react';
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { csvEscape, download } from '../format.ts';
import { duplicateCurrent, getState, importScenarioJson, openElection, redo, resetAll, saveCurrent, setState, shareLink, toast, undo, useStore } from '../store.ts';
import { Seg } from './ui.tsx';

export function TopBar({ s, r, ds, baseR }: { s: Scenario | null; r: AllocationResult | null; ds: ElectionDataset | undefined; baseR: AllocationResult | null }) {
  const L = useL();
  const lang = useLang();
  const electionId = useStore((st) => st.electionId);
  const theme = useStore((st) => st.theme);
  const level = useStore((st) => st.level);
  const layout = useStore((st) => st.layout);
  const colorBy = useStore((st) => st.colorBy);
  const canUndo = useStore((st) => st.past.length > 0);
  const canRedo = useStore((st) => st.future.length > 0);
  const saved = useStore((st) => st.saved);
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const exportCsv = () => {
    if (!s || !r || !baseR) return;
    const head = ['letters', 'list', 'votes', 'pct_valid', 'qualified', 'whole_quota_seats', 'seats', 'historical_seats'];
    const rows = s.lists.map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return [l.letters, l.nameHe, l.votes, ((l.votes / Number(r.totalValid)) * 100).toFixed(6), lr.qualified, lr.initialSeats, lr.seats, baseR.lists.find((x) => x.id === l.id)?.seats ?? '']; });
    download(`${s.electionId}-${(s.name || 'scenario').replace(/\W+/g, '_')}.csv`, '﻿' + [head, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
  };

  return (
    <div className="topbar">
      <div className="brand">{L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}<small>{L('Exact Bader–Ofer simulator', 'סימולטור מדויק בשיטת בדר–עופר')}</small></div>
      <Seg label={L('Election', 'בחירות')} value={electionId} onChange={(v: ElectionId) => openElection(v)} options={[{ v: 'k26', label: L('2026 · 26th', '2026 · ה-26') }, { v: 'k25', label: L('2022 · 25th', '2022 · ה-25') }]} />
      {s && (
        <input type="text" value={s.name} placeholder={L('Untitled scenario', 'תרחיש ללא שם')} aria-label={L('Scenario name', 'שם התרחיש')} style={{ width: 170 }}
          onChange={(e) => setState({ scenario: { ...s, name: e.target.value } })} />
      )}
      {s && (s.mode === 'experimental' ? <span className="chip exp" title={L('Electoral rules may differ from Israeli law', 'הכללים עשויים להיות שונים מהחוק')}>{L('Experimental rules', 'כללים ניסיוניים')}</span> : <span className="chip ok">{L('Historical rules', 'כללים היסטוריים')}</span>)}
      <button className="btn small" onClick={undo} disabled={!canUndo} title="Ctrl+Z">↶ {L('Undo', 'ביטול')}</button>
      <button className="btn small" onClick={redo} disabled={!canRedo} title="Ctrl+Y">↷ {L('Redo', 'חזרה')}</button>
      <button className="btn small" onClick={() => { if (!s?.log.length || confirm(L('Reset the whole election to the historical result? (Undo can restore it.)', 'לאפס את כל הבחירות לתוצאה ההיסטורית? (ניתן לבטל)'))) resetAll(); }} disabled={!s?.log.length}>{L('Reset all', 'איפוס')}</button>
      <button className="btn small" onClick={() => { saveCurrent(s?.name || undefined); toast('info', L('Saved in this browser.', 'נשמר בדפדפן זה.')); }} disabled={!s}>{L('Save', 'שמירה')}</button>
      <div style={{ position: 'relative' }}>
        <button className="btn small" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>{L('Scenarios', 'תרחישים')} ▾</button>
        {menu && (
          <div className="panel" style={{ position: 'absolute', zIndex: 50, insetInlineStart: 0, top: 34, width: 300, padding: 8 }} onMouseLeave={() => setMenu(false)}>
            <button className="btn small" style={{ width: '100%', marginBottom: 6 }} onClick={() => { duplicateCurrent(); setMenu(false); }}>{L('Duplicate (branch) current', 'שכפול (הסתעפות) הנוכחי')}</button>
            <button className="btn small" style={{ width: '100%', marginBottom: 6 }} onClick={async () => {
              const url = await shareLink(); setShareUrl(url);
              try { await navigator.clipboard.writeText(url); toast('info', L(`Share link copied (${url.length} characters).`, `קישור השיתוף הועתק (${url.length} תווים).`)); }
              catch { toast('info', L('Copy the link from the field below.', 'העתיקו את הקישור מהשדה שלמטה.')); }
            }}>{L('Create share link', 'יצירת קישור שיתוף')}</button>
            {shareUrl && <input type="text" readOnly value={shareUrl} aria-label={L('Share link', 'קישור שיתוף')} onFocus={(e) => e.target.select()} style={{ width: '100%', marginBottom: 6 }} />}
            <button className="btn small" style={{ width: '100%', marginBottom: 6 }} onClick={() => { if (s && ds) download(`${s.electionId}-${(s.name || 'scenario').replace(/\W+/g, '_')}.json`, JSON.stringify({ ...s, datasetBuiltAt: ds.buildInfo.builtAt }, null, 1), 'application/json'); setMenu(false); }}>{L('Export scenario (JSON)', 'ייצוא תרחיש (JSON)')}</button>
            <button className="btn small" style={{ width: '100%', marginBottom: 6 }} onClick={() => fileRef.current?.click()}>{L('Import scenario (JSON)', 'ייבוא תרחיש (JSON)')}</button>
            <button className="btn small" style={{ width: '100%', marginBottom: 6 }} onClick={() => { exportCsv(); setMenu(false); }}>{L('Export results table (CSV)', 'ייצוא טבלת תוצאות (CSV)')}</button>
            <div className="section-title">{L('Saved in this browser', 'שמורים בדפדפן')}</div>
            {saved.length === 0 && <p className="small muted">{L('Nothing saved yet.', 'אין עדיין.')}</p>}
            {saved.map((x) => (
              <div key={x.id} className="row small" style={{ justifyContent: 'space-between' }}>
                <button className="btn small ghost" onClick={() => { openElection(x.electionId, { name: x.name, log: x.log, baseBuiltAt: x.baseBuiltAt }).then(() => setState((st) => ({ scenario: st.scenario ? { ...st.scenario, id: x.id } : null }))); setMenu(false); }}>{x.name} <span className="muted">({x.electionId === 'k26' ? '2026' : '2022'})</span></button>
                <span>
                  <button className="btn small ghost" onClick={() => { setState({ compareWith: x.id }); setMenu(false); }} disabled={x.electionId !== electionId}>{L('compare', 'השוואה')}</button>
                  <button className="btn small ghost danger" aria-label={L('Delete', 'מחיקה')} onClick={() => setState((st) => ({ saved: st.saved.filter((y) => y.id !== x.id) }))}>✕</button>
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
            setState({ scenario: sc, past: [...getState().past], future: [] });
            toast('info', L('Scenario imported.', 'התרחיש יובא.'));
          } catch (err) { toast('error', String(err)); }
          e.target.value = ''; setMenu(false);
        }} />
      </div>
      <span className="spacer" />
      <Seg label={L('Chamber layout', 'פריסה')} value={layout} onChange={(v) => setState({ layout: v })} options={[{ v: 'hemicycle', label: L('Arc', 'קשת') }, { v: 'blocks', label: L('Blocks', 'גושים') }]} />
      <select aria-label={L('Colour seats by', 'צביעת מושבים לפי')} value={colorBy} onChange={(e) => setState({ colorBy: e.target.value as 'list' | 'bloc' | 'party' })}>
        <option value="list">{L('Colour: list', 'צבע: רשימה')}</option>
        <option value="bloc">{L('Colour: bloc', 'צבע: גוש')}</option>
        <option value="party">{L('Colour: constituent party', 'צבע: מפלגה מרכיבה')}</option>
      </select>
      <Seg label={L('Detail level', 'רמת פירוט')} value={level} onChange={(v) => setState({ level: v })} options={[{ v: 'explore', label: L('Explore', 'סיור') }, { v: 'advanced', label: L('Advanced', 'מתקדם') }]} />
      <Seg label={L('Language', 'שפה')} value={lang} onChange={(v) => setState({ lang: v })} options={[{ v: 'he', label: 'עב' }, { v: 'en', label: 'EN' }]} />
      <button className="btn small" aria-label={L('Toggle dark theme', 'מצב כהה')} onClick={() => setState({ theme: theme === 'dark' ? 'light' : 'dark' })}>{theme === 'dark' ? '☀' : '☾'}</button>
    </div>
  );
}
