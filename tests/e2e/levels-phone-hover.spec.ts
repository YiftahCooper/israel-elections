import { expect, test, type Page } from '@playwright/test';

// Owner decisions of 9 Nov 2026: Settings in level tiers, parties under joint lists by level, the device theme for
// first-time visitors, the shared hover delay and the one-row phone bar.

async function open(page: Page, seed: { lang?: 'en' | 'he'; level?: string; settings?: Record<string, unknown>; preferences?: Record<string, string> } = {}) {
  await page.addInitScript(seed => {
    if (sessionStorage.getItem('seeded-1109')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: seed.lang ?? 'en', level: seed.level ?? 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: seed.settings ?? { decimals: 2 } }));
    if (seed.preferences) localStorage.setItem('israel-elections:preferences', JSON.stringify(seed.preferences));
    sessionStorage.setItem('seeded-1109', '1');
  }, seed);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const settings = (page: Page) => page.locator('.personal-settings');

test.describe('Settings: every setting at every level, by complexity', () => {
  for (const level of ['simple', 'standard', 'expert'] as const) test(`${level}: Simple settings, then Standard, then Expert`, async ({ page }) => {
    await open(page, { level });
    await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
    const tiers = settings(page).locator('.ps-tier');
    await expect(tiers).toHaveCount(3);
    expect(await tiers.evaluateAll(t => t.map(x => x.getAttribute('data-tier')))).toEqual(['simple', 'standard', 'expert']);
    await expect(settings(page).locator('.ps-tier-sep')).toHaveText(['Standard', 'Expert']);
    // the same settings at every level (only the Simple starter tip is Simple's alone); no "more settings" line
    const rows = await settings(page).locator('[data-setting]').count();
    expect(rows).toBe(level === 'simple' ? 43 : 42);   // 12 Nov: + the Localities map's lines switch, + Bars for the compared result
    await expect(settings(page).getByText(/more settings in Standard/)).toHaveCount(0);
    await expect(settings(page).locator('[data-tier="simple"] [data-setting="voteSource"]')).toHaveCount(1);
    await expect(settings(page).locator('[data-tier="expert"] [data-setting="chamberLayout"]')).toHaveCount(1);
  });

  test('a setting above the level still works, search and per-group reset still work', async ({ page }) => {
    await open(page, { level: 'simple' });
    await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
    await settings(page).locator('[data-setting="listOrder"]').getByRole('button', { name: 'Name', exact: true }).click();
    const names = await page.locator('.lb-row .lb-name').allInnerTexts();
    expect(names.slice(0, 5)).toEqual([...names.slice(0, 5)].sort((a, b) => a.localeCompare(b, 'en')));
    // two words: "order" alone is also inside "borders", a search word of the map-lines switch
    await settings(page).getByRole('searchbox').fill('list order');
    await expect(settings(page).locator('[data-setting]')).toHaveCount(1);
    await expect(settings(page).locator('.ps-tier-sep')).toHaveText(['Standard']);
    await settings(page).getByRole('searchbox').fill('');
    const group = settings(page).locator('[data-tier-group="standard:lists"]');
    await group.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(settings(page).locator('[data-setting="listOrder"] button[aria-pressed="true"]')).toHaveText('Seats');
  });
});

test.describe('parties under a joint list: Simple none, Standard with seats, Expert all', () => {
  // 2022: Religious Zionism (14 seats) also held Atid Ehad and Eretz Yisrael Shelanu, with no one elected
  const rz = (page: Page) => page.getByRole('list', { name: /^Religious Zionism.*factions after the split$/ });
  const pick2022 = async (page: Page) => {
    await page.getByRole('button', { name: 'Election', exact: true }).click();
    await page.locator('[data-choice-value="k25"]').click();
    await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k25');
  };
  test('Simple lists only; Standard hides the parties without seats; Expert shows them; the setting overrides', async ({ page }) => {
    // joint lists counted by party (the app's default; the shared test seed turns it off)
    await open(page, { level: 'simple', settings: { decimals: 2 }, preferences: { voteSource: 'proportional', comparison: 'reference' } });
    await pick2022(page);
    await expect(rz(page)).toHaveCount(0);
    await page.getByRole('group', { name: 'Detail level' }).getByRole('button', { name: 'Standard', exact: true }).click();
    await expect(rz(page).getByRole('listitem')).toHaveCount(3);
    await page.getByRole('group', { name: 'Detail level' }).getByRole('button', { name: 'Expert', exact: true }).click();
    await expect(rz(page).getByRole('listitem')).toHaveCount(5);
    await expect(rz(page)).toContainText('Atid Ehad');
    // a choice in Settings wins at any level
    await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
    await settings(page).locator('[data-setting="jointListParties"]').getByRole('button', { name: 'Lists only', exact: true }).click();
    await settings(page).getByRole('button', { name: 'Close', exact: true }).click();
    await expect(rz(page)).toHaveCount(0);
  });
});

