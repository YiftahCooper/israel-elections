// The Knesset-term timeline and seat cards (owner decisions 8 and 11 Nov 2026): seat holders, sides after each date,
// levels, markers, and the research lane's fields winning over the temporary fallback.
import { describe, expect, test } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compileTermTimeline, type TermRuntime } from '../scripts/term-timeline-runtime.ts';
import { chamberOrder, holderAt, stepMarks, visibleItem, visibleSteps, type TimelineChoice } from '../src/history/termTimeline.ts';
import { settingDefault } from '../src/app/settings.ts';

const rt = compileTermTimeline();
const k24 = rt.terms[24], k25 = rt.terms[25];
const ALL = { norwegian: true, left: true, unknown: true };
const at = (level: TimelineChoice['level'], seatChanges: TimelineChoice['seatChanges'] = 'off', kinds = ALL): TimelineChoice => ({ level, seatChanges, kinds });
const step = (t: TermRuntime, date: string) => t.timeline!.steps.find((s) => s.date === date)!;
const personSeat = (t: TermRuntime, p: number, date: string) => t.seats.findIndex((_, i) => holderAt(t, i, date)?.[0] === p);
const CHIKLI = 30786, ALHARUMI = 30548, SILMAN = 30718, RINAWIE = 30805, ORBACH = 30787, DERI = 2291, TAIEB = 30770;

describe('seats and who held them', () => {
  test('every term opens with 120 seats and the compiler reports nothing odd', () => {
    expect(rt.anomalies).toEqual([]);
    for (const t of Object.values(rt.terms)) expect(t.seats, `k${t.k}`).toHaveLength(120);
  });
  test('each seat has one holder at a time, in date order', () => {
    for (const t of Object.values(rt.terms)) for (const s of t.seats) s.holders.forEach((h, i) => {
      if (h[2]) expect(h[2] > h[1], `k${t.k} ${h[0]}`).toBe(true);
      if (i > 0) expect(s.holders[i - 1][2]! <= h[1], `k${t.k} ${h[0]}`).toBe(true);
    });
  });
  test('the Shas seat: Deri → Taieb → Deri → Taieb, paired by the Knesset’s own records', () => {
    const seat = k24.openingSeat[DERI];
    const h = k24.seats[seat].holders;
    expect(h.map((x) => x[0])).toEqual([DERI, TAIEB, DERI, TAIEB]);
    expect(h.map((x) => x[1])).toEqual(['2021-04-06', '2021-04-08', '2021-06-13', '2022-01-25']);
    expect(h.map((x) => x[3])).toEqual(['o', 'e', 'r', 'r']);
    expect(h.slice(1).map((x) => x[4])).toEqual(['record', 'record', 'record']);
    expect(k24.seats[seat].list).toBe('24-שס');
  });
  test('a timeline only where the sides can be derived: the 24th and 25th, and the two Knessets in which no government was formed', () => {
    expect(Object.values(rt.terms).filter((t) => t.timeline).map((t) => t.k)).toEqual([21, 22, 24, 25]);
    expect(Object.values(rt.terms).filter((t) => t.timeline?.noGovernment).map((t) => t.k)).toEqual([21, 22]);
  });
});

describe('sides after each date (they match every count the research gives)', () => {
  const coal = (t: TermRuntime, d: string) => step(t, d).coalition?.length ?? null;
  test('24th Knesset', () => {
    expect(coal(k24, '2021-04-06')).toBe(null); // before the new government: no sides
    expect(coal(k24, '2021-06-13')).toBe(61);
    expect(coal(k24, '2022-04-06')).toBe(60);
    expect(coal(k24, '2022-05-19')).toBe(59);
    expect(coal(k24, '2022-05-22')).toBe(60);
    expect(coal(k24, '2022-06-13')).toBe(59);
  });
  test('25th Knesset', () => {
    expect(coal(k25, '2022-12-29')).toBe(64);
    expect(coal(k25, '2023-10-12')).toBe(76);
    expect(coal(k25, '2024-03-25')).toBe(72);
    expect(coal(k25, '2024-06-09')).toBe(64);
    expect(coal(k25, '2024-09-29')).toBe(68);
    expect(coal(k25, '2025-01-19')).toBe(62);
    expect(coal(k25, '2025-03-19')).toBe(68);
  });
  test('the last day shows the Knesset as it stood, not an empty chamber', () => {
    expect(step(k24, '2022-11-15').coalition!.length).toBeGreaterThan(50);
  });
});

