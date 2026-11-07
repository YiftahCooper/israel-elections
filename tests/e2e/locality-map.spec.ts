import { choose } from './choices.ts';
import { expect, test } from '@playwright/test';

test('locality map supports bilingual search, address lookup and table fallback', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  // Keep this test independent of public tile/geocoding services and their traffic budgets.
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
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
  const credit = await page.locator('.leaflet-control-attribution').boundingBox();
  expect(credit!.x).toBeGreaterThanOrEqual(bounds!.x);
  expect(credit!.x + credit!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
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
  await expect(page.getByText('1144 of 1149 localities placed.')).toBeVisible();
  await expect(page.getByText(/because no official locality table exists/)).toHaveCount(0);
  await expect(page.locator('.locality-map-label').filter({hasText:'Jerusalem'})).toHaveCount(1);
  await page.getByRole('button', {name:'2006 location matching',exact:true}).click();
  await expect(page.getByText('2006 locations are matched by Hebrew name to a single CBS locality code. Ambiguous or unmatched rows remain unplaced.')).toBeVisible();
});

test('locality map explains a result, speaks English and fits the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',theme:'dark',level:'expert',hintDismissed:true})));
  // tiles blocked: the frame says the background map failed instead of staying silently blank
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByText('The background map could not load; the locality dots still work.')).toBeVisible();
  // A genuine dark vector style replaces the former inverted raster.
  expect(await page.locator('.locality-map-canvas .leaflet-tile-pane').evaluate(e => getComputedStyle(e).filter)).toBe('none');
  await expect(page.getByText('Lines and areas', {exact:true})).toBeVisible();
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenFreeMap');
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenMapTiles');
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
  expect(await results.getByRole('heading').innerText()).not.toMatch(/[\u0590-\u05ff]/);
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
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
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


test('2006 Hebrew map explains name placement and lists only the five unplaced localities', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'he',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await choose(page.getByRole('button', {name:'בחירות',exact:true}), 'k17');
  await page.getByRole('tab', {name:'יישובים',exact:true}).click();
  await expect(page.getByText('1144 מתוך 1149 יישובים ממופים.')).toBeVisible();
  await expect(page.locator('.locality-map-label').first()).toBeVisible();
  await page.getByRole('button', {name:'התאמת מיקומים ב־2006',exact:true}).click();
  await expect(page.getByText('מיקומי 2006 הותאמו לפי השם העברי לסמל יישוב יחיד של הלמ״ס. שורות ללא התאמה או עם התאמה עמומה אינן ממוקמות.')).toBeVisible();
  await page.keyboard.press('Escape');
  const missing = page.locator('.locality-map-tool details');
  await missing.locator('summary').click();
  await expect(missing.locator('li')).toHaveCount(5);
  for(const name of ['דלתון','חברון','נווה אילן','סנסנה','שושנת העמקים']) await expect(missing).toContainText(name);
  await expect(missing).not.toContainText('מעטפות');
  await page.getByRole('button', {name:'טבלה',exact:true}).click();
  await expect(page.getByRole('button', {name:'התאמת מיקומים ב־2006',exact:true})).toBeVisible();
});


test('vector background loads after removing provider labels and boundaries', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/styles/*', route => route.fulfill({json:{
    version:8, sources:{}, layers:[{id:'background',type:'background',paint:{'background-color':'#dde2e7'}},
      {id:'provider-place',type:'symbol',source:'missing'}, {id:'boundary_2',type:'line',source:'missing','source-layer':'boundary'}]
  }}));
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expect(page.locator('.locality-map-label').filter({hasText:'Jerusalem'})).toHaveCount(1);
  await expect(page.getByText('Lines and areas',{exact:true})).toBeVisible();
  await expect(page.locator('.locality-map-legend')).toContainText('Tie / unassigned / no votes');
  await expect(page.getByText('The background map could not load; the locality dots still work.')).toHaveCount(0);
});


test('WebGL unavailable leaves labels/search usable and cleans up when leaving the map', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true}));
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.route('https://tiles.openfreemap.org/styles/*', route => route.fulfill({json:{version:8,sources:{},layers:[{id:'bg',type:'background'}]}}));
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByText('The background map could not load; the locality dots still work.')).toBeVisible();
  await expect(page.locator('.locality-map-label').filter({hasText:'Jerusalem'})).toHaveCount(1);
  await page.getByRole('tab', {name:'Overview',exact:true}).click();
  await expect(page.locator('.locality-map-canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});


test('boundaries have independent controls, hatch geometry, source and snapshot info', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/**',route=>route.abort());
  await page.goto('/');await page.getByRole('tab',{name:'Localities',exact:true}).click();
  const legend=page.getByRole('group',{name:'Lines and areas',exact:true});
  await expect(legend.getByRole('checkbox')).toHaveCount(8);
  await expect(page.locator('.leaflet-verified-lines-pane path')).not.toHaveCount(0);
  await expect(page.locator('.leaflet-verified-lines-pane pattern')).toHaveCount(1);
  const before=await page.locator('.leaflet-verified-lines-pane path').count();
  await legend.getByRole('checkbox',{name:'1949 armistice · Judea and Samaria',exact:true}).uncheck();
  await expect.poll(()=>page.locator('.leaflet-verified-lines-pane path').count()).toBeLessThan(before);
  await expect(legend.getByRole('checkbox',{name:'Lebanon · Blue Line',exact:true})).toBeChecked();
  await legend.getByRole('button',{name:'Israel–Gaza Strip boundary',exact:true}).click();
  await expect(page.getByText('Geometry snapshot:',{exact:false})).toBeVisible();
  await expect(page.getByRole('link',{name:'UN · S/1471 (1950)',exact:true})).toHaveAttribute('href','https://www.un.org/unispal/document/auto-insert-183322/');
});

// Selection queues a canvas redraw; zoom/resize can also redraw synchronously before teardown.
test('selection and zoom can be followed immediately by leaving and remounting the map', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  for (const width of [1500,390,1024]) {
    await page.setViewportSize({width,height:1000});
    await page.getByRole('tab',{name:'Localities',exact:true}).click();
    await expect(page.locator('.locality-map-label').first()).toBeVisible();
    await page.getByRole('searchbox',{name:'Find a locality'}).fill('jerusalem');
    await page.locator('.locality-map-matches button').first().click();
    await page.getByRole('button',{name:'Zoom out',exact:true}).click();
    await page.getByRole('tab',{name:'Overview',exact:true}).click();
    await expect(page.locator('.locality-map-canvas')).toHaveCount(0);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  }
  await page.getByRole('tab',{name:'Localities',exact:true}).click();
  await expect(page.locator('.leaflet-verified-lines-pane pattern')).toHaveCount(1);
  await expect(page.locator('.locality-map-canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