test.describe('theme for a first-time visitor', () => {
  test.use({ storageState: { cookies: [], origins: [] }, colorScheme: 'dark' });
  test('follows a dark device from the first paint', async ({ page }) => {
    await page.goto('/');
    // set before the app's script runs (index.html), so no light flash
    await page.waitForFunction(() => document.documentElement.dataset.theme !== undefined);
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
    await expect(page.locator('.lb-row').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('explanations open on hover after a short rest', () => {
  test('(i): not at once, then open; click is instant; a second (i) opens at once while one is open', async ({ page }) => {
    await open(page);
    const info = page.locator('.info button').first();
    await info.scrollIntoViewIfNeeded();
    const box = await info.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(120);
    await expect(page.locator('.pop')).toHaveCount(0);
    await expect(page.locator('.pop')).toHaveCount(1, { timeout: 1500 });
    // moving away: the box stays for a short grace, then closes
    await page.mouse.move(5, 900);
    await page.waitForTimeout(60);
    await expect(page.locator('.pop')).toHaveCount(1);
    await expect(page.locator('.pop')).toHaveCount(0, { timeout: 1500 });
    // a click opens at once
    await info.click();
    await expect(page.locator('.pop')).toHaveCount(1, { timeout: 100 });
  });

  test('seat details: a sweep across the chart opens nothing; resting opens; the next seat opens at once', async ({ page }) => {
    await open(page);
    const seats = page.locator('.chamber [data-seat]');
    const a = await seats.nth(10).boundingBox(), b = await seats.nth(30).boundingBox();
    await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2);
    await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2, { steps: 5 });
    await page.mouse.move(5, 900);
    await page.waitForTimeout(500);
    await expect(page.locator('.tip')).toHaveCount(0);
    await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2);
    await expect(page.locator('.tip')).toHaveCount(1, { timeout: 1500 });
    const first = await page.locator('.tip').innerText();
    await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2);
    await page.waitForTimeout(60);
    await expect(page.locator('.tip')).not.toHaveText(first);
  });
});

test.describe('phone top bar (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  for (const lang of ['en', 'he'] as const) test(`${lang}: one row; menu holds the rest; status label opens the scenario part`, async ({ page }) => {
    await open(page, { lang });
    const L = (en: string, he: string) => lang === 'en' ? en : he;
    const band = page.locator('.band');
    expect((await band.boundingBox())!.height).toBeLessThanOrEqual(60);
    await expect(band.locator('.election-arrow')).toHaveCount(0);
    await expect(band.getByRole('button', { name: new RegExp(`^${L('Undo', 'ביטול')}`) })).toBeVisible();
    await expect(band.getByRole('button', { name: new RegExp(`^${L('Redo', 'ביצוע מחדש')}`) })).toBeVisible();
    await expect(band.getByRole('group', { name: L('Detail level', 'רמת פירוט') })).toHaveCount(0);
    const status = band.locator('.band-status');
    await expect(status).toHaveText(L('Official', 'רשמי'));
    await band.locator('.band-menu-btn').click();
    const menu = page.locator('#phone-menu');
    await expect(menu).toBeVisible();
    for (const name of [L('Detail level', 'רמת פירוט'), L('Language', 'שפה'), L('Theme', 'ערכת צבעים')]) await expect(menu.getByRole('group', { name, exact: true })).toBeVisible();
    await expect(menu.getByRole('button', { name: L('Settings', 'הגדרות'), exact: true })).toBeVisible();
    await expect(menu.getByRole('button', { name: L('Start over', 'התחלה מחדש'), exact: true })).toBeVisible();
    await expect(menu.getByText(L('Save & share', 'שמירה ושיתוף'), { exact: true })).toBeVisible();
    await expect(menu.locator('.scenario-switcher')).toBeVisible();
    await expect(menu.locator('.election-about')).toBeVisible();
    // switching level from the menu works and the menu stays open
    await menu.getByRole('group', { name: L('Detail level', 'רמת פירוט') }).getByRole('button', { name: L('Expert', 'מומחה'), exact: true }).click();
    await expect(menu.getByRole('group', { name: L('Detail level', 'רמת פירוט') }).getByRole('button', { name: L('Expert', 'מומחה'), exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    // an edit makes the label name the scenario and count its changes (mark every edit)
    await page.locator('.lb-row').first().click();
    await page.locator('.side-panel').getByRole('button', { name: L('Increase Votes', 'הוספת קולות'), exact: true }).click();
    await expect(status.locator('.band-status-count')).toHaveText('1');
    await expect(status).toHaveAttribute('aria-label', new RegExp(L('1 change', 'שינוי אחד')));
    await page.locator('.side-panel').getByRole('button', { name: L('Close', 'סגירה') }).first().click().catch(() => {});
    await status.click();
    await expect(menu.locator('.scenario-switcher')).toBeVisible();
  });

  test('tablet and desktop bars are unchanged: arrows and level buttons in the bar', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await open(page);
    await expect(page.locator('.band .election-arrow')).toHaveCount(2);
    await expect(page.locator('.band').getByRole('group', { name: 'Detail level' })).toBeVisible();
    await expect(page.locator('.band .band-menu-btn')).toHaveCount(0);
  });
});
