import type {Scenario} from '../../model/scenario.ts';
import {analysisPart} from '../../model/editScopes.ts';
import {baselineOf,referenceChanges} from '../derive.ts';
import {useStore} from '../store.ts';
import {useActiveReference} from '../useActiveReference.ts';
import {EditMarker} from './EditMarker.tsx';

/** A local outlet for the shared marker: analysis never belongs in the result summary. */
export function AnalysisEdits({s,part='blocs',outlet}:{s:Scenario;part?:'blocs'|'coalitions';outlet:string}) {
 const {markerReference}=useActiveReference();
 const ds=useStore(st=>st.datasets[s.electionId]);
 const base=markerReference??(ds?baselineOf(ds):null);
 const path=base&&referenceChanges(s,base).find(p=>analysisPart(p)===part);
 return path?<span className="analysis-edits" data-analysis-part={part}><EditMarker s={s} path={path} summary outlet={outlet}/></span>:null;
}
