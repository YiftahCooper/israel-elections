import type {Action,Scenario} from './scenario.ts';
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
 if(['blocs','customGroupingName','blocSchemeId','partyBlocs','candidateBlocs'].includes(p[0]))return 'blocs';
 if(['rules','mode','lotteryWinners'].includes(p[0]))return 'rules';
 if(['registered','invalid'].includes(p[0]))return 'totals';
 if(p[0]==='coalition')return 'coalitions';
 if(p[0]==='factionSplits')return 'structure';
 if(p[0]==='agreements')return 'agreements';
};
export const overlaps=(a:InputPath,b:InputPath)=>a.every((k,i)=>b[i]===k)||b.every((k,i)=>a[i]===k);
export function inputDiffs(a:Scenario,b:Scenario):InputPath[]{
 const out:string[][]=[];
 const walk=(x:any,y:any,p:string[])=>{
  if(equal(x,y))return;
  if(p.at(-1)==='candidates'&&Array.isArray(x)&&Array.isArray(y)&&x.map(c=>c.id).join()!==y.map(c=>c.id).join()){out.push(p);return;}
  if(Array.isArray(x)&&Array.isArray(y)&&[...x,...y].every(z=>z&&typeof z==='object'&&'id'in z)){
   for(const id of new Set([...x,...y].map(z=>z.id)))walk(x.find(z=>z.id===id),y.find(z=>z.id===id),[...p,id]);
  }else if(x&&y&&!Array.isArray(x)&&!Array.isArray(y)&&typeof x==='object'&&typeof y==='object'){
   for(const k of new Set([...Object.keys(x),...Object.keys(y)]))walk(x[k],y[k],[...p,k]);
  }else out.push(p);
 };
 for(const k of ['description','lists','rules','registered','invalid','agreements','blocs','blocSchemeId','customGroupingName','partyBlocs','candidateBlocs','factionSplits','lotteryWinners','mode','coalition'] as const){
  const normal=(v:unknown)=>k==='factionSplits'?[...((v??[]) as string[])].sort():v??(k==='coalition'?{in:[],out:[]}:k==='partyBlocs'||k==='candidateBlocs'?{}:undefined);
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
