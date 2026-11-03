import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { buildK23 } from '../scripts/lib/historical/k23.ts';

// Seats transcribed from the retained CEC final national HTML, never engine output.
const official = {"23-מחל": 36, "23-פה": 33, "23-ודעם": 15, "23-שס": 9, "23-ג": 7, "23-אמת": 7, "23-ל": 7, "23-טב": 6, "23-נץ": 0, "23-ז": 0, "23-נ": 0, "23-ףז": 0, "23-קץ": 0, "23-ק": 0, "23-כן": 0, "23-ינ": 0, "23-קך": 0, "23-נז": 0, "23-נק": 0, "23-ץ": 0, "23-כ": 0, "23-קי": 0, "23-יק": 0, "23-ני": 0, "23-יז": 0, "23-י": 0, "23-יר": 0, "23-יף": 0, "23-זך": 0, "23-זץ": 0};
// Counts checked against the last printed rank of every roster in the candidate gazette.
const counts = {"אמת": 120, "ג": 119, "ודעם": 120, "ז": 8, "זך": 4, "זץ": 10, "טב": 17, "י": 8, "יז": 7, "ינ": 8, "יף": 14, "יק": 8, "יר": 8, "כ": 8, "כן": 11, "ל": 25, "מחל": 120, "נ": 98, "נז": 13, "ני": 8, "נץ": 17, "נק": 12, "ףז": 22, "פה": 120, "ץ": 16, "ק": 12, "קי": 12, "קך": 18, "קץ": 14, "שס": 120};
const leaders = {"מחל": "נתניהו בנימין", "פה": "גנץ בנימין", "ודעם": "עודה איימן", "שס": "דרעי אריה מכלוף", "ג": "ליצמן יעקב", "אמת": "פרץ ארמונד עמיר", "ל": "ליברמן אביגדור", "טב": "בנט נפתלי"};
const pairs = [["מחל", "טב"], ["פה", "אמת"], ["שס", "ג"]];

describe('k23: official final result and release gates', () => {
  const ds: ElectionDataset = JSON.parse(readFileSync(new URL('../public/data/k23.json', import.meta.url), 'utf8'));
  const result = allocate(toEngineInput(scenarioFromDataset(ds)));
  it('reproduces every published seat count including zero-seat lists', () => {
    expect(Object.fromEntries(result.lists.map(l => [l.id,l.seats]))).toEqual(official);
    expect(ds.officialSeats).toEqual(official);
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
  });
  it('retains the official national totals', () => {
    expect(ds.totals).toMatchObject({"registered": 6453255, "votesCast": 4615135, "invalid": 25073, "valid": 4590062});
    expect(result.totalValid).toBe(4590062n);
  });
  it('uses the exact statutory threshold and general quota', () => {
    expect(result.thresholdVotes).toBe(149178n);
    expect(result.quota).toEqual({ num: 37943n, den: 1n });
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
    expect(ds.lists.find(l=>l.letters==="טב")!.candidates[1].nameHe).toBe("פרץ רפאל");
    expect(ds.lists.find(l=>l.letters==="טב")!.candidates[3].nameHe).toBe("סמוטריץ בצלאל יואל");
    expect(ds.lists.find(l=>l.letters==="שס")!.candidates[63].nameHe).toBe("ביטון עמי");
    expect(ds.lists.find(l=>l.letters==="שס")!.candidates[119].nameHe).toBe("בעדני חיים אהרון");
    expect(ds.lists.find(l=>l.letters==="ג")!.candidates[118].nameHe).toBe("סורוצקין אליעזר");
    expect(ds.lists.find(l=>l.letters==="טב")!.candidates[1].partyHe).toBe("הבית היהודי");
    expect(ds.lists.find(l=>l.letters==="זץ")).toMatchObject({ withdrawn: true, votes: 0 });
  });
  it('records every pair in the complete statutory agreement notice', () => {
    expect(ds.agreements.map(a=>a.members.map(id=>id.slice(3)))).toEqual(pairs);
  });
  it('rebuilds from retained evidence with reconciliation or its durable digest', async () => {
    const built = await buildK23();
    expect(built.ds).toEqual(ds);
    const loc = JSON.parse(readFileSync(new URL('../public/data/k23-localities.json', import.meta.url),'utf8'));
    expect(built.loc).toEqual(loc);
  });
});
