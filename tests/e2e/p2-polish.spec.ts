import { expect, test, type Page } from './fixtures';
import { waitForStill } from './settle.ts';
import { clearHover, delayTo, expectAtOnce, expectKeptForGrace, expectWaitedForRest, pastSkipWindow, recordHover } from './hover-timing.ts';

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
    await expect(page.locator('#app-menu .election-about summary')).toBeVisible();
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
    const theme = page.locator('#app-menu').getByRole('group', { name: 'Theme', exact: true });
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
    await expect(page.locator('#app-menu').getByRole('group', { name: 'ערכת צבעים', exact: true }).getByRole('button')).toHaveText(['לפי המכשיר', 'בהיר', 'כהה']);
  });
  test('desktop: the theme is near the top of Settings (19 Nov 2026); choosing Device follows the device again', async ({ page }) => {
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.band').getByRole('button', { name: /^(Light|Dark) theme$/ })).toHaveCount(0);
    await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
    const theme = page.locator('.personal-settings [data-setting="theme"]');
    await theme.getByRole('button', { name: 'Light', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await storedTheme(page)).toBe('light');
    await theme.getByRole('button', { name: 'Device', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await storedTheme(page)).toBe('device');
    await expect(theme.getByRole('button', { name: 'Device', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('phone bar stays at the top while scrolling', () => {
  // 16 Nov 2026: on a phone only the bar stays; the tools strip scrolls away with the page (the three lines hold the
  // tools), so scrolling and focus land below the bar alone
  test('390 px: pinned, 56 px, the tools strip scrolls away, scrolling and focus land below the bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    await page.evaluate(() => window.scrollTo(0, 1600));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    const band = (await page.locator('.band').boundingBox())!;
    expect(band.y).toBe(0);
    expect(band.height).toBe(56);
    const strip = (await page.locator('.toolbar').boundingBox())!;
    expect(strip.y + strip.height).toBeLessThan(0);
    const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart));
    expect(Math.abs(pad - (56 + 8))).toBeLessThan(1);
    // a control above the view, brought back by focus (keyboard, or a field's keyboard), lands below the bar
    const row = page.locator('.lb-row').first();
    expect((await row.boundingBox())!.y).toBeLessThan(0);
    await row.focus();
    await expect.poll(async () => (await row.boundingBox())!.y).toBeGreaterThanOrEqual(56 - 1);
    // the scenario panel still opens right under the pinned bar
    await page.locator('.band .band-status').click();
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
    // timings measured in the page (hover-timing.ts), so a slow machine cannot make them pass or fail
    await recordHover(page, '.family-tooltip');
    for (const chart of ['.family-seat-plot svg', '.family-plots section svg']) {
      const svg = page.locator(chart).first();
      await svg.scrollIntoViewIfNeeded();
      await waitForStill(page, chart); // the charts are still being laid out just after the tab opens
      const b = (await svg.boundingBox())!;
      await clearHover(page);
      // sweep across in under the rest time: nothing opens; resting opens after the shared delay
      await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2);
      await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2, { steps: 4 });
      expectWaitedForRest(await delayTo(page, 'shown', 'pointermove', 'first'));
      // the next point while one is open: replaced at once
      await clearHover(page);
      await page.mouse.move(b.x + b.width * 0.5, b.y + b.height / 2);
      expectAtOnce(await delayTo(page, 'changed'));
      // leaving: closes after the grace
      await clearHover(page);
      await page.mouse.move(5, 5);
      expectKeptForGrace(await delayTo(page, 'gone'));
      await pastSkipWindow(page);
    }
    // keyboard focus opens at once
    await clearHover(page);
    await page.locator('.family-plots section').first().locator('g[role=button]').last().focus();
    expectAtOnce(await delayTo(page, 'shown', 'focusin'));
    await expect(page.getByRole('tooltip')).toBeVisible();
  });
});
