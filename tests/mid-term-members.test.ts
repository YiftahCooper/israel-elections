import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { ELECTION_IDS } from '../src/data/schema.ts';

// Review fault A1 (19 Nov 2026): a party joining or leaving a government partway through a term never changed the
// government's member list. Where the data records the join or exit with its source, the change now carries the dated
// member list. The joins and exits it does not record yet, or records behind an earlier unrecorded change, are listed
// below as data gaps (night-1119/FV2/REPORT.md), so a new one cannot slip in unnoticed.
type Row = { letters?: string; factionNameHe?: string; seats: number | null; role?: string; certainty?: string };
type Change = { date: string; textEn: string; coalition?: Row[]; coalitionSeats?: number | null; knownMemberSeats?: number | null; membershipCoverage?: string };
const changes = (k: string) => (JSON.parse(readFileSync(`data/meta/aftermath/${k}.json`, 'utf8')).government?.changes ?? []) as Change[];
const at = (k: string, date: string) => changes(k).find((c) => c.date === date && c.coalition)!;
const ids = (c: Change) => c.coalition!.map((r) => r.factionNameHe ?? r.letters);
const row = (c: Change, id: string) => c.coalition!.find((r) => (r.factionNameHe ?? r.letters) === id || r.letters === id);
const counted = (c: Change) => c.coalition!.filter((r) => r.certainty !== 'unknown').map((r) => r.factionNameHe ?? r.letters);

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
  // Lane D3 (20 Nov 2026): the Knesset's own records date each join and exit (the day ministers took office, or the day
  // their departure took effect); the joining or leaving faction counts its members that day (night-1119/D3/REPORT.md).
  test('Gahal and Rafi join the national unity government on 5 June 1967', () => {
    const c = at('k6', '1967-06-05');
    expect(row(c, 'חל')!.seats).toBe(23); expect(row(c, 'כא')!.seats).toBe(10); expect(c.coalitionSeats).toBe(108);
    expect(changes('k6').some((x) => x.date === '1967-06-01' && x.coalition)).toBe(false);
  });
  test('the NRP joins Rabin\'s government on 30 October 1974', () => {
    const c = at('k8', '1974-10-30');
    expect(row(c, 'ב')!.seats).toBe(10); expect(c.coalitionSeats).toBe(71);
  });
  test('Shas leaves Rabin\'s government on 14 September 1993, when its ministers\' terms end', () => {
    const c = at('k13', '1993-09-14');
    expect(ids(c)).not.toContain('שס'); expect(c.coalitionSeats).toBe(56);
  });
  test('Labor–Meimad joins Sharon\'s government on 10 January 2005 and leaves on 23 November 2005', () => {
    const joined = at('k16', '2005-01-10');
    expect(row(joined, 'אמת')!.seats).toBe(19); expect(row(joined, 'אמת')!.role).toBe('member-with-ministries');
    expect(joined.coalitionSeats).toBeNull(); expect(joined.knownMemberSeats).toBe(64);
    const left = at('k16', '2005-11-23');
    expect(ids(left)).not.toContain('אמת'); expect(left.knownMemberSeats).toBe(46);
  });
  test('National Unity joins Netanyahu\'s government on 12 October 2023 and leaves on 13 June 2024', () => {
    const joined = at('k25', '2023-10-12');
    expect(row(joined, 'כן')!.seats).toBe(12); expect(joined.coalitionSeats).toBe(76);
    const left = at('k25', '2024-06-13');
    expect(ids(left)).not.toContain('כן'); expect(left.coalitionSeats).toBe(64);
  });
  test('a faction whose place after an exit is not recorded is shown but not counted', () => {
    const gesher = at('k15', '2000-08-04');
    expect(row(gesher, 'גשר')!.certainty).toBe('unknown'); expect(counted(gesher)).not.toContain('גשר');
    expect(row(gesher, 'אמת')!.seats).toBe(24); expect(row(gesher, 'אמת')!.certainty).toBe('confirmed');
    expect(gesher.membershipCoverage).toBe('partial'); expect(gesher.coalitionSeats).toBeNull(); expect(gesher.knownMemberSeats).toBe(30);
  });
  // Lane D3, round 3 (22 Nov 2026): R9's eight confirmed findings, each checked against the Knesset's own record
  // (night-1119/D3/REPORT.md, "Round 3").
  describe('round 3', () => {
    test('Yi\'ud joins without ministers on 13 July 1994; two of its three MKs join the government in January 1995', () => {
      const joined = at('k13', '1994-07-13');
      expect(row(joined, 'יעוד')).toMatchObject({ seats: 3, role: 'member-without-ministries', certainty: 'confirmed' }); expect(joined.coalitionSeats).toBe(59);
      const gov = at('k13', '1995-01-09');
      expect(row(gov, 'יעוד')).toMatchObject({ seats: 2, role: 'member-with-ministries' });
      expect(gov.membershipCoverage).toBe('partial'); expect(gov.coalitionSeats).toBeNull(); expect(gov.knownMemberSeats).toBe(58);
    });
    test('Yisrael BaAliyah counts 6 at the investiture and 4 from the split of 20 July 1999 to its exit', () => {
      const base = JSON.parse(readFileSync('data/meta/aftermath/k15.json', 'utf8')).government;
      expect(base.coalition.find((r: Row) => r.letters === 'כן').seats).toBe(6); expect(base.coalitionSeats).toBe(75);
      expect(at('k15', '1999-07-20').coalitionSeats).toBe(73); expect(at('k15', '1999-09').coalitionSeats).toBe(68);
      for (const date of ['1999-07-20', '1999-09', '2000-06-24']) expect(row(at('k15', date), 'כן')!.seats).toBe(4);
      expect(ids(at('k15', '2000-07-11'))).not.toContain('כן');
    });
    test('Agudat Yisrael and Degel HaTorah stay in the coalition after United Torah Judaism splits', () => {
      const c = at('k16', '2005-01-12');
      for (const f of ['אגודת ישראל', 'דגל התורה']) expect(row(c, f)).toMatchObject({ role: 'member-without-ministries', certainty: 'confirmed' });
      expect(row(at('k16', '2005-01-10'), 'ג')!.certainty).toBe('confirmed'); expect(c.knownMemberSeats).toBe(64);
    });
    test('the Likud splits on 23 November 2005 and leaves the government on 15 January 2006', () => {
      const split = at('k16', '2005-11-23');
      expect(row(split, 'מחל')!.seats).toBe(26); expect(row(split, 'אחריות לאומית')!.seats).toBe(15); expect(ids(split)).not.toContain('כן');
      const left = at('k16', '2006-01-15');
      expect(ids(left)).not.toContain('מחל'); expect(row(left, 'אחריות לאומית')!.seats).toBe(14); expect(left.knownMemberSeats).toBe(19);
    });
    test('New Hope: a minister without a coalition commitment in September 2024, a member from its agreement of 5 November', () => {
      const sept = at('k25', '2024-09-30');
      expect(row(sept, 'הימין הממלכתי')).toMatchObject({ role: 'other', certainty: 'confirmed' }); expect(sept.coalitionSeats).toBe(64);
      const nov = at('k25', '2024-11-05');
      expect(row(nov, 'הימין הממלכתי')).toMatchObject({ role: 'member-with-ministries', certainty: 'confirmed' }); expect(nov.coalitionSeats).toBe(68);
      for (const c of changes('k25').filter((x) => x.coalition && x.date >= '2025')) expect(row(c, 'הימין הממלכתי')!.certainty).toBe('confirmed');
    });
    test('July 2025: United Torah Judaism leaves the coalition, Shas stays in it without ministers', () => {
      for (const date of ['2025-07-17', '2025-07-20', '2025-07-22']) {
        const c = at('k25', date);
        expect(ids(c)).not.toContain('ג'); expect(c.membershipCoverage).toBe('complete'); expect(c.coalitionSeats).toBe(61);
        expect(row(c, 'שס')!.certainty).toBe('confirmed');
      }
      expect(row(at('k25', '2025-07-22'), 'שס')!.role).toBe('member-without-ministries');
      expect(changes('k25').some((c) => c.date === '2025-07-15' && !c.coalition)).toBe(true);
      expect(changes('k25').some((c) => c.date === '2025-10-23' && !c.coalition)).toBe(true);
    });
  });
  // Review of 9a8a48be: a count of one is singular in every aftermath string, the cite quotes included (they are our
  // description of a record, not a verbatim sentence). The Hebrew check skips 11, 21 and so on.
  test('no aftermath string says "1 members" or «1 חברים»', () => {
    const bad: string[] = [];
    const walk = (v: unknown, where: string): void => {
      if (typeof v === 'string') { if (/\b1 members\b/.test(v) || /(?<!\d)1 חברים/.test(v)) bad.push(`${where}: ${v.slice(0, 90)}`); }
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (v && typeof v === 'object') for (const [key, x] of Object.entries(v)) walk(x, `${where}.${key}`);
    };
    for (const k of ELECTION_IDS) {
      let text: string;
      try { text = readFileSync(`data/meta/aftermath/${k}.json`, 'utf8'); } catch { continue; }
      walk(JSON.parse(text), k);
    }
    expect(bad).toEqual([]);
    expect(/\b1 members\b/.test('11 members') || /(?<!\d)1 חברים/.test('21 חברים')).toBe(false);
  });
  test('every other change that says a party joined or left is a known data gap', () => {
    const KNOWN_GAPS = new Set<string>([]); // none left: lane D3 dated every recorded join and exit (night-1119/D3/REPORT.md)
    const open: string[] = [];
    for (const k of ELECTION_IDS) for (const c of changes(k))
      if (!c.coalition && /\b(joined the (government|coalition)|left the coalition|withdrawal|no minister (left|in the government)|ceased to serve|terms? of .* ministers? .*ended)/i.test(c.textEn) && !KNOWN_GAPS.has(`${k} ${c.date}`)) open.push(`${k} ${c.date}: ${c.textEn.slice(0, 80)}`);
    expect(open).toEqual([]);
  });
});
