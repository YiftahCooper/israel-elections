import {PART_MARKER_SURFACES,type Part} from '../../model/parts.ts';
import { useActiveReference } from '../useActiveReference.ts';
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
  const { reference } = useActiveReference();
  const ds = useStore(st => st.datasets[s.electionId]);
  if (!ds) return null;
  const base = reference ?? baselineOf(ds);
  const changes=referenceChanges(s,base);
  if (prefix.length === 1 && prefix[0] === 'agreements') {
    const removed = base.agreements.filter(a => !s.agreements.some(x => x.id === a.id)&&changes.some(p=>p[0]==='agreements'&&p[1]===a.id));
    return <ul className="removed-agreements">{removed.map(a => <li key={a.id}>
      {L('Removed agreement: ', 'הסכם שהוסר: ')}{changeText(base, ['agreements', a.id, 'members'], lang)}
      <EditMarker summary s={s} path={['agreements', a.id]} />
    </li>)}</ul>;
  }
  const paths = changes.filter(p => prefix[0]==='parts' ? p[0]==='parts'&&PART_MARKER_SURFACES[p[1] as Part]===prefix[1] : prefix.every((k, i) => p[i] === k)||(prefix.length===1&&p[0]==='parts'&&p[1]===prefix[0]));
  return <span className="part-edits">{paths.map(p => <EditMarker summary key={p.join('/')} s={s} path={p} />)}</span>;
}
