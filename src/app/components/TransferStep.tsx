import { seatChangeSentence } from '../analysisWords.ts';
import { hebrewPrefixName } from '../hebrewPrefix.ts';
import { useMemo, useState } from 'react';
import { applyAction } from '../../model/actions.ts';
import { allocate } from '../../engine/allocate.ts';
import { toEngineInput, type Scenario, type SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { dispatchMany, useVoteSource } from '../store.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import { listChoice } from './ListMark.tsx';
/** An explicit paired transfer is independent of the general balancing assumption. No clipping. */
export function TransferStep({ s, l }: { s: Scenario; l: SimList }) {
  const L = useL(), lang = useLang(), src = useVoteSource();
  const [selected, setSelected] = useState<string | null>(null);
  const donors = s.lists.filter(x => !x.withdrawn && x.id !== l.id).sort((a, b) => b.votes - a.votes);
  const donor = donors.find(x => x.id === (selected ?? (src.kind === 'transfer' ? src.listId : null))) ?? donors[0];
  const votes = Math.round(s.lists.reduce((t, x) => t + x.votes, 0) / 100);
  const action = donor && votes > 0 && donor.votes >= votes ? { type: 'transfer' as const, from: donor.id, to: l.id, votes } : null;
  const consequence = useMemo(() => {
    if (!donor) return '';
    if (!action) return L(`${listLabel(donor, 'en')} has fewer than ${fmtInt(votes)} votes to give.`, `${hebrewPrefixName('ל', listLabel(donor, 'he'))} אין ${fmtInt(votes)} קולות לתת.`);
    const before = allocate(toEngineInput(s)), after = allocate(toEngineInput(applyAction(s, action)));
    const moves = after.lists.map(x => ({ id: x.id, d: x.seats - (before.lists.find(y => y.id === x.id)?.seats ?? 0) })).filter(x => x.d);
    const name = (id: string) => listLabel(s.lists.find(y => y.id === id)!, lang);
    // "Moving 47,647 votes from Yesh Atid to Likud: no seats change." (turnout and the valid total stay as they are)
    const what = lang === 'he' ? `העברת ${fmtInt(votes)} קולות ${hebrewPrefixName('מ', name(donor.id))} ${hebrewPrefixName('ל', name(l.id))}: ` : `Moving ${fmtInt(votes)} votes from ${name(donor.id)} to ${name(l.id)}: `;
    const said = seatChangeSentence(moves, name, lang === 'he');
    return what + (lang === 'he' || moves.length ? said : said.charAt(0).toLowerCase() + said.slice(1));
  }, [s, l.id, donor?.id, votes, lang]);
  return <div className="transfer-step">
    {/* reads as one phrase: [Take 1 pp from] [Likud ▾] */}
    <button className="btn small" disabled={!action} onClick={() => { if (action) dispatchMany([action]); }}>{L('Take 1 pp from', 'לקחת נק׳ אחוז אחת מתוך')}</button>
    <ChoicePicker label={L('List to take 1 pp from', 'הרשימה שממנה לוקחים נק׳ אחוז')} value={donor?.id ?? ''} options={donors.map(x => listChoice(x, lang, { detail: `${fmtInt(x.votes)} ${L('votes', 'קולות')}` }))} onChange={setSelected} />
    <p className="tiny" aria-live="polite">{consequence}</p>
  </div>;
}
