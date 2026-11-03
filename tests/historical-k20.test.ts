import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset, LocalityDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { rat } from '../src/engine/rational.ts';
import { createHash } from 'node:crypto';

const read = (p: string) => JSON.parse(readFileSync(join(import.meta.dirname, '..', p), 'utf8'));
const ds = read('public/data/k20.json') as ElectionDataset;
const res = allocate(toEngineInput(scenarioFromDataset(ds)));

// Independent expected values transcribed from YP7010 pp4370–4371, NOT engine output.
const SEATS: Record<string, number> = { מחל:30, אמת:24, ודעם:13, פה:11, כ:10, טב:8, שס:7, ל:6, ג:6, מרצ:5 };
// Each endpoint checked in YP7000 pp3938–3952 (including singleton יך and יץ #10).
const COUNTS = { אמת:120, ג:119, ודעם:120, ז:11, זך:28, זץ:20, טב:108, י:11, יז:9, יך:1, יץ:10, כ:33, ל:30, מחל:119, מרצ:120, נז:9, ני:8, נץ:5, ע:40, פה:120, ף:13, ףץ:10, קנ:63, קץ:26, רק:11, שס:120 };

describe('k20: gazetted final result and complete registered rosters', () => {
  it('reproduces every list’s published seats through the application scenario pipeline', () => {
    expect(ds.officialSeatsSourceId).toBe('k20-results-gazette');
    expect(res.seatsAllocated).toBe(120);
    expect(res.warnings).toEqual([]);
    expect(res.lists).toHaveLength(26);
    for (const l of res.lists) {
      expect(l.seats, l.id).toBe(SEATS[l.id.slice(3)] ?? 0);
      expect(ds.officialSeats![l.id], l.id).toBe(SEATS[l.id.slice(3)] ?? 0);
    }
  });
  it('uses official national totals, exact threshold 136,854 and general quota 33,511', () => {
    expect(ds.totals).toMatchObject({ registered:5881696, votesCast:4254738, invalid:43854, valid:4210884, ballotBoxes:10414, localities:1195, envelopeVotes:234599 });
    expect(res.totalValid).toBe(4210884n);
    expect(res.thresholdVotes).toBe(136854n);
    // 4,021,367 qualifying votes /120, floored under section 81(b).
    expect(res.quota).toEqual(rat(33511n));
    expect(res.initialSeatsTotal).toBe(116);
    expect(res.remainderSeatsTotal).toBe(4);
  });
  it('keeps every gazetted candidate, contiguous ranks and plausible leaders', () => {
    expect(Object.fromEntries(ds.lists.map(l => [l.letters, l.candidates.length]))).toEqual(COUNTS);
    for (const l of ds.lists) {
      expect(l.candidatesSecondary).toBe(false);
      expect(l.candidatesSource).toBe('k20-candidates-gazette');
      expect(l.candidates.every((c, i) => c.rank === i + 1 && c.id === `${l.id}#${i + 1}` && !!c.familyHe && !!c.givenHe)).toBe(true);
      expect(l.candidates.length).toBeGreaterThanOrEqual(SEATS[l.letters] ?? 0);
    }
    const leaders = { מחל:'נתניהו בנימין', אמת:'הרצוג יצחק', ודעם:'עודה איימן', פה:'לפיד יאיר', כ:'כחלון משה', טב:'בנט נפתלי', שס:'דרעי אריה מכלוף', ל:'ליברמן אביגדור', ג:'ליצמן יעקב', מרצ:'גלאון זהבה' };
    for (const [letters, name] of Object.entries(leaders)) expect(ds.lists.find(l => l.letters === letters)!.candidates[0].nameHe).toBe(name);
    expect(ds.lists.find(l => l.letters === 'יץ')!.candidates[9].nameHe).toBe('בדראן סעיד');
    expect(ds.lists.find(l => l.letters === 'מחל')!.notesHe.join(' ')).toContain('ילינסון');
  });
  it('includes all four pairs numbered in YP7001 p3954, independently of their seat effects', () => {
    expect(ds.agreements.map(a => a.members)).toEqual([['20-אמת','20-מרצ'],['20-ג','20-שס'],['20-טב','20-מחל'],['20-כ','20-ל']]);
    expect(ds.agreements.every(a => a.sourceId === 'k20-surplus-gazette')).toBe(true);
    expect(res.agreements.every(a => a.active)).toBe(true);
    expect(ds.blocs).toEqual([]);
  });
  it('verifies the committed locality rows against retained polling reconciliation evidence', () => {
    const loc = read('public/data/k20-localities.json') as LocalityDataset;
    const evidence = read('data/raw/k20/locality-verification.json');
    expect(createHash('sha256').update(JSON.stringify(loc.rows)).digest('hex')).toBe(evidence.localitySha256);
    expect(evidence.ballotSha256).toBe(ds.buildInfo.rawSha256['k20-ballots-datagov']);
    expect(loc.listIds).toEqual(Object.keys(COUNTS).map(l => `20-${l}`));
    expect(loc.rows.reduce((s, r) => s + r.valid, 0)).toBe(4210884);
    for (const r of loc.rows) expect(r.votes.reduce((a, b) => a + b, 0)).toBe(r.valid);
  });
});
