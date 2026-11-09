import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The research builders regenerate committed data offline from data/raw. Hand corrections belong in reviewed
// inputs the builders apply, never in the outputs, so a rebuild must reproduce every committed file exactly.
const check = (script: string) => {
  try {
    execFileSync('python3', ['-I', `scripts/research/${script}`, '--check'], { encoding: 'utf8', stdio: 'pipe' });
    return '';
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message: string };
    return `${err.stdout ?? ''}${err.stderr ?? ''}` || err.message;
  }
};
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

describe('research builders reproduce the committed data', () => {
  it('build-bios.py rebuilds data/meta/bios and the coverage table unchanged', () => {
    expect(check('build-bios.py'), 'move the hand correction into data/raw/bios/*.reviewed.json').toBe('');
  }, 120_000);
  it('build-party-links.py rebuilds data/meta/party-links, coverage.json and the doc tables unchanged', () => {
    expect(check('build-party-links.py'), 'move the hand correction into data/raw/party-links/overlay-corrections.reviewed.json').toBe('');
  }, 120_000);
  it('every reviewed correction states its reason and source', () => {
    const links = json('data/raw/party-links/overlay-corrections.reviewed.json');
    const bios = json('data/raw/bios/entry-corrections.reviewed.json');
    for (const item of [...links.aliases, ...links.entries, ...bios.knessetVerified]) {
      expect(item.reason, JSON.stringify(item).slice(0, 80)).toMatch(/\S{3}/);
      expect(item.source, JSON.stringify(item).slice(0, 80)).toMatch(/\S{3}/);
    }
    for (const item of bios.displayNames) expect(item.source).toMatch(/\S{3}/);
    for (const d of json('data/raw/bios/identity-decisions.reviewed.json').decisions) expect(d.reason).toMatch(/\S{3}/);
  });
});
