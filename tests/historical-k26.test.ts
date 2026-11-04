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
    expect(ds.status.asOf).toBe('2026-11-04');
    expect(ds.status.stage).toBe('final-count-pending-publication');
    expect(ds.officialSeats).toBeNull();
    expect(ds.officialSeatsSourceId).toBeNull();
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
