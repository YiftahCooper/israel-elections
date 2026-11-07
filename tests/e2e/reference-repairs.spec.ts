import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';
async function start(page: Page, lang = 'en', theme = 'light') {
  await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), { lang, theme, level: 'standard', hintDismissed: true });
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await expect(page.locator('.lb-row').first().locator('.lb-seats b')).toHaveText('32');
}
async function split(page: Page, he = false) {
  await page.getByRole('button', { name: he ? 'יהדות התורה' : 'United Torah Judaism', exact: true }).click();
  // Keep the matrix driven by UI in each language; the first electoral split control lives in JointParties.
  await page.getByRole('button', { name: he ? 'פיצול לרשימות נפרדות' : 'Split into separate lists', exact: true }).click();
  await page.getByRole('button', { name: he ? 'ריצה ב-2 רשימות נפרדות' : 'Run as 2 separate lists', exact: true }).click();
  await page.keyboard.press('Escape');
}
async function save(page: Page, he = false) {
  await page.getByRole('tab', { name: he ? 'תרחישים' : 'Scenarios', exact: true }).click();
  const name = page.locator('.scn-form input');
  await name.fill('Review A'); await name.press('Enter');
  await page.getByRole('button', { name: he ? 'שמירה' : 'Save', exact: true }).click();
  await page.getByRole('tab', { name: he ? 'תמונת מצב' : 'Overview', exact: true }).click();
}
test('B1 saved separate-run reference is named everywhere; B6 identity is not repeated', async ({ page }) => {
  await start(page); await split(page);
  await expect(page.locator('.lb-group-comparison')).toContainText('together 4, officially 7');
  await save(page);
  await expect(page.locator('.lb-group-comparison')).toContainText('together 4, in Review A 4');
  await expect(page.locator('.lb-group-comparison')).not.toContainText('official');
  await expect(page.locator('.session')).toContainText('0 changes from Review A');
  await expect(page.locator('.session .scn-name')).toHaveCount(0);
  await page.getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = page.getByRole('region', { name: 'List details' }).getByLabel('Votes', { exact: true });
  await votes.fill('1300000'); await votes.press('Enter');
  await expect(page.locator('.session > b')).toHaveText('1 change from Review A', {useInnerText:true});
  await page.locator('.session').getByRole('button', { name: 'History', exact: true }).click();
  // The split recorded three result-changing actions; History retains them after saving.
  await expect(page.locator('.session .history .history-counts')).toHaveText('1 change from Review A · 4 from the official result');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Likud', exact: true })).toHaveAccessibleDescription(/more than Review A/);
  await expect(page.locator('.phone-result-strip')).toContainText('from Review A');
  await page.getByRole('button', { name: 'Expert', exact: true }).click();
  await expect(page.getByRole('region', { name: 'List details' })).toContainText('Seats in Review A');
});
for (const separate of [false, true]) test(`B2 saved custom grouping draws paired bars (${separate ? 'main split sequence' : 'isolated report steps'})`, async ({ page }) => {
  await start(page);
  if (separate) await split(page); // The evaluation's main sequence includes the separate run.
  await page.getByRole('region', { name: 'Seats by bloc' }).getByRole('button', { name: 'Edit blocs', exact: true }).click();
  const editor = page.getByRole('complementary', { name: 'Edit blocs' });
  await editor.getByRole('button', { name: /^New Hope, 4 seats/ }).click();
  await editor.locator('.bp-card').first().getByRole('button', { name: 'Move here' }).click();
  const blocName = editor.getByRole('textbox', { name: 'Bloc name', exact: true }).first();
  await blocName.fill('Review coalition'); await blocName.press('Enter');
  await page.keyboard.press('Escape');
  await save(page);
  await page.getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = page.getByRole('region', { name: 'List details' }).getByLabel('Votes', { exact: true });
  await votes.fill('1300000'); await votes.press('Enter'); await page.keyboard.press('Escape');
  await expect(page.locator('.session')).toContainText(separate ? '(▲ +2)' : '(▲ +5)');
  if(!separate){await expect(page.locator('.session')).toContainText('1 change from the official result');await expect(page.locator('.session')).not.toContainText('Review coalition');}
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  await expect(page.locator('.cmp')).not.toContainText('no counterpart in');
  // the reference and the scenario side by side, each with its blocs
  await expect(page.locator('.cmp-card .majority-context')).toHaveCount(2);
  await expect(page.locator('.cmp-card[data-role="other"] .majority-context')).toContainText(`${separate ? 66 : 68} / 120`);
  await expect(page.locator('.cmp-card[data-role="main"] .majority-context')).toContainText(`${separate ? 68 : 72} / 120`);
});
test('B5 prose commits are individually undoable and leave coalition selection alone', async ({ page }) => {
  await start(page);
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  const choice = page.locator('.coal-choice').first();
  await choice.getByRole('button', { name: 'In', exact: true }).click();
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  const description = page.getByRole('textbox', { name: 'Description', exact: true });
  await description.fill('Review description');
  await description.press('Tab'); // blur commits once, regardless of keystrokes
  // U7: author metadata is saveable and undoable, without factual markers/history.
  await expect(page.locator('.scn-form .edit-marker')).toHaveCount(0);
  await expect(page.locator('.scn-save')).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Undo: Scenario description changed', exact: true })).toBeVisible();
  await expect(page.locator('.session')).toContainText('No changes');
  await page.locator('.band').getByRole('button', { name: 'Undo: Scenario description changed', exact: true }).click();
  await expect(description).toHaveValue('');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await expect(choice.getByRole('button', { name: 'In', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await description.fill('Second description'); await description.press('Enter');
  await page.locator('.band').getByRole('button', { name: 'Undo: Scenario description changed', exact: true }).click();
  await expect(description).toHaveValue('');
});

for (const lang of ['en', 'he']) for (const theme of ['light', 'dark']) for (const phone of [false, true]) {
  test(`saved reference matrix ${lang} ${theme} ${phone ? 'phone' : 'desktop'}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: phone, hasTouch: phone });
    const page = await context.newPage();
    await start(page, lang, theme);
    const he = lang === 'he';
    await split(page, he); await save(page, he);
    await expect(page.locator('.lb-group-comparison')).toContainText(he ? 'בתרחיש Review A 4' : 'in Review A 4');
    await expect(page.locator('.session .scn-name')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const shot = `.backup-scratch/reference-repairs/${lang}-${theme}-${phone ? 'phone' : 'desktop'}`;
    await page.screenshot({ path: `${shot}.png` });
    await page.screenshot({ path: `${shot}-full.png`, fullPage: true });
    await context.close();
  });
}
