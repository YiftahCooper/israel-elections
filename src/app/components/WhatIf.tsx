import { SeatDelta } from './SeatDelta.tsx';
import { freshScenario } from '../factionDefaults.ts';
import { Info } from './ui.tsx';
// One-click counterfactuals (presets and engine runs in ../whatIf.ts). A row reads question → answer:
// the seat changes as coloured chips, or, when no seat moves, what does change and why.
import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import { applyAction } from '../../model/actions.ts';
import { type Action, type Scenario } from '../../model/scenario.ts';
import { useL, useLang, type Lang } from '../i18n.ts';
import { fmtInt, signed } from '../format.ts';
import { getState, setState, useLevel } from '../store.ts';
import { computeWhatIf, type WhatIfFact, type WhatIfResult } from '../whatIf.ts';

// The cards depend only on the dataset and the language (never on the edited scenario), so their
// engine runs are kept per dataset: edits, tab switches and level changes reuse them.
const resultCache = new WeakMap<ElectionDataset, Map<string, WhatIfResult[]>>();

const arrow = (a: string, b: string) => <bdi dir="ltr">{a} → {b}</bdi>;

/** one fact as a short phrase; `full` names the parts of a joint list (the row shows numbers only) */
function Fact({ f, lang, full }: { f: WhatIfFact; lang: Lang; full?: boolean }): ReactNode {
  const he = lang === 'he';
  switch (f.kind) {
    // the bare sum reads left to right in Hebrew too; the named form is a sentence in the page's direction
    case 'joint': return <span className="wi-chip"><span className="swatch" style={{ background: f.color }} />{f.label} {full
      ? <><b>{f.seats}</b> = {f.parts.map((p, i) => <span key={i}>{i > 0 && ' + '}{p.label} {p.seats}</span>)}</>
      : <bdi dir="ltr"><b>{f.seats}</b> <span className="ink2">= {f.parts.map((p) => p.seats).join(' + ')}</span></bdi>}</span>;
    case 'band': return <span>{he ? <>אין רשימה בין <bdi dir="ltr">{f.from}%</bdi> ל-<bdi dir="ltr">{f.to}%</bdi></> : `No list between ${f.from}% and ${f.to}%`}</span>;
    case 'agreements': return <span>{f.count === 1 ? (he ? 'ההסכם לא הזיז אף מנדט' : 'The agreement moved no seat') : (he ? `${f.count} ההסכמים לא הזיזו אף מנדט` : `The ${f.count} agreements moved no seat`)}</span>;
    case 'threshold': return <span>{he ? 'אחוז החסימה' : 'Threshold'} {arrow(fmtInt(f.before), f.after === 0n ? (he ? 'אין' : 'none') : fmtInt(f.after))} {f.after !== 0n && (he ? 'קולות' : 'votes')}</span>;
    case 'quota': return <span>{he ? 'קולות למנדט' : 'Votes per seat'} {arrow(fmtInt(f.before), fmtInt(f.after))}</span>;
    case 'seatless': return <span>{he ? 'קולות ללא מנדט' : 'Votes with no seat'} {arrow(fmtInt(f.before), fmtInt(f.after))}</span>;
    // the Coalitions tool's totals line, then the confidence vote for–against
    case 'government': { const v = f.vote; return <span>{v.support ? <bdi>{v.members} {he ? 'בקואליציה' : 'members'} + {v.support} {he ? 'תמיכה מבחוץ' : 'outside support'} = <b>{v.votesFor}</b></bdi> : <bdi><b>{v.members}</b> {he ? 'בקואליציה' : 'members'}</bdi>} · {he ? 'בעד–נגד' : 'for–against'} <bdi dir="ltr">{v.votesFor}–{v.against}</bdi></span>; }
  }
}

