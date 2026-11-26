import { choose } from './choices.ts';
// the figures below were drawn at one decimal place (Settings → Max decimal places)
import { expect, test } from './fixtures';
import { settleMap } from './map-settle.ts';
import { boxesNow, waitForStill } from './settle.ts';

test('locality map supports bilingual search, address lookup and table fallback', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 1 } })); return JSON.stringify(o); })({lang:'en',level:'expert',hintDismissed:true})));
  // Keep this test independent of public tile/geocoding services and their traffic budgets.
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.route('https://photon.komoot.io/**', route => route.fulfill({json:{features:[{geometry:{coordinates:[34.78,32.08]},properties:{name:'Test address',city:'Tel Aviv'}}]}}));
  await page.goto('/');
  await choose(page.getByRole('button', { name: /^Election(: |$)/ }), 'k25');
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
  await choose(page.getByRole('button', { name: /^Colour by(: |$)/ }), 'list');
  await page.getByRole('textbox', {name:'Nearest locality to an address'}).fill('Test address');
  await page.getByRole('button', {name:'Find address',exact:true}).click();
  await page.getByRole('button', {name:'Test address, Tel Aviv'}).click();
  await expect(page.getByRole('status').filter({hasText:/Nearest mapped locality/})).toBeVisible();
  await page.getByRole('button', {name:'Table',exact:true}).click();
  await page.getByRole('searchbox', {name:'Search localities',exact:true}).fill('tel aviv');
  // English mode names localities in English (CBS), never Hebrew only
  await expect(page.getByRole('region', {name:'Scrollable table'}).getByRole('table')).toContainText('Tel Aviv-Yafo');
  await choose(page.getByRole('button', { name: /^Election(: |$)/ }), 'k17');
  await page.getByRole('button', {name:'Map',exact:true}).click();
  // Hebron is placed by hand, marked approximate (U4, 16 Nov)
  await expect(page.getByText('4 of 1,149 places have no point on the map; they are listed below.')).toBeVisible();
  await expect(page.getByText(/because no official locality table exists/)).toHaveCount(0);
  await expect(page.locator('.locality-map-label').filter({hasText:'Jerusalem'})).toHaveCount(1);
  // the 2006 note says what it means for the map in one line, with no method essay behind an (i) (clarity pass, 26 Nov 2026)
  await expect(page.getByText('The official 2006 results have no locality codes', {exact:false}).first()).toBeVisible();
});

test('locality map explains a result, speaks English and fits the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 1 } })); return JSON.stringify(o); })({lang:'en',theme:'dark',level:'expert',hintDismissed:true})));
  // tiles blocked: the frame says the background map failed instead of staying silently blank
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByText('The background map could not load; the locality dots still work.')).toBeVisible();
  // A genuine dark vector style replaces the former inverted raster.
  expect(await page.locator('.locality-map-canvas .leaflet-tile-pane').evaluate(e => getComputedStyle(e).filter)).toBe('none');
  await expect(page.locator('.locality-boundary-disclosure > summary')).toBeVisible();
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
  await choose(page.getByRole('button', { name: /^Election(: |$)/ }), 'k17');
  await page.getByRole('button', {name:'Table',exact:true}).click();
  await page.getByRole('searchbox', {name:'Search localities',exact:true}).fill('abu ghosh');
  await expect(page.getByRole('region', {name:'Scrollable table'}).getByRole('table')).toContainText('Abu Ghosh');
});

test('zooming the locality map never scrolls the page', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 1 } })); return JSON.stringify(o); })({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByRole('region', {name:/Locality results map/})).toBeVisible();
  // at the top of the page the map is only partly in view: Leaflet's own refocus scrolled it into view (12 px here)
  await settleMap(page);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // zooming still works: more localities get English labels one level in
  const labels = () => page.locator('.locality-map-label').count();
  await expect.poll(labels).toBeGreaterThan(0);
  const before = await labels();
  await page.getByRole('button', {name:'Zoom in'}).click();
  await expect.poll(labels).toBeGreaterThan(before);
  await page.getByRole('button', {name:'Zoom out'}).click();
  // Leaflet focuses the map after the zoom; a scroll it caused would land then
  await settleMap(page);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.locality-map-canvas')).toBeFocused();
});


