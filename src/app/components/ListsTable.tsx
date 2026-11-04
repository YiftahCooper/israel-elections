// The lists as a board: one ruled row per list with its numbers, ordered by seats; the threshold is a hatched
// rule inside the table. A row opens in place (its header reversed onto the shell plate) to edit the list.
// Columns follow the level and the session: change and trend appear only once something has changed.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { dispatch, setState, useDigits, useLevel, useStore } from '../store.ts';
import { ListDetail } from './ListDetail.tsx';
import { Slip } from './ui.tsx';

/** A list's seats across the last steps of the session (ending with now), for the trend line. */
function useSeatHistory(s: Scenario, r: AllocationResult) {
  const past = useStore((st) => st.past);
  return useMemo(() => {
    const steps = [...past.slice(-11).filter((p) => p.electionId === s.electionId), s];
    const rs = steps.map((p, i) => (i === steps.length - 1 ? r : allocationOf(p)));
    return (id: string, origin: string[]) => rs.map((x, i) => {
      const own = x.lists.find((y) => y.id === id);
      if (own) return own.seats;
      // before a merge or split the list did not exist: count the lists it came from
      return origin.reduce((t, o) => t + (rs[i].lists.find((y) => y.id === o)?.seats ?? 0), 0);
    });
  }, [past, s, r]);
}

/** A drawn up/down mark in neutral ink (change is never coloured by camp). */
const Mark = ({ up }: { up: boolean }) => <svg className="mark" viewBox="0 0 10 10" width={8} height={8} aria-hidden><path d={up ? 'M5 1 9.5 9H.5z' : 'M5 9 .5 1h9z'} fill="currentColor" /></svg>;