export function WhatIf({ ds }: { ds: ElectionDataset }) {
  const L = useL();
  const { simple } = useLevel();
  const [all, setAll] = useState(false);
  const lang = useLang();
  const results = useMemo(() => {
    const cached = resultCache.get(ds)?.get(lang);
    if (cached) return cached;
    const out = computeWhatIf(ds, lang);
    const m = resultCache.get(ds) ?? new Map<string, WhatIfResult[]>(); m.set(lang, out); resultCache.set(ds, m);
    return out;
  }, [ds, lang]);

  const [open, setOpen] = useState<Set<string>>(() => new Set());
  /** loads the question as a named scenario (its assumptions as the description) and shows it on the Overview */
  const tryIt = (title: string, description: string, actions: Action[]) => {
    const st = getState();
    let s: Scenario = { ...freshScenario(ds, title), description };
    for (const a of actions) s = applyAction(s, a);
    // a coalition-role question opens where its roles are shown
    setState({ scenario: s, past: st.scenario ? [...st.past, st.scenario] : st.past, future: [], selectedListId: null, compareWith: 'historical', tool: actions.some((a) => a.type === 'setCoalition') ? 'coal' : 'board' });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  // cards that do not apply to this election are left out, and those that move seats come first;
  // Simple starts with a few, so the default view stays light
  const useful = results.filter((x) => x.actions).sort((a, b) => Number(b.changes.length > 0) - Number(a.changes.length > 0));
  const limit = simple && !all ? 4 : useful.length;
  const shown = useful.slice(0, limit);
  return (
    <div>
      <p className="ink2 small" style={{ marginTop: 0 }}>{L('Start from the real result', 'מתחילים מהתוצאה האמיתית')} <Info title={L('About these questions', 'על השאלות האלה')}>
        {L('Each question starts from the real result and changes one thing; seat changes are exact. Its (i) lists the assumptions. Data: this election’s votes, agreements and rules, see ', 'כל שאלה מתחילה מהתוצאה האמיתית ומשנה דבר אחד; שינויי המנדטים מדויקים. ה-(i) שלה מפרט את ההנחות. הנתונים: הקולות, ההסכמים והכללים של הבחירות האלה, ראו ')}
        <button type="button" className="table-action wi-src" onClick={() => setState({ tool: 'sources' })}>{L('Sources', 'מקורות')}</button>.
        {L(' “Open as a scenario” loads it so you can explore further (Undo returns you).', ' "פתיחה כתרחיש" טוענת אותה להמשך חקירה (ביטול מחזיר אתכם).')}
      </Info></p>
      <ol className="wi-rows">
        {shown.map(({ p, actions, title, body, votes, changes, facts }) => {
          const max = Math.max(1, ...changes.map((c) => Math.abs(c.after - c.before)));
          // the row already shows the first fact when no seat moves; details hold only what it does not show
          const more = changes.length ? facts : facts.slice(1);
          const expandable = !!actions && (changes.length > 0 || more.length > 0);
          const isOpen = expandable && open.has(p.id);
          const Chevron = isOpen ? ChevronUp : ChevronDown;
          const answer = changes.length ? changes.map((c) => `${c.label} ${signed(c.after - c.before)}`).join(', ') : L('No seat changes', 'אין שינוי במנדטים');
          return (
            <li key={p.id} className={`wi-row ${isOpen ? 'open' : ''}`}>
              {/* the (i) follows the title inline, on its last line; the vote subtitle sits below both */}
              <div className="wi-question"><div className="wi-title"><button type="button" className="wi-q" aria-expanded={expandable ? isOpen : undefined} disabled={!expandable} onClick={() => setOpen(current => { const next = new Set(current); if (next.has(p.id)) next.delete(p.id); else next.add(p.id); return next; })}>
                {/* the chevron stays on the title's last word, never alone on a line */}
                <b>{title.slice(0, title.lastIndexOf(' ') + 1)}<span className="nowrap">{title.slice(title.lastIndexOf(' ') + 1)}{expandable && <> <Chevron className="icon sm wi-chev" aria-hidden /></>}</span></b>
              </button><Info title={L(`Assumptions: ${title}`, `הנחות: ${title}`)}>{body}</Info></div>
                {(p.experimental || votes) && <span className="wi-sub small ink2">{p.experimental && <span>{L('Experimental', 'ניסיוני')}{votes && ' · '}</span>}{votes && <b>{votes}</b>}</span>}
              </div>
              {/* the answer at a glance: each list that moves, in its colour, with its seat change; otherwise what does change */}
              <div className="wi-a small" aria-label={answer}>{changes.length ? changes.map((c) => (
                <span key={c.label} className="wi-chip"><span className="swatch" style={{ background: c.color }} />{c.label} <b dir="ltr"><SeatDelta value={c.after - c.before} /></b></span>
              )) : <><span className="muted">{L('No seat changes', 'אין שינוי במנדטים')}</span>{facts[0] && <Fact f={facts[0]} lang={lang} />}</>}</div>
              <button className="btn small" disabled={!actions} onClick={() => actions && tryIt(title, body, actions)}>{L('Open as a scenario', 'פתיחה כתרחיש')}</button>
              {isOpen && changes.length > 0 && (
                <div className="wi-preview">
                  <ul className="cmp-diff">
                    {changes.map((c) => { const d = c.after - c.before; return (
                      <li key={c.label}>
                        <span className="cmp-label"><span className="swatch" style={{ background: c.color }} /> {c.label} <bdi className="muted" dir="ltr">{c.before} → {c.after}</bdi></span>
                        <span className="cmp-neg">{d < 0 && <i style={{ width: `${(-d / max) * 100}%`, background: 'var(--ink)' }} />}</span>
                        <span className="cmp-axis" aria-hidden />
                        <span className="cmp-pos">{d > 0 && <i style={{ width: `${(d / max) * 100}%`, background: 'var(--ink)' }} />}</span>
                        <b className="cmp-d" dir="ltr"><SeatDelta value={d} /></b>
                      </li>
                    ); })}
                  </ul>
                </div>
              )}
              {isOpen && more.length > 0 && <ul className="wi-facts small">{more.map((f, i) => <li key={i}><Fact f={f} lang={lang} full /></li>)}</ul>}
            </li>
          );
        })}
      </ol>
      {useful.length > limit && <button className="btn small" style={{ marginTop: 10 }} onClick={() => setAll(true)}>{L(`More questions (${useful.length - limit})`, `שאלות נוספות (${useful.length - limit})`)}</button>}
    </div>
  );
}
