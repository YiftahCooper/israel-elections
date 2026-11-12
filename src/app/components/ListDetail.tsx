import { percent } from './Percentage.tsx';
import { k19ListNote } from '../k19Note.ts';
import {ColourPicker} from './ColourPicker.tsx';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { SeatDelta, SeatEffects } from './SeatDelta.tsx';
import { NumericStepper } from './NumericStepper.tsx';
import { TransferStep } from './TransferStep.tsx';
import { applyAction } from '../../model/actions.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { Feature } from './Feature.tsx';
import { StartFrom } from './StartFrom.tsx';
import { EditMarker } from './EditMarker.tsx';
import { PartEdits } from './PartEdits.tsx';
// A list opened in place, inside its own row of the lists table: its votes (number, share, a live slider),
// how far the next seat and the loss of one are (computed on opening), its surplus-vote agreement, its parties,
// its standing, identity and candidates. Controls appear only where they apply to this list.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { SearchResult } from '../../engine/analysis.ts';
import { allocate } from '../../engine/allocate.ts';
import { rat } from '../../engine/rational.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, votesCast, type Scenario, type SimList } from '../../model/scenario.ts';
import { runTasks } from '../analysisPool.ts';
import type { AnalysisTask } from '../analysisTasks.ts';
import { listLabel, referenceLabel, warningText } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtRat, fmtSigned } from '../format.ts';
import { dispatch, dispatchMany, getState, useStore, previewAction, setState, toast, useFeature, useShown, useLevel, useVoteSource, useDigits, useSetting, withSource } from '../store.ts';
import { clampTarget, deltaAction, stayingHome, toVoteSource, type SourceChoice, votesForShare, voteSourceLabel } from '../voteEdit.ts';
import { Candidates, notSeatedReasons } from './Candidates.tsx';
import { JointParties } from './JointParties.tsx';
import { DecimalInput, Info, TextField } from './ui.tsx';
import { SourcePicker } from './SourcePicker.tsx';

const niceCeil = (n: number) => { const p = 10 ** Math.max(0, Math.floor(Math.log10(Math.max(1, n))) - 1); return Math.ceil(n / p) * p; };

/** A vote slider that previews the whole board live while dragged and commits one undoable edit on release. */
function LiveSlider({ l, ceiling, onCommit }: { l: SimList; ceiling: number; onCommit: (v: number) => void }) {
  const L = useL();
  const src = useVoteSource();
  const [drag, setDrag] = useState<number | null>(null);
  const [scale] = useState(() => niceCeil(Math.max(ceiling, 20_000)));
  const max = Math.max(scale, l.votes);
  const committed = getState().scenario?.lists.find((x) => x.id === l.id) ?? l;
  const value = drag ?? committed.votes;
  const pending = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (pending.current !== null) previewAction(null);
  }, []);
  const preview = (v: number) => {
    setDrag(v);
    pending.current = v;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const v = pending.current; if (v === null) return;
      const s = getState().scenario; if (!s) return;
      const t = clampTarget(s, committed, v, src);
      previewAction(deltaAction(s, committed, t - committed.votes, src));
    });
  };
  const commit = () => {
    const v = pending.current; if (v === null) return;
    pending.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null; setDrag(null);
    if (v !== committed.votes) onCommit(v);
    previewAction(null);
  };
  // cube-root track: the threshold region sits about a third of the way along, so small lists get fine control
  // while the track still reaches every list's votes; values snap to a round amount for the size
  const POS = 1000;
  const toPos = (v: number) => Math.round(Math.cbrt(Math.max(0, v) / max) * POS);
  const fromPos = (p: number) => { const raw = max * (p / POS) ** 3; const q = raw < 10_000 ? 100 : raw < 100_000 ? 500 : 1000; return Math.min(max, Math.round(raw / q) * q); };
  return (
    <div>
      <input type="range" min={0} max={POS} step={1} value={toPos(value)} aria-label={L('Votes slider', 'מחוון קולות')} aria-valuetext={value.toLocaleString('en-US')}
        onPointerDown={e => e.currentTarget.setPointerCapture(e.pointerId)}
        onChange={(e) => preview(fromPos(Number(e.target.value)))} onPointerUp={commit} onPointerCancel={commit} onKeyUp={commit} onBlur={commit} onTouchEnd={commit} />
      <div dir="ltr" className="row tiny muted" style={{ justifyContent: 'space-between' }}>
        <span>0</span>
        <span>{drag !== null ? <b className="ink2">{drag.toLocaleString('en-US')}</b> : L('Drag to adjust', 'גררו לשינוי')}</span>
        <span>{max.toLocaleString('en-US')}</span>
      </div>
    </div>
  );
}

