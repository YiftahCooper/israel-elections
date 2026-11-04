import {expect,test} from 'vitest';
import {deriveJointList,openingFaction} from '../scripts/joint-facts.ts';
test('opening faction uses date interval, not latest faction',()=>{
 const rows=[{PersonID:1,FactionID:2,FactionName:'Original',StartDate:'2022-11-01',FinishDate:'2022-12-01'},{PersonID:1,FactionID:3,FactionName:'Later',StartDate:'2022-12-02',FinishDate:null}];
 expect(openingFaction(rows,1,'2022-11-15')?.nameHe).toBe('Original');expect(openingFaction(rows,1,'2022-10-01')).toBeNull();
 expect(openingFaction([...rows, {...rows[0],FactionID:4}],1,'2022-11-15')).toBeNull();
});
test('head is rank one, elected skips notSeated; unknown parties and people stay unknown',()=>{
 const l={id:'1-x',parties:[{id:'a',nameHe:'א',nameEn:'A'},{id:'b',nameHe:'ב',nameEn:'B'}],partiesHe:['א','ב'],candidates:[{rank:1,partyId:'a',nameHe:'One',notSeated:true},{rank:2,partyId:'b',nameHe:'Two'},{rank:3,nameHe:'Unknown'}]};
 const f=deriveJointList(l as any,2,{positions:[],persons:[],factionMemberships:[]},[]);
 expect(f.headPartyId).toBe('a');expect(f.parties.map(p=>p.elected)).toEqual([0,1]);expect(f.unknownElected).toBe(1);expect(f.parties[1].unknownFaction).toBe(1);expect(f.openingDate).toBeNull();
});
test('biography website IDs never join the OData PersonID namespace',()=>{
 const l={id:'1-x',parties:[{id:'a',nameHe:'א',nameEn:'A'},{id:'b',nameHe:'ב',nameEn:'B'}],candidates:[{rank:1,partyId:'a',nameHe:'Correct Person',bio:{knesset:'https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/7'}}]};
 const snapshot={positions:[{PersonID:7,StartDate:'2000-01-01'},{PersonID:8,StartDate:'2000-01-01'}],persons:[{PersonID:7,LastName:'Wrong',FirstName:'Person'},{PersonID:8,LastName:'Correct',FirstName:'Person'}],factionMemberships:[{PersonID:7,FactionID:1,FactionName:'Wrong faction',StartDate:'2000-01-01'},{PersonID:8,FactionID:2,FactionName:'Correct faction',StartDate:'2000-01-01'}]};
 expect(deriveJointList(l as any,1,snapshot,[]).parties[0].factions).toEqual([{id:2,nameHe:'Correct faction',seats:1}]);
});
test('retained generated facts reproduce exactly and 2026 opening stays unknown',async()=>{
 const {compileJointFacts}=await import('../scripts/joint-facts.ts');const {readFileSync}=await import('node:fs');
 const facts=compileJointFacts();expect(facts).toEqual(JSON.parse(readFileSync('data/meta/joint-facts.json','utf8')));
 expect(facts).toHaveLength(108);expect(facts.filter(f=>f.listId.startsWith('26-')).every(f=>f.openingDate===null&&f.parties.every(p=>p.factions.length===0))).toBe(true);
 const religious=facts.find(f=>f.listId==='25-ט')!;expect(religious.parties.slice(0,3).map(p=>p.elected)).toEqual([7,6,1]);
 expect(religious.parties.flatMap(p=>p.factions).every(f=>f.nameHe==='הציונות הדתית')).toBe(true);
});
test('missing-faction refresh reuses all retained snapshots without network',async()=>{
 const {fetchMissingFactions}=await import('../scripts/joint-facts.ts');const original=globalThis.fetch;
 globalThis.fetch=async()=>{throw new Error('Unexpected network request despite retained cache');};
 try{await fetchMissingFactions();}finally{globalThis.fetch=original;}
});
