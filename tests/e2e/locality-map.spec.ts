import { expect, test } from '@playwright/test';

test('locality map supports bilingual search, address lookup and table fallback', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',level:'expert',hintDismissed:true})));
  // Keep this test independent of public tile/geocoding services and their traffic budgets.
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.route('https://photon.komoot.io/**', route => route.fulfill({json:{features:[{geometry:{coordinates:[34.78,32.08]},properties:{name:'Test address',city:'Tel Aviv'}}]}}));
  await page.goto('/');
  await page.getByRole('combobox', {name:'Election',exact:true}).selectOption('k25');
  await page.getByRole('tab', {name:'Localities',exact:true}).click();
  await expect(page.getByRole('region', {name:/Locality results map/})).toBeVisible();
  await page.getByRole('searchbox', {name:'Find a locality'}).fill('tel aviv');
  await page.getByRole('button', {name:/Tel Aviv.*5000/i}).click();
  const results = page.getByRole('region', {name:'Selected locality results'});
  await expect(results).toContainText('Valid votes:');
  await expect(results).toContainText('Turnout:');
  await page.setViewportSize({width:390,height:844});
  const bounds = await page.getByRole('region', {name:/Locality results map/}).boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(390);
  await page.getByRole('searchbox', {name:'Find a locality'}).fill('תֵּל אָבִיב');
  await expect(page.getByRole('button', {name:/Tel Aviv.*5000/i})).toBeVisible();
  await page.getByRole('combobox', {name:'Colour by'}).selectOption('list');
  await page.getByRole('textbox', {name:'Nearest locality to an address'}).fill('Test address');
  await page.getByRole('button', {name:'Find address',exact:true}).click();
  await page.getByRole('button', {name:'Test address, Tel Aviv'}).click();
  await expect(page.getByRole('status').filter({hasText:/Nearest mapped locality/})).toBeVisible();
  await page.getByRole('button', {name:'Table',exact:true}).click();
  await page.getByRole('searchbox', {name:'Search localities',exact:true}).fill('tel aviv');
  await expect(page.getByRole('region', {name:'Scrollable table'}).getByRole('table')).toContainText('תל אביב');
  await page.getByRole('combobox', {name:'Election',exact:true}).selectOption('k17');
  await page.getByRole('button', {name:'Map',exact:true}).click();
  await expect(page.getByText(/The 2006 locality results lack CBS locality codes/)).toBeVisible();
});
