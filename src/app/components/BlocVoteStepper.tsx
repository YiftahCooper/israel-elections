import { SeatDelta, SeatEffects } from './SeatDelta.tsx';
import { useState } from 'react';
import { allocate } from '../../engine/allocate.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { applyAction, apportion } from '../../model/actions.ts';
import { toEngineInput, type Action, type Scenario } from '../../model/scenario.ts';
import { dispatchMany, useVoteSource, withSource } from '../store.ts';
import { stayingHome, type SourceChoice } from '../voteEdit.ts';
import { listLabel } from '../derive.ts';
import { fmtInt } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { NumericStepper } from './NumericStepper.tsx';
export function BlocVoteStepper({ s, r, bloc }: { s: Scenario; r: AllocationResult; bloc: string | null }) {
  const L = useL(), lang = useLang(), src = useVoteSource();
  const [effect, setEffect] = useState<import('react').ReactNode>('');
  const members = s.lists.filter(l => !l.withdrawn && l.bloc === bloc), ids = new Set(members.map(l => l.id));
  const total = members.reduce((t, l) => t + l.votes, 0);
  // the plan for a target under a vote source: the dialog may answer a different source than the one shown
  const plan = (from: SourceChoice) => {
    const outside = s.lists.filter(l => !l.withdrawn && !ids.has(l.id) && (from.kind !== 'transfer' || l.id === from.listId));
    const pool = outside.reduce((t, l) => t + l.votes, 0);
    const possible = from.kind === 'new' || (from.kind === 'transfer' ? outside.length > 0 : pool > 0);
    const max = !total || !possible ? total : from.kind === 'new' ? total + stayingHome(s) : total + pool;
    const actionsFor = (target: number): Action[] => {
      const delta = Math.round(target) - total;
      if (!total || !delta || !possible) return [];
      if (from.kind === 'new') return apportion(Math.round(target), members.map(l => l.votes)).map((votes, i) => ({ type: 'setVotes', listId: members[i].id, votes }));
      return [{ type: 'redistribute', from: (delta > 0 ? outside : members).map(l => l.id), to: (delta > 0 ? members : outside).map(l => ({ listId: l.id, share: from.kind === 'transfer' && delta < 0 ? 1 : l.votes })), votes: Math.abs(delta) }];
    };
    return { outside, pool, possible, max, actionsFor };
  };
  const { possible, actionsFor } = plan(src);
  const { max } = plan(src);
  // A typed amount skips the nudge buttons' limits, so say here why it cannot apply rather than surface the model's
  // generic "selected lists" error.
  const refusal = (target: number, { outside, pool, possible, max } = plan(src), from = src) => !total ? L('No list in this bloc has votes to change', 'לאף רשימה בגוש אין קולות לשנות')
    : !possible ? L('No other list has votes to move here', 'לאף רשימה אחרת אין קולות להעביר לכאן')
    : target > max ? (from.kind === 'new' ? L(`At most ${fmtInt(max)}: ${fmtInt(max - total)} voters stayed home`, `לכל היותר ${fmtInt(max)}: ${fmtInt(max - total)} בעלי זכות לא הצביעו`)
      : from.kind === 'transfer' && outside[0] ? L(`At most ${fmtInt(max)}: ${listLabel(outside[0], lang)} holds ${fmtInt(pool)} votes`, `לכל היותר ${fmtInt(max)}: ל${listLabel(outside[0], lang)} ${fmtInt(pool)} קולות`)
      : L(`At most ${fmtInt(max)}: the other lists hold ${fmtInt(pool)} votes`, `לכל היותר ${fmtInt(max)}: לשאר הרשימות ${fmtInt(pool)} קולות`)) : '';
  return <div className="bloc-vote-stepper"><NumericStepper showLabel label={L('Lists’ votes', 'קולות הרשימות')} value={total} min={possible ? 0 : total} max={max}
    steps={[{ id: '1k', label: '1k', amount: 1000 }, { id: '1%', label: '1%', amount: total / 100 }, { id: '10%', label: '10%', amount: total / 10 }]}
    targetForStep={(step, dir) => Math.max(0, Math.round(total + dir * step.amount))}
    onCommit={target => withSource(`bloc:${bloc}`, L('Lists’ votes', 'קולות הרשימות'), [...ids], (from) => { const p = plan(from); const why = refusal(target, p, from); if (why) { setEffect(why); return; } dispatchMany(p.actionsFor(target)); setEffect(''); })} onPreview={target => {
      const next = allocate(toEngineInput(actionsFor(target).reduce((cur, a) => applyAction(cur, a), s)));
      setEffect(<SeatEffects>{next.lists.map(x => ({ id: x.id, d: x.seats - (r.lists.find(y => y.id === x.id)?.seats ?? 0) })).filter(x => x.d).map(x => <span key={x.id}>{listLabel(s.lists.find(l => l.id === x.id)!, lang)} <SeatDelta value={x.d} /> </span>)}</SeatEffects>);
    }} /><p className="tiny" aria-live="polite">{effect}</p></div>;
}
