import { attachDemographics } from '../scripts/lib/build/demographics.ts';
import { readFileSync } from 'node:fs';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { buildK24 } from '../scripts/lib/historical/k24.ts';

// Seats transcribed from the retained CEC final national HTML, never engine output.
const official = {"24-מחל": 30, "24-פה": 17, "24-שס": 9, "24-כן": 8, "24-ב": 7, "24-אמת": 7, "24-ג": 7, "24-ל": 7, "24-ט": 6, "24-ודעם": 6, "24-ת": 6, "24-מרצ": 6, "24-עם": 4, "24-יז": 0, "24-ר": 0, "24-ףז": 0, "24-כך": 0, "24-רנ": 0, "24-י": 0, "24-קץ": 0, "24-זץ": 0, "24-רף": 0, "24-קך": 0, "24-נ": 0, "24-ק": 0, "24-כ": 0, "24-צי": 0, "24-יק": 0, "24-ני": 0, "24-ינ": 0, "24-ז": 0, "24-קי": 0, "24-ץ": 0, "24-יר": 0, "24-צכ": 0, "24-צף": 0, "24-נר": 0, "24-יף": 0, "24-רק": 0};
// Counts checked against the last printed rank of every roster in the candidate gazette.
const counts = {"אמת": 71, "ב": 38, "ג": 120, "ודעם": 120, "ז": 6, "זץ": 10, "ט": 21, "י": 4, "יז": 21, "ינ": 11, "יף": 11, "יק": 7, "יר": 5, "כ": 5, "כך": 7, "כן": 55, "ל": 23, "מחל": 120, "מרצ": 120, "נ": 4, "ני": 40, "נר": 5, "עם": 116, "ףז": 13, "פה": 120, "ץ": 14, "צי": 7, "צכ": 49, "צף": 6, "ק": 2, "קי": 4, "קך": 7, "קץ": 7, "ר": 11, "רנ": 4, "רף": 6, "רק": 34, "שס": 120, "ת": 62};
const leaders = {"מחל": "נתניהו בנימין", "פה": "לפיד יאיר", "שס": "דרעי אריה מכלוף", "כן": "גנץ בנימין", "ב": "בנט נפתלי", "אמת": "מיכאלי מירב", "ג": "גפני משה רפאל", "ל": "ליברמן אביגדור", "ט": "סמוטריץ בצלאל יואל", "ודעם": "עודה איימן", "ת": "סער גדעון משה", "מרצ": "הורוביץ ניצן", "עם": "עבאס מנסור"};
const pairs = [["ת", "ב"], ["ל", "פה"], ["מחל", "ט"], ["יז", "כן"], ["אמת", "מרצ"], ["שס", "ג"]];

describe('k24: official final result and release gates', () => {
  const ds: ElectionDataset = JSON.parse(readFileSync(new URL('../public/data/k24.json', import.meta.url), 'utf8'));
  const result = allocate(toEngineInput(scenarioFromDataset(ds)));
  it('reproduces every published seat count including zero-seat lists', () => {
    expect(Object.fromEntries(result.lists.map(l => [l.id,l.seats]))).toEqual(official);
    expect(ds.officialSeats).toEqual(official);
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
  });
  it('retains the official national totals', () => {
    expect(ds.totals).toMatchObject({"registered": 6578084, "votesCast": 4436365, "invalid": 26313, "valid": 4410052});
    expect(result.totalValid).toBe(4410052n);
  });
  it('uses the exact statutory threshold and general quota', () => {
    expect(result.thresholdVotes).toBe(143327n);
    expect(result.quota).toEqual({ num: 36210n, den: 1n });
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
    expect(ds.lists.find(l=>l.letters==="כן")!.candidates[39].nameHe).toBe("זיו זילברברג מירב");
    expect(ds.lists.find(l=>l.letters==="מרצ")!.candidates[88].nameHe).toBe("ויגדורצ'יק ורוניקה");
    expect(ds.lists.find(l=>l.letters==="פה")!.candidates[14].nameHe).toBe("בליאק ולדימיר");
    expect(ds.lists.find(l=>l.letters==="פה")!.candidates[20].nameHe).toBe("טור-פז משה יהודה");
    expect(ds.lists.find(l=>l.letters==="פה")!.candidates[119].nameHe).toBe("סומק רוני");
  });
  it('records every pair in the complete statutory agreement notice', () => {
    expect(ds.agreements.map(a=>a.members.map(id=>id.slice(3)))).toEqual(pairs);
  });
  it('rebuilds from retained evidence with reconciliation or its durable digest', async () => {
    const built = await buildK24();
    expect(finalizeDataset(built.ds)).toEqual(ds); // as the build writes it
    const loc = JSON.parse(readFileSync(new URL('../public/data/k24-localities.json', import.meta.url),'utf8'));
    expect(attachDemographics(built.ds, built.loc!)).toEqual(loc);
  });
});
