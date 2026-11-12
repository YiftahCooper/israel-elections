import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { comparableFor, comparablePredecessor, officialFacts } from '../src/history/compare.ts';
import { RELATIONS, readRelations, type Relation } from '../src/history/relations.ts';
import { HISTORY, electionIndex, electionPosition, historyList, partyNameAt } from '../src/history/runtime.ts';
import { erasOf, eventsOf, identityOf, partySeries } from '../src/history/identity.ts';
import { compileHistoryRuntime, formOf, nameAtElection } from '../scripts/party-history-runtime.ts';
import { certaintyCeiling } from '../src/data/evidence.ts';

// The recorded relations (data/meta/party-lineage.json, stage 1 research); fixtures only where a rule needs a variant.
const rel = (r: Partial<Relation> & Pick<Relation, 'id' | 'kind' | 'from' | 'to' | 'date'>): Relation => ({ certainty: 'probable', pending: false, sources: [], ...r });
const withDemocrats = RELATIONS;
const DEMOCRATS = ['labor-democrats-rename', 'democrats-announced', 'democrats-approved'];
const withoutDemocrats = RELATIONS.filter((r) => !DEMOCRATS.includes(r.id));

const names = (ids: string[]) => ids.map((id) => historyList('k25', id)?.shortEn ?? historyList('k26', id)?.shortEn);
const k26 = (id: string, rels = withDemocrats) => comparableFor('k26', `26-${id}`, rels)!;

describe('the 2026 comparison table (docs/features/party-history.md §1.4)', () => {
  it('Joint List: Hadash–Ta’al + Balad, combined 5 → 11', () => {
    const c = k26('ודם');
    expect(c.kind).toBe('combined');
    expect(names(c.counted.map((l) => l.id)).sort()).toEqual(['Balad', "Hadash–Ta'al"].sort());
    expect([c.before.seats, c.after.seats]).toEqual([5, 11]);
    expect([c.before.votes, c.after.votes]).toEqual([317352, 500755]);
    expect(c.certainty).toBe('confirmed');
  });
  it('The Democrats: Labor + Meretz, 4 → 8, probable (the rename)', () => {
    const c = k26('אמת');
    expect(c.kind).toBe('combined');
    expect(c.counted.map((l) => l.id).sort()).toEqual(['25-אמת', '25-מרצ'].sort());
    expect([c.before.seats, c.after.seats]).toEqual([4, 8]);
    expect(c.certainty).toBe('probable');
    expect(c.relations.map((r) => r.id)).toEqual(['labor-democrats-rename']);
  });
  it('The Democrats with only the political union (announced, approved): To verify, never Meretz alone', () => {
    const c = k26('אמת', RELATIONS.filter((r) => r.id !== 'labor-democrats-rename'));
    expect(c.kind).toBe('verify');
    expect(c.certainty).toBe('unknown');
    expect(c.toVerify.length).toBeGreaterThan(0);
    expect(c.toVerify.every((r) => r.kind === 'merged-into' && (r.stage === 'announced' || r.stage === 'approved'))).toBe(true);
  });
  it('Likud: Likud 32 → 27, partial (New Hope ran inside National Unity)', () => {
    const c = k26('מחל');
    expect(c.kind).toBe('partial');
    expect(c.counted.map((l) => l.id)).toEqual(['25-מחל']);
    expect(c.notCounted).toEqual([{ partyId: 'new-hope', listId: '25-כן' }]);
    expect([c.before.seats, c.after.seats]).toEqual([32, 27]);
  });
  it('Together (Bennett): Yesh Atid 24 → 12, its own party new', () => {
    const c = k26('רק');
    expect(c.kind).toBe('same');
    expect(c.counted.map((l) => l.id)).toEqual(['25-פה']);
    expect(c.newParties).toEqual(['together-bennett']);
    expect([c.before.seats, c.after.seats]).toEqual([24, 12]);
  });
  it('Religious Zionism–Zehut, Otzma Yehudit and Noam: the group only, 14 → 13', () => {
    for (const id of ['ט', 'ב', 'ני']) {
      const c = k26(id);
      expect(c.kind).toBe('group');
      expect(c.counted.map((l) => l.id)).toEqual(['25-ט']);
      expect(c.group.map((l) => l.id).sort()).toEqual(['26-ב', '26-ט', '26-ני'].sort());
      expect([c.before.seats, c.after.seats]).toEqual([14, 13]);
    }
  });
  it.each([['ג', 7, 7], ['שס', 11, 6], ['עם', 5, 8], ['ל', 6, 7]])('26-%s is the same list: %i → %i', (id, a, b) => {
    const c = k26(id);
    expect(c.kind).toBe('same');
    expect([c.before.seats, c.after.seats]).toEqual([a, b]);
  });
  it('Yashar! is new', () => expect(k26('דרך').kind).toBe('new'));
  it('National Unity’s successor keeps its earlier list whole, noting who left', () => {
    const c = k26('כן');
    expect(c.kind).toBe('partial');
    expect(c.counted.map((l) => l.id)).toEqual(['25-כן']);
    expect(c.left).toEqual([{ partyId: 'new-hope', listId: '26-מחל' }]);
  });
  it('1949 has nothing to compare with', () => expect(comparableFor('k1', HISTORY[0].lists[0].id)!.kind).toBe('first'));
});