test('2006 Hebrew map says in one line why a few places are missing and lists only those four', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 1 } })); return JSON.stringify(o); })({lang:'he',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await choose(page.getByRole('button', { name: /^בחירות(: |$)/ }), 'k17');
  await page.getByRole('tab', {name:'יישובים',exact:true}).click();
  await expect(page.getByText('ל־4 מתוך 1,149 מקומות אין נקודה במפה; הם מפורטים למטה.')).toBeVisible();
  await expect(page.locator('.locality-map-label').first()).toBeVisible();
  await expect(page.getByText('בתוצאות הרשמיות של 2006 אין סמלי יישובים', {exact:false}).first()).toBeVisible();
  const missing = page.locator('.locality-map-tool details').filter({has:page.getByText('מקומות שאינם במפה',{exact:true})});
  await missing.locator('summary').click();
  await expect(missing.locator('li')).toHaveCount(4);
  for(const name of ['דלתון','נווה אילן','סנסנה','שושנת העמקים']) await expect(missing).toContainText(name);
  await expect(missing).not.toContainText('חברון');
  await expect(missing).not.toContainText('מעטפות');
  await page.getByRole('button', {name:'טבלה',exact:true}).click();
  await expect(page.getByText('בתוצאות הרשמיות של 2006 אין סמלי יישובים', {exact:false}).first()).toBeVisible();
});


