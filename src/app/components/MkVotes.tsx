// MKs who vote apart from their list in the Coalitions tool's confidence vote (owner, 16 Nov 2026): one folded section,
// Expert only, listing only the exceptions. A vote can be set for "one MK of the list" without naming anyone; naming the
// MK stays possible. Votes the research records (loaded with the recorded first government) are tagged as such and are
// not the user's edits.
import { useState, type ComponentProps } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { CoalitionRole, MkVote, Scenario } from '../../model/scenario.ts';
import { roleVote, type MkVoteKind } from '../coalitions.ts';
import { electedOf } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import { Info, Seg, Slip } from './ui.tsx';
import { X } from 'lucide-react';
import { listSearchNames, partySearchNames } from '../nameSearch.ts';

type SlipProps = ComponentProps<typeof Slip>;
export interface MkUnit { id: string; listId: string; partyId: string | null; label: string; letters: string; logo?: SlipProps['logo']; synthetic?: SlipProps['synthetic']; color: string; n: number }
const ANY = '__any';

export function MkVotes({ s, r, units, breaks, roleOf, onChange }: {
  s: Scenario; r: AllocationResult; units: MkUnit[]; breaks: MkVote[]; roleOf: (id: string) => CoalitionRole | 'any'; onChange: (next: MkVote[]) => void;
}) {
  const L = useL(), lang = useLang();
  const [unit, setUnit] = useState('');
  const [mk, setMk] = useState(ANY);
  const [vote, setVote] = useState<MkVoteKind | null>(null);
  const words: Record<MkVoteKind, string> = { for: L('For', 'בעד'), abstain: L('Abstain', 'הימנעות'), against: L('Against', 'נגד') };
  const unitOf = (id: string) => units.find((u) => u.id === id);
  /** the unit's elected MKs (a joint list's party: its own MKs; the rest of the list: everyone not in another unit) */
  const mksOf = (u: MkUnit) => {
    const l = s.lists.find((x) => x.id === u.listId);
    if (!l) return [];
    const elected = electedOf(l, r.lists.find((x) => x.id === l.id)?.seats ?? 0);
    const others = new Set(units.filter((x) => x.listId === u.listId && x.id !== u.id && x.partyId).map((x) => x.partyId));
    return elected.filter((c) => (u.partyId ? c.partyId === u.partyId : !others.has(c.partyId ?? '')));
  };
  const name = (b: MkVote) => b.mk ? (lang === 'he' ? b.mk.nameHe : b.mk.nameEn ?? b.mk.nameHe) : L('one MK', 'חבר כנסת אחד');
  const chosen = unitOf(unit);
  const listVote = chosen ? roleVote(roleOf(chosen.id)) : null;
  const room = chosen ? chosen.n - breaks.filter((b) => b.unit === chosen.id).length : 0;
  const used = new Set(breaks.map((b) => b.mk?.id).filter(Boolean));
  const mkChoices = chosen ? mksOf(chosen).filter((c) => !used.has(c.id)) : [];
  const v = vote ?? (listVote === 'for' ? 'against' : 'for');
  const add = () => {
    if (!chosen || room <= 0) return;
    const c = mkChoices.find((x) => x.id === mk);
    onChange([...breaks, { unit: chosen.id, vote: v, ...(c ? { mk: { id: c.id, nameHe: c.displayNameHe ?? c.nameHe, ...(c.nameEn ? { nameEn: c.nameEn } : {}) } } : {}) }]);
    setUnit(''); setMk(ANY); setVote(null);
  };
  const live = breaks.filter((b) => unitOf(b.unit));

  return (
    <details className="coal-apart">
      <summary className="small">{L('MKs apart from their list', 'חברי כנסת בנפרד מרשימתם')}{live.length > 0 && <span className="muted"> · {live.length}</span>}</summary>
      <p className="small ink2 coal-apart-why">{L('Each MK here votes differently from their list in the confidence vote.', 'חברי הכנסת כאן מצביעים אחרת מרשימתם בהצבעת האמון.')}{' '}
        <Info title={L('MKs apart from their list', 'חברי כנסת בנפרד מרשימתם')}>{L(
          'Every other MK votes with their list. Naming the MK is optional: “one MK” is enough for the count. Toward 61, an MK of the government who votes against leaves the count, one who abstains stays in it, and an MK of another list who votes for joins it. The smallest winning coalitions below count whole lists. “Recorded vote” marks a vote from the research, loaded with the recorded first government.',
          'כל שאר חברי הכנסת מצביעים עם רשימתם. אין חובה לבחור חבר כנסת: "חבר כנסת אחד" מספיק לספירה. בספירה ל־61, חבר כנסת מהממשלה שמצביע נגד יוצא מהספירה, מי שנמנע נשאר בה, וחבר כנסת מרשימה אחרת שמצביע בעד מצטרף אליה. הקואליציות המנצחות הקטנות ביותר למטה סופרות רשימות שלמות. "הצבעה מתועדת" מסמנת הצבעה מהמחקר, שנטענה עם הממשלה הראשונה המתועדת.')}</Info></p>
      {live.length > 0 && <ul className="coal-apart-list">
        {live.map((b) => { const u = unitOf(b.unit)!; const i = breaks.indexOf(b); const same = roleVote(roleOf(u.id)) === b.vote;
          return <li key={i} data-recorded={b.recorded ? 'true' : undefined}>
            <Slip letters={u.letters} name={u.label} logo={u.logo} synthetic={u.synthetic} color={u.color} size="sm" />
            <span className="coal-apart-who">{u.label} · <b>{name(b)}</b></span>
            <span className={`small coal-apart-tag ${b.recorded ? 'rec' : 'edit-marker'}`}>{b.recorded ? L('Recorded vote', 'הצבעה מתועדת') : L('Edited', 'נערך')}</span>
            {same && <span className="small muted">{L('votes as its list now', 'ההצבעה כעת כמו של הרשימה')}</span>}
            <Seg label={L(`${name(b)}’s vote`, `ההצבעה של ${name(b)}`)} value={b.vote} onChange={(x) => onChange(breaks.map((y, k) => (k === i ? { unit: y.unit, vote: x, ...(y.mk ? { mk: y.mk } : {}) } : y)))}
              options={(['for', 'abstain', 'against'] as const).map((k) => ({ v: k, label: words[k] }))} />
            <button type="button" className="btn small ghost icon-only" aria-label={L(`Remove ${name(b)} (${u.label})`, `הסרת ${name(b)} (${u.label})`)} onClick={() => onChange(breaks.filter((_, k) => k !== i))}><X className="icon sm" aria-hidden /></button>
          </li>; })}
      </ul>}
      <div className="row coal-apart-add">
        <ChoicePicker className="coal-apart-unit" label={L('List of the MK', 'רשימת חבר הכנסת')} value={unit} placeholder={L('Add an MK…', 'הוספת חבר כנסת…')}
          options={units.map((u) => ({ value: u.id, label: u.label, searchNames: u.partyId ? partySearchNames(u.partyId) : listSearchNames(s.lists.find((l) => l.id === u.listId) ?? {}), mark: <Slip letters={u.letters} name={u.label} logo={u.logo} synthetic={u.synthetic} color={u.color} size="sm" />, detail: words[roleVote(roleOf(u.id))] }))}
          onChange={(id) => { setUnit(id); setMk(ANY); setVote(null); }} />
        {chosen && <>
          <ChoicePicker className="coal-apart-mk" label={L('Which MK', 'איזה חבר כנסת')} value={mk}
            options={[{ value: ANY, label: L('One MK, not named', 'חבר כנסת אחד, בלי שם') }, ...mkChoices.map((c) => ({ value: c.id, label: lang === 'he' ? c.displayNameHe ?? c.nameHe : c.nameEn ?? c.displayNameHe ?? c.nameHe }))]} onChange={setMk} />
          <Seg label={L('Their vote', 'ההצבעה')} value={v} onChange={setVote} options={(['for', 'abstain', 'against'] as const).map((k) => ({ v: k, label: words[k] }))} />
          <button type="button" className="btn small primary" disabled={room <= 0 || v === listVote} onClick={add}>{L('Add', 'הוספה')}</button>
          {room <= 0 && <span className="small muted">{L('Every seat of this list is already here', 'כל המושבים של הרשימה כבר כאן')}</span>}
        </>}
      </div>
    </details>
  );
}
