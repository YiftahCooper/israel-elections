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
    expect(k10.formation.events.find((e: any) => e.type === 'mandate-given' && e.date === '1981-07-15').certainty).toBe('disputed');
  });
});
