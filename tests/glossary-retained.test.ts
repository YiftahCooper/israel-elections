// A glossary source that cites a law or page kept in the repo points at the stored copy, and that copy is in the
// provenance manifest under the same address (audit 12 Nov: the law texts behind four glossary claims were not stored).
import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { GLOSSARY_TERMS } from '../src/app/glossary-data.ts';

const manifest: { id: string; file?: string; url: string }[] = JSON.parse(readFileSync('data/raw/SOURCES.json', 'utf8'));
const pointers = GLOSSARY_TERMS.flatMap((t) => (t.sources ?? []).filter((s) => s.retained).map((s) => ({ term: t.id, ...s })));

it('every stored-copy pointer names a file in data/raw recorded in SOURCES.json at the cited address', () => {
  expect(pointers.length).toBeGreaterThanOrEqual(8);
  for (const p of pointers) {
    expect(p.retained!.startsWith('data/raw/'), p.term).toBe(true);
    expect(existsSync(p.retained!), p.retained).toBe(true);
    const entry = manifest.find((m) => m.file && `data/raw/${m.file}` === p.retained);
    expect(entry?.url, `${p.term}: ${p.retained}`).toBe(p.url.replace(/#.*$/, ''));
  }
});

it('the four rules of the audit point at their stored texts', () => {
  const stored = (term: string, re: RegExp) => pointers.filter((p) => p.term === term && re.test(p.supports ?? '')).map((p) => p.retained);
  expect(stored('polling-station', /^ss\.9–11/)).toEqual(['data/raw/law/elections-law-consolidated-extract.txt']);
  expect(stored('polling-station', /^s\.70\(b\)/)).toEqual(['data/raw/law/elections-law-consolidated-extract.txt']);
  expect(stored('ballot-letters', /^s\.61\(a\)/)).toEqual(['data/raw/law/elections-law-consolidated-extract.txt']);
  expect(stored('government-formation', /s\.3\(b\)/)).toEqual(['data/raw/law/basic-law-government-1992.pdf']);
  expect(stored('modified-sainte-lague', /1\.2/)).toEqual(['data/raw/law/sweden-seat-allocation-extract.txt']);
  expect(stored('polling-station', /^1949/)).toEqual(['data/raw/k1/law-1948.pdf', 'data/raw/k1/law-1948-312720.pdf']);
});

it('the stored extracts carry their address, date and what they are', () => {
  const nevo = readFileSync('data/raw/law/elections-law-consolidated-extract.txt', 'utf8');
  expect(nevo).toMatch(/https:\/\/www\.nevo\.co\.il\/law_html\/law01\/190_026\.htm/);
  expect(nevo).toMatch(/2026-11-12/);
  expect(nevo).toMatch(/not an official publication/i);
  const sweden = readFileSync('data/raw/law/sweden-seat-allocation-extract.txt', 'utf8');
  expect(sweden).toMatch(/val\.se/);
  expect(sweden).toMatch(/1,2/);
});
