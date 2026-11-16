import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { certaintyCeiling, certaintyAllowed, classificationCertainty, independenceKey, sourceTier, type EvidenceSource } from '../src/data/evidence.ts';
import { claimCertainty, validateEvidenceDocument } from '../scripts/lib/build/evidence.ts';

const S: Record<string, EvidenceSource> = {
  plenum: { url: 'https://fs.knesset.gov.il/9/Plenum/9_ptm_254065.pdf', kind: 'official' },
  lexicon: { url: 'https://main.knesset.gov.il/About/Lexicon/pages/unitygovt.aspx', kind: 'official' },
  crs: { url: 'https://www.everycrsreport.com/reports/x.html', kind: 'official' },
  gazetteMirror: { url: 'https://olaw.org.il/x.pdf', official: true },
  wayback: { url: 'https://web.archive.org/web/2009/https://www.knesset.gov.il/elections18/heb/results/main_Results.asp', kind: 'official' },
  jta: { url: 'https://www.jta.org/archive/a', kind: 'archival', publisher: 'JTA' },
  upi: { url: 'https://www.upi.com/Archives/1988/11/14/x', kind: 'secondary', publisher: 'UPI Archives' },
  latUpi: { url: 'https://www.latimes.com/archives/la-xpm-1988-11-14-mn-244-story.html', kind: 'secondary', publisher: 'Los Angeles Times (UPI)' },
  lat: { url: 'https://www.latimes.com/archives/la-xpm-1992-07-03-mn-1517-story.html', kind: 'archival', publisher: 'Daniel Williams / Los Angeles Times' },
  nyt: { url: 'https://www.nytimes.com/1992/07/03/world/x.html', kind: 'secondary', publisher: 'The New York Times' },
  idi: { url: 'https://www.idi.org.il/media/20997/x.pdf', kind: 'academic' },
  idiProfile: { url: 'https://en.idi.org.il/israeli-elections-and-parties/parties/shas/', kind: 'secondary' },
  retro: { url: 'https://www.972mag.com/x/', kind: 'secondary', tier: 'retrospective' },
  timeline: { url: 'https://kvia.com/x', kind: 'secondary', publisher: 'CNN Editorial Research, Benjamin Netanyahu Fast Facts' },
  hewiki: { url: 'https://he.wikipedia.org/wiki/x', kind: 'secondary' },
};
const cite = (...ids: string[]) => ids.map(id => ({ id, source: S[id] }));

describe('source tiers', () => {
  it('separates records of the act from institutional accounts and press', () => {
    expect(sourceTier(S.plenum)).toBe('primary');
    expect(sourceTier(S.wayback)).toBe('primary');
    expect(sourceTier(S.gazetteMirror)).toBe('primary');
    expect(sourceTier(S.lexicon)).toBe('scholarship');
    expect(sourceTier(S.crs)).toBe('scholarship');
    expect(sourceTier(S.idi)).toBe('scholarship');
    expect(sourceTier(S.idiProfile)).toBe('scholarship');
    expect(sourceTier(S.jta)).toBe('contemporary');
    expect(sourceTier(S.nyt)).toBe('contemporary');
    expect(sourceTier(S.retro)).toBe('retrospective');
    expect(sourceTier(S.timeline)).toBe('retrospective');
    expect(sourceTier(S.hewiki)).toBe('pointer');
    expect(sourceTier({ ...S.hewiki, tier: 'primary' })).toBe('pointer');
  });
  it('counts copies of one wire story once', () => {
    expect(independenceKey('upi', S.upi)).toBe(independenceKey('latUpi', S.latUpi));
    expect(independenceKey('lat', S.lat)).not.toBe(independenceKey('latUpi', S.latUpi));
    expect(certaintyCeiling(cite('upi', 'latUpi'))).toBe('provisional');
  });
});

