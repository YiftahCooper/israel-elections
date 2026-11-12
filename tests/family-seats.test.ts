import {describe,expect,test} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {builtins,historyElections} from '../src/families/runtime.ts';
import {fork} from '../src/families/model.ts';
import {familySeatRow,familySeatSummary,orderPartners,seatAxis,stackBar,type SeatGeometry} from '../src/families/seatBars.ts';
import registry from '../data/meta/parties.json';
import type {ElectionDataset} from '../src/data/schema.ts';

const ds=(id:string)=>JSON.parse(readFileSync(`public/data/${id}.json`,'utf8')) as ElectionDataset;
const canonical=new Map<string,string>(registry.parties.flatMap(p=>[[p.id,p.id] as [string,string],...(p.aliases??[]).map(a=>[a.id,p.id] as [string,string])]));
const C=(id:string)=>canonical.get(id)??id;
const by=(id:string)=>builtins.find(f=>f.id===id)!;
const brief=(f:string,k:string)=>{const r=familySeatRow(by(f),k);return {own:r.own,partners:r.partners.map(p=>`${p.partyId??'?'} ${p.seats}`)};};

describe('partner data: every family and election, independently from the elected candidates',()=>{
 for(const file of readdirSync('data/meta/families').filter(p=>p.endsWith('.json'))){
  const full=JSON.parse(readFileSync(`data/meta/families/${file}`,'utf8'));
  test(full.id,()=>{
   for(const e of full.elections){
    const d=ds(e.electionId),seats=d.officialSeats!;let own=0;const partners:string[]=[];
    for(const m of e.members){
     const l=d.lists.find(x=>x.id===m.listId)!,n=seats[l.id]??0,elected=l.candidates.filter(c=>!c.notSeated).slice(0,n);
     if(m.scope!=='mixed'){own+=n;continue;}
     const mine=new Set(m.partyIds.map(C));let named=0;
     for(const p of l.parties??[]){const k=elected.filter(c=>c.partyId===p.id).length;named+=k;if(mine.has(C(p.id)))own+=k;else if(k)partners.push(`${C(p.id)} ${k}`);}
     if(n>named)partners.push(`? ${n-named}`);
    }
    const row=familySeatRow(by(full.id),e.electionId);
    expect(row.status,`${full.id} ${e.electionId}`).toBe(e.members.length?'observed':'none');
    expect(row.own,`${full.id} ${e.electionId}`).toBe(own);
    expect(row.partners.map(p=>`${p.partyId??'?'} ${p.seats}`).sort(),`${full.id} ${e.electionId}`).toEqual(partners.sort());
    // own + partners = every seat the family's lists won: nothing dropped, nothing estimated
    expect(row.own+row.partners.reduce((t,p)=>t+p.seats,0)).toBe(e.members.reduce((t:number,m:{listId:string})=>t+(seats[m.listId]??0),0));
   }
  });
 }
});

test('the questions-page cases: every partner on every joint list, smallest first',()=>{
 // Religious Zionist 1999: Meimad inside One Israel and Tkuma inside the National Union
 expect(brief('national-religious','k15')).toEqual({own:7,partners:['herut-national-movement 1','gesher 2','moledet 2','labor 23']});
 expect(brief('national-religious','k16')).toEqual({own:9,partners:['moledet 2','yisrael-beiteinu 3','labor 18']});
 expect(brief('national-religious','k17')).toEqual({own:8,partners:['moledet 2','labor 18']});
 expect(brief('national-religious','k25')).toEqual({own:8,partners:['otzma-yehudit 6']});
 expect(brief('russian-speaking-immigrant','k19')).toEqual({own:11,partners:['likud 20']});
 expect(brief('herut-likud','k19')).toEqual({own:20,partners:['yisrael-beiteinu 11']});
 expect(brief('radical-right','k14')).toEqual({own:7,partners:['gesher 5','likud 22']});
 expect(brief('radical-right','k21')).toEqual({own:2,partners:['jewish-home 3']});
 expect(brief('centre','k20')).toEqual({own:26,partners:['labor 19']});
 expect(brief('centre','k23')).toEqual({own:34,partners:['labor 3','meretz 3']});
 expect(brief('haredi','k1')).toEqual({own:5,partners:['mizrachi 4','hapoel-hamizrachi 7']});
 // Religious, three joint lists a year; 1999 includes one United Arab List member whose party no source records
 expect(brief('religious-parties','k15')).toEqual({own:31,partners:['herut-national-movement 1','? 1','gesher 2','moledet 2','arab-democratic-party 2','labor 23']});
 expect(brief('religious-parties','k16')).toEqual({own:26,partners:['arab-democratic-party 1','moledet 2','yisrael-beiteinu 3','labor 18']});
 expect(brief('religious-parties','k17')).toEqual({own:28,partners:['arab-democratic-party 1','taal 1','moledet 2','labor 18']});
 expect(familySeatRow(by('religious-parties'),'k15').partners.find(p=>p.kind==='unrecorded')).toMatchObject({seats:1,listId:'15-עם'});
});

