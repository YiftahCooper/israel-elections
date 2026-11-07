import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from Official Gazette 49 p.400; NOT generated from engine output.
const published = {"א": 46, "ב": 16, "ג": 0, "ח": 14, "ט": 0, "יא": 0, "יג": 0, "יד": 2, "טו": 1, "יח": 0, "יט": 0, "ל": 1, "מ": 19, "נ": 1, "ס": 4, "פ": 5, "פד": 0, "צ": 7, "ק": 4, "ש": 0, "ת": 0};
describe('k1: released national evidence', () => {
  it('reconciles all gazette votes and CBS ballot totals, and clears the evidence gate', () => {
    const audit=verifyEarlyProgress(1,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(434684n);
    expect(audit.result.quota.num).toBe(3592n);
    expect(audit.review.nationalTotals).toEqual({"registered": 506567, "votesCast": 440095, "valid": 434684, "invalid": 5411});
    expect(audit.releaseReady).toBe(true);
    expect(earlyResearchDataset(1).hasLocalities).toBe(false);
  });
  it('resolves the former one-seat gap with contemporary connection evidence',()=>{
    const a=verifyEarlyProgress(1,{log:false});
    expect(a.differences).toEqual([]);
    expect(a.result.seatsAllocated).toBe(120);
    expect(a.review.agreements.complete).toBe(true);
  });
});

// Source fixtures: Gazette 43 pp.316/319/321/324/327, Gazette 49 pp.400–402;
// Knesset sitting 12, 10 March 1949, roll call. These are independent of the allocator.
describe('k1: reconciled 1949 source facts', () => {
  it('preserves the eight printed names, candidate IDs and excluded ranks', async () => {
    const { readFileSync } = await import('node:fs');
    const ds = JSON.parse(readFileSync('public/data/k1.json', 'utf8'));
    const names: Record<string, string> = {
      '1-א#1': 'בן-גוריון דוד', '1-ח#4': 'בן-אליעזר (זברובסקי) אריה',
      '1-ח#8': 'לנדאו חיים (הנריך)', '1-ח#10': 'ווינשל ד״ר אברהם',
      '1-ח#16': 'דאהן מ׳ משה', '1-יד#1': 'אלזועבי סיף-אלדין-מחמד סעיד אלזועבי',
      '1-ס#1': 'שטרית בכור שלום', '1-צ#6': 'קפטן גיל (ליפשיץ) יעקב',
    };
    const candidates = ds.lists.flatMap((l: { candidates: { id: string; nameHe: string; notSeated?: boolean }[] }) => l.candidates);
    for (const [id, nameHe] of Object.entries(names)) expect(candidates.find((c: { id: string }) => c.id === id)?.nameHe).toBe(nameHe);
    for (const id of ['1-ח#10', '1-ח#16']) expect(candidates.find((c: { id: string }) => c.id === id)?.notSeated).toBe(true);
  });
  it('distinguishes 75 supporting-list seats from the 73–45 vote and bounds consultations honestly', async () => {
    const { readFileSync } = await import('node:fs');
    const meta = JSON.parse(readFileSync('data/meta/k1.json', 'utf8'));
    const aftermath = JSON.parse(readFileSync('data/meta/aftermath/k1.json', 'utf8'));
    const blocs = meta.blocSchemes.find((s: { id: string }) => s.id === 'first-government').blocs;
    expect(blocs.map((b: { seats: number }) => b.seats)).toEqual([75, 45]);
    expect(blocs[0].members.map((m: { letters: string }) => m.letters)).toEqual(['א', 'ב', 'פ', 'ס', 'יד', 'נ', 'ל']);
    expect(aftermath.government.coalitionSeats).toBe(71);
    expect(aftermath.government.coalition.filter((r: { role: string }) => r.role === 'confidence-vote-only').reduce((sum: number, r: { seats: number }) => sum + r.seats, 0)).toBe(4);
    expect(aftermath.formation.events.find((e: { type: string }) => e.type === 'confidence-vote').votes).toEqual({ for: 73, against: 45 });
    expect(aftermath.recommendationRounds[0].date).toBe('1949-02');
    expect(aftermath.results.certificationDate).toBe('1949-02-07');
    expect(aftermath.results.firstSittingDate).toBe('1949-02-14');
    expect(aftermath.gaps.join(' ')).not.toContain('government 14');
  });
});
