import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { scanDocument, generateRegister, renderMarkdown, checkRegister, generateFullRegister, summarizeRegister, writeRegister, serializeSummary, importanceOf, isOpen, areaOf, type GapKind } from '../scripts/gaps-register.ts';

it('the committed register and prose cannot drift from their inputs', () => {
  const register = generateRegister();
  expect(JSON.parse(readFileSync('docs/data-gaps.json', 'utf8'))).toEqual(register);
  expect(readFileSync('docs/data-gaps.md', 'utf8')).toBe(renderMarkdown(register));
  const md = renderMarkdown(register);
  expect(md.split('\n').length).toBeLessThanOrEqual(400);
  expect(Buffer.byteLength(md)).toBeLessThanOrEqual(100_000);
  expect(Buffer.byteLength(readFileSync('docs/data-gaps.json'))).toBeLessThanOrEqual(100_000);
  expect(register).not.toHaveProperty('inventory');
  expect(register).not.toHaveProperty('inputDigest');
  // Leads with high-importance open items, then medium, then low counts only.
  const order = ['## High importance', '## Medium importance', '## Low importance'].map(h => md.indexOf(h));
  expect(order.every((n, i) => n > 0 && (i === 0 || n > order[i - 1]))).toBe(true);
  const full = generateFullRegister();
  const highOpen = full.gaps.filter(g => g.importance === 'high' && isOpen(g));
  expect(register.high.reduce((n, g) => n + g.count, 0)).toBe(highOpen.length);
  for (const g of highOpen) {
    const election = /^k\d+$/.test(g.election) ? `k${Number(g.election.slice(1))}` : g.election;
    const groupRow = register.high.find(r => r.election === election && r.file === g.file && r.area === areaOf(g, 2));
    expect(groupRow, `${g.election} ${g.item}`).toBeTruthy();
    if (g.letters) expect(groupRow!.labels).toContain(g.letters);
  }
  expect(register.medium.reduce((n, g) => n + g.count, 0)).toBe(full.gaps.filter(g => g.importance === 'medium' && isOpen(g)).length);
  expect(register.low.reduce((n, g) => n + g.count, 0)).toBe(full.gaps.filter(g => g.importance === 'low').length);
  expect(Object.values(register.countsByImportance).reduce((n, c) => n + c.total, 0)).toBe(register.total);
  expect(Object.values(register.countsByStatus).reduce((a, b) => a + b, 0)).toBe(register.total);
  expect(register.elections.reduce((n, e) => n + e.total, 0)).toBe(register.total);
  expect(register.elections.some(e => /^k0/.test(e.election))).toBe(false);
  expect(register.elections.find(e => e.election === 'k1')?.total).toBe(full.gaps.filter(g => g.election === 'k1' || g.election === 'k01').length);
  // Unknown recommendations stay visible as high-importance, unknown-certainty work.
  const recommendations = full.gaps.filter(g => g.kind === 'unknown' && /recommendationRounds.*entries/.test(g.item));
  expect(recommendations.length).toBeGreaterThan(0);
  for (const g of recommendations) expect([g.importance, g.certainty]).toEqual(['high', 'unknown']);
  for (const g of full.gaps.filter(g => g.kind === 'conflict')) expect(g.certainty).toBe('disputed');
  expect(Object.keys(register.claimCertainty)).toEqual(expect.arrayContaining(['Recommendations', 'Government roles', 'Formation events', 'Family classifications', 'Candidate identity links']));
  expect(register.claimCertainty['Family classifications'].confirmed).toBe(0);
}, 60000);
it('ranks importance by code rules, not hand tags', () => {
  const at = (file: string, item: string, kind: GapKind = 'unknown') => importanceOf({ file, item, kind });
  expect(at('data/meta/aftermath/k13.json', 'r1 / $.recommendationRounds[*].entries[*].status')).toBe('high');
  expect(at('data/meta/aftermath/k9.json', '$.government.coalition[*].certainty')).toBe('high');
  expect(at('data/meta/aftermath/k10.json', 'mandate-given 1981-07-16 / $.formation.events[*]', 'single-source')).toBe('high');
  expect(at('public/data/k5.json', '$.agreements', 'single-source')).toBe('high');
  expect(at('docs/decisions/0001.md', 'Editorial evidence review, line 3', 'release-hold')).toBe('high');
  expect(at('data/meta/aftermath/k10.json', '$.term.events[*]', 'single-source')).toBe('medium');
  expect(at('data/meta/families/haredi.json', '$.elections[*].members[*].classificationEvidence', 'inferred')).toBe('medium');
  expect(at('data/meta/aftermath/k13.json', 'r1 / $.recommendationRounds[*].notes[*]', 'pending')).toBe('medium');
  expect(at('data/meta/k1.json', '$.colours[*].confidence', 'low-confidence')).toBe('low');
  expect(at('data/meta/bios/k1.json', '$.candidates.x.hewiki')).toBe('low');
  expect(at('data/raw/SOURCES.json', '$[*].sha256', 'missing-field')).toBe('low');
});
it('derives each gap’s certainty from the record’s own sources', () => {
  const rows = scanDocument('data/meta/aftermath/k13.json', { electionId: 'k13',
    sources: { gazette: { url: 'https://www.gov.il/x.pdf', kind: 'official' }, paper: { url: 'https://www.jta.org/a', kind: 'archival' }, wiki: { url: 'https://he.wikipedia.org/wiki/x', kind: 'secondary' } },
    formation: { events: [
      { type: 'mandate-given', date: '1992-07-02', cites: [{ source: 'gazette' }] },
      { type: 'consultations', date: '1992-06-28', cites: [{ source: 'paper' }] },
      { type: 'confidence-vote', date: '1992-07-13', cites: [{ source: 'wiki' }] },
    ], conflicts: [{ about: 'date', values: [] }] },
    recommendationRounds: [{ id: 'r1', entries: [{ letters: 'ג', seats: 4, status: 'unconfirmed' }] }],
  });
  const of = (text: string) => rows.find(r => r.item.includes(text))!;
  expect(of('mandate-given').certainty).toBe('confirmed');
  expect(isOpen(of('mandate-given'))).toBe(false);
  expect(of('consultations').certainty).toBe('provisional');
  expect(of('confidence-vote').certainty).toBe('unknown');
  expect(rows.find(r => r.kind === 'conflict')!.certainty).toBe('disputed');
  expect(rows.find(r => r.letters === 'ג' && r.kind === 'unknown')).toMatchObject({ importance: 'high', certainty: 'unknown' });
});
it('finds uncertainty, missing recommendations, conflicts and duplicate source families', () => {
  const rows = scanDocument('data/meta/aftermath/k13.json', {
    electionId: 'k13', sources: { a: { url: 'https://example.org/a' }, b: { url: 'https://example.org/a' } },
    recommendationRounds: [{ id: 'r1', entries: [{ letters: 'ג', status: 'unknown' }, { letters: 'ץ', status: 'recommended' }] }],
    term: { events: [{ id: 'event', date: '1992-06-28', cites: [{ source: 'a' }, { source: 'b' }] }] },
    conflicts: [{ id: 'conflict', note: 'Sources disagree' }],
    colour: { confidence: 'low' }, classificationEvidence: { status: 'inferred' },
  });
  for (const kind of ['unknown', 'missing-field', 'conflict', 'single-source', 'low-confidence', 'inferred'])
    expect(rows.some(r => r.kind === kind), kind).toBe(true);
  expect(rows.find(r => r.kind === 'unknown')?.letters).toBe('ג');
});
it('never names an election or record by an object, and skips JSON Schema files', () => {
  // A JSON Schema describes fields; `electionId: { const: 'k25' }` is not an election id and `sourceIds` is not a citation.
  expect(scanDocument('data/raw/polls/k25/schema.draft.json', { $schema: 'https://json-schema.org/draft/2020-12/schema',
    properties: { polls: { items: { properties: { id: { type: 'string' }, electionId: { const: 'k25' }, sourceIds: { type: 'array' } } } } } })).toEqual([]);
  // Any other record whose ids are objects falls back to the file's election and its own path.
  const rows = scanDocument('data/raw/polls/k25/other.json', { items: [{ id: { x: 1 }, electionId: { const: 'k25' }, sourceIds: ['a'], status: 'unknown' }] });
  expect(rows.length).toBeGreaterThan(0);
  for (const r of rows) { expect(r.election).toBe('k25'); expect(r.item).not.toContain('[object Object]'); }
  expect(readFileSync('docs/data-gaps.md', 'utf8')).not.toContain('[object Object]');
  expect(readFileSync('docs/data-gaps.json', 'utf8')).not.toContain('[object Object]');
});
it('does not turn documented none or optional display fields into missing data', () => {
  expect(scanDocument('data/meta/aftermath/k13.json', {
    electionId: 'k13', recommendationRounds: [{ entries: [{ letters: 'ג', seats: 4, status: 'none', cites: [{ source: 'a' }, { source: 'b' }] }] }],
    shortEn: null, lastModified: null,
  }).filter(r => r.kind === 'unknown' || r.kind === 'missing-field')).toEqual([]);
});
it('keeps different consultation rounds distinct and uses ballot identity instead of internal IDs', () => {
  const scan = (id: string) => scanDocument('data/meta/aftermath/k13.json', { electionId: 'k13', recommendationRounds: [
    { id: 'r1', entries: [{ listId: id, letters: 'ג', nameHe: 'יהדות התורה', seats: 4, status: 'unknown' }] },
    { id: 'r2', entries: [{ listId: id, letters: 'ג', nameHe: 'יהדות התורה', seats: 4, status: 'unknown' }] },
  ] }).filter(r => r.kind === 'unknown');
  expect(scan('old').map(r => r.key)).toEqual(scan('new').map(r => r.key));
  expect(new Set(scan('old').map(r => r.key)).size).toBe(2);
});

