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
  it('two factions sitting at the same time never share a name (2022: Otzma Yehudit is not “Religious Zionism”)', () => {
    // the Knesset registers Otzma Yehudit (1106) apart from Religious Zionism (1097, then 1105) from the first day
    expect(rt.factions[1106].slice(0, 2)).toEqual(['עוצמה יהודית', 'Otzma Yehudit']);
    expect(rt.factions[1097].slice(0, 2)).toEqual(['הציונות הדתית', 'Religious Zionism']);
    expect(rt.factions[1105].slice(0, 2)).toEqual(['הציונות הדתית', 'Religious Zionism']);
    const clash: string[] = [];
    for (let k = 1; k <= 25; k++) {
      const reg = (JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')).factionRegistry as { id: number; start: string; end: string | null }[]).filter((f) => f.start !== f.end);
      for (const a of reg) for (const b of reg) if (a.id < b.id && a.start < (b.end ?? '9') && b.start < (a.end ?? '9'))
        for (const i of [0, 1] as const) if (rt.factions[a.id][i] === rt.factions[b.id][i]) clash.push(`k${k}: ${a.id} and ${b.id} both “${rt.factions[a.id][i]}”`);
    }
    expect(clash).toEqual([]);
  });
  it('durations read naturally in both languages', () => {
    expect(servedText(400, 'en')).toBe('1 year 1 month');
    expect(servedText(800, 'he')).toBe('שנתיים וחודשיים');
    expect(servedText(1300, 'he')).toBe('3 שנים ו־6 חודשים');
    expect(servedText(12, 'en')).toBe('12 days');
  });
});

