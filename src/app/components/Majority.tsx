import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import type { Scenario } from '../../model/scenario.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { blocPieces, groupingLabel, majorityText } from '../derive.ts';
import { useLang } from '../i18n.ts';
export function Majority({ n, total }: { n: number; total: number }) {
  const lang = useLang();
  const consequence = majorityText(n, total, lang).split(' · ')[1];
  return <span className="majority-readout"><bdi dir="ltr">{n} / {total}</bdi> · <bdi>{consequence}</bdi></span>;
}
export function BlocMajorities({ s, r }: { s: Scenario; r: AllocationResult }) {
  const lang = useLang();
  const pieces = blocPieces(s, r);
  return <div className="majority-context small"><span className="muted" title={s.blocSchemes?.find(g => g.id === s.blocSchemeId)?.appDefined ? appGroupingExplanation(lang) : undefined}>{groupingLabel(s, lang)}</span>{s.blocs.map(b => <span key={b.id} title={b.appDefined ? appGroupingExplanation(lang) : undefined}>{groupingName(b, lang)}: <Majority n={pieces.filter(p => p.bloc === b.id).reduce((n,p) => n+p.n,0)} total={s.rules.seats} /></span>)}</div>;
}