describe('certainty thresholds', () => {
  it('derives the ceiling from independent evidence', () => {
    expect(certaintyCeiling(cite('plenum'))).toBe('confirmed');
    expect(certaintyCeiling(cite('jta', 'idi'))).toBe('confirmed');
    expect(certaintyCeiling(cite('jta', 'nyt', 'lat'))).toBe('confirmed');
    expect(certaintyCeiling(cite('idi'))).toBe('probable');
    expect(certaintyCeiling(cite('jta', 'nyt'))).toBe('probable');
    expect(certaintyCeiling(cite('jta', 'retro'))).toBe('probable');
    expect(certaintyCeiling(cite('jta'))).toBe('provisional');
    expect(certaintyCeiling(cite('retro', 'timeline'))).toBe('provisional');
    expect(certaintyCeiling(cite('hewiki'))).toBe('unknown');
    expect(certaintyCeiling([])).toBe('unknown');
  });
  it('lets a claim be recorded below, never above, its ceiling', () => {
    expect(certaintyAllowed('provisional', 'confirmed')).toBe(true);
    expect(certaintyAllowed('confirmed', 'probable')).toBe(false);
    expect(certaintyAllowed('disputed', 'provisional')).toBe(true);
    expect(certaintyAllowed('unknown', 'confirmed')).toBe(true);
  });
  it('never confirms an editorial family placement', () => {
    expect(classificationCertainty('documented', cite('idiProfile'))).toBe('probable');
    expect(classificationCertainty('documented', cite('plenum'))).toBe('provisional');
    expect(classificationCertainty('inferred', cite('idi'))).toBe('provisional');
  });
});

describe('overlay validator', () => {
  const doc = (extra: object) => ({ sources: S, ...extra });
  const role = (certainty: string, sources: string[], note?: string) => doc({ government: { coalition: [{ letters: 'א', certainty, cites: sources.map(source => ({ source, quote: 'q' })), ...(note ? { note } : {}) }] } });
  it('rejects a certainty its sources cannot support', () => {
    expect(() => validateEvidenceDocument(role('confirmed', ['jta']), 't')).toThrow(/exceeds/);
    expect(() => validateEvidenceDocument(role('probable', ['idi']), 't')).not.toThrow();
    expect(() => validateEvidenceDocument(role('certain', ['plenum']), 't')).toThrow(/invalid certainty/);
  });
  it('requires a note when a claim is recorded below its sources', () => {
    expect(() => validateEvidenceDocument(role('provisional', ['plenum']), 't')).toThrow(/needs a note/);
    expect(() => validateEvidenceDocument(role('provisional', ['plenum'], 'Vote only; no arrangement recovered.'), 't')).not.toThrow();
  });
  it('requires both sides of a dispute', () => {
    expect(() => validateEvidenceDocument(role('disputed', ['jta'], 'x'), 't')).toThrow(/disputed/);
    expect(() => validateEvidenceDocument(role('disputed', ['jta', 'idi'], 'x'), 't')).not.toThrow();
  });
  it('does not let a pointer establish a recommendation', () => {
    const rec = (status: string, sources: string[]) => doc({ recommendationRounds: [{ id: 'r1', entries: [{ letters: 'א', seats: 1, status, cites: sources.map(source => ({ source, quote: 'q' })) }] }] });
    expect(() => validateEvidenceDocument(rec('recommended', ['hewiki']), 't')).toThrow(/reliable source/);
    expect(() => validateEvidenceDocument(rec('recommended', ['idi']), 't')).not.toThrow();
    expect(() => validateEvidenceDocument(rec('unknown', []), 't')).not.toThrow();
  });
  it('never accepts English Wikipedia or a dangling citation', () => {
    expect(() => validateEvidenceDocument({ sources: { x: { url: 'https://en.wikipedia.org/wiki/X' } } }, 't')).toThrow(/English Wikipedia/);
    expect(() => validateEvidenceDocument(role('confirmed', ['missing']), 't')).toThrow(/unknown citation/);
  });
});

