import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildK26 } from '../scripts/lib/historical/k26.ts';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { attachDemographics } from '../scripts/lib/build/demographics.ts';
import { electionContext } from '../src/data/electionContext.ts';

describe('k26: refreshed CEC count without inferred gazettal', () => {
  const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
  it('retains the 4 November totals and keeps unverified publication explicit', () => {
    expect(ds.totals).toMatchObject({ registered: 7331981, votesCast: 5717397, valid: 5691426, invalid: 25971 });
    expect(ds.status.asOf).toBe('2026-11-06');
    expect(ds.status.stage).toBe('official-final');
    expect(ds.officialSeats['26-מחל']).toBe(27);
    expect(Object.values(ds.officialSeats).reduce((a: number, b) => a + Number(b), 0)).toBe(120);
    expect(ds.officialSeatsSourceId).toBe('k26-official-results');
    expect(ds.status.noteEn).toContain('unverified');
    expect(ds.status.noteHe).toContain('לא אומת');
    const about = electionContext.events.find(e => e.id === 'pending-gazette')!;
    expect(about.effectiveDate).toBe(ds.status.asOf);
    expect(about.textEn).toBe(ds.status.noteEn);
    expect(about.textHe).toBe(ds.status.noteHe);
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
  it('records the completed consultation tally consistently without a completed tasking', () => {
    const aftermath = JSON.parse(readFileSync('data/meta/aftermath/k26.json', 'utf8'));
    const round = aftermath.recommendationRounds[0];
    expect(round.totals).toEqual({ eisenkot: 67, netanyahu: 46, none: 7 });
    expect(round.entries.find((e: { letters: string }) => e.letters === 'מחל')).toMatchObject({ status: 'recommended', nominee: 'netanyahu' });
    const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
    const scheme = ds.blocSchemes.find((s: { id: string }) => s.id === 'pm-recommendations');
    expect(Object.fromEntries(scheme.blocs.map((b: { id: string; lists: string[] }) => [b.id, b.lists.reduce((sum, id) => sum + ds.officialSeats[id], 0)]))).toEqual(round.totals);
    expect(aftermath.formation.events.every((e: { type: string }) => e.type === 'consultations')).toBe(true);
  });
});
