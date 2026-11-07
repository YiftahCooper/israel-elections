import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { scanDocument, generateRegister, renderMarkdown, checkRegister, importantOpenGaps, generateFullRegister, summarizeRegister, writeRegister, serializeSummary } from '../scripts/gaps-register.ts';

it('the committed register and prose cannot drift from their inputs', () => {
  const register = generateRegister();
  expect(JSON.parse(readFileSync('docs/data-gaps.json', 'utf8'))).toEqual(register);
  expect(readFileSync('docs/data-gaps.md', 'utf8')).toBe(renderMarkdown(register));
  expect(importantOpenGaps(register).length).toBeLessThanOrEqual(15);
  expect(importantOpenGaps(register)[0]).toContain('k13');
  const md = renderMarkdown(register);
  expect(md.split('\n').length).toBeLessThanOrEqual(300);
  expect(Buffer.byteLength(md)).toBeLessThanOrEqual(100_000);
  expect(register).not.toHaveProperty('inventory');
  expect(register).not.toHaveProperty('inputDigest');
  const full = generateFullRegister();
  const selected = full.gaps.filter(g => g.kind === 'conflict' || g.kind === 'low-confidence' || (g.kind === 'unknown' && /recommendationRounds.*entries/.test(g.item)));
  expect(register.items).toHaveLength(selected.length);
  for (const g of selected) expect(register.items).toContainEqual(expect.objectContaining({ election: g.election, kind: g.kind, item: g.item, letters: g.letters, name: g.name }));
  expect(Object.values(register.countsByStatus).reduce((a, b) => a + b, 0)).toBe(register.total);
  expect(register.elections.reduce((n, e) => n + e.total, 0)).toBe(register.total);
  expect(register.elections.some(e => /^k0/.test(e.election))).toBe(false);
  expect(register.elections.find(e => e.election === 'k1')?.total).toBe(full.gaps.filter(g => g.election === 'k1' || g.election === 'k01').length);
}, 30000);
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
  const selected = full.gaps.find(g => g.kind === 'low-confidence')!;
  selected.uncertainty = 'Changed summary-level confidence explanation';
  expect(summarizeRegister(full)).not.toEqual(before);
});
