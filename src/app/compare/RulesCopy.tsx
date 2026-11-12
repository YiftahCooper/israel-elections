// The Rules screen while comparing (Expert): copy the compared result's threshold, its whole rule set or its surplus
// agreements into your work. Each is one step with Undo, marked "From 2022"; rules that differ from this election's law
// switch it to experimental rules in the same step.
import type { Scenario } from '../../model/scenario.ts';
import { trimDecimal } from '../format.ts';
import { useL } from '../i18n.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { useLevel } from '../store.ts';
import { CopyOtherButton } from './CopyOtherButton.tsx';
import { useReference } from './mode.ts';

export function RulesCopy({ s }: { s: Scenario }) {
  const L = useL();
  const { expert } = useLevel();
  const state = useReference(s);
  if (!expert || state.status !== 'ready') return null;
  const ref = state.ref, where = ref.same ? ref.name : ref.year;
  const pct = trimDecimal(ref.sc.rules.thresholdPct);
  return <p className="small cmpm-rules-copy" role="group" aria-label={L(`Copy from ${where}`, `העתקה ${hebrewPrefix('מ', where)}`)}>
    <span className="ink2">{L(`Copy from ${where}:`, `העתקה ${hebrewPrefix('מ', where)}:`)}</span>{' '}
    <CopyOtherButton refr={ref} what="threshold" what_en="threshold" what_he="אחוז החסימה" text={<>{L('The threshold', 'אחוז החסימה')} <bdi dir="ltr">{pct}%</bdi></>} />{' '}
    <CopyOtherButton refr={ref} what="rules" what_en="rules" what_he="כל כללי החלוקה" text={L('All the rules', 'כל הכללים')} />{' '}
    <CopyOtherButton refr={ref} what="agreements" what_en="surplus agreements" what_he="הסכמי העודפים" text={L('Surplus agreements', 'הסכמי עודפים')} />
  </p>;
}
