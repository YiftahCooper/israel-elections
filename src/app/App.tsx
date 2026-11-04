import { BoardChoices } from './components/BoardChoices.tsx';
import { CustomPage, Feature } from './components/Feature.tsx';
import { TOOL_FEATURES, RANK, type Preset } from './features.ts';
import { electionContext } from '../data/electionContext.ts';
import { PMResult } from './components/ElectionContext.tsx';
import { createElement, memo, Suspense, use, useEffect, useState, type ReactNode } from 'react';
import { scenarioColor } from './scenarioIdentity.ts';
import { referenceChanges } from './derive.ts';
import { X } from 'lucide-react';
import { allocationOf, baselineOf, ruleChanges, scenarioIssues, tieAffectsSeats, warningText } from './derive.ts';
import { LangContext, useL } from './i18n.ts';
import { dispatch, loadElectionIndex, openElection, readSharedFromHash, redo, setState, undo, useStore, type Level } from './store.ts';
import { Hemicycle as HemicycleView } from './components/Hemicycle.tsx';
import { Figures as FiguresView } from './components/Figures.tsx';
import { BlocBar as BlocBarView } from './components/Blocs.tsx';
import { ListBars as ListBarsView } from './components/ListBars.tsx';
import { ListSidePanel } from './components/ListSidePanel.tsx';
import { BlocPanel } from './components/BlocPanel.tsx';
import { ChangeSummary } from './components/ChangeSummary.tsx';
import { Scenarios } from './components/Scenarios.tsx';
import { TopBar as TopBarView, electionLabel } from './components/TopBar.tsx';
import { Walkthrough } from './components/Walkthrough.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { WhatIf } from './components/WhatIf.tsx';

// The main area's props (scenario, its cached allocation, the dataset) only change with the
// scenario, so a tab switch, toast or notice does not re-render the cards, chamber and details.
// Each panel still re-renders on its own store subscriptions (selection, level, language…).
const TopBar = memo(TopBarView);
const ListBars = memo(ListBarsView);
const Hemicycle = memo(HemicycleView);
const BlocBar = memo(BlocBarView);
const Figures = memo(FiguresView);

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
const TAB_PANEL: Partial<Record<Tab, { preload: () => Promise<void> }>> = {
  coal: Coalitions, security: SeatSecurity, compare: Compare, charts: Charts, structure: Structure,
  turnout: Turnout, sens: Sensitivity, rules: Rules, loc: Localities, sources: Sources,
};
/** Starts fetching a tab's code ahead of its first use (a no-op once loaded). */
const prefetchTab = (t: Tab) => { void TAB_PANEL[t]?.preload().catch(() => {}); };

type Tab = typeof TOOL_FEATURES[number][0];
const TOOLS = TOOL_FEATURES.map(([id,,,, level]) => ({ id, level: level as Preset }));

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
      if (e.defaultPrevented) return;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName) && e.key !== 'Escape') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') setState((st) => (st.selectedListId ? { selectedListId: null } : { blocPanel: null }));
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  return <LangContext.Provider value={lang}><Shell /></LangContext.Provider>;
}

