import { expect, test } from '@playwright/test';
import { openSideBySide } from './sideBySide.ts';

for (const lang of ['he', 'en']) for (const theme of ['light', 'dark']) {
  test(`long edited names stay on the one-line change summary without widening the page (${lang}, ${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(s => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(s)), { lang, theme, level: 'standard', hintDismissed: true });
    await page.goto('/');
    await page.locator('.blocs').getByRole('button', { name: lang === 'he' ? 'עריכת גושים' : 'Edit blocs', exact: true }).click();
    const input = page.getByRole('textbox', { name: lang === 'he' ? 'שם הגוש' : 'Bloc name' }).first();
    for (const name of ['A very long grouping name that must remain fully readable on a narrow phone screen', 'גושעםשםארוךללאמרווחים'.repeat(8)]) {
      await input.fill(name); await input.press('Enter');
      const summary = page.locator('.session');
      // a rename is a change (7 November): the name joins the one-line summary, which scrolls rather than grows
      await expect(summary).toContainText(name);
      await expect(page.locator('.bloc-panel .edit-marker').first()).toBeVisible();
      expect(await summary.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390);
      expect(await summary.evaluate(el => el.getBoundingClientRect().height)).toBe(50);
      await expect(summary).not.toHaveClass(/idle/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    }
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /^(Undo|ביטול)/ }).click();
    await expect(page.locator('.session')).not.toContainText('גושעםשםארוךללאמרווחים'.repeat(8));
  });
}

test('comparison seat counts have readable contrast', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert' })));
  await page.goto('/'); await openSideBySide(page);
  await expect(page.locator('.cmpm-strip').getByRole('button', { name: 'Compare with', exact: true })).toHaveAttribute('data-value', 'prev'); // compares with the previous election, 2022
  const number = page.locator('.cmp-table .cmp-seats b').first();
  await expect(number).toBeVisible();
  const contrast = await number.evaluate(el => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = (color: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const light = (c: number[]) => c.slice(0, 3).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const foreground = light(rgb(getComputedStyle(el).color));
    let bg = el.parentElement; while (bg && rgb(getComputedStyle(bg).backgroundColor)[3] < 255) bg = bg.parentElement; // the first opaque background
    const background = light(rgb(getComputedStyle(bg ?? document.body).backgroundColor));
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test('locality map survives navigation during a zoom animation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({ status: 204 }));
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert' })));
  await page.goto('/');
  const { choose } = await import('./choices.ts');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.locator('#tab-loc').click();
  await page.getByRole('searchbox', { name: 'Find a locality' }).fill('tel aviv');
  await page.getByRole('button', { name: /Tel Aviv.*5000/i }).click();
  await page.locator('#tab-board').click();
  await page.waitForTimeout(500); // Leaflet's pending zoom transition must have completed or been cancelled.
  expect(errors).toEqual([]);
});

for (const lang of ['he', 'en']) test(`long official list names fit the merge picker (${lang})`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, level: 'expert' })), lang);
  await page.goto('/');
  const { choose } = await import('./choices.ts');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k22');
  await page.locator('#tab-structure').click();
  await expect(page.locator('.structure .chip.coal').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('family counts appear once beside the strip, never as low-contrast duplicate labels', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert' })));
  await page.goto('/'); await page.locator('#tab-families').click();
  await expect(page.locator('.family-seat-count').first()).toContainText(/\d/);
  await expect(page.locator('.family-seat-strip').first()).toHaveText('');
});
