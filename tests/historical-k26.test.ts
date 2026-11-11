import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildK26 } from '../scripts/lib/historical/k26.ts';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { attachDemographics } from '../scripts/lib/build/demographics.ts';
import { electionContext } from '../src/data/electionContext.ts';

describe('k26: CEC count, gazetted in the results notice YP 15100', () => {
  const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
  it('retains the 4 November totals and records the results notice as the official source', () => {
    expect(ds.totals).toMatchObject({ registered: 7331981, votesCast: 5717397, valid: 5691426, invalid: 25971 });
    expect(ds.status.asOf).toBe('2026-11-09');
    expect(ds.status.stage).toBe('official-final');
    expect(ds.officialSeats['26-מחל']).toBe(27);
    expect(Object.values(ds.officialSeats).reduce((a: number, b) => a + Number(b), 0)).toBe(120);
    expect(ds.officialSeatsSourceId).toBe('k26-results-gazette');
    expect(ds.sourceIds).toContain('k26-results-gazette');
    expect(ds.status.noteEn).toContain('Yalkut HaPirsumim 15100');
    expect(ds.status.noteHe).toContain('ילקוט הפרסומים 15100');
    // nothing describes 2026 as awaiting publication any more
    expect(`${ds.status.noteEn} ${ds.status.noteHe}`).not.toMatch(/unverified|not yet verified|לא אומת|טרם אומת/);
    expect(electionContext.events.filter(e => e.electionId === 'k26' && e.type === 'publication-status')).toEqual([]);
    const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; status: object }[];
    expect(index.find(e => e.id === 'k26')!.status).toEqual(ds.status);
  });
  it('reconciles every updated locality with polling rows and reproduces released data', async () => {
    const built = await buildK26();
    const actual = finalizeDataset(built.ds);
    expect({ ...actual, buildInfo: ds.buildInfo }).toEqual(ds);
    expect(actual.buildInfo.rawSha256).toEqual(ds.buildInfo.rawSha256);
    expect(attachDemographics(actual, built.loc)).toEqual(JSON.parse(readFileSync('public/data/k26-localities.json', 'utf8')));
  });
});

describe('k26 audit corrections', () => {
  it('attaches Ra’am legal events to Ra’am and its CEC source', () => {
    for (const id of ['list-excluded-k26-עם', 'list-restored-k26-עם', 'candidate-eligibility-k26-עם']) {
      expect(electionContext.events.find(e => e.id === id)).toMatchObject({
        listId: '26-עם', source: { url: 'https://www.gov.il/he/pages/raam_list18' },
      });
    }
    expect(electionContext.events.find(e => e.id === 'candidate-eligibility-k26-ד')).toBeUndefined();
  });
  it('records the completed consultation tally and the later official tasking consistently', () => {
    const aftermath = JSON.parse(readFileSync('data/meta/aftermath/k26.json', 'utf8'));
    const round = aftermath.recommendationRounds[0];
    expect(round.totals).toEqual({ eisenkot: 67, netanyahu: 46, none: 7 });
    expect(round.entries.find((e: { letters: string }) => e.letters === 'מחל')).toMatchObject({ status: 'recommended', nominee: 'netanyahu' });
    const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
    const scheme = ds.blocSchemes.find((s: { id: string }) => s.id === 'pm-recommendations');
    expect(Object.fromEntries(scheme.blocs.map((b: { id: string; lists: string[] }) => [b.id, b.lists.reduce((sum, id) => sum + ds.officialSeats[id], 0)]))).toEqual(round.totals);
    expect(aftermath.formation.events.filter((e: { type: string }) => e.type === 'mandate-given')).toMatchObject([
      { date: '2026-11-08', person: 'eisenkot' },
    ]);
  });
});

describe('k26 candidate gazette YP 15023, read from a disclosed mirror', () => {
  const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
  it('retains the reviewed ranks and party assignments as primary evidence', () => {
    const review = JSON.parse(readFileSync('data/raw/k26/candidates-gazette.reviewed.json', 'utf8'));
    for (const r of review.lists) {
      const l = ds.lists.find((l: { letters: string }) => l.letters === r.letters);
      expect(l.candidatesSource).toBe('k26-candidates-gazette');
      expect(l.candidatesSecondary).toBe(false);
      expect(l.notesHe[0]).toContain('olaw.org.il');
      expect(l.candidates.map((c: { rank: number; nameHe: string; partyHe: string }) => [c.rank, c.nameHe, c.partyHe]))
        .toEqual(r.candidates.map((c: { rank: number; name: string; party: string }) => [c.rank, c.name, c.party]));
    }
    const tzomet = ds.lists.find((l: { letters: string }) => l.letters === 'בי');
    expect(tzomet.candidates.filter((c: { partyId: string }) => c.partyId === 'beit-yemini').map((c: { rank: number }) => c.rank)).toEqual([1, 3, 4, 5, 8, 9]);
    expect(tzomet.parties.find((p: { id: string }) => p.id === 'beit-yemini').nameHe).toBe('בית ימני חברתי ציוני לכלל ישראל');
  });
  it('preserves both withdrawals and the already matching submitting-party names', () => {
    for (const [letters, name] of [['זך', 'למען אחיי מפלגת כלל ישראל'], ['רץ', 'מחנה ישראל'], ['צבי', 'חוזרים לשורשים']]) {
      expect(ds.lists.find((l: { letters: string }) => l.letters === letters).sponsorsHe).toBe(name);
    }
    const blue = ds.lists.find((l: { letters: string }) => l.letters === 'כן');
    expect(blue).toMatchObject({ withdrawn: true, votes: 0 });
    expect(blue.candidates).toHaveLength(39);
    expect(blue.notesHe).toContain('ועדת הבחירות המרכזית: "הרשימה אינה מתמודדת בבחירות לכנסת ה-26".');
    expect(ds.lists.find((l: { letters: string }) => l.letters === 'צבי')).toMatchObject({ withdrawn: true, candidates: [], votes: 0 });
  });
});
