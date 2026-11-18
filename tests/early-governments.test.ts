import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { citedSources } from '../scripts/lib/build/evidence.ts';
import { certaintyCeiling } from '../src/data/evidence.ts';

// 19 Nov 2026: governments 3-7 and Meir's government of 17 March 1969 (Knesset numbering: government 14; Galnoor and
// Blander's row 15). Seats are counted from the Knesset's faction records on each snapshot date: a list counts at its
// election seats, and an MK who sat in another list's faction is listed under individuals (countedInFactionSeats false).
const load = (k: string) => JSON.parse(readFileSync(`data/meta/aftermath/${k}.json`, 'utf8'));
const factions = JSON.parse(readFileSync('data/raw/bios/knesset-odata-faction-positions.json', 'utf8')) as { FactionID: number; PersonID: number; KnessetNum: number; StartDate: string; FinishDate: string | null }[];
const k2 = load('k2'), k3 = load('k3'), k6 = load('k6');
const changes = (d: any) => d.government.changes as any[];
const gov = (d: any, n: number) => n === d.government.number ? d.government : changes(d).find(c => c.number === n && c.coalition);
const midTerm = (d: any, date: string) => changes(d).find(c => c.date === date && c.scope === 'mid-term');
const row = (g: any, key: string) => g.coalition.find((r: any) => r.letters === key || (!r.letters && r.factionNameHe === key));
const ceiling = (d: any, r: any) => certaintyCeiling(citedSources(r.cites, d.sources));
/** MKs in a faction on a date, by the Knesset's records (a membership ends on its FinishDate). */
const inFaction = (knesset: number, id: number, date: string) => new Set(factions.filter(f => f.KnessetNum === knesset && f.FactionID === id && f.StartDate.slice(0, 10) <= date && (!f.FinishDate || f.FinishDate.slice(0, 10) > date)).map(f => f.PersonID)).size;

// faction IDs in the Knesset's records for the coalition rows
const K2: Record<string, number> = { 'א': 149, 'צ': 155, 'ו': 173, 'ב': 169, 'פ': 161, 'ג': 171, 'ד': 165, 'יד': 151, 'נ': 181, 'ע': 159, 'ל': 179 };
const K6: Record<string, number> = { 'מערך': 299, 'חל': 287, 'ב': 303, 'לע': 305, 'ד': 293, 'רא': 988, 'יא': 989, 'הסיעה הדרוזית הישראלית': 987, 'אחווה יהודית - ערבית': 297 };

describe('member totals equal the Knesset faction records on each snapshot date', () => {
  const cases: [string, any, number, Record<string, number>, number][] = [
    ['government 3', gov(k2, 3), 2, K2, 65], ['government 3 after the Agudat parties left', midTerm(k2, '1952-09-18'), 2, K2, 60],
    ['government 4', gov(k2, 4), 2, K2, 87], ['government 5', gov(k2, 5), 2, K2, 85], ['government 5 with the Progressives', midTerm(k2, '1954-02-01'), 2, K2, 89],
    ['government 6', gov(k2, 6), 2, K2, 67], ['government 14 (Meir, March 1969)', gov(k6, 14), 6, K6, 106],
  ];
  for (const [name, g, knesset, ids, seats] of cases) it(name, () => {
    const date = g.startDate ?? g.date;
    const members = g.coalition.filter((r: any) => r.role.startsWith('member-'));
    // each faction's rows plus the individuals who sat in it are its MKs on that date
    const counted = members.reduce((n: number, r: any) => n + inFaction(knesset, ids[r.letters && ids[r.letters] ? r.letters : r.factionNameHe], date), 0);
    expect([g.coalitionSeats, g.membershipCoverage, counted]).toEqual([seats, 'complete', seats]);
    const rows = members.reduce((n: number, r: any) => n + r.seats, 0) + (g.individuals ?? []).filter((i: any) => !i.countedInFactionSeats).length;
    expect(rows).toBe(seats);
  });
});