describe('relations', () => {
  it('a relation below probable is never used; To verify is shown instead', () => {
    const weak = RELATIONS.map((r) => r.id === 'labor-democrats-rename' ? { ...r, certainty: 'provisional' as const } : r);
    expect(k26('אמת', weak).kind).toBe('verify');
    const pending = RELATIONS.map((r) => r.id === 'labor-democrats-rename' ? { ...r, pending: true, certainty: 'unknown' as const } : r);
    expect(k26('אמת', pending).kind).toBe('verify');
  });
  it('an announced merger does not carry identity; a registered one does', () => {
    const merger = (stage: Relation['stage']) => [...withoutDemocrats, rel({ id: 'm', kind: 'merged-into', from: ['labor', 'meretz'], to: ['democrats'], date: '2024-07', stage })];
    expect(k26('אמת', merger('announced')).kind).toBe('verify');
    expect(k26('אמת', merger('registered')).kind).toBe('combined');
  });
  it('certainty follows the source policy: IDI scholarship is probable, a pending item unknown', () => {
    expect(RELATIONS.find((r) => r.id === 'labor-1968')!.certainty).toBe('probable');
    expect(RELATIONS.find((r) => r.id === 'labor-democrats-rename')!.certainty).toBe('probable');
    expect(RELATIONS.find((r) => r.id === 'democrats-announced')!).toMatchObject({ certainty: 'provisional', stage: 'announced' });
    expect(RELATIONS.find((r) => r.id === 'kadima-faction-2005')!.certainty).toBe('confirmed'); // Knesset records
    const parsed = readRelations({ sources: { cec: { kind: 'repository-dataset' }, note: { kind: 'secondary', publisher: 'internal' } }, pending: [],
      edges: [{ id: 'a', from: ['x'], to: ['y'], relation: 'renamed-to', date: '2000', sources: ['cec'] }, { id: 'b', from: ['x'], to: ['y'], relation: 'renamed-to', date: '2000', sources: ['note'] },
        { id: 'c', from: ['x'], to: ['y'], relation: 'renamed-to', date: '2000', sources: ['cec'], certainty: 'disputed' }, { id: 'd', from: ['x'], to: ['y'], relation: 'renamed-to', date: '2000', sources: ['note'], certainty: 'confirmed' }] });
    expect(parsed.map((r) => r.certainty)).toEqual(['confirmed', 'unknown', 'disputed', 'unknown']);
    expect(certaintyCeiling([])).toBe('unknown');
  });
});

describe('votes are never divided', () => {
  it('the runtime holds whole-list votes only: no figure per party exists', () => {
    const rt = compileHistoryRuntime();
    for (const e of rt.elections) for (const l of e.lists) {
      expect(l[8].every(([, n]) => Number.isInteger(n) && n <= l[2])).toBe(true); // elected members, bounded by the list's seats
    }
    expect(JSON.stringify(rt)).not.toMatch(/votes/i);
    expect(JSON.stringify(rt).length).toBeLessThan(200_000);
  });
  it('every comparison sums whole lists of the official result', () => {
    for (let i = 1; i < HISTORY.length; i++) for (const l of HISTORY[i].lists.filter((x) => x.seats > 0)) {
      const c = comparablePredecessor(l.id, officialFacts(HISTORY[i].id)!, officialFacts(HISTORY[i - 1].id)!);
      const prev = HISTORY[i - 1].lists;
      expect(c.before.votes).toBe(c.counted.reduce((n, x) => n + prev.find((y) => y.id === x.id)!.votes, 0));
    }
  });
  it('official seats per election match the datasets', () => {
    for (const e of HISTORY) {
      const ds = JSON.parse(readFileSync(`public/data/${e.id}.json`, 'utf8'));
      for (const l of e.lists) expect(l.seats).toBe(ds.officialSeats?.[l.id] ?? 0);
    }
  });
});

