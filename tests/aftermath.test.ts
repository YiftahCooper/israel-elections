import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { aftermathRecords, recommendationPieces, visibleTermEvents, validateAftermath } from '../src/data/aftermath-runtime.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
import { claimCertainty } from '../scripts/lib/build/evidence.ts';

describe('reviewed aftermath history', () => {
  it('k26: official faction notices reconcile with the grouping and distinguish tasking from a government', () => {
    const record = aftermathRecords.k26!;
    const round = record.recommendationRounds[0];
    expect(round.totals).toEqual({ eisenkot: 67, netanyahu: 46, none: 7 });
    expect(round.entries).toHaveLength(11); // Religious Zionism and Zehut share one six-seat election list.
    for (const entry of round.entries) {
      expect(entry.cites?.length).toBeGreaterThan(0);
      expect(claimCertainty(entry, record.sources)).toBe('confirmed');
    }
    expect(round.entries.find(e => e.letters === 'ט')?.cites).toHaveLength(2);
    const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8')) as ElectionDataset;
    const scheme = ds.blocSchemes!.find(s => s.id === 'pm-recommendations')!;
    for (const bloc of scheme.blocs) {
      expect(bloc.lists.reduce((sum, id) => sum + ds.officialSeats![id], 0)).toBe(round.totals[bloc.id]);
      expect(bloc.lists.slice().sort()).toEqual(round.entries.filter(e => (e.nominee ?? e.status) === bloc.id).map(e => ds.lists.find(l => l.letters === e.letters)!.id).sort());
    }
    expect(record.formation.events.find(e => e.type === 'mandate-given')).toMatchObject({ date: '2026-11-08', person: 'eisenkot', days: 28 });
    expect(record.formation.events.some(e => e.date === '2026-11-07' && e.type === 'mandate-given')).toBe(false);
    expect(record.government).toBeUndefined();
    expect(record.formation.events.some(e => e.type === 'confidence-vote')).toBe(false);
  });
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
