import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, referenceChanges } from '../derive.ts';
import { useL } from '../i18n.ts';
import { changeText } from '../changeValue.tsx';
import { useStore } from '../store.ts';
import { EditMarker } from './EditMarker.tsx';
/** Each changed input has the same marker, including removed entities with no remaining field. */
export function PartEdits({ s, prefix }: { s: Scenario; prefix: string[] }) {
  const L = useL();
  const lang = useStore(st => st.lang);
  const reference = useStore(st => st.markOfficial ? null : st.reference);
  const ds = useStore(st => st.datasets[s.electionId]);
  if (!ds) return null;
  const base = reference ?? baselineOf(ds);
  if (prefix.length === 1 && prefix[0] === 'agreements') {
    const removed = base.agreements.filter(a => !s.agreements.some(x => x.id === a.id));
    return <ul className="removed-agreements">{removed.map(a => <li key={a.id}>
      {L('Removed agreement: ', 'הסכם שהוסר: ')}{changeText(base, ['agreements', a.id, 'members'], lang)}
      <EditMarker s={s} path={['agreements', a.id]} />
    </li>)}</ul>;
  }
  const paths = referenceChanges(s, reference ?? baselineOf(ds)).filter(p => prefix.every((k, i) => p[i] === k));
  return <span className="part-edits">{paths.map(p => <EditMarker key={p.join('/')} s={s} path={p} />)}</span>;
}
