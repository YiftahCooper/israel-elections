import { test, expect } from '@playwright/test';
import { choose } from './choices.ts';
for (const lang of ['en', 'he']) for (const width of [1500,1280,1024,768,390]) {
  test(`header hit targets ${lang} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, theme: 'dark', level: 'expert' })), lang);
    await page.goto('/');
    const picker = page.locator('.election-navigation .choice-trigger');
    await expect(picker).toHaveAttribute('data-value', 'k26');
    for (const election of ['k26','k25','k1']) {
      await choose(picker, election);
      for (const target of await page.locator('.band .election-arrow, .band .election-about summary, .band-actions > .tool, .band-levels button').all()) {
        const box = await target.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(width === 390 ? 44 : 32);
        expect(box!.width).toBeGreaterThanOrEqual(width === 390 ? 44 : 32);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      const about = page.locator('.band .election-about');
      expect((await about.boundingBox())!.width).toBeCloseTo((await about.locator('summary').boundingBox())!.width, 0);
    }
    await picker.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.election-dialog')).toBeVisible();
    await page.keyboard.press('Escape'); await expect(picker).toBeFocused();
  });
}
test('edited annotation keeps reference and scoped restore keyboard reachable', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert' })));
  await page.goto('/');
  await choose(page.locator('.election-navigation .choice-trigger'), 'k25');
  await page.locator('.lb-row').first().click();
  const input = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  const headerHeight = (await page.locator('.band').boundingBox())!.height;
  await input.fill('1200000'); await input.press('Enter');
  expect((await page.locator('.band').boundingBox())!.height).toBe(headerHeight);
  const marker = page.locator('.side-panel .edit-marker').first();
  await expect(marker).toBeVisible();
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, theme) => { el.dataset.theme = theme; }, theme);
    const contrast = await marker.evaluate(el => {
      const rgb = (color: string) => color.trim().startsWith('#') ? color.trim().replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3').slice(1).match(/../g)!.map(v => parseInt(v, 16)) : color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const luminance = (color: string) => rgb(color).map(v => { const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((n, v, i) => n + v * [.2126, .7152, .0722][i], 0);
      const ink = luminance(getComputedStyle(el).color);
      const surface = luminance(getComputedStyle(document.documentElement).getPropertyValue('--surface'));
      return { foreground: getComputedStyle(el).color, surface: getComputedStyle(document.documentElement).getPropertyValue('--surface'), ratio: (Math.max(ink, surface) + .05) / (Math.min(ink, surface) + .05) };
    });
    expect(contrast.ratio, JSON.stringify(contrast)).toBeGreaterThanOrEqual(4.5);
  }
  await marker.focus();
  await expect(page.locator('.edit-tooltip')).toContainText('Edited: was');
  await page.keyboard.press('Tab');
  await expect(page.locator('.marker-restore')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.side-panel .edit-marker')).toHaveCount(0);
});
