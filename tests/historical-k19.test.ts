import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { rat } from '../src/engine/rational.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { parseCandidates, datastoreLetter } from '../scripts/lib/historical/k18-k19-common.ts';

// YP 6540, p. 2493; independently published seats, never calculated expectations.
const seats = { אמת: 15, ג: 7, ד: 3, ו: 4, טב: 12, כן: 2, מחל: 31, מרצ: 6, עם: 4, פה: 19, צפ: 6, שס: 11 };
describe('k19 — official 2013 result', () => {
  it('maps the datastore spelling explicitly', () => {
    expect(datastoreLetter(19, 'מרצ')).toBe('מרץ');
    expect(datastoreLetter(18, 'מרצ')).toBe('מרצ');
  });
  it('removes the repeated placed Labor template and preserves the actual leaders', async () => {
    const lists = await parseCandidates(19);
    expect(lists.find(l => l.letters === 'ד')?.candidates.at(-1)).toMatchObject({ rank: 117, nameHe: 'טאהא ואסף' });
    expect(lists.find(l => l.letters === 'מחל')?.candidates[0].nameHe).toBe('נתניהו בנימין');
    expect(lists.find(l => l.letters === 'פה')?.candidates[0].nameHe).toBe('לפיד יאיר');
    expect(lists.find(l => l.letters === 'אמת')?.candidates[0].nameHe).toBe("יחימוביץ' רחל שלי");
  });
  it('retains the documented discrepancies and keeps the unresolved election unavailable', () => {
    const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8'));
    expect(index.find((r: { id: string }) => r.id === 'k19').available).toBe(false);
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    expect(ds.status.noteEn).toContain('remain unverified');
    expect(ds.lists.filter(l => l.notesHe.length).map(l => l.letters).sort()).toEqual(['מחל', 'כן', 'יק'].sort());
  });
  it('checks every roster count against the final rank in the candidate gazette', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    expect(Object.fromEntries(ds.lists.map(l => [l.letters, l.candidates.length]))).toEqual({"אמת": 120, "ג": 120, "ד": 117, "הי": 25, "הפ": 15, "הק": 11, "ו": 120, "ז": 9, "זך": 19, "טב": 79, "יק": 7, "כן": 92, "מחל": 119, "מרצ": 120, "נ": 8, "ני": 10, "נץ": 54, "נק": 9, "עם": 112, "פ": 34, "פה": 120, "פז": 17, "פי": 11, "פנ": 11, "פץ": 12, "צפ": 46, "צק": 13, "ץ": 15, "ק": 44, "קנ": 14, "רק": 10, "שס": 82});
    expect(Object.fromEntries(ds.lists.filter(l => l.letters in seats).map(l => [l.letters, l.candidates[0].nameHe]))).toEqual({"אמת": "יחימוביץ' רחל שלי", "ג": "ליצמן יעקב", "ד": "זחאלקה גמאל", "ו": "ברכה מוחמד", "טב": "בנט נפתלי", "כן": "מופז שאול", "מחל": "נתניהו בנימין", "מרצ": "גלאון זהבה", "עם": "צרצור אברהים", "פה": "לפיד יאיר", "צפ": "לבני ציפי", "שס": "ישי אליהו"});
    for (const l of ds.lists) expect(l.candidates.map(c => c.rank)).toEqual(Array.from({ length: l.candidates.length }, (_, i) => i + 1));
  });
  it('reproduces every gazetted seat using the CEC final national totals', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    expect(ds.lists.find(l => l.letters === 'מחל')?.candidates[0].nameHe).toBe('נתניהו בנימין');
    const res = allocate(toEngineInput(scenarioFromDataset(ds)));
    for (const l of res.lists) expect(l.seats, l.id).toBe(seats[l.id.slice(3) as keyof typeof seats] ?? 0);
    expect(res.seatsAllocated).toBe(120);
    expect(res.thresholdVotes).toBe(75_855n);
    expect(res.quota).toEqual(rat(29_366n));
    expect(ds.totals).toMatchObject({ registered: 5_656_705, votesCast: 3_833_646, invalid: 40_904, valid: 3_792_742 });
    expect(ds.agreements.map(a => a.members.map(m => m.slice(3)))).toEqual([
      ['אמת', 'פה'], ['ג', 'שס'], ['ד', 'ו'], ['זך', 'צק'], ['טב', 'מחל'], ['כן', 'ץ'], ['צפ', 'מרצ'],
    ]);
  });
});
