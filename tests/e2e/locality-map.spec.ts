import { choose } from './choices.ts';
import { expect, test } from '@playwright/test';

test('locality map supports bilingual search, address lookup and table fallback', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  // Keep this test independent of public tile/geocoding services and their traffic budgets.
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.route('https://photon.komoot.io/**', route => route.fulfill({json:{features:[{geometry:{coordinates:[34.78,32.08]},properties:{name:'Test address',city:'Tel Aviv'}}]}}));
  await page.goto('/');
  await choose(page.getByRole('button', {name:'Election',exact:true}), 'k25');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByRole('region', {name:/Locality results map/})).toBeVisible();
  await page.getByRole('searchbox', {name:'Find a locality'}).fill('tel aviv');
  await page.getByRole('button', {name:/Tel Aviv.*5000/i}).click();
  const results = page.getByRole('region', {name:'Selected locality results'});
  await expect(results).toContainText('Valid 265,796');
  await expect(results).toContainText('Turnout 59.6%');
  await page.setViewportSize({width:390,height:844});
  const bounds = await page.getByRole('region', {name:/Locality results map/}).boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(390);
  await page.getByRole('searchbox', {name:'Find a locality'}).fill('תֵּל אָבִיב');
  await expect(page.getByRole('button', {name:/Tel Aviv.*5000/i})).toBeVisible();
  await choose(page.getByRole('button', {name:'Colour by', exact:true}), 'list');
  await page.getByRole('textbox', {name:'Nearest locality to an address'}).fill('Test address');
  await page.getByRole('button', {name:'Find address',exact:true}).click();
  await page.getByRole('button', {name:'Test address, Tel Aviv'}).click();
  await expect(page.getByRole('status').filter({hasText:/Nearest mapped locality/})).toBeVisible();
  await page.getByRole('button', {name:'Table',exact:true}).click();
  await page.getByRole('searchbox', {name:'Search localities',exact:true}).fill('tel aviv');
  // English mode names localities in English (CBS), never Hebrew only
  await expect(page.getByRole('region', {name:'Scrollable table'}).getByRole('table')).toContainText('Tel Aviv-Yafo');
  await choose(page.getByRole('button', {name:'Election',exact:true}), 'k17');
  await page.getByRole('button', {name:'Map',exact:true}).click();
  await expect(page.getByText(/The 2006 locality results lack CBS locality codes/)).toBeVisible();
});

test('locality map explains a result, speaks English and fits the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',theme:'dark',level:'expert',hintDismissed:true})));
  // tiles blocked: the frame says the background map failed instead of staying silently blank
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByText('The background map could not load; the locality dots still work.')).toBeVisible();
  // the basemap is darkened in dark theme; only the tiles are filtered
  expect(await page.locator('.locality-map-canvas .leaflet-tile-pane').evaluate(e => getComputedStyle(e).filter)).toContain('invert(1)');
  // the address field is a normal input, not a grey bar
  const bg = (name: string) => page.getByRole(name === 'address' ? 'textbox' : 'searchbox', {name: name === 'address' ? 'Nearest locality to an address' : 'Find a locality'}).evaluate(e => getComputedStyle(e).backgroundColor);
  expect(await bg('address')).toBe(await bg('search'));
  // the map labels its localities in English
  const labels = page.locator('.locality-map-label');
  await expect(labels.filter({hasText:'Jerusalem'})).toHaveCount(1);
  for (const text of await labels.allInnerTexts()) expect(text).not.toMatch(/[\u0590-\u05FF\u0600-\u06FF]/);
  await page.getByRole('searchbox', {name:'Find a locality'}).fill('haifa');
  await page.getByRole('button', {name:/^Haifa \(4000\)$/}).click();
  const results = page.getByRole('region', {name:'Selected locality results'});
  await expect(results.getByRole('heading')).toContainText('Haifa');
  await expect(results.locator('.locality-verdict')).toContainText(/ahead of .+ by \d+\.\d pp \([\d,]+ votes\)/);
  await expect(results.getByRole('columnheader', {name:'Bloc'})).toBeVisible();
  await expect(results.locator('tr.sel')).toHaveCount(1);
  // 2006 has no locality codes, but its rows still have CBS English names
  await choose(page.getByRole('button', {name:'Election',exact:true}), 'k17');
  await page.getByRole('button', {name:'Table',exact:true}).click();
  await page.getByRole('searchbox', {name:'Search localities',exact:true}).fill('abu ghosh');
  await expect(page.getByRole('region', {name:'Scrollable table'}).getByRole('table')).toContainText('Abu Ghosh');
});

test('zooming the locality map never scrolls the page', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByRole('region', {name:/Locality results map/})).toBeVisible();
  // at the top of the page the map is only partly in view: Leaflet's own refocus scrolled it into view (12 px here)
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // zooming still works: more localities get English labels one level in
  const labels = () => page.locator('.locality-map-label').count();
  await expect.poll(labels).toBeGreaterThan(0);
  const before = await labels();
  await page.getByRole('button', {name:'Zoom in'}).click();
  await expect.poll(labels).toBeGreaterThan(before);
  await page.getByRole('button', {name:'Zoom out'}).click();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.locality-map-canvas')).toBeFocused();
});