describe('identity links from the stage 1 records', () => {
  it('Hadash 1992 continues the Hadash front of 1988 (not the Communist Party component)', () => {
    const c = comparableFor('k13', HISTORY[electionIdxOf('k13')].lists.find((l) => l.parties.includes('hadash'))!.id)!;
    expect(c.kind).toBe('same');
    expect(c.relations.map((r) => r.kind)).toEqual(['same-organisation']);
  });
  it('Jewish Home 2009 continues the NRP (confirmed by the Registrar)', () => {
    const l = HISTORY[electionIdxOf('k18')].lists.find((x) => x.parties.includes('jewish-home'))!;
    const c = comparableFor('k18', l.id)!;
    expect(c.kind).not.toBe('new');
    expect(c.relations.map((r) => r.id)).toContain('nrp-jewish-home-2008');
    expect(c.certainty).toBe('confirmed');
  });
  it('Tami 1984 continues Tami 1981 though stored as two one-election ids', () => {
    expect(comparableFor('k11', '11-ני')!.counted.map((l) => l.id)).toEqual(['10-ני']);
  });
  it('a faction split never carries identity: Kadima 2006 stays new', () => {
    const l = HISTORY[electionIdxOf('k17')].lists.find((x) => x.parties.includes('kadima'))!;
    expect(comparableFor('k17', l.id)!.kind).toBe('new');
  });
});
const electionIdxOf = (id: string) => HISTORY.findIndex((e) => e.id === id);

describe('party histories (identity series)', () => {
  const series = (id: string) => partySeries(identityOf(id));
  const ran = (id: string) => series(id).filter((p) => p.list).map((p) => HISTORY[p.i].date.slice(0, 4) + (p.role === 'alone' ? '' : `:${p.role}`));
  // audit 12 Nov 2026, c-screens-people-02: a list that withdrew before the vote drew a zero bar and counted as a run
  it('a list that withdrew before the vote is not a run: Blue and White 2026, Tzomet 2020', () => {
    expect(historyList('k26', '26-כן')).toMatchObject({ withdrawn: true, votes: 0 });
    expect(series('israel-resilience')[electionIndex('k26')].list).toBeNull();
    expect(ran('israel-resilience')).not.toContain('2026');
    expect(historyList('k23', '23-זץ')).toMatchObject({ withdrawn: true, votes: 0 });
    expect(series('tzomet')[electionIndex('k23')].list).toBeNull();
    for (const e of HISTORY) for (const l of e.lists) if (l.withdrawn) for (const p of l.parties) expect(series(p)[electionIndex(e.id)].list, `${e.id} ${l.id} ${p}`).toBeNull();
  });
  it('Labor: Mapai → Labor → The Democrats, every election from 1949', () => {
    const s = series('democrats');
    expect(s.every((p) => p.list)).toBe(true);
    expect(erasOf(s, 'en').map((e) => e.name)).toEqual(['Mapai', 'Labor', 'The Democrats']);
    expect(s[25]).toMatchObject({ role: 'led', seats: 8, own: 7 }); // Meretz's 1 elected member is hatched
    expect(s.find((p) => HISTORY[p.i].date.startsWith('1969'))!).toMatchObject({ role: 'led', seats: 56 });
  });
  it('Likud: Herut → Likud from 1949; Likud Beiteinu 2013 is 20 own + 11 partners', () => {
    const s = series('likud');
    expect(s.every((p) => p.list)).toBe(true);
    expect(erasOf(s, 'en')[0].name).toBe('Herut');
    const y2013 = s.find((p) => HISTORY[p.i].date.startsWith('2013'))!;
    expect(y2013).toMatchObject({ role: 'led', seats: 31, own: 20, partners: ['yisrael-beiteinu'] });
    expect(eventsOf(identityOf('likud')).map((r) => r.id)).toEqual(expect.arrayContaining(['likud-party-1988', 'baaliyah-likud-2003', 'kadima-faction-2005', 'likud-beiteinu-faction-2014']));
  });
  it('Hadash: the front from 1977, distinct from its Communist Party component', () => {
    expect(ran('hadash')[0]).toBe('1977');
    expect(ran('hadash')).toHaveLength(18); // every election 1977–2026
    expect(identityOf('hadash').ids).not.toContain('israeli-communist-party');
    expect(identityOf('israeli-communist-party').ids).toEqual(expect.arrayContaining(['rakah', 'israeli-communist-party']));
    expect(identityOf('rakah').ids).not.toContain('maki'); // recorded: not the same party
  });
  it('a split-off starts its own history; a faction split is an event only', () => {
    expect(identityOf('kadima').ids).toEqual(['kadima']);
    expect(ran('kadima')[0]).toBe('2006');
  });
  it('the series never holds a party vote figure: votes are the whole list’s', () => {
    for (const p of series('hadash')) if (p.list) expect(p.votes).toBe(p.list.votes);
  });
});