it('rejects modified summaries and new gaps but ignores evidence bytes outside summary scope', () => {
  mkdirSync('.backup-scratch', { recursive: true });
  const root = mkdtempSync('.backup-scratch/gaps-test-');
  try {
    for (const dir of ['src/data', 'public/data', 'data/raw', 'docs']) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, 'src/data/schema.ts'), '');
    writeFileSync(join(root, 'public/data/elections.json'), '[]');
    const register = generateRegister(root);
    writeFileSync(join(root, 'docs/data-gaps.json'), serializeSummary(register));
    writeFileSync(join(root, 'docs/data-gaps.md'), renderMarkdown(register));
    expect(() => checkRegister(root)).not.toThrow();
    writeFileSync(join(root, 'docs/data-gaps.md'), 'edited manually');
    expect(() => checkRegister(root)).toThrow(/stale/);
    writeFileSync(join(root, 'docs/data-gaps.md'), renderMarkdown(register));
    writeFileSync(join(root, 'data/raw/new.pdf'), 'retained evidence bytes');
    expect(() => checkRegister(root)).not.toThrow();
    writeFileSync(join(root, 'data/raw/new.json'), JSON.stringify({ confidence: 'low' }));
    expect(() => checkRegister(root)).toThrow(/stale/);
    writeRegister(root);
    expect(() => checkRegister(root)).not.toThrow();
    expect(() => readFileSync(join(root, '.backup-scratch/data-gaps/full.json'))).toThrow();
    writeRegister(root, true);
    const full = JSON.parse(readFileSync(join(root, '.backup-scratch/data-gaps/full.json'), 'utf8'));
    expect(full.gaps.some((g: { kind: string }) => g.kind === 'low-confidence')).toBe(true);
    expect(readFileSync(join(root, '.backup-scratch/data-gaps/full.md'), 'utf8')).toContain('low-confidence');
    expect(() => checkRegister(root)).not.toThrow();
  } finally { rmSync(root, { recursive: true, force: true }); }
});
it('does not flag each citation as a separate single-source event', () => {
  const rows = scanDocument('data/meta/aftermath/k13.json', { electionId: 'k13',
    sources: { a: { url: 'https://example.org/a' }, b: { url: 'https://other.org/b' } },
    formation: { events: [
      { type: 'mandate-given', date: '1992-07-02', cites: [{ source: 'a' }, { source: 'b' }] },
      { type: 'consultations', date: '1992-06-28', cites: [{ source: 'a' }] },
    ] },
  }).filter(r => r.kind === 'single-source');
  expect(rows).toHaveLength(1);
  expect(rows[0].item).toContain('consultations 1992-06-28');
});
it('keeps resolved roster corrections out of the open conflict queue', () => {
  const rows = scanDocument('data/meta/k10.json', { electionId: 'k10',
    resolvedRosterConflicts: [{ letters: 'אמת', rank: 17, resolution: 'transcription error corrected', resolvedOn: '2026-11-06' }],
    conflicts: [{ id: 'open', status: 'unresolved' }, { id: 'closed', status: 'resolved' }],
  }).filter(r => r.kind === 'conflict');
  expect(rows).toHaveLength(1);
  expect(rows[0].item).toContain('open');
});

it('bulk details do not stale the summary when counts and selected items are unchanged', () => {
  const full = generateFullRegister();
  const before = summarizeRegister(full);
  const bulk = full.gaps.find(g => g.kind === 'single-source')!;
  bulk.uncertainty = 'Changed bulk-only wording';
  bulk.sources = ['https://example.org/new-source'];
  expect(summarizeRegister(full)).toEqual(before);
  const selected = full.gaps.find(g => g.kind === 'conflict' && g.importance === 'high')!;
  selected.uncertainty = 'Changed summary-level description of what is disputed';
  expect(summarizeRegister(full)).not.toEqual(before);
});
