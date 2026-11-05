import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', hintDismissed: true, saved: [{ id: 'qa2-old', name: 'Older scenario', electionId: 'k26', savedAt: '2026-01-01', baseBuiltAt: 'old-build', log: [] }] })));
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('X1 analysis choices and settings use the shared picker', async ({ page }) => {
  await page.locator('#tab-sens').click();
  await choose(page.getByRole('button', { name: 'List', exact: true }), { label: 'Likud' });
  await expect(page.getByRole('button', { name: 'Bloc', exact: true })).toBeVisible();
  await page.locator('#tab-families').click();
  await choose(page.getByRole('button', { name: 'Votes from', exact: true }), 'new');
  await expect(page.getByRole('button', { name: 'Votes from', exact: true })).toContainText('New voters');
  await page.locator('#tab-rules').click();
  await choose(page.getByRole('button', { name: 'Decimal places for percentages', exact: true }), '6');
  await choose(page.getByRole('button', { name: 'Mark differences from', exact: true }), 'official');
  await expect(page.getByRole('button', { name: 'Mark differences from', exact: true })).toContainText('Official');
});

for (const width of [1500, 1024, 390]) test(`notices and experimental rules leave the board fixed at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const before = (await page.locator('.board').boundingBox())!.y;
  await choose(page.locator('.band').getByRole('button', { name: 'Switch scenario' }), 'qa2-old');
  await expect(page.locator('.banner').filter({ hasText: 'rebuilt' })).toContainText('rebuilt');
  await page.locator('#tab-rules').click();
  await page.getByRole('button', { name: 'Experimental', exact: true }).click();
  await page.locator('#tab-board').click();
  expect((await page.locator('.board').boundingBox())!.y).toBe(before);
  await page.locator('.banner').filter({ hasText: 'rebuilt' }).getByRole('button', { name: 'Dismiss' }).click();
  expect((await page.locator('.board').boundingBox())!.y + await page.evaluate(() => scrollY)).toBe(before);
  await expect(page.locator('.banner').filter({ hasText: 'Alternative electoral system' })).toBeVisible();
});

for (const lang of ['en', 'he']) test(`phone band is compact with direct controls in ${lang}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  if (lang === 'he') await page.getByRole('button', { name: 'עב', exact: true }).click();
  expect((await page.locator('.band').boundingBox())!.height).toBeLessThanOrEqual(170);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await expect(page.locator('.band-levels')).toBeVisible();
  await expect(page.locator('.band .scenario-switcher')).toBeVisible();
});

test('list panel gaps are tight and asynchronous results leave the slider fixed', async ({ page }) => {
  await page.locator('.lb-row').filter({ has: page.locator('.lb-name').getByText('Joint List', { exact: true }) }).first().click();
  const panel = page.locator('.side-panel');
  const seat = (await panel.locator('.seat-target').boundingBox())!;
  const about = (await panel.locator('.election-about').boundingBox())!;
  expect(seat.y - about.y - about.height).toBeLessThanOrEqual(20);
  const slider = panel.getByRole('slider', { name: 'Votes slider' });
  const y = (await slider.boundingBox())!.y;
  const status = panel.locator('.seat-search-status');
  await expect(status).toContainText('proven minimum');
  const box = (await status.boundingBox())!;
  expect((await slider.boundingBox())!.y - box.y - box.height).toBeLessThanOrEqual(40);
  expect((await slider.boundingBox())!.y).toBe(y);
});
