// Round 7 calculator fixes: the election list downloads nothing to draw its strips; list pickers show each list's mark.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, level = 'standard') {
  await page.addInitScript((level) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); }, level);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k26');
}

test('opening the election list downloads no election: every strip comes with the list', async ({ page }) => {
  const fetched: string[] = [];
  await start(page);
  page.on('request', (r) => { if (/\/data\/k\d+\.json/.test(r.url())) fetched.push(r.url()); });
  await page.getByRole('button', { name: 'Election', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Election' });
  await expect(dialog.locator('.choice-option[data-choice-value="k1"] .result-preview i').first()).toBeVisible();
  await expect(dialog.locator('.preview-loading')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(fetched).toEqual([]);
  await dialog.locator('[data-choice-value="k25"]').click();
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k25');
  expect(fetched.filter((u) => u.endsWith('/k25.json'))).toHaveLength(1);
});

test('list pickers show each list’s logo or colour dot', async ({ page }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.locator('.lb-row').filter({ hasText: "Hadash–Ta'al" }).first().click();
  const partner = page.locator('.side-panel .agreement-partner .choice-trigger');
  await partner.click();
  const dialog = page.locator(`[id="${await partner.getAttribute('aria-controls')}"]`);
  // every list option has a mark (Ra'am: its logo)
  await expect(dialog.locator('.choice-option[data-choice-value="25-עם"] .list-mark')).toBeVisible();
  const options = dialog.locator('.choice-option[data-choice-value]:not([data-choice-value=""])');
  expect(await options.count()).toBeGreaterThan(5);
  expect(await options.locator('.list-mark').count()).toBe(await options.count());
});

test('a bloc name typed in one language is its name in both', async ({ page }) => {
  await start(page);
  await page.locator('.blocs').getByRole('button', { name: 'Edit blocs', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Bloc name' }).first();
  await input.fill('My bloc'); await input.press('Enter');
  await page.keyboard.press('Escape');
  await expect(page.locator('.blocs')).toContainText('My bloc');
  await page.getByRole('button', { name: 'עברית' }).click();
  await expect(page.locator('.blocs')).toContainText('My bloc');
  await expect(page.locator('.board-choices .choice-trigger')).toContainText('גושים מותאמים');
});

test('a mouse user can switch a table to exact values from the note a value opens', async ({ page }) => {
  await start(page);
  const value = page.locator('.lb-row').first().locator('.percentage[data-rounded]').first();
  const rounded = await value.textContent();
  await value.hover();
  const note = page.getByRole('tooltip').filter({ hasText: 'the exact share' });
  await expect(note).toBeVisible();
  await note.hover();
  await note.getByRole('button', { name: 'Exact values' }).click();
  await expect(value).not.toHaveText(rounded!);
  await expect(value).toHaveAttribute('data-exact');
});
