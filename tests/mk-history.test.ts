// Each MK's own history (scripts/mk-history-runtime.ts, src/history/mk.ts): who is matched to which candidacy, from
// which elections runs that did not win a seat are shown, and the facts the card is built from.
import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { compileMkHistory, normName, type MkReview, type MkRuntime } from '../scripts/mk-history-runtime.ts';
import { mkView, personOfCandidate, servedText } from '../src/history/mk.ts';
import { englishLabel } from '../src/data/names.ts';
import { mixHex } from '../src/data/colour.ts';
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
    // left out in the review as "a two-word name on a list of another party"; the gazette sponsor line has since shown the
    // list is Yachad's own (data/meta/parties.json, yachad-filing-2019), so the name rule ties it as for Feiglin's 22-זן
    const sinceSameParty: Record<string, number> = { '21-זנ#1': 494 };
    for (const r of audit.runs) {
      if (sinceSameParty[r.candidateId]) {
        expect(r.status).toBe('unknown');
        expect(personOfCandidate(rt, r.candidateId)).toBe(sinceSameParty[r.candidateId]);
        expect(rt.people[sinceSameParty[r.candidateId]].runs.find((run) => `${run[1]}#${run[2]}` === r.candidateId)?.slice(3, 5)).toEqual(['withdrawn', 'name']);
      } else if (r.status === 'confirmed') {
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
    // 1097 is the list's own faction and takes its name; 1106 and 1105 are shown under their recorded names
    expect(rt.factions[1106].slice(0, 2)).toEqual(['עוצמה יהודית בראשות איתמר בן גביר', 'Otzma Yehudit led by Itamar Ben Gvir']);
    expect(rt.factions[1097].slice(0, 2)).toEqual(['הציונות הדתית', 'Religious Zionism']);
    expect(rt.factions[1105].slice(0, 2)).toEqual(['הציונות הדתית בראשות בצלאל סמוטריץ׳', 'Religious Zionism led by Bezalel Smotrich']);
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
      ['10:01', 'Shinui', 'Shinui – Party of the Secular and the Middle Class'], ['11:01', 'HaOlim', 'Shinui'], ['12:01', 'National Union', 'HaOlim'], [null, 'Yisrael Beiteinu', 'National Union']]);
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
    // Bennett, 15 Aug 2022: Yamina to Beyahad (ביחד), with no National Unity line. Not "Together (Bennett)": that is the
    // English of his 2026 list ביחד בראשות בנט, and nothing stored says the 2022 faction is that party.
    expect(row(BENNETT, 24).events.filter((e) => e.kind === 'faction').map((e) => [e.date, e.faction!.now.en, e.faction!.was.en])).toEqual([
      ['2022-08-15', 'Beyahad', 'Yamina'], ['2022-09-06', 'Yamina', 'Beyahad']]);
  });

  it('a faction is shown only while the member sat; the record keeps its own dates (all 25 Knessets)', () => {
    for (const [id] of Object.entries(rt.people)) for (const r of mkView(rt, Number(id))!.rows) for (const t of r.terms) for (const s of t.segments)
      expect(s.start >= t.start && s.end <= t.end, `${id} k${r.k} ${s.faction} ${s.start}..${s.end} in ${t.start}..${t.end}`).toBe(true);
    const k25 = record(25).tenures;
    const cases: [number, string, string | null, string | null, string | null][] = [
      // person, record start, record end, shown start, shown end
      [30768, '2025-07-01', '2025-07-16', '2025-07-02', '2025-07-16'], // Baruchi
      // the 25th Knesset's records close on 10 Nov 2026, the day the 26th opened (refreshed 12 Nov 2026)
      [30868, '2023-01-02', '2026-11-10', '2023-01-03', '2026-11-10'], // Mashriki
      [30875, '2023-02-09', '2026-11-10', '2023-02-10', '2026-11-10'], // Melaku
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
    // the NRP's recorded name מפלגה דתית לאומית: "National Religious Party" in every Knesset, not "NRP" in 1992–2003
    expect([237, 575, 615, 9, 49].map((f) => [reg.get(f), rt.factions[f][1]])).toEqual(Array(5).fill(['מפלגה דתית לאומית', 'National Religious Party']));
    // Left as they are: the list labels' own conventions, which belong to the lists ("United Arab List" and "Ra'am";
    // straight and curly apostrophes in Hadash–Ta’al and Ra’am–Ta’al).
    const LIST_CONVENTION = new Set(['רע״ם', 'חד״ש–תע״ל', 'רע״ם–תע״ל']);
    const byShown = new Map<string, Set<string>>();
    for (const [, [he, en]] of Object.entries(rt.factions)) {
      if (LIST_CONVENTION.has(he) || !en) continue;
      (byShown.get(he) ?? byShown.set(he, new Set()).get(he)!).add(en);
    }
    expect([...byShown].filter(([, en]) => en.size > 1).map(([he, en]) => `${he}: ${[...en].join(' / ')}`)).toEqual([]);
  });
});