function Shell() {
  const [pmContestId, setPMContestId] = useState<string | null>(null);
  const pmOnly = electionContext.pmContests.find(c => c.id === pmContestId && c.contestType === 'prime-minister-only');
  const L = useL();
  const reference = useStore(st => st.reference);
  const committed = useStore((st) => st.scenario);
  const preview = useStore((st) => st.preview);
  const ds = useStore((st) => (st.scenario ? st.datasets[st.scenario.electionId] : undefined));
  const toast = useStore((st) => st.toast);
  const loadError = useStore((st) => st.loadError);
  const elections = useStore((st) => st.elections);
  const notice = useStore((st) => st.notice);
  const lang = useStore((st) => st.lang);
  const level = useStore((st) => st.level);
  const customFeatures = useStore(st => st.customFeatures);
  const toolPick = useStore((st) => st.tool) as Tab | null;
  const selectedListId = useStore((st) => st.selectedListId);
  const blocPanel = useStore((st) => st.blocPanel);
  const [drawerFor, setDrawerFor] = useState<string | null>(null);
  const toolNow = useStore((st) => st.tool);
  useEffect(() => { setDrawerFor(null); }, [toolNow]);
  useEffect(() => { if (toolNow && toolNow !== 'board') setDrawerFor(selectedListId); }, [selectedListId]); // eslint-disable-line react-hooks/exhaustive-deps
  const hintDismissed = useStore((st) => st.hintDismissed);
  const ready = !!(committed && ds);
  // once the election is on screen, fetch the code of this level's tools while the page is idle; the others
  // load when pointed at or focused, so a Simple visit does not download tools it may never open
  useEffect(() => {
    if (!ready) return;
    const run = () => TOOLS.filter((t) => RANK[t.level] <= RANK[level]).forEach((t) => prefetchTab(t.id));
    if (typeof requestIdleCallback === 'function') { const h = requestIdleCallback(run, { timeout: 2000 }); return () => cancelIdleCallback(h); }
    const h = setTimeout(run, 200); return () => clearTimeout(h);
  }, [ready, level]);

  const loadBanner = loadError && (
    <div className="banner err" role="alert">
      {((e) => L(`Could not load the ${e} election data (${loadError.message}).`, `טעינת נתוני הבחירות ${e} נכשלה (${loadError.message}).`))(((x) => x ? electionLabel(x, elections, lang) : loadError.id)(elections.find((x) => x.id === loadError.id)))}{' '}
      <button className="btn small" onClick={() => openElection(loadError.id)}>{L('Try again', 'ניסיון נוסף')}</button>
      {committed && <button className="btn small ghost icon-only" onClick={() => setState({ loadError: null })} aria-label={L('Dismiss', 'סגירה')}><X className="icon sm" aria-hidden /></button>}
    </div>
  );
  if (!committed || !ds) return <div className="app"><TopBar s={null} r={null} ds={undefined} baseR={null} />{loadBanner || <p style={{ padding: 20 }} className="muted">{L('Loading election data…', 'טוען נתוני בחירות…')}</p>}</div>;

  // the board shows a live preview while a slider is dragged; tools and history use the committed scenario
  const s = preview ?? committed;
  const r = allocationOf(s);
  const cr = allocationOf(committed);
  const base = baselineOf(ds);
  const baseR = allocationOf(base);
  const issues = scenarioIssues(s, r);
  const label: Record<Tab, string> = {
    board: L('Overview', 'תמונת מצב'),
    scenarios: L('Scenarios', 'תרחישים'),
    whatif: L('What if…', 'מה אילו…'),
    coal: L('Coalitions', 'קואליציות'),
    walk: L('How seats were allocated', 'חלוקת המנדטים'),
    structure: L('Merge & split', 'איחוד ופיצול'),
    compare: L('Compare', 'השוואה'),
    security: L('Seat safety', 'ביטחון המנדטים'),
    charts: L('Charts', 'תרשימים'),
    turnout: L('Turnout', 'שיעור הצבעה'),
    sens: L('Sensitivity', 'רגישות'),
    loc: L('Localities', 'יישובים'),
    rules: L('Rules', 'כללים'),
    sources: L('Sources', 'מקורות'),
  };
  const levelName: Record<Level, string> = { simple: L('Simple', 'פשוט'), standard: L('Standard', 'רגיל'), expert: L('Expert', 'מומחה') };
  const customPage = toolNow === 'custom';
  const tool: Tab = toolPick && TOOLS.some((t) => t.id === toolPick) ? toolPick : 'board';
  // tools of this level first, then the others under a quiet label (never hidden)
  const availableTools = TOOLS.filter(t => customFeatures?.[t.id] !== 'hidden');
  const ordered = [...availableTools.filter((t) => RANK[t.level] <= RANK[level]), ...availableTools.filter((t) => RANK[t.level] > RANK[level])];
  const firstLocked = ordered.findIndex((t) => RANK[t.level] > RANK[level]);
  // a tool is a page of its own; the board keeps its state (selection, open figures) when you come back
  const openTool = (id: Tab) => { setState({ tool: id }); window.scrollTo({ top: 0 }); };
  const selected = selectedListId && s.lists.some((l) => l.id === selectedListId) ? selectedListId : null;
  // on a tool page the list drawer opens only for a list chosen there (a selection made on the board waits for it)
  const drawerOpen = tool !== 'board' && !!selected && drawerFor === selected;

  return (
    <div className="app" style={{ ['--scenario-color' as string]: reference || referenceChanges(s, base).length || s.identityColor ? scenarioColor(s) : undefined }}>
      <TopBar s={pmOnly ? null : committed} r={cr} ds={ds} baseR={baseR} pmContestId={pmContestId} onContestChange={setPMContestId} />
      {pmOnly ? <main className="work"><PMResult contest={pmOnly} onKnesset={() => setPMContestId(null)} /></main> : <>
      <nav className="toolbar" aria-label={L('Tools', 'כלים')}><div className="tabs" role="tablist" aria-label={L('Tools', 'כלים')}>
                {ordered.map((t, i) => [
                  i === firstLocked ? <span key="more" className="more-label" aria-hidden>{L('More in other levels', 'עוד ברמות אחרות')}</span> : null,
                  <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={!customPage && tool === t.id} aria-controls="analysis-panel" tabIndex={tool === t.id ? 0 : -1}
                  className={RANK[t.level] > RANK[level] ? 'locked' : ''}
                  onClick={() => openTool(t.id)} onPointerEnter={() => prefetchTab(t.id)} onFocus={() => prefetchTab(t.id)}
                  onKeyDown={(e) => {
                    const rtl = lang === 'he';
                    const next = e.key === 'Home' ? 0 : e.key === 'End' ? ordered.length - 1
                      : e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? (i + 1) % ordered.length
                      : e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? (i - 1 + ordered.length) % ordered.length : -1;
                    if (next < 0) return;
                    e.preventDefault(); setState({ tool: ordered[next].id });
                    (document.getElementById(`tab-${ordered[next].id}`) as HTMLElement | null)?.focus();
                  }}>{label[t.id]}{RANK[t.level] > RANK[level] && <span className="sr-only"> ({levelName[t.level]})</span>}</button>,
                ])}
              </div></nav>
      <div>
        {level === 'simple' && !hintDismissed && <div className="banner info" role="status">{L('Click any list, seat, bloc or figure to see and change what is behind it. Every tool is named in the strip under the header.', 'לחצו על כל רשימה, מושב, גוש או נתון כדי לראות ולשנות את מה שמאחוריו. כל הכלים מופיעים בשורה שמתחת לכותרת.')} <button className="btn small ghost icon-only" onClick={() => setState({ hintDismissed: true })} aria-label={L('Dismiss', 'סגירה')}><X className="icon sm" aria-hidden /></button></div>}
        {loadBanner}
        {s.mode === 'experimental' && <div className="banner info" role="status">{L('Experimental rules: this is an alternative electoral system, not a legally possible Israeli result.', 'כללים ניסיוניים: זוהי שיטת בחירות חלופית ולא תוצאה אפשרית לפי החוק בישראל.')}{(() => { const c = ruleChanges(s, lang); return c.length ? <> {L('Changed: ', 'שינויים: ')}<b>{c.join(' · ')}</b>.</> : null; })()} <button className="btn small" onClick={() => dispatch({ type: 'setMode', mode: 'historical' })}>{L('Back to the real rules', 'חזרה לכללים האמיתיים')}</button></div>}
        {notice && <div className="banner info" role="status">{notice} <button className="btn small ghost icon-only" onClick={() => setState({ notice: null })} aria-label={L('Dismiss', 'סגירה')}><X className="icon sm" aria-hidden /></button></div>}
        {issues.map((x, i) => <div key={i} className={`banner ${x.level === 'error' ? 'err' : 'warn'}`} role="alert">{lang === 'he' ? x.he : x.en}</div>)}
        {r.warnings.filter((w) => w.code !== 'internal-loss').map((w, i) => tieAffectsSeats(s, w)
          ? <div key={`w${i}`} className="banner warn" role="alert">{warningText(w, s, lang)}</div>
          : <div key={`w${i}`} className="banner info" role="status">{warningText(w, s, lang)}</div>)}
      </div>
      <ChangeSummary s={s} r={r} base={base} baseR={baseR} ds={ds} />
      <main className="work">
        {customPage ? <CustomPage /> : tool === 'board' ? (
          <Feature id="board"><div className={`board ${selected || blocPanel ? 'with-panel' : ''}`}>
            <ErrorBoundary label={L('Lists', 'רשימות')} resetKey={s}><ListBars s={s} r={r} base={base} baseR={baseR} /></ErrorBoundary>
            <div className="center"><BoardChoices s={s} />
              <section className="panel chamber-panel" aria-label={L('The Knesset', 'הכנסת')}>
                <div className="body"><ErrorBoundary label={L('Chamber', 'המליאה')} resetKey={s}><Hemicycle s={s} r={r} /></ErrorBoundary></div>
              </section>
              <ErrorBoundary label={L('Blocs', 'גושים')} resetKey={s}><BlocBar s={s} r={r} /></ErrorBoundary>
              <ErrorBoundary label={L('Figures', 'נתונים')} resetKey={s}><Figures s={s} r={r} ds={ds} /></ErrorBoundary>
              {/* separate PM ballot: below the Knesset result so the chamber stays in the same place for every election */}
              {electionContext.pmContests.filter(c => c.electionId === ds.id && c.contestType === 'parallel-pm').map(c => <PMResult key={c.id} contest={c} />)}
            </div>
            {selected && <ErrorBoundary label={L('List details', 'פרטי רשימה')} resetKey={selected}><ListSidePanel s={s} r={r} ds={ds} base={base} baseR={baseR} listId={selected} /></ErrorBoundary>}
            {!selected && blocPanel && <ErrorBoundary label={L('Blocs', 'גושים')} resetKey={s}><BlocPanel s={s} r={r} focus={blocPanel} /></ErrorBoundary>}
          </div></Feature>
        ) : (
          <section className="panel tool-page" id="tool-panel" aria-label={label[tool]}>
            <header><h2>{label[tool]}</h2></header>
            <div className="body" role="tabpanel" id="analysis-panel" aria-labelledby={`tab-${tool}`}>
              {<Feature id={tool}><ErrorBoundary label={label[tool]} resetKey={`${tool}|${committed.id}|${committed.log.length}`}><Suspense fallback={<p className="muted" role="status">{L('Loading…', 'טוען…')}</p>}>
                {tool === 'scenarios' && <Scenarios s={committed} ds={ds} />}
                {tool === 'whatif' && <WhatIf ds={ds} />}
                {tool === 'coal' && <Coalitions s={committed} r={cr} />}
                {tool === 'security' && <SeatSecurity s={committed} r={cr} />}
                {tool === 'walk' && <Walkthrough s={committed} r={cr} />}
                {tool === 'compare' && <Compare s={committed} r={cr} base={base} ds={ds} />}
                {tool === 'charts' && <Charts s={committed} r={cr} />}
                {tool === 'structure' && <Structure s={committed} r={cr} base={base} />}
                {tool === 'turnout' && <Turnout key={committed.electionId} s={committed} />}
                {tool === 'sens' && <Sensitivity s={committed} r={cr} />}
                {tool === 'rules' && <Rules s={committed} base={base} />}
                {tool === 'loc' && <Localities s={committed} />}
                {tool === 'sources' && <Sources ds={ds} />}
              </Suspense></ErrorBoundary></Feature>}
            </div>
          </section>
        )}
        {drawerOpen && <div className="drawer"><ErrorBoundary label={L('List details', 'פרטי רשימה')} resetKey={selected}><ListSidePanel s={committed} r={cr} ds={ds} base={base} baseR={baseR} listId={selected} /></ErrorBoundary></div>}
        <p className="small muted" style={{ margin: 0 }}>{L('Seat allocation is computed by deterministic code from official Central Elections Committee data. Not affiliated with the CEC or any party.', 'חלוקת המנדטים מחושבת בקוד דטרמיניסטי מנתוני ועדת הבחירות המרכזית. אין קשר לוועדת הבחירות או לאף מפלגה.')}</p>
      </main></>}
      {toast && <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>{toast.text}</div>}
    </div>
  );
}
