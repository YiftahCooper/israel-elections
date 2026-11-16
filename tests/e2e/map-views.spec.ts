// The Localities map's two views (U4, 16 Nov 2026): it opens on the Winner dots, a switch in the key shows the Vote mix
// and the choice is remembered on the device; the double-envelope island selects its row; Hebron is placed, marked
// approximate.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

const seed = (page: Page, lang: 'en' | 'he') => page.addInitScript((lang) => {
  if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
  localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
  localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } }));
}, lang);
const openMap = async (page: Page, lang: 'en' | 'he' = 'en') => {
  await seed(page, lang);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: lang === 'he' ? 'יישובים' : 'Localities', exact: true }).click();
  await expect(page.getByRole('region', { name: lang === 'he' ? /מפת תוצאות/ : /Locality results map/ })).toBeVisible();
};

test('opens on the Winner dots; the Vote mix switch in the key is remembered on the device', async ({ page }) => {
  await openMap(page);
  const view = page.getByRole('group', { name: 'Map view' });
  await expect(view.getByRole('button', { name: 'Winner' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.leaflet-control-attribution')).not.toContainText('CBS 2022');
  const outlines = page.waitForResponse(r => r.url().endsWith('/data/locality-outlines-2022.geojson'));
  await view.getByRole('button', { name: 'Vote mix' }).click();
  expect((await outlines).ok()).toBe(true);
  await expect(view.getByRole('button', { name: 'Vote mix' })).toHaveAttribute('aria-pressed', 'true');
  // the outlines carry their CBS credit while they are shown
  await expect(page.locator('.leaflet-control-attribution')).toContainText('Outlines: CBS 2022 statistical areas (adapted)');
  await expect(page.getByRole('button', { name: 'Colour by', exact: true })).toContainText('Blocs');
  await page.reload();
  await page.getByRole('tab', { name: 'Localities', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: 'Vote mix' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: 'Winner' }).click();
  await expect(page.locator('.leaflet-control-attribution')).not.toContainText('CBS 2022');
  expect(await page.evaluate(() => localStorage.getItem('israel-elections:map-view'))).toBe('winner');
});

test('the double-envelope island sits off Tel Aviv, clear of its name, and selects the envelope votes', async ({ page }) => {
  await openMap(page, 'he');
  const canvas = page.locator('.vote-mix-canvas');
  await expect(canvas).toHaveAttribute('data-island', /\d/);
  const [x0, y0, x1, y1] = (await canvas.getAttribute('data-island'))!.split(',').map(Number);
  const map = (await page.locator('.locality-map-canvas').boundingBox())!;
  const ta = (await page.locator('.locality-map-label').filter({ hasText: 'תל אביב' }).boundingBox())!;
  expect(ta, 'Tel Aviv keeps its name').toBeTruthy();
  expect(map.x + x1).toBeLessThanOrEqual(ta.x);
  await page.mouse.click(map.x + (x0 + x1) / 2, map.y + (y0 + y1) / 2);
  const results = page.getByRole('region', { name: 'תוצאות היישוב הנבחר' });
  await expect(results.getByRole('heading')).toContainText('מעטפות');
  await expect(results).toContainText('458,714');
});

test('Hebron has a dot, marked approximate, and is no longer a row without a location', async ({ page }) => {
  await openMap(page);
  await page.getByRole('searchbox', { name: 'Find a locality' }).fill('Hebron');
  await page.getByRole('button', { name: /^Hebron \(3400\)/ }).click();
  const results = page.getByRole('region', { name: 'Selected locality results' });
  await expect(results.getByRole('heading')).toContainText('Hebron');
  await results.getByRole('button', { name: 'Location and turnout', exact: true }).click();
  await expect(page.getByText(/^Approximate position: the Jewish quarter of Hebron/)).toBeVisible();
  await page.keyboard.press('Escape');
  const missing = page.locator('.locality-map-tool details').filter({ has: page.getByText('Rows without a mapped location', { exact: true }) });
  await missing.locator('summary').click();
  await expect(missing).not.toContainText('Hebron');
});
