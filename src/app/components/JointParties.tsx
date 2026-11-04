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
import { Info } from './ui.tsx';

const newId = (k: number) => `sim-${Date.now().toString(36)}${k}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function JointParties({ s, r, l }: { s: Scenario; r: AllocationResult; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const { standard, expert } = useLevel();
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
      newId: newId(i), nameHe: p.nameHe, letters: i === 0 ? l.letters : `${l.letters}${i + 1}`, color: p.color ?? l.color, votes: votes[i],
      candidateIds: l.candidates.filter((c) => (c.partyId && parties.some((x) => x.id === c.partyId) ? c.partyId : lead) === p.id).map((c) => c.id),
    }));
    const actions: Action[] = [{ type: 'split', id: l.id, parts },
      ...parts.map((p, i) => ({ type: 'setListMeta', listId: p.newId, patch: { shortEn: parties[i].nameEn } }) as Action)];
    if (dispatchMany(actions)) setState({ selectedListId: parts[0].newId });
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div className="section-title row">{L('Parties on this joint list', 'המפלגות ברשימה המשותפת')} <Info term="constituent-party" /></div>
      <ul className="joint-parties">
        {parties.map((p) => (
          <li key={p.id} className="row" style={{ gap: 6 }}>
            <span className="swatch" style={{ background: p.color ?? l.color }} />
            <span>{name(p)}</span>
            <b className="tabnum">{held(p.id)}</b>
            <span className="muted tiny">{L('seats', 'מנדטים')}</span>
            {s.blocs.length > 0 && <span className="muted tiny">· {blocName(s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] : l.bloc)}</span>}
            {standard && s.blocs.length > 0 && (
              <select className="small" aria-label={L(`Bloc of ${p.nameEn}`, `הגוש של ${p.nameHe}`)} value={s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] ?? '__none' : '__list'}
                onChange={(e) => { const v = e.target.value; dispatch(v === '__list' ? { type: 'setPartyBloc', partyId: p.id, bloc: null, inherit: true } : { type: 'setPartyBloc', partyId: p.id, bloc: v === '__none' ? null : v }); }}>
                <option value="__list">{L('With its list', 'עם הרשימה')}</option>
                {s.blocs.map((b) => <option key={b.id} value={b.id}>{name(b)}</option>)}
                <option value="__none">{L('No bloc', 'ללא גוש')}</option>
              </select>
            )}
          </li>
        ))}
      </ul>
      {unknownElected > 0 && <p className="tiny muted">{L(`${unknownElected} elected member(s) have no recorded party; their seats stay with the list.`, `ל-${unknownElected} נבחרים לא תועדה מפלגה; מושביהם נשארים עם הרשימה.`)}</p>}
      {standard && (
        <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} style={{ marginTop: 6 }}>
          <summary className="small" style={{ cursor: 'pointer' }}>{L('Run as separate lists…', 'ריצה ברשימות נפרדות…')}</summary>
          <p className="small ink2">{L('What if these parties had run on their own? Nobody knows how the joint list’s votes would have divided, so the shares below are an assumption: by default, each party’s share of the list’s elected members. Each part must then pass the threshold on its own, and the joint list’s surplus-vote agreement is dropped. Undo restores the joint list.',
            'מה אילו המפלגות היו רצות לבד? איש אינו יודע כיצד היו מתחלקים הקולות, ולכן החלוקה שלהלן היא הנחה: כברירת מחדל, חלקה של כל מפלגה בנבחרי הרשימה. כל חלק יצטרך לעבור את אחוז החסימה בעצמו, והסכם העודפים של הרשימה יבוטל. ביטול מחזיר את הרשימה המשותפת.')}</p>
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
          {unassigned > 0 && <p className="tiny muted">{L(`${unassigned} candidate(s) without a recorded party go with ${name(parties.find((p) => p.id === lead)!)} (the party of the list’s leader).`, `${unassigned} מועמדים שמפלגתם לא תועדה יצורפו ל${name(parties.find((p) => p.id === lead)!)} (מפלגת העומד בראש הרשימה).`)}</p>}
          <div className="row" style={{ gap: 6 }}>
            <button className="btn small primary" onClick={run}>{L(`Run as ${parties.length} separate lists`, `ריצה ב-${parties.length} רשימות נפרדות`)}</button>
            {shares && <button className="btn small ghost" onClick={() => setShares(null)}>{L('Reset shares', 'איפוס החלוקה')}</button>}
          </div>
        </details>
      )}
    </div>
  );
}