function Spark({ seq }: { seq: number[] }) {
  if (seq.length < 2 || seq.every((v) => v === seq[0])) return null;
  const w = 64, h = 18, lo = Math.min(...seq) - 0.5, hi = Math.max(...seq) + 0.5;
  const y = (v: number) => h - ((v - lo) / (hi - lo)) * h;
  const pts = seq.map((v, i) => `${((i * w) / (seq.length - 1)).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return <svg className="spark" width={w} height={h} aria-hidden><line className="base" x1={0} x2={w} y1={y(seq[0])} y2={y(seq[0])} /><polyline className="line" points={pts} /></svg>;
}

/** The agreement partner in its cell; one click edits it in place (partner and on/off). */
function AgreementCell({ s, l }: { s: Scenario; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const [edit, setEdit] = useState(false);
  const agr = s.agreements.find((a) => a.members.includes(l.id));
  const partner = agr ? s.lists.find((x) => x.id === agr.members.find((m) => m !== l.id)) : undefined;
  const inOther = new Set(s.agreements.filter((a) => a.enabled && !a.members.includes(l.id)).flatMap((a) => a.members));
  const partners = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && !inOther.has(x.id)).sort((a, b) => b.votes - a.votes);
  if (edit) return (
    <div className="agr-edit" onClick={(e) => e.stopPropagation()}>
      <select autoFocus aria-label={L(`Agreement partner of ${listLabel(l, 'en')}`, `שותפה להסכם של ${l.shortHe}`)} value={partner?.id ?? ''}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) { if (agr) dispatch({ type: 'removeAgreement', id: agr.id }); }
          else dispatch({ type: 'setAgreement', agreement: { id: agr?.id ?? `sim-agr-${Date.now().toString(36)}`, members: [l.id, id], enabled: agr?.enabled ?? true } });
        }}
        onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setEdit(false); }}
        onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setEdit(false); }}>
        <option value="">{L('No agreement', 'אין הסכם')}</option>
        {partners.map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
      </select>
      {agr && <label className="switch" title={agr.enabled ? L('In force', 'בתוקף') : L('Off', 'כבוי')}>
        <input type="checkbox" checked={agr.enabled} aria-label={L('Agreement in force', 'ההסכם בתוקף')}
          onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...agr, enabled: e.target.checked } })}
          onBlur={(e) => { if (!e.currentTarget.closest('.agr-edit')?.contains(e.relatedTarget as Node)) setEdit(false); }} /></label>}
    </div>
  );
  return (
    <button type="button" className={`partner ${agr && !agr.enabled ? 'off' : ''}`} onClick={(e) => { e.stopPropagation(); setEdit(true); }}
      aria-label={partner ? L(`Surplus-vote agreement with ${listLabel(partner, 'en')}${agr && !agr.enabled ? ' (off)' : ''}`, `הסכם עודפים עם ${partner.shortHe}${agr && !agr.enabled ? ' (כבוי)' : ''}`) : L(`Add a surplus-vote agreement for ${listLabel(l, 'en')}`, `הוספת הסכם עודפים ל${l.shortHe}`)}
      title={agr ? (agr.enabled ? L('Surplus-vote agreement — click to change', 'הסכם עודפים — לחצו לשינוי') : L('Agreement switched off — click to change', 'ההסכם כבוי — לחצו לשינוי')) : L('Add a surplus-vote agreement', 'הוספת הסכם עודפים')}>
      {partner ? <><ArrowLeftRight className="icon sm" aria-hidden /><span title={partner.nameHe}>{listLabel(partner, lang)}</span></> : <span className="muted">—</span>}
    </button>
  );
}

export function ListsTable({ s, r, ds, base, baseR }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const { standard, expert } = useLevel();
  const selected = useStore((st) => st.selectedListId);
  const [showAll, setShowAll] = useState(false);
  const history = useSeatHistory(s, r);
  const edited = s.log.length > 0;
  const thr = Number(r.thresholdVotes);
  const total = Number(r.totalValid);
  const rowRef = useRef<HTMLTableRowElement>(null);

  // a list selected elsewhere (chamber, blocs, figures) is brought into view here
  useEffect(() => { if (selected) rowRef.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, [selected]);

  const baseSeats = (l: SimList) => base.lists.some((b) => b.id === l.id)
    ? baseR.lists.find((x) => x.id === l.id)?.seats ?? 0
    : l.originIds.reduce((t, o) => t + (baseR.lists.find((x) => x.id === o)?.seats ?? 0), 0);
  const rows = s.lists.map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)! }));
  const inKnesset = rows.filter((x) => x.lr.seats > 0 || x.lr.qualified).sort((a, b) => b.lr.seats - a.lr.seats || b.l.votes - a.l.votes);
  const outside = rows.filter((x) => !(x.lr.seats > 0 || x.lr.qualified)).sort((a, b) => b.l.votes - a.l.votes);
  // below the threshold: lists with at least half a percent, the selected one and any the user made, unless all are shown
  const visibleOut = showAll ? outside : outside.filter(({ l }) => l.votes >= total * 0.005 || l.id === selected || !base.lists.some((b) => b.id === l.id));
  const hidden = outside.length - visibleOut.length;
  const split = new Set(s.factionSplits ?? []);
  const cols = 4 + (standard ? 2 : 0) + (edited ? 1 : 0) + (expert && edited ? 1 : 0);

  const row = ({ l, lr }: (typeof rows)[number]) => {
    const open = selected === l.id;
    const d = lr.seats - baseSeats(l);
    const parties = l.parties ?? [];
    const sub = parties.length > 1 ? parties.map((p) => (lang === 'he' ? p.nameHe : p.nameEn)).join(' · ') : null;
    const toggle = () => setState({ selectedListId: open ? null : l.id });
    const elected = split.has(l.id) ? electedOf(l, lr.seats) : [];
    return [
      <tr key={l.id} ref={open ? rowRef : undefined} className={`list ${open ? 'open' : ''} ${selected && !open ? 'dim' : ''} ${lr.seats === 0 && !lr.qualified ? 'out' : ''}`} onClick={toggle}>
        <td className="logo" title={l.logo ? undefined : L('Ballot letters (no logo is sourced for this election yet)', 'אותיות הפתק (טרם נמצא סמל ממקור לבחירות אלה)')}><Slip letters={l.letters} color={l.color} logo={l.logo} /></td>
        <td className="name">
          <button type="button" aria-expanded={open} onClick={(e) => { e.stopPropagation(); toggle(); }} title={l.nameHe}>{listLabel(l, lang)}</button>
          {sub && standard && <span className="sub">{sub}</span>}
          {l.withdrawn && <span className="sub">{L('withdrew', 'פרשה')}</span>}
        </td>
        {standard && <td className="n hide-sm">{fmtInt(l.votes)}</td>}
        <td className="n">{fmtPct(l.votes, total, digits)}</td>
        {/* re-keyed on change, so a seat count that moves flashes once */}
        <td key={`s${lr.seats}`} className={`seats ${edited ? 'tick' : ''}`}>{lr.seats}</td>
        {edited && <td key={`d${d}`} className={`chg ${d === 0 ? 'none' : 'tick'}`} dir="ltr">{d !== 0 ? <><Mark up={d > 0} />{Math.abs(d)}<span className="sr-only">{d > 0 ? L(' more', ' יותר') : L(' fewer', ' פחות')}{L(' than the official result', ' מהתוצאה הרשמית')}</span></> : '·'}</td>}
        {expert && edited && <td className="hide-sm"><Spark seq={history(l.id, l.originIds)} /></td>}
        {standard && <td className="agr hide-sm"><AgreementCell s={s} l={l} /></td>}
      </tr>,
      ...(split.has(l.id) ? parties.map((p) => (
        <tr key={`${l.id}:${p.id}`} className={`list ${selected && !open ? 'dim' : ''}`} onClick={toggle}>
          <td className="logo" style={{ paddingInlineStart: 18 }}>{p.logo ? <Slip letters={l.letters} color={p.color ?? l.color} logo={p.logo} /> : <span className="swatch" style={{ background: p.color ?? l.color }} />}</td>
          <td className="name"><span className="sub" style={{ color: 'var(--ink)' }}>{lang === 'he' ? p.nameHe : p.nameEn}</span></td>
          {standard && <td className="hide-sm" />}
          <td />
          <td className="seats" style={{ fontWeight: 600, fontSize: 14 }}>{elected.filter((c) => c.partyId === p.id).length}</td>
          {edited && <td />}{expert && edited && <td className="hide-sm" />}{standard && <td className="hide-sm" />}
        </tr>
      )) : []),
      ...(open ? [<tr key={`${l.id}-detail`} className="detail"><td colSpan={cols}><ListDetail s={s} r={r} ds={ds} base={base} baseR={baseR} l={l} /></td></tr>] : []),
    ];
  };

  return (
    <section className="panel lists" aria-label={L('Lists', 'הרשימות')}>
      <div className="lists-scroll">
        <table className="lt">
          <thead><tr>
            <th colSpan={2}>{L('List', 'רשימה')}</th>
            {standard && <th className="n hide-sm">{L('Votes', 'קולות')}</th>}
            <th className="n">{L('% valid', '% כשרים')}</th>
            <th style={{ textAlign: 'center' }}>{L('Seats', 'מנדטים')}</th>
            {edited && <th style={{ textAlign: 'center' }} title={L('Against the official result', 'לעומת התוצאה הרשמית')}>{L('Change', 'שינוי')}</th>}
            {expert && edited && <th className="hide-sm">{L('This session', 'בתרחיש')}</th>}
            {standard && <th className="hide-sm">{L('Surplus agreement', 'הסכם עודפים')}</th>}
          </tr></thead>
          <tbody>
            {inKnesset.flatMap(row)}
            {outside.length > 0 && (
              <tr className="thr"><td colSpan={cols}>
                {thr > 0 ? L(`Threshold · ${fmtInt(r.thresholdVotes)} votes (${s.rules.thresholdPct}%)`, `אחוז החסימה · ${fmtInt(r.thresholdVotes)} קולות (${s.rules.thresholdPct}%)`) : L('Lists that won no seat', 'רשימות שלא זכו במנדט')}
                {(hidden > 0 || showAll) && <button type="button" onClick={() => setShowAll((x) => !x)}>{showAll ? L('Show fewer lists', 'הצגת פחות רשימות') : L(`Show all ${outside.length}`, `הצגת כל ${outside.length}`)}</button>}
              </td></tr>
            )}
            {visibleOut.flatMap(row)}
            {hidden > 0 && !showAll && <tr><td colSpan={cols} className="small muted" style={{ paddingInline: 10 }}>{L(`${hidden} smaller lists not shown`, `${hidden} רשימות קטנות אינן מוצגות`)}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
