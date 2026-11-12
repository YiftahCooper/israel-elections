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

// Fix lane fx-after (audit 12 Nov 2026): rules that hold for every record, not only the example the audit found.
import { groupingDisagreements, validTally, validateAftermathRecords } from '../scripts/lib/build/aftermath.ts';
import { participantName } from '../src/app/governmentSupport.ts';
import { romanize } from '../src/data/names.ts';
import { firstGovernmentComparison, recordedRoles } from '../src/app/coalitions.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { allocate } from '../src/engine/allocate.ts';
import { coalitionPieces } from '../src/app/derive.ts';

describe('After the election: rules over all records', () => {
  const records = Object.values(aftermathRecords);
  const dataset = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
  it('every record passes the build validation (tallies, names for the chart, roles, groupings)', () => {
    expect(validateAftermathRecords()).toBeGreaterThan(30);
  });
  it('c-aftermath-01: a recommendation round and the grouping it references agree list by list and seat by seat', () => {
    let compared = 0;
    for (const record of records) {
      const schemes = JSON.parse(readFileSync(`data/meta/${record.electionId}.json`, 'utf8')).blocSchemes ?? [];
      for (const round of record.recommendationRounds) {
        expect(groupingDisagreements(round as never, schemes), `${record.electionId}/${round.id}`).toEqual([]);
        if ((round as { blocSchemeRef?: string }).blocSchemeRef) compared++;
      }
    }
    expect(compared).toBeGreaterThanOrEqual(16);
    // the rule catches the 1988 disagreement the audit found: Hadash, PLP and ADP outside the Peres bloc
    const k12 = aftermathRecords.k12!.recommendationRounds[0];
    const stale = { id: 'pm-recommendations', blocs: [
      { id: 'shamir', seats: 63, members: ['מחל', 'שס', 'ג', 'ב', 'ת', 'ץ', 'ט'].map(letters => ({ letters })) },
      { id: 'peres', seats: 49, members: ['אמת', 'רצ', 'מפם', 'הן'].map(letters => ({ letters })) },
      { id: 'unconfirmed', seats: 8, members: ['ו', 'פ', 'ע', 'עץ'].map(letters => ({ letters })) }] };
    expect(groupingDisagreements(k12 as never, [stale])).toEqual(expect.arrayContaining([expect.stringContaining('r1/ו: round says peres, grouping says unconfirmed'), expect.stringContaining('r1/peres: grouping has 49 seats, round 55')]));
  });
  it('c-aftermath-04: a tally with a key the screen does not read fails validation', () => {
    expect(validTally({ for: 69, against: 45, abstained: 5 })).toBe(false);
    expect(validTally({ for: 69, against: 45, abstain: 5 })).toBe(true);
    expect(validTally({ for: 68, against: 48, absent: 4 })).toBe(true);
    expect(aftermathRecords.k18!.government!.confidenceVote).toEqual({ for: 69, against: 45, abstain: 5 });
  });
  it('c-aftermath-11: no party or faction name on the screen is a letter-by-letter transliteration, in either language', () => {
    let rows = 0;
    for (const record of records) {
      const ds = dataset(record.electionId);
      for (const snapshot of [record.government, ...(record.government?.changes ?? [])]) for (const entry of snapshot?.coalition ?? []) {
        for (const lang of ['en', 'he'] as const) {
          const { name, hebrew } = participantName(entry, ds.lists, lang);
          const label = `${record.electionId} ${entry.factionNameHe ?? entry.letters} ${lang}`;
          expect(name, label).toBeTruthy();
          if (lang === 'en') {
            expect(hebrew, label).toBe(false); // every recorded faction now has an English name
            expect(/[א-ת]/.test(name), label).toBe(false);
            if (entry.factionNameHe) expect(name, label).not.toBe(romanize(entry.factionNameHe));
          } else expect(/[א-ת]/.test(name), label).toBe(true);
        }
        rows++;
      }
    }
    expect(rows).toBeGreaterThan(200);
    // with no English name the Hebrew is shown, marked as Hebrew, never transliterated
    expect(participantName({ factionNameHe: 'מערך' }, [], 'en')).toEqual({ list: undefined, name: 'מערך', hebrew: true });
  });
  it('c-aftermath-03: the Recorded first government button and the comparison line use one definition, in all 26 elections', () => {
    const seen: Record<string, number> = {};
    for (const record of records) {
      const ds = dataset(record.electionId);
      const base = scenarioFromDataset(ds);
      const units = coalitionPieces(base, allocate(toEngineInput(base))).map(p => ({ id: p.id, listId: p.listId }));
      const { choices } = recordedRoles(record.government?.coalition ?? [], base.lists, units);
      const outcome = record.government ? (choices ? firstGovernmentComparison(choices.in, choices.support, choices) : 'button disabled') : 'no government';
      expect(outcome, record.electionId).not.toBe('different');
      seen[outcome] = (seen[outcome] ?? 0) + 1;
    }
    expect(Object.values(seen).reduce((a, b) => a + b, 0)).toBe(26);
    expect((seen.matches ?? 0) + (seen['matches-with-support'] ?? 0)).toBeGreaterThanOrEqual(20);
  });
  it('c-aftermath-05: acting and interim prime ministers carry their title as data, never inside the name', () => {
    const titled = records.flatMap(r => (r.government?.primeMinisters ?? []).filter(p => p.role).map(p => [r.electionId, p.nameEn, p.titleEn, p.titleHe]));
    expect(titled.sort((a, b) => Number(a[0]!.slice(1)) - Number(b[0]!.slice(1)))).toEqual([
      ['k6', 'Yigal Allon', 'acting Prime Minister', 'ראש הממשלה בפועל'],
      ['k13', 'Shimon Peres', 'acting Prime Minister', 'ראש הממשלה בפועל'],
      ['k16', 'Ehud Olmert', 'acting Prime Minister', 'ממלא מקום ראש הממשלה'],
      ['k16', 'Ehud Olmert', 'interim Prime Minister', 'ראש הממשלה בפועל'],
    ]);
  });
  it('c-aftermath-14: every government name follows one pattern', () => {
    for (const record of records) if (record.government) {
      const g = record.government;
      expect(g.nameEn, record.electionId).toBe(`Government ${g.number} (${g.primeMinisters[0].nameEn})`);
      expect(g.nameHe, record.electionId).toBe(`הממשלה ה־${g.number} (${g.primeMinisters[0].nameHe})`);
    }
  });
});
