import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { ELECTION_IDS } from '../src/data/schema.ts';

// Review fault A1 (19 Nov 2026): a party joining or leaving a government partway through a term never changed the
// government's member list. Where the data records the join or exit with its source, the change now carries the dated
// member list. The joins and exits it does not record yet, or records behind an earlier unrecorded change, are listed
// below as data gaps (night-1119/FV2/REPORT.md), so a new one cannot slip in unnoticed.
type Row = { letters?: string; factionNameHe?: string; seats: number | null };
type Change = { date: string; textEn: string; coalition?: Row[]; coalitionSeats?: number | null };
const changes = (k: string) => (JSON.parse(readFileSync(`data/meta/aftermath/${k}.json`, 'utf8')).government?.changes ?? []) as Change[];
const at = (k: string, date: string) => changes(k).find((c) => c.date === date && c.coalition)!;
const ids = (c: Change) => c.coalition!.map((r) => r.factionNameHe ?? r.letters);

describe('a mid-term join or exit changes the member list, dated', () => {
  test('the seven recorded joins and exits each carry the new member list', () => {
    expect(ids(at('k4', '1960-07-18'))).toContain('פועלי אגודת ישראל'); expect(at('k4', '1960-07-18').coalitionSeats).toBe(89);
    expect(ids(at('k9', '1977-10-24'))).toContain('יש'); expect(at('k9', '1977-10-24').coalitionSeats).toBe(77);
    expect(ids(at('k17', '2006-10-30'))).toContain('ל'); expect(at('k17', '2006-10-30').coalitionSeats).toBe(78);
    expect(ids(at('k17', '2008-01-18'))).not.toContain('ל'); expect(at('k17', '2008-01-18').coalitionSeats).toBe(67);
    expect(ids(at('k19', '2014-12-04'))).toEqual(['מחל', 'טב']); expect(at('k19', '2014-12-04').coalitionSeats).toBe(43);
    expect(ids(at('k20', '2016-05-30'))).toContain('ל'); expect(at('k20', '2016-05-30').coalitionSeats).toBe(67);
    expect(ids(at('k20', '2018-11-18'))).not.toContain('ל'); expect(at('k20', '2018-11-18').coalitionSeats).toBe(61);
  });
  test('every other change that says a party joined or left is a known data gap', () => {
    const KNOWN_GAPS = new Set([
      'k16 2004-12-04', 'k16 2005-01-10', // the National Union's dismissal (June 2004) and the NRP's exit (Nov 2004) are not recorded before them
      'k18 2011-01-19', 'k18 2012-05-09', 'k18 2012-07-19', // UTJ's accession of 1 April 2009 is a note without a quoted source
      'k25 2023-10-12', 'k25 2025-07-20', // recorded person by person: no source yet says which factions joined or left
    ]);
    const open: string[] = [];
    for (const k of ELECTION_IDS) for (const c of changes(k))
      if (!c.coalition && /\b(joined the (government|coalition)|left the coalition|withdrawal|no minister (left|in the government)|ceased to serve|terms? of .* ministers? .*ended)/i.test(c.textEn) && !KNOWN_GAPS.has(`${k} ${c.date}`)) open.push(`${k} ${c.date}: ${c.textEn.slice(0, 80)}`);
    expect(open).toEqual([]);
  });
});
