// Keyboard and touch access found missing in the 4 November 2026 UI audit.
import { expect, test, type Page } from '@playwright/test';

const start = async (page: Page, settings: Record<string, unknown> = {}) => {
  const lang = (settings.lang as string | undefined) ?? 'en';
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang: 'en', hintDismissed: true, ...settings }));
  await page.goto('/');
  await expect(page.getByRole('region', { name: lang === 'he' ? 'רשימות' : 'Lists' })).toBeVisible();
};

test('an info button stays open when clicked, and Escape closes it', async ({ page }) => {
  await start(page, { level: 'expert' });
  const info = page.getByRole('button', { name: /^Valid votes/ }).first();
  await info.click();
  await expect(info).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('tooltip')).toContainText('counted for some list');
  await expect(page.getByRole('tooltip').getByRole('link', { name: /Learn more/ })).toHaveAttribute('href', /^https:\/\//);
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
  for (const level of ['simple', 'standard', 'expert']) for (const lang of ['en', 'he']) {
    test(`the page never scrolls sideways (${level}, ${lang})`, async ({ page }) => {
      await start(page, { level, lang });
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  }
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

test('a candidate links to the Knesset page, the party page and Hebrew Wikipedia marked secondary', async ({ page }) => {
  await start(page);
  await page.getByRole('combobox', { name: 'Election' }).selectOption('k25');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: /Likud/ }).first().click();
  await page.getByRole('region', { name: 'List details' }).getByText(/^Who gets in/).click(); // Simple keeps the roster folded
  const about = page.getByRole('group', { name: 'About נתניהו בנימין' });
  await expect(about.getByRole('link', { name: 'Knesset' })).toHaveAttribute('href', /^https:\/\/main\.knesset\.gov\.il\/mk\//);
  await expect(about.getByRole('link', { name: 'Wikipedia (he)' })).toHaveAttribute('href', /^https:\/\/he\.wikipedia\.org\//);
  await expect(page.locator('a[href*="en.wikipedia.org"]')).toHaveCount(0);
});