/** Votes to the next seat and before losing one (or to pass the threshold), computed exactly in the background. */
function useMargins(s: Scenario, l: SimList, seats: number, qualified: boolean) {
  const src = useVoteSource();
  const [res, setRes] = useState<{ scenario: Scenario; source: typeof src; listId: string; value: { gain?: SearchResult; lose?: SearchResult; qualify?: SearchResult; disqualify?: SearchResult } } | null>(null);
  const job = useRef<(() => void) | null>(null);
  useEffect(() => {
    setRes(null);
    if (l.withdrawn) return;
    const input = toEngineInput(s);
    const goals = qualified ? (['gain', 'lose', 'disqualify'] as const) : (['qualify'] as const);
    const tasks = goals.map((goal) => ({ kind: 'listSearch', input, src: toVoteSource(src, s), goal, id: l.id, seats } as const));
    const out: Record<string, SearchResult> = {};
    job.current = runTasks(tasks, (i, v) => { out[goals[i]] = v; if (Object.keys(out).length === goals.length) setRes({ scenario: s, source: src, listId: l.id, value: { ...out } }); });
    return () => { job.current?.(); job.current = null; };
  }, [s, l.id, seats, qualified, src]);
  // Never expose a boundary from the previous votes/list/source during the effect transition.
  return res?.scenario === s && res.source === src && res.listId === l.id ? res.value : null;
}

