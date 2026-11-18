import {expect,test} from 'vitest';
import {builtins,historyElections} from '../src/families/runtime.ts';
import {familyEstimate} from '../src/families/seatBars.ts';
import type {Family} from '../src/families/model.ts';

// Party families vote chart, Design 2 (19 Nov 2026): the solid line is an estimate by seats, the dashed line counts
// mixed lists whole, and the real figure lies between them.
const by=(id:string)=>builtins.find(f=>f.id===id)!;
const votes=(e:string,list:string)=>historyElections.find(d=>d.id===e)!.lists.find(l=>l.id===list)!.votes;

test('a mixed list adds its votes in proportion to the family’s own elected members',()=>{
 // 2013: Likud won 20 of Likud Yisrael Beiteinu's 31 seats
 const v=familyEstimate(by('herut-likud'),'k19')!;
 expect(v.low).toBe(0);expect(v.high).toBe(votes('k19','19-מחל'));expect(v.estimate).toBeCloseTo(votes('k19','19-מחל')*20/31,6);
 // 1999, Religious Zionist family: 1 of One Israel's 26 seats and 1 of National Union's 4, on top of its whole lists
 const rz=familyEstimate(by('national-religious'),'k15')!,valid=historyElections.find(d=>d.id==='k15')!.totals.valid;
 expect(+(rz.low*100/valid).toFixed(2)).toBe(4.24);expect(+(rz.estimate*100/valid).toFixed(1)).toBe(5.8);expect(+(rz.high*100/valid).toFixed(1)).toBe(27.5);
});
test('a mixed list that won no seat adds nothing to the estimate, but counts on the dashed line',()=>{
 // 2015: Yachad missed the threshold
 const v=familyEstimate(by('haredi'),'k20')!;
 expect(v.estimate).toBe(v.low);expect(v.high-v.low).toBe(votes('k20','20-קץ'));
});
test('the line follows the mixed-list policy',()=>{
 const likud=by('herut-likud'),all:Family={...likud,defaultMixedPolicy:'include-whole-list'},out:Family={...likud,defaultMixedPolicy:'exclude'};
 const whole=familyEstimate(all,'k19')!;expect(whole.estimate).toBe(whole.high);expect(whole.low).toBe(whole.high);
 const left=familyEstimate(out,'k19')!;expect(left).toEqual({estimate:0,low:0,high:0});
});
test('every election of every built-in family: low ≤ estimate ≤ high',()=>{
 for(const f of builtins)for(const e of historyElections){const v=familyEstimate(f,e.id);if(!v)continue;
  expect(v.low).toBeLessThanOrEqual(v.estimate+1e-9);expect(v.estimate).toBeLessThanOrEqual(v.high+1e-9);}
});
