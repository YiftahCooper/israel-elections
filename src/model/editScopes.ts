/** Appearance is saved separately from factual marker comparisons. */
export const appearancePath=(p:readonly string[])=>(p.includes('color')||p.includes('customColor'))||p[0]==='blocs'&&p.length>2&&['nameHe','nameEn'].includes(p[2]);
import { blocSchemeState, type Action, type Scenario } from './scenario.ts';
import type {Part} from './parts.ts';
export type InputPath=readonly string[];
export interface ReplacementScope {part:Part;listId?:string;checkpoint:Scenario;changed:InputPath[];at:number}
/** Derived UI provenance, not simulation inputs. Key by log so save/rename spreads retain it.
 * Replay reconstructs it; checkpoints have no log, preventing chains of old scenarios. */
const scopes=new WeakMap<Scenario['log'],ReplacementScope[]>();
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export const inputPart=(p:InputPath):Part|undefined=>{
 if(p[0]==='parts')return p[1] as Part;
 if(p[0]==='lists')return p[2]==='bloc'?'blocs':p[2]==='votes'?'votes':p[2]==='candidates'||p[2]==='rosterUnavailable'||p[2]==='rosterTruncated'?'candidates':['withdrawn','heldVotes','originIds'].includes(p[2])?'structure':'identity';
 if(['familyDefinition','blocs','customGroupingName','blocSchemeId','partyBlocs','candidateBlocs'].includes(p[0]))return 'blocs';
 if(['rules','mode','lotteryWinners'].includes(p[0]))return 'rules';
 if(['registered','invalid'].includes(p[0]))return 'totals';
 if(p[0]==='coalition')return 'coalitions';
 if(p[0]==='factionSplits')return 'structure';
 if(p[0]==='agreements')return 'agreements';
};
export const overlaps=(a:InputPath,b:InputPath)=>a.every((k,i)=>b[i]===k)||b.every((k,i)=>a[i]===k);
export function inputDiffs(a:Scenario,b:Scenario):InputPath[]{
 // Compare sourced views using the same sourced scheme. A detached/custom grouping is
 // compared to the last sourced choice before its membership edit, never erased.
 if (b.blocSchemeId && a.electionId === b.electionId && a.blocSchemeId !== b.blocSchemeId) {
  const choice = a.blocSchemeId ?? [...a.log].reverse().map(e=>e.action).find(x=>x.type==='applyBlocScheme'||x.type==='startPart'&&x.part==='blocs'&&(x.source==='preset'||!!x.snapshot?.blocSchemeId));
  const id = typeof choice === 'string' ? choice : choice?.type==='applyBlocScheme' ? choice.schemeId : choice?.type==='startPart' ? choice.presetId??choice.snapshot?.blocSchemeId : undefined;
  const scheme = b.blocSchemes?.find(g=>g.id===id);
  if (scheme) {
   const st=blocSchemeState(scheme,b.lists);
   b={...b,blocSchemeId:scheme.id,blocs:st.blocs,partyBlocs:st.partyBlocs,candidateBlocs:st.candidateBlocs,customGroupingName:undefined,lists:b.lists.map(l=>({...l,bloc:st.listBloc[l.id]}))};
  }
 }
 const out:string[][]=[];
 const walk=(x:any,y:any,p:string[])=>{
  if(equal(x,y))return;
  if(p.at(-1)==='candidates'&&Array.isArray(x)&&Array.isArray(y)&&x.map(c=>c.id).join()!==y.map(c=>c.id).join()){out.push(p);return;}
  if(Array.isArray(x)&&Array.isArray(y)&&[...x,...y].every(z=>z&&typeof z==='object'&&'id'in z)){
   for(const id of new Set([...x,...y].map(z=>z.id)))walk(x.find(z=>z.id===id),y.find(z=>z.id===id),[...p,id]);
  }else if(x&&y&&!Array.isArray(x)&&!Array.isArray(y)&&typeof x==='object'&&typeof y==='object'){
   for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],[...p,k]);
  }else if(!appearancePath(p)) out.push(p);
 };
 for(const k of ['lists','rules','registered','invalid','agreements','blocs','blocSchemeId','customGroupingName','partyBlocs','candidateBlocs','lotteryWinners','mode','coalition','familyDefinition'] as const){
  const normal=(v:unknown)=>v??(k==='coalition'?{in:[],out:[]}:k==='partyBlocs'||k==='candidateBlocs'?{}:undefined);
  walk(normal(a[k]),normal(b[k]),[k]);
 }
 return out;
}
export function replacementFor(a:Action):{part:Part;listId?:string}|undefined {
 if(a.type==='startPart')return {part:a.part,...(a.listId?{listId:a.listId}:{})};
 if(a.type==='familyOperation'&&a.operation==='group'||a.type==='applyBlocScheme')return {part:'blocs'};
 if(a.type==='restore')return {part:a.what==='totals'?'totals':a.what==='lottery'?'rules':a.what};
}
export function recordEditScope(before:Scenario,after:Scenario,action:Action){
 const inherited=scopes.get(before.log)??[],scope=replacementFor(action);
 if(!scope){if(inherited.length)scopes.set(after.log,inherited);return;}
 const retained=inherited.filter(x=>x.part!==scope.part||!!scope.listId&&x.listId!==scope.listId);
 scopes.set(after.log,[...retained,{...scope,checkpoint:{...after,log:[]},changed:inputDiffs(after,before),at:after.log.length-1}]);
}
export const replacementScopes=(s:Scenario)=>scopes.get(s.log)??[];
export function scopeCovers(scope:ReplacementScope,path:InputPath){
 return (inputPart(path)===scope.part&&(!scope.listId||path[0]==='lists'&&path[1]===scope.listId))||scope.changed.some(p=>overlaps(p,path));
}

/** B changes have shared local markers, but never describe a different election result. */
export const analysisPart=(p:InputPath):'blocs'|'coalitions'|undefined => {
 const part=inputPart(p);
 return part==='blocs'||part==='coalitions'?part:undefined;
};
export const resultDiffs=(a:Scenario,b:Scenario)=>inputDiffs(a,b).filter(p=>!analysisPart(p));
