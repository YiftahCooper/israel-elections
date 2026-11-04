import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import haredi from '../data/meta/families/haredi.json';
import centre from '../data/meta/families/centre.json';
import likud from '../data/meta/families/herut-likud.json';
import { aggregate, parseFamily, scaleAction } from '../src/families/model.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { FAMILY_COLOURS, familyColor } from '../src/families/colors.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
const ds=(n:number)=>JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8')) as ElectionDataset;
const H=parseFamily(JSON.stringify(haredi)),C=parseFamily(JSON.stringify(centre)),K=parseFamily(JSON.stringify(likud));

test('lists left out are "not counted", never "did not contest"',()=>{
  // Centre names only contested lists in 2026.
  expect(aggregate(C,ds(26)).status).toBe('not-counted');
  // Likud lineage's 2026 list is mixed: excluding mixed lists is not absence, and the excluded votes stay visible.
  const x=aggregate({...K,defaultMixedPolicy:'exclude'},ds(26));
  expect(x.status).toBe('not-counted');expect(x.excluded).toBeGreaterThan(1_000_000n);
  // Separate keeps a zero whole-list value next to the mixed votes.
  const sep=aggregate(K,ds(26));expect(sep.status).toBe('observed');expect(sep.votes).toBe(0n);expect(sep.mixed).toBe(x.excluded);
});

test('a family can be scaled down, to zero at most, and never to a negative share',()=>{
  const s=scenarioFromDataset(ds(25)),src={kind:'proportional'} as const;
  const down=scaleAction(H,s,'multiplier','-10',src);expect(down.target).toBe(605842);
  const after=applyAction(s,down);expect(after.lists.reduce((n,l)=>n+l.votes,0)).toBe(s.lists.reduce((n,l)=>n+l.votes,0));
  expect(scaleAction(H,s,'multiplier','-100',src).target).toBe(0);
  expect(()=>scaleAction(H,s,'multiplier','-100.5',src)).toThrow();
  expect(()=>scaleAction(H,s,'share','-1',src)).toThrow();
});

/** OKLab distance ×100 (normal vision). */
function okDistance(a:string,b:string){
  const lab=(h:string)=>{const [r,g,b]=[1,3,5].map(i=>{const c=parseInt(h.slice(i,i+2),16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
    const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
    return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];};
  const p=lab(a),q=lab(b);return 100*Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
}
test('the nine family colours are mutually distinct and distinct from the grouping neutrals',()=>{
  const colours=Object.values(FAMILY_COLOURS);expect(colours).toHaveLength(9);
  for(let i=0;i<colours.length;i++){for(let j=i+1;j<colours.length;j++)expect(okDistance(colours[i],colours[j]),`${colours[i]} vs ${colours[j]}`).toBeGreaterThanOrEqual(12.5);
    for(const neutral of ['#7d8791','#b8a78a'])expect(okDistance(colours[i],neutral)).toBeGreaterThanOrEqual(10);}
  expect(familyColor({...H,id:'personal-x',status:'personal',forkedFrom:{id:'haredi',revision:'r'}})).toBe(FAMILY_COLOURS.haredi);
});
