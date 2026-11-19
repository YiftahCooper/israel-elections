// The Localities map is colours only (F1, 19 Nov 2026): no list names or shares are written on it at any zoom, place
// names never sit on a circle or a town's tiles, and a place's lists and shares come from its hover box, a tap, or a
// choice from the search (the keyboard's way in). The Vote mix hover box once read "[object Object]".
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

const open = async (page: Page, lang: 'en' | 'he', view: 'winner' | 'mix') => {
  await page.addInitScript(([lang, view]) => {
    // every text the map's canvas writes, to prove no list name or share is drawn on it
    const w = window as unknown as { __mapText: string[] }; w.__mapText = [];
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (t: string, x: number, y: number, m?: number) { w.__mapText.push(String(t)); return fill.call(this, t, x, y, m); };
    if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 1 } }));
    localStorage.setItem('israel-elections:map-view', view);
  }, [lang, view]);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  const outlines = view === 'mix' ? page.waitForResponse(r => r.url().endsWith('/data/locality-outlines-2022.geojson')) : null;
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: lang === 'he' ? 'יישובים' : 'Localities', exact: true }).click();
  await expect(page.getByRole('region', { name: lang === 'he' ? /מפת תוצאות/ : /Locality results map/ })).toBeVisible();
  await outlines;
  await page.waitForTimeout(800);
};
const find = async (page: Page, lang: 'en' | 'he', code: string) => {
  await page.getByRole('searchbox', { name: lang === 'he' ? 'חיפוש יישוב' : 'Find a locality' }).fill(code);
  await page.locator('.locality-map-matches button').first().click();
  await page.waitForTimeout(800);
};
/** Each shown place name's box against the Vote mix canvas: no strongly coloured pixel (a circle, tiles, a town's
 *  border) under it. Faint outlines of untiled towns (alpha .34) may pass under a name. */
const namesOverMarks = (page: Page) => page.evaluate(() => {
  const cv = document.querySelector<HTMLCanvasElement>('.vote-mix-canvas')!, ctx = cv.getContext('2d')!, c = cv.getBoundingClientRect(), k = cv.width / c.width;
  const bad: string[] = []; let shown = 0;
  document.querySelectorAll<HTMLElement>('.locality-map-label').forEach(el => {
    if (el.style.visibility === 'hidden') return; shown++;
    const r = el.getBoundingClientRect(), x = Math.round((r.left - c.left) * k), y = Math.round((r.top - c.top) * k), w = Math.round(r.width * k), h = Math.round(r.height * k);
    const px = ctx.getImageData(Math.max(0, x), Math.max(0, y), Math.max(1, w), Math.max(1, h)).data;
    let hits = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 150) hits++;
    if (hits > 0) bad.push(`${el.textContent} (${hits})`);
  });
  return { shown, bad };
});

for (const lang of ['en', 'he'] as const) {
  test(`${lang}: the Vote mix writes no list names or shares, and place names never sit on a circle or tiles`, async ({ page }) => {
    await open(page, lang, 'mix');
    const far = await namesOverMarks(page);
    expect(far.shown, 'some names fit far out').toBeGreaterThan(3);
    expect(far.bad).toEqual([]);
    await find(page, lang, '5000'); // Tel Aviv-Yafo, zoom 12: tiles
    for (const step of [0, 1]) {
      if (step) { await page.locator('.leaflet-control-zoom-in').click(); await page.waitForTimeout(800); }
      expect((await namesOverMarks(page)).bad).toEqual([]);
    }
    const texts = await page.evaluate(() => (window as unknown as { __mapText: string[] }).__mapText);
    expect(texts.filter(t => /%/.test(t)), 'no shares drawn on the map').toEqual([]);
    expect(texts.filter(t => /Likud|Yesh Atid|הליכוד|יש עתיד|Other|אחרות/.test(t)), 'no list names drawn on the map').toEqual([]);
  });
}

test('the Vote mix hover box gives a town\'s biggest lists with their shares, on hover and on a choice from the search', async ({ page }) => {
  await open(page, 'en', 'mix');
  await find(page, 'en', '6100'); // Bnei Brak: chosen from the search, its box opens on the map (the keyboard's way in)
  const tip = page.locator('.leaflet-tooltip .locality-map-tip');
  await expect(tip).toBeVisible();
  await expect(tip).toContainText(/Beraq|Brak/);
  const shares = await tip.locator('span').first().textContent();
  expect(shares).not.toMatch(/object/i);
  // the map colours by bloc by default: the biggest blocs with their shares, at most one decimal (the setting)
  expect(shares).toMatch(/^[^·]+ \d+(\.\d)?%( · [^·]+ \d+(\.\d)?%){1,2}$/);
  // hovering another town's tiles moves the box there
  await find(page, 'en', '5000');
  const map = (await page.locator('.locality-map-canvas').boundingBox())!;
  await page.mouse.move(map.x + map.width / 2 + 3, map.y + map.height / 2 + 3);
  await expect(tip).toContainText('Tel Aviv');
  await expect(tip).not.toContainText('object');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('a tap on a town\'s tiles opens its box and its results', async ({ page }) => {
    await open(page, 'he', 'mix');
    await find(page, 'he', '6100'); // Bnei Brak, zoom 12; its box is open
    const tip = page.locator('.leaflet-tooltip .locality-map-tip');
    await expect(tip.locator('strong')).toHaveText(/בני ברק/);
    await page.locator('.locality-map-canvas').scrollIntoViewIfNeeded();
    const map = (await page.locator('.locality-map-canvas').boundingBox())!;
    // a tap west of Bnei Brak lands on a neighbour's tiles: its box and its results replace Bnei Brak's
    await page.touchscreen.tap(map.x + map.width / 2 - 110, map.y + map.height / 2);
    await expect(tip.locator('strong')).not.toHaveText(/בני ברק/);
    await expect(tip).toContainText(/%/);
    const name = (await tip.locator('strong').textContent())!;
    await expect(page.getByRole('region', { name: 'תוצאות היישוב הנבחר' }).getByRole('heading')).toHaveText(name);
  });
});