// The audit of 12 Nov 2026 against the Knesset's live record (.backup-scratch/audit-1112/cx-factions): what the card
// shows must equal the stored record (data/research/knesset-member-changes), every Knesset, not a sample.
describe('factions shown equal the Knesset record', () => {
  type Row = { factionId: number; start: string; end: string | null; startTime?: string; endTime?: string; cites: { recordId: number }[] };
  type Ten = { id: number; personId: number; start: string; end: string | null; factions: Row[] };
  const record = (k: number) => JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')) as { tenures: Ten[]; factionRegistry: { id: number; nameHe: string }[] };
  const YASINOV = 1054, BENNETT = 23511;
  const row = (p: number, k: number) => mkView(rt, p)!.rows.find((r) => r.k === k)!;

  it('Yasinov, 1 Feb 2006: the record’s times of day order the day, ending in the faction that continues', () => {
    const t = record(16).tenures.find((x) => x.personId === YASINOV)!;
    // the record: Shinui 10:01–10:59, HaOlim 11:01–11:59, National Union 12:01–12:59, Yisrael Beiteinu to 17 Apr
    const timed = t.factions.filter((f) => f.startTime).map((f) => [f.cites[0].recordId, f.factionId, f.startTime, f.endTime]);
    expect(timed).toEqual([[29890, 1078, '10:01', '10:59'], [28398, 588, '11:01', '11:59'], [28399, 45, '12:01', '12:59']]);
    const r = row(YASINOV, 16);
    expect(r.terms[0].segments.map((s) => [s.faction, s.start, s.end, s.startTime ?? null, s.endTime ?? null])).toEqual([
      [43, '2003-02-17', '2005-05-18', null, null], [1038, '2005-05-18', '2006-02-01', null, null],
      [1078, '2006-02-01', '2006-02-01', '10:01', '10:59'], [588, '2006-02-01', '2006-02-01', '11:01', '11:59'],
      [45, '2006-02-01', '2006-02-01', '12:01', '12:59'], [590, '2006-02-01', '2006-04-17', null, null]]);
    expect(r.events.filter((e) => e.date === '2006-02-01').map((e) => [e.time ?? null, e.faction!.now.en, e.faction!.was.en])).toEqual([
      ['10:01', 'Shinui', 'Shinui'], ['11:01', 'HaOlim', 'Shinui'], ['12:01', 'National Union', 'HaOlim'], [null, 'Yisrael Beiteinu', 'National Union']]);
  });

  it('a record that starts and ends at the same midnight is never shown: no faction, no change, no bar (all 25 Knessets)', () => {
    const zero: string[] = [];
    for (let k = 1; k <= 25; k++) for (const t of record(k).tenures) for (const f of t.factions)
      if (f.end === f.start && !f.startTime && !f.endTime) zero.push(`${t.personId}:${f.factionId}:${f.start}`);
    // 28 such rows: Peled (k14) twice, Lasry and Milo (k15), 22 in the 2020 Blue and White split (k23), Bennett and Sofer
    // (k24). Yasinov's three rows on 1 Feb 2006 have times of day and are not among them.
    expect(zero).toHaveLength(28);
    expect(zero).toContain(`${BENNETT}:1085:2022-08-15`); // record 30147, kept in the data
    for (const z of zero) {
      const [p, f, d] = z.split(':');
      for (const r of mkView(rt, Number(p))!.rows) {
        expect(r.terms.flatMap((t) => t.segments).some((s) => s.faction === Number(f) && s.start === d && s.end === d), z).toBe(false);
        expect(r.events.some((e) => e.kind === 'faction' && e.date === d && (e.faction!.now as { faction?: number }).faction === Number(f)), z).toBe(false);
      }
    }
    for (const [id] of Object.entries(rt.people)) for (const r of mkView(rt, Number(id))!.rows) for (const s of r.terms.flatMap((t) => t.segments))
      expect(s.end > s.start || !!s.startTime, `${id} k${r.k} ${s.faction}`).toBe(true);
    // Bennett, 15 Aug 2022: Yamina to Together, with no National Unity line
    expect(row(BENNETT, 24).events.filter((e) => e.kind === 'faction').map((e) => [e.date, e.faction!.now.en, e.faction!.was.en])).toEqual([
      ['2022-08-15', 'Together (Bennett)', 'Yamina'], ['2022-09-06', 'Yamina', 'Together (Bennett)']]);
  });

  it('a faction is shown only while the member sat; the record keeps its own dates (all 25 Knessets)', () => {
    for (const [id] of Object.entries(rt.people)) for (const r of mkView(rt, Number(id))!.rows) for (const t of r.terms) for (const s of t.segments)
      expect(s.start >= t.start && s.end <= t.end, `${id} k${r.k} ${s.faction} ${s.start}..${s.end} in ${t.start}..${t.end}`).toBe(true);
    const k25 = record(25).tenures;
    const cases: [number, string, string | null, string | null, string | null][] = [
      // person, record start, record end, shown start, shown end
      [30768, '2025-07-01', '2025-07-16', '2025-07-02', '2025-07-16'], // Baruchi
      [30868, '2023-01-02', null, '2023-01-03', null], // Mashriki
      [30875, '2023-02-09', null, '2023-02-10', null], // Melaku
      [30880, '2023-03-31', '2023-10-15', '2023-03-31', '2023-10-14'], // Buaron
    ];
    for (const [p, rs, re, ss, se] of cases) {
      const t = k25.find((x) => x.personId === p && x.factions.some((f) => f.start === rs))!;
      expect([t.factions[0].start, t.factions[0].end], `record ${p}`).toEqual([rs, re]);
      const packed = rt.people[p].terms.find((x) => x[0] === 25 && x[1] === t.start)!;
      expect([packed[3][0][1], packed[3][0][2]], `shown ${p}`).toEqual([ss, se]);
    }
  });

  it('one English name for one Hebrew faction name, in every Knesset', () => {
    const reg = new Map<number, string>();
    for (let k = 1; k <= 25; k++) for (const f of record(k).factionRegistry) reg.set(f.id, normName(f.nameHe));
    // the identical registered name יהדות התורה (13th–15th, 20th, 21st and 25th Knessets)
    expect([589, 631, 10, 908, 928, 1101].map((f) => [reg.get(f), rt.factions[f][1]])).toEqual(Array(6).fill(['יהדות התורה', 'United Torah Judaism']));
    // Left as they are, each for a stated reason: the owner's open question on factions named after their list
    // (fac-names: 361 in 1973, the NRP in 1992–2003), and the list labels' own conventions, which belong to the lists
    // ("United Arab List" and "Ra'am"; straight and curly apostrophes in Hadash–Ta’al and Ra’am–Ta’al).
    const OPEN = new Set([361, 575, 615, 9]);
    const LIST_CONVENTION = new Set(['רע״ם', 'חד״ש–תע״ל', 'רע״ם–תע״ל']);
    const byShown = new Map<string, Set<string>>();
    for (const [id, [he, en]] of Object.entries(rt.factions)) {
      if (OPEN.has(Number(id)) || LIST_CONVENTION.has(he) || !en) continue;
      (byShown.get(he) ?? byShown.set(he, new Set()).get(he)!).add(en);
    }
    expect([...byShown].filter(([, en]) => en.size > 1).map(([he, en]) => `${he}: ${[...en].join(' / ')}`)).toEqual([]);
  });
});
