import { choose } from './choices.ts';
// The election picker lists every election in public/data/elections.json, newest first. Elections whose
// dataset is not yet built and verified are listed but cannot be chosen.
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// The real index, except that 2003 is forced to "not available", so the test does not depend on
// which elections happen to be released.
const index = (JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[])
  .map((e) => (e.id === 'k16' ? { ...e, available: false } : e));

test.beforeEach(async ({ page }) => {
  await page.route('**/data/elections.json', (route) => route.fulfill({ json: index }));
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en' })));
  await page.goto('/');
});

test('the picker offers the built elections and marks the others as not yet available', async ({ page }) => {
  const picker = page.getByRole('button', { name: 'Election' });
  await picker.click();
  await expect(page.getByRole('dialog').locator('.choice-options').getByRole('button', { name: '2026 · 26th Knesset' })).toBeEnabled();
  await expect(page.getByRole('dialog').locator('.choice-options').getByRole('button', { name: '2022 · 25th Knesset' })).toBeEnabled();
  await expect(page.getByRole('dialog').locator('.choice-options').getByRole('button', { name: 'Apr 2019 · 21st Knesset' })).toBeEnabled();
  await expect(page.getByRole('dialog').locator('.choice-options').getByRole('button', { name: /2003 · 16th Knesset/ })).toBeDisabled();
});

test('choosing another election loads its result', async ({ page }) => {
  await choose(page.getByRole('button', { name: 'Election' }), 'k25');
  const likud = page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true });
  await expect(likud).toContainText('32');
});