describe('where an event is drawn between elections (charts are evenly spaced, not a time scale)', () => {
  const at = (id: string) => HISTORY.findIndex((e) => e.id === id);
  it('the Kadima split (23 Nov 2005) sits 89% of the way from the 2003 election to the 2006 one', () => {
    const p = electionPosition('2005-11-23');
    expect(Math.floor(p)).toBe(at('k16'));
    expect(p - at('k16')).toBeCloseTo(1030 / 1155, 3);
  });
  it('an election day sits on its own bar; a year-only date sits mid-year', () => {
    expect(electionPosition(HISTORY[at('k19')].date)).toBe(at('k19'));
    const p = electionPosition('2024');
    expect(p).toBeGreaterThan(at('k25')); expect(p).toBeLessThan(at('k26'));
    expect(electionPosition('2024')).toBeCloseTo(electionPosition('2024-07-01'), 9);
  });
  it('before the first election and after the last stay on the chart', () => {
    expect(electionPosition('1948')).toBe(0);
    expect(electionPosition('2030')).toBe(HISTORY.length - 1);
  });
});

// A party's name at an election is the one in force then (audit cx-parties-01, 12 Nov 2026).
describe('names at each election', () => {
  const strip = (id: string, lang: 'he' | 'en') => erasOf(partySeries(identityOf(id)), lang).map((e) => `${HISTORY[e.from].id}–${HISTORY[e.to].id} ${e.name}`);
  it('New Right in April 2019 is New Right, not Yamina (the joint list formed for September 2019)', () => {
    expect(strip('new-right', 'en')).toEqual(['k21–k23 New Right', 'k24–k25 Yamina']);
    expect(strip('new-right', 'he')).toEqual(['k21–k23 הימין החדש', 'k24–k25 ימינה']);
    expect(partyNameAt('new-right', electionIndex('k21'), 'en')).toBe('New Right');
  });
  it('the other names that were shown before they existed', () => {
    expect(strip('tkuma', 'en')).toEqual(['k15–k20 Tkuma', 'k21–k23 National Union–Tkuma', 'k24–k26 Religious Zionist Party']);
    expect(strip('tkuma', 'he')).toEqual(['k15–k17 תקומה', 'k18–k26 האיחוד הלאומי – תקומה']);
    expect(strip('israel-resilience', 'en')).toEqual(['k21–k23 Israel Resilience', 'k24–k25 Blue and White']); // 2026: the list withdrew
    expect(strip('otzma-yehudit', 'en')).toEqual(['k19–k19 Otzma Leyisrael', 'k20–k26 Otzma Yehudit']);
    expect(strip('ahi', 'en')).toEqual(['k17–k17 Renewed Religious National Zionism', 'k18–k23 Ahi']);
    expect(strip('new-hope', 'en')).toEqual(['k24–k25 New Hope', 'k26–k26 New Hope – the National Right']);
  });
  it('spelling variants of one name do not split a history; a long form is the same name', () => {
    expect(formOf('מפלגת העבודה הישראלית', 'העבודה', 'he')).toBe(true);
    expect(formOf('תקומה', 'האיחוד הלאומי – תקומה', 'he')).toBe(false);
    expect(formOf('Hatnuah', 'Hatnua', 'en')).toBe(true);
    expect(formOf('NRP', 'National Religious Party', 'en')).toBe(true);
    expect(strip('labor', 'en')).toEqual(['k1–k6 Mapai', 'k7–k25 Labor', 'k26–k26 The Democrats']);
    expect(nameAtElection('ימינה', ['הימין החדש', null, 'ימינה', 'הימין החדש'], 'he')).toEqual(['הימין החדש', null, null, 'הימין החדש']);
  });
  it('every party, every election: the name shown was in use by then (data/meta/parties.json, dated names)', () => {
    type P = { id: string; aliases?: { id: string }[]; names: { date: string; nameHe: string; nameEn?: string | null }[] };
    const reg = JSON.parse(readFileSync('data/meta/parties.json', 'utf8')) as { parties: P[] };
    const dated = new Map<string, P['names']>();
    for (const p of reg.parties) for (const id of [p.id, ...(p.aliases ?? []).map((a) => a.id)]) dated.set(id, [...(dated.get(id) ?? []), ...p.names]);
    const early: string[] = [];
    HISTORY.forEach((e, i) => { for (const l of e.lists) for (const p of l.parties) {
      const names = (dated.get(p) ?? []).filter((n) => n.date <= e.date);
      if (!names.length) continue;
      const he = partyNameAt(p, i, 'he'), en = partyNameAt(p, i, 'en');
      // a name dated by then that holds every word of the shown one (a long form of it, or the same)
      const known = names.some((n) => formOf(n.nameHe, he, 'he') || (!!n.nameEn && formOf(n.nameEn, en, 'en')));
      if (!known) early.push(`${e.id} ${p}: ${en} / ${he}`);
    } });
    expect(early).toEqual([]);
  });
});

