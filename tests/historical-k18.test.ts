import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { rat } from '../src/engine/rational.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { parseCandidates } from '../scripts/lib/historical/k18-k19-common.ts';

// YP 5917, pp. 2401–2404. Expected seats are transcribed from the publication.
const seats = { אמת: 13, ב: 3, ג: 5, ד: 3, ו: 4, ט: 4, כן: 28, ל: 15, מחל: 27, מרצ: 3, עם: 4, שס: 11 };
describe('k18 — official 2009 result', () => {
  it('parses the gazette leaders in family/given order', async () => {
    const lists = await parseCandidates(18);
    expect(lists.find(l => l.letters === 'כן')?.candidates[0].nameHe).toBe('לבני ציפי צפורה');
    expect(lists.find(l => l.letters === 'מחל')?.candidates[0].nameHe).toBe('נתניהו בנימין');
    expect(lists.find(l => l.letters === 'אמת')?.candidates[0].nameHe).toBe('ברק אהוד');
  });
  it('checks every roster count against the final rank in the candidate gazette', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k18.json', 'utf8'));
    expect(Object.fromEntries(ds.lists.map(l => [l.letters, l.candidates.length]))).toEqual({"פח": 12, "אמת": 120, "אר": 20, "ב": 34, "ג": 120, "ד": 105, "ה": 119, "ו": 119, "זך": 26, "חי": 48, "ט": 24, "ים": 23, "ינ": 9, "יק": 17, "כן": 120, "ל": 26, "מחל": 118, "מרצ": 120, "נ": 9, "נפ": 15, "נץ": 4, "נר": 10, "עם": 115, "פ": 12, "פי": 17, "פק": 2, "ץ": 11, "צי": 31, "ק": 40, "קנ": 9, "קפ": 7, "קץ": 16, "רק": 33, "שס": 114});
    expect(Object.fromEntries(ds.lists.filter(l => l.letters in seats).map(l => [l.letters, l.candidates[0].nameHe]))).toEqual({"אמת": "ברק אהוד", "ב": "הרשקוביץ דניאל", "ג": "ליצמן יעקב", "ד": "זחאלקה ג'מאל", "ו": "ברכה מוחמד", "ט": "כץ יעקב דב", "כן": "לבני ציפי צפורה", "ל": "ליברמן אביגדור", "מחל": "נתניהו בנימין", "מרצ": "אורון חיים", "עם": "צרצור אברהים", "שס": "ישי אליהו"});
    for (const l of ds.lists) expect(l.candidates.map(c => c.rank)).toEqual(Array.from({ length: l.candidates.length }, (_, i) => i + 1));
  });
  it('retains the withdrawn approved list and corrected formation-day snapshot', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k18.json', 'utf8'));
    expect(ds.lists.find(l => l.letters === 'פח')).toMatchObject({ withdrawn: true, votes: 0, candidates: expect.any(Array) });
    expect(ds.lists.find(l => l.letters === 'ו')?.nameHe).toContain('(המפלגה');
    expect(ds.lists.find(l => l.letters === 'מרצ')?.candidates[1].partyId).toBe('meretz');
    expect(ds.blocSchemes?.find(s => s.id === 'first-government')?.blocs.map(b => b.lists.length)).toEqual([5, 7]);
  });
  it('reproduces every gazetted seat, threshold and quota through the scenario model', () => {
    const ds: ElectionDataset = JSON.parse(readFileSync('public/data/k18.json', 'utf8'));
    expect(ds.lists.find(l => l.letters === 'כן')?.candidates[0].nameHe).toBe('לבני ציפי צפורה');
    const res = allocate(toEngineInput(scenarioFromDataset(ds)));
    for (const l of res.lists) expect(l.seats, l.id).toBe(seats[l.id.slice(3) as keyof typeof seats] ?? 0);
    expect(res.seatsAllocated).toBe(120);
    expect(res.thresholdVotes).toBe(67_470n);
    expect(res.quota).toEqual(rat(27_246n));
    expect(ds.totals).toMatchObject({ registered: 5_278_985, votesCast: 3_416_587, invalid: 43_097, valid: 3_373_490 });
    expect(ds.agreements.map(a => a.members.map(m => m.slice(3)))).toEqual([
      ['אמת', 'מרצ'], ['מחל', 'ל'], ['כן', 'רק'], ['ב', 'ט'], ['זך', 'צי'], ['שס', 'ג'], ['ו', 'עם'], ['חי', 'ה'],
    ]);
  });
});