export function ListDetail({ s, r, ds, base, baseR, l }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const { reference } = useActiveReference();
  const baseLabel = referenceLabel(base === reference ? reference : null, lang);
  const digits = useDigits();
  const hoverPreviews = useSetting('hoverPreviews');
  const { simple } = useLevel();
  const src = useVoteSource();
  const lr = r.lists.find((x) => x.id === l.id)!;
  const previous = useRef({ id: l.id, qualified: lr.qualified, withdrawn: l.withdrawn });
  const [crossing, setCrossing] = useState<boolean | null>(null);
  useEffect(() => {
    // withdrawing or reinstating a list is its own, already stated change: not a threshold crossing
    if (previous.current.id !== l.id || previous.current.withdrawn !== l.withdrawn) setCrossing(null);
    else if (previous.current.qualified !== lr.qualified) setCrossing(lr.qualified);
    previous.current = { id: l.id, qualified: lr.qualified, withdrawn: l.withdrawn };
  }, [l.id, lr.qualified, l.withdrawn]);
  // Exact goal searches belong to committed inputs, never to every pointer frame.
  const committed = useStore(st => st.scenario) ?? s;
  const committedList = committed.lists.find(x => x.id === l.id) ?? l;
  const committedResult = useMemo(() => allocate(toEngineInput(committed)), [committed]);
  const committedLR = committedResult.lists.find(x => x.id === l.id) ?? lr;
  const searched = useMargins(committed, committedList, committedLR.seats, committedLR.qualified);
  const margins = committed === s ? searched : null;

  const boundarySearch = lr.qualified ? margins?.disqualify : margins?.qualify;
  const boundary = boundarySearch?.found && boundarySearch.votes !== null && boundarySearch.exact
    ? l.votes + (lr.qualified ? 1 - Number(boundarySearch.votes) : Number(boundarySearch.votes)) : null;
  const sourceName = voteSourceLabel(src, s, lang);

  const agr = s.agreements.find((a) => a.members.includes(l.id));
  const agrStatus = agr ? r.agreements.find((a) => a.id === agr.id) : undefined;
  const agreementEffect = useMemo(() => {
    if (!agr?.enabled) return null;
    const without = allocate(toEngineInput({ ...s, agreements: s.agreements.map((x) => (x.id === agr.id ? { ...x, enabled: false } : x)) }));
    return without.lists.map((x) => ({ id: x.id, d: (r.lists.find((y) => y.id === x.id)?.seats ?? 0) - x.seats })).filter((x) => x.d !== 0);
  }, [s, r, agr]);

  const baseList = base.lists.find((b) => b.id === l.id) ?? null;
  // votes have their own "Restore votes" beside the goals; "Restore list" appears only when something else changed
  const listChanged = useMemo(() => !!baseList && JSON.stringify({ ...baseList, votes: 0 }) !== JSON.stringify({ ...l, votes: 0 }), [baseList, l]);
  const histSeats = baseList ? baseR.lists.find((x) => x.id === l.id)!.seats : -1;
  const histShares = Object.fromEntries(base.lists.map((b) => [b.id, b.votes]));
  const pctValid = r.totalValid > 0n ? (l.votes / Number(r.totalValid)) * 100 : 0;
  const nameOf = (id: string) => { const x = s.lists.find((y) => y.id === id); return x ? listLabel(x, lang) : L('Removed list', 'רשימה שהוסרה'); };

  /** every edit of this list's votes goes through the shared source setting */
  const editTo = (target: number, from: SourceChoice = src) => {
    const cur = getState().scenario; const cl = cur?.lists.find((x) => x.id === l.id); if (!cur || !cl) return;
    const t = clampTarget(cur, cl, target, from);
    if (t !== Math.round(target)) toast('info', L(`Limited to ${fmtInt(t)}: the chosen source cannot supply more votes.`, `הוגבל ל-${fmtInt(t)}: במקור שנבחר אין יותר קולות.`));
    const a = deltaAction(cur, cl, t - cl.votes, from, histShares);
    if (a) dispatch(a);
  };
  const [consequence, setConsequence] = useState<import('react').ReactNode>('');
  useEffect(() => setConsequence(''), [s, src]);
  // Every vote edit here asks where its votes come from (one shared dialog) unless that is remembered or was
  // already answered for this list. Targets that depend on the source are worked out under the answer.
  const commit = (run: (from: SourceChoice) => void) => withSource(`list:${l.id}`, listLabel(l, lang), [l.id], run);
  const job = useRef<(() => void) | null>(null);
  useEffect(() => () => job.current?.(), []);
  /** a search under `from` (the one already on screen when the source is unchanged), then an edit from its result */
  const searchThen = (from: SourceChoice, task: AnalysisTask, shown: SearchResult | undefined, then: (res: SearchResult) => void) => {
    job.current?.(); job.current = null;
    if (shown && JSON.stringify(from) === JSON.stringify(src)) return then(shown);
    setConsequence(L('Searching…', 'מחפש…'));
    const at = s;
    job.current = runTasks([task], (_, res) => { job.current = null; if (getState().scenario === at) { setConsequence(''); then(res as SearchResult); } });
  };
  const notFound = (res: SearchResult) => toast('info', res.reason === 'inconclusive' || (res.found && !res.exact) ? L('Inconclusive within the search limit', 'לא הוכרע בטווח החיפוש') : L('Not reachable from this source', 'לא ניתן להגיע מהמקור הזה'));
  /** a typed or stepped seat count: the fewest votes that give it, as one ordinary (marked, undoable) vote edit */
  const seatsFrom = (n: number, from: SourceChoice) => {
    const shown = lr.qualified && n === lr.seats + 1 ? margins?.gain : lr.qualified && lr.seats > 0 && n === lr.seats - 1 ? margins?.lose : undefined;
    searchThen(from, { kind: 'seatTarget', input: toEngineInput(s), src: toVoteSource(from, s), id: l.id, seats: lr.seats, n }, shown, (res) => {
      if (!res.found || res.votes === null) return notFound(res);
      const got = res.after?.lists.find((x) => x.id === l.id)?.seats ?? n;
      editTo(l.votes + (n > lr.seats ? 1 : -1) * Number(res.votes), from);
      if (got !== n) toast('info', L(`${n} seats is not possible from this source; nearest: ${got}`, `${n} מנדטים אינם אפשריים מהמקור הזה; הקרוב ביותר: ${got}`));
    });
  };
  /** a boundary goal: keep the seats with the fewest votes, or sit just either side of the threshold */
  const goalFrom = (goal: 'lose' | 'qualify' | 'disqualify', from: SourceChoice) => {
    const shown = margins?.[goal];
    searchThen(from, { kind: 'listSearch', input: toEngineInput(s), src: toVoteSource(from, s), goal, id: l.id, seats: lr.seats }, shown, (res) => {
      if (!res.found || res.votes === null || !res.exact) return notFound(res);
      const k = Number(res.votes);
      editTo(goal === 'qualify' ? l.votes + k : goal === 'disqualify' ? l.votes - k : l.votes - k + 1, from);
    });
  };
  const seatVotes = (n: number) => {
    const m = n === lr.seats + 1 ? (lr.qualified ? margins?.gain : margins?.qualify) : n === lr.seats - 1 && lr.qualified ? margins?.lose : undefined;
    return m?.found && m.votes !== null ? l.votes + (n > lr.seats ? 1 : -1) * Number(m.votes) : null;
  };
  const explainTarget = (target: number) => {
    const t = clampTarget(s, l, target, src), a = deltaAction(s, l, t - l.votes, src, histShares);
    if (!a) return setConsequence(L('Seats unchanged', 'המנדטים ללא שינוי'));
    try { const next = allocate(toEngineInput(applyAction(s, a))); setConsequence(<SeatEffects>{next.lists.map(x => ({ id: x.id, d: x.seats - (r.lists.find(y => y.id === x.id)?.seats ?? 0) })).filter(x => x.d).map(x => <span key={x.id}>{nameOf(x.id)} <SeatDelta value={x.d} /> </span>)}</SeatEffects>); } catch { setConsequence(''); }
  };
  /** A one-press vote edit. Goals show the signed change they make, so every goal reads the same way. */
  const quick = (label: string, target: number | null, showDelta = true, go?: (from: SourceChoice) => void) => {
    const t = target === null ? null : clampTarget(s, l, target, src);
    const delta = showDelta && t !== null && t !== l.votes ? `(${fmtSigned(t - l.votes)})` : null;
    return <button key={label} className="btn small" disabled={t === null || t === l.votes} aria-description={delta ? `${delta} · ${sourceName}` : sourceName} onMouseEnter={() => { if (t !== null && hoverPreviews) explainTarget(t); }} onFocus={() => { if (t !== null) explainTarget(t); }} onClick={() => { if (t !== null) commit(go ?? ((from) => editTo(target!, from))); }}><span dir={/^[×÷]/.test(label) ? 'ltr' : undefined}>{label}</span>{delta && <bdi dir="ltr" aria-hidden>{delta}</bdi>}</button>;
  };
  const transferShown = useFeature('voteSource') === 'show';
  const walkShown = useShown('walk');
  const total = Number(r.totalValid);
  // the default step is the largest round amount that is still a small move in this election (≤ 2% of the valid votes)
  const defaultStep = total >= 500_000 ? '10k' : '1k';
  const [moreOpen, setMoreOpen] = useState(false);
  const gain = lr.qualified ? margins?.gain : margins?.qualify;
  const gainTarget = gain?.found && gain.votes !== null ? l.votes + Number(gain.votes) : null;



  const unit = lr.unitId ? r.units.find((u) => u.id === lr.unitId) : undefined;
  const nextQ = unit ? rat(unit.votes, BigInt(unit.seats + 1)) : null;
  const wonQs = r.remainderSteps.map((st) => st.quotients.find((q) => q.unitId === st.winnerUnitId)!.value);
  const lastWin = wonQs.length ? wonQs.reduce((m, q) => (q.num * m.den < m.num * q.den ? q : m)) : null;
  const inOther = new Set(s.agreements.filter((a) => a.enabled && !a.members.includes(l.id)).flatMap((a) => a.members));
  const partners = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && !inOther.has(x.id)).sort((a, b) => b.votes - a.votes);
  const partnerId = agr?.members.find((m) => m !== l.id) ?? '';
  const setPartner = (id: string) => {
    if (!id) { if (agr) dispatch({ type: 'removeAgreement', id: agr.id }); return; }
    dispatch({ type: 'setAgreement', agreement: { id: agr?.id ?? `sim-agr-${Date.now().toString(36)}`, members: [l.id, id], enabled: agr?.enabled ?? true } });
  };
  const notes = ds.lists.find((x) => x.id === l.id)?.notesHe ?? [];
  const notSeatedWhy = notSeatedReasons(ds);

  return (
    <div className="ld" role="region" aria-label={L('List details', 'פרטי רשימה')}>
      {r.warnings.filter(w => w.data?.list === l.id || (w.data?.ids as string[] | undefined)?.includes(l.id)).map((w, i) =>
        <p key={i} className="callout small">{warningText(w, s, lang)}</p>)}
      <section>
        {!l.withdrawn && <div className="seat-target">
          <NumericStepper label={L('Seats', 'מנדטים')} showLabel value={lr.seats} onCommit={(n) => commit((from) => seatsFrom(n, from))} max={s.rules.seats}
              steps={[{ id: '1', label: '1', amount: 1 }]} onPreview={(n) => { const t = seatVotes(n); if (t !== null) explainTarget(t); }} />
            <Info title={L('Seats', 'מנדטים')}>{L('Type a seat count: the fewest votes that give it are moved.', 'הקלידו מספר מנדטים: יועברו הכי מעט קולות שמביאים אותו.')}</Info>
        </div>}
        <h3>{L('Votes', 'קולות')} <EditMarker s={s} path={['lists', l.id, 'votes']} />{k19ListNote(l.id, lang) && <Info title={L('Declared and detailed results', 'התוצאה המוכרזת והמפורטת')}>{k19ListNote(l.id, lang)}</Info>}</h3>
        {!lr.qualified && !l.withdrawn && Number(s.rules.thresholdPct) > 0 && <p className="small ink2">{L('Below the threshold', 'מתחת לאחוז החסימה')}</p>}
        {l.withdrawn && <p className="small callout" style={{ marginTop: 0 }}>{L(`This list has withdrawn: its ${fmtInt(l.heldVotes ?? 0)} ballots count as invalid.`, `הרשימה פרשה: ${fmtInt(l.heldVotes ?? 0)} הפתקים שלה נחשבים פסולים.`)}</p>}
        <fieldset disabled={l.withdrawn} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'grid', gap: 8 }}>
          <NumericStepper label={L('Votes', 'קולות')} value={l.votes} onCommit={(v) => commit((from) => editTo(v, from))} max={clampTarget(s, l, Number.MAX_SAFE_INTEGER, src)}
            onStepCommit={(step, direction) => commit((from) => editTo(step.unit === 'pp' ? votesForShare(s, l, pctValid + direction * step.amount, from) ?? l.votes : l.votes + direction * step.amount, from))}
            steps={[{ id: '1k', label: '1k', amount: 1000 }, { id: '10k', label: '10k', amount: 10000 }, { id: '0.1pp', label: L('0.1pp', '0.1 נק׳'), amount: 0.1, unit: 'pp' }, { id: '1pp', label: L('1pp', '1 נק׳'), amount: 1, unit: 'pp' }]}
            defaultStep={defaultStep}
            targetForStep={(step, direction) => step.unit === 'pp' ? votesForShare(s, l, pctValid + direction * step.amount, src) : l.votes + direction * step.amount}
            onPreview={explainTarget} />
          {!l.withdrawn && <><div className="vote-goals">
            {lr.qualified && quick(L('Reach next seat', 'הגעה למנדט הבא'), gainTarget, true, (from) => seatsFrom(lr.seats + 1, from))}
            {lr.seats > 0 && quick(L(`Fewest votes to keep ${lr.seats} seats`, `הכי מעט קולות לשמירת ${lr.seats} מנדטים`), margins?.lose?.exact && margins.lose.found && margins.lose.votes !== null ? l.votes - Number(margins.lose.votes) + 1 : null, true, (from) => goalFrom('lose', from))}
            {Number(s.rules.thresholdPct) > 0 && quick(lr.qualified ? L('Just below threshold', 'מעט מתחת לחסימה') : L('Cross the threshold', 'מעבר אחוז החסימה'), boundary === null ? null : boundary - (lr.qualified ? 1 : 0), true, (from) => goalFrom(lr.qualified ? 'disqualify' : 'qualify', from))}
            {baseList && <div style={{ visibility: baseList.votes === l.votes ? 'hidden' : undefined }}>{quick(L('Restore votes', 'שחזור הקולות'), baseList.votes)}</div>}
          </div>
          <p className="tiny seat-search-status" role="status">{(() => {
            if (!gain) return L('Searching…', 'מחפש…');
            if (!gain.found || gain.votes === null) return gain.reason === 'inconclusive' ? L('Inconclusive within the search limit', 'לא הוכרע בטווח החיפוש') : gain.reason === 'limit' ? L('Not reachable from this source', 'לא ניתן להגיע מהמקור הזה') : gain.reason === 'already' ? L('Already reached', 'כבר הושג') : L('No solution from this source', 'אין פתרון מהמקור הזה');
            const seats = (gain.after?.lists.find(x => x.id === l.id)?.seats ?? lr.seats) - lr.seats;
            return <><SeatDelta value={seats} /> {seats === 1 ? L('seat', 'מנדט') : L('seats', 'מנדטים')} · {gain.exact ? L('proven minimum', 'מינימום מוכח') : L('sampled; minimum unproven', 'דגימה; המינימום לא הוכח')}</>;
          })()}</p>
          <p className="tiny quick-consequence" role="status">{consequence}</p></>}
          <LiveSlider key={l.id} l={l} ceiling={Number(r.totalValid)} onCommit={(v) => commit((from) => editTo(v, from))} />
          {src.kind === 'new' && <p className="tiny ink2" style={{ margin: 0 }}>{L(`Staying home: ${fmtInt(stayingHome(s))}`, `לא הצביעו: ${fmtInt(stayingHome(s))}`)}</p>}
          {simple && <p className="tiny ink2" style={{ margin: 0 }}>{sourceName}</p>}
          </fieldset>
          <Feature id="voteSource"><SourcePicker s={s} l={l} /></Feature>
          <fieldset disabled={l.withdrawn} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <button className="btn small more-trigger" aria-expanded={moreOpen} onClick={() => setMoreOpen(v => !v)}>{L('Scale, share & transfer', 'הכפלה, אחוזים והעברה')} <span aria-hidden>▾</span></button>
          {moreOpen && <div className="vote-more">
            <div className="row">{quick('×2', l.votes * 2, false)}{quick('÷2', Math.round(l.votes / 2), false)}</div>
            <label className="row small">{L('Share of valid votes (%)', 'שיעור מהקולות הכשרים (%)')}<DecimalInput value={pctValid} digits={Math.max(2, digits)} width={74} label={L('Share of valid votes (%)', 'שיעור מהקולות הכשרים (%)')} onCommit={p => commit((from) => { const t = votesForShare(s, l, p, from); if (t !== null) editTo(t, from); })} /></label>
            {/* the vote-source disclosure above already offers this level's way in; no second one here */}
            {transferShown && <TransferStep s={s} l={l} />}
          </div>}
        </fieldset>
        <Feature id="voteStart"><StartFrom s={s} part="votes" /></Feature>
      </section>

      {crossing !== null && Number(s.rules.thresholdPct) > 0 && <p className="small crossing">{crossing ? L('Passed the threshold', 'עברה את אחוז החסימה') : L('Below the threshold', 'מתחת לאחוז החסימה')} <Info title={L('Allocation recalculated', 'החלוקה חושבה מחדש')}>{L('Qualifying votes and every allocation were recalculated.', 'הקולות המשתתפים וכל החלוקה חושבו מחדש.')}</Info> {walkShown && <button className="table-action" onClick={() => setState({ tool: 'walk', selectedListId: null })}>{L('Walkthrough: threshold', 'שלבי החלוקה: אחוז החסימה')}</button>}</p>}

      {simple && agr && <p className="small">{L('With ', 'עם ')}{nameOf(partnerId)} · {agrStatus?.active ? L('in force', 'בתוקף') : !agr.enabled ? L('switched off', 'כבוי') : L('no effect', 'ללא השפעה')}</p>}
      <Feature id="agreements">
        <section>
          <StartFrom s={s} part="agreements" />
          <h3><EditMarker s={s} path={['agreements']} />{L('Surplus-vote agreement', 'הסכם עודפים')} <Info term="surplus" /></h3>
          <div className="row">
            <select aria-label={L('Agreement partner', 'שותפה להסכם')} value={partnerId} onChange={(e) => setPartner(e.target.value)} style={{ maxWidth: 220 }}>
              <option value="">{L('No agreement', 'אין הסכם')}</option>
              {partners.map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
            </select>
            {agr && <label className="switch small"><input type="checkbox" checked={agr.enabled} onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...agr, enabled: e.target.checked } })} />{agr.enabled ? L('In force', 'בתוקף') : L('Off', 'כבוי')}</label>}
          </div>
          {agr && <p className="small" style={{ margin: '6px 0 0' }}>
            {!agr.enabled ? L('Switched off: both lists compete alone for the remaining seats.', 'כבוי: שתי הרשימות מתחרות לבד על המנדטים הנותרים.')
              : !agrStatus?.active ? (agrStatus?.reason === 'member-withdrawn' ? L('No effect: a partner withdrew.', 'ללא השפעה: שותפה פרשה.') : agrStatus?.reason === 'duplicate-membership' ? L('No effect: a list is in two agreements.', 'ללא השפעה: רשימה בשני הסכמים.') : agrStatus?.reason === 'too-many-members' ? L('Not allowed under these rules.', 'לא מותר לפי הכללים.') : agrStatus?.reason === 'member-no-initial-seat' ? L('No effect: a partner won no whole-quota seat.', 'ללא השפעה: שותפה לא זכתה במנדט במודד שלם.') : L('No effect: a partner failed the threshold.', 'ללא השפעה: שותפה לא עברה את החסימה.'))
              : agreementEffect && agreementEffect.length ? <>{L('Effect: ', 'השפעה: ')}{agreementEffect.map(e => <span key={e.id}>{nameOf(e.id)} <SeatDelta value={e.d} /> </span>)}</> : L('Effect: none — the same seats are won without it.', 'השפעה: אין — אותם מנדטים גם בלעדיו.')}
          </p>}
        </section></Feature>


      <PartEdits s={s} prefix={['lists', l.id]} /><JointParties s={s} r={r} l={l} />

      <Feature id="standing">
        <section>
          <h3>{L('Standing', 'מעמד')}</h3>
          <div className="row">
            {s.blocs.length > 0 && <label className="row small" style={{ gap: 6 }}>{L('Bloc', 'גוש')}
              <EditMarker s={s} path={['lists', l.id, 'bloc']} /><select value={l.bloc ?? ''} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { bloc: e.target.value || null } })}>
                <option value="">{L('None', 'ללא')}</option>
                {s.blocs.map((b) => <option key={b.id} value={b.id} title={b.appDefined ? appGroupingExplanation(lang) : undefined}>{groupingName(b, lang)}</option>)}
              </select></label>}
            <label className="switch small"><input type="checkbox" checked={l.withdrawn} onChange={(e) => dispatch({ type: 'setWithdrawn', listId: l.id, withdrawn: e.target.checked })} />{L('Withdrawn from the race', 'פרשה מההתמודדות')}<EditMarker s={s} path={['lists', l.id, 'withdrawn']} /></label>
            {!baseList && <button className="btn small danger" onClick={() => { dispatch({ type: 'removeList', listId: l.id }); setState({ selectedListId: null }); }}>{L('Delete this list', 'מחיקת הרשימה')}</button>}
            {baseList && listChanged && <button className="btn small" onClick={() => {
              const a = deltaAction(s, l, clampTarget(s, l, baseList.votes, src) - l.votes, src, histShares);
              dispatchMany([...(a ? [a] : []), { type: 'resetList', listId: l.id, keepVotes: true }]);
            }}>{L('Restore list', 'שחזור הרשימה')}</button>}
          </div>
          {/* English shows the parties' English names; a letter-by-letter rendering of the registered Hebrew names is unreadable, so none is shown */}
          {l.sponsorsHe && (lang === 'he' || !!l.parties?.length) && <p className="tiny muted" lang={lang} style={{ margin: '6px 0 0' }}>{L('Submitted by: ', 'הוגשה מטעם: ')}{(lang === 'he' ? l.sponsorsHe : l.parties!.map(p => p.nameEn).join(' · ')).replace(/; /g, ' · ')}</p>}
        </section></Feature>

      <Feature id="allocation">
        <section>
          <h3>{L('Allocation detail', 'פירוט החלוקה')}</h3>
          <div className="kv small">
            {lr.qualified && <><span>{L('Share of qualifying votes', 'מהקולות המשתתפים')}</span><span>{percent(l.votes, r.qualifyingVotes, digits)}</span></>}
            <span>{L('Share of ballots cast', 'מכלל המצביעים')}</span><span>{percent(l.votes, votesCast(s), digits)}</span>
            <span>{L('Share of registered voters', 'מבעלי זכות הבחירה')}</span><span>{percent(l.votes, s.registered, digits)}</span>
            {lr.qualified && <>
              <span>{L('Whole-quota seats', 'מנדטים במודד')}</span><span><bdi dir="ltr"><span className="muted">⌊{fmtInt(l.votes)} ÷ {fmtRat(r.quota, 0)}⌋ =</span> {lr.initialSeats}</bdi></span>
              <span>{L('Remainder-stage seats', 'מנדטים מעודפים')}</span><span>{lr.seats - lr.initialSeats}</span>
              <span>{L('Votes per seat won', 'קולות למנדט')}</span><span>{lr.seats ? fmtInt(Math.round(l.votes / lr.seats)) : '—'}</span>
              {nextQ && <><span>{unit?.isAgreement ? L('Pair’s next-seat quotient', 'מודד הצמד למנדט הבא') : L('Next-seat quotient', 'מודד רשימה למנדט הבא')} <Info term="listquota" /></span><span title={fmtFrac(nextQ)}>{fmtRat(nextQ, 1)}</span></>}
              {lastWin && <><span>{L('Lowest winning quotient', 'המודד הזוכה הנמוך ביותר')}</span><span>{fmtRat(lastWin, 1)}</span></>}
            </>}
            <span>{baseLabel.seats}</span><span>{histSeats < 0 ? L('Compared together on Overview', 'השוואה משותפת בתמונת המצב') : histSeats}</span>
          </div>
        </section></Feature>

      <Feature id="identity">
        <section>
          <StartFrom s={s} part="identity" listId={l.id} />
          <h3>{L('Name and colour (display only)', 'שם וצבע (תצוגה בלבד)')}</h3>
          <div className="grid2">
            <label className="field">{L('Short name (Hebrew)', 'שם מקוצר')}<TextField value={l.shortHe} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { shortHe: v } })} /></label>
            <label className="field">{L('Short name (English)', 'שם באנגלית')}<TextField value={l.shortEn ?? ''} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { shortEn: v || null } })} /></label>
            <label className="field">{L('Ballot letters', 'אותיות הרשימה')}<EditMarker s={s} path={['lists', l.id, 'letters']} /><TextField value={l.letters} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { letters: v } })} /></label>
            <ColourPicker label={L('Colour', 'צבע')} value={l.color} onChange={color=>dispatch({type:'setListMeta',listId:l.id,patch:{color}})} others={s.lists.filter(x=>x.id!==l.id&&!x.withdrawn).map(x=>({color:x.color,name:listLabel(x,lang)}))}/>
            {l.parties?.map(p=><ColourPicker key={p.id} label={L('Party colour: ','צבע מפלגה: ')+(lang==='he'?p.nameHe:p.nameEn)} value={p.customColor&&p.color?p.color:partyDisplayColor(l,p.id)} onChange={color=>dispatch({type:'setPartyColor',listId:l.id,partyId:p.id,color})} backgrounds={[]} minDeltaE={20} others={(l.parties??[]).filter(x=>x.id!==p.id).map(x=>({color:partyDisplayColor(l,x.id),name:lang==='he'?x.nameHe:x.nameEn}))}/>)}
            <button className="btn small" onClick={()=>dispatch({type:'resetColors'})}>{L('Reset colours','איפוס צבעים')}</button>
            <label className="field" style={{ gridColumn: '1 / -1' }}>{L('Full name', 'שם מלא')}<EditMarker s={s} path={['lists', l.id, 'nameHe']} /><TextField value={l.nameHe} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { nameHe: v } })} /></label>
          </div>
        </section></Feature>

      {/* qualifications of the published record: shown at every level, never folded (a truth label, audit 12 Nov 2026) */}
      {notes.length > 0 && <section>
        {/* written by this project's data build about the official publications (not text of the Elections Committee); Hebrew only so far */}
        <h3>{L('Notes on the sources (in Hebrew)', 'הערות על המקורות')}</h3>
        {notes.map((n, i) => <p key={i} className="small" lang="he" dir="rtl" style={{ margin: '0 0 4px' }}>{n}</p>)}
      </section>}

      <section className="wide">
        <Candidates l={l} seats={lr.seats} baseSeats={baseList ? histSeats : -1} baseCandidates={baseList?.candidates} notSeatedWhy={notSeatedWhy}
          marker={<EditMarker s={s} path={['lists', l.id, 'candidates']} />}
          secondary={ds.lists.find((x) => x.id === l.id)?.candidatesSecondary && <p className="small ink2">{L('Secondary source', 'מקור משני')} <Info title={L('Candidate source', 'מקור המועמדים')}>{L('Candidate list from a secondary source (the official page could not be retrieved).', 'רשימת המועמדים ממקור משני (העמוד הרשמי לא נטען).')}</Info></p>} />
      </section>
    </div>
  );
}