describe('levels (owner, 11 Nov): Simple fewest, Standard more, Expert all', () => {
  test('Simple: the term, the government and the moves that changed its majority; no seat changes', () => {
    // as the research grades them: start, swearing-in, Silman, Rinawie Zoabi out and back, Orbach, dissolution, rotation, end
    expect(visibleSteps(k24, at('simple')).map((s) => s.step.date)).toEqual(['2021-04-06', '2021-06-13', '2022-04-06', '2022-05-19', '2022-05-22', '2022-06-13', '2022-06-30', '2022-07-01', '2022-11-15']);
    expect(visibleSteps(k24, at('simple')).every((s) => s.items.every((it) => it.type === 'event'))).toBe(true);
  });
  test('Standard adds votes and single MKs leaving; Expert adds membership records', () => {
    // each level with its default seat-change setting (Off, Important, All)
    const simple = visibleSteps(k24, at('simple')).length, standard = visibleSteps(k24, at('standard', 'important')).length, expert = visibleSteps(k24, at('expert', 'all')).length;
    expect(simple).toBeLessThan(standard); expect(standard).toBeLessThan(expert);
    expect(visibleSteps(k24, at('standard', 'important')).some((s) => s.step.date === '2022-05-19')).toBe(true);
  });
  test('seat changes: none at Off; at Important only those the research rates; at All, by the kinds chosen', () => {
    const seatSteps = (c: TimelineChoice) => visibleSteps(k24, c).filter((s) => s.items.some((it) => it.type === 'seat')).length;
    expect(seatSteps(at('standard', 'off'))).toBe(0);
    expect(seatSteps(at('standard', 'important'))).toBe(13); // the dates with a replacement the research rates Standard
    expect(visibleSteps(k24, at('standard', 'important')).flatMap((s) => s.items).filter((it) => it.type === 'seat').every((it) => it.importance !== 'expert')).toBe(true);
    expect(seatSteps(at('expert', 'all'))).toBe(20); // the dates in the 24th Knesset on which someone left or entered
    // every 24th-Knesset replacement has a recorded reason, so hiding Norwegian-law ones leaves only resignations and deaths
    const expertOnly = (kinds: typeof ALL) => visibleSteps(k24, at('expert', 'all', kinds)).flatMap((s) => s.items).filter((it) => it.type === 'seat' && it.importance === 'expert');
    expect(expertOnly({ norwegian: false, left: true, unknown: true }).every((it) => it.change === 'left')).toBe(true);
    expect(expertOnly(ALL).some((it) => it.change === 'norwegian')).toBe(true);
  });
  test('events the research holds out (timelineEligible: false) are never steps, even at Expert', () => {
    const shown = new Set(visibleSteps(k24, at('expert', 'all')).flatMap((s) => s.items.map((it) => it.id)));
    const held = k24.timeline!.steps.flatMap((s) => s.items).filter((it) => it.held);
    expect(held.length).toBeGreaterThan(0);
    expect(held.some((it) => shown.has(it.id))).toBe(false);
  });
  test('the setting’s default follows the level', () => {
    expect(settingDefault('timelineSeatChanges', 'simple')).toBe('off');
    expect(settingDefault('timelineSeatChanges', 'standard')).toBe('important');
    expect(settingDefault('timelineSeatChanges', 'expert')).toBe('all');
  });
});

