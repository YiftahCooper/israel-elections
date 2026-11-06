import {analysisPart} from '../../model/editScopes.ts';
import {PART_MARKER_SURFACES,type Part} from '../../model/parts.ts';
import { useActiveReference } from '../useActiveReference.ts';
import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, referenceChanges, type EditPath } from '../derive.ts';
import { useL } from '../i18n.ts';
import { changeText } from '../changeValue.tsx';
import { useStore } from '../store.ts';
import { EditMarker } from './EditMarker.tsx';
/** Each changed input has the same marker, including removed entities with no remaining field.
 *  `single` marks a summary row once however many of its inputs changed (the opened item marks each field). */
export function PartEdits({ s, prefix, single = false }: { s: Scenario; prefix: string[]; single?: boolean }) {
  const L = useL();
  const lang = useStore(st => st.lang);
  const { markerReference: reference } = useActiveReference();
  const committed = useStore(st => st.scenario);
  const preview = useStore(st => st.preview);
  if (s === preview && committed) s = committed;
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
  // a withdrawn list's held ballots are the withdrawal itself, already marked at its switch: not a second, unlabelled mark
  const implied = (p: EditPath) => p[0] === 'lists' && p[2] === 'heldVotes' && changes.some(q => q[0] === 'lists' && q[1] === p[1] && q[2] === 'withdrawn');
  const paths = changes.filter(p => !implied(p)&&!(prefix[0]==='lists'&&analysisPart(p))).filter(p => prefix[0]==='parts' ? p[0]==='parts'&&PART_MARKER_SURFACES[p[1] as Part]===prefix[1] : prefix.every((k, i) => p[i] === k)||(prefix.length===1&&p[0]==='parts'&&p[1]===prefix[0]));
  // the most telling change first: a withdrawal or new identity says more than the vote count it implies
  const rank = (p: EditPath) => ['withdrawn', 'votes'].indexOf(p[2] ?? '') + 1 || 3;
  const shown = single ? [...paths].sort((a, b) => rank(a) - rank(b)).slice(0, 1) : paths;
  return <span className="part-edits">{shown.map(p => <EditMarker summary key={p.join('/')} s={s} path={p} />)}</span>;
}
