import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { scanDocument, generateRegister, renderMarkdown, checkRegister } from '../scripts/gaps-register.ts';

it('the committed register and prose cannot drift from their inputs', () => {
  const register = generateRegister();
  expect(JSON.parse(readFileSync('docs/data-gaps.json', 'utf8'))).toEqual(register);
  expect(readFileSync('docs/data-gaps.md', 'utf8')).toBe(renderMarkdown(register));
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

it('rejects modified output and new raw evidence, even when no gap value changes', () => {
  mkdirSync('.backup-scratch', { recursive: true });
  const root = mkdtempSync('.backup-scratch/gaps-test-');
  try {
    for (const dir of ['src/data', 'public/data', 'data/raw', 'docs']) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, 'src/data/schema.ts'), '');
    writeFileSync(join(root, 'public/data/elections.json'), '[]');
    const register = generateRegister(root);
    writeFileSync(join(root, 'docs/data-gaps.json'), JSON.stringify(register, null, 2) + '\n');
    writeFileSync(join(root, 'docs/data-gaps.md'), renderMarkdown(register));
    expect(() => checkRegister(root)).not.toThrow();
    writeFileSync(join(root, 'docs/data-gaps.md'), 'edited manually');
    expect(() => checkRegister(root)).toThrow(/stale/);
    writeFileSync(join(root, 'docs/data-gaps.md'), renderMarkdown(register));
    writeFileSync(join(root, 'data/raw/new.pdf'), 'retained evidence bytes');
    expect(() => checkRegister(root)).toThrow(/stale/);
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
