import type {Scenario} from '../../model/scenario.ts';
import {analysisPart} from '../../model/editScopes.ts';
import {baselineOf,referenceChanges} from '../derive.ts';
import {useStore} from '../store.ts';
import {useActiveReference} from '../useActiveReference.ts';
import {EditMarker} from './EditMarker.tsx';

/** The shared marker at a grouping or coalition panel: its changes are counted like any other, and
 *  this places their marker where the grouping is shown (picker, bands, panel, Compare). */
export function AnalysisEdits({s,part='blocs',outlet}:{s:Scenario;part?:'blocs'|'coalitions';outlet:string}) {
 const {markerReference}=useActiveReference();
 const ds=useStore(st=>st.datasets[s.electionId]);
 const base=markerReference??(ds?baselineOf(ds):null);
 const path=base&&referenceChanges(s,base).find(p=>analysisPart(p)===part);
 return path?<span className="analysis-edits" data-analysis-part={part}><EditMarker s={s} path={path} summary outlet={outlet}/></span>:null;
}