describe("owner's book rule (16 Nov 2026)", () => {
  // Books carry their authorship as `evidenceFamily`; two chapters by one author, or a reprint, share it.
  const B: Record<string, EvidenceSource> = {
    galnoor: { url: 'https://doi.org/10.1017/9781316160978', kind: 'academic', evidenceFamily: 'author:galnoor' },
    galnoorOxford: { url: 'https://doi.org/10.1093/oxfordhb/9780190675585.013.9', kind: 'academic', evidenceFamily: 'author:galnoor' },
    diskin: { url: 'https://openlibrary.org/works/OL4457043W', kind: 'academic', evidenceFamily: 'author:diskin' },
    goldberg1998: { url: 'https://doi.org/10.2979/isr.1998.3.1.211', kind: 'academic', evidenceFamily: 'author:goldberg' },
    goldberg2000: { url: 'https://doi.org/10.4324/9781315038865', kind: 'academic', evidenceFamily: 'author:goldberg' },
    idi: S.idi, lexicon: S.lexicon, jta: S.jta,
  };
  const books = (...ids: string[]) => ids.map(id => ({ id, source: B[id] }));
  it('confirms a fact two independent scholarly works state', () => {
    expect(certaintyCeiling(books('galnoor', 'diskin'))).toBe('confirmed');
    expect(certaintyCeiling(books('goldberg1998', 'diskin', 'galnoor'))).toBe('confirmed');
  });
  it('counts works by one author, or a reprint, once', () => {
    expect(certaintyCeiling(books('galnoor', 'galnoorOxford'))).toBe('probable');
    expect(certaintyCeiling(books('goldberg1998', 'goldberg2000'))).toBe('probable');
  });
  it('keeps one scholarly work alone at probable', () => {
    expect(certaintyCeiling(books('diskin'))).toBe('probable');
    expect(certaintyCeiling(books('galnoor'))).toBe('probable');
  });
  it('does not count undeclared scholarship as independent works', () => {
    // An institute's page and the Knesset's own history page: authorship is not declared, so no count can confirm.
    expect(certaintyCeiling(books('idi', 'lexicon'))).toBe('probable');
    expect(certaintyCeiling(books('idi', 'diskin'))).toBe('probable');
  });
  it('confirms one scholarly work whose passage cites the official record', () => {
    expect(certaintyCeiling([{ id: 'galnoorOxford', source: B.galnoorOxford, citesRecord: 'Labor coalition agreements of 9 July 1992' }])).toBe('confirmed');
    expect(certaintyCeiling([{ id: 'galnoorOxford', source: B.galnoorOxford, citesRecord: ' ' }])).toBe('probable');
    // Only scholarship can rest on a record it cites; a news report naming a record stays a news report.
    expect(certaintyCeiling([{ id: 'jta', source: B.jta, citesRecord: 'the agreement' }])).toBe('provisional');
  });
  const row = (certainty: string, cites: object[], note?: string) => ({ sources: B, government: { coalition: [{ letters: 'א', certainty, cites, ...(note ? { note } : {}) }] } });
  const q = (source: string, extra: object = {}) => ({ source, quote: 'q', ...extra });
  it('the build accepts exactly this', () => {
    expect(() => validateEvidenceDocument(row('confirmed', [q('galnoor'), q('diskin')]), 't')).not.toThrow();
    expect(() => validateEvidenceDocument(row('confirmed', [q('galnoorOxford', { citesRecord: 'Labor coalition agreements of 9 July 1992' })]), 't')).not.toThrow();
  });
  it('the build keeps rejecting a single book, or one author twice, as confirmed', () => {
    expect(() => validateEvidenceDocument(row('confirmed', [q('diskin')]), 't')).toThrow(/exceeds/);
    expect(() => validateEvidenceDocument(row('confirmed', [q('galnoor'), q('galnoorOxford')]), 't')).toThrow(/exceeds/);
    expect(() => validateEvidenceDocument(row('confirmed', [q('goldberg1998'), q('goldberg2000')]), 't')).toThrow(/exceeds/);
    expect(() => validateEvidenceDocument(row('confirmed', [q('idi'), q('lexicon')]), 't')).toThrow(/exceeds/);
  });
  it('the build refuses a record claim on a non-scholarly cite or an empty one', () => {
    expect(() => validateEvidenceDocument(row('provisional', [q('jta', { citesRecord: 'the agreement' })]), 't')).toThrow(/only for a scholarly work/);
    expect(() => validateEvidenceDocument(row('probable', [q('diskin', { citesRecord: '' })]), 't')).toThrow(/must name/);
  });
  it('lets a recorded probable sit below two books only with a note', () => {
    expect(() => validateEvidenceDocument(row('probable', [q('galnoor'), q('diskin')]), 't')).toThrow(/needs a note/);
    expect(() => validateEvidenceDocument(row('probable', [q('galnoor'), q('diskin')], 'Only one of them says outside support.'), 't')).not.toThrow();
  });
});