// audit 12 Nov 2026 (cx-parties-02, cx-parties-03): two histories that were one party each
describe('one party, one history', () => {
  const strip = (id: string, lang: 'he' | 'en') => erasOf(partySeries(identityOf(id)), lang).map((e) => `${HISTORY[e.from].id}–${HISTORY[e.to].id} ${e.name}`);
  const lineage = JSON.parse(readFileSync('data/meta/party-lineage.json', 'utf8'));
  const edge = (id: string) => lineage.edges.find((e: { id: string }) => e.id === id);
  it('the State List: its own list in 1969, inside Likud in 1973', () => {
    expect(identityOf('state-list').ids).toEqual(expect.arrayContaining(['vehicle-7-עמ', 'state-list']));
    expect(identityOf('vehicle-7-עמ').ids).toContain('state-list');
    expect(strip('state-list', 'en')).toEqual(['k7–k7 National List', 'k8–k8 State List']);
    expect(strip('state-list', 'he')).toEqual(['k7–k7 רשימה ממלכתית', 'k8–k8 הרשימה הממלכתית']);
    // same organisation is not drawn as an event; the link rests on IDI scholarship, so it is probable
    expect(eventsOf(identityOf('state-list')).map((r) => r.id)).not.toContain('state-list-1969-1973');
    expect(edge('state-list-1969-1973').certainty).toBe('probable');
  });
  it('HaOlam HaZeh became Meri: faction renamed 3 Jul 1973 in the Knesset record', () => {
    expect(identityOf('meri').ids).toEqual(expect.arrayContaining(['vehicle-6-ש', 'vehicle-7-ש', 'meri']));
    expect(strip('vehicle-6-ש', 'en')).toEqual(['k6–k7 HaOlam HaZeh', 'k8–k9 Meri']);
    expect(strip('meri', 'he')).toEqual(['k6–k7 העולם הזה', 'k8–k9 מרי']);
    const ev = eventsOf(identityOf('meri')).find((r) => r.id === 'haolam-meri-1973')!;
    expect([ev.kind, ev.date]).toEqual(['renamed-to', '1973-07-03']);
    // the official faction records carry it; the date is the faction's, not a legal registration
    expect(edge('haolam-meri-1973').sources).toEqual(expect.arrayContaining(['odata-k7-factions', 'odata-k7-positions']));
    expect(edge('haolam-meri-1973').effectiveFor).toBe('parliamentary-faction');
    const k7 = JSON.parse(readFileSync('data/research/knesset-member-changes/k7.json', 'utf8'));
    const reg = (id: number) => k7.factionRegistry.find((f: { id: number }) => f.id === id);
    expect([reg(353).end, reg(994).start]).toEqual(['1973-07-03', '1973-07-03']);
  });
});
