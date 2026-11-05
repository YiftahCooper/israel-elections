import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';
async function start(page: Page, lang = 'en', theme = 'light', level = 'standard') {
  await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), {lang, theme, level, hintDismissed:true});
  await page.goto('/');
  await expect(page.getByRole('region', {name:lang === 'he' ? 'הרשימות' : 'Lists',exact:true})).toBeVisible();
  await choose(page.getByRole('button', {name:lang === 'he' ? 'בחירות' : 'Election', exact:true}), 'k25');
  await expect(page.getByRole('region', { name: lang === 'he' ? 'הרשימות' : 'Lists', exact: true }).getByRole('button', { name: lang === 'he' ? 'הליכוד' : 'Likud', exact: true }).locator('.lb-seats b')).toHaveText('32');
}
test('grouping-only switches show no invented seat gains in Compare and name history actions', async ({page}) => {
  await start(page);
  for (const scheme of ['pre-election-blocs','first-government']) {
    await choose(page.getByRole('button', {name:'Grouping',exact:true}), scheme);
    await expect(page.getByRole('button', {name:/^Undo: Bloc grouping:/})).toBeEnabled();
    await expect(page.getByRole('button', {name:/^History ·/})).toBeVisible();
    await page.getByRole('tab', {name:'Compare',exact:true}).click();
    await expect(page.locator('.cmp')).toContainText('Baseline: Official result');
    await expect(page.locator('.cmp .legend')).not.toContainText('0 → 64');
    await expect(page.locator('.cmp-diff')).toHaveCount(0);
    const text = await page.locator('.cmp .legend').innerText();
    const pairs = [...text.matchAll(/(\d+) → (\d+)/g)];
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs.every(m => m[1] === m[2])).toBe(true);
    await page.getByRole('tab', {name:'Overview',exact:true}).click();
  }
});
test('coalition choices show In Out Any explicitly and keep constraints', async ({page}) => {
  await start(page);
  await page.getByRole('tab', {name:'Coalitions',exact:true}).click();
  const choice = page.locator('.coal-choice').filter({hasText:'Likud'}).first();
  const total = page.locator('.coal-now .majority-readout');
  await choice.getByRole('button',{name:'In',exact:true}).click();
  await expect(choice.getByRole('button',{name:'In',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(total).toHaveText('32 / 120 · 29 short of 61');
  await choice.getByRole('button',{name:'Out',exact:true}).click();
  await expect(total).toHaveCount(0);
  await expect(choice.getByRole('button',{name:'Out',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.coal-list')).not.toContainText('Likud');
  await choice.getByRole('button',{name:'Any',exact:true}).click();
  await expect(choice.getByRole('button',{name:'Any',exact:true})).toHaveAttribute('aria-pressed','true');
});
for (const lang of ['en','he']) for (const theme of ['light','dark']) for (const phone of [false,true]) {
  test(`threshold edit consequence and screenshot: ${lang}, ${theme}, ${phone ? 'phone' : 'desktop'}`, async ({page}) => {
    await page.setViewportSize(phone ? {width:390,height:844} : {width:1500,height:1000});
    await start(page,lang,theme,'simple');
    await page.getByRole('region',{name:lang === 'he' ? 'הרשימות' : 'Lists', exact:true}).getByRole('button',{name:lang === 'he' ? 'מרצ' : 'Meretz',exact:true}).click();
    const sheet = page.locator('.side-panel');
    const at = sheet.getByRole('button',{name:lang === 'he' ? 'מעבר אחוז החסימה' : 'Cross the threshold',exact:true});
    await expect(at).toBeVisible({timeout:30000});
    await at.click();
    await expect(sheet.locator('.crossing')).toContainText(lang === 'he' ? 'עברה את אחוז החסימה' : 'Passed the threshold');
    const votes = sheet.getByRole('textbox',{name:lang === 'he' ? 'קולות' : 'Votes',exact:true});
    if (phone) {
      await votes.scrollIntoViewIfNeeded();
      await expect(votes).toBeInViewport();
      await expect(sheet.locator('.phone-result-strip')).toBeInViewport();
      await expect(sheet.locator('.phone-result-strip')).toContainText('/ 120');
      await expect(sheet.locator('.phone-result-strip')).toContainText('61');
    }
    await page.screenshot({path:`.backup-scratch/wave-one/${lang}-${theme}-${phone ? 'phone' : 'desktop'}.png`,fullPage:false});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await sheet.getByRole('button',{name:lang === 'he' ? 'מעט מתחת לחסימה' : 'Just below threshold',exact:true}).click();
    await expect(sheet.locator('.crossing')).toContainText(lang === 'he' ? 'מתחת לאחוז החסימה' : 'Below the threshold');
    await sheet.getByRole('button',{name:lang === 'he' ? 'מעבר אחוז החסימה' : 'Cross the threshold',exact:true}).click();
    await expect(sheet.locator('.crossing')).toContainText(lang === 'he' ? 'עברה את' : 'Passed the');
  });
}
