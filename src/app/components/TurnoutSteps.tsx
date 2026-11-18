import type { Scenario } from '../../model/scenario.ts';
import { dispatch, getState, loadDataset, toast, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { electionLabel } from './TopBar.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
/** The turnout field's decimals. A turnout figure shown with its field on screen uses the same, so one number never
 *  shows at two precisions (owner, 16 Nov 2026, lay-turnout: "the tile reads 77.98% when the field is on screen"). */
export const TURNOUT_FIELD_DIGITS = 2;
/** "Use another election's turnout": sets this election's turnout to another election's official one. Lives in the
 *  turnout tile's window (TileEdit.tsx), beside the field. */
export function TurnoutOtherElection({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang(), index = useStore(st => st.elections);
  return <ChoicePicker label={L('Use another election’s turnout', 'שיעור ההצבעה מבחירות אחרות')} value="" options={index.filter(e => e.available).map(e => ({ value: e.id, label: electionLabel(e, index, lang), detail: e.date }))} onChange={async id => {
    try { const ds = await loadDataset(id as Scenario['electionId']); const pct = 100 * ds.totals.votesCast / ds.totals.registered; if (getState().scenario === s && pct > 0 && pct <= 100) dispatch({ type: 'setTurnout', pct }); }
    catch { toast('error', L('Could not load this turnout.', 'לא ניתן לטעון את שיעור ההצבעה.')); }
  }} />;
}