describe('7 November policy pass on the real overlays', () => {
  const load = (id: string) => JSON.parse(readFileSync(`data/meta/aftermath/${id}.json`, 'utf8'));
  it('every overlay passes the policy validator', () => {
    for (let i = 1; i <= 26; i++) expect(() => validateEvidenceDocument(load(`k${i}`), `k${i}`)).not.toThrow();
  });
  it('records settled items at the certainty their sources support', () => {
    const k12 = load('k12'), round12 = k12.recommendationRounds[0];
    const entry = (round: any, letters: string) => round.entries.find((e: any) => e.letters === letters);
    expect(entry(round12, 'עץ').status).toBe('none');
    expect(claimCertainty(entry(round12, 'עץ'), k12.sources)).toBe('probable');
    for (const l of ['ו', 'פ', 'ע']) expect([entry(round12, l).nominee, claimCertainty(entry(round12, l), k12.sources)]).toEqual(['peres', 'provisional']);
    expect(Object.values<number>(round12.totals).reduce((a, b) => a + b, 0)).toBe(120);
    const k1 = load('k1'), row = (l: string) => k1.government.coalition.find((r: any) => r.letters === l);
    expect([row('יד').role, row('יד').certainty]).toEqual(['member-without-ministries', 'probable']);
    expect(row('ל').certainty).toBe('disputed');
    expect(k1.government.coalitionSeats).toBe(73);
    const k10 = load('k10');
    // 17 Nov 2026: Navon's request (15 July, two reports of the time) and his letter (16 July) are two acts, not a dispute.
    expect(k10.formation.events.find((e: any) => e.type === 'mandate-given' && e.date === '1981-07-15').certainty).toBe('probable');
    expect(k10.formation.conflicts.find((c: any) => c.about === 'Begin tasking date').status).toBe('resolved');
  });
});

describe('books batch 3: formation and term dates (17 Nov 2026)', () => {
  const load = (id: string) => JSON.parse(readFileSync(`data/meta/aftermath/${id}.json`, 'utf8'));
  const at = (k: string, path: string) => { const d = load(k); return [path.split('.').reduce((a: any, x) => a[/^\d+$/.test(x) ? +x : x], d), d.sources] as const; };
  it('confirms a date only where two independent works, a report of the time or an official record support it', () => {
    for (const [k, path] of [['k7', 'term.endedBy'], ['k8', 'term.events.5'], ['k15', 'formation.events.2'], ['k15', 'term.events.4'], ['k15', 'term.endedBy'],
      ['k16', 'term.events.1'], ['k16', 'term.events.2'], ['k17', 'government.changes.2'], ['k18', 'formation.events.0'], ['k19', 'formation.events.0'],
      ['k19', 'term.events.1'], ['k12', 'government.changes.1'], ['k13', 'government.changes.0'], ['k15', 'government.changes.0']] as const) {
      const [o, sources] = at(k, path);
      expect([k, path, claimCertainty(o, sources)]).toEqual([k, path, 'confirmed']);
    }
  });
  it('keeps one book plus an institute page probable, and the 1981 request probable without the flagged book', () => {
    const [e1951, s1] = at('k1', 'term.endedBy');
    expect(claimCertainty(e1951, s1)).toBe('probable');
    const [e1981, s10] = at('k10', 'formation.events.1');
    expect([e1981.certainty, e1981.cites.map((c: any) => s10[c.source].publisher).join(' | ')]).not.toContain(expect.stringMatching(/Bradley/));
    expect(e1981.certainty).toBe('probable');
  });
  it('dates the 2014 firing from the report of the time, with the one-book dissent noted', () => {
    const [e, sources] = at('k19', 'term.events.1');
    expect(e.date).toBe('2014-12-02');
    expect(sourceTier(sources['ynet-dismissal-2014'])).toBe('contemporary');
    expect(e.notes.join(' ')).toMatch(/1 December/);
  });
});