describe('stepping (owner, 12 Nov): the arrows stop at every event the bar shows, and nowhere else', () => {
  const LEVELS = ['simple', 'standard', 'expert'] as const, SEATS = ['off', 'important', 'all'] as const;
  const KINDS = [ALL, { norwegian: false, left: true, unknown: true }, { norwegian: true, left: false, unknown: false }];
  const timelines = Object.values(rt.terms).filter((t) => t.timeline);
  test('every level and setting: one step per date in date order, each holding exactly the items shown that date', () => {
    for (const t of timelines) for (const level of LEVELS) for (const seats of SEATS) for (const kinds of KINDS) {
      const c = at(level, seats, kinds), steps = visibleSteps(t, c);
      const dates = steps.map((s) => s.step.date);
      expect(dates, `k${t.k} ${level} ${seats}`).toEqual([...new Set(dates)].sort());
      // nothing shown is unreachable: every item the level shows is in the step of its date, and only there
      const shown = t.timeline!.steps.flatMap((s) => s.items.filter((it) => visibleItem(it, c.level, c.seatChanges, c.kinds)).map((it) => `${s.date} ${it.id}`));
      expect(steps.flatMap((s) => s.items.map((it) => `${s.step.date} ${it.id}`)), `k${t.k} ${level} ${seats}`).toEqual(shown);
      // and the arrows never stop where nothing is shown
      expect(steps.every((s) => s.items.length > 0)).toBe(true);
    }
  });
  test('a higher level keeps every stop of the level below', () => {
    for (const t of timelines) {
      const d = (level: (typeof LEVELS)[number]) => new Set(visibleSteps(t, at(level, settingDefault('timelineSeatChanges', level))).map((s) => s.step.date));
      const [simple, standard, expert] = LEVELS.map(d);
      for (const x of simple) expect(standard.has(x), `k${t.k} ${x}`).toBe(true);
      for (const x of standard) expect(expert.has(x), `k${t.k} ${x}`).toBe(true);
    }
  });
  test('events that move no seat are steps too (budget votes, votes, faction changes), and the chart stays as it was', () => {
    const kinds = (t: TermRuntime) => new Set(visibleSteps(t, at('standard', 'important')).flatMap((s) => s.items.map((it) => it.kind)));
    for (const kind of ['budget-vote', 'legislative-vote', 'confidence-vote', 'faction-split']) expect(kinds(k24).has(kind), kind).toBe(true);
    expect(kinds(k25).has('faction-membership-change')).toBe(true);
    let checked = 0;
    for (const t of [k24, k25]) {
      const all = t.timeline!.steps;
      for (const [i, s] of all.entries()) {
        if (i === 0 || !s.items.every((it) => it.type === 'event' && it.kind !== 'government-sworn-in' && !it.moved.length && !it.marks.some((m) => m[1] === 'D4c' || m[1] === 'D4o'))) continue;
        // a step of events only, none moving anyone: the same sides as the day before, the same people in the seats
        checked++;
        expect(new Set(s.coalition), `k${t.k} ${s.date}`).toEqual(new Set(all[i - 1].coalition));
        for (let seat = 0; seat < 120; seat++) expect(holderAt(t, seat, s.date), `k${t.k} ${s.date} seat ${seat}`).toBe(holderAt(t, seat, all[i - 1].date));
      }
    }
    expect(checked).toBeGreaterThan(30);
    // the first budget vote of the 24th Knesset: a step at Standard, 61 as before, with its line and sources
    const budget = visibleSteps(k24, at('standard', 'important')).find((s) => s.step.date === '2021-11-04')!;
    expect(budget.items.map((it) => it.kind)).toEqual(['budget-vote']);
    expect(budget.step.coalition).toHaveLength(61);
    expect(budget.items[0].en).toBeTruthy(); expect(budget.items[0].sources.length).toBeGreaterThan(0);
  });
  test('events sharing a timeline group share a date, so they are one step', () => {
    expect(rt.anomalies.filter((a) => a.includes('timeline group'))).toEqual([]);
    const ev = JSON.parse(readFileSync('data/research/knesset-events/k24.json', 'utf8')) as { events: { id: string; timelineGroup?: string }[] };
    const group = ev.events.filter((e) => e.timelineGroup === 'k24-government36').map((e) => e.id);
    expect(group).toHaveLength(2);
    const step24 = k24.timeline!.steps.filter((s) => s.items.some((it) => group.includes(it.id)));
    expect(step24).toHaveLength(1);
  });
  test('a faction move carries its factions and head count', () => {
    const it = k25.timeline!.steps.flatMap((s) => s.items).find((x) => x.id === 'k25-observed-faction-5')!;
    expect(it.factions).toEqual([1098, 1110]); expect(it.count).toBe(8);
  });
  test('every English ordinal in the Knesset event records is well formed (“21st”, never “21th”)', () => {
    const right = (n: number) => { const t = n % 100, u = n % 10; return t >= 11 && t <= 13 ? 'th' : u === 1 ? 'st' : u === 2 ? 'nd' : u === 3 ? 'rd' : 'th'; };
    const wrong: string[] = [];
    for (let k = 1; k <= 25; k++) for (const m of readFileSync(`data/research/knesset-events/k${k}.json`, 'utf8').matchAll(/\b(\d+)(st|nd|rd|th)\b/g)) if (m[2] !== right(Number(m[1]))) wrong.push(`k${k}: ${m[0]}`);
    expect(wrong).toEqual([]);
  });
});

