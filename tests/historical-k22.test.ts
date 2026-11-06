import { attachDemographics } from '../scripts/lib/build/demographics.ts';
import { readFileSync } from 'node:fs';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { buildK22 } from '../scripts/lib/historical/k22.ts';

// Seats transcribed from the retained CEC final national HTML, never engine output.
const official = {"22-פה": 33, "22-מחל": 32, "22-ודעם": 13, "22-שס": 9, "22-ל": 8, "22-ג": 7, "22-טב": 7, "22-אמת": 6, "22-מרצ": 5, "22-כף": 0, "22-זץ": 0, "22-כי": 0, "22-יז": 0, "22-צ": 0, "22-רק": 0, "22-נך": 0, "22-ק": 0, "22-ףז": 0, "22-ז": 0, "22-נ": 0, "22-קץ": 0, "22-קך": 0, "22-זכ": 0, "22-צן": 0, "22-ינ": 0, "22-ץ": 0, "22-יף": 0, "22-יק": 0, "22-י": 0, "22-זן": 0, "22-נץ": 0, "22-כ": 0};
// Counts checked against the last printed rank of every roster in the candidate gazette.
const counts = {"אמת": 120, "ג": 120, "ודעם": 120, "ז": 7, "זכ": 9, "זן": 15, "זץ": 8, "טב": 41, "י": 4, "יז": 35, "ינ": 9, "יף": 11, "יק": 8, "כ": 9, "כי": 11, "כף": 26, "ל": 25, "מחל": 119, "מרצ": 120, "נ": 6, "נך": 8, "נץ": 5, "ףז": 26, "פה": 120, "ץ": 16, "צ": 18, "צן": 8, "ק": 10, "קך": 33, "קץ": 7, "רק": 11, "שס": 120};
const leaders = {"פה": "גנץ בנימין", "מחל": "נתניהו בנימין", "ודעם": "עודה איימן", "שס": "דרעי אריה מכלוף", "ל": "ליברמן אביגדור", "ג": "ליצמן יעקב", "טב": "שקד אילת", "אמת": "פרץ ארמונד עמיר", "מרצ": "הורוביץ ניצן"};
const pairs = [["מחל", "טב"], ["מרצ", "אמת"], ["שס", "ג"], ["פה", "ל"], ["כ", "כף"]];

describe('k22: official final result and release gates', () => {
  const ds: ElectionDataset = JSON.parse(readFileSync(new URL('../public/data/k22.json', import.meta.url), 'utf8'));
  const result = allocate(toEngineInput(scenarioFromDataset(ds)));
  it('reproduces every published seat count including zero-seat lists', () => {
    expect(Object.fromEntries(result.lists.map(l => [l.id,l.seats]))).toEqual(official);
    expect(ds.officialSeats).toEqual(official);
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
  });
  it('retains the official national totals', () => {
    expect(ds.totals).toMatchObject({"registered": 6394030, "votesCast": 4465168, "invalid": 28362, "valid": 4436806});
    expect(result.totalValid).toBe(4436806n);
  });
  it('discloses the unresolved electorate disagreement without altering locality figures', () => {
    const loc = JSON.parse(readFileSync(new URL('../public/data/k22-localities.json', import.meta.url),'utf8'));
    expect(loc.rows.reduce((sum:number,r:{registered:number})=>sum+r.registered,0)).toBe(6_391_218);
    expect(ds.status.noteEn).toContain('6,394,030');
    expect(ds.status.noteEn).toContain('6,391,218');
    expect(ds.status.noteEn).toContain('2,812');
  });
  it('uses the exact statutory threshold and general quota', () => {
    expect(result.thresholdVotes).toBe(144197n);
    expect(result.quota).toEqual({ num: 35917n, den: 1n });
  });
  it('has complete contiguous gazetted rosters and the main party leaders', () => {
    expect(Object.fromEntries(ds.lists.map(l=>[l.letters,l.candidates.length]))).toEqual(counts);
    for (const l of ds.lists) {
      expect(l.candidates.map(c=>c.rank)).toEqual(Array.from({length:l.candidates.length},(_,i)=>i+1));
      expect(l.candidatesSecondary).toBe(false);
      expect(l.candidates.every(c=>Boolean(c.givenHe && c.familyHe))).toBe(true);
    }
    for (const [letters,name] of Object.entries(leaders)) expect(ds.lists.find(l=>l.letters===letters)!.candidates[0].nameHe).toBe(name);
  });
  it('preserves wrapped and shifted gazette cells through the final ranks', () => {
    expect(ds.lists.find(l=>l.letters==="ג")!.candidates[32].nameHe).toBe("ברסלר אברהם אלכסנדר זיסקינד");
    expect(ds.lists.find(l=>l.letters==="מחל")!.candidates[118].nameHe).toBe("נסים משה בנימין");
    expect(ds.lists.find(l=>l.letters==="פה")!.candidates[119].nameHe).toBe("סומק רוני");
  });
  it('distinguishes the three withdrawn lists from contestants while retaining their approved rosters', () => {
    expect(ds.lists.filter(l=>l.withdrawn).map(l=>l.letters).sort()).toEqual(['זן','כ','נץ'].sort());
    for (const l of ds.lists.filter(l=>l.withdrawn)) {
      expect(l.votes).toBe(0);
      expect(l.candidates.length).toBeGreaterThan(0);
    }
  });
  it('restores logical Hebrew parentheses from the printed gazette', () => {
    expect(ds.lists.find(l=>l.letters==='פה')!.candidates[23].nameHe).toBe('תמנו פנינה (פנחש)');
    expect(ds.lists.find(l=>l.letters==='אמת')!.candidates[73].familyHe).toBe('ביטי (שלוח)');
    expect(ds.lists.find(l=>l.letters==='מרצ')!.candidates[22].familyHe).toBe('כהן (כהנא)');
    expect(ds.lists.some(l=>(l.sponsorsHe ?? '').includes(')להלן'))).toBe(false);
  });
  it('records every pair in the complete statutory agreement notice', () => {
    expect(ds.agreements.map(a=>a.members.map(id=>id.slice(3)))).toEqual(pairs);
  });
  it('rebuilds from retained evidence with reconciliation or its durable digest', async () => {
    const built = await buildK22();
    expect(finalizeDataset(built.ds)).toEqual(ds); // as the build writes it
    const loc = JSON.parse(readFileSync(new URL('../public/data/k22-localities.json', import.meta.url),'utf8'));
    expect(attachDemographics(built.ds, built.loc!)).toEqual(loc);
  });
});
