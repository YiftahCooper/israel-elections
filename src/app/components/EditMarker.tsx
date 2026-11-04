import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, editPathLabel, differsFromReference, referenceValue, type EditPath } from '../derive.ts';
import { useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
export function EditMarker({ s, path }: { s: Scenario; path: EditPath }) {
  const L = useL();
  const lang = useLang();
  const reference = useStore(st => st.markOfficial ? null : st.reference);
  const ds = useStore(st => st.datasets[s.electionId]);
  const base = reference ?? (ds ? baselineOf(ds) : null);
  if (!base || !differsFromReference(s, base, path)) return null;
  const was = referenceValue(base, path);
  const label = editPathLabel(s, path, lang) + ' · ' + L('Edited: was ', 'נערך: קודם ') + (was === undefined ? L('absent', 'לא קיים') : typeof was === 'object' ? JSON.stringify(was) : String(was));
  return <span className="edit-marker" tabIndex={0} title={label} aria-label={label}>◇<span className="edit-tooltip">{label}</span></span>;
}
