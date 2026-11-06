import { expect, test } from 'vitest';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
import { syntheticIconSvg } from '../src/app/syntheticIcon.ts';
test('mergers retain constituent identities, including repeated merges', () => {
 const s = scenarioFromDataset(loadDataset('k25')), [a,b,c] = s.lists;
 const merge = (ids:string[], newId:string) => ({type:'merge' as const,ids,newId,nameHe:'Merged',letters:a.letters,color:a.color,retentionPct:100,candidateOrder:'concat' as const,nonRetained:'abstain' as const});
 const m = applyAction(s,merge([a.id,b.id],'sim-m'));
 expect(validateScenario(JSON.parse(JSON.stringify(m)))).toEqual([]);
 expect(m.lists.find(l=>l.id==='sim-m')?.synthetic?.parts.map(p=>p.letters)).toEqual([a.letters,b.letters]);
 const n=applyAction(m,merge(['sim-m',c.id],'sim-n')).lists.find(l=>l.id==='sim-n')!;
 expect(n.synthetic?.parts).toHaveLength(3);
 expect(syntheticIconSvg(n)).toContain('data-kind="merge"');
 expect(n.logo).toBeUndefined();
});
test('splits mark the part and new lists never derive letters from a Latin name',()=>{
 const s=scenarioFromDataset(loadDataset('k25')), a=s.lists[0];
 const split=applyAction(s,{type:'split',id:a.id,parts:[0,1].map(i=>({newId:`sim-${i}`,nameHe:`Part ${i}`,letters:a.letters,color:a.color,votes:i?a.votes:0,candidateIds:[]}))});
 expect(split.lists[0].synthetic).toMatchObject({kind:'split',part:1,total:2,parts:[{letters:a.letters}]});
 const added=applyAction(s,{type:'addList',newId:'sim-new',nameHe:'A new list',letters:'אב',color:'#ffffff',votes:0}).lists.at(-1)!;
 expect(syntheticIconSvg(added)).toContain('אב');
 expect(syntheticIconSvg({...added,letters:''})).toContain('+');
 expect(syntheticIconSvg({...added,letters:'<script>'})).not.toContain('<script>');
 expect(syntheticIconSvg(a)).toBeNull();
});
test('letter ink stays above AA contrast independently of party colour',()=>{
 const svg=syntheticIconSvg({letters:'אב',color:'#ffffff',synthetic:{kind:'new',parts:[]}})!;
 expect(svg).toContain('fill="#fff"'); expect(svg).toContain('fill="#111"');
 const channel=17/255, linear=channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4;
 expect(1.05/(linear+0.05)).toBeGreaterThan(7);
});
