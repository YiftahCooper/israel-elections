import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { aftermathRecords, recommendationPieces, visibleTermEvents, validateAftermath } from '../src/data/aftermath-runtime.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

describe('reviewed aftermath history', () => {
  for (const record of Object.values(aftermathRecords)) it(`${record.electionId}: audited sources, ballot letters, seats and totals`, () => {
    const ds = JSON.parse(readFileSync(`public/data/${record.electionId}.json`, 'utf8')) as ElectionDataset;
    expect(record.status).toBe('reviewed');
    expect(validateAftermath(record, ds)).toEqual([]);
    for (const round of record.recommendationRounds) {
      expect(recommendationPieces(round).reduce((n, p) => n + p.seats, 0)).toBe(120);
    }
  });
  it('excludes single-source events and duplicate citations from the history page', () => {
    const event = { date: '2021-01-01', textEn: 'Test', textHe: 'בדיקה', cites: [{ source: 'one', quote: 'a' }, { source: 'one', quote: 'b' }] };
    expect(visibleTermEvents([event])).toEqual([]);
    expect(visibleTermEvents([{ ...event, cites: [...event.cites, { source: 'two', quote: 'c' }] }])).toHaveLength(1);
  });
  it('reports corrupt totals, seats and missing sources', () => {
    const record = structuredClone(aftermathRecords.k24!);
    record.recommendationRounds[0].totals.netanyahu++;
    record.recommendationRounds[0].entries[0].seats++;
    record.formation.events[0].cites.push({ source: 'missing', quote: 'bad' });
    const ds = JSON.parse(readFileSync('public/data/k24.json', 'utf8')) as ElectionDataset;
    expect(validateAftermath(record, ds).length).toBeGreaterThanOrEqual(3);
  });
});