describe('Knessets in which no government was formed (21st, 22nd)', () => {
  const k21 = rt.terms[21], k22 = rt.terms[22];
  test('no sides at any step; the formation attempts and the dissolution are steps, with their sources', () => {
    for (const t of [k21, k22]) expect(t.timeline!.steps.every((s) => s.coalition === null)).toBe(true);
    expect(visibleSteps(k21, at('simple')).map((s) => s.step.date)).toEqual(['2019-04-30', '2019-05-30', '2019-10-03']);
    expect(visibleSteps(k22, at('simple')).map((s) => s.step.date)).toEqual(['2019-10-03', '2019-12-12', '2020-03-16']);
    const kinds22 = visibleSteps(k22, at('standard', 'important')).flatMap((s) => s.items.map((it) => it.kind));
    expect(kinds22.filter((k) => k === 'formation-mandate-returned')).toHaveLength(2); // Netanyahu, then Gantz
    const dissolved = k21.timeline!.steps.flatMap((s) => s.items).find((it) => it.kind === 'formation-knesset-dissolved')!;
    expect(dissolved.importanceFrom).toBe('rule');
    expect(dissolved.en).toContain('74 for · 45 against');
    expect(dissolved.sources.length).toBeGreaterThan(0);
    // one dissolution, though the After the election data records it twice (formation and term end)
    expect(k21.timeline!.steps.flatMap((s) => s.items).filter((it) => it.kind === 'formation-knesset-dissolved')).toHaveLength(1);
  });
  test('formation events before the first sitting are not on the bar', () => {
    expect(k22.timeline!.steps[0].date).toBe(k22.opening);
    expect(k22.timeline!.steps.flatMap((s) => s.items).some((it) => it.en?.includes('tasked Benjamin Netanyahu'))).toBe(false);
  });
});

