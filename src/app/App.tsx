import { createElement, memo, Suspense, use, useEffect, useState, type ReactNode } from 'react';
import { allocationOf, baselineOf, ruleChanges, scenarioIssues, tieAffectsSeats, warningText } from './derive.ts';
import { LangContext, useL } from './i18n.ts';
import { dispatch, loadElectionIndex, openElection, readSharedFromHash, redo, setState, undo, useStore } from './store.ts';
import { Hemicycle as HemicycleView } from './components/Hemicycle.tsx';
import { BlocBar as BlocBarView, KeyStats as KeyStatsView } from './components/KeyStats.tsx';
import { ListPanel as ListPanelView } from './components/ListPanel.tsx';
import { PartyCards as PartyCardsView } from './components/PartyCards.tsx';
import { TopBar as TopBarView } from './components/TopBar.tsx';
import { Walkthrough } from './components/Walkthrough.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { WhatIf } from './components/WhatIf.tsx';

// The main area's props (scenario, its cached allocation, the dataset) only change with the
// scenario, so a tab switch, toast or notice does not re-render the cards, chamber and details.
// Each panel still re-renders on its own store subscriptions (selection, level, language…).
const TopBar = memo(TopBarView);
const PartyCards = memo(PartyCardsView);
const Hemicycle = memo(HemicycleView);
const BlocBar = memo(BlocBarView);
const KeyStats = memo(KeyStatsView);
const ListPanel = memo(ListPanelView);

// The levels' first tabs (What if…, How the seats were allocated) are in the main bundle; every
// other tab panel is a separate chunk, fetched once the page is idle (or when its tab is pointed at),
// so the first render does not wait for code most visits never open.
const loaders = {
  seats: () => import('./components/SeatSecurity.tsx'),
  panels: () => import('./components/Panels.tsx'),
  compare: () => import('./components/Compare.tsx'),
  charts: () => import('./components/Charts.tsx'),
  structure: () => import('./components/Structure.tsx'),
  turnout: () => import('./components/Turnout.tsx'),
  sens: () => import('./components/Sensitivity.tsx'),
};
/** A tab panel from a separate chunk. Unlike React.lazy, a panel whose code has already been
 *  prefetched renders at once, without showing (and React holding) the loading fallback. */
// `any` only bounds the export; each panel's own props are still checked through M[K]
function lazyPanel<M extends Record<K, (props: any) => ReactNode>, K extends keyof M>(load: () => Promise<M>, name: K) {
  let loaded: M[K] | null = null;
  let pending: Promise<void> | null = null;
  // one retry for a dropped request; a second failure reaches the panel's error boundary
  const preload = () => (pending ??= load().catch(load).then((m) => { loaded = m[name]; }));
  const Panel = (props: Parameters<M[K]>[0]) => {
    if (!loaded) use(preload());
    return createElement(loaded!, props);
  };
  return Object.assign(Panel, { preload });
}
const Coalitions = lazyPanel(loaders.seats, 'Coalitions');
const SeatSecurity = lazyPanel(loaders.seats, 'SeatSecurity');
const Compare = lazyPanel(loaders.compare, 'Compare');
const Charts = lazyPanel(loaders.charts, 'Charts');
const Structure = lazyPanel(loaders.structure, 'Structure');
const Turnout = lazyPanel(loaders.turnout, 'Turnout');
const Sensitivity = lazyPanel(loaders.sens, 'Sensitivity');
const Rules = lazyPanel(loaders.panels, 'Rules');
const Localities = lazyPanel(loaders.panels, 'Localities');
const Sources = lazyPanel(loaders.panels, 'Sources');
const History = lazyPanel(loaders.panels, 'History');
const TAB_PANEL: Partial<Record<Tab, { preload: () => Promise<void> }>> = {
  coal: Coalitions, security: SeatSecurity, compare: Compare, charts: Charts, structure: Structure,
  turnout: Turnout, sens: Sensitivity, rules: Rules, loc: Localities, sources: Sources, history: History,
};
/** Starts fetching a tab's code ahead of its first use (a no-op once loaded). */
const prefetchTab = (t: Tab) => { void TAB_PANEL[t]?.preload().catch(() => {}); };

