import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';
async function start(page: Page) {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en', level:'standard', hintDismissed:true})));
  await page.goto('/');
  await choose(page.getByRole('button', {name:'Election', exact:true}), 'k25');
  await expect(page.getByRole('button', { name: 'Grouping', exact: true })).toHaveText(/37th government/);
}
async function split(page: Page) {
  await page.getByRole('button', {name:'United Torah Judaism', exact:true}).click();
  await page.getByRole('button', {name:'Split into separate lists', exact:true}).click();
  await page.getByRole('button', {name:'Run as 2 separate lists', exact:true}).click();
  await page.keyboard.press('Escape');
}
test('E1 Compare and E2 coalition shortcuts use the moved party seats', async ({page}) => {
  await start(page);
  await page.getByRole('region', {name:'Seats by bloc'}).getByRole('button', {name:'Edit blocs', exact:true}).click();
  const editor=page.getByRole('complementary', {name:'Edit blocs'});
  await editor.getByRole('button', {name:/^New Hope, 4 seats/}).click();
  await editor.locator('.bp-card').first().getByRole('button', {name:'Move here'}).click();
  await page.keyboard.press('Escape');
  await page.getByRole('tab', {name:'Compare', exact:true}).click();
  await expect.soft(page.locator('.cmp .legend')).toContainText('68');
  await page.getByRole('tab', {name:'Coalitions', exact:true}).click();
  await page.locator('.coal').getByRole('button', {name:'Coalition', exact:true}).click();
  await expect(page.locator('.coal-now .majority-readout')).toContainText('68 / 120');
  await expect(page.locator('.coal-choice').filter({hasText:'New Hope (National Unity)'}).getByRole('button', {name:'In', exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.coal-choice').filter({hasText:/National Unity 8/})).toBeVisible();
});
test('E3 separated lists compare once as a group', async ({page}) => {
  await start(page); await split(page);
  for (const name of ['Agudat Yisrael','Degel HaTorah']) {
    const row=page.getByRole('region', {name:'Lists'}).getByRole('button', {name,exact:true});
    await expect(row.locator('.lb-seats small, .was')).toHaveCount(0);
  }
  await expect(page.locator('.lb-group-comparison')).toContainText('together 4, officially 7');
  await expect(page.locator('.session')).not.toContainText('−7');
  await page.getByRole('tab',{name:'Compare',exact:true}).click();
  await page.locator('.cmp details summary').click();
  const row=page.locator('.cmp tbody tr').filter({hasText:'Agudat Yisrael'});
  await expect(row).toHaveCount(1);
  await expect(row.locator('td').nth(5)).toHaveText('7');
  await expect(row.locator('td').nth(6)).toHaveText('4');
});
for (const lang of ['en','he']) test(`E5 E6 phone election and named tools ${lang}`, async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await start(page);
  if(lang==='he') await page.getByRole('button',{name:'עב',exact:true}).click();
  for(const level of (lang==='en'?['Simple','Standard','Expert']:['פשוט','רגיל','מומחה'])) {
    await page.getByRole('button',{name:level,exact:true}).click();
    expect.soft((await page.locator('.election .choice-trigger').boundingBox())!.width).toBeGreaterThan(210);
  }
  for (const name of (lang==='en'?['Save & share','Start over']:['שמירה ושיתוף','התחלה מחדש'])) {
    await expect.soft(page.getByRole('button',{name,exact:true})).toHaveAttribute('title',name);
  }
});
test('E7 native list controls in Compare and Seat safety open with Enter', async ({page}) => {
  await start(page);
  for(const tab of ['Compare','Seat safety']) {
    await page.getByRole('tab',{name:tab,exact:true}).click();
    if(tab==='Compare') await page.locator('.cmp details summary').click();
    const button=page.locator(tab==='Compare'?'.cmp tbody':'.security').getByRole('button',{name:'Likud',exact:true});
    await expect(button).toBeVisible({timeout:60000}); await button.focus(); await button.press('Enter');
    await expect(page.getByRole('region',{name:'List details'})).toBeVisible();
    await page.keyboard.press('Escape');
  }
});
test('E8 locality historical name survives a separate electoral run', async ({page}) => {
  await start(page); await split(page);
  await page.getByRole('button',{name:'Expert',exact:true}).click();
  await page.getByRole('tab',{name:'Localities',exact:true}).click();
  await page.locator('.locality-map-matches').waitFor({state:'hidden'});
  const search=page.getByRole('searchbox', {name:'Find a locality'});
  await search.fill('tel aviv');
  await page.locator('.locality-map-matches button').filter({hasText:/5000/}).first().click();
  const lists=page.getByRole('region', {name:'Selected locality results'}).getByRole('table').filter({has:page.getByRole('columnheader',{name:'List',exact:true})});
  await expect(lists).toContainText('United Torah Judaism');
  await expect(lists).not.toContainText('25-ג');
});
test('E9 Escape reverts a draft first, then closes the panel', async ({page}) => {
  await start(page); await page.getByRole('button',{name:'Likud',exact:true}).click();
  const details=page.getByRole('region',{name:'List details'}), votes=details.getByLabel('Votes',{exact:true});
  const before=await votes.inputValue(); await votes.fill('123'); await votes.press('Escape');
  await expect(votes).toHaveValue(before); await expect(details).toBeVisible();
  await votes.press('Escape'); await expect(details).toHaveCount(0);
  await page.getByRole('button',{name:'Likud',exact:true}).click();
  await details.getByLabel('Votes',{exact:true}).press('Escape');
  await expect(details).toHaveCount(0);
});
test('E10 Compare change bars use neutral ink with an identity swatch', async ({page}) => {
  await start(page); await page.getByRole('button',{name:'Likud',exact:true}).click();
  const votes=page.getByRole('region',{name:'List details'}).getByLabel('Votes',{exact:true});
  await votes.fill('1300000'); await votes.press('Enter'); await page.keyboard.press('Escape');
  await page.getByRole('tab',{name:'Compare',exact:true}).click();
  const bar=page.locator('.cmp-pos i').first();
  await expect(bar).toHaveCSS('background-color', await page.locator('.cmp').evaluate(el=>getComputedStyle(el).color));
  await expect(page.locator('.cmp-label .swatch').first()).toBeVisible();
});

test('E9 bloc Escape cancels a pending move before closing', async ({page}) => {
  await start(page);
  await page.getByRole('region',{name:'Seats by bloc'}).getByRole('button',{name:'Edit blocs',exact:true}).click();
  const editor=page.getByRole('complementary',{name:'Edit blocs'});
  await editor.getByRole('button',{name:/^New Hope, 4 seats/}).click();
  await page.keyboard.press('Escape');
  await expect(editor).toBeVisible();
  await expect(editor.locator('.bp-picked')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(editor).toHaveCount(0);
});
