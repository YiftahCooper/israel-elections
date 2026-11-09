import{readFileSync}from'node:fs';
import{expect,test}from'vitest';
import{partyDecisions}from'../scripts/report-party-colours.ts';
import{partyColourResearch}from'../scripts/build-party-colour-research.ts';
import{partyDisplayDecision,partyDisplayColor,partyColourBase}from'../src/app/partyDisplayColor.ts';
import{idColour}from'../src/data/colourGuard.ts';
import{applyAction}from'../src/model/actions.ts';
import{scenarioFromDataset}from'../src/model/scenario.ts';
import{loadDataset}from'./helpers.ts';
test('all retained research, including low-confidence colours, is indexed without editing confidence',()=>{
 expect(JSON.parse(readFileSync('src/data/party-colour-research.json','utf8'))).toEqual(partyColourResearch());
 const ds=loadDataset('k25'),list=ds.lists.find(l=>l.parties?.some(p=>p.id==='otzma-yehudit'))!;
 expect(partyColourBase(list,'otzma-yehudit')).toMatchObject({color:'#f0491c',confidence:'low'});
});
test('every election stays near its recorded base unless a failed check forces a reported adjustment',()=>{
 const rows=partyDecisions();
 for(const r of rows){if(r.deltaE>2)expect(r.reasons.length,`${r.election} ${r.party}`).toBeGreaterThan(0);if(!r.forced)expect(r.deltaE).toBe(0);}
 expect(rows.filter(r=>r.forced)).toEqual(JSON.parse(readFileSync('docs/colour-reports/party-colour-adjustments.json','utf8')));
 const a={id:'a',color:'#ffffff',parties:[{id:'unresearched-party'}]},b={...a,id:'b'};
 expect(partyColourBase(a,'unresearched-party').color).toBe(idColour('unresearched-party'));
 expect(partyDisplayColor(a,'unresearched-party')).toBe(partyDisplayColor(b,'unresearched-party'));
 expect(partyDisplayColor({color:a.color},'unresearched-party')).toBe(partyDisplayColor(a,'unresearched-party'));
});
test('explicit custom choices are never silently changed, survive replay, and reset to research',()=>{
 const base=scenarioFromDataset(loadDataset('k25')),list=base.lists.find(l=>l.parties?.some(p=>p.id==='otzma-yehudit'))!,p=list.parties!.find(p=>p.id==='otzma-yehudit')!;
 const action={type:'setPartyColor' as const,listId:list.id,partyId:p.id,color:list.color},edited=applyAction(base,action);
 const e=edited.lists.find(l=>l.id===list.id)!;expect(partyDisplayDecision(e,p.id)).toMatchObject({color:list.color,custom:true});
 expect(partyDisplayColor(applyAction(base,JSON.parse(JSON.stringify(action))).lists.find(l=>l.id===list.id)!,p.id)).toBe(list.color);
 const reset=applyAction(edited,{type:'resetColors'},undefined,{base});expect(partyDisplayColor(reset.lists.find(l=>l.id===list.id)!,p.id)).toBe(partyDisplayColor(list,p.id));
});
