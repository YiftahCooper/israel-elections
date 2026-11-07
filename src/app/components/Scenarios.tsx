import { scenarioDirty } from '../scenarioDocument.ts';
import { ScenarioSave, UnsavedMark } from './ScenarioSave.tsx';
import { hasAppearance, hasAnalysis, factLog } from '../../model/actionClassification.ts';
import { Info } from './ui.tsx';
import { EditMarker } from './EditMarker.tsx';
import { exportAnnotations } from '../scenarioExport.ts';
// Scenarios as first-class things: the current one with its name and description, and every saved one as a
// card with its result drawn, to open, compare, export, share or delete. Built-in "What if" questions open here
// as named scenarios too.
import { SCENARIO_PALETTE, liveScenarioColor, scenarioColor } from '../scenarioIdentity.ts';
import { dispatch } from '../store.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, FolderOpen, GitCompare, Link2, RotateCcw, Save, Trash2, Upload } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { allocationOf, listLabel, baselineOf, resultChanges } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { download } from '../format.ts';
import { deleteSaved, duplicateCurrent, importScenarioJson, openImported, openSaved, replay, resetAll, scenarioKey, setState, shareLink, toast, useStore, type SavedScenario } from '../store.ts';
import { ScenarioGallery } from './ScenarioGallery.tsx';
import { electionLabel } from './TopBar.tsx';

const fileName = (n: string) => (n || 'scenario').replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'scenario';

/** The seats of a scenario as one bar, lists grouped by bloc in their colours. */
export function ResultBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const lang = useLang();
  const total = s.rules.seats, majority = Math.floor(total / 2) + 1;
  const rank = (b: string | null) => { const i = s.blocs.findIndex((x) => x.id === b); return i < 0 ? s.blocs.length : i; };
  const lists = s.lists.map((l) => ({ l, n: r.lists.find((x) => x.id === l.id)?.seats ?? 0 })).filter((x) => x.n > 0)
    .sort((a, b) => rank(a.l.bloc) - rank(b.l.bloc) || b.n - a.n);
  return (
    <div className="coal-bar" aria-hidden>
      {lists.map(({ l, n }) => <i key={l.id} style={{ flexBasis: `${(n / total) * 100}%`, background: l.color }} title={`${listLabel(l, lang)} ${n}`} />)}
      <span className="maj" style={{ insetInlineStart: `${(majority / total) * 100}%` }} />
    </div>
  );
}

/** Prose stays local until blur/Enter; each commit is one history step. */
function ScenarioText({ value, multiline, label, placeholder, onCommit }: {
  value: string; multiline?: boolean; label: string; placeholder: string; onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const props = {
    value: draft, 'aria-label': label, placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: () => { if (draft !== value) onCommit(draft); },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
      if (e.key === 'Escape' && draft !== value) { e.stopPropagation(); setDraft(value); }
    },
  };
  return multiline ? <textarea rows={2} {...props} /> : <input type="text" {...props} />;
}