test('Morasha 1984: one seat each for two families, each the other’s partner',()=>{
 expect(brief('haredi','k11')).toEqual({own:7,partners:['matzad 1']});
 expect(brief('national-religious','k11')).toEqual({own:5,partners:['poalei-agudat-yisrael 1']});
});

test('no seats: a list below the threshold has no partners; elections without a list are not zero',()=>{
 // Yachad (with Otzma Yehudit) 2015 won nothing; Ahi's reserved places on Likud 2009 were not reached
 expect(familySeatRow(by('haredi'),'k20').partners).toEqual([]);
 expect(brief('herut-likud','k18')).toEqual({own:27,partners:[]});
 expect(brief('radical-right','k19')).toEqual({own:0,partners:[]});
 expect(familySeatRow(by('russian-speaking-immigrant'),'k1').status).toBe('none');
 expect(familySeatRow({...by('herut-likud'),elections:[]},'k19').status).toBe('unknown');
});

test('a personal copy: disabled lists drop out, added lists count whole, flags come from its own party ids',()=>{
 const likud=by('herut-likud'),copy=fork(likud);
 expect(familySeatRow({...copy,disabled:['19-מחל']},'k19')).toMatchObject({own:0,partners:[]});
 expect(familySeatRow({...likud,included:['19-כן']},'k19')).toMatchObject({own:22,partners:[{partyId:'yisrael-beiteinu',seats:11}]});
 expect(familySeatRow(copy,'k19')).toEqual(familySeatRow(likud,'k19'));
 // the vote policy does not change seats: they are exact
 expect(familySeatRow({...likud,defaultMixedPolicy:'include-whole-list'},'k19')).toEqual(familySeatRow(likud,'k19'));
});

test('ties: by list, then party id; unrecorded after named parties',()=>{
 const p=(seats:number,listId:string,partyId:string|null)=>({seats,listId,partyId});
 expect(orderPartners([p(2,'15-מחל','b'),p(1,'15-ע',null),p(2,'15-ט','z'),p(1,'15-ע','a'),p(2,'15-ט','a')]).map(x=>`${x.listId}/${x.partyId}`)).toEqual(['15-ע/a','15-ע/null','15-ט/a','15-ט/z','15-מחל/b']);
});

test('axis: round tops close to the family’s best result',()=>{
 expect(seatAxis(48)).toEqual({top:50,ticks:[0,10,20,30,40,50]});
 expect(seatAxis(12).top).toBe(15);expect(seatAxis(33).top).toBe(40);expect(seatAxis(56).top).toBe(60);expect(seatAxis(0).top).toBe(1);
});

