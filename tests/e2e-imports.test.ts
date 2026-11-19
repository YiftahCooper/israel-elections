// Every browser test goes through tests/e2e/fixtures.ts, so the PW_SLOW switch (CPU slowed 4×, to show races a slow CI
// runner hits) reaches every page. A spec importing `test` straight from '@playwright/test' would silently skip it.
import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const dir = new URL('./e2e/', import.meta.url);

test('every e2e file imports test and expect from ./fixtures, not from @playwright/test', () => {
  const offenders = readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'fixtures.ts')
    .filter(f => /from\s*['"]@playwright\/test['"]/.test(readFileSync(new URL(f, dir), 'utf8')));
  expect(offenders).toEqual([]);
});