type Tab = 'whatif' | 'coal' | 'security' | 'walk' | 'compare' | 'charts' | 'structure' | 'turnout' | 'sens' | 'rules' | 'loc' | 'sources' | 'history';
const SIMPLE_TABS: Tab[] = ['whatif', 'coal', 'walk', 'sources'];
const STANDARD_TABS: Tab[] = ['whatif', 'compare', 'structure', 'coal', 'security', 'charts', 'walk', 'sources', 'history'];
const EXPERT_TABS: Tab[] = ['walk', 'compare', 'charts', 'security', 'coal', 'whatif', 'structure', 'turnout', 'sens', 'rules', 'loc', 'sources', 'history'];

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
  const ready = !!(s && ds);
  // once the election is on screen, fetch the code of this level's other tabs while the page is idle
  useEffect(() => {
    if (!ready) return;
    const tabs = level === 'simple' ? SIMPLE_TABS : level === 'standard' ? STANDARD_TABS : EXPERT_TABS;
    const run = () => tabs.forEach(prefetchTab);
    if (typeof requestIdleCallback === 'function') { const h = requestIdleCallback(run, { timeout: 2000 }); return () => cancelIdleCallback(h); }
    const h = setTimeout(run, 200); return () => clearTimeout(h);
  }, [ready, level]);

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
  const order: Tab[] = level === 'simple' ? SIMPLE_TABS : level === 'standard' ? STANDARD_TABS : EXPERT_TABS;
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
        {notice && <div className="banner info" role="status">{notice} <button className="btn small ghost" onClick={() => setState({ notice: null })} aria-label={L('Dismiss', 'סגירה')}>✕</button></div>}
        {issues.map((x, i) => <div key={i} className={`banner ${x.level === 'error' ? 'err' : 'warn'}`} role="alert">{lang === 'he' ? x.he : x.en}</div>)}
        {r.warnings.filter((w) => w.code !== 'internal-loss').map((w, i) => tieAffectsSeats(s, w)
          ? <div key={`w${i}`} className="banner warn" role="alert">{warningText(w, s, lang)}</div>
          : <div key={`w${i}`} className="banner info" role="status">{warningText(w, s, lang)}</div>)}
      </div>
      <main>
        <div className="main">
          <ErrorBoundary label={L('Lists', 'רשימות')} resetKey={s}><PartyCards s={s} r={r} base={base} baseR={baseR} /></ErrorBoundary>
          <div className="col">
            <section className="panel">
              <div className="body"><ErrorBoundary label={L('Chamber', 'המליאה')} resetKey={s}><Hemicycle s={s} r={r} /></ErrorBoundary></div>
            </section>
            {s.blocs.length > 0 && <section className="panel"><div className="body"><BlocBar s={s} r={r} /></div></section>}
            <KeyStats s={s} r={r} ds={ds} baseR={baseR} />
          </div>
          <div className="col" id="detail-col"><ErrorBoundary label={L('List details', 'פרטי רשימה')} resetKey={s}><ListPanel s={s} r={r} ds={ds} base={base} baseR={baseR} /></ErrorBoundary></div>
        </div>
        <div className="bottom">
          <section className="panel">
            <div className="tabs" role="tablist" aria-label={L('Analysis', 'ניתוח')}>
              {tabs.map((t, i) => <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={tab === t.id} aria-controls="analysis-panel" tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)} onPointerEnter={() => prefetchTab(t.id)} onFocus={() => prefetchTab(t.id)}
                onKeyDown={(e) => {
                  // WAI-ARIA tabs: arrows move between tabs (mirrored in RTL), Home/End jump to the ends
                  const rtl = lang === 'he';
                  const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1
                    : e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? (i + 1) % tabs.length
                    : e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? (i - 1 + tabs.length) % tabs.length : -1;
                  if (next < 0) return;
                  e.preventDefault(); setTab(tabs[next].id);
                  (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                }}>{t.label}</button>)}
            </div>
            <div className="body" role="tabpanel" id="analysis-panel" aria-labelledby={`tab-${tab}`}><ErrorBoundary label={all[tab]} resetKey={`${tab}|${s.id}|${s.log.length}`}><Suspense fallback={<p className="muted" role="status">{L('Loading…', 'טוען…')}</p>}>
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
            </Suspense></ErrorBoundary></div>
          </section>
          <p className="small muted" style={{ marginTop: 10 }}>{L('Seat allocation is computed by deterministic code from official Central Elections Committee data. Not affiliated with the CEC or any party.', 'חלוקת המנדטים מחושבת בקוד דטרמיניסטי מנתוני ועדת הבחירות המרכזית. אין קשר לוועדת הבחירות או לאף מפלגה.')}</p>
        </div>
      </main>
      {toast && <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>{toast.text}</div>}
    </div>
  );
}