// Audit 12 Nov 2026 (fx-names, findings ax-famous-early-01/02, ax-famous-late-01/02/03, ax-names-rosters-01/02/03,
// ax-build-guesses-02, c-famous-early-01/02/03, c-famous-late-01/02/03): a faction is shown under the name the Knesset
// recorded for it. Its list's short name stands in only for the list's own faction, formed by its elected members at
// the opening; a name or colour never comes from a later party or from another election's list that shares a word.
describe('a faction is shown under its own recorded name', () => {
  const changes = (k: number) => JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')) as
    { factionRegistry: { id: number; nameHe: string; start: string }[]; checks: { openingDateReported?: string } };
  it('joint factions keep every partner; renamed factions keep their own name (both languages)', () => {
    const shown = (f: number) => rt.factions[f].slice(0, 2);
    expect(shown(980)).toEqual(['אגודת ישראל - פועלי אגודת ישראל', 'Agudat Yisrael–Poalei Agudat Yisrael']);
    expect(shown(982)).toEqual(['הפועל המזרחי - המזרחי', 'Hapoel HaMizrahi–Mizrahi']);
    expect(shown(645)).toEqual(['ליכוד - צומת', 'Likud–Tzomet']);
    expect(shown(7)).toEqual(['האיחוד הלאומי - ישראל ביתנו', 'National Union–Yisrael Beiteinu']);
    expect(shown(502)).toEqual(['העבודה - מימד - עם אחד', 'Labor–Meimad–Am Ehad']);
    expect(shown(935)).toEqual(['הבית היהודי - האיחוד הלאומי', 'Jewish Home–National Union']);
    expect(shown(955)).toEqual(['יש עתיד - תל״ם', 'Yesh Atid–Telem']);
    expect(shown(956)).toEqual(['העבודה - מרצ', 'Labor–Meretz']);
    expect(shown(1110)).toEqual(['כחול לבן - המחנה הממלכתי', 'Blue and White–National Unity']);
    expect(shown(1017)).toEqual(['רפ״י - הרשימה הממלכתית', 'Rafi–State List']);
    expect(shown(1022)).toEqual(['רפ״י - הרשימה הממלכתית', 'Rafi–State List']);
    expect(shown(1015)).toEqual(['פיתוח ושלום', 'Development and Peace']); // not Flatto-Sharon's 1984 list label
    expect(shown(462)).toEqual(['צל״ש - ציונות ליברליות שוויון', 'Tzalash']); // not New Right, founded 2018
    expect(shown(361)).toEqual(['יהדות התורה - אגודת ישראל ודתיים בלתי מפלגתיים', 'Torah Judaism–Agudat Yisrael and Non-Partisan Religious']); // not UTJ (1992)
    expect(shown(998)).toEqual(['יעד - תנועה לזכויות האזרח', 'Yaad–Civil Rights Movement']); // not the 1981 list Yaad
    expect(shown(1019)).toEqual(['גשר - מרכז ציוני דתי', 'Gesher – Zionist Religious Centre']); // not the 2019 list Gesher
  });
  it('their colours are not the colours of those later or unrelated lists', () => {
    const colour = (id: string) => rt.lists[id][2];
    expect(rt.factions[361][2]).not.toBe(colour('13-ג'));
    expect(rt.factions[998][2]).not.toBe(colour('10-יס'));
    expect(rt.factions[1019][2]).not.toBe(colour('21-נר'));
    expect(rt.factions[1015][2]).not.toBe(colour('11-פש'));
  });
  it('every faction not formed at the opening shows its recorded Hebrew name; every colour comes from a list up to the next election (all 25 Knessets)', () => {
    const wrong: string[] = [];
    for (let k = 1; k <= 25; k++) {
      const ch = changes(k);
      const allowed = new Set(Object.entries(rt.lists).filter(([id]) => Number(id.split('-')[0]) <= k + 1).map(([, l]) => l[2]));
      const home = new Set(Object.entries(rt.lists).filter(([id]) => Number(id.split('-')[0]) === k).map(([, l]) => l[2]));
      for (const f of ch.factionRegistry) {
        const [he, , c] = rt.factions[f.id];
        if (f.start !== ch.checks.openingDateReported && he !== normName(f.nameHe)) wrong.push(`k${k} ${f.id}: ${he} for ${f.nameHe}`);
        // a list's colour (up to the next election), or a lighter shade of a list of this election, or none
        if (c && !allowed.has(c) && ![...home].some((h) => mixHex(h, '#ffffff', 0.45) === c)) wrong.push(`k${k} ${f.id}: colour ${c}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe('a move line never reads “X (until then X)”', () => {
  it('in either language, for every member (c-famous-late-03)', () => {
    const same: string[] = [];
    for (const id of Object.keys(rt.people)) for (const r of mkView(rt, Number(id))!.rows) for (const e of r.events) if (e.kind === 'faction') {
      const { now, was } = e.faction!;
      if (now.he === was.he) same.push(`${id} k${r.k} ${e.date} he ${now.he}`);
      if (englishLabel(now.en, now.he) === englishLabel(was.en, was.he)) same.push(`${id} k${r.k} ${e.date} en ${now.en}`);
    }
    expect(same).toEqual([]);
  });
  it('where two factions are shown under one list name, the line gives their recorded names', () => {
    const BEN_ELIEZER = 435, GANTZ = 30657;
    const line = (p: number, k: number, d: string) => mkView(rt, p)!.rows.find((r) => r.k === k)!.events.find((e) => e.kind === 'faction' && e.date === d)!.faction!;
    expect(line(BEN_ELIEZER, 18, '2011-01-17')).toMatchObject({ now: { he: 'העבודה', en: 'Labor' }, was: { he: 'העבודה בראשות אהוד ברק', en: 'Labor led by Ehud Barak' } });
    expect(line(GANTZ, 23, '2020-03-29')).toMatchObject({ now: { he: 'כחול לבן', en: 'Blue and White' }, was: { he: 'כחול לבן בראשות בנימין גנץ', en: 'Blue and White led by Benjamin Gantz' } });
  });
});

// Audit 12 Nov 2026 (fx-names, c-famous-late-04/06): an elected candidate whose Knesset match is official but whose
// Wikipedia link is only probable was tied to no one, so their run vanished from their history.
describe('every elected member has their run', () => {
  it('every member who sat from a Knesset’s opening has a run in that election (all 25 Knessets)', () => {
    const allowed: Record<string, string> = {
      // no candidacy of the 1955 lists is tied to him in data/meta/bios/k3.json
      'k3 2390': 'Idov Cohen',
      // the 1977 Likud ranks 21 and 24 are both printed כהן יגאל; which rank is which person is medium-confidence evidence
      'k9 2394': 'Yigal Cohen', 'k9 2399': 'Yigal Cohen-Orgad',
      // the notice prints אמסלם אמיל at Shas #11; the given-name difference is not explained by an official source
      'k17 4418': 'Haim Amsalem',
    };
    const missing: string[] = [];
    for (let k = 1; k <= 25; k++) {
      const ch = JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')) as { tenures: { personId: number; start: string }[]; checks: { openingDateReported: string } };
      for (const t of ch.tenures) if (t.start === ch.checks.openingDateReported && !rt.people[t.personId].runs.some((r) => r[0] === k)) missing.push(`k${k} ${t.personId}`);
    }
    expect(missing.sort()).toEqual(Object.keys(allowed).sort());
  });
  it('2022: Fogel, Bismuth, Almog Cohen, Revivo and five more are tied by their official member record', () => {
    for (const [p, list, rank] of [[30859, '25-ט', 10], [30835, '25-מחל', 27], [30833, '25-ט', 7], [30832, '25-מחל', 19]] as const)
      expect(runs(p).find((r) => r.k === 25), `${p}`).toMatchObject({ list, rank, outcome: 'elected', basis: 'id' });
    for (const p of [30831, 30837, 30849, 30854, 30863]) expect(runs(p).find((r) => r.k === 25)?.basis, `${p}`).toBe('id');
  });
  it('Deri and Benny Begin 1999, Arens 1992: elected, did not take the seat; linked by the name rule', () => {
    expect(runs(2291).find((r) => r.k === 15)).toMatchObject({ list: '15-שס', rank: 1, outcome: 'declined', basis: 'name', via: 14 });
    expect(runs(2178).find((r) => r.k === 15)).toMatchObject({ list: '15-יט', rank: 1, outcome: 'declined', basis: 'name', via: 14 });
    expect(runs(463).find((r) => r.k === 13)).toMatchObject({ list: '13-מחל', rank: 2, outcome: 'declined', basis: 'name', via: 12 });
    expect(mkView(rt, 2291)!.runs).toBe(11);
  });
  it('one notion of a certain Knesset identity: the comparison match, the MK history and the English name agree', () => {
    // the 14 identities of candidates who were not elected, confirmed by the November research review: tied by ID and
    // matched across elections, but with no official English name, since they rest on secondary sources (tests/bios.test.ts)
    const reviewed = new Set((JSON.parse(readFileSync('data/raw/research/mk-runs-1109.reviewed.json', 'utf8')).runs as { status: string; candidateId: string }[])
      .filter((r) => r.status === 'confirmed').map((r) => r.candidateId));
    expect(reviewed.size).toBe(14);
    const disagree: string[] = [];
    for (let k = 1; k <= 26; k++) for (const l of ds(k).lists) for (const c of l.candidates) {
      if (!c.bio?.knesset) continue;
      const sure = !c.bio.probable || !!c.bio.memberConfirmed; // src/app/compare/match.ts memberKey
      const p = personOfCandidate(rt, c.id);
      const byId = p !== null && rt.people[p].runs.some((r) => `${r[1]}#${r[2]}` === c.id && r[4] === 'id');
      if (byId && !sure) disagree.push(`${c.id}: tied by ID, not certain in the lists`);
      if (sure && !c.nameEn && !reviewed.has(c.id)) disagree.push(`${c.id}: certain, no English name`);
      if (!sure && c.nameEn) disagree.push(`${c.id}: not certain, English name ${c.nameEn}`);
    }
    expect(disagree).toEqual([]);
  });
});

// audit 12 Nov 2026, c-screens-people-02: a list that withdrew before the vote was shown as a run that "got 0%, below
// the threshold" and counted among the elections the person ran in
describe('a list that withdrew before the election is not a run', () => {
  const GANTZ = 30657, FEIGLIN = 23556;
  it('Gantz 2026 (Blue and White) and Feiglin September 2019 (Zehut): the list withdrew', () => {
    expect(runs(GANTZ).find((r) => r.k === 26)).toMatchObject({ list: '26-כן', rank: 1, outcome: 'withdrawn' });
    expect(runs(FEIGLIN).find((r) => r.k === 22)).toMatchObject({ list: '22-זן', rank: 1, outcome: 'withdrawn' });
  });
  it('is not counted in "on a list in N elections"', () => {
    expect(mkView(rt, GANTZ)!.runs).toBe(5); // 2019 (twice), 2020, 2021, 2022; not 2026
    expect(mkView(rt, FEIGLIN)!.runs).toBe(5); // 2009, 2013, April 2019, 2022, 2026; not September 2019
  });
  it('every run on a withdrawn list, and only those, reads "withdrawn"', () => {
    for (const k of Object.keys(rt.elections).map(Number)) {
      const wd = new Set(ds(k).lists.filter((l) => l.withdrawn).map((l) => l.id));
      for (const [id, p] of Object.entries(rt.people)) for (const r of p.runs) if (r[0] === k) expect(r[3] === 'withdrawn', `${id} ${r[1]}`).toBe(wd.has(r[1]));
    }
  });
});

// audit 12 Nov 2026, ax-build-guesses-01, ax-names-rosters-04/05, c-famous-early-07: MK history took the Knesset site's
// raw English names ("Moseh Zeev Feldman", "Yeushua Sagi", "Meir Pa`il") while the lists show the reviewed display form
describe('a person has one English name on every screen', () => {
  it('the reviewed spellings: Moshe Zeev Feldman, Yehoshua Sagi', () => {
    expect(rt.people[2541].en).toBe('Moshe Zeev Feldman');
    expect(rt.people[2624].en).toBe('Yehoshua Sagi');
  });
  it('no backtick for an apostrophe', () => {
    expect(Object.entries(rt.people).filter(([, p]) => p.en?.includes('`')).map(([id, p]) => `${id} ${p.en}`)).toEqual([]);
    expect(Object.values(rt.factions).filter((f) => f[1]?.includes('`'))).toEqual([]);
  });
  it('equals the name on the list of the same election, for every candidacy that has one', () => {
    const differ: string[] = [];
    for (let k = 1; k <= 26; k++) {
      const byPlace = new Map(ds(k).lists.flatMap((l) => l.candidates.map((c) => [`${l.id}#${c.rank}`, c.nameEn] as const)));
      for (const [id, p] of Object.entries(rt.people)) for (const r of p.runs) {
        const en = r[0] === k ? byPlace.get(`${r[1]}#${r[2]}`) : undefined;
        if (en && en !== p.en) differ.push(`${id} ${r[1]}#${r[2]}: list ${en}, history ${p.en}`);
      }
    }
    expect(differ).toEqual([]);
  });
});

// audit 12 Nov 2026 (fx-termend §1b): the 26th Knesset's opening is not yet in the member records, so the 25th ran to
// the snapshot date (12 Nov) and every one of its 120 last members read "Membership ended" on 10 Nov 2026
describe('the end of a Knesset', () => {
  const tenures = (k: number) => (JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')) as { tenures: { personId: number; end: string | null }[] }).tenures;
  it('is the next one’s opening; where that is not recorded and every membership has closed, the last membership end', () => {
    for (let k = 1; k <= 24; k++) expect(rt.elections[k].end, `k${k}`).toBe(rt.elections[k + 1].opening);
    expect(rt.elections[26].opening).toBeNull();
    expect(tenures(25).every((t) => t.end !== null)).toBe(true);
    expect(rt.elections[25].end).toBe('2026-11-10');
  });
  it('a member who served to the end of the 25th has no end line; one who left early still has it', () => {
    const last = tenures(25).filter((t) => t.end === '2026-11-10').map((t) => t.personId);
    expect(last).toHaveLength(120);
    const ends = last.flatMap((p) => mkView(rt, p)!.rows.filter((r) => r.k === 25).flatMap((r) => r.events.filter((e) => e.kind === 'left' && e.date === '2026-11-10')));
    expect(ends).toEqual([]);
    for (const p of last) expect(mkView(rt, p)!.rows.find((r) => r.k === 25)!.terms.at(-1)!.end).toBe('2026-11-10');
    // Israel Eichler left on 21 Jan 2026
    expect(mkView(rt, EICHLER)!.rows.find((r) => r.k === 25)!.events.filter((e) => e.kind === 'left').map((e) => e.date)).toEqual(['2026-01-21']);
  });
  it('every Knesset: an end line only where a membership ended before the term did', () => {
    for (const id of Object.keys(rt.people)) for (const r of mkView(rt, Number(id))!.rows)
      for (const e of r.events) if (e.kind === 'left') expect(e.date < r.end!, `${id} k${r.k} ${e.date}`).toBe(true);
  });
});
