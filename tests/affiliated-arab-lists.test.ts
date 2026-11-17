import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { claimCertainty } from '../scripts/lib/build/evidence.ts';

// 17 Nov 2026: Mapai's affiliated Arab lists, governments 1-17, are coalition members without ministries. Galnoor and
// Blander's coalition table (2018, Table 11.2, with its note naming the lists) and Kenig and Rahat (2023, p. 386, note 22)
// are two independent books. The 1984 New York Times and 1981 Davar reports are second sources for k11 and k10.
const load = (k: string) => JSON.parse(readFileSync(`data/meta/aftermath/${k}.json`, 'utf8'));
const AFFILIATED: Record<string, string[]> = { k1: ['יד'], k2: ['יד', 'נ', 'ע'], k3: ['יד', 'נ', 'ע'], k4: ['רא', 'יא', 'ע'],
  k5: ['יא', 'רא'], k6: ['רא', 'יא'], k7: ['רא', 'יא'], k8: ['רא', 'עא'] };
const snapshots = (d: any) => [d.government, ...(d.government.changes ?? []).filter((c: any) => c.coalition)];

describe("Mapai's affiliated Arab lists", () => {
  it('every affiliated row in governments 1-17 is a confirmed member without ministries, with a note in both languages', () => {
    let n = 0;
    for (const [k, letters] of Object.entries(AFFILIATED)) for (const g of snapshots(load(k))) for (const r of g.coalition) {
      if (!letters.includes(r.letters)) continue;
      n++;
      expect([k, g.number, r.letters, r.role, r.certainty]).toEqual([k, g.number, r.letters, 'member-without-ministries', 'confirmed']);
      expect(r.noteEn).toMatch(/affiliated with Mapai/);
      expect(r.noteHe).toMatch(/הנלוות למפא״י/);
    }
    expect(n).toBe(39);
  });
  it('rows settled from the books cite both independent works', () => {
    for (const [k, letters] of Object.entries(AFFILIATED)) {
      const d = load(k);
      for (const g of snapshots(d)) for (const r of g.coalition.filter((x: any) => letters.includes(x.letters) && x.cites.some((c: any) => c.source === 'kenig-rahat-2023'))) {
        const families = new Set(r.cites.map((c: any) => d.sources[c.source].evidenceFamily).filter(Boolean));
        expect(families.has('author:galnoor') && families.has('author:kenig-rahat')).toBe(true);
      }
    }
  });
  it('publishes a member total only where every row has a role and the rows match the book', () => {
    const totals: Record<number, number | null> = {};
    for (const k of Object.keys(AFFILIATED)) for (const g of snapshots(load(k))) if (g.number) totals[g.number] = g.coalitionSeats;
    expect(totals).toMatchObject({ 1: 73, 2: 73, 3: 65, 4: null, 5: null, 6: null, 7: 80, 8: 80, 9: 86, 10: 68, 11: 68, 12: 68, 13: 75, 14: null, 15: 102, 16: 68, 17: 61 });
  });
});

describe('second sources for 1981 and 1984', () => {
  it('1984: The New York Times reports the 60-54-5 totals and Kach not invited', () => {
    const k11 = load('k11'), round = k11.recommendationRounds[0];
    expect(round.cites.some((c: any) => c.source === 'nyt-1984-08-06' && /60 .*54 .*five/.test(c.quote))).toBe(true);
    const kach = round.entries.find((e: any) => e.letters === 'כך');
    expect(kach.cites.map((c: any) => c.source)).toEqual(['jta1984mandate', 'nyt-1984-08-06', 'bradley-1985']);
    expect(claimCertainty(kach, k11.sources)).toBe('confirmed');
    expect(k11.sources['nyt-1984-08-06'].retainedArtifact).toBe('owner’s private copy of the article');
  });
  it('1981: Davar’s printed page has Tami proposing Begin', () => {
    const k10 = load('k10'), tami = k10.recommendationRounds[0].entries.find((e: any) => e.letters === 'ני');
    const davar = tami.cites.find((c: any) => c.source === 'davar-1981-07-15-p1');
    expect([tami.status, tami.nominee, davar.scanChecked]).toEqual(['recommended', 'begin', true]);
    expect(davar.quote).toMatch(/שמנחם בגין ירכיב את הממשלה הבאה/);
    expect(claimCertainty(tami, k10.sources)).toBe('confirmed');
  });
});
