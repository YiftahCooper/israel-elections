import type { DemographicGroup, GroupGrade } from '../data/schema.ts';
/** Availability is deliberately separate from overall evidence quality. No UI opt-in can unlock missing data. */
export function groupAvailability(g: DemographicGroup): { grade: GroupGrade; mode: 'solid' | 'speculative' | 'unavailable'; reasons: string[] } {
 const measures=[g.electorate,g.turnout,g.split,...(g.invalidRate?[g.invalidRate]:[])];
 const reasons=measures.map(m=>m.reason);
 if(measures.some(m=>m.grade==='insufficient'))return {grade:'insufficient',mode:'unavailable',reasons};
 const grade=measures.some(m=>m.grade==='estimate')?'estimate':'solid';
 // Unattributed votes cannot be assigned to scenario lists without inventing preferences.
 if(g.split.value?.otherPct)return {grade,mode:'unavailable',reasons:[...reasons,'Unattributed ballots have no list destination.']};
 return {grade,mode:grade==='solid'?'solid':'speculative',reasons};
}
