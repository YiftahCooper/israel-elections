import type { ElectionDataset, DemographicGroupDataset } from '../../../src/data/schema.ts';
import { validateDemographicGroups } from '../../../src/model/validateDemographicGroups.ts';
import { rawJson, verifySources } from './sources.ts';
export function buildDemographicGroups(ds:ElectionDataset):DemographicGroupDataset|null {
 if(ds.knesset<16)return null;
 const id=`groups-${ds.id}-reviewed`;
 verifySources([id],(ok:unknown,msg:string):asserts ok=>{if(!ok)throw new Error(msg);});
 const data=rawJson<DemographicGroupDataset>(`demographics/groups-${ds.id}.reviewed.json`);
 if(data.id!==ds.id||Object.entries(data.national).some(([k,v])=>ds.totals[k as keyof typeof ds.totals]!==v))throw new Error('Group national baseline mismatch');
 validateDemographicGroups(data,ds.lists.map(l=>l.id));
 const evidence=data.groups.flatMap(g=>[g.electorate,g.turnout,g.split,...(g.invalidRate?[g.invalidRate]:[])].flatMap(m=>m.evidence?[m.evidence.sourceId]:[]));
 verifySources([...new Set(evidence)],(ok:unknown,msg:string):asserts ok=>{if(!ok)throw new Error(msg);});
 return data;
}
