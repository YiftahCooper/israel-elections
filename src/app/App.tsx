import { useEffect, useState } from 'react';
import { allocationOf, baselineOf, ruleChanges, scenarioIssues, warningText } from './derive.ts';
import { LangContext, useL } from './i18n.ts';
import { dispatch, loadElectionIndex, openElection, readSharedFromHash, redo, setState, undo, useStore } from './store.ts';
import { Charts } from './components/Charts.tsx';
import { Compare } from './components/Compare.tsx';
import { Hemicycle } from './components/Hemicycle.tsx';
import { BlocBar, KeyStats } from './components/KeyStats.tsx';
import { ListPanel } from './components/ListPanel.tsx';
import { History, Localities, Rules, Sources } from './components/Panels.tsx';
import { PartyCards } from './components/PartyCards.tsx';
import { Sensitivity } from './components/Sensitivity.tsx';
import { Structure } from './components/Structure.tsx';
import { TopBar } from './components/TopBar.tsx';
import { Turnout } from './components/Turnout.tsx';
import { Walkthrough } from './components/Walkthrough.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { WhatIf } from './components/WhatIf.tsx';
import { Coalitions, SeatSecurity } from './components/SeatSecurity.tsx';

type Tab = 'whatif' | 'coal' | 'security' | 'walk' | 'compare' | 'charts' | 'structure' | 'turnout' | 'sens' | 'rules' | 'loc' | 'sources' | 'history';

