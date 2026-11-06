// Sensitivity screen (owner review, 5 Nov 2026): the page answers its three questions as soon as it opens, its
// pickers follow the election, its tables compare with the current result, and its bloc claim matches the chamber.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })); } }, lang);
  await page.goto('/');
  await page.locator('#tab-sens').click();
}
const panel = (page: Page) => page.locator('#analysis-panel');
const election = (page: Page, id: string) => choose(page.getByRole('button', { name: 'Election', exact: true }), id);
const blocRow = (page: Page) => panel(page).locator('.row > .small > bdi[dir="ltr"]');

test('opening the page shows all three answers with defaults, without pressing anything', async ({ page }) => {
  await start(page);
  await expect(panel(page).getByRole('img', { name: 'Seats against votes' })).toBeVisible({ timeout: 60_000 });
  await expect(panel(page).getByRole('img', { name: 'Highest threshold each list passes' })).toBeVisible();
  await expect(panel(page).locator('.callout')).toContainText(/votes? moving from .+ give the bloc a majority/, { timeout: 120_000 });
  await expect(panel(page).locator('.callout > .row > bdi')).toHaveText('53 → 61 / 61');
  await expect(panel(page).getByRole('button', { name: /^(Run|Search)$/ })).toHaveCount(0);
});

test('tables compare with the current result and mark where it stands now', async ({ page }) => {
  await start(page);
  const sweepNow = panel(page).locator('.sweep-tbl tbody tr[aria-current="true"]');
  await expect(sweepNow).toHaveCount(1, { timeout: 60_000 });
  await expect(panel(page).getByRole('columnheader', { name: 'Other lists vs now' })).toBeVisible();
  // the row holding the list's current votes differs from now in nothing
  await expect(sweepNow.locator('td').last()).toHaveText('');
  await expect(sweepNow.locator('td').nth(2)).toContainText('now');
  // 3.25% lies in the last threshold interval of 1–5%
  const thrNow = panel(page).locator('table').nth(1).locator('tbody tr[aria-current="true"]');
  await expect(thrNow.locator('td').last()).toHaveText('now');
  await expect(thrNow.locator('td').nth(1)).toHaveText('5%');
  // the now row of the sweep is scrolled into view within its table, not the page
  const box = (await panel(page).locator('.tablewrap').first().boundingBox())!;
  const row = (await sweepNow.boundingBox())!;
  expect(row.y).toBeGreaterThanOrEqual(box.y);
  expect(row.y + row.height).toBeLessThanOrEqual(box.y + box.height + 1);
});

test('switching election on the page gives that election’s lists and blocs', async ({ page }) => {
  await start(page);
  await expect(blocRow(page)).toHaveText('53 / 61');
  await election(page, 'k12');
  await expect(panel(page).getByRole('button', { name: 'List', exact: true })).toHaveAttribute('data-value', '12-מחל');
  await expect(panel(page).getByRole('textbox', { name: 'From', exact: true })).toHaveValue('20,549');
  await expect(blocRow(page)).toHaveText('97 / 61');
  await expect(panel(page).getByRole('img', { name: 'Seats against votes' })).toContainText('20,549', { timeout: 60_000 });
  await expect(panel(page).getByRole('textbox', { name: 'From %' })).toHaveCount(1);
});

test('a bloc whose members count apart from their lists is searched against the chamber count', async ({ page }) => {
  test.setTimeout(180_000);
  await start(page);
  await election(page, 'k23');
  // the 2020 coalition holds 73 seats in the chamber, counting the members who joined it from Blue and White
  await expect(blocRow(page)).toHaveText('73 / 61');
  await expect(panel(page).locator('.callout')).toContainText('end the majority', { timeout: 150_000 });
  await expect(panel(page).locator('.callout > .row > bdi')).toHaveText(/^73 → (\d+) \/ 61$/);
  const after = Number((await panel(page).locator('.callout > .row > bdi').textContent())!.match(/→ (\d+)/)![1]);
  expect(after).toBeLessThan(61);
});

test('applying a found transfer flips the bloc, and undo restores it', async ({ page }) => {
  test.setTimeout(180_000);
  await start(page);
  await expect(panel(page).locator('.callout')).toContainText('give the bloc a majority', { timeout: 150_000 });
  await panel(page).getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(blocRow(page)).toHaveText('61 / 61');
  await page.getByRole('button', { name: /^Undo/ }).first().click();
  await expect(blocRow(page)).toHaveText('53 / 61');
});

test('Hebrew threshold chart keeps the English left-to-right geometry', async ({ page }) => {
  await start(page, 'he');
  const chart = panel(page).getByRole('img', { name: 'אחוז החסימה הגבוה ביותר שכל רשימה עוברת' });
  await expect(chart).toBeVisible();
  const ticks = chart.locator('text').filter({ hasText: /^\d%$/ });
  const [one, five] = [(await ticks.filter({ hasText: '1%' }).boundingBox())!, (await ticks.filter({ hasText: '5%' }).boundingBox())!];
  expect(one.x).toBeLessThan(five.x);
});

test('a button beside the range fields is as tall as the fields', async ({ page }) => {
  await start(page);
  const from = panel(page).getByRole('textbox', { name: 'From', exact: true });
  await from.fill('100000'); await from.press('Enter');
  const reset = panel(page).getByRole('button', { name: 'Reset', exact: true });
  const [f, b] = [(await from.boundingBox())!, (await reset.boundingBox())!];
  expect(Math.abs(b.height - f.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(b.y - f.y)).toBeLessThanOrEqual(1);
});
