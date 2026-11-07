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
 const {partyDecisions,partyStability}=await import('../scripts/report-party-colours.ts'),{hexToOklch}=await import('../src/data/colour.ts');
 const rows=partyDecisions(),summary=partyStability();
 expect(summary.exactBase/summary.appearances).toBeGreaterThan(.75);
 for(const p of summary.multipleElectionParties){
  for(const base of p.bases)expect(new Set(rows.filter(r=>r.canonicalParty===p.party&&r.base===base).map(r=>r.color)).size,p.party).toBe(1);
  if(p.distinctColours>1){expect(p.bases.length,p.party).toBeGreaterThan(1);expect(p.recordedReasons.length,p.party).toBeGreaterThan(0);}
 }
 for(const r of rows)expect(Math.abs(hexToOklch(r.color)[0]-hexToOklch(r.base)[0]),r.party).toBeLessThanOrEqual(.021);
 expect(summary.unresolved).toEqual([]);
});
test('an impossible global separation is reported rather than varied locally',async()=>{
 const{canonicalPartyPalette}=await import('../src/data/partyPalette.ts');
 const canonical=Object.fromEntries(['a','b','c'].map(id=>[id,{color:'#000000',confidence:'high',source:'test'}]));
 const p=canonicalPartyPalette({canonical,byList:{},appearances:[{election:'k1',list:'one',parties:['a','b','c']},{election:'k2',list:'two',parties:['a','b','c']}]});
 expect(p.unresolved.length).toBeGreaterThan(0);expect(p.unresolved.every(e=>e.lists.includes('one')&&e.lists.includes('two'))).toBe(true);
 expect(Object.values(p.colours).every(c=>c.color===c.base)).toBe(true);
},30000);
test('single or dual neutral boundaries clear dot and ring without recolouring',async()=>{
 const{partySeparator,contrastRatio}=await import('../src/data/colourGuard.ts');
 for(const fill of ['#000000','#ffffff','#f0491c','#f2cb06','#f47e49','#3f7b8d'])for(const ring of ['#000000','#ffffff','#f0491c','#738cb4','#3e3e68']){
  const s=partySeparator(fill,ring);expect(contrastRatio(s.inner,fill)).toBeGreaterThanOrEqual(3);expect(contrastRatio(s.outer??s.inner,ring)).toBeGreaterThanOrEqual(3);
 }
});

test('registry aliases share the same canonical research and display identity',async()=>{
 const{partyColourBase}=await import('../src/app/partyDisplayColor.ts');
 const l={color:'#ffffff'};
 for(const[a,b]of [['mada','arab-democratic-party'],['ram','raam'],['israeli-labor-party','labor']]){
  expect(partyDisplayColor(l,a)).toBe(partyDisplayColor(l,b));expect(partyColourBase(l,a)).toEqual(partyColourBase(l,b));
 }
});
