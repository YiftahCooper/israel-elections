// The Localities map's two views (U4, 16 Nov 2026): it opens on the Winner dots, a switch in the key shows the Vote mix
// and the choice is remembered on the device; the double-envelope island selects its row; Hebron is placed, marked
// approximate.
import { expect, test, type Page } from './fixtures';
import { choose, pickerName } from './choices.ts';
import { mapLayout, settleMap } from './map-settle.ts';

const seed = (page: Page, lang: 'en' | 'he') => page.addInitScript((lang) => {
  if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
  localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
  localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } }));
}, lang);
const openMap = async (page: Page, lang: 'en' | 'he' = 'en') => {
  await seed(page, lang);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await choose(page.getByRole('button', { name: pickerName(lang === 'he' ? 'בחירות' : 'Election') }), 'k25');
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
  await expect(page.getByRole('button', { name: /^Colour by(: |$)/ })).toContainText('Blocs');
  await page.reload();
  await page.getByRole('tab', { name: 'Localities', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: 'Vote mix' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Map view' }).getByRole('button', { name: 'Winner' }).click();
  await expect(page.locator('.leaflet-control-attribution')).not.toContainText('CBS 2022');
  expect(await page.evaluate(() => localStorage.getItem('israel-elections:map-view'))).toBe('winner');
});

test('the double-envelope island sits off Tel Aviv, clear of its name, and selects the envelope votes', async ({ page }) => {
  await openMap(page, 'he');
  await expect(page.locator('.vote-mix-canvas')).toHaveAttribute('data-island', /\d/);
  // read once the map has come to rest, and in one step (FX2: three separate reads once straddled a slide of the map)
  await settleMap(page);
  const { island, labels } = await mapLayout(page);
  const ta = labels.find(l => l.name.includes('תל אביב'));
  expect(ta, 'Tel Aviv keeps its name').toBeTruthy();
  // the name goes to whichever side of its dot is clear (F1, 19 Nov 2026): never onto the island, as drawn
  for (const b of [ta!.box, ta!.text]) {
    const apart = island[2] <= b[0] || b[2] <= island[0] || island[3] <= b[1] || b[3] <= island[1];
    expect(apart, 'the island and Tel Aviv\'s name do not overlap').toBe(true);
  }
  await page.mouse.click((island[0] + island[2]) / 2, (island[1] + island[3]) / 2);
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
  await results.getByRole('button', { name: 'Location and turnout: explanation', exact: true }).click();
  // (the chosen place's box on the map says it too)
  await expect(results.getByText(/^Approximate position: the Jewish quarter of Hebron/)).toBeVisible();
  await page.keyboard.press('Escape');
  const missing = page.locator('.locality-map-tool details').filter({ has: page.getByText('Rows without a mapped location', { exact: true }) });
  await missing.locator('summary').click();
  await expect(missing).not.toContainText('Hebron');
});
