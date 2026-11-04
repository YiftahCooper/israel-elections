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
  const picker = page.getByRole('combobox', { name: 'Election' });
  await expect(picker.getByRole('option', { name: '2026 · 26th Knesset' })).toBeEnabled();
  await expect(picker.getByRole('option', { name: '2022 · 25th Knesset' })).toBeEnabled();
  await expect(picker.getByRole('option', { name: 'Apr 2019 · 21st Knesset' })).toBeEnabled();
  await expect(picker.getByRole('option', { name: '2003 · 16th Knesset — not yet available' })).toBeDisabled();
});

test('choosing another election loads its result', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Election' }).selectOption('k25');
  const likud = page.getByRole('region', { name: 'Lists' }).getByRole('row').filter({ has: page.getByRole('button', { name: 'Likud', exact: true }) });
  await expect(likud).toContainText('32');
});
