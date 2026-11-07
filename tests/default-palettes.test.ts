import{readFileSync,readdirSync}from'node:fs';
import{groupingAction,parseFamily}from'../src/families/model.ts';
import{applyAction}from'../src/model/actions.ts';
import {expect,test} from 'vitest';
import {deltaE2000,blocTints,noBlocTints} from '../src/data/colour.ts';
import {FAMILY_COLOURS} from '../src/families/colors.ts';
import {SCENARIO_PALETTE} from '../src/model/scenarioColors.ts';
import {graphicScenario} from './graphics-cases.ts';
function distinct(colors:string[],min:number, label:string) {
 colors.forEach((a,i)=>colors.slice(i+1).forEach(b=>expect(deltaE2000(a,b),`${label}: ${a} / ${b}`).toBeGreaterThanOrEqual(min)));
}
test('co-displayed default identities differ perceptually in both themes',()=>{
 // Identity fills are opaque and identical in both themes; bloc tints also depend on the theme.
 for(const theme of [0,1]) {
 distinct(Object.values(FAMILY_COLOURS),20,`families ${theme}`);
 distinct([...SCENARIO_PALETTE],20,`scenarios ${theme}`);
 for(let n=1;n<=26;n++) for(const scheme of graphicScenario(n,[]).base.blocSchemes??[]) {
 distinct(scheme.blocs.map(b=>b.color),20,`k${n} ${scheme.id} fills`);
 distinct(scheme.blocs.map(b=>blocTints(b.color)[theme]),8-0.05,`k${n} ${scheme.id} tint ${theme}`);
 }
 }
});

test('family-generated grouping identities and region tints use the same guard',()=>{
 const bases=Array.from({length:26},(_,i)=>graphicScenario(i+1,[]).s);
 for(const file of readdirSync('data/meta/families'))if(file.endsWith('.json')){
  const family=parseFamily(readFileSync(`data/meta/families/${file}`,'utf8'));
  for(let n=1;n<=26;n++){
   const s=bases[n-1],grouped=applyAction(s,groupingAction(family,s,'en'));
   distinct(grouped.blocs.map(b=>b.color),20,`${family.id} k${n} identities`);
   for(const theme of [0,1])distinct([noBlocTints()[theme],...grouped.blocs.map(b=>blocTints(b.color)[theme])],8,`${family.id} k${n} tints`);
  }
 }
},30000);
