import { percentNum } from './Percentage.tsx';
import { SplitPartNote, SplitWarning } from './SplitWarning.tsx';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { EditMarker } from './EditMarker.tsx';
import { useDisclosure } from './Feature.tsx';
// A joint list's constituent parties (decision 0087): who holds its seats, which bloc each party sits in,
// and "Run as separate lists", a counterfactual whose vote shares are an explicit, editable assumption.
import { Fragment, useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { apportion } from '../../model/actions.ts';
import { hasOwnCandidates, planPartySplit } from '../../model/jointSplit.ts';
import type { Action, Scenario, SimList } from '../../model/scenario.ts';
import { electedOf } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { dispatch, dispatchMany, setPreference, setState, useDigits, useStore, useLevel, useSetting } from '../store.ts';
import { hiddenSeatlessParty } from '../seatlessParties.ts';
import {JointFacts} from './JointFacts.tsx';
import { PartyLinks } from './PartyLinks.tsx';
import { DisclosureToggle, Info, Slip } from './ui.tsx';
import { componentColours } from '../newListColour.ts';

const newId = (k: number) => `sim-${Date.now().toString(36)}${k}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function JointParties({ s, r, l }: { s: Scenario; r: AllocationResult; l: SimList }) {
  const L = useL();
  const digits = useDigits();
  const { shown: standard, control: standardControl } = useDisclosure('jointEditing');
  const lang = useLang();
  const { expert } = useLevel();
  // the same value as Settings → Joint lists by party (no answer means its default, On)
  const defaultSplit = useStore(st => st.preferences.jointSeats !== 'off');
  const seatlessParties = useSetting('jointListParties') === 'all';
  const [showZero, setShowZero] = useState(false);
  const parties = l.parties ?? [];
  const seats = r.lists.find((x) => x.id === l.id)?.seats ?? 0;
  const elected = electedOf(l, seats);
  const held = (id: string) => elected.filter((c) => c.partyId === id).length;
  const unknownElected = elected.filter((c) => !c.partyId || !parties.some((p) => p.id === c.partyId)).length;
  const name = (p: { nameHe: string; nameEn: string }) => (lang === 'he' ? p.nameHe : p.nameEn);
  const blocName = (id: string | null | undefined) => { const b = s.blocs.find((x) => x.id === id); return b ? groupingName(b, lang) : L('no bloc', 'ללא גוש'); };

  // the default assumption: each party's share of the list's seated members (else of its named candidates)
  const defaults = useMemo(() => {
    const w = parties.map((p) => held(p.id));
    const fallback = parties.map((p) => l.candidates.filter((c) => c.partyId === p.id).length);
    const base = w.some((x) => x > 0) ? w : fallback;
    const total = base.reduce((a, b) => a + b, 0) || 1;
    return base.map((x) => Math.round((x / total) * 1000) / 10);
  }, [l, seats]);
  // Creating separate ballot lists retains their existing chamber-wide colour separation policy.
  // Party displays within this joint list share the dot/legend resolver.
  const separateListColours = useMemo(() => componentColours(parties, l.candidates.find((c) => c.partyId)?.partyId, l.color,
    s.lists.filter((x) => x.id !== l.id && !x.withdrawn).map((x) => x.color)), [parties, l, s.lists]);
  const colourOf = useMemo(() => Object.fromEntries(parties.map(p => [p.id, partyDisplayColor(l, p.id)])), [l, parties]);
  const [shares, setShares] = useState<number[] | null>(null);
  const [open, setOpen] = useState(false);
  if (parties.length < 2) return null;
  const pct = shares ?? defaults;
  const sum = Math.round(pct.reduce((a, b) => a + b, 0) * 10) / 10;
  const votes = apportion(l.votes, pct.map((x) => Math.max(0, Math.round(x * 10))));
  // only parties given votes run on their own; the rest, and candidates without a recorded party, stay with the lead's part
  const plan = planPartySplit(l, votes);
  const home = parties[plan.home];
  const unassigned = l.candidates.filter((c) => !c.partyId || !parties.some((p) => p.id === c.partyId)).length;

  const run = () => {
    if (plan.parts.length < 2) return;
    const parts = plan.parts.map((pt, k) => ({
      newId: newId(k), nameHe: parties[pt.index].nameHe, letters: k === 0 ? l.letters : `${l.letters}${k + 1}`, color: separateListColours[parties[pt.index].id], votes: pt.votes, candidateIds: pt.candidateIds,
    }));
    const actions: Action[] = [{ type: 'split', id: l.id, parts },
      ...parts.map((p, k) => ({ type: 'setListMeta', listId: p.newId, patch: { shortEn: parties[plan.parts[k].index].nameEn } }) as Action)];
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
      <EditMarker s={s} path={['factionSplits']} />
      <Info title={L('About faction splits', 'על פיצול סיעות')}>{isSplit
        ? L('Each party now counts as its own faction in the chamber and the blocs, with the members elected for it. Votes and seats are unchanged.', 'כל מפלגה נספרת עתה כסיעה נפרדת במליאה ובגושים, עם הנבחרים מטעמה. הקולות והמנדטים ללא שינוי.')
        : L('Show each party as a separate faction in the chamber and blocs after the election. Members keep their seats; votes and allocation do not change.', 'הצגת כל מפלגה כסיעה נפרדת במליאה ובגושים אחרי הבחירות. הנבחרים שומרים על מושביהם; הקולות וחלוקת המנדטים אינם משתנים.')}</Info></div>
      <label className="switch small" style={{ marginBottom: 6 }}>
        <input type="checkbox" checked={defaultSplit} onChange={e => setPreference('jointSeats', e.target.checked ? 'on' : 'off')} />
        {L('Use by default for joint lists', 'ברירת מחדל לרשימות משותפות')}
      </label>
      <div className="party-rows">
        {/* Settings → Parties under joint lists (All): zero-seat parties fold behind one line here otherwise, never out of reach, so they
            can still be given a bloc or split off */}
        {parties.filter(p => seatlessParties || showZero || seats === 0 || !hiddenSeatlessParty(s, p.id, held(p.id))).map((p) => (
          <div key={p.id} className="party-row">
            <Slip letters="" name={lang === 'he' ? p.nameHe : p.nameEn} color={colourOf[p.id]} logo={p.logo} />
            <span style={{ minWidth: 0 }}>{name(p)}{l.candidates[0]?.partyId === p.id && <small className="muted"> · {L('Lead party', 'מפלגה מובילה')}</small>}<PartyLinks links={p.links} name={name(p)} /></span>
            <b>{held(p.id)}</b>
            {standard && s.blocs.length > 0 ? (
              <select aria-label={L(`Bloc of ${p.nameEn}`, `הגוש של ${p.nameHe}`)} value={s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] ?? '__none' : '__list'}
                onChange={(e) => { const v = e.target.value; dispatch(v === '__list' ? { type: 'setPartyBloc', partyId: p.id, bloc: null, inherit: true } : { type: 'setPartyBloc', partyId: p.id, bloc: v === '__none' ? null : v }); }}>
                <option value="__list" title={blocName(l.bloc)}>{L('As the list', 'כמו הרשימה')}</option>
                {s.blocs.map((b) => <option key={b.id} value={b.id} title={b.appDefined ? appGroupingExplanation(lang) : undefined}>{groupingName(b, lang)}</option>)}
                <option value="__none">{L('No bloc', 'ללא גוש')}</option>
              </select>
            ) : s.blocs.length > 0 ? <span className="tiny muted">{blocName(s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] : l.bloc)}</span> : <span />}
          </div>
        ))}
      </div>
      {!seatlessParties && seats > 0 && ((n) => n > 0 && <DisclosureToggle open={showZero} onToggle={() => setShowZero(x => !x)}
        more={L(`+${n} with no seats`, `‏+${n} ללא מנדטים`)} fewer={L('Hide parties with no seats', 'הסתרת מפלגות ללא מנדטים')} />)(parties.filter(p => hiddenSeatlessParty(s, p.id, held(p.id))).length)}
      {unknownElected > 0 && <p className="tiny muted">{L(`${unknownElected} unassigned seats`, `${unknownElected} מנדטים ללא שיוך`)} <Info title={L('Unknown party', 'מפלגה לא ידועה')}>{L(`${unknownElected} elected member(s) have no recorded party; their seats stay with the list.`, `ל-${unknownElected} נבחרים לא תועדה מפלגה; מושביהם נשארים עם הרשימה.`)}</Info></p>}
      {standard && (
        <div style={{ marginTop: 6 }}>
          <button className="btn small" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{L('Split into separate lists', 'פיצול לרשימות נפרדות')}</button>
          {open && <div className="joint-split"><SplitWarning />
          <p className="small ink2">{L('Assumed vote shares', 'חלוקת קולות משוערת')} <Info title={L('Split assumptions', 'הנחות הפיצול')}>{L('What if these parties had run on their own? The vote was cast for the whole list, so the shares below are an assumption for the scenario: by default, each party’s share of the list’s elected members. Each part must then pass the threshold on its own, and the joint list’s surplus-vote agreement is dropped. Undo restores the joint list.',
            'מה אילו המפלגות היו רצות לבד? הקול ניתן לרשימה כולה, ולכן החלוקה שלהלן היא הנחה לתרחיש: כברירת מחדל, חלקה של כל מפלגה בנבחרי הרשימה. כל חלק יצטרך לעבור את אחוז החסימה בעצמו, והסכם העודפים של הרשימה יבוטל. ביטול מחזיר את הרשימה המשותפת.')}</Info></p>
          <div className="kv small">
            {parties.map((p, i) => (
              <Fragment key={p.id}>
                <span>{name(p)}</span>
                <span className="row" style={{ gap: 4 }}>
                  <input type="number" min={0} max={100} step={0.1} value={pct[i]} aria-label={L(`Vote share of ${p.nameEn} (%)`, `חלק הקולות של ${p.nameHe} (%)`)} style={{ width: 72 }}
                    onChange={(e) => { const next = [...pct]; next[i] = Math.max(0, Number(e.target.value) || 0); setShares(next); }} />%
                  {expert && <span className="muted tabnum">{fmtInt(votes[i])}</span>}
                  {votes[i] === 0 ? <SplitPartNote own={hasOwnCandidates(l, p.id)} home={home && home !== p ? name(home) : null} />
                    : !hasOwnCandidates(l, p.id) && p.id !== parties[plan.home]?.id && <span className="tiny muted">{L('No recorded candidates', 'אין מועמדים מתועדים')}</span>}
                </span>
              </Fragment>
            ))}
          </div>
          {Math.abs(sum - 100) > 0.05 && <p className="small" style={{ color: 'var(--warn-ink)' }}>{(lang === 'he' ? <>{"החלקים מסתכמים ב-"}{percentNum(sum, digits)}{"; הקולות יחולקו ביחס הזה."}</> : <>{"The shares add up to "}{percentNum(sum, digits)}{"; the votes are divided in these proportions."}</>)}</p>}
          {unassigned > 0 && home && <p className="tiny muted">{L(`${unassigned} candidates assigned to lead party`, `${unassigned} מועמדים צורפו למפלגת הראש`)} <Info title={L('Candidate assignment', 'שיוך מועמדים')}>{L(`${unassigned} candidate(s) without a recorded party go with ${name(home)} (the party of the list’s leader).`, `${unassigned} מועמדים שמפלגתם לא תועדה יצורפו ${hebrewPrefix('ל', name(home))} (מפלגת העומד בראש הרשימה).`)}</Info></p>}
          {plan.parts.length < 2 && <p className="small" style={{ color: 'var(--warn-ink)' }}>{L('Give at least two parties a share.', 'תנו חלק לשתי מפלגות לפחות.')}</p>}
          <div className="row" style={{ gap: 6 }}>
            <button className="btn small primary" disabled={plan.parts.length < 2} onClick={run}>{L(`Run as ${plan.parts.length} separate lists`, `ריצה ב-${plan.parts.length} רשימות נפרדות`)}</button>
            {shares && <button className="btn small ghost" onClick={() => setShares(null)}>{L('Reset shares', 'איפוס החלוקה')}</button>}
          </div>
          </div>}
        </div>
      )}
    </section>
  );
}

