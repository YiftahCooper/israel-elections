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

test('retained OData identities resolve nickname and middle-name variants before names',()=>{
 const l={id:'25-x',parties:[{id:'a'}],candidates:[{id:'25-x#1',rank:1,partyId:'a',nameHe:'Official long name'}]};
 const snapshot={positions:[{PersonID:8,StartDate:'2022-11-15'}],persons:[{PersonID:8,LastName:'Short',FirstName:'Name'},{PersonID:9,LastName:'Official long',FirstName:'name'}],factionMemberships:[{PersonID:8,FactionID:2,FactionName:'Opening',StartDate:'2022-11-15'}]};
 expect(deriveJointList(l as any,1,snapshot,[],{ '25-x#1':{knessetPersonId:8,confidence:'high'} }).parties[0].unknownFaction).toBe(0);
});

test('normalization strips niqqud and punctuation but preserves word boundaries',async()=>{
 const {normalizeMemberName}=await import('../scripts/joint-facts.ts');
 expect(normalizeMemberName('לֵוִי־משה  ג׳')).toBe(normalizeMemberName('לוי משה ג'));
 expect(normalizeMemberName('אב גד')).not.toBe(normalizeMemberName('אבג ד'));
});

test('ambiguous names and conflicting aliases stay unknown, never fuzzy matched',async()=>{
 const {matchMember}=await import('../scripts/joint-facts.ts');
 const c={id:'x#1',nameHe:'שם פרטי'} as any;
 const snapshot={positions:[],persons:[{PersonID:1,LastName:'שם',FirstName:'פרטי'},{PersonID:2,LastName:'שם',FirstName:'פרטי'}]};
 expect(matchMember(c,snapshot).reason).toBe('ambiguous normalized name');
 const a={candidateId:c.id,nameHe:c.nameHe,source:'official retained snapshot',note:'reviewed',personId:1};
 expect(matchMember(c,{...snapshot,persons:[{PersonID:1,LastName:'כינוי',FirstName:'אחר'}]}, {}, [a]).personId).toBe(1);
 expect(matchMember(c,snapshot,{},[a]).personId).toBeNull();
 expect(matchMember(c,{...snapshot,persons:[{PersonID:1,LastName:'כינוי',FirstName:'אחר'},{PersonID:2,LastName:'אדם',FirstName:'נוסף'}]}, {}, [a,{...a,personId:2}]).reason).toBe('ambiguous reviewed aliases');
 expect(matchMember({...c,nameHe:'שם פרטיי'},snapshot).personId).toBeNull();
 expect(matchMember(c,{...snapshot,persons:[]},{[c.id]:{knessetPersonId:1,confidence:'high'}}).reason).toContain('absent');
});

test('historical residuals are limited to duplicate names and the documented pre-opening resignation',async()=>{
 const {compileJointFacts}=await import('../scripts/joint-facts.ts');
 const unresolved=compileJointFacts().filter(l=>!l.listId.startsWith('26-')).flatMap(l=>l.unresolved);
 expect(unresolved.map(c=>c.candidateId)).toEqual(['9-מחל#24','9-מחל#21','23-פה#13']);
});


test('two elected candidates cannot count the same OData person twice',()=>{
 const l={id:'x',parties:[{id:'a'}],candidates:[{id:'x#1',rank:1,partyId:'a',nameHe:'Same Person'},{id:'x#2',rank:2,partyId:'a',nameHe:'Same Person'}]};
 const snapshot={positions:[{PersonID:1,StartDate:'2000-01-01'}],persons:[{PersonID:1,LastName:'Same',FirstName:'Person'}],factionMemberships:[{PersonID:1,FactionID:1,FactionName:'A',StartDate:'2000-01-01'}]};
 const facts=deriveJointList(l as any,2,snapshot,[]);
 expect(facts.parties[0].unknownFaction).toBe(2);
 expect(facts.unresolved.every(c=>c.reason==='multiple elected candidates resolve to the same OData person')).toBe(true);
});
