import { expect, test, type Page } from '@playwright/test';

// 9 Nov 2026 follow-ups: 2026 gazetted (no "not yet verified" anywhere), "Device" theme wherever theme is chosen,
// the phone bar pinned while scrolling, and the party-family charts on the shared hover timing (hoverIntent.ts).

async function open(page: Page, seed: { lang?: 'en' | 'he'; level?: string; settings?: Record<string, unknown> } = {}) {
  await page.addInitScript(seed => {
    if (sessionStorage.getItem('seeded-p2')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: seed.lang ?? 'en', level: seed.level ?? 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: seed.settings ?? { decimals: 2, starterTip: false } }));
    sessionStorage.setItem('seeded-p2', '1');
  }, seed);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const storedTheme = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:settings') ?? '{}').values?.theme);

test.describe('2026 is gazetted', () => {
  for (const lang of ['en', 'he'] as const) test(`${lang}: no "not yet verified" on About, the phone Menu or the families`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, { lang, level: 'expert' });
    const menu = page.locator('.band .band-menu-btn');
    await expect(menu).toHaveAttribute('aria-label', lang === 'en' ? 'Menu' : 'תפריט');
    await expect(page.locator('.band-menu-flag')).toHaveCount(0);
    await menu.click();
    await expect(page.locator('#phone-menu .election-about summary')).toBeVisible();
    await expect(page.locator('.publication-pending')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.getByRole('tab', { name: lang === 'en' ? 'Party families' : 'משפחות מפלגות', exact: true }).click();
    await expect(page.locator('.family-plots svg').first()).toBeVisible();
    await page.locator('.family-exact summary').click();
    await expect(page.locator('.family-table tbody tr')).toHaveCount(26);
    await expect(page.locator('.families').getByText(lang === 'en' ? /not yet verified/i : /טרם אומת/)).toHaveCount(0);
    // the 2026 point is drawn like every other official result (no hollow "provisional" mark)
    await expect(page.locator('.family-plots section').first().locator('g[role=button]').last().locator('circle')).toHaveAttribute('r', '3.5');
  });
});

test.describe('theme: Device, Light or Dark', () => {
  test.use({ colorScheme: 'dark' });
  test('phone Menu offers Device (chosen on a first visit) and returns to it after Light', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    await page.locator('.band .band-menu-btn').click();
    const theme = page.locator('#phone-menu').getByRole('group', { name: 'Theme', exact: true });
    await expect(theme.getByRole('button')).toHaveText(['Device', 'Light', 'Dark']);
    await expect(theme.getByRole('button', { name: 'Device', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await theme.getByRole('button', { name: 'Light', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await storedTheme(page)).toBe('light');
    await theme.getByRole('button', { name: 'Device', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await storedTheme(page)).toBe('device');
    // the no-flash script reads the stored "device" and follows the device again on reload
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  });
  test('Hebrew phone Menu: לפי המכשיר · בהיר · כהה', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, { lang: 'he' });
    await page.locator('.band .band-menu-btn').click();
    await expect(page.locator('#phone-menu').getByRole('group', { name: 'ערכת צבעים', exact: true }).getByRole('button')).toHaveText(['לפי המכשיר', 'בהיר', 'כהה']);
  });
  test('desktop: the sun/moon button flips the theme; flipping back to the device’s theme follows the device again', async ({ page }) => {
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('.band').getByRole('button', { name: 'Light theme', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await storedTheme(page)).toBe('light');
    await page.locator('.band').getByRole('button', { name: 'Dark theme', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await storedTheme(page)).toBe('device');
    await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.locator('.personal-settings [data-setting="theme"]').getByRole('button', { name: 'Device', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('phone bar stays at the top while scrolling', () => {
  test('390 px: pinned, 56 px, tools strip under it, scrolling and focus land below both', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    await page.evaluate(() => window.scrollTo(0, 1600));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    const band = (await page.locator('.band').boundingBox())!;
    expect(band.y).toBe(0);
    expect(band.height).toBe(56);
    const strip = (await page.locator('.toolbar').boundingBox())!;
    expect(strip.y).toBe(56);
    const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart));
    expect(Math.abs(pad - (56 + strip.height + 8))).toBeLessThan(1); // --toolbar-h is the strip's whole-pixel height
    // a control above the view, brought back by focus (keyboard, or a field's keyboard), lands below the bar and the strip
    const row = page.locator('.lb-row').first();
    expect((await row.boundingBox())!.y).toBeLessThan(0);
    await row.focus();
    await expect.poll(async () => (await row.boundingBox())!.y).toBeGreaterThanOrEqual(56 + strip.height - 1);
    // the menu still opens right under the pinned bar
    await page.locator('.band .band-menu-btn').click();
    expect((await page.locator('#phone-menu').boundingBox())!.y).toBeGreaterThanOrEqual(56);
  });
  test('wider screens keep their bars as they were', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await open(page);
    expect(await page.locator('.band').evaluate(el => getComputedStyle(el).position)).toBe('relative');
  });
});

test.describe('party-family charts use the shared hover timing', () => {
  test.use({ viewport: { width: 1500, height: 1000 } });
  test('vote and seat charts: a sweep opens nothing, resting opens, the next point opens at once, focus at once', async ({ page }) => {
    await open(page, { level: 'expert' });
    await page.getByRole('tab', { name: 'Party families', exact: true }).click();
    const tip = page.locator('.family-tooltip');
    for (const chart of ['.family-seat-plot svg', '.family-plots section svg']) {
      const svg = page.locator(chart).first();
      await svg.scrollIntoViewIfNeeded();
      const b = (await svg.boundingBox())!;
      // sweep across in under the rest time: nothing opens
      await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2);
      await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2, { steps: 4 });
      await expect(tip).toHaveCount(0);
      // resting opens after the shared delay
      await expect(tip).toHaveCount(1, { timeout: 1500 });
      const first = await tip.textContent();
      // the next point while one is open: replaced at once
      await page.mouse.move(b.x + b.width * 0.5, b.y + b.height / 2);
      await expect(tip).not.toHaveText(first!, { timeout: 200 });
      // leaving: closes after the grace
      await page.mouse.move(5, 5);
      await expect(tip).toHaveCount(0, { timeout: 1500 });
      await page.waitForTimeout(400);
    }
    // keyboard focus opens at once
    await page.locator('.family-plots section').first().locator('g[role=button]').last().focus();
    await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 200 });
  });
});
