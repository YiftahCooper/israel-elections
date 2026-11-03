// Keyboard and touch access found missing in the 4 November 2026 UI audit.
import { expect, test, type Page } from '@playwright/test';

const start = async (page: Page, settings: Record<string, unknown> = {}) => {
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang: 'en', hintDismissed: true, ...settings }));
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Lists' })).toBeVisible();
};

test('an info button stays open when clicked, and Escape closes it', async ({ page }) => {
  await start(page, { level: 'expert' });
  const info = page.getByRole('button', { name: /^Valid votes/ }).first();
  await info.click();
  await expect(info).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('tooltip')).toContainText('Every vote counted');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test.describe('on a touch phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  test('an info button opens on tap', async ({ page }) => {
    await start(page, { level: 'expert' });
    await page.getByRole('button', { name: /^Valid votes/ }).first().tap();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });
  test('the chamber legend names the lists instead of tiny arc labels', async ({ page }) => {
    await start(page);
    await expect(page.getByRole('group', { name: 'Lists in the Knesset' }).getByRole('button', { name: /Likud/ })).toBeVisible();
  });
});

test('analysis tabs follow the arrow-key pattern', async ({ page }) => {
  await start(page, { level: 'standard' });
  const tabs = page.getByRole('tablist', { name: 'Analysis' }).getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', (await tabs.nth(1).getAttribute('id'))!);
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.first()).toHaveAttribute('tabindex', '-1');
});

test('the Scenarios menu closes on Escape and returns focus to its button', async ({ page }) => {
  await start(page, { level: 'standard' });
  const button = page.getByRole('button', { name: /Scenarios/ });
  await button.click();
  await expect(page.getByRole('button', { name: /Create share link/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Create share link/ })).toHaveCount(0);
  await expect(button).toBeFocused();
});
