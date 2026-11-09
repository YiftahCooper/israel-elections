import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RELATIONS, usable } from '../src/history/relations.ts';
import { evidenceOf } from '../src/history/evidence-of.ts';
import { certaintyAllowed, certaintyCeiling } from '../src/data/evidence.ts';
import { comparableFor } from '../src/history/compare.ts';
import { identityOf } from '../src/history/identity.ts';
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const lineage = read('data/meta/party-lineage.json');
describe('9 November source-led settlements', () => {
 it.each(['ratz','mapam'])('%s joins Meretz in 1997, before the 1999 election', party => {
  const r = RELATIONS.find(r => r.id === 'meretz-unification-1997')!;
  expect(r.from).toContain(party); expect(r).toMatchObject({date:'1997-02-12',certainty:'probable'});
  expect(r.to).toEqual(['meretz']); expect(usable(r)).toBe(true);
 });
 it('Meretz in 1999 has its complete 1996 predecessor', () => {
  expect(comparableFor('k15','15-מרצ')).toMatchObject({kind:'group',certainty:'probable'});
  expect(comparableFor('k15','15-מרצ')!.counted.map(l=>l.id)).toEqual(['14-מרצ']);
 });
 it('Moria and Geulat Yisrael have explicit official recognition on 25 December 1990', () => {
  for(const party of ['moria','geulat-yisrael']) expect(RELATIONS.find(r=>r.to.includes(party) && r.date==='1990-12-25')).toMatchObject({certainty:'confirmed'});
 });
 it('Sheli joins the front across both contests without merging its components', () => {
  expect(identityOf('sheli').ids).toContain('vehicle-9-ש');
  expect(identityOf('sheli').ids).not.toContain('black-panthers');
 });
 it.each([['yishai-1988','1988'],['telem-emuna','1996']])('%s has a sourced departure, never identity with Shas', (party,date) => {
  expect(RELATIONS.find(r => r.to.includes(party) && r.from.includes('shas'))).toMatchObject({kind:'split-from',date,certainty:'probable'});
  expect(identityOf(party).ids).not.toContain('shas');
 });
 for (const {id} of lineage.settledChecks as {id:string}[]) it(`${id} is backed by inspected scholarship`, () => {
  const c=lineage.settledChecks.find((c:{id:string})=>c.id===id);
  expect(lineage.pending.some((p:{id:string})=>p.id===id)).toBe(false);
  expect(certaintyAllowed(c.certainty,certaintyCeiling(c.sources.map((id:string)=>({id,source:evidenceOf(lineage.sources[id])}))))).toBe(true);
 });
});
describe('all retained faction transitions, Knessets 1–25', () => {
 it.each(Array.from({length:25},(_,i)=>i+1))('k%i retains every official transition with its proof limits', n => {
  const source=read(`data/research/knesset-member-changes/k${n}.json`);
  const events=read(`data/research/knesset-events/k${n}.json`);
  for(const change of source.factionChanges){
   const matching=events.events.filter((e:any)=>e.kind==='faction-membership-change' && e.date===change.date && JSON.stringify(e.who.factionIds)===JSON.stringify([change.fromFactionId,change.toFactionId]) && JSON.stringify([...e.who.personIds].sort())===JSON.stringify([...change.personIds].sort()));
   expect(matching).toHaveLength(1);
   expect(matching[0].certainty).toBe('confirmed');
   if(matching[0].id.includes('-observed-')) {
    expect(matching[0].formalDecisionType).toBe('unknown');
    expect(matching[0].seatsAfter).toBeNull();
    for(const cite of change.cites)expect(matching[0].sources[0].locator).toContain(String(cite.recordId));
   }
  }
  expect(new Set(events.events.map((e:any)=>e.id)).size).toBe(events.events.length);
 });
});