describe('governments 3-6 (Second Knesset)', () => {
  it('government 3: Mizrahi cites its own minister, Pinkas, not Hapoel HaMizrahi’s Shapira', () => {
    expect(row(gov(k2, 3), 'ב').cites.map((c: any) => c.quote)).toEqual([expect.stringMatching(/^PersonToPositionID 3881; PersonID 2546;/)]);
  });
  it('government 3: Poalei Agudat Yisrael is a confirmed member without ministries (a report of the time and a book)', () => {
    const r = row(gov(k2, 3), 'ד');
    expect([r.role, r.certainty, ceiling(k2, r)]).toEqual(['member-without-ministries', 'confirmed', 'confirmed']);
    expect(r.cites.map((c: any) => c.source)).toEqual(['jta-1952-09-19', 'galnoor-blander-2018-table', 'goldberg-1998']);
  });
  it('September 1952: both Agudat parties leave; Mizrahi stays without a minister (probable)', () => {
    const c = midTerm(k2, '1952-09-18');
    expect([c.type, c.governmentNumber, c.confidenceVote, c.reconciliation.status]).toEqual(['coalition-withdrawal', 3, undefined, 'vote-unavailable']);
    expect(c.coalition.map((r: any) => r.letters)).toEqual(['א', 'ו', 'ב', 'יד', 'נ', 'ע']);
    expect([row(c, 'ב').role, row(c, 'ב').certainty]).toEqual(['member-without-ministries', 'probable']);
  });
  it('government 4: the three MKs who joined the General Zionists on 10 September 1951 make 87', () => {
    const g = gov(k2, 4);
    expect(row(g, 'צ').seats).toBe(20);
    expect(g.individuals.map((i: any) => [i.id, i.fromLetters, i.countedInFactionSeats, i.vote])).toEqual([
      ['eliahu-eliashar', 'סצ', false, 'unknown'], ['benjamin-sassoon', 'סצ', false, 'unknown'], ['shimon-garidi', 'ל', false, 'unknown']]);
    for (const i of g.individuals) expect(i.cites[0].quote).toMatch(/FactionID 155; StartDate 1951-09-10/);
    expect([row(g, 'ב').certainty, ceiling(k2, row(g, 'ב'))]).toEqual(['confirmed', 'confirmed']);
    for (const l of ['יד', 'נ', 'ע']) expect(row(g, l).cites[0].source).toBe('plenum-250692');
  });
  it('government 4: the General Zionists’ short exit is two dated steps, not a snapshot', () => {
    const steps = changes(k2).filter(c => c.governmentNumber === 4 && c.scope === 'mid-term');
    expect(steps.map(c => [c.date, !!c.coalition])).toEqual([['1953-05-25', false], ['1953-06-03', false]]);
    expect(steps[1].cites[0]).toMatchObject({ source: 'plenum-250727', locator: 'p. 1481' });
  });
  it('government 5: Mizrahi is named; the Progressives are outside at formation and in from 1 February 1954', () => {
    const g = gov(k2, 5);
    expect(row(g, 'ב')).toMatchObject({ role: 'member-without-ministries', certainty: 'confirmed' });
    expect(row(g, 'פ')).toBeUndefined();
    expect(g.individuals.map((i: any) => i.id)).toEqual(['eliahu-eliashar', 'benjamin-sassoon', 'shimon-garidi', 'david-livschitz', 'hannah-lamdan']);
    const feb = midTerm(k2, '1954-02-01');
    expect(row(feb, 'פ')).toMatchObject({ seats: 4, role: 'member-with-ministries', certainty: 'confirmed' });
    expect(row(feb, 'פ').cites[0].quote).toMatch(/^PersonToPositionID 3851; PersonID 2600;.*StartDate 1954-02-01/);
  });
  it('government 6: the Yemenite Association is a confirmed member without ministries', () => {
    const r = row(gov(k2, 6), 'ל');
    expect([r.seats, r.role, r.certainty]).toEqual([1, 'member-without-ministries', 'confirmed']);
    expect(r.cites[0].quote).toMatch(/הצטרפותי לקואליציה/);
    expect([r.noteEn, r.noteHe].every(Boolean)).toBe(true);
  });
});

describe('government 7 and government 14', () => {
  it('government 7: Rosen’s resignation and return are dated steps; the formation count stays 80', () => {
    expect(changes(k3).filter(c => c.governmentNumber === 7).map(c => c.date)).toEqual(['1956-02-13', '1956-02-28']);
    expect(k3.government.coalitionSeats).toBe(80);
  });
  it('government 14: all nine factions Meir named, the four one-MK partners without ministries', () => {
    const g = gov(k6, 14);
    expect(g.roleGap).toBeUndefined();
    expect(g.coalition.map((r: any) => [r.letters ?? r.factionNameEn, r.seats, r.role])).toEqual([
      ['Alignment', 63, 'member-with-ministries'], ['חל', 22, 'member-with-ministries'], ['ב', 11, 'member-with-ministries'], ['לע', 4, 'member-with-ministries'],
      ['ד', 2, 'member-without-ministries'], ['רא', 1, 'member-without-ministries'], ['יא', 1, 'member-without-ministries'],
      ['Israeli Druze Faction', 1, 'member-without-ministries'], ['Jewish–Arab Brotherhood', 1, 'member-without-ministries']]);
    for (const r of g.coalition) expect(r.cites[0].source).toBe('presentation-gov14');
    expect(g.reconciliation.note).toMatch(/Galnoor and Blander count 107/);
  });
});
