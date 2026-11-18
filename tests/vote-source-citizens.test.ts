import {expect,test} from 'vitest';
import {readFileSync} from 'node:fs';
import {builtins} from '../src/families/runtime.ts';
import {scaleAction} from '../src/families/model.ts';
import {applyAction} from '../src/model/actions.ts';
import {scenarioFromDataset,votesCast} from '../src/model/scenario.ts';
import {deltaAction,maxGain,stayingHome} from '../src/app/voteEdit.ts';
import type {ElectionDataset} from '../src/data/schema.ts';

// 19 Nov 2026: "New voters" means people who stayed home on every screen (eligible voters unchanged, turnout rises);
// "New citizens" is its own choice: people added to the country, so eligible voters rise by the same number.
const s=scenarioFromDataset(JSON.parse(readFileSync('public/data/k25.json','utf8')) as ElectionDataset);
const haredi=builtins.find(f=>f.id==='haredi')!;
const turnout=(x:typeof s)=>(votesCast(x)*100/x.registered).toFixed(2);

test('Party families: people who stayed home leave eligible voters unchanged, as on the Overview',()=>{
 const a=scaleAction(haredi,s,'multiplier','10',{kind:'new'});expect(a.registeredDelta).toBe(0);
 const after=applyAction(s,a);expect(after.registered).toBe(6788804);expect(votesCast(after)).toBe(4861909);expect(turnout(after)).toBe('71.62');
});
test('Party families: new citizens raise eligible voters by the votes they add',()=>{
 const a=scaleAction(haredi,s,'multiplier','10',{kind:'citizens'});
 const after=applyAction(s,a);expect(after.registered).toBe(6856120);expect(votesCast(after)).toBe(4861909);expect(turnout(after)).toBe('70.91');
});
test('people who stayed home are capped at those who stayed home; new citizens are not',()=>{
 expect(()=>scaleAction(haredi,s,'multiplier','500',{kind:'new'})).toThrow('home');
 expect(()=>scaleAction(haredi,s,'multiplier','500',{kind:'citizens'})).not.toThrow();
});
test('a list edit with new citizens changes eligible voters by the same number, both ways',()=>{
 const l=s.lists[0];
 const up=applyAction(s,deltaAction(s,l,50000,{kind:'citizens'})!);expect(up.registered).toBe(s.registered+50000);expect(up.lists[0].votes).toBe(l.votes+50000);
 const down=applyAction(s,deltaAction(s,l,-50000,{kind:'citizens'})!);expect(down.registered).toBe(s.registered-50000);
 const home=applyAction(s,deltaAction(s,l,50000,{kind:'new'})!);expect(home.registered).toBe(s.registered);
 expect(maxGain(s,l,{kind:'new'})).toBe(stayingHome(s));expect(maxGain(s,l,{kind:'citizens'})).toBeGreaterThan(stayingHome(s));
});
