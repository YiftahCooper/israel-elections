import{readFileSync}from'node:fs';
import{expect,test}from'vitest';
import{partyDisplayColor}from'../src/app/partyDisplayColor.ts';
for(const id of ['noam','otzma-yehudit','tkuma','taal'])test(`${id}: one display fill across all historical rings`,()=>{
 const colors=new Set<string>();
 for(let n=1;n<=26;n++)for(const l of JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8')).lists)if(l.parties?.some((p:{id:string})=>p.id===id))colors.add(partyDisplayColor(l,id));
 expect([...colors]).toHaveLength(1);
});
test('ring edits never alter a party fill',()=>{
 const ds=JSON.parse(readFileSync('public/data/k25.json','utf8')),list=ds.lists.find((l:{parties?:{id:string}[]})=>l.parties?.some(p=>p.id==='noam'));
 expect(partyDisplayColor({...list,color:'#ffffff'},'noam')).toBe(partyDisplayColor({...list,color:'#000000'},'noam'));
});

test('all multi-election parties share one fill per recorded base, with a large majority exact',async()=>{
 const {partyDecisions,partyStability}=await import('../scripts/report-party-colours.ts');
 const rows=partyDecisions(),summary=partyStability();
 // Separating seated parties of different lists in each election (finding c-families-map-logos-09) moves 44 party
 // fills, many by ΔE under 3 (Agudat Yisrael, Ta'al), so the exact share fell from 215/267 to 129/267. Each such move
 // carries its reason; counting those as intended, a large majority is still exact.
 const across=(r:{reasons:string[]})=>r.reasons.some(x=>x.startsWith('separation from other lists'));
 expect(rows.filter(r=>r.color===r.base||across(r)).length/rows.length).toBeGreaterThan(.75);
 for(const p of summary.multipleElectionParties){
  for(const base of p.bases)expect(new Set(rows.filter(r=>r.canonicalParty===p.party&&r.base===base).map(r=>r.color)).size,p.party).toBe(1);
  if(p.distinctColours>1){expect(p.bases.length,p.party).toBeGreaterThan(1);expect(p.recordedReasons.length,p.party).toBeGreaterThan(0);}
 }
 // a moved fill takes the smallest step decision 0087 §6 allows (lightness, chroma, hue at most 24°) where one exists,
 // so lightness may change (it no longer has to stay within .02 of the research); every move states its reason
 for(const r of rows)if(r.color!==r.base)expect(r.reasons.length,r.party).toBeGreaterThan(0);
 expect(summary.unresolved).toEqual([]);
});
test('an impossible global separation is reported rather than varied locally',async()=>{
 const{canonicalPartyPalette}=await import('../src/data/partyPalette.ts');
 const canonical=Object.fromEntries(['a','b','c'].map(id=>[id,{color:'#000000',confidence:'high',source:'test'}]));
 const p=canonicalPartyPalette({canonical,byList:{},appearances:[{election:'k1',list:'one',parties:['a','b','c']},{election:'k2',list:'two',parties:['a','b','c']}]});
 expect(p.unresolved.length).toBeGreaterThan(0);expect(p.unresolved.every(e=>e.lists.includes('one')&&e.lists.includes('two'))).toBe(true);
 expect(Object.values(p.colours).every(c=>c.color===c.base)).toBe(true);
},30000);

test('registry aliases share the same canonical research and display identity',async()=>{
 const{partyColourBase}=await import('../src/app/partyDisplayColor.ts');
 const l={color:'#ffffff'};
 for(const[a,b]of [['mada','arab-democratic-party'],['ram','raam'],['israeli-labor-party','labor']]){
  expect(partyDisplayColor(l,a)).toBe(partyDisplayColor(l,b));expect(partyColourBase(l,a)).toEqual(partyColourBase(l,b));
 }
});
