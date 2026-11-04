import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, referenceChanges } from '../derive.ts';
import { useStore } from '../store.ts';
import { EditMarker } from './EditMarker.tsx';
/** Each changed input has the same marker, including removed entities with no remaining field. */
export function PartEdits({ s, prefix }: { s: Scenario; prefix: string[] }) {
  const reference = useStore(st => st.markOfficial ? null : st.reference);
  const ds = useStore(st => st.datasets[s.electionId]);
  if (!ds) return null;
  const paths = referenceChanges(s, reference ?? baselineOf(ds)).filter(p => prefix.every((k, i) => p[i] === k));
  return <span className="part-edits">{paths.map(p => <EditMarker key={p.join('/')} s={s} path={p} />)}</span>;
}