test('vector background loads after removing provider labels and boundaries', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/styles/*', route => route.fulfill({json:{
    version:8, sources:{}, layers:[{id:'background',type:'background',paint:{'background-color':'#dde2e7'}},
      {id:'provider-place',type:'symbol',source:'missing'}, {id:'boundary_2',type:'line',source:'missing','source-layer':'boundary'}]
  }}));
  await page.goto('/');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expect(page.locator('.locality-map-label').filter({hasText:'Jerusalem'})).toHaveCount(1);
  await expect(page.locator('.locality-boundary-disclosure > summary')).toBeVisible();
  await expect(page.locator('.locality-map-legend')).toContainText('Tie / unassigned / no votes');
  await expect(page.getByText('The background map could not load; the locality dots still work.')).toHaveCount(0);
});


test('WebGL unavailable leaves labels/search usable and cleans up when leaving the map', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', ((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'en',level:'expert',hintDismissed:true}));
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
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'en',level:'expert',hintDismissed:true})));
  await page.route('https://tiles.openfreemap.org/**',route=>route.abort());
  await page.goto('/');await page.getByRole('tab',{name:'Localities',exact:true}).click();
  const legend=page.getByRole('group',{name:'Lines and areas',exact:true});
  // 12 lines and areas, under one "All lines and areas" box
  await expect(legend.getByRole('checkbox')).toHaveCount(13);
  await expect(page.locator('.leaflet-verified-lines-pane path')).not.toHaveCount(0);
  await expect(page.locator('.leaflet-verified-lines-pane pattern')).toHaveCount(2);
  const before=await page.locator('.leaflet-verified-lines-pane path').count();
  await legend.getByRole('checkbox',{name:'Armistice lines · Judea and Samaria',exact:true}).uncheck();
  await expect.poll(()=>page.locator('.leaflet-verified-lines-pane path').count()).toBeLessThan(before);
  await expect(legend.getByRole('checkbox',{name:'Lebanon · Blue Line',exact:true})).toBeChecked();
  await legend.getByRole('button',{name:'Israel–Gaza Strip boundary: explanation',exact:true}).click();
  await expect(page.getByText('Geometry snapshot:',{exact:false})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'UN · S/1471 (1950)',exact:true})).toHaveAttribute('href','https://www.un.org/unispal/document/auto-insert-183322/');
});

// Selection queues a canvas redraw; zoom/resize can also redraw synchronously before teardown.
test('selection and zoom can be followed immediately by leaving and remounting the map', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'en',level:'expert',hintDismissed:true})));
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
  await expect(page.locator('.leaflet-verified-lines-pane pattern')).toHaveCount(2);
  await expect(page.locator('.locality-map-canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('source precision hides approximate lines while locality detail and treaty disclaimers remain available',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'en',theme:'dark',level:'expert',hintDismissed:true})));
 await page.route('https://tiles.openfreemap.org/**',route=>route.abort());
 await page.goto('/');await page.getByRole('tab',{name:'Localities',exact:true}).click();
 const paths=page.locator('.leaflet-verified-lines-pane svg > g path');await expect(paths.first()).toBeAttached();
 expect(await paths.evaluateAll(xs=>xs.every(x=>x.getAttribute('stroke-linecap')==='butt'))).toBe(true);
 const legend=page.getByRole('group',{name:'Lines and areas',exact:true});
 await legend.getByRole('button',{name:'Jordan · line with Judea and Samaria: explanation',exact:true}).click();
 await expect(page.getByText(/Any treatment of this line shall be without prejudice to the status of the territory/)).toBeVisible();
 await expect(page.getByRole('link',{name:'Official Hebrew treaty record',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('searchbox',{name:'Find a locality'}).fill('jerusalem');await page.locator('.locality-map-matches button').first().click();
 await expect(page.getByText('Some approximate lines are hidden at this zoom. Zoom out to see them.',{exact:false})).toBeVisible();
 await expect(page.locator('.locality-map-label').filter({hasText:'Jerusalem'})).toHaveCount(1);
 await expect(legend.getByRole('checkbox',{name:'Government House zone · 1949–1967',exact:true})).toBeChecked();
});

test('crossing a source precision limit keeps the map and zoom control in place',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'en',level:'expert',hintDismissed:true})));
 await page.route('https://tiles.openfreemap.org/**',route=>route.abort());await page.setViewportSize({width:390,height:1000});
 await page.goto('/');await page.getByRole('tab',{name:'Localities',exact:true}).click();
 const map=page.locator('.locality-map-canvas');await map.scrollIntoViewIfNeeded();
 // the map and its legend (collapsed on a phone a moment after it appears) settle before the place is taken
 await settleMap(page);await waitForStill(page,['.locality-map-canvas','.leaflet-control-zoom']);
 const y=(await map.boundingBox())!.y;const zoom=page.getByRole('button',{name:'Zoom in',exact:true});
 for(let i=0;i<5;i++){await zoom.click();await settleMap(page);expect((await map.boundingBox())!.y).toBe(y);}
 await expect(page.getByText('Some approximate lines are hidden at this zoom. Zoom out to see them.',{exact:false})).toBeVisible();
});


test('Hebrew map references remain isolated LTR and the phone legend is collapsed',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',((o: {theme?:string;hintDismissed?:boolean;[k:string]:unknown})=>{if(!sessionStorage.getItem('seeded-settings')){sessionStorage.setItem('seeded-settings','1');localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:o.theme??'light',starterTip:false,decimals:1}}));}return JSON.stringify(o);})({lang:'he',level:'expert',hintDismissed:true})));
 await page.route('https://tiles.openfreemap.org/**',route=>route.abort());
 await page.setViewportSize({width:390,height:1000});await page.goto('/');
 await page.getByRole('tab',{name:'יישובים',exact:true}).click();
 const disclosure=page.locator('.locality-boundary-disclosure');await expect(disclosure).not.toHaveAttribute('open');
 await disclosure.locator('summary').click();
 await page.getByRole('button',{name:'הסבר: קווי שביתת הנשק · יהודה ושומרון',exact:true}).click();
 const pop=page.locator('.pop').last();
 await expect(pop.locator('bdi[dir="ltr"]').filter({hasText:'V(1)(b)'})).toBeVisible();
 await expect(pop.locator('bdi[dir="ltr"]').filter({hasText:/^60$/})).toBeVisible();
 expect(await pop.locator('bdi').evaluateAll(xs=>xs.every(x=>!/[.,:;]$/.test(x.textContent?.trimEnd()??'')))).toBe(true);
 await expect(pop).not.toContainText('OSM');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'הסבר: ירדן · הקו מול יהודה ושומרון',exact:true}).click();
 await expect(pop).toContainText('1994 · נספח I(א) 2.A.7');
 await expect(pop.locator('bdi[dir="ltr"]').filter({hasText:'I(א) 2.A.7'})).toBeVisible();
 await expect(pop).toContainText('ומפות ההדמאה');await expect(pop).not.toContainText('Annex');
});

for (const election of ['k16', 'k25', 'k26']) for (const width of [1500, 390]) for (const theme of ['light', 'dark']) {
  test(`Hebrew CBS labels around Lakiya/Rahat ${election} ${width} ${theme}`, async ({page}) => {
    await page.setViewportSize({width, height:1000});
    await page.addInitScript(({theme}) => {
      localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'he',level:'expert',hintDismissed:true}));
      localStorage.setItem('israel-elections:settings', JSON.stringify({v:2,values:{theme,starterTip:false,decimals:1}}));
    }, {theme});
    await page.route('https://tiles.openfreemap.org/**', route => route.abort());
    await page.goto('/');
    await choose(page.getByRole('button', { name: /^בחירות(: |$)/ }), election);
    await page.getByRole('tab', {name:'יישובים',exact:true}).click();
    const search = page.getByRole('searchbox', {name:'חיפוש יישוב',exact:true});
    // Search by the original CEC alias and verify that results and map agree on the CBS spelling.
    await search.fill(election === 'k16' ? 'קודייראת א-צאנע)ש' : election === 'k25' ? 'קודייראת אצאנעשבט' : 'קודייראת א-צאנע(שבט)');
    const result = page.locator('.locality-map-matches button').filter({hasText:'964'});
    await expect(result).toContainText('קודייראת א-צאנע (שבט)');
    await result.click();
    await expect(page.locator('.locality-map-results h3')).toHaveText('קודייראת א-צאנע (שבט)');
      await expect(page.locator('.locality-map-label').filter({hasText:/^קודייראת א-צאנע \(שבט\)$/})).toBeVisible();
    await page.locator('.locality-map-canvas').scrollIntoViewIfNeeded();
    await page.screenshot({path:`.backup-scratch/hebrew-corrected-${election}-${width}-${theme}.png`});
    await search.fill('לקיה');
    await page.locator('.locality-map-matches button').filter({hasText:'(1060)'}).click();
    await expect(page.locator('.locality-map-label').filter({hasText:/^לקיה$/})).toBeVisible();
    const map = page.locator('.locality-map-canvas');
    await map.scrollIntoViewIfNeeded();
    await page.screenshot({path:`.backup-scratch/hebrew-labels-${election}-${width}-${theme}.png`});
    await page.getByRole('button', {name:'טבלה',exact:true}).click();
    await page.getByRole('searchbox', {name:'חיפוש יישוב',exact:true}).fill('קודייראת');
    await expect(page.getByRole('region', {name:'טבלה נגללת'})).toContainText('קודייראת א-צאנע (שבט)');
    if (election === 'k16') {
      await page.getByRole('searchbox', {name:'חיפוש יישוב',exact:true}).fill('942');
      const row = page.getByRole('region', {name:'טבלה נגללת'}).locator('tbody tr').first();
      await expect(row).toContainText('סואעד (חמרייה) (שב');
      await expect(row).toContainText('(CBS: סואעד (חמרייה))');
      await expect(row.locator('button.table-action')).toHaveAttribute('title', /\(CBS: סואעד \(חמרייה\)\)/);
    }
  });
}

test('Hebrew corrected names agree in nearest-locality messages and downloaded display data', async ({page}) => {
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'he',level:'expert',hintDismissed:true}));
    localStorage.setItem('israel-elections:settings', JSON.stringify({v:2,values:{starterTip:false}}));
  });
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.route('https://photon.komoot.io/**', route => route.fulfill({json:{features:[{geometry:{coordinates:[35.1156242606379,31.293647189077692]},properties:{name:'כתובת בדיקה'}}]}}));
  await page.goto('/');
  await choose(page.getByRole('button', { name: /^בחירות(: |$)/ }), 'k25');
  await page.getByRole('tab', {name:'יישובים',exact:true}).click();
  await page.getByRole('textbox', {name:'היישוב הקרוב לכתובת'}).fill('כתובת בדיקה');
  await page.getByRole('button', {name:'חיפוש כתובת',exact:true}).click();
  await page.getByRole('button', {name:'כתובת בדיקה',exact:true}).click();
  await expect(page.locator('.locality-map-status')).toContainText('היישוב הממופה הקרוב: קודייראת א-צאנע (שבט)');
  await page.getByRole('tab', {name:'מקורות',exact:true}).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', {name:'יישובים',exact:true}).click();
  const downloaded = await pending;
  const {readFile} = await import('node:fs/promises');
  const data = JSON.parse(await readFile((await downloaded.path())!, 'utf8'));
  const row = data.rows.find((r: {code:number}) => r.code === 964);
  expect(row.nameHe).toBe('קודייראת א-צאנע (שבט)');
  expect(row.cecNameHe).toBe('קודייראת אצאנעשבט');
  expect(row.nameSource.source).toBe('cbs');
});

// Review fault L1 (owner, loc-phone): on a phone the locality search goes below the map, and no empty band sits above it.
for (const lang of ['en', 'he'] as const) test(`phone: the map comes before the locality search, with no empty band above it (${lang})`, async ({ page }) => {
  await page.addInitScript(l => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: l, level: 'expert', hintDismissed: true })); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); } }, lang);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('tab', { name: lang === 'he' ? 'יישובים' : 'Localities', exact: true }).click();
  const map = page.getByRole('region', { name: lang === 'he' ? /מפת תוצאות ביישובים/ : /Locality results map/ });
  await expect(map).toBeVisible();
  const search = page.getByRole('searchbox', { name: lang === 'he' ? 'חיפוש יישוב' : 'Find a locality' });
  // the map fits the country and its phone legend lays out after it appears: read the three boxes at rest, in one step (T1)
  await settleMap(page);
  await waitForStill(page, ['.locality-boundary-disclosure', '.locality-find']);
  const [m, s, lines] = await boxesNow(map, search, page.locator('.locality-boundary-disclosure'));
  expect(s.y).toBeGreaterThan(m.y + m.height);
  expect(m.y - (lines.y + lines.height)).toBeLessThanOrEqual(24);
  await search.fill(lang === 'he' ? 'חיפה' : 'Haifa');
  await expect(page.locator('.locality-find .locality-map-matches button').first()).toBeVisible();
  await page.setViewportSize({ width: 1500, height: 1000 });
  // the wide layout arrives a frame after the resize: settle, then read both boxes in one step
  await settleMap(page);
  await waitForStill(page, ['.locality-find', '.locality-map-legend']);
  const [wide, legend] = await boxesNow(page.getByRole('searchbox', { name: lang === 'he' ? 'חיפוש יישוב' : 'Find a locality' }), page.locator('.locality-map-legend'));
  expect(wide.y).toBeLessThan(legend.y);
});

// Review fault L7: the double-envelope count (registered 0: envelope voters are registered in their home localities)
// read "Registered 0" beside 450,074 valid votes. A zero registered count shows a dash, as Turnout already does.
test('double envelopes show no registered count, not 0', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'he', level: 'expert', hintDismissed: true })); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); } });
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('tab', { name: 'יישובים', exact: true }).click();
  await page.getByRole('searchbox', { name: 'חיפוש יישוב', exact: true }).fill('מעטפות');
  await page.locator('.locality-map-matches button').first().click();
  const facts = page.locator('.locality-map-facts');
  await expect(facts).toContainText('בעלי זכות —');
  await expect(facts).not.toContainText(/בעלי זכות 0\b/);
});

// V2 fault L2: on a wide screen the map opened at a whole zoom level that showed Israel as a thin strip, with Sinai,
// Jordan and open sea around it. It now opens fitted in quarter steps, closer than the old whole level.
test('desktop: the map opens framed on the country, not a whole zoom level out', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', hintDismissed: true })); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); } });
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Localities', exact: true }).click();
  const map = page.locator('.locality-map-canvas');
  await expect(map).toHaveAttribute('data-fit-zoom', /\d/);
  expect(Number(await map.getAttribute('data-fit-zoom'))).toBeGreaterThan(7);
});
