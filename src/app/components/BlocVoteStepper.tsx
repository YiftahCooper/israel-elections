import { useState } from 'react';
import { allocate } from '../../engine/allocate.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { applyAction, apportion } from '../../model/actions.ts';
import { toEngineInput, type Action, type Scenario } from '../../model/scenario.ts';
import { dispatchMany, useVoteSource } from '../store.ts';
import { listLabel } from '../derive.ts';
import { signed } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { NumericStepper } from './NumericStepper.tsx';
export function BlocVoteStepper({ s, r, bloc }: { s: Scenario; r: AllocationResult; bloc: string | null }) {
  const L = useL(), lang = useLang(), src = useVoteSource();
  const [effect, setEffect] = useState('');
  const members = s.lists.filter(l => !l.withdrawn && l.bloc === bloc), ids = new Set(members.map(l => l.id));
  const total = members.reduce((t, l) => t + l.votes, 0);
  const outside = s.lists.filter(l => !l.withdrawn && !ids.has(l.id) && (src.kind !== 'transfer' || l.id === src.listId));
  const pool = outside.reduce((t, l) => t + l.votes, 0);
  const possible = src.kind === 'new' || (src.kind === 'transfer' ? outside.length > 0 : pool > 0);
  const actionsFor = (target: number): Action[] => {
    const delta = Math.round(target) - total;
    if (!total || !delta || !possible) return [];
    if (src.kind === 'new') return apportion(Math.round(target), members.map(l => l.votes)).map((votes, i) => ({ type: 'setVotes', listId: members[i].id, votes }));
    return [{ type: 'redistribute', from: (delta > 0 ? outside : members).map(l => l.id), to: (delta > 0 ? members : outside).map(l => ({ listId: l.id, share: src.kind === 'transfer' && delta < 0 ? 1 : l.votes })), votes: Math.abs(delta) }];
  };
  return <div className="bloc-vote-stepper"><NumericStepper showLabel label={L('Lists’ votes', 'קולות הרשימות')} value={total} min={possible ? 0 : total} max={!total || !possible ? total : src.kind === 'new' ? Number.MAX_SAFE_INTEGER : total + pool}
    steps={[{ id: '1', label: '1', amount: 1 }, { id: '1k', label: '1k', amount: 1000 }, { id: '1%', label: '1%', amount: total / 100 }, { id: '10%', label: '10%', amount: total / 10 }]}
    targetForStep={(step, dir) => Math.max(0, Math.round(total + dir * step.amount))}
    onCommit={target => { dispatchMany(actionsFor(target)); setEffect(''); }} onPreview={target => {
      const next = allocate(toEngineInput(actionsFor(target).reduce((cur, a) => applyAction(cur, a), s)));
      setEffect(next.lists.map(x => ({ id: x.id, d: x.seats - (r.lists.find(y => y.id === x.id)?.seats ?? 0) })).filter(x => x.d).map(x => `${listLabel(s.lists.find(l => l.id === x.id)!, lang)} ${signed(x.d)}`).join(' · ') || L('Seats unchanged', 'המנדטים ללא שינוי'));
    }} /><p className="tiny" aria-live="polite">{effect}</p></div>;
}
