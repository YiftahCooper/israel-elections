import { choose } from './choices.ts';
import { test, expect, type Page } from '@playwright/test';
async function start(page: Page, level = 'simple') {
  await page.addInitScript(level => { if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', JSON.stringify({lang:'en',theme:'light',level,hintDismissed:true})); },level);
  await page.goto('/');
  await expect(page.getByRole('region',{name:'Lists',exact:true})).toBeVisible();
  await choose(page.getByRole('button', {name:'Election',exact:true}), 'k25');
  await expect(page.locator('.lb-row').filter({has:page.locator('.lb-name',{hasText:'Likud'})}).locator('.lb-seats b')).toHaveText('32');
  await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
}
test('Simple opens agreement editing in place and keeps it across reload', async ({page}) => {
  await start(page);
  await page.getByRole('button',{name:'More options: Agreement editing',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Agreement partner',exact:true})).toBeVisible();
  await page.locator('.feature-disclosure').filter({has:page.getByRole('button',{name:'More options: Agreement editing',exact:true})}).getByRole('button',{name:'Keep this visible',exact:true}).click();
  await expect(page.getByRole('button',{name:'Custom · based on Simple',exact:true})).toBeVisible();
  expect((await page.locator('.band').boundingBox())!.height).toBeLessThanOrEqual(60);
  await page.reload();
  await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Agreement partner',exact:true})).toBeVisible();
});
test('Custom hides a tool and resetting Standard restores it', async ({page}) => {
  await start(page,'standard');
  await page.getByRole('button',{name:'Custom',exact:true}).click();
  await expect(page.getByRole('tab', {selected:true})).toHaveCount(0);
  await page.getByRole('group',{name:'Charts',exact:true}).getByRole('button',{name:'Hidden',exact:true}).click();
  await expect(page.getByRole('tab',{name:'Charts',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Reset to Standard',exact:true}).click();
  await expect(page.getByRole('tab',{name:'Charts',exact:true})).toBeVisible();
});
test('blank candidates can be undone and chip changes are human wording', async ({page}) => {
  await start(page,'expert');
  const candidates = page.locator('.side-panel .cands li');
  const count = await candidates.count();
  await page.getByRole('button', {name:'Empty this roster',exact:true}).click();
  await expect(candidates).toHaveCount(0);
  await expect(page.locator('.banner.warn').filter({hasText:'unfilled seats'})).toContainText('32 seats and 0 candidates');
  await expect(page.locator('.ld').filter({hasText:'unfilled seats'})).toBeVisible();
  await page.getByRole('button', { name: 'Switch scenario', exact: true }).click();
  await page.getByRole('dialog').locator('.scenario-changes summary').click();
  const changes = page.getByRole('dialog').locator('.scenario-changes ul');
  await expect(changes).toContainText('Candidates');
  expect(await changes.innerText()).not.toMatch(/[{}"]/);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:/^Undo:/}).click();
  await expect(candidates).toHaveCount(count);
});

for (const lang of ['en','he']) for (const theme of ['light','dark']) for (const phone of [false,true]) {
  test(`human agreement explanations and rule eras: ${lang} ${theme} ${phone ? 'phone' : 'desktop'}`, async ({page}) => {
    await page.setViewportSize(phone ? {width:390,height:844} : {width:1440,height:900});
    await page.addInitScript(v => localStorage.setItem('israel-elections:v1',JSON.stringify(v)), {lang,theme,level:'expert',hintDismissed:true});
    await page.goto('/');
    await choose(page.getByRole('button', {name:lang === 'he' ? 'בחירות' : 'Election',exact:true}), 'k25');
    await expect(page.locator('.lb-row').filter({has:page.locator('.lb-name',{hasText:lang === 'he' ? 'ליכוד' : 'Likud'})}).locator('.lb-seats b')).toHaveText('32');
    await page.getByRole('tab',{name:lang === 'he' ? 'איחוד ופיצול' : 'Merge & split',exact:true}).click();
    await page.getByRole('button',{name:lang === 'he' ? 'הסכמי עודפים' : 'Surplus agreements',exact:true}).click();
    await page.getByRole('button', {name:lang === 'he' ? 'ביטול כל ההסכמים' : 'Remove all agreements',exact:true}).click();
    const removed = page.locator('.removed-agreements li');
    await expect(removed).toHaveCount(0);
    const marker = page.locator('.edit-marker[data-marker-kind=part]');
    await expect(marker).toHaveCount(1);
    await expect(page.locator('.edit-marker[data-marker-kind=item]')).toHaveCount(0);
    await marker.focus();
    const tip = page.locator('.edit-tooltip');
    await expect(tip).toBeVisible();
    expect(await tip.innerText()).not.toMatch(/[{}"]|25-agr-|25-/);
    const box = (await tip.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(phone ? 390 : 1440);
    await page.screenshot({path:`.backup-scratch/custom-level/markers-${lang}-${theme}-${phone ? 'phone' : 'desktop'}.png`});
    await page.getByRole('tab',{name:lang === 'he' ? 'כללים' : 'Rules',exact:true}).click();
    await page.getByRole('button', {name:lang === 'he' ? 'העתקת כללים מ…' : 'Copy rules from…',exact:true}).click();
    const options = page.getByRole('dialog').locator('.choice-option');
    expect((await options.allTextContents()).join(' ')).not.toContain('il-');
    await expect(options.filter({hasText:'1977'})).toContainText(lang === 'he' ? 'מגבלת מועמדים' : 'Candidate cap');
  });
}