describe('markers (owner, 11 Nov)', () => {
  const view = (t: TermRuntime, d: string, level: TimelineChoice['level'] = 'expert') => visibleSteps(t, at(level, 'all')).find((s) => s.step.date === d)!;
  test('swearing-in: Chikli voted against and is a rebel (D2) on the other side; Alharumi abstained and stayed (D3)', () => {
    const v = view(k24, '2021-06-13');
    const marks = stepMarks(v);
    const chikli = personSeat(k24, CHIKLI, '2021-06-13'), alharumi = personSeat(k24, ALHARUMI, '2021-06-13');
    expect(marks.get(chikli)).toBe('D2');
    expect(marks.get(alharumi)).toBe('D3a');
    expect(v.step.coalition).not.toContain(chikli);
    expect(v.step.coalition).toContain(alharumi);
  });
  test('Silman leaves (D2), stays marked; Rinawie Zoabi leaves (D2) and returns (D4 towards the coalition), no rebel after', () => {
    expect(stepMarks(view(k24, '2022-04-06')).get(personSeat(k24, SILMAN, '2022-04-06'))).toBe('D2');
    expect(stepMarks(view(k24, '2022-05-19')).get(personSeat(k24, RINAWIE, '2022-05-19'))).toBe('D2');
    expect(stepMarks(view(k24, '2022-05-22')).get(personSeat(k24, RINAWIE, '2022-05-22'))).toBe('D4c');
    expect(step(k24, '2022-05-22').rebels.map((r) => r[1])).not.toContain(RINAWIE);
    // Chikli's later declaration (D2 again) keeps him a rebel rather than toggling him back
    expect(step(k24, '2022-04-25').rebels.map((r) => r[1])).toContain(CHIKLI);
    expect(step(k24, '2022-06-13').rebels.map((r) => r[1]).sort()).toEqual([CHIKLI, SILMAN, ORBACH].sort());
  });
  test('a party changing sides gets a D4 arrow pointing where it went', () => {
    const join = stepMarks(view(k25, '2023-10-12'));
    expect([...join.values()].filter((m) => m === 'D4c')).toHaveLength(12);
    expect([...stepMarks(view(k25, '2024-06-09')).values()].filter((m) => m === 'D4o')).toHaveLength(8);
  });
  test('coalition members who voted for dissolution and stayed get D3', () => {
    expect([...stepMarks(view(k25, '2025-06-12')).values()].filter((m) => m === 'D3x')).toHaveLength(2);
  });
  test('a replacement is marked on the seat that changed hands', () => {
    const v = view(k24, '2021-04-08');
    expect(stepMarks(v).get(k24.openingSeat[DERI])).toBe('rep');
  });
  test('every party move graded D4 draws its arrows, even when an announcement the day before already moved the party', () => {
    for (const k of [24, 25] as const) {
      const d4 = rt.terms[k].timeline!.steps.flatMap((s) => s.items).filter((it) => it.marker === 'D4');
      expect(d4.length).toBeGreaterThan(0);
      for (const it of d4) expect(it.marks.length, it.id).toBeGreaterThan(0);
    }
    const newHope = rt.terms[25].timeline!.steps.flatMap((s) => s.items).find((it) => it.id === 'k25-new-hope-return')!;
    expect(newHope.marks.map((m) => m[1])).toEqual(['D4c', 'D4c', 'D4c', 'D4c']);
  });
  test('hidden items draw no marks; rebels always show', () => {
    const v = visibleSteps(k24, at('simple')).find((s) => s.step.date === '2022-06-30')!;
    expect([...stepMarks(v).values()].every((m) => m === 'D2')).toBe(true);
  });
});

describe('chamber order', () => {
  test('coalition on the left; a rebel sits next to the middle, out of the list’s block', () => {
    const s = step(k24, '2022-04-06');
    const { order, left } = chamberOrder(k24, s, (l) => ['24-מחל', '24-פה'].indexOf(l ?? ''));
    expect(left).toBe(60);
    expect(order.slice(0, left).every((i) => s.coalition!.includes(i))).toBe(true);
    const rebels = new Set([personSeat(k24, CHIKLI, s.date), personSeat(k24, SILMAN, s.date)]);
    expect(new Set(order.slice(left, left + 2))).toEqual(rebels);
  });
  test('before the first government: one block', () => {
    expect(chamberOrder(k24, step(k24, '2021-04-08'), () => 0).left).toBe(0);
  });
});

