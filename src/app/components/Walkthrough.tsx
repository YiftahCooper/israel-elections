import { percent } from './Percentage.tsx';
import { SeatDelta } from './SeatDelta.tsx';
import { GraphicChanges } from './GraphicChanges.tsx';
import { EditMarker } from './EditMarker.tsx';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AllocationResult, Quotient, RemainderStep } from '../../engine/types.ts';
import type { Rational } from '../../engine/rational.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel, methodOf } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtRat } from '../format.ts';
import { dispatch, setState, useStore, useDigits } from '../store.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { Info } from './ui.tsx';

type Stage = 'threshold' | 'quota' | 'initial' | 'agreements' | 'remainder' | 'internal' | 'final';
type Step = { kind: 'threshold' } | { kind: 'quota' } | { kind: 'initial' } | { kind: 'agreements' } | { kind: 'remainder'; st: RemainderStep } | { kind: 'internal'; unitId: string } | { kind: 'final' };

/** A whole number without trailing ".000"; other values to `digits` decimals. */
const num = (r: Rational, digits: number) => (r.den === 1n || r.num % r.den === 0n ? fmtInt(r.num / r.den) : fmtRat(r, digits));
/** "was → now" for a value that differs from the active reference; numbers read left to right in Hebrew too. */
const delta = (now: number, was: number | undefined): ReactNode => (was === undefined || was === now ? String(now) : <bdi dir="ltr" className="walk-delta">{was} → {now} (<SeatDelta value={now - was} />)</bdi>);
const DIVISOR = ['sainte-lague', 'dhondt', 'modified-sainte-lague'];

