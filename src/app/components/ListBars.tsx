import { FamilyListTreatment } from './FamilyTreatment.tsx';
import { resolve } from '../../families/model.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { referenceLabel } from '../derive.ts';
import { allocationOf } from '../derive.ts';
import { PartEdits } from './PartEdits.tsx';
// The lists as a visual column: each list is a row with its logo, name and a seat bar (its official seats shown
// as a faint outline when they differ). Lists that won no seat show how far they are from the threshold instead.
// Choosing a row opens the list in the side panel.
import { useEffect, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { comparisonGroups, officialSeatsFor, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { setState, useDigits, useLevel, useStore } from '../store.ts';
import { Slip } from './ui.tsx';

/** A drawn up/down mark in neutral ink (change is never coloured by camp). */
export const Mark = ({ up }: { up: boolean }) => <svg className="mark" viewBox="0 0 10 10" width={8} height={8} aria-hidden><path d={up ? 'M5 1 9.5 9H.5z' : 'M5 9 .5 1h9z'} fill="currentColor" /></svg>;

export function ListBars({ s, r, base, baseR }: { s: Scenario; r: AllocationResult; base: Scenario; baseR: AllocationResult }) {
  const { reference } = useActiveReference();
  if (reference) { base = reference; baseR = allocationOf(reference); }
  const L = useL();
  const lang = useLang();
  const baseLabel = referenceLabel(reference, lang);
  const digits = useDigits();
  const { standard } = useLevel();
  const selected = useStore((st) => st.selectedListId);
  const [showAll, setShowAll] = useState(false);
  const selRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (selected) selRef.current?.scrollIntoView({ block: 'nearest' }); }, [selected]);

  const total = Number(r.totalValid);
  const thr = Number(r.thresholdVotes);
  const groups = comparisonGroups(s, r, base, baseR).filter(g => g.bIds.length > 1);
  const baseSeats = (l: SimList) => officialSeatsFor(l.id, s, r, base, baseR);
  const rows = s.lists.map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)!, was: baseSeats(l) }));
  const inKnesset = rows.filter((x) => x.lr.seats > 0 || x.lr.qualified).sort((a, b) => b.lr.seats - a.lr.seats || b.l.votes - a.l.votes);
  const outside = rows.filter((x) => !(x.lr.seats > 0 || x.lr.qualified)).sort((a, b) => b.l.votes - a.l.votes);
  const visibleOut = showAll ? outside : outside.filter(({ l }) => l.votes >= total * 0.005 || l.id === selected || !base.lists.some((b) => b.id === l.id));
  const hidden = outside.length - visibleOut.length;
  const splitIds = new Set(s.factionSplits ?? []);
  // one scale for every bar: the largest list now or in the official result
  const scale = Math.max(1, ...rows.map((x) => Math.max(x.lr.seats, x.was ?? 0)));

  const viewedFamily = useStore(st=>st.familyView);
  const familyDefinition = viewedFamily ?? s.familyDefinition;
  const familyRows = familyDefinition ? resolve(familyDefinition, s) : [];
  const row = ({ l, lr, was }: (typeof rows)[number]) => {
    const family = familyRows.find(x => x.id === l.id)?.family;
    const displayed = [...inKnesset,...visibleOut], at = displayed.findIndex(x=>x.l.id===l.id);
    const previousFamily = at > 0 ? familyRows.find(x=>x.id===displayed[at-1].l.id)?.family : undefined;
    const familyStart = family && family !== 'other' && family !== previousFamily;
    const open = selected === l.id;
    const d = was === null ? 0 : lr.seats - was;
    const agr = standard ? s.agreements.find((a) => a.members.includes(l.id) && a.enabled) : undefined;
    const partner = agr ? s.lists.find((x) => x.id === agr.members.find((m) => m !== l.id)) : undefined;
    const out = !lr.qualified;
    return (
      <li key={l.id} data-family={family}>
        {familyStart && familyDefinition && <span className="family-run-label">{lang==='he'?familyDefinition.nameHe:familyDefinition.nameEn}{family==='mixed'?` · ${L('Mixed lists','רשימות מעורבות')}`:''}</span>}
        <button type="button" data-family={familyRows.find(x => x.id === l.id)?.family} ref={open ? selRef : undefined} className={`lb-row ${out ? 'out' : ''} ${selected && !open ? 'dim' : ''}`} aria-pressed={open}
          aria-label={listLabel(l, lang)} aria-describedby={`lbd-${l.id}`}
          onClick={() => setState({ selectedListId: open ? null : l.id })}
          title={l.logo ? l.nameHe : `${l.nameHe} — ${L('ballot letters (no logo is sourced for this election yet)', 'אותיות הפתק (טרם נמצא סמל ממקור לבחירות אלה)')}`}>
          <Slip letters={l.letters} color={l.color} logo={l.logo} />
          <span className="lb-main">
            <span className="lb-name">{listLabel(l, lang)}<PartEdits s={s} prefix={['lists', l.id]} /></span>
            <span className="lb-bar" aria-hidden>
              {out
                ? <><i className="thr-fill" style={{ width: `${Math.min(100, (l.votes / Math.max(1, thr)) * 100)}%`, background: l.color }} /><span className="thr-tick" /></>
                : <><i style={{ width: `${(lr.seats / scale) * 100}%`, background: l.color }} />{d !== 0 && <span className="delta-segment" style={{ insetInlineStart: `${(Math.min(lr.seats, was ?? 0) / scale) * 100}%`, width: `${(Math.abs(d) / scale) * 100}%` }} />}{d !== 0 && <span className="was" style={{ width: `${((was ?? 0) / scale) * 100}%` }} />}</>}
            </span>
            {out && (was ?? 0) > 0 && <span className="lb-bar" aria-hidden title={baseLabel.seats}>
              <span className="was" style={{width:`${(was ?? 0)/scale*100}%`}} />
              <span className="delta-segment" style={{insetInlineStart:0,width:`${(was ?? 0)/scale*100}%`}} />
            </span>}
            <span className="lb-sub">
              {standard && <>{fmtInt(l.votes)} · </>}{fmtPct(l.votes, total, digits)}
              {out && thr > 0 && <> · {L(`${fmtPct(l.votes, thr, 0)} of the threshold`, `${fmtPct(l.votes, thr, 0)} מאחוז החסימה`)}</>}
              {l.withdrawn && <> · {L('withdrew', 'פרשה')}</>}
              {partner && <> · ⇄ {listLabel(partner, lang)}</>}
            </span>
          </span>
          <span className="sr-only" id={`lbd-${l.id}`}>{L(`${lr.seats} seats`, `${lr.seats} מנדטים`)}, {fmtPct(l.votes, total, digits)}{d !== 0 && <>, {Math.abs(d)}{d > 0 ? baseLabel.more : baseLabel.fewer}</>}</span>
          <span className="lb-seats">
            <b key={`s${lr.seats}`} className={s.log.length ? 'tick' : ''}>{lr.seats}</b>
            {d !== 0 && <small dir="ltr"><Mark up={d > 0} />{Math.abs(d)}</small>}
          </span>
        </button>
        {splitIds.has(l.id) && (l.parties?.length ?? 0) > 1 && (
          <ul className="lb-parties" aria-label={L(`${listLabel(l, lang)}: factions after the split`, `${listLabel(l, lang)}: הסיעות אחרי הפיצול`)}>
            {l.parties!.map((p) => {
              const n = electedOf(l, lr.seats).filter((c) => c.partyId === p.id).length;
              return (
                <li key={p.id}>
                  {p.logo ? <Slip letters={l.letters} color={p.color ?? l.color} logo={p.logo} /> : <span className="swatch" style={{ background: p.color ?? l.color }} />}
                  <span className="lb-pname">{lang === 'he' ? p.nameHe : p.nameEn}</span>
                  <span className="lb-bar" aria-hidden><i style={{ width: `${(n / scale) * 100}%`, background: p.color ?? l.color }} /></span>
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
      <header><h2>{L('Lists', 'הרשימות')}</h2><span className="spacer" /><span className="small muted">{L('seats', 'מנדטים')}</span></header>
      {groups.map(g => <p key={g.key} className="lb-group-comparison small ink2">{L(`Ran separately: together ${g.seatsB}, ${baseLabel.at} ${g.seatsA} as `, `רצו בנפרד: יחד ${g.seatsB}, ${baseLabel.at} ${g.seatsA} בתור `)}{g.aIds.map(id => listLabel(base.lists.find(l => l.id === id)!, lang)).join(' + ')}</p>)}
      <ol className="lb">
        {inKnesset.map(row)}
        {outside.length > 0 && (
          <li className="lb-thr">
            <span>{thr > 0 ? L(`Below the threshold · ${fmtInt(r.thresholdVotes)} votes (${s.rules.thresholdPct}%)`, `מתחת לאחוז החסימה · ${fmtInt(r.thresholdVotes)} קולות (${s.rules.thresholdPct}%)`) : L('Lists that won no seat', 'רשימות שלא זכו במנדט')}</span>
            {(hidden > 0 || showAll) && <button type="button" onClick={() => setShowAll((x) => !x)}>{showAll ? L('Show fewer', 'הצגת פחות') : L(`Show all ${outside.length}`, `הצגת כל ${outside.length}`)}</button>}
          </li>
        )}
        {visibleOut.map(row)}
      </ol>
    </section>
  );
}
