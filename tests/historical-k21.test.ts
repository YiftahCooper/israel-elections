import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset, LocalityDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { rat } from '../src/engine/rational.ts';
import { createHash } from 'node:crypto';

const read = (p: string) => JSON.parse(readFileSync(join(import.meta.dirname, '..', p), 'utf8'));
const ds = read('public/data/k21.json') as ElectionDataset;
const res = allocate(toEngineInput(scenarioFromDataset(ds)));
// Independent expectations transcribed from the retained official nationalresults.html.
const SEATS: Record<string, number> = { מחל:35, פה:35, שס:8, ג:8, ום:6, אמת:6, ל:5, טב:5, מרצ:4, כ:4, דעם:4 };
// Audited printed end ranks in YP8168 pp9022–9046, not inferred from seat counts.
const COUNTS = { אמת:120, ג:119, דעם:115, ום:118, ז:111, זי:16, זך:1, זנ:18, זץ:14, טב:48, י:17, יז:5, ין:7, יץ:23, כ:33, ךק:8, ל:20, מחל:118, מרצ:120, נ:24, נז:10, נך:11, נץ:25, נר:18, ן:12, ןך:10, ןנ:5, פה:120, ףז:11, ףי:9, ףך:18, ףנ:6, ףץ:34, צק:10, ץ:19, ץז:12, ץי:23, ק:6, קי:7, קן:9, קף:17, ר:16, שס:117 };

describe('k21: CEC official final result and complete registered rosters', () => {
  it('reproduces every list’s published seats through the application scenario pipeline', () => {
    expect(ds.officialSeatsSourceId).toBe('k21-national-html');
    expect(res.seatsAllocated).toBe(120);
    expect(res.warnings).toEqual([]);
    expect(res.lists).toHaveLength(43);
    for (const l of res.lists) {
      expect(l.seats, l.id).toBe(SEATS[l.id.slice(3)] ?? 0);
      expect(ds.officialSeats![l.id], l.id).toBe(SEATS[l.id.slice(3)] ?? 0);
    }
  });
  it('uses official totals, exact threshold 140,052 and quota 32,860', () => {
    expect(ds.totals).toMatchObject({ registered:6339729, votesCast:4340253, invalid:30983, valid:4309270, ballotBoxes:10765, localities:1213, envelopeVotes:240783 });
    expect(res.totalValid).toBe(4309270n);
    expect(res.thresholdVotes).toBe(140052n);
    expect(res.quota).toEqual(rat(32860n));
    expect(res.initialSeatsTotal).toBe(113);
    expect(res.remainderSeatsTotal).toBe(7);
  });
  it('keeps audited counts and names, deduplicating only identical printed ranks', () => {
    expect(Object.fromEntries(ds.lists.map(l => [l.letters, l.candidates.length]))).toEqual(COUNTS);
    for (const l of ds.lists) {
      expect(l.candidatesSecondary).toBe(false);
      expect(l.candidatesSource).toBe('k21-candidates-gazette');
      expect(l.candidates.every((c, i) => c.rank === i + 1 && c.id === `${l.id}#${i + 1}` && !!c.familyHe && !!c.givenHe)).toBe(true);
      expect(l.candidates.length).toBeGreaterThanOrEqual(SEATS[l.letters] ?? 0);
    }
    const leaders = { מחל:'נתניהו בנימין', פה:'גנץ בנימין', שס:'דרעי אריה מכלוף', ג:'ליצמן יעקב', ום:'עודה איימן', אמת:'גבאי אברהם', ל:'ליברמן אביגדור', טב:'פרץ רפאל', מרצ:'זנדברג תמר', כ:'כחלון משה', דעם:'עבאס מנסור', נ:'בנט נפתלי' };
    for (const [letters, name] of Object.entries(leaders)) expect(ds.lists.find(l => l.letters === letters)!.candidates[0].nameHe).toBe(name);
    expect(ds.lists.find(l => l.letters === 'אמת')!.candidates[99].nameHe).toBe('סולודר עדנה');
    expect(ds.lists.find(l => l.letters === 'שס')!.candidates[69].nameHe).toBe('בן שלמה שמעון');
    expect(ds.lists.find(l => l.letters === 'פה')!.candidates[0].partyHe).toBe('חוסן ישראל');
  });
  it('includes all six pairs in YP8178 p9310, including the ineffective minor-list pair', () => {
    expect(ds.agreements.map(a => a.members)).toEqual([['21-אמת','21-מרצ'],['21-ג','21-שס'],['21-נ','21-ל'],['21-מחל','21-טב'],['21-דעם','21-ום'],['21-ףץ','21-ףז']]);
    expect(ds.agreements.every(a => a.sourceId === 'k21-surplus-gazette')).toBe(true);
    expect(res.agreements.find(a => a.members.includes('21-נ'))).toMatchObject({ active:false, reason:'member-failed-threshold' });
    expect(res.agreements.find(a => a.members.includes('21-ףץ'))).toMatchObject({ active:false, reason:'member-failed-threshold' });
    expect(ds.blocs).toEqual([]);
  });
  it('verifies committed locality rows against the retained polling reconciliation evidence', () => {
    const loc = read('public/data/k21-localities.json') as LocalityDataset;
    const evidence = read('data/raw/k21/locality-verification.json');
    expect(createHash('sha256').update(JSON.stringify(loc.rows)).digest('hex')).toBe(evidence.localitySha256);
    expect(evidence.ballotSha256).toBe(ds.buildInfo.rawSha256['k21-ballots-datagov']);
    expect(new Set(loc.listIds)).toEqual(new Set(ds.lists.map(l => l.id)));
    expect(loc.rows.reduce((s, r) => s + r.valid, 0)).toBe(4309270);
    for (const r of loc.rows) expect(r.votes.reduce((a, b) => a + b, 0)).toBe(r.valid);
  });
});