export function App() {
  const lang = useStore((st) => st.lang);
  const theme = useStore((st) => st.theme);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
    document.title = lang === 'he' ? 'סייר הבחירות לכנסת' : 'Israeli Elections Explorer';
  }, [lang, theme]);
  useEffect(() => {
    loadElectionIndex();
    readSharedFromHash().then(async (sh) => {
      // the link is cleared only once it has opened, so a failed load can be retried by reloading
      if (sh) { if (await openElection(sh.electionId, sh)) history.replaceState(null, '', location.pathname); }
      else openElection('k26');
    });
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') setState({ selectedListId: null });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  return <LangContext.Provider value={lang}><Shell /></LangContext.Provider>;
}

function Shell() {
  const L = useL();
  const s = useStore((st) => st.scenario);
  const ds = useStore((st) => (st.scenario ? st.datasets[st.scenario.electionId] : undefined));
  const toast = useStore((st) => st.toast);
  const loadError = useStore((st) => st.loadError);
  const notice = useStore((st) => st.notice);
  const lang = useStore((st) => st.lang);
  const level = useStore((st) => st.level);
  const [tabPick, setTab] = useState<Tab | null>(null);
  const hintDismissed = useStore((st) => st.hintDismissed);

  const loadBanner = loadError && (
    <div className="banner err" role="alert">
      {L(`Could not load the ${loadError.id} election data (${loadError.message}).`, `טעינת נתוני הבחירות ${loadError.id} נכשלה (${loadError.message}).`)}{' '}
      <button className="btn small" onClick={() => openElection(loadError.id)}>{L('Try again', 'ניסיון נוסף')}</button>
      {s && <button className="btn small ghost" onClick={() => setState({ loadError: null })} aria-label={L('Dismiss', 'סגירה')}>✕</button>}
    </div>
  );
  if (!s || !ds) return <div className="app"><TopBar s={null} r={null} ds={undefined} baseR={null} />{loadBanner || <p style={{ padding: 20 }} className="muted">{L('Loading election data…', 'טוען נתוני בחירות…')}</p>}</div>;

  const r = allocationOf(s);
  const base = baselineOf(ds);
  const baseR = allocationOf(base);
  const issues = scenarioIssues(s, r);
  const all: Record<Tab, string> = {
    whatif: L('What if…', 'מה אילו…'),
    coal: L('Coalitions', 'קואליציות'),
    security: L('How safe is each seat', 'עד כמה כל מנדט בטוח'),
    walk: L('How the seats were allocated', 'איך חולקו המנדטים'),
    compare: L('Compare', 'השוואה'),
    charts: L('Charts', 'תרשימים'),
    structure: L('Mergers, splits & agreements', 'איחודים, פיצולים והסכמים'),
    turnout: L('Turnout model', 'מודל הצבעה'),
    sens: L('Sensitivity', 'רגישות'),
    rules: L('Rules & settings', 'כללים והגדרות'),
    loc: L('Localities', 'יישובים'),
    sources: L('Sources & definitions', 'מקורות ומונחים'),
    history: L(`Change history (${s.log.length})`, `היסטוריית שינויים (${s.log.length})`),
  };
  const order: Tab[] = level === 'simple'
    ? ['whatif', 'coal', 'walk', 'sources']
    : level === 'standard'
      ? ['whatif', 'compare', 'structure', 'coal', 'security', 'charts', 'walk', 'sources', 'history']
      : ['walk', 'compare', 'charts', 'security', 'coal', 'whatif', 'structure', 'turnout', 'sens', 'rules', 'loc', 'sources', 'history'];
  const tab: Tab = tabPick && order.includes(tabPick) ? tabPick : order[0];
  const tabs = order.map((id) => ({ id, label: all[id] }));

  return (
    <div className="app">
      <TopBar s={s} r={r} ds={ds} baseR={baseR} />
      <div>
        {ds.status.stage !== 'official-final' && <div className="banner warn" role="status">⚠ {lang === 'he' ? ds.status.noteHe : ds.status.noteEn}</div>}
        {level === 'simple' && !hintDismissed && <div className="banner info" role="status">{L('Click a party to change its votes and watch the seats move. More tools: Standard and Expert (top right).', 'לחצו על מפלגה כדי לשנות את קולותיה ולראות איך המנדטים זזים. כלים נוספים: מצב רגיל ומומחה (למעלה).')} <button className="btn small ghost" onClick={() => setState({ hintDismissed: true })} aria-label={L('Dismiss', 'סגירה')}>✕</button></div>}
        {loadBanner}
        {s.mode === 'experimental' && <div className="banner info" role="status">{L('Experimental rules: this is an alternative electoral system, not a legally possible Israeli result.', 'כללים ניסיוניים: זוהי שיטת בחירות חלופית ולא תוצאה אפשרית לפי החוק בישראל.')}{(() => { const c = ruleChanges(s, lang); return c.length ? <> {L('Changed: ', 'שינויים: ')}<b>{c.join(' · ')}</b>.</> : null; })()} <button className="btn small" onClick={() => dispatch({ type: 'setMode', mode: 'historical' })}>{L('Back to the real rules', 'חזרה לכללים האמיתיים')}</button></div>}
        {notice && <div className="banner info" role="status">{notice} <button className="btn small ghost" onClick={() => setState({ notice: null })}>✕</button></div>}
        {issues.map((x, i) => <div key={i} className={`banner ${x.level === 'error' ? 'err' : 'warn'}`} role="alert">{lang === 'he' ? x.he : x.en}</div>)}
        {r.warnings.filter((w) => w.code !== 'internal-loss').map((w, i) => <div key={`w${i}`} className="banner warn" role="alert">{warningText(w, s, lang)}</div>)}
      </div>
      <main>
        <div className="main">
          <ErrorBoundary label={L('Lists', 'רשימות')} resetKey={s}><PartyCards s={s} r={r} base={base} baseR={baseR} /></ErrorBoundary>
          <div className="col">
            <section className="panel">
              <div className="body"><ErrorBoundary label={L('Chamber', 'המליאה')} resetKey={s}><Hemicycle s={s} r={r} /></ErrorBoundary></div>
            </section>
            <section className="panel"><div className="body"><BlocBar s={s} r={r} /></div></section>
            <KeyStats s={s} r={r} ds={ds} baseR={baseR} />
          </div>
          <div className="col" id="detail-col"><ErrorBoundary label={L('List details', 'פרטי רשימה')} resetKey={s}><ListPanel s={s} r={r} ds={ds} base={base} baseR={baseR} /></ErrorBoundary></div>
        </div>
        <div className="bottom">
          <section className="panel">
            <div className="tabs" role="tablist" aria-label={L('Analysis', 'ניתוח')}>
              {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}
            </div>
            <div className="body" role="tabpanel"><ErrorBoundary label={all[tab]} resetKey={`${tab}|${s.id}|${s.log.length}`}>
              {tab === 'whatif' && <WhatIf ds={ds} />}
              {tab === 'coal' && <Coalitions s={s} r={r} />}
              {tab === 'security' && <SeatSecurity s={s} r={r} />}
              {tab === 'walk' && <Walkthrough s={s} r={r} />}
              {tab === 'compare' && <Compare s={s} r={r} base={base} ds={ds} />}
              {tab === 'charts' && <Charts s={s} r={r} />}
              {tab === 'structure' && <Structure s={s} r={r} base={base} />}
              {tab === 'turnout' && <Turnout key={s.electionId} s={s} />}
              {tab === 'sens' && <Sensitivity s={s} r={r} />}
              {tab === 'rules' && <Rules s={s} base={base} />}
              {tab === 'loc' && <Localities s={s} />}
              {tab === 'sources' && <Sources ds={ds} />}
              {tab === 'history' && <History s={s} r={r} ds={ds} />}
            </ErrorBoundary></div>
          </section>
          <p className="small muted" style={{ marginTop: 10 }}>{L('Seat allocation is computed by deterministic code from official Central Elections Committee data. Not affiliated with the CEC or any party.', 'חלוקת המנדטים מחושבת בקוד דטרמיניסטי מנתוני ועדת הבחירות המרכזית. אין קשר לוועדת הבחירות או לאף מפלגה.')}</p>
        </div>
      </main>
      {toast && <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>{toast.text}</div>}
    </div>
  );
}
