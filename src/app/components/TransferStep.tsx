import { useMemo, useState } from 'react';
import { applyAction } from '../../model/actions.ts';
import { allocate } from '../../engine/allocate.ts';
import { toEngineInput, type Scenario, type SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, signed } from '../format.ts';
import { dispatchMany, useVoteSource } from '../store.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
/** An explicit paired transfer is independent of the general balancing assumption. No clipping. */
export function TransferStep({ s, l }: { s: Scenario; l: SimList }) {
  const L = useL(), lang = useLang(), src = useVoteSource();
  const [selected, setSelected] = useState<string | null>(null);
  const donors = s.lists.filter(x => !x.withdrawn && x.id !== l.id).sort((a, b) => b.votes - a.votes);
  const donor = donors.find(x => x.id === (selected ?? (src.kind === 'transfer' ? src.listId : null))) ?? donors[0];
  const votes = Math.round(s.lists.reduce((t, x) => t + x.votes, 0) / 100);
  const action = donor && votes > 0 && donor.votes >= votes ? { type: 'transfer' as const, from: donor.id, to: l.id, votes } : null;
  const consequence = useMemo(() => {
    if (!action) return L('The source cannot supply a whole percentage point; no votes are clipped.', 'המקור אינו יכול לספק נקודת אחוז שלמה; אין קיטום קולות.');
    const before = allocate(toEngineInput(s)), after = allocate(toEngineInput(applyAction(s, action)));
    return after.lists.map(x => ({ id: x.id, d: x.seats - (before.lists.find(y => y.id === x.id)?.seats ?? 0) })).filter(x => x.d).map(x => `${listLabel(s.lists.find(y => y.id === x.id)!, lang)} ${signed(x.d)}`).join(' · ') || L('Seats unchanged', 'המנדטים ללא שינוי');
  }, [s, l.id, donor?.id, votes, lang]);
  return <div className="transfer-step">
    <ChoicePicker label={L('Transfer from', 'העברה מתוך')} value={donor?.id ?? ''} options={donors.map(x => ({ value: x.id, label: listLabel(x, lang), detail: `${fmtInt(x.votes)} ${L('votes', 'קולות')}`, preview: <span className="swatch" style={{ background: x.color }} /> }))} onChange={setSelected} />
    <button className="btn small" disabled={!action} onClick={() => { if (action) dispatchMany([action]); }}>{L('Transfer 1pp', 'העברת נק׳ אחוז אחת')}</button>
    <p className="tiny" aria-live="polite">{donor ? `${listLabel(donor, lang)} → ${listLabel(l, lang)} · ${fmtInt(votes)} ${L('votes', 'קולות')} · ` : ''}{L('Valid total and turnout unchanged', 'סך הכשרים ושיעור ההצבעה ללא שינוי')} · {consequence}</p>
  </div>;
}