describe('stacking and fade geometry',()=>{
 const g:SeatGeometry={plot:232,headroom:56,fade:40,axisTop:15,minSlice:4};
 const scale=(232-56)/15;
 test('fits: every segment exactly its seats, no fade',()=>{
  const b=stackBar(8,[6],g);expect(b.clipped).toBe(false);expect(b.own).toBeCloseTo(8*scale);expect(b.parts[0]).toEqual({y0:8*scale,y1:14*scale,cut:false});
 });
 test('Religious Zionist 1999: small partners exact below the fade band, Labor cut inside it',()=>{
  const b=stackBar(7,[1,2,2,23],g);expect(b.clipped).toBe(true);
  b.parts.slice(0,3).forEach((p,i)=>{expect(p.cut).toBe(false);expect(p.y1-p.y0).toBeCloseTo([1,2,2][i]*scale);expect(p.y1).toBeLessThanOrEqual(232-40);});
  expect(b.parts[3]).toMatchObject({cut:true,y1:232});
 });
 // Every combination the property must survive: many partners, tiny scales, partners far taller than the headroom.
 const cases:[number,number[],SeatGeometry][]=[];
 for(const axisTop of [1,5,15,40,60])for(const own of [0,1,axisTop])for(const partners of [[1],[23],[1,1,1,1,1,1,1,1],[1,2,2,23],[5,5,5,5,5],[30,40],[1,1,2,2,2,23]])for(const [plot,headroom,fade] of [[232,56,40],[172,44,30]])cases.push([Math.min(own,axisTop),partners,{plot,headroom,fade,axisTop,minSlice:4}]);
 test.each(cases)('own %i partners %j',(own,partners,g)=>{
  const b=stackBar(own,partners,g),s=(g.plot-g.headroom)/g.axisTop,Z=g.plot-g.fade,mid=g.plot-g.fade/2,slice=Math.min(4,g.fade/2/partners.length);
  expect(b.own).toBeLessThanOrEqual(g.plot-g.headroom+1e-9);
  let y=b.own;
  b.parts.forEach((p,i)=>{
   expect(p.y0).toBeCloseTo(y);y=p.y1;
   const h=p.y1-p.y0,trueH=partners[i]*s;
   expect(h).toBeLessThanOrEqual(trueH+1e-9);                       // never bigger than its seats
   if(p.cut)expect(p.y1).toBeGreaterThan(Z-1e-9);                     // shortened only inside the fade band
   if(p.y0<Z-1e-9)expect(Math.min(p.y1,Z)-p.y0).toBeCloseTo(Math.min(trueH,Z-p.y0)); // exact below the band
   // its colour shows where the band is at least half opaque
   expect(Math.min(p.y1,mid)-Math.min(p.y0,mid)).toBeGreaterThanOrEqual(Math.min(trueH,slice)-1e-9);
  });
  expect(Math.max(b.own,...b.parts.map(p=>p.y1))).toBeLessThanOrEqual(g.plot+1e-9);
  expect(b.clipped).toBe(b.own+partners.reduce((t,n)=>t+n*s,0)>g.plot+1e-9);
 });
});

describe('election breakdown: seats agree with the seats chart under every mixed-list policy',()=>{
 const policies=['separate-segment','include-headed-list','include-whole-list','exclude'] as const;
 for(const f of builtins)test(f.id,()=>{
  historyElections.forEach((e,i)=>{
   const chart=familySeatRow(f,e.id),before=i>0?familySeatRow(f,historyElections[i-1].id):null;
   for(const policy of policies){
    const s=familySeatSummary({...f,defaultMixedPolicy:policy},e.id),at=`${f.id} ${e.id} ${policy}`;
    expect(s.known,at).toBe(chart.status==='observed');
    expect(s.own,at).toBe(chart.own);
    expect(s.partners,at).toBe(chart.partners.reduce((t,p)=>t+p.seats,0));
    expect(s.change,at).toBe(chart.status==='observed'&&before?.status==='observed'?chart.own-before.own:null);
   }
  });
 });
 test('Likud lineage 2013: 20 own seats and 11 partners on Likud–Yisrael Beiteinu, down 7 from 27, under Count all too',()=>{
  for(const policy of policies)expect(familySeatSummary({...by('herut-likud'),defaultMixedPolicy:policy},'k19')).toEqual({known:true,own:20,partners:11,change:-7});
 });
});