describe('the research lane’s fields win over the temporary fallback', () => {
  // a copy of the repository's inputs with the 24th Knesset's events graded by hand
  const root = mkdtempSync(join(tmpdir(), 'tl-'));
  for (const d of ['public', 'data/meta', 'data/research/knesset-member-changes']) { mkdirSync(join(root, d, '..'), { recursive: true }); symlinkSync(join(process.cwd(), d), join(root, d)); }
  mkdirSync(join(root, 'data/research/knesset-events'), { recursive: true });
  const ev = JSON.parse(readFileSync('data/research/knesset-events/k24.json', 'utf8'));
  // the research's own replacement grades are dropped here, so the hand-graded one below is the only Standard one
  ev.events = ev.events.filter((e: { marker?: string }) => e.marker !== 'replacement');
  ev.membershipEventRefs = [];
  for (const e of ev.events) {
    if (e.kind === 'coalition-exit-statement' && e.who.personIds?.[0] === SILMAN) { e.importance = 'expert'; e.marker = 'D2'; }
    if (e.kind === 'budget-vote') { e.importance = 'simple'; e.marker = null; }
  }
  // a replacement event naming Deri and Taieb, graded Standard
  ev.events.push({ id: 'k24-deri-out', date: '2022-01-25', kind: 'replacement', who: { personIds: [DERI, TAIEB] }, summary: { en: 'Aryeh Deri resigns; Yosef Taieb returns.', he: 'אריה דרעי מתפטר; יוסף טייב חוזר.' }, certainty: 'confirmed', importance: 'standard', marker: 'replacement', sources: [] });
  writeFileSync(join(root, 'data/research/knesset-events/k24.json'), JSON.stringify(ev));
  const t = compileTermTimeline(root).terms[24];
  test('importance from the data', () => {
    const items = t.timeline!.steps.flatMap((s) => s.items);
    const silman = items.find((it) => it.kind === 'coalition-exit-statement' && it.en?.includes('Silman'))!;
    expect(silman.importance).toBe('expert'); expect(silman.importanceFrom).toBe('data');
    expect(items.filter((it) => it.kind === 'budget-vote').every((it) => it.importance === 'simple' && it.marker === null && it.markerFrom === 'data')).toBe(true);
  });
  test('a graded replacement shows at Standard, and only that one; the app writes its line', () => {
    const steps = visibleSteps(t, at('standard', 'important')).filter((s) => s.items.some((it) => it.type === 'seat'));
    expect(steps.map((s) => s.step.date)).toEqual(['2022-01-25']);
    const seat = steps[0].items.find((it) => it.type === 'seat')!;
    expect(seat.importanceFrom).toBe('data'); expect(seat.certainty).toBe('confirmed'); expect(seat.en).toBe(null);
  });
});

// Seat cards list a member's factions as the Knesset records them (audit of 12 Nov 2026, scripts/lib/faction-rows.ts).
describe('seat-card faction lines', () => {
  const holder = (k: number, p: number) => rt.terms[k].seats.flatMap((s) => s.holders).find((h) => h[0] === p)!;
  test('Yasinov, 1 Feb 2006: in the order of the record’s times, Yisrael Beiteinu last', () => {
    expect(holder(16, 1054)[7]).toEqual([[43, '2003-02-17'], [1038, '2005-05-18'], [1078, '2006-02-01', '10:01'], [588, '2006-02-01', '11:01'], [45, '2006-02-01', '12:01'], [590, '2006-02-01']]);
  });
  test('a record that starts and ends at the same midnight is not a faction line (Bennett, Sofer, the 2020 split)', () => {
    expect(holder(24, 23511)[7]).toEqual([[966, '2021-04-06'], [1086, '2022-08-15'], [1091, '2022-09-06']]);
    expect(holder(24, 30717)[7]).toEqual([[962, '2021-04-06'], [961, '2021-06-27']]);
    expect(holder(23, 23594)[7]).toEqual([[1079, '2020-03-16'], [955, '2020-03-29']]); // Lapid: no zero-length Yesh Atid row
  });
  test('a faction line never starts before the holder’s own term', () => {
    for (const t of Object.values(rt.terms)) for (const s of t.seats) for (const h of s.holders) for (const [, from] of h[7]) expect(from >= h[1], `k${t.k} ${h[0]}`).toBe(true);
  });
});
