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
  it('is released with the documented gazette differences disclosed (decision 0042)', () => {
    const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8'));
    expect(index.find((r: { id: string }) => r.id === 'k19').available).toBe(true);
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    expect(ds.status.noteEn).toContain('3,792,472');
    expect(ds.status.noteEn).toContain('Both versions give exactly the same seats');
    expect(ds.lists.filter(l => l.notesHe.length).map(l => l.letters).sort()).toEqual(['מחל', 'כן', 'יק', 'ד'].sort());
  });
  it('retains the formal total correction and the approved Balad identity', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    expect(ds.sourceIds).toContain('k19-results-correction');
    expect(ds.buildInfo.rawSha256['k19-results-correction']).toBe('997628f9f5b6d556b62e2547489cbc9b6fbd64fa721c6eff687577ae1074cc24');
    expect(ds.status.noteEn).toContain('YP 6546');
    expect(ds.lists.find(l => l.letters === 'ד')?.nameHe).toBe('בל"ד - אלתג\'מוע אלווטני אלדמוקרטי');
    for (const letters of ['צפ', 'ו']) expect(ds.lists.find(l => l.letters === letters)?.logo).toBeUndefined();
    expect(ds.lists.find(l => l.letters === 'מרצ')?.logo?.file).toBe('logos/meretz-2013-k19-print.png');
  });
  it('checks every roster count against the final rank in the candidate gazette', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    expect(Object.fromEntries(ds.lists.map(l => [l.letters, l.candidates.length]))).toEqual({"אמת": 120, "ג": 120, "ד": 117, "הי": 25, "הפ": 15, "הק": 11, "ו": 120, "ז": 9, "זך": 19, "טב": 79, "יק": 7, "כן": 92, "מחל": 119, "מרצ": 120, "נ": 8, "ני": 10, "נץ": 54, "נק": 9, "עם": 112, "פ": 34, "פה": 120, "פז": 17, "פי": 11, "פנ": 11, "פץ": 12, "צפ": 46, "צק": 13, "ץ": 15, "ק": 44, "קנ": 14, "רק": 10, "שס": 82});
    expect(Object.fromEntries(ds.lists.filter(l => l.letters in seats).map(l => [l.letters, l.candidates[0].nameHe]))).toEqual({"אמת": "יחימוביץ' רחל שלי", "ג": "ליצמן יעקב", "ד": "זחאלקה גמאל", "ו": "ברכה מוחמד", "טב": "בנט נפתלי", "כן": "מופז שאול", "מחל": "נתניהו בנימין", "מרצ": "גלאון זהבה", "עם": "צרצור אברהים", "פה": "לפיד יאיר", "צפ": "לבני ציפי", "שס": "ישי אליהו"});
    for (const l of ds.lists) expect(l.candidates.map(c => c.rank)).toEqual(Array.from({ length: l.candidates.length }, (_, i) => i + 1));
  });
  it('gives the gazetted seats under the gazette’s own list counts too', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k19.json', 'utf8'));
    const gazette: Record<string, number> = { 'מחל': 885054, 'כן': 79081, 'יק': 18941 };
    const printed = { ...ds, lists: ds.lists.map(l => (l.letters in gazette ? { ...l, votes: gazette[l.letters] } : l)) };
    expect(printed.lists.reduce((t, l) => t + l.votes, 0)).toBe(3792742); // the printed total 3,792,472 is not the lists' sum
    const res = allocate(toEngineInput(scenarioFromDataset(printed)));
    for (const l of res.lists) expect(l.seats, l.id).toBe(seats[l.id.slice(3) as keyof typeof seats] ?? 0);
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