export function Walkthrough({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const advanced = useStore((st) => st.level === 'expert');
  const { base, result: br } = useGraphicReference(s);
  // divisor methods (Sainte-Laguë, D'Hondt…) have no quota stage: every seat is awarded one at a time
  const divisor = DIVISOR.includes(s.rules.remainderMethod);
  const lr = s.rules.remainderMethod === 'largest-remainder' || s.rules.remainderMethod === 'droop';
  const switchedOff = s.agreements.filter((a) => !a.enabled);
  const hasAgreements = r.agreements.length > 0 || switchedOff.length > 0;
  const steps: Step[] = useMemo(() => [
    { kind: 'threshold' }, ...(divisor ? [] : [{ kind: 'quota' as const }, { kind: 'initial' as const }]),
    ...(hasAgreements ? [{ kind: 'agreements' as const }] : []),
    ...r.remainderSteps.map((st) => ({ kind: 'remainder' as const, st })),
    ...r.internalDivisions.map((d) => ({ kind: 'internal' as const, unitId: d.unitId })),
    { kind: 'final' },
  ], [r, divisor, hasAgreements]);
  const [i, setI] = useState(0);
  const [allBelow, setAllBelow] = useState(false);
  useEffect(() => { if (i >= steps.length) setI(steps.length - 1); }, [steps.length, i]);
  const go = (k: number) => setI(k);

  const listOf = (id: string) => s.lists.find((x) => x.id === id);
  const unitMembers = (id: string, res: AllocationResult = r) => res.units.find((u) => u.id === id)?.memberIds ?? [id];
  const name = (id: string) => {
    const l = listOf(id);
    if (l) return listLabel(l, lang);
    const u = r.units.find((x) => x.id === id);
    return u ? u.memberIds.map((m) => listLabel(listOf(m)!, lang)).join(' + ') : L('Allocation unit', 'יחידת חלוקה');
  };
  const colours = (id: string) => unitMembers(id).map((m) => listOf(m)?.color ?? 'var(--muted)');
  const swatches = (id: string) => colours(id).map((c, k) => <span key={k} className="swatch" style={{ background: c }} />);
  const step = steps[Math.min(i, steps.length - 1)];
  const stageOf = (st: Step): Stage => st.kind;
  const STAGES: { kind: Stage; en: string; he: string }[] = [
    { kind: 'threshold', en: 'Threshold', he: 'אחוז החסימה' },
    { kind: 'quota', en: 'Quota', he: 'המודד' },
    { kind: 'initial', en: 'Whole quotas', he: 'מודדים שלמים' },
    { kind: 'agreements', en: 'Surplus agreements', he: 'הסכמי עודפים' },
    { kind: 'remainder', en: 'Remainder seats', he: 'מנדטים עודפים' },
    { kind: 'internal', en: 'Within pairs', he: 'חלוקה בתוך הצמדים' },
    { kind: 'final', en: 'Result', he: 'התוצאה' },
  ];
  const stages = STAGES.filter((g) => steps.some((st) => st.kind === g.kind));
  const stageNo = (kind: Stage) => stages.findIndex((g) => g.kind === kind) + 1;
  const current = stageOf(step);
  const firstRemainder = steps.findIndex((st) => st.kind === 'remainder');
  const remainderCount = r.remainderSteps.length;

  // the quota as the engine computed it: seats + 1 in 1949, Droop, unrounded, or the exact fallback when rounding fails
  const fallbackAt = (stage?: string) => r.warnings.some((w) => (w.code === 'zero-quota' || w.code === 'quota-over-allocation') && (w.data as { stage?: string } | undefined)?.stage === stage);
  const quotaFormula = (votes: bigint, seats: number, stage?: string) => {
    const fallback = fallbackAt(stage);
    const div = seats + (fallback ? 0 : s.rules.quotaSeatOffset ?? 0);
    return s.rules.remainderMethod === 'droop' && !fallback ? `⌊ ${fmtInt(votes)} ÷ ${seats + 1} ⌋ + 1`
      : s.rules.quotaRounding === 'floor' && !fallback ? `⌊ ${fmtInt(votes)} ÷ ${div} ⌋` : `${fmtInt(votes)} ÷ ${div}`;
  };
  const quotaSeats = s.rules.seats + (fallbackAt(undefined) ? 0 : s.rules.quotaSeatOffset ?? 0);
  /** The quotient as its arithmetic: the method's divisor, or the remainder left after `quota` per seat. */
  const exactQuotient = (q: Quotient, quota: Rational) => {
    if (!q.eligible) return '';
    const floor = s.rules.quotientRounding === 'floor' ? (x: string) => `⌊ ${x} ⌋` : (x: string) => x;
    switch (s.rules.remainderMethod) {
      case 'bader-ofer': case 'dhondt': return floor(`${fmtInt(q.votes)} ÷ ${q.seats + 1}`);
      case 'sainte-lague': return `${fmtInt(q.votes)} ÷ ${2 * q.seats + 1}`;
      case 'modified-sainte-lague': return q.seats === 0 ? `${fmtInt(q.votes)} ÷ 1.4` : `${fmtInt(q.votes)} ÷ ${2 * q.seats + 1}`;
      default: return `${fmtInt(q.votes)} − ${num(quota, 3)} × ${q.seats}`;
    }
  };
  /** Why a list or pair cannot take this seat, in a few words. */
  const outReason = (q: Quotient): ReactNode => {
    if (q.capped) {
      const counts = unitMembers(q.unitId).map((m) => { const l = listOf(m); return !l || l.rosterUnavailable || l.rosterTruncated ? undefined : l.candidates.filter((c) => !c.notSeated).length; });
      const capacity = counts.every((c) => c !== undefined) ? counts.reduce<number>((a, c) => a + c!, 0) : undefined;
      if (s.rules.seatsCappedAtCandidates && capacity !== undefined && q.seats >= capacity) return <>{L('no more candidates', 'אין עוד מועמדים')} <Info title={L('Candidate cap (1977)', 'מגבלת המועמדים (1977)')}>{L('A list gets no more seats than it has candidates. The Knesset’s 1 November 1977 appeal determination documents this initial cap and the distribution of six surplus seats under section 81(d).', 'רשימה אינה מקבלת יותר מנדטים ממספר מועמדיה. הכרעת הכנסת בערעור מיום 1 בנובמבר 1977 מתעדת הגבלה זו בחלוקה הראשונה ואת חלוקת ששת המנדטים העודפים לפי סעיף 81(ד).')}</Info></>;
      return <>{L('half-seats cap', 'מגבלת מחצית המנדטים')} <Info term="cap" /></>;
    }
    if (q.value.num < 0n) return s.rules.largestRemainderRepeat === false ? L('already won one', 'כבר זכתה באחד') : L('won one this round', 'זכתה באחד בסבב זה');
    if (s.rules.remainderRequiresInitialSeat && q.seats === 0) return L('no whole-quota seat', 'אין מנדט במודד שלם');
    return '—';
  };

  const pair = r.agreements.some((a) => a.active);
  const ruleSentence = () => {
    const who = pair ? L('Each list or pair', 'כל רשימה או צמד') : L('Each list', 'כל רשימה');
    const formula = ({
      'bader-ofer': [`votes ÷ (seats so far + 1)`, 'קולות ÷ (מנדטים עד כה + 1)'],
      dhondt: [`votes ÷ (seats so far + 1)`, 'קולות ÷ (מנדטים עד כה + 1)'],
      'sainte-lague': ['votes ÷ (2 × seats so far + 1)', 'קולות ÷ (2 × מנדטים עד כה + 1)'],
      'modified-sainte-lague': ['votes ÷ 1.4 for a first seat, then ÷ (2 × seats + 1)', 'קולות ÷ 1.4 למושב ראשון, ואחר כך ÷ (2 × מנדטים + 1)'],
      'largest-remainder': ['the votes left after its whole quotas', 'הקולות שנותרו אחרי המודדים השלמים'],
      droop: ['the votes left after its whole Droop quotas', 'הקולות שנותרו אחרי מודדי דרופ השלמים'],
    } as const)[s.rules.remainderMethod];
    const parts = [`${who}: ${L(formula[0], formula[1])}.`, lr ? L('The largest wins.', 'הגדולה זוכה.') : L('The highest wins.', 'הגבוה זוכה.')];
    if (s.rules.remainderRequiresInitialSeat && !divisor) parts.push(L('Only lists with a whole-quota seat compete.', 'מתמודדות רק רשימות עם מנדט במודד שלם.'));
    if (s.rules.quotientRounding === 'floor' && !lr) parts.push(L('Fractions are dropped.', 'השברים נמחקים.'));
    if (lr && s.rules.largestRemainderRepeat === false) parts.push(L('No list wins two.', 'אף רשימה אינה זוכה בשניים.'));
    return parts.join(' ');
  };

  // ---------- the active reference (official result or the loaded saved scenario), for marking what changed
  const refList = (id: string) => br.lists.find((l) => l.id === id);
  const refUnitKey = (ids: string[]) => [...ids].sort().join('|');
  const refRemainder = (seatNumber: number) => br.remainderSteps.find((x) => br.initialSeatsTotal + x.step === seatNumber);

  // ---------- seat tray: the chamber filling seat by seat, numbered left to right
  type Cell = { colours: string[]; ids: string[] };
  const listCell = (id: string): Cell => ({ colours: [listOf(id)?.color ?? 'var(--muted)'], ids: [id] });
  const initialCells: Cell[] = r.lists.filter((l) => l.initialSeats > 0).sort((a, b) => Number(b.votes - a.votes)).flatMap((l) => Array.from({ length: l.initialSeats }, () => listCell(l.id)));
  const awarded = (upto: number): Cell[] => r.remainderSteps.slice(0, upto).map((x) => ({ colours: colours(x.winnerUnitId), ids: unitMembers(x.winnerUnitId) }));
  const finalCells: Cell[] = r.lists.filter((l) => l.seats > 0).sort((a, b) => b.seats - a.seats || Number(b.votes - a.votes)).flatMap((l) => Array.from({ length: l.seats }, () => listCell(l.id)));
  const tray = (cells: Cell[], opts: { current?: number; focus?: string[] } = {}) => (
    <div className="walk-tray" role="img" style={{ ['--seats' as string]: s.rules.seats }}
      aria-label={L(`${cells.length} of ${s.rules.seats} seats filled`, `${cells.length} מתוך ${s.rules.seats} מושבים מלאים`)}>
      {Array.from({ length: s.rules.seats }, (_, k) => {
        const c = cells[k];
        const dim = c && opts.focus && !c.ids.some((id) => opts.focus!.includes(id));
        const end = c && cells[k + 1] && cells[k + 1].ids.join() !== c.ids.join();
        return <span key={k} className={`${c ? '' : 'empty'} ${end ? 'end' : ''} ${k === opts.current ? 'cur' : ''} ${dim ? 'dim' : ''}`}
          style={c ? { background: c.colours.length > 1 ? `linear-gradient(135deg, ${c.colours[0]} 50%, ${c.colours[1]} 50%)` : c.colours[0] } : undefined} />;
      })}
    </div>
  );

  const heading = (text: ReactNode, info?: ReactNode) => <h3>{stageNo(current)}. {text} {info}</h3>;

  return (
    <div className="walk">
      <GraphicChanges s={s} r={r} />
      <div className="row walk-controls">
        <button className="btn small" onClick={() => go(Math.max(0, i - 1))} disabled={i === 0}>{L('Previous', 'הקודם')}</button>
        <button className="btn small" onClick={() => go(Math.min(steps.length - 1, i + 1))} disabled={i >= steps.length - 1}>{L('Next', 'הבא')}</button>
        <span className="muted small" aria-live="polite">{L(`Step ${i + 1} of ${steps.length}`, `צעד ${i + 1} מתוך ${steps.length}`)}</span>
      </div>
      <ol className="walk-stages" aria-label={L('Allocation stages', 'שלבי החלוקה')}>
        {stages.map((g, k) => {
          const first = steps.findIndex((st) => st.kind === g.kind);
          const count = steps.filter((st) => st.kind === g.kind).length;
          return <li key={g.kind}><button className={g.kind === current ? 'on' : ''} aria-current={g.kind === current ? 'step' : undefined} onClick={() => go(first)}>
            <span className="walk-no" aria-hidden>{k + 1}</span><span className="walk-name">{L(g.en, g.he)}{count > 1 ? <span className="muted"> ({count})</span> : null}</span>
          </button></li>;
        })}
      </ol>
      {current === 'remainder' && remainderCount > 20 && step.kind === 'remainder' && (
        <label className="walk-sub walk-slider">{L('Seat', 'מנדט')} <bdi dir="ltr"><b>{r.initialSeatsTotal + step.st.step}</b></bdi>
          <input type="range" min={1} max={remainderCount} value={step.st.step} onChange={(e) => go(firstRemainder + Number(e.target.value) - 1)} aria-label={L('Seat', 'מנדט')} />
        </label>
      )}
      {(current === 'remainder' ? remainderCount <= 20 : current === 'internal') && steps.filter((st) => st.kind === current).length > 1 && (
        <div className="walk-sub" role="group" aria-label={current === 'remainder' ? L('Remainder seats', 'מנדטים עודפים') : L('Pairs', 'צמדים')}>
          {steps.map((st, k) => st.kind === 'remainder' && current === 'remainder'
            ? <button key={k} className={`walk-seat ${k === i ? 'on' : ''}`} aria-current={k === i ? 'step' : undefined} onClick={() => go(k)}
                aria-label={L(`Seat ${r.initialSeatsTotal + st.st.step}: ${name(st.st.winnerUnitId)}`, `מנדט ${r.initialSeatsTotal + st.st.step}: ${name(st.st.winnerUnitId)}`)} title={name(st.st.winnerUnitId)}>
                <span className="walk-seat-colour" style={{ background: colours(st.st.winnerUnitId).length > 1 ? `linear-gradient(135deg, ${colours(st.st.winnerUnitId)[0]} 50%, ${colours(st.st.winnerUnitId)[1]} 50%)` : colours(st.st.winnerUnitId)[0] }} />{r.initialSeatsTotal + st.st.step}
              </button>
            : st.kind === 'internal' && current === 'internal'
              ? <button key={k} className={`btn small ${k === i ? 'primary' : ''}`} aria-current={k === i ? 'step' : undefined} onClick={() => go(k)}>{swatches(st.unitId)} {name(st.unitId)}</button>
              : null)}
        </div>
      )}

      {step.kind === 'threshold' && (() => {
        const quotaGate = Number(s.rules.thresholdPct) === 0 && s.rules.remainderRequiresInitialSeat && !divisor && r.quota.num > 0n;
        const passes = (l: AllocationResult['lists'][number]) => (quotaGate ? l.initialSeats > 0 : l.qualified);
        const rows = r.lists.filter((l) => l.votes > 0n).sort((a, b) => Number(passes(b)) - Number(passes(a)) || Number(b.votes - a.votes));
        const above = rows.filter(passes), below = rows.filter((l) => !passes(l));
        const shown = allBelow || below.length <= 6 ? below : below.slice(0, 5);
        const belowVotes = below.reduce((t, l) => t + l.votes, 0n);
        const statusChange = (l: AllocationResult['lists'][number]) => {
          const was = refList(l.id);
          if (!was || was.votes === 0n || passes(was as typeof l) === passes(l)) return null;
          return <span className="chip walk-was">{passes(l) ? L('was below', 'היתה מתחת') : L('was above', 'היתה מעל')}</span>;
        };
        const row = (l: AllocationResult['lists'][number]) => { const sl = listOf(l.id)!; return (
          <tr key={l.id} className={passes(l) ? '' : 'below'}>
            <td><ListName id={l.id} s={s} /> {statusChange(l)}{l.withdrawn ? <span className="chip">{L('withdrew', 'פרשה')}</span> : null}</td>
            <td className="n"><EditMarker s={s} path={['lists', sl.id, 'votes']} />{fmtInt(l.votes)}</td>
            <td className="n">{percent(l.votes, r.totalValid, digits, s.rules.thresholdPct, { pad: digits })}</td>
          </tr>
        ); };
        return (
          <div>
            {heading(quotaGate ? L('Which lists can win a seat?', 'אילו רשימות יכולות לזכות במנדט?') : L('Which lists pass the threshold?', 'אילו רשימות עוברות את אחוז החסימה?'), <Info term="threshold" />)}
            {Number(s.rules.thresholdPct) > 0
              ? <p><span className="formula">{s.rules.thresholdPct}% × {fmtInt(r.totalValid)} = {fmtRat(r.thresholdExact, 3)} → <span style={{ whiteSpace: 'nowrap' }}>{fmtInt(r.thresholdVotes)} <Info title={L('Threshold denominator', 'בסיס אחוז החסימה')}>{L('All valid votes count, including votes for lists that fail. The result is rounded up to whole votes.', 'כל הקולות הכשרים נספרים, גם של רשימות שלא עברו. התוצאה מעוגלת כלפי מעלה לקולות שלמים.')}</Info></span></span></p>
              : <p>{quotaGate ? L(`No percentage threshold. A list needs one whole quota (${fmtInt(r.quota.num / r.quota.den)} votes, step 2) to win a seat.`, `אין אחוז חסימה. רשימה צריכה מודד שלם אחד (${fmtInt(r.quota.num / r.quota.den)} קולות, צעד 2) כדי לזכות במנדט.`) : L('No percentage threshold applies: every list takes part.', 'אין אחוז חסימה: כל הרשימות משתתפות.')}</p>}
            <div className="tablewrap walk-narrow" tabIndex={0} role="region" aria-label={L('Lists by votes', 'רשימות לפי קולות')}>
              <table className="tbl">
                <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('Share', 'שיעור')}</th></tr></thead>
                <tbody>
                  {above.map(row)}
                  {below.length > 0 && <tr className="walk-cut"><td colSpan={3}><span>{quotaGate ? L(`▲ One quota: ${fmtInt(r.quota.num / r.quota.den)} votes ▼ no seat`, `▲ מודד אחד: ${fmtInt(r.quota.num / r.quota.den)} קולות ▼ ללא מנדט`) : L(`▲ Pass: ${fmtInt(r.thresholdVotes)} votes or more ▼ Below the threshold`, `▲ עוברות: ${fmtInt(r.thresholdVotes)} קולות ומעלה ▼ מתחת לאחוז החסימה`)}</span></td></tr>}
                  {shown.map(row)}
                  {shown.length < below.length && <tr><td colSpan={3}><button className="table-action" onClick={() => setAllBelow(true)}>{L(`Show ${below.length - shown.length} more lists below`, `הצגת עוד ${below.length - shown.length} רשימות מתחת`)}</button></td></tr>}
                </tbody>
              </table>
            </div>
            {below.length > 0 && <p className="small">{quotaGate ? (lang === 'he' ? <>{"רשימות מתחת למודד אחד: "}{fmtInt(belowVotes)}{" קולות ("}{percent(belowVotes, r.totalValid, digits)}{")"}</> : <>{"Lists below one quota: "}{fmtInt(belowVotes)}{" votes ("}{percent(belowVotes, r.totalValid, digits)}{")"}</>) : (lang === 'he' ? <>{"קולות שלא השתתפו בחלוקה: "}{fmtInt(r.unrepresentedVotes)}{" ("}{percent(r.unrepresentedVotes, r.totalValid, digits)}{")"}</> : <>{"Wasted below the threshold: "}{fmtInt(r.unrepresentedVotes)}{" votes ("}{percent(r.unrepresentedVotes, r.totalValid, digits)}{")"}</>)} {!quotaGate && <Info term="unrepresented" />}</p>}
          </div>
        );
      })()}
      {step.kind === 'quota' && (
        <div>
          {heading(L('General quota: the votes for one seat', 'המודד הכללי: מחיר מנדט אחד בקולות'), <Info term="quota" />)}
          {r.unrepresentedVotes > 0n && <p><span className="formula"><bdi>{L('qualifying votes', 'קולות משתתפים')}</bdi> = {fmtInt(r.totalValid)} − {fmtInt(r.unrepresentedVotes)} = {fmtInt(r.qualifyingVotes)}</span> <Info term="qualifying" /></p>}
          <p><span className="formula"><bdi>{L('quota', 'מודד')}</bdi> = {quotaFormula(r.qualifyingVotes, s.rules.seats)} = {r.quota.den === 1n ? fmtInt(r.quota.num) : fmtFrac(r.quota)}</span></p>
          {quotaSeats !== s.rules.seats && s.rules.remainderMethod !== 'droop' && <p className="small ink2">{L(`Divided by the seats plus one (${quotaSeats}), as the 1949 rules required.`, `מחולק במספר המושבים ועוד אחד (${quotaSeats}), כפי שקבעו כללי 1949.`)}</p>}
          {r.quota.num > 0n && <p>{L(`Every ${num(r.quota, 1)} votes win a seat in the next step.`, `כל ${num(r.quota, 1)} קולות מזכים במנדט בצעד הבא.`)}</p>}
        </div>
      )}
      {step.kind === 'initial' && (
        <div>
          {heading(L('Seats by whole quota', 'מנדטים לפי מודד שלם'), <Info term="whole-quota-seats" />)}
          {tray(initialCells)}
          <p>{L(`${r.initialSeatsTotal} seats allocated; ${s.rules.seats - r.initialSeatsTotal} remain.`, `חולקו ${r.initialSeatsTotal} מנדטים; נותרו ${s.rules.seats - r.initialSeatsTotal}.`)} <Info term="remainder-seats" /></p>
          {r.quota.num > 0n && <WalkTable s={s} rows={r.lists.filter((l) => l.qualified).sort((a, b) => Number(b.votes - a.votes))}
            heads={[L('Votes', 'קולות'), L('Votes ÷ quota', 'קולות ÷ מודד'), L('Seats', 'מנדטים')]}
            cols={(l) => [fmtInt(l.votes), fmtRat({ num: l.votes * r.quota.den, den: r.quota.num }, 3), delta(l.initialSeats, refList(l.id)?.initialSeats)]} />}
        </div>
      )}
      {step.kind === 'agreements' && (
        <div>
          {heading(L('Surplus agreements', 'הסכמי עודפים'), <Info term="surplus" />)}
          <p>{s.rules.agreementRequiresInitialSeat && !divisor
            ? L('A pair counts as one list for the remainder seats if both partners won a whole-quota seat.', 'צמד נחשב לרשימה אחת במנדטים העודפים אם שתי השותפות זכו במנדט במודד שלם.')
            : L('A pair counts as one list for the remainder seats if both partners pass the threshold.', 'צמד נחשב לרשימה אחת במנדטים העודפים אם שתי השותפות עברו את אחוז החסימה.')}</p>
          <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Surplus agreements', 'הסכמי עודפים')}>
            <table className="tbl">
              <thead><tr><th>{L('Pair', 'צמד')}</th><th className="n">{L('Votes', 'קולות')}</th>{!divisor && <th className="n">{L('Whole-quota seats', 'מנדטים במודד')}</th>}<th>{L('Effect', 'השפעה')}</th></tr></thead>
              <tbody>
                {r.agreements.map((a) => {
                  const members = a.members.map((m) => r.lists.find((l) => l.id === m)).filter((l) => !!l);
                  const failed = a.failedMembers.map((m) => listOf(m) ? listLabel(listOf(m)!, lang) : m).join(', ');
                  const why = a.active ? null : a.reason === 'member-no-initial-seat' ? L(`no effect: ${failed} won no whole-quota seat`, `ללא השפעה: ${failed} לא זכתה במנדט במודד שלם`)
                    : a.reason === 'member-withdrawn' ? L(`no effect: ${failed} withdrew`, `ללא השפעה: ${failed} פרשה`)
                    : a.reason === 'duplicate-membership' ? L('no effect: a list is in two agreements', 'ללא השפעה: רשימה בשני הסכמים')
                    : a.reason === 'too-many-members' ? L('not allowed under these rules', 'לא מותר לפי הכללים')
                    : a.reason === 'unknown-list' ? L('no effect', 'ללא השפעה')
                    : L(`no effect: ${failed} below the threshold`, `ללא השפעה: ${failed} מתחת לאחוז החסימה`);
                  const was = br.agreements.find((x) => x.id === a.id);
                  return <tr key={a.id} className={a.active ? '' : 'below'}>
                    <td><span className="walk-pair">{a.members.map((m, k) => <Fragment key={m}>{k > 0 && <span className="muted">+</span>}<ListName id={m} s={s} /></Fragment>)}</span></td>
                    <td className="n">{fmtInt(members.reduce((t, l) => t + l.votes, 0n))}</td>
                    {!divisor && <td className="n">{members.reduce((t, l) => t + l.initialSeats, 0)}</td>}
                    <td><EditMarker s={s} path={['agreements', a.id]} />{a.active ? <b>{L('compete as one', 'מתמודדות יחד')}</b> : why}{was && was.active !== a.active ? <> <span className="chip walk-was">{was.active ? L('was in effect', 'היה בתוקף') : L('had no effect', 'היה ללא השפעה')}</span></> : null}</td>
                  </tr>;
                })}
                {switchedOff.map((a) => <tr key={a.id} className="below">
                  <td><span className="walk-pair">{a.members.map((m, k) => <Fragment key={m}>{k > 0 && <span className="muted">+</span>}<ListName id={m} s={s} /></Fragment>)}</span></td>
                  <td className="n">—</td>{!divisor && <td className="n">—</td>}
                  <td><EditMarker s={s} path={['agreements', a.id]} />{L('switched off', 'בוטל')}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {step.kind === 'remainder' && (() => {
        const seatNo = r.initialSeatsTotal + step.st.step;
        const w = step.st.winnerUnitId;
        const runner = step.st.quotients.find((q) => q.eligible && q.unitId !== w);
        const win = step.st.quotients.find((q) => q.unitId === w);
        const margin = win && runner && !step.st.tie ? { num: win.value.num * runner.value.den - runner.value.num * win.value.den, den: win.value.den * runner.value.den } : null;
        const was = refRemainder(seatNo);
        const changed = was && refUnitKey(unitMembers(was.winnerUnitId, br)) !== refUnitKey(unitMembers(w));
        const wasName = was ? unitMembers(was.winnerUnitId, br).map((m) => { const l = base.lists.find((x) => x.id === m); return l ? listLabel(l, lang) : m; }).join(' + ') : '';
        return (
          <div>
            <h3>{stageNo('remainder')}. {L(`Seat ${seatNo} of ${s.rules.seats}`, `מנדט ${seatNo} מתוך ${s.rules.seats}`)} <Info term={methodOf(s.rules).term} /></h3>
            {tray([...initialCells, ...awarded(step.st.step)], { current: seatNo - 1 })}
            <p className="small ink2">{ruleSentence()}</p>
            <p className="walk-award">{L('Awarded to', 'הוענק ל')} <span className="walk-pair">{swatches(w)}<b>{name(w)}</b></span>
              {margin && margin.num > 0n && runner ? <span className="muted"> {L(`· ahead of ${name(runner.unitId)} by ${num(margin, 1)}`, `· לפני ${name(runner.unitId)} ב־${num(margin, 1)}`)}</span> : null}
              {r.units.find((u) => u.id === w)?.isAgreement ? <span className="muted"> {L(`· the pair divides it in step ${stageNo('internal')}`, `· הצמד מחלק אותו בצעד ${stageNo('internal')}`)}</span> : null}
              {changed ? <> <span className="chip walk-was">{L(`was ${wasName}`, `היה: ${wasName}`)}</span></> : null}
            </p>
            {step.st.tie && (
              <div className="callout small">
                {L('Exact tie between ', 'שוויון מדויק בין ')}{step.st.tie.tiedUnitIds.map(name).join(', ')}. {L('The law requires a lottery by the CEC.', 'החוק מחייב הגרלה של ועדת הבחירות.')} <Info term="tie-lottery" />
                {!step.st.tie.forced && <div><b>{L('Not yet decided — showing the first list.', 'טרם הוכרע — מוצגת הרשימה הראשונה.')}</b></div>}
                <div className="row" style={{ marginTop: 4 }}>
                  {L('Lottery winner:', 'זוכה בהגרלה:')} {step.st.tie.tiedUnitIds.map((u) => <button key={u} className={`btn small ${step.st.tie!.forced && step.st.tie!.chosen === u ? 'primary' : ''}`} onClick={() => dispatch({ type: 'setLottery', key: step.st.tie!.key, winner: u })}>{name(u)}</button>)}
                </div>
              </div>
            )}
            <div className="tablewrap" tabIndex={0} role="region" aria-label={L(`Seat ${seatNo}: every competitor`, `מנדט ${seatNo}: כל המתמודדים`)}>
              <table className="tbl">
                <thead><tr><th>{pair ? L('List / pair', 'רשימה / צמד') : L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('Seats so far', 'מנדטים עד כה')}</th><th className="n">{lr ? L('Remainder', 'שארית') : L('Quotient', 'מודד רשימה')} <Info term={lr ? 'largest-remainder' : 'listquota'} /></th></tr></thead>
                <tbody>
                  {step.st.quotients.filter((q) => q.votes > 0n).map((q) => (
                    <tr key={q.unitId} className={`${q.unitId === w ? 'win' : ''} ${q.eligible ? '' : 'below'}`}>
                      <td><span className="walk-pair">{swatches(q.unitId)}{q.unitId === w ? <b>{name(q.unitId)}</b> : name(q.unitId)}</span></td>
                      <td className="n">{fmtInt(q.votes)}</td><td className="n">{q.seats}</td>
                      <td className="n">{q.eligible ? <>{advanced && <span className="walk-calc mono muted" dir="ltr">{exactQuotient(q, r.quota)} =</span>}{num(q.value, 3)}</> : <span className="muted">{outReason(q)}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
      {step.kind === 'internal' && (() => {
        const d = r.internalDivisions.find((x) => x.unitId === step.unitId)!;
        const members = Object.keys(d.final);
        const wholeSeats = members.reduce((t, m) => t + (r.lists.find((l) => l.id === m)?.initialSeats ?? 0), 0);
        const stage = `internal:${d.unitId}`;
        return (
          <div>
            {heading(<>{L('Dividing the pair’s seats', 'חלוקת המנדטים בתוך הצמד')}: <span className="walk-pair">{swatches(d.unitId)}{name(d.unitId)}</span></>, <Info title={L('Dividing pair seats', 'חלוקת מנדטי הצמד')}>{L('Section 82(b): the pair’s seats are divided again from scratch by the method of section 81, as if the two lists were the whole Knesset.', 'סעיף 82(ב): מנדטי הצמד מחולקים מחדש מתחילה בשיטת סעיף 81, כאילו שתי הרשימות הן כל הכנסת.')}</Info>)}
            {tray(finalCells, { focus: members })}
            <p>{divisor ? L(`The pair won ${d.seats} seats. They are re-divided between the partners by the same method.`, `הצמד זכה ב־${d.seats} מנדטים. הם מחולקים מחדש בין השותפות באותה שיטה.`)
              : L(`The pair won ${d.seats} seats (${wholeSeats} by whole quota, ${d.seats - wholeSeats} remainder). They are re-divided between the partners by the same method.`, `הצמד זכה ב־${d.seats} מנדטים (${wholeSeats} במודד שלם, ${d.seats - wholeSeats} עודפים). הם מחולקים מחדש בין השותפות באותה שיטה.`)}</p>
            {!divisor && <p><span className="formula"><bdi>{L('pair quota', 'מודד הצמד')}</bdi> = {quotaFormula(d.totalVotes, d.seats, stage)} = {num(d.quota, 3)}</span></p>}
            <div className="tablewrap walk-narrow" tabIndex={0} role="region" aria-label={L('Partners', 'השותפות')}>
              <table className="tbl">
                <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th>{!divisor && <th className="n">{L('By pair quota', 'לפי מודד הצמד')}</th>}<th className="n">{L('Final', 'סופי')}</th></tr></thead>
                <tbody>{members.map((m) => <tr key={m}><td><ListName id={m} s={s} /></td><td className="n">{fmtInt(listOf(m)!.votes)}</td>{!divisor && <td className="n">{d.initial[m]}</td>}<td className="n"><b>{delta(d.final[m], refList(m)?.seats)}</b></td></tr>)}</tbody>
              </table>
            </div>
            {d.steps.length === 0
              ? <p className="small ink2">{L('No seat is left over inside the pair.', 'לא נותר מנדט בתוך הצמד.')}</p>
              : <div className="tablewrap walk-narrow" tabIndex={0} role="region" aria-label={L('Seats left over inside the pair', 'מנדטים שנותרו בתוך הצמד')}>
                <table className="tbl">
                  <thead><tr><th className="n">{L('Pair seat', 'מנדט בצמד')}</th>{members.map((m) => <th key={m} className="n">{name(m)}</th>)}<th>{L('Goes to', 'עובר ל')}</th></tr></thead>
                  <tbody>{d.steps.map((st) => (
                    <Fragment key={st.step}>
                      <tr>
                        <td className="n">{st.seatNumber}</td>
                        {members.map((m) => { const q = st.quotients.find((x) => x.unitId === m); return <td key={m} className={`n ${m === st.winnerUnitId ? 'walk-best' : ''}`}>{q ? (q.eligible ? <><span className="walk-calc mono muted" dir="ltr">{exactQuotient(q, d.quota)} =</span>{num(q.value, 1)}</> : <span className="muted">{outReason(q)}</span>) : ''}</td>; })}
                        <td><b>{name(st.winnerUnitId)}</b></td>
                      </tr>
                      {st.tie && <tr><td colSpan={members.length + 2}><div className="callout small">
                        {L('Exact tie inside the pair: the law requires a CEC lottery.', 'שוויון מדויק בתוך הצמד: החוק מחייב הגרלה של ועדת הבחירות.')}{' '}
                        {!st.tie.forced && <b>{L('Not yet decided — showing the first list.', 'טרם הוכרע — מוצגת הרשימה הראשונה.')}</b>}
                        <div className="row" style={{ marginTop: 4 }}>{L('Lottery winner:', 'זוכה בהגרלה:')} {st.tie.tiedUnitIds.map((u) => <button key={u} className={`btn small ${st.tie!.forced && st.tie!.chosen === u ? 'primary' : ''}`} onClick={() => dispatch({ type: 'setLottery', key: st.tie!.key, winner: u })}>{name(u)}</button>)}</div>
                      </div></td></tr>}
                    </Fragment>
                  ))}</tbody>
                </table>
              </div>}
          </div>
        );
      })()}
      {step.kind === 'final' && (
        <div>
          {heading(L('Final composition', 'ההרכב הסופי'))}
          {tray(finalCells)}
          <WalkTable s={s} rows={r.lists.filter((l) => l.seats > 0).sort((a, b) => b.seats - a.seats || Number(b.votes - a.votes))}
            heads={[L('By quota', 'במודד'), L('Remainder', 'עודפים'), L('Total', 'סה"כ')]}
            cols={(l) => [String(l.initialSeats), String(l.seats - l.initialSeats), <b key="t">{delta(l.seats, refList(l.id)?.seats)}</b>]} />
        </div>
      )}
    </div>
  );
}

/** A list's colour, its name (opens its details) and its ballot letters. */
function ListName({ id, s }: { id: string; s: Scenario }) {
  const lang = useLang();
  const L = useL();
  const sl = s.lists.find((x) => x.id === id);
  if (!sl) return <>{id}</>;
  return <span className="walk-pair"><span className="swatch" style={{ background: sl.color }} /><button className="table-action" onClick={() => setState({ selectedListId: id })}>{listLabel(sl, lang)}</button> <span className="muted" dir="rtl" title={L('Ballot letters', 'אותיות הרשימה')} aria-label={L(`Ballot letters ${sl.letters}`, `אותיות הרשימה ${sl.letters}`)}>{sl.letters}</span></span>;
}

function WalkTable({ s, rows, cols, heads }: { s: Scenario; rows: AllocationResult['lists']; cols: (l: AllocationResult['lists'][number]) => ReactNode[]; heads: string[] }) {
  const L = useL();
  return (
    <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Lists', 'רשימות')}>
      <table className="tbl">
        <thead><tr><th>{L('List', 'רשימה')}</th>{heads.map((h) => <th key={h} className="n">{h}</th>)}</tr></thead>
        <tbody>{rows.map((l) => (
          <tr key={l.id}>
            <td><ListName id={l.id} s={s} /></td>
            {cols(l).map((c, k) => <td key={k} className="n">{c}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
