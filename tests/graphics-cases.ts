import { groupingAction, parseFamily } from '../src/families/model.ts';
import { readFileSync } from 'node:fs';
import { scenarioFromDataset, type Action } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { allocationOf } from '../src/app/derive.ts';
export const dataset = (n:number) => JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8'));
const ds = dataset(25), original = scenarioFromDataset(ds);
const id = (name:string) => original.lists.find(l=>l.shortEn===name)!.id;
const votes = (listId:string,votes:number):Action => ({type:'setVotes',listId,votes});
const small = original.lists.filter(l=>!l.withdrawn && l.votes>0 && l.votes<100000).slice(0,3);
const early = scenarioFromDataset(dataset(12));
const haredi = parseFamily(readFileSync('data/meta/families/haredi.json','utf8'));
const firstFamily = groupingAction(haredi,early,'en');
const groupedEarly = applyAction(early,firstFamily);
export const graphicsCases: {name:string;n:number;actions:Action[]}[] = [
  {name:'owner',n:25,actions:[votes(id('Meretz'),160000),votes(id('Balad'),190000)]},
  {name:'many-qualifying',n:25,actions:[votes(id('Meretz'),250000),votes(id('Balad'),250000),...small.map(l=>votes(l.id,250000))]},
  {name:'blank',n:25,actions:[{type:'startPart',part:'blocs',source:'blank',name:'Blank grouping'}]},
  {name:'unassigned',n:25,actions:[{type:'setListMeta',listId:id('Likud'),patch:{bloc:null}}]},
  {name:'one-seat',n:25,actions:[{type:'setMode',mode:'experimental'},{type:'setRules',patch:{thresholdPct:'0'}},votes(id('Meretz'),40000)]},
  {name:'dominant',n:25,actions:[votes(id('Likud'),9000000)]},
  {name:'merge',n:25,actions:[{type:'merge',ids:[id('Labor'),id('Meretz')],newId:'merged',nameHe:'רשימה מאוחדת',letters:'אב',color:'#567890',retentionPct:100,candidateOrder:'concat',nonRetained:'abstain'}]},
  {name:'split',n:25,actions:[{type:'split',id:id('Likud'),parts:[{newId:'a',nameHe:'חלק ראשון',letters:'א',color:'#1f5aa5',votes:600000,candidateIds:[]},{newId:'b',nameHe:'חלק שני',letters:'ב',color:'#467890',votes:515336,candidateIds:[]}]}]},
  {name:'small-first-bloc-1988',n:12,actions:[firstFamily]},
  {name:'small-last-bloc-1988',n:12,actions:[firstFamily,{type:'setBlocs',blocs:[...groupedEarly.blocs].reverse()}]},
  {name:'1949',n:1,actions:[]},
  {name:'long-names',n:25,actions:original.lists.map(l=>({type:'setListMeta',listId:l.id,patch:{shortHe:'שם רשימה ארוך מאוד לבדיקת שבירת שורות ללא חפיפות',shortEn:'A very long list name to verify wrapping without overlap'}}))},
];
export function graphicScenario(n:number,actions:Action[]) {
  const base=scenarioFromDataset(dataset(n));
  const s=actions.reduce((s,a)=>applyAction(s,a,undefined,{base}),base);
  return {base,s,r:allocationOf(s)};
}
