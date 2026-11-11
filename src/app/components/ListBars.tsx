import { percent } from './Percentage.tsx';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { SeatDelta } from './SeatDelta.tsx';
import { seatOrder } from './Hemicycle.tsx';
import {familyLabel} from '../../families/labels.ts';
import { FamilyListTreatment } from './FamilyTreatment.tsx';
import { resolve } from '../../families/model.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { referenceLabel } from '../derive.ts';
import { allocationOf } from '../derive.ts';
import { PartEdits } from './PartEdits.tsx';
import { LazyRowComparison } from './PartyHistoryLazy.tsx';
import { useRefRows } from '../compare/useRefRows.ts';
import { RefLegend, RefLine, RefOnly, refLineText } from '../compare/RefLine.tsx';
import { yearOf } from '../compare/mode.ts';
// The lists as a visual column: each list is a row with its logo, name and a seat bar (its official seats shown
// as a faint outline when they differ). Lists that won no seat show how far they are from the threshold instead.
// Choosing a row opens the list in the side panel.
import { useEffect, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { comparisonGroups, officialSeatsFor, electedOf, listLabel, resultChanges } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { setState, useDigits, useLevel, useSetting, useStore } from '../store.ts';
import { blocDisplayOrder } from '../blocOrder.ts';
import { partyListed } from '../seatlessParties.ts';
import { DisclosureToggle, Slip } from './ui.tsx';



export function ListBars({ s, r, base, baseR }: { s: Scenario; r: AllocationResult; base: Scenario; baseR: AllocationResult }) {
  const { reference } = useActiveReference();
  if (reference) { base = reference; baseR = allocationOf(reference); }
  const L = useL();
  const lang = useLang();
  const baseLabel = referenceLabel(reference, lang);
  const digits = useDigits();
  const { standard } = useLevel();
  const lastTime = useSetting('lastTimeRows') && standard;
  const voteCounts = useSetting('voteCounts'), seatlessLists = useSetting('seatlessLists'), withdrawnLists = useSetting('withdrawnLists');
  const listOrder = useSetting('listOrder'), dimOthers = useSetting('dimUnselected');
  const jointListParties = useSetting('jointListParties');
  // while comparing (compare/mode.ts): every list's line in the reference, and its striped bar unless Settings turns it off
  const cmp = useRefRows(s);
  const refBars = useSetting('compareBars') && !!cmp;
  const elections = useStore((st) => st.elections);
  const committed = useStore(st => st.scenario);
  const previewing = useStore(st => st.preview) === s;
  const markerScenario = previewing && committed ? committed : s;
  const selected = useStore((st) => st.selectedListId);
  const [showAll, setShowAll] = useState(false);
  const selRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { const row = selRef.current, panel = row?.closest('.lbars');
    if (selected && row && panel && panel.scrollHeight > panel.clientHeight) {
      const r = row.getBoundingClientRect(), p = panel.getBoundingClientRect();
      if (r.top < p.top) panel.scrollTop += r.top - p.top;
      else if (r.bottom > p.bottom) panel.scrollTop += r.bottom - p.bottom;
    } }, [selected]);

  const previousSeats = useRef({ election: s.electionId, seats: new Map(r.lists.map(x => [x.id, x.seats])) });
  useEffect(() => { if (previewing) return; previousSeats.current = { election: s.electionId, seats: new Map(r.lists.map(x => [x.id, x.seats])) }; }, [s.electionId, r, previewing]);
  const total = Number(r.totalValid);
  const thr = Number(r.thresholdVotes);
  const groups = comparisonGroups(s, r, base, baseR).filter(g => g.bIds.length > 1);
  const baseSeats = (l: SimList) => officialSeatsFor(l.id, s, r, base, baseR);
  const rows = s.lists.map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)!, was: baseSeats(l) }));
  // a list is in the Knesset when it holds a seat; one that passed no threshold (1949 had none) but won no seat
  // sits with the other seatless lists rather than among the members
  // Settings → Order lists by: one comparator for both sections (seats, then votes, keep ties stable)
  const blocRank = blocDisplayOrder(s);
  const byOrder = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
    listOrder === 'votes' ? b.l.votes - a.l.votes || b.lr.seats - a.lr.seats
    : listOrder === 'name' ? listLabel(a.l, lang).localeCompare(listLabel(b.l, lang), lang)
    : listOrder === 'bloc' ? ((x, y) => (x < 0 ? 1e3 : x) - (y < 0 ? 1e3 : y))(blocRank.indexOf(a.l.bloc), blocRank.indexOf(b.l.bloc)) || b.lr.seats - a.lr.seats || b.l.votes - a.l.votes
    : b.lr.seats - a.lr.seats || b.l.votes - a.l.votes;
  const inKnesset = rows.filter((x) => x.lr.seats > 0).sort(byOrder);
  const outside = rows.filter((x) => x.lr.seats === 0).sort(byOrder);
  // A list never folds away behind "Show all" because of an edit: one shown in the reference stays shown when its
  // votes fall (a withdrawal drops them to 0), and one edited beyond its votes (withdrawn, renamed) is shown too.
  // Small vote changes spread proportionally over every list do not unfold the long tail.
  const editedBeyondVotes = new Set(resultChanges(markerScenario, base).filter((p) => p[0] === 'lists' && p[2] !== 'votes').map((p) => p[1]));
  const baseTotal = base.lists.reduce((t, b) => t + b.votes, 0);
  // Settings → Lists with no seats (Over 0.5% / All / Folded) and Lists that withdrew. A list you selected or edited
  // is always shown, and "Show all" still opens the rest.
  const visibleOut = showAll ? outside : outside.filter(({ l }) => {
    const b = base.lists.find((x) => x.id === l.id);
    if (l.id === selected || editedBeyondVotes.has(l.id) || !b) return true;
    if (l.withdrawn && !withdrawnLists) return false;
    return seatlessLists === 'all' || seatlessLists === 'over' && (l.votes >= total * 0.005 || b.votes >= baseTotal * 0.005);
  });
  const belowThreshold = thr > 0 && outside.every((x) => !x.lr.qualified);
  const anyAgreement = standard && s.agreements.some((a) => a.enabled);
  const hidden = outside.length - visibleOut.length;
  const showComponents = useSetting('partyColourInSeats');
  const componentSeats = seatOrder(s,r,'list',showComponents);
  const barFill = (l: SimList) => {
    const seats = componentSeats.filter(st=>st.listId===l.id);
    return seats.some(st=>st.innerColor) ? `linear-gradient(90deg, ${seats.map((st,i)=>`${st.innerColor ?? st.color} ${i/seats.length*100}% ${(i+1)/seats.length*100}%`).join(', ')})` : l.color;
  };
  const splitIds = new Set(s.factionSplits ?? []);
  // one scale for every bar: the largest list now or in the official result
  const scale = Math.max(1, ...rows.map((x) => Math.max(x.lr.seats, x.was ?? 0)), refBars ? cmp!.rows.maxSeats : 0);

  const viewedFamily = useStore(st=>st.familyView);
  const familyDefinition = viewedFamily ?? s.familyDefinition;
  const familyRows = familyDefinition ? resolve(familyDefinition, s) : [];
  const row = ({ l, lr, was }: (typeof rows)[number]) => {
    const family = familyRows.find(x => x.id === l.id)?.family;
    const open = selected === l.id;
    const d = was === null ? 0 : lr.seats - was;
    const agr = standard ? s.agreements.find((a) => a.members.includes(l.id) && a.enabled) : undefined;
    const partner = agr ? s.lists.find((x) => x.id === agr.members.find((m) => m !== l.id)) : undefined;
    const out = !lr.qualified;
    const line = cmp?.rows.byList.get(l.id);
    return (
      <li key={l.id} data-family={family}>
        <button type="button" data-family={familyRows.find(x => x.id === l.id)?.family} ref={open ? selRef : undefined} className={`lb-row ${out ? 'out' : ''} ${dimOthers && selected && !open ? 'dim' : ''}`} aria-pressed={open}
          aria-label={listLabel(l, lang)} aria-describedby={`lbd-${l.id}`}
          onClick={() => setState({ selectedListId: open ? null : l.id })}
          title={l.logo || l.synthetic ? listLabel(l, lang) : `${listLabel(l, lang)} — ${L('Ballot letters (no verified election logo)', 'אותיות הפתק (טרם נמצא סמל ממקור לבחירות אלה)')}`}>
          <Slip name={listLabel(l, lang)} letters={l.letters} color={l.color} logo={l.logo} synthetic={l.synthetic} />
          <span className="lb-main">
            <span className="lb-name">{listLabel(l, lang)}<PartEdits single s={s} prefix={['lists', l.id]} /></span>
            {familyDefinition && family && family!=='other' && <small className="family-row-label">{familyLabel(familyDefinition,lang)}{family==='mixed'?` · ${L('Mixed lists','רשימות מעורבות')}`:''}</small>}
            <span className="lb-bar" aria-hidden>
              {out
                ? <><i className="thr-fill" style={{ width: `${Math.min(100, (l.votes / Math.max(1, thr)) * 100)}%`, background: l.color }} /><span className="thr-tick" /></>
                : <><i style={{ width: `${(lr.seats / scale) * 100}%`, background: barFill(l), borderBlock: (s.factionSplits ?? []).includes(l.id) && showComponents ? `2px solid ${l.color}` : undefined, boxSizing: 'border-box' }} />{d !== 0 && <span className="delta-segment" style={{ insetInlineStart: `${(Math.min(lr.seats, was ?? 0) / scale) * 100}%`, width: `${(Math.abs(d) / scale) * 100}%` }} />}{d !== 0 && <span className="was" style={{ width: `${((was ?? 0) / scale) * 100}%` }} />}</>}
            </span>
            {out && (was ?? 0) > 0 && <span className="lb-bar" aria-hidden title={baseLabel.seats}>
              <span className="was" style={{width:`${(was ?? 0)/scale*100}%`}} />
              <span className="delta-segment" style={{insetInlineStart:0,width:`${(was ?? 0)/scale*100}%`}} />
            </span>}
            {refBars && line?.bar && <span className="lb-bar cmpm-refbar" aria-hidden title={`${cmp!.label}: ${line.seats}`}><i style={{ width: `${(line.seats / scale) * 100}%` }} /></span>}
            <span className="lb-sub">
              <span>{voteCounts && <>{fmtInt(l.votes)} · </>}{percent(l.votes, total, digits, s.rules.thresholdPct)}
              {out && thr > 0 && !l.withdrawn && <> · {(lang === 'he' ? <>{percent(l.votes, thr, 0)}{" מאחוז החסימה"}</> : <>{percent(l.votes, thr, 0)}{" of the threshold"}</>)}</>}
              {l.withdrawn && <> · {L('withdrew', 'פרשה')}</>}</span>
              {partner && <span className="lb-agr"><span aria-hidden>⇄ </span>{listLabel(partner, lang)}</span>}
              {cmp ? line && <RefLine line={line} label={cmp.label} r={r} /> : lastTime && lr.seats > 0 && <LazyRowComparison s={s} r={r} listId={l.id} currentName={listLabel(l, lang)} />}
            </span>
          </span>
          <span className="sr-only" id={`lbd-${l.id}`}>{L(`${lr.seats} seats`, `${lr.seats} מנדטים`)}, {fmtPct(l.votes, total, digits, s.rules.thresholdPct)}{familyDefinition && family && family!=='other' && <> · {familyLabel(familyDefinition,lang)}{family==='mixed'?` · ${L('Mixed lists','רשימות מעורבות')}`:''}</>}{d !== 0 && <>, {Math.abs(d)}{d > 0 ? baseLabel.more : baseLabel.fewer}</>}{l.withdrawn && <>, {L('withdrew', 'פרשה')}</>}{partner && <>, {L(`surplus-vote agreement with ${listLabel(partner, lang)}`, `הסכם עודפים עם ${listLabel(partner, lang)}`)}</>}{cmp ? line && refLineText(line, cmp.label, r, lang) : lastTime && lr.seats > 0 && <LazyRowComparison sr s={s} r={r} listId={l.id} currentName={listLabel(l, lang)} />}</span>
          <span className="lb-seats">
            <b key={`s${lr.seats}`} className={previousSeats.current.election === s.electionId && previousSeats.current.seats.has(l.id) && previousSeats.current.seats.get(l.id) !== lr.seats ? 'tick' : ''}>{lr.seats}</b>
            {d !== 0 && <small dir="ltr"><SeatDelta value={d} /></small>}
          </span>
        </button>
        {splitIds.has(l.id) && (l.parties?.length ?? 0) > 1 && l.parties!.some(p => partyListed(jointListParties, s, p.id, electedOf(l, lr.seats).filter((c) => c.partyId === p.id).length, lr.seats)) && (
          <ul className="lb-parties" aria-label={L(`${listLabel(l, lang)}: factions after the split`, `${listLabel(l, lang)}: הסיעות אחרי הפיצול`)}>
            {l.parties!.map((p) => {
              const n = electedOf(l, lr.seats).filter((c) => c.partyId === p.id).length;
              // Settings → Parties under joint lists (seatlessParties.ts): one rule with the bloc panel
              if (!partyListed(jointListParties, s, p.id, n, lr.seats)) return null;
              return (
                <li key={p.id}>
                  <Slip letters="" name={lang === 'he' ? p.nameHe : p.nameEn} color={partyDisplayColor(l, p.id)} logo={p.logo} />
                  <span className="lb-pname">{lang === 'he' ? p.nameHe : p.nameEn}</span>
                  <span className="lb-bar" aria-hidden><i style={{ width: `${(n / scale) * 100}%`, background: partyDisplayColor(l, p.id) }} /></span>
                  <b>{n}</b>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <section className="panel lbars" aria-label={L('Lists', 'הרשימות')}>
      <FamilyListTreatment s={s} />
      <header><h2>{L('Lists', 'הרשימות')}<PartEdits s={s} prefix={['parts','lists']} /></h2>
        {/* the partner mark is explained once, not on every row */}
        {anyAgreement && <span className="tiny muted lb-key" aria-hidden>⇄ {L('surplus-vote partner', 'שותפה להסכם עודפים')}</span>}
        <span className="spacer" /><span className="small muted">{L('seats', 'מנדטים')}</span></header>
      {refBars && <RefLegend work={cmp!.ref.same ? L('Your work', 'העבודה שלכם') : yearOf(elections, s.electionId, lang)} label={cmp!.label} />}
      {groups.map(g => <p key={g.key} className="lb-group-comparison small ink2">{L(`Ran separately: together ${g.seatsB}, ${baseLabel.at} ${g.seatsA} as `, `רצו בנפרד: יחד ${g.seatsB}, ${baseLabel.at} ${g.seatsA} בתור `)}{g.aIds.map(id => listLabel(base.lists.find(l => l.id === id)!, lang)).join(' + ')}</p>)}
      <ol className="lb">
        {inKnesset.map(row)}
        {outside.length > 0 && (
          <li className="lb-thr">
            <span>{belowThreshold ? L(`Below the threshold · ${fmtInt(r.thresholdVotes)} votes (${s.rules.thresholdPct}%)`, `מתחת לאחוז החסימה · ${fmtInt(r.thresholdVotes)} קולות (${s.rules.thresholdPct}%)`) : L('Lists that won no seat', 'רשימות שלא זכו במנדט')}</span>
            {(hidden > 0 || showAll) && <DisclosureToggle open={showAll} onToggle={() => setShowAll(x => !x)} more={L(`Show all ${outside.length}`, `הצגת כל ${outside.length}`)} fewer={L('Show fewer', 'הצגת פחות')} />}
          </li>
        )}
        {visibleOut.map(row)}
      </ol>
      {cmp && <RefOnly rows={cmp.rows} label={cmp.label} />}
    </section>
  );
}
