import { NumericStepper } from './NumericStepper.tsx';
import { votesCast, type Scenario } from '../../model/scenario.ts';
import { dispatch, getState, loadDataset, toast, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { electionLabel } from './TopBar.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
export function TurnoutSteps({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang(), index = useStore(st => st.elections);
  const pct = s.registered ? 100 * votesCast(s) / s.registered : 0;
  return <div className="row">
    <NumericStepper showLabel label={L('Turnout %', 'שיעור הצבעה %')} value={pct} digits={2} min={0.01} max={100} onCommit={pct => dispatch({ type: 'setTurnout', pct })} steps={[{ id: '0.1', label: L('0.1pp', '0.1 נק׳'), amount: 0.1 }, { id: '1', label: L('1pp', 'נק׳ אחוז'), amount: 1 }]} />
    <ChoicePicker label={L('Use another election’s turnout', 'שיעור ההצבעה מבחירות אחרות')} value="" options={index.filter(e => e.available).map(e => ({ value: e.id, label: electionLabel(e, index, lang), detail: e.date }))} onChange={async id => {
      try { const ds = await loadDataset(id as Scenario['electionId']); const pct = 100 * ds.totals.votesCast / ds.totals.registered; if (getState().scenario === s && pct > 0 && pct <= 100) dispatch({ type: 'setTurnout', pct }); }
      catch { toast('error', L('Could not load this turnout.', 'לא ניתן לטעון את שיעור ההצבעה.')); }
    }} />
  </div>;
}