export function Scenarios({ s, ds }: { s: Scenario; ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const saved = useStore((st) => st.saved);
  const elections = useStore((st) => st.elections);
  const fileRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState('');
  useEffect(() => setLink(''), [s]);
  const reference=useStore(st=>st.reference);
  const isSaved = saved.some((x) => x.id === s.id);
  // 'official' (nothing changed), the saved id (no unsaved changes) or a draft key (unsaved changes)
  const key = useStore((st) => scenarioKey(st));
  const official = key === 'official', clean = isSaved && !!reference && !scenarioDirty(s, reference);
  // the result of every saved scenario of this election, replayed once
  const results = useMemo(() => new Map(saved.filter((x) => x.electionId === s.electionId).map((x) => {
    const sc = replay(ds, x.name, x.log, x.factionSplitBaseline ?? false).scenario;
    return [x.id, { sc, r: allocationOf(sc) }] as const;
  })), [saved, ds, s.electionId]);
  const electionName = (id: string) => { const e = elections.find((x) => x.id === id); return e ? electionLabel(e, elections, lang) : id; };
  const open = (x: SavedScenario) => openSaved(x).then((ok) => { if (ok) setState({ tool: 'board' }); });
  const exportJson = (sc: Scenario) => download(`${sc.electionId}-${fileName(sc.name)}.json`, JSON.stringify({ ...sc, ...exportAnnotations(sc, lang), datasetBuiltAt: ds.buildInfo.builtAt }, null, 1), 'application/json');

  return (
    <div className="scn">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('A scenario is your edited election. Save it here, or share a link.', 'תרחיש הוא הבחירות עם השינויים שלכם. שמרו כאן או שתפו קישור.')} <Info title={L('Using scenarios', 'שימוש בתרחישים')}>{L('Change votes, partners or rules in the other tabs, then name and save the result here. Saved scenarios stay in this browser; links and files can be opened on another device.', 'שנו קולות, שותפות או כללים בלשוניות האחרות, ואז תנו שם ושמרו כאן. תרחישים נשמרים בדפדפן זה; קישורים וקבצים נפתחים גם במכשיר אחר.')}</Info></p>
      <section className="scn-current">
        <h3>{official ? L('Official result', 'התוצאה הרשמית') : L('This scenario', 'התרחיש הנוכחי')} <span className="muted" style={{ fontWeight: 400 }}>· {electionName(s.electionId)} · {official ? L('No changes', 'אין שינויים') : L(`${factLog(s).length} change${factLog(s).length === 1 ? '' : 's'}`, factLog(s).length === 1 ? 'שינוי אחד' : `${factLog(s).length} שינויים`)}</span></h3>
        <div className="scn-form">
          <label className="field"><span>{L('Name', 'שם')}{!official && !clean && <UnsavedMark />}</span>
            <ScenarioText value={s.name} label={L('Name', 'שם')} placeholder={L('e.g. “Arab turnout returns to 2015 levels”', 'למשל "שיעור ההצבעה בחברה הערבית חוזר לרמת 2015"')} onCommit={(name) => dispatch({ type: 'rename', name })} /></label>
          <label className="field"><span>{L('Description', 'תיאור')}<EditMarker s={s} path={['description']} /></span>
            <ScenarioText multiline value={s.description ?? ''} label={L('Description', 'תיאור')} placeholder={L('What does this scenario explore, and why?', 'מה התרחיש בודק, ולמה?')} onCommit={(description) => dispatch({ type: 'setDescription', description })} /></label>
        </div>
        <details className="scn-options"><summary>{L('Colour & comparison', 'צבע והשוואה')}</summary><div className="scn-form">
          <label className="field">{L('Scenario colour', 'צבע התרחיש')}<select aria-label={L('Scenario colour', 'צבע התרחיש')} value={liveScenarioColor(s, saved)} onChange={e => dispatch({ type: 'setIdentityColor', color: e.target.value })}>{!(SCENARIO_PALETTE as readonly string[]).includes(liveScenarioColor(s, saved)) && <option value={liveScenarioColor(s, saved)}>{L('Saved colour', 'צבע שמור')}</option>}{SCENARIO_PALETTE.map((c, i) => <option key={c} value={c}>{L(['Violet', 'Slate', 'Ochre', 'Mauve', 'Sage', 'Blue', 'Clay', 'Olive'][i], ['סגול', 'כחלחל', 'אוכרה', 'סגלגל', 'מרווה', 'כחול', 'חרס', 'זית'][i])}</option>)}</select></label>
        <button className="btn small" onClick={() => setState({ settingsOpen: true })}>{L('Your settings…', 'ההגדרות שלכם…')}</button>
        </div></details>
        <ResultBar s={s} r={allocationOf(s)} />
        <div className="row" style={{ marginTop: 10 }}>
          <ScenarioSave className="btn primary scn-save" disabled={clean || official && !(hasAppearance(s)||hasAnalysis(s))}>{clean ? <><Check className="icon sm" aria-hidden />{L('Saved', 'נשמר')}</> : <><Save className="icon sm" aria-hidden />{L('Save', 'שמירה')}</>}</ScenarioSave>
          <ScenarioSave as disabled={official && !(hasAppearance(s)||hasAnalysis(s))}>{L('Save as…', 'שמירה בשם…')}</ScenarioSave>
          {isSaved && !clean && <button className="btn" onClick={() => openSaved(saved.find(x => x.id === s.id)!)}>{L('Reopen saved version', 'פתיחת הגרסה השמורה')}</button>}
          <button className="btn" onClick={async () => {
            const url = await shareLink(); setLink(url);
            try { await navigator.clipboard.writeText(url); toast('info', L('Share link copied.', 'קישור השיתוף הועתק.')); } catch { /* the field below shows it */ }
          }}><Link2 className="icon sm" aria-hidden />{L('Copy a share link', 'העתקת קישור שיתוף')}</button>
          <button className="btn" disabled={official} title={official ? L('Change something first', 'תחילה שנו משהו') : undefined} onClick={() => { duplicateCurrent(); toast('info', L('Saved as a copy in this browser.', 'נשמר עותק בדפדפן זה.')); }}><Copy className="icon sm" aria-hidden />{L('Duplicate', 'שכפול')}</button>
          <button className="btn" onClick={() => exportJson(s)}><Download className="icon sm" aria-hidden />{L('Export', 'ייצוא')}</button>
          <button className="btn" onClick={() => fileRef.current?.click()}><Upload className="icon sm" aria-hidden />{L('Import', 'ייבוא')}</button>
          <button className="btn ghost" disabled={!s.log.length} title={!s.log.length ? L('Already at the official result', 'כבר בתוצאה הרשמית') : undefined} onClick={() => { if (confirm(L('Start over from the official result? (Undo can restore it.)', 'להתחיל מחדש מהתוצאה הרשמית? (ניתן לבטל)'))) resetAll(); }}><RotateCcw className="icon sm" aria-hidden />{L('Start over', 'התחלה מחדש')}</button>
        </div>
        {link && <input type="text" readOnly value={link} aria-label={L('Share link', 'קישור שיתוף')} onFocus={(e) => e.target.select()} style={{ width: '100%', marginTop: 8 }} />}
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try {
            if (await openImported(importScenarioJson(await f.text()))) toast('info', L('Scenario imported.', 'התרחיש יובא.'));
          } catch (err) { toast('error', err instanceof Error ? err.message : String(err)); }
          e.target.value = '';
        }} />
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>{L(`Saved in this browser (${saved.length})`, `שמורים בדפדפן זה (${saved.length})`)}</h3>
        {saved.length === 0 && <p className="small muted">{L('Save this scenario to find it here.', 'שמרו את התרחיש כדי למצוא אותו כאן.')} <Info title={L('Saving scenarios', 'שמירת תרחישים')}>{L('Nothing saved yet. Name the scenario above and save it to keep it here; share links and exported files work across devices.', 'עדיין לא נשמר דבר. תנו שם לתרחיש למעלה ושמרו אותו כדי שיופיע כאן; קישורי שיתוף וקבצים מיוצאים עובדים גם במכשירים אחרים.')}</Info></p>}
        <ul className="scn-cards">
          {saved.map((x) => {
            const res = results.get(x.id);
            return (
              <li key={x.id} className={`scn-card ${x.id === s.id ? 'current' : ''}`}>
                <div className="scn-title"><b><span className="swatch" style={{ background: res && !resultChanges(res.sc,baselineOf(ds)).length ? 'var(--muted)' : scenarioColor(res?.sc ?? {}) }} />{x.name}{x.id === s.id && !clean && <UnsavedMark />}</b><span className="small muted">{electionName(x.electionId)} · {new Date(x.savedAt).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB', { dateStyle: 'medium' })}</span></div>
                {x.description && <p className="small ink2" style={{ margin: 0 }}>{x.description}</p>}
                {res ? <ResultBar s={res.sc} r={res.r} /> : <p className="tiny muted" style={{ margin: 0 }}>{L('Open it to see its result.', 'פתחו כדי לראות את התוצאה.')}</p>}
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn small" aria-label={x.id === s.id && !clean ? L('Reopen saved version', 'פתיחת הגרסה השמורה') : undefined} onClick={() => open(x)} disabled={x.id === s.id && clean}><FolderOpen className="icon sm" aria-hidden />{x.id === s.id ? clean ? L('Open now', 'פתוח עכשיו') : L('Reopen', 'פתיחה מחדש') : L('Open', 'פתיחה')}</button>
                  <button className="btn small" disabled={x.electionId !== s.electionId || x.id === s.id} onClick={() => setState({ compareWith: x.id, tool: 'compare' })}><GitCompare className="icon sm" aria-hidden />{L('Compare', 'השוואה')}</button>
                  {res && <button className="btn small ghost" onClick={() => exportJson(res.sc)}><Download className="icon sm" aria-hidden />{L('Export', 'ייצוא')}</button>}
                  <span className="spacer" />
                  <button className="btn small ghost danger icon-only" aria-label={L(`Delete ${x.name}`, `מחיקת ${x.name}`)} onClick={() => { if (confirm(L(`Delete “${x.name}” from this browser?`, `למחוק את "${x.name}" מהדפדפן?`))) deleteSaved(x.id); }}><Trash2 className="icon sm" aria-hidden /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section style={{ marginTop: 22 }}>
        <ScenarioGallery />
      </section>
    </div>
  );
}
