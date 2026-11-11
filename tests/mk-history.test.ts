// Each MK's own history (scripts/mk-history-runtime.ts, src/history/mk.ts): who is matched to which candidacy, from
// which elections runs that did not win a seat are shown, and the facts the card is built from.
import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { compileMkHistory, normName, type MkReview, type MkRuntime } from '../scripts/mk-history-runtime.ts';
import { mkView, personOfCandidate, servedText } from '../src/history/mk.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

const SILMAN = 30718, SHAKED = 23512, ILLOUZ = 30839, BEN_GURION = 2198, EICHLER = 1057, HAZAN = 2348;
let rt: MkRuntime;
const review: MkReview = { leftOut: [], anomalies: [] };
const ds = (k: number) => JSON.parse(readFileSync(`public/data/k${k}.json`, 'utf8')) as ElectionDataset;
const candidate = (id: string) => ds(Number(id.split('-')[0])).lists.flatMap((l) => l.candidates).find((c) => c.id === id)!;
const runs = (p: number) => rt.people[p].runs.map(([k, list, rank, outcome, basis, via]) => ({ k, list, rank, outcome, basis, via }));

beforeAll(() => { rt = compileMkHistory(process.cwd(), review); });

describe('who gets a history', () => {
  it('everyone who sat in the Knesset, and those elected to the 26th', () => {
    const served = new Set<number>();
    for (let k = 1; k <= 25; k++) for (const t of JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')).tenures) served.add(t.personId);
    for (const p of served) expect(rt.people[p], `person ${p}`).toBeDefined();
    for (const [id, p] of Object.entries(rt.people)) if (!served.has(Number(id))) expect(p.runs.some((r) => r[0] === 26 && r[3] === 'elected'), `person ${id}`).toBe(true);
    expect(review.anomalies).toEqual([]);
  });
  it('a candidacy belongs to at most one person', () => {
    const seen = new Map<string, number>();
    for (const [id, p] of Object.entries(rt.people)) for (const r of p.runs) {
      const c = `${r[1]}#${r[2]}`;
      expect(seen.get(c), c).toBeUndefined();
      seen.set(c, Number(id));
    }
    expect(personOfCandidate(rt, '25-מחל#16')).toBe(SILMAN);
    expect(personOfCandidate(rt, '18-שס#77')).toBeNull(); // a Yaakov Hazan on Shas 2009 is not the Mapam MK
  });
});

describe('runs that did not win a seat', () => {
  it('adds only the 14 source-confirmed identities from the November research review', () => {
    const audit = JSON.parse(readFileSync('data/raw/research/mk-runs-1109.reviewed.json', 'utf8'));
    expect(audit.runs).toHaveLength(123);
    expect(new Set(audit.runs.map((r: { candidateId: string }) => r.candidateId)).size).toBe(123);
    expect(audit.counts).toEqual({ confirmed: 14, 'ruled out': 17, unknown: 92 });
    for (const r of audit.runs) {
      if (r.status === 'confirmed') {
        expect(personOfCandidate(rt, r.candidateId), r.candidateId).toBe(r.personId);
        expect(rt.people[r.personId].runs.find((run) => `${run[1]}#${run[2]}` === r.candidateId)?.[4]).toBe('id');
        expect(r.sourceIds.length).toBeGreaterThan(0);
      } else {
        expect(personOfCandidate(rt, r.candidateId), r.candidateId).toBeNull();
        expect(review.leftOut.some((x) => x.candidateId === r.candidateId)).toBe(true);
      }
      expect(r.queries.length, r.candidateId).toBeGreaterThan(0);
      for (const source of r.sourceIds) expect(audit.sources[source]).toBeDefined();
    }
    // The two David Azoulais are different people; the MK was still alive in 2009,
    // but already stood for Shas. In 2026 his death separately rules the identity out.
    expect(personOfCandidate(rt, '18-שס#7')).toBe(483);
    expect(personOfCandidate(rt, '18-כן#79')).toBeNull();
    expect(personOfCandidate(rt, '26-ל#13')).toBeNull();
  });
  it('widens official roster coverage only after reading all ranks in the gazette', () => {
    for (const [k, id, count] of [[16, '16-ף', 11], [17, '17-כ', 10]] as const) {
      const l = ds(k).lists.find((l) => l.id === id)!;
      expect(l.candidates).toHaveLength(count);
      expect(l.candidates.map((c) => c.rank)).toEqual(Array.from({ length: count }, (_, i) => i + 1));
      expect(l.candidatesUnavailable).toBeFalsy();
      expect(l.candidatesTruncated).toBeFalsy();
      expect(rt.failedRunCoverage.partial[k]).toContain(id);
    }
    expect(ds(17).lists.find((l) => l.id === '17-כ')!.candidates[2].nameHe).toBe('בן ארי מיכאל');
    expect(rt.failedRunCoverage.partial[16]).toHaveLength(14);
    expect(rt.failedRunCoverage.partial[17]).toHaveLength(19);
  });
  it('are shown from 2009 on, and in 2003 and 2006 only on the lists we hold in full', () => {
    expect(rt.failedRunCoverage.full).toEqual([18, 19, 20, 21, 22, 23, 24, 25, 26]);
    expect(Object.keys(rt.failedRunCoverage.partial)).toEqual(['16', '17']);
    expect(rt.failedRunCoverage.partial[16]).toContain('16-מחל'); // Likud 2003: the whole list
    expect(rt.failedRunCoverage.partial[16]).not.toContain('16-אמת'); // Labor–Meimad 2003: only those elected
    expect(rt.failedRunCoverage.excluded[26] ?? []).toEqual([]); // both formerly secondary rosters verified against YP 15023
    for (const p of Object.values(rt.people)) for (const r of p.runs) if (r[3] === 'out') {
      const k = r[0];
      const ok = rt.failedRunCoverage.full.includes(k) ? !(rt.failedRunCoverage.excluded[k] ?? []).includes(r[1]) : (rt.failedRunCoverage.partial[k] ?? []).includes(r[1]);
      expect(ok, `${r[1]}#${r[2]}`).toBe(true);
    }
  });
  it('a run matched by name has the same listed name, letter for letter, as a run tied by the Knesset member ID', () => {
    let n = 0;
    for (const p of Object.values(rt.people)) for (const r of p.runs) if (r[4] === 'name') {
      n++;
      const via = p.runs.find((x) => x[0] === r[5] && x[4] === 'id')!;
      expect(via, `${r[1]}#${r[2]}`).toBeDefined();
      expect(normName(candidate(`${r[1]}#${r[2]}`).nameHe)).toBe(normName(candidate(`${via[1]}#${via[2]}`).nameHe));
    }
    expect(n).toBeGreaterThan(500);
  });
  it('anything uncertain is left out, with its reason', () => {
    expect(review.leftOut.find((x) => x.candidateId === '18-שס#77')?.reason).toMatch(/two-word name on a list of another party/);
    expect(review.leftOut.some((x) => /more than one person/.test(x.reason))).toBe(true);
    expect(review.leftOut.some((x) => /same election/.test(x.reason))).toBe(true);
    expect(runs(HAZAN).every((r) => r.k < 18)).toBe(true);
  });
});

describe('the owner’s examples', () => {
  it('Idit Silman: six runs, three not elected, one seat from the first sitting', () => {
    expect(runs(SILMAN).map((r) => [r.k, r.rank, r.outcome, r.basis])).toEqual([
      [21, 5, 'elected', 'id'], [22, 8, 'out', 'name'], [23, 7, 'out', 'name'], [24, 8, 'first', 'id'], [25, 16, 'elected', 'id'], [26, 46, 'out', 'name'],
    ]);
    const v = mkView(rt, SILMAN)!;
    const k24 = v.rows.find((r) => r.k === 24)!;
    expect(k24.run!.notes[0][0]).toMatch(/Idit Silman \(#8\) sat from the first sitting/);
    expect(k24.events.map((e) => [e.date, e.kind])).toEqual([['2022-04-06', 'recorded'], ['2022-09-13', 'left']]);
    expect(k24.events[0].sources!.length).toBeGreaterThan(0);
    expect(v.rows.find((r) => r.k === 26)!.run).toMatchObject({ rank: 46, seats: 27, outcome: 'out' });
  });
  it('Ayelet Shaked: the 2019 and 2022 lists below the threshold', () => {
    const v = mkView(rt, SHAKED)!;
    const k21 = v.rows.find((r) => r.k === 21)!.run!;
    expect(k21).toMatchObject({ rank: 2, seats: 0, share: 3.22, threshold: 3.25, outcome: 'out', basis: 'name', via: 22 });
    expect(v.rows.find((r) => r.k === 25)!.run).toMatchObject({ rank: 1, seats: 0, share: 1.19, outcome: 'out' });
    expect(v.rows.find((r) => r.k === 20)!.events).toEqual([expect.objectContaining({ date: '2018-12-30', kind: 'faction' })]);
  });
  it('Dan Illouz: entered later in 2023, not elected in 2026 (No. 10 on a list that won 7)', () => {
    expect(runs(ILLOUZ).map((r) => [r.k, r.list, r.rank, r.outcome])).toEqual([[25, '25-מחל', 33, 'later'], [26, '26-ל', 10, 'out']]);
    const v = mkView(rt, ILLOUZ)!;
    expect(v.rows[0].events.map((e) => [e.date, e.kind])).toEqual([['2023-01-06', 'entered'], ['2026-08-13', 'left']]);
  });
  it('David Ben-Gurion: seven Knessets from 1949, factions named in English', () => {
    const v = mkView(rt, BEN_GURION)!;
    expect(v.rows.map((r) => r.k)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(v.rows[5].terms[0].segments.map((s) => s.en)).toEqual(['Rafi', 'MK David Ben-Gurion']);
    expect(servedText(v.daysServed, 'en')).toBe('21 years 3 months');
  });
  it('Israel Eichler: the recorded Norwegian-law report, then leaving, without an invented reason', () => {
    const k25 = mkView(rt, EICHLER)!.rows.find((r) => r.k === 25)!;
    expect(k25.events.map((e) => e.kind)).toEqual(['recorded', 'left']);
    expect(k25.events[0].text!.en).toMatch(/Norwegian-law/);
    expect(k25.events[0].evidence).toBe('Contemporary report');
  });
});

describe('names', () => {
  it('every faction anyone sat in has an English name', () => {
    const used = new Set(Object.values(rt.people).flatMap((p) => p.terms.flatMap((t) => t[3].map((f) => f[0]))));
    expect([...used].filter((f) => !rt.factions[f]?.[1])).toEqual([]);
  });
  it('durations read naturally in both languages', () => {
    expect(servedText(400, 'en')).toBe('1 year 1 month');
    expect(servedText(800, 'he')).toBe('שנתיים וחודשיים');
    expect(servedText(1300, 'he')).toBe('3 שנים ו־6 חודשים');
    expect(servedText(12, 'en')).toBe('12 days');
  });
});
