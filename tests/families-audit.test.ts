import {deltaE2000} from '../src/data/colour.ts';
import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import haredi from '../data/meta/families/haredi.json';
import centre from '../data/meta/families/centre.json';
import likud from '../data/meta/families/herut-likud.json';
import { aggregate, membership, parseFamily, scaleAction } from '../src/families/model.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { FAMILY_COLOURS, familyColor } from '../src/families/colors.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
const ds=(n:number)=>JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8')) as ElectionDataset;
const H=parseFamily(JSON.stringify(haredi)),C=parseFamily(JSON.stringify(centre)),K=parseFamily(JSON.stringify(likud));

test('lists left out are "not counted", never "did not contest"',()=>{
  // Centre 2026: Together (Yesh Atid's joint list), Yashar! (with its unclassified partner Yesodot Yisrael) and the
  // Reservists–New Economic list (no seat) are mixed; the withdrawn Blue and White is still under review.
  const c=aggregate(C,ds(26));expect(c.status).toBe('observed');expect(c.votes).toBe(0n);expect(c.mixed).toBe(532018n+913629n+155199n);expect(c.reviews).toBe(1);
  // Centre 1992 names only a list under review: "not yet classified", not absence.
  expect(aggregate(C,ds(13))).toMatchObject({status:'unclassified',reviews:1});
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

test('the nine family colours are mutually distinct and distinct from the grouping neutrals',()=>{
  const colours=Object.values(FAMILY_COLOURS);expect(colours).toHaveLength(9);
  for(let i=0;i<colours.length;i++){for(let j=i+1;j<colours.length;j++)expect(deltaE2000(colours[i],colours[j]),`${colours[i]} vs ${colours[j]}`).toBeGreaterThanOrEqual(20);
    for(const neutral of ['#7d8791','#b8a78a'])expect(deltaE2000(colours[i],neutral)).toBeGreaterThanOrEqual(15);}
  expect(familyColor({...H,id:'personal-x',status:'personal',forkedFrom:{id:'haredi',revision:'r'}})).not.toBe(FAMILY_COLOURS.haredi);
});

test('a family’s sources sheet lists only the sources its own entries cite',async()=>{
  const {readdirSync}=await import('node:fs');const {citedSources}=await import('../src/families/model.ts');
  for(const file of readdirSync('data/meta/families').filter(p=>p.endsWith('.json'))){
    const f=parseFamily(readFileSync(`data/meta/families/${file}`,'utf8')),shown=new Set(citedSources(f).map(([id])=>id));
    const cited=new Set(f.elections.flatMap(e=>[...(e.voteSourceIds as string[]),...e.members.flatMap(m=>m.classificationEvidence.sourceIds),...e.reviewCandidates.flatMap(r=>r.sourceIds)]));
    expect(shown,file).toEqual(new Set([...cited].filter(id=>Object.hasOwn(f.sources,id))));
  }
  const radical=new Set(citedSources(parseFamily(readFileSync('data/meta/families/radical-right.json','utf8'))).map(([id])=>id));
  for(const id of ['aguda','shas','utj','degel'])expect(radical.has(id)).toBe(false);
  expect(radical.has('radical')).toBe(true);
});

// fam-mixed, 19 Nov 2026: a list shared with an outside party counts whole when every elected member is the family's
// own; a shared list that won no seat stays mixed (no member to judge by).
test('a shared list counts whole when no elected member is from outside the family',async()=>{
  const {builtins}=await import('../src/families/runtime.ts');const by=(id:string)=>builtins.find(f=>f.id===id)!;
  const counts=(f:string,e:number,list:string)=>membership(by(f),`k${e}` as never).selected.has(list);
  expect(counts('herut-likud',18,'18-מחל')).toBe(true);
  expect(aggregate(by('herut-likud'),ds(18))).toMatchObject({votes:729054n,mixed:0n});
  expect(counts('radical-right',25,'25-ט')).toBe(true);
  expect(counts('national-religious',21,'21-טב')).toBe(true);
  expect(counts('religious-parties',21,'21-טב')).toBe(true);
  // still mixed: Likud with Yisrael Beiteinu's elected members (2013), Yachad with no seat (2015)
  expect(membership(by('herut-likud'),'k19').mixed.has('19-מחל')).toBe(true);
  expect(membership(by('haredi'),'k20').mixed.has('20-קץ')).toBe(true);
});
test('no family placement rests on a foreign government paper',()=>{
  for(const f of ['centre','herut-likud','radical-right','national-religious','religious-parties','haredi','labour-zionist-left','arab-arab-jewish','russian-speaking-immigrant']){
    const raw=readFileSync(`data/meta/families/${f}.json`,'utf8');expect(raw).not.toMatch(/Congressional Research Service|everycrsreport|crs-in\d/i);
  }
});
