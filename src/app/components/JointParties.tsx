import { useDisclosure } from './Feature.tsx';
// A joint list's constituent parties (decision 0087): who holds its seats, which bloc each party sits in,
// and "Run as separate lists", a counterfactual whose vote shares are an explicit, editable assumption.
import { Fragment, useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { apportion } from '../../model/actions.ts';
import type { Action, Scenario, SimList } from '../../model/scenario.ts';
import { electedOf } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { dispatch, dispatchMany, setState, useLevel } from '../store.ts';
import {JointFacts} from './JointFacts.tsx';
import { PartyLinks } from './PartyLinks.tsx';
import { Info, Slip } from './ui.tsx';
import { componentColours } from '../newListColour.ts';

const newId = (k: number) => `sim-${Date.now().toString(36)}${k}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function JointParties({ s, r, l }: { s: Scenario; r: AllocationResult; l: SimList }) {
  const L = useL();
  const { shown: standard, control: standardControl } = useDisclosure('jointEditing');
  const lang = useLang();
  const { expert } = useLevel();
  const parties = l.parties ?? [];
  const seats = r.lists.find((x) => x.id === l.id)?.seats ?? 0;
  const elected = electedOf(l, seats);
  const held = (id: string) => elected.filter((c) => c.partyId === id).length;
  const unknownElected = elected.filter((c) => !c.partyId || !parties.some((p) => p.id === c.partyId)).length;
  const name = (p: { nameHe: string; nameEn: string }) => (lang === 'he' ? p.nameHe : p.nameEn);
  const blocName = (id: string | null | undefined) => { const b = s.blocs.find((x) => x.id === id); return b ? name(b) : L('no bloc', 'ללא גוש'); };

  // the default assumption: each party's share of the list's seated members (else of its named candidates)
  const defaults = useMemo(() => {
    const w = parties.map((p) => held(p.id));
    const fallback = parties.map((p) => l.candidates.filter((c) => c.partyId === p.id).length);
    const base = w.some((x) => x > 0) ? w : fallback;
    const total = base.reduce((a, b) => a + b, 0) || 1;
    return base.map((x) => Math.round((x / total) * 1000) / 10);
  }, [l, seats]);
  // each party's colour here, on its candidates and when split: its own, else a distinguishable variant of the list's
  const colourOf = useMemo(() => componentColours(parties, l.candidates.find((c) => c.partyId)?.partyId, l.color,
    s.lists.filter((x) => x.id !== l.id && !x.withdrawn).map((x) => x.color)), [parties, l, s.lists]);
  const [shares, setShares] = useState<number[] | null>(null);
  const [open, setOpen] = useState(false);
  if (parties.length < 2) return null;
  const pct = shares ?? defaults;
  const sum = Math.round(pct.reduce((a, b) => a + b, 0) * 10) / 10;
  const votes = apportion(l.votes, pct.map((x) => Math.max(0, Math.round(x * 10))));
  // candidates without a recorded party go with the party of the list's first-ranked candidate
  const lead = l.candidates.find((c) => c.partyId)?.partyId ?? parties[0].id;
  const unassigned = l.candidates.filter((c) => !c.partyId || !parties.some((p) => p.id === c.partyId)).length;

  const run = () => {
    const parts = parties.map((p, i) => ({
      newId: newId(i), nameHe: p.nameHe, letters: i === 0 ? l.letters : `${l.letters}${i + 1}`, color: colourOf[p.id], votes: votes[i],
      candidateIds: l.candidates.filter((c) => (c.partyId && parties.some((x) => x.id === c.partyId) ? c.partyId : lead) === p.id).map((c) => c.id),
    }));
    const actions: Action[] = [{ type: 'split', id: l.id, parts },
      ...parts.map((p, i) => ({ type: 'setListMeta', listId: p.newId, patch: { shortEn: parties[i].nameEn } }) as Action)];
    if (dispatchMany(actions)) setState({ selectedListId: parts[0].newId });
  };

  const isSplit = (s.factionSplits ?? []).includes(l.id);
  return (
    <section>{standardControl}
      <h3>{L('Parties on this joint list', 'המפלגות ברשימה המשותפת')} <JointFacts listId={l.id} compact /></h3>

      <div className="row" style={{ gap: 4, marginBottom: 6, flexWrap: 'nowrap' }}><label className="switch small">
        <input type="checkbox" checked={isSplit} onChange={(e) => dispatch({ type: 'setFactionSplit', listId: l.id, split: e.target.checked })} />
        {L('Count seats by party', 'ספירת מנדטים לפי מפלגה')}
      </label>
      <Info title={L('About faction splits', 'על פיצול סיעות')}>{isSplit
        ? L('Each party now counts as its own faction in the chamber and the blocs, with the members elected for it. Votes and seats are unchanged.', 'כל מפלגה נספרת עתה כסיעה נפרדת במליאה ובגושים, עם הנבחרים מטעמה. הקולות והמנדטים ללא שינוי.')
        : L('Show each party as a separate faction in the chamber and blocs after the election. Members keep their seats; votes and allocation do not change.', 'הצגת כל מפלגה כסיעה נפרדת במליאה ובגושים אחרי הבחירות. הנבחרים שומרים על מושביהם; הקולות וחלוקת המנדטים אינם משתנים.')}</Info></div>
      <div className="party-rows">
        {parties.map((p) => (
          <div key={p.id} className="party-row">
            <Slip letters={l.letters} name={lang === 'he' ? p.nameHe : p.nameEn} color={colourOf[p.id]} logo={p.logo} />
            <span style={{ minWidth: 0 }}>{name(p)}{l.candidates[0]?.partyId === p.id && <small className="muted"> · {L('Lead party', 'מפלגה מובילה')}</small>}<PartyLinks links={p.links} name={name(p)} /></span>
            <b>{held(p.id)}</b>
            {standard && s.blocs.length > 0 ? (
              <select aria-label={L(`Bloc of ${p.nameEn}`, `הגוש של ${p.nameHe}`)} value={s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] ?? '__none' : '__list'}
                onChange={(e) => { const v = e.target.value; dispatch(v === '__list' ? { type: 'setPartyBloc', partyId: p.id, bloc: null, inherit: true } : { type: 'setPartyBloc', partyId: p.id, bloc: v === '__none' ? null : v }); }}>
                <option value="__list" title={blocName(l.bloc)}>{L('As the list', 'כמו הרשימה')}</option>
                {s.blocs.map((b) => <option key={b.id} value={b.id}>{name(b)}</option>)}
                <option value="__none">{L('No bloc', 'ללא גוש')}</option>
              </select>
            ) : s.blocs.length > 0 ? <span className="tiny muted">{blocName(s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] : l.bloc)}</span> : <span />}
          </div>
        ))}
      </div>
      {unknownElected > 0 && <p className="tiny muted">{L(`${unknownElected} unassigned seats`, `${unknownElected} מנדטים ללא שיוך`)} <Info title={L('Unknown party', 'מפלגה לא ידועה')}>{L(`${unknownElected} elected member(s) have no recorded party; their seats stay with the list.`, `ל-${unknownElected} נבחרים לא תועדה מפלגה; מושביהם נשארים עם הרשימה.`)}</Info></p>}
      {standard && (
        <div style={{ marginTop: 6 }}>
          <button className="btn small" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{L('Split into separate lists', 'פיצול לרשימות נפרדות')}</button>
          {open && <div className="joint-split">
          <p className="small ink2">{L('Assumed vote shares', 'חלוקת קולות משוערת')} <Info title={L('Split assumptions', 'הנחות הפיצול')}>{L('What if these parties had run on their own? Nobody knows how the joint list’s votes would have divided, so the shares below are an assumption: by default, each party’s share of the list’s elected members. Each part must then pass the threshold on its own, and the joint list’s surplus-vote agreement is dropped. Undo restores the joint list.',
            'מה אילו המפלגות היו רצות לבד? איש אינו יודע כיצד היו מתחלקים הקולות, ולכן החלוקה שלהלן היא הנחה: כברירת מחדל, חלקה של כל מפלגה בנבחרי הרשימה. כל חלק יצטרך לעבור את אחוז החסימה בעצמו, והסכם העודפים של הרשימה יבוטל. ביטול מחזיר את הרשימה המשותפת.')}</Info></p>
          <div className="kv small">
            {parties.map((p, i) => (
              <Fragment key={p.id}>
                <span>{name(p)}</span>
                <span className="row" style={{ gap: 4 }}>
                  <input type="number" min={0} max={100} step={0.1} value={pct[i]} aria-label={L(`Vote share of ${p.nameEn} (%)`, `חלק הקולות של ${p.nameHe} (%)`)} style={{ width: 72 }}
                    onChange={(e) => { const next = [...pct]; next[i] = Math.max(0, Number(e.target.value) || 0); setShares(next); }} />%
                  {expert && <span className="muted tabnum">{fmtInt(votes[i])}</span>}
                </span>
              </Fragment>
            ))}
          </div>
          {Math.abs(sum - 100) > 0.05 && <p className="small" style={{ color: 'var(--warn-ink)' }}>{L(`The shares add up to ${sum}%; the votes are divided in these proportions.`, `החלקים מסתכמים ב-${sum}%; הקולות יחולקו ביחס הזה.`)}</p>}
          {unassigned > 0 && <p className="tiny muted">{L(`${unassigned} candidates assigned to lead party`, `${unassigned} מועמדים צורפו למפלגת הראש`)} <Info title={L('Candidate assignment', 'שיוך מועמדים')}>{L(`${unassigned} candidate(s) without a recorded party go with ${name(parties.find((p) => p.id === lead)!)} (the party of the list’s leader).`, `${unassigned} מועמדים שמפלגתם לא תועדה יצורפו ל${name(parties.find((p) => p.id === lead)!)} (מפלגת העומד בראש הרשימה).`)}</Info></p>}
          <div className="row" style={{ gap: 6 }}>
            <button className="btn small primary" onClick={run}>{L(`Run as ${parties.length} separate lists`, `ריצה ב-${parties.length} רשימות נפרדות`)}</button>
            {shares && <button className="btn small ghost" onClick={() => setShares(null)}>{L('Reset shares', 'איפוס החלוקה')}</button>}
          </div>
          </div>}
        </div>
      )}
    </section>
  );
}
