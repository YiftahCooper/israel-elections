// Who runs on a list: another list can join it, it can join another, and a party of a joint list can move to another list
// or run on its own. Rules (the app's merge and split rules): a list that joins brings all its votes and its candidates,
// who share the places with the host's in proportion to the two lists' votes; a party that leaves takes its candidates and
// the votes set here (by default its share of the list's elected members, else of its candidates, as a split).
import { useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { apportion, ownPartyId } from '../../model/actions.ts';
import type { Action, Scenario, SimList } from '../../model/scenario.ts';
import { electedOf, listLabel } from '../derive.ts';
import { fmtInt } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { componentColours, distinctColour } from '../newListColour.ts';
import { dispatch, dispatchMany, setState } from '../store.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import { useDisclosure } from './Feature.tsx';
import { listChoice, partyChoice } from './ListMark.tsx';
import { Info } from './ui.tsx';
import './joint-edit.css';

const newId = () => `sim-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
const OWN = '__own';

export function JointEdit({ s, r, l, base }: { s: Scenario; r: AllocationResult; l: SimList; base: Scenario }) {
  const L = useL(), lang = useLang();
  const { shown } = useDisclosure('jointEditing');
  const parties = l.parties ?? [];
  const joint = parties.length >= 2;
  const others = useMemo(() => s.lists.filter((x) => x.id !== l.id && !x.withdrawn).sort((a, b) => b.votes - a.votes), [s.lists, l.id]);
  const seats = r.lists.find((x) => x.id === l.id)?.seats ?? 0;
  // the split's default: each party's share of the list's elected members, else of its named candidates
  const defaults = useMemo(() => {
    const elected = electedOf(l, seats);
    const w = parties.map((p) => elected.filter((c) => c.partyId === p.id).length);
    const base = w.some((x) => x > 0) ? w : parties.map((p) => l.candidates.filter((c) => c.partyId === p.id).length);
    const t = base.reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(parties.map((p, i) => [p.id, Math.round((base[i] / t) * 1000) / 10]));
  }, [l, seats, parties]);
  const [partyId, setPartyId] = useState('');
  const [dest, setDest] = useState(OWN);
  const [pct, setPct] = useState<number | null>(null);
  if (!shown || l.withdrawn) return null;

  const party = parties.find((p) => p.id === partyId);
  const share = pct ?? (party ? defaults[party.id] ?? 0 : 0);
  const votes = party ? apportion(l.votes, [Math.round(share * 10), Math.max(0, 1000 - Math.round(share * 10))])[0] : 0;

  const join = (from: string, into: string) => { if (dispatch({ type: 'joinList', listId: from, into } as Action)) setState({ selectedListId: into }); };
  const move = () => {
    if (!party) return;
    const id = newId();
    const own = party.id === ownPartyId(party.id.slice(4));
    // a list that ran inside this one in the scenario goes back to its own letters and colour where they are free
    const was = own ? base.lists.find((x) => x.id === party.id.slice(4)) : undefined;
    const taken = s.lists.filter((x) => !x.withdrawn).map((x) => x.color);
    const letters = was && !s.lists.some((x) => x.letters === was.letters) ? was.letters : `${l.letters}${s.lists.filter((x) => x.letters.startsWith(l.letters)).length + 1}`;
    const color = was?.color ?? componentColours(parties, l.candidates.find((c) => c.partyId)?.partyId, l.color, taken)[party.id] ?? distinctColour(l.color, taken);
    const leave: Action = { type: 'leaveList', listId: l.id, partyId: party.id, votes, newId: id, nameHe: was?.nameHe ?? party.nameHe, shortEn: was?.shortEn ?? party.nameEn, letters, color };
    const ok = dest === OWN ? dispatch(leave) : dispatchMany([leave, { type: 'joinList', listId: id, into: dest }]);
    if (ok) { setPartyId(''); setPct(null); setState({ selectedListId: dest === OWN ? id : dest }); }
  };
  const he = lang === 'he';
  const pName = party ? (he ? party.nameHe : party.nameEn) : '';

  return (
    <section className="joint-edit">
      <h3>{L('Who runs on this list', 'מי רצה ברשימה')}
        <Info title={L('Joining and leaving lists', 'הצטרפות ויציאה מרשימות')}>{L(
          'A list that joins brings all its votes and candidates. A party that leaves takes its candidates and the share of the votes you set, by default its share of the list’s elected members.',
          'רשימה שמצטרפת מביאה את כל קולותיה ומועמדיה. מפלגה שיוצאת לוקחת את מועמדיה ואת חלק הקולות שתקבעו, כברירת מחדל חלקה בנבחרי הרשימה.')}</Info></h3>
      <div className="row joint-edit-row">
        <ChoicePicker className="joint-add" label={L('Add a list to this one', 'צירוף רשימה לרשימה הזו')} value="" placeholder={L('Add a list…', 'צירוף רשימה…')}
          options={others.map((x) => listChoice(x, lang, { detail: L(`${fmtInt(x.votes)} votes`, `${fmtInt(x.votes)} קולות`) }))} onChange={(id) => join(id, l.id)} />
        {!joint && <ChoicePicker className="joint-into" label={L('Run inside another list', 'ריצה בתוך רשימה אחרת')} value="" placeholder={L('Join another list…', 'הצטרפות לרשימה אחרת…')}
          options={others.map((x) => listChoice(x, lang, { detail: L(`${fmtInt(x.votes)} votes`, `${fmtInt(x.votes)} קולות`) }))} onChange={(id) => join(l.id, id)} />}
      </div>
      {joint && <div className="joint-move">
        <div className="row joint-edit-row">
          <ChoicePicker className="joint-move-party" label={L('Party to move', 'מפלגה להעברה')} value={partyId} placeholder={L('Move a party…', 'העברת מפלגה…')}
            options={parties.map((p) => partyChoice(p, lang, l))} onChange={(id) => { setPartyId(id); setPct(null); }} />
          {party && <ChoicePicker className="joint-move-dest" label={L(`Where ${party.nameEn} goes`, `לאן ${party.nameHe} עוברת`)} value={dest}
            options={[{ value: OWN, label: L('Its own list', 'רשימה משלה') }, ...others.map((x) => listChoice(x, lang, { group: L('Into another list', 'לתוך רשימה אחרת') }))]} onChange={setDest} />}
        </div>
        {party && <>
          <label className="row small joint-move-share">{L('Votes it takes', 'הקולות שהיא לוקחת')}
            <input type="number" min={0} max={100} step={0.1} value={share} style={{ width: 72 }} aria-label={L(`Share of ${listLabel(l, 'en')}’s votes that go with ${party.nameEn} (%)`, `חלק מקולות ${listLabel(l, 'he')} שעוברים עם ${party.nameHe} (%)`)}
              onChange={(e) => setPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />%
            <span className="muted tabnum">{L(`${fmtInt(votes)} votes`, `${fmtInt(votes)} קולות`)}</span></label>
          <button className="btn small primary" onClick={move}>{dest === OWN ? L(`Run ${pName} on its own`, `${pName} רצה לבד`) : L(`Move ${pName}`, `העברת ${pName}`)}</button>
        </>}
      </div>}
    </section>
  );
}
