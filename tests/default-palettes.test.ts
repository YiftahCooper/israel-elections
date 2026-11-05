import {expect,test} from 'vitest';
import {deltaE2000,blocTints} from '../src/data/colour.ts';
import {FAMILY_COLOURS} from '../src/families/colors.ts';
import {SCENARIO_PALETTE} from '../src/model/scenarioColors.ts';
import {graphicScenario} from './graphics-cases.ts';
function distinct(colors:string[],min:number, label:string) {
 colors.forEach((a,i)=>colors.slice(i+1).forEach(b=>expect(deltaE2000(a,b),`${label}: ${a} / ${b}`).toBeGreaterThanOrEqual(min)));
}
test('co-displayed default identities differ perceptually in both themes',()=>{
 // Identity fills are opaque and identical in both themes; bloc tints also depend on the theme.
 for(const theme of [0,1]) {
 distinct(Object.values(FAMILY_COLOURS),15,`families ${theme}`);
 distinct([...SCENARIO_PALETTE],15,`scenarios ${theme}`);
 for(let n=1;n<=26;n++) for(const scheme of graphicScenario(n,[]).base.blocSchemes??[]) {
 distinct(scheme.blocs.map(b=>b.color),scheme.blocs.length<=3?30:20,`k${n} ${scheme.id} fills`);
 distinct(scheme.blocs.map(b=>blocTints(b.color)[theme]),8-0.05,`k${n} ${scheme.id} tint ${theme}`);
 }
 }
});
