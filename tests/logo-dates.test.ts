import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validCampaignDate, type CampaignDate } from '../scripts/lib/build/logos.ts';
const elections = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as {date: string}[];
const year = (value: string): CampaignDate => ({ inUseDate: value, dateBasis: 'year-single-election', dateEvidence: {
  yearSource: 'exact-catalogue-year', yearEvidence: 'Catalogue gives this exact year without estimate.',
  campaignIdentity: 'ballot-letter', campaignEvidence: 'Official campaign poster shows list ballot letter.' } });
describe('decision 0089 year-only campaign evidence', () => {
  it.each(['1949', '1951', '1955', '1959', '1973'])('accepts a single-election year %s', value => {
    expect(validCampaignDate(year(value), elections.find(e => e.date.startsWith(value))!.date, elections)).toBe(true);
  });
  it('accepts a printed year and the 31 December 1973 election', () => {
    const e = year('1973'); e.dateEvidence!.yearSource = 'printed-year';
    expect(validCampaignDate(e, '1973-12-31', elections)).toBe(true);
  });
  it('rejects 2019, a non-election year, and another election year', () => {
    expect(validCampaignDate(year('2019'), '2019-04-09', elections)).toBe(false);
    expect(validCampaignDate(year('1950'), '1950-01-01', elections)).toBe(false);
    expect(validCampaignDate(year('1955'), '1959-11-03', elections)).toBe(false);
  });
  it('rejects estimated, missing, and non-campaign evidence', () => {
    for (const patch of [{yearSource: 'estimated'}, {yearEvidence: ''}, {campaignIdentity: 'party-name-only'}, {campaignEvidence: ''}]) {
      const e = year('1959'); Object.assign(e.dateEvidence!, patch);
      expect(validCampaignDate(e, '1959-11-03', elections)).toBe(false);
    }
    expect(validCampaignDate({inUseDate: '1959'}, '1959-11-03', elections)).toBe(false);
  });
  it('preserves exact-date checks, including impossible dates and future captures', () => {
    expect(validCampaignDate({inUseDate: '1959-11-03'}, '1959-11-03', elections)).toBe(true);
    for (const inUseDate of ['1959-11-04', '1959-02-30', '1959'])
      expect(validCampaignDate({inUseDate}, '1959-11-03', elections)).toBe(false);
  });
});
