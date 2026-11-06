import { test, expect, type Page } from '@playwright/test';
async function setup(page: Page, lang = 'en', theme = 'light', width = 1500, election = 'k26') {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(({ lang, theme }) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, theme, level: 'standard', hintDismissed: true })), { lang, theme });
  await page.goto('/');
  if (election !== 'k26') {
    await page.locator('.election-navigation .choice-trigger').click();
    await page.locator(`[data-choice-value="${election}"]`).click();
    await expect(page.locator('.election-navigation .choice-trigger')).toHaveAttribute('data-value', election);
  }
  await page.getByRole('tab', { name: lang === 'en' ? 'Scenarios' : 'תרחישים', exact: true }).click();
}
async function name(page: Page, value: string, lang = 'en') {
  const field = page.getByRole('textbox', { name: lang === 'en' ? 'Name' : 'שם', exact: true });
  await field.fill(value); await field.press('Enter');
}
async function edit(page: Page, lang = 'en') {
  const field = page.getByRole('textbox', { name: lang === 'en' ? 'Description' : 'תיאור', exact: true });
  await field.fill('New work'); await field.press('Tab');
}
for (const lang of ['en', 'he']) test(`save edit reopen and resume draft ${lang}`, async ({ page }) => {
  await setup(page, lang);
  await name(page, 'Trial', lang); await page.locator('.scn-save').click(); await edit(page, lang);
  await expect(page.locator('.scn-card .scn-title')).toContainText('Trial *');
  await expect(page.locator('.scn-title').getByRole('img', { name: lang === 'en' ? 'unsaved changes' : 'שינויים שלא נשמרו' })).toBeVisible();
  await expect(page.locator('.band .scenario-switcher .choice-current')).toContainText('Trial *');
  await page.locator('.scn-current').getByRole('button', { name: lang === 'en' ? 'Reopen saved version' : 'פתיחת הגרסה השמורה', exact: true }).click();
  await expect(page.getByRole('textbox', { name: lang === 'en' ? 'Description' : 'תיאור', exact: true })).toHaveValue('');
  await expect(page.locator('.scn-card .scn-title')).not.toContainText('*');
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await page.locator('.choice-option').filter({ hasText: 'Trial *' }).click();
  await expect(page.getByRole('textbox', { name: lang === 'en' ? 'Description' : 'תיאור', exact: true })).toHaveValue('New work');
  // Undo/redo still belongs to the resumed draft.
  await page.keyboard.press('Control+z');
  await expect(page.getByRole('textbox', { name: lang === 'en' ? 'Description' : 'תיאור', exact: true })).toHaveValue('');
  await page.keyboard.press('Control+y');
  await expect(page.getByRole('textbox', { name: lang === 'en' ? 'Description' : 'תיאור', exact: true })).toHaveValue('New work');
});
for (const lang of ['en', 'he']) for (const choice of ['Overwrite', 'Save as copy', 'Choose another name']) test(`duplicate name: ${choice} ${lang}`, async ({ page }) => {
  await setup(page, lang); await name(page, 'Trial', lang); await page.locator('.scn-save').click(); await edit(page, lang);
  await page.locator('.scn-current').getByRole('button', { name: lang === 'en' ? 'Save as…' : 'שמירה בשם…', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: lang === 'en' ? 'Name already exists' : 'השם כבר קיים', exact: true });
  const label = lang === 'en' ? choice : { Overwrite: 'החלפה', 'Save as copy': 'שמירה כעותק', 'Choose another name': 'בחירת שם אחר' }[choice];
  await dialog.getByRole('button', { name: label, exact: choice !== 'Save as copy' }).click();
  if (choice === 'Choose another name') {
    const naming = page.getByRole('dialog', { name: lang === 'en' ? 'Save as…' : 'שמירה בשם…', exact: true });
    await naming.getByRole('textbox').fill('Custom');
    await naming.getByRole('button', { name: lang === 'en' ? 'Save' : 'שמירה', exact: true }).click();
  }
  await expect(page.locator('.scn-card')).toHaveCount(choice === 'Overwrite' ? 1 : 2);
  await expect(page.locator('.scn-save')).toHaveText(lang === 'en' ? 'Saved' : 'נשמר');
  if (choice === 'Save as copy') await expect(page.locator('.scn-card').first()).toContainText('Trial (1)');
  if (choice === 'Choose another name') await expect(page.locator('.scn-card').first()).toContainText('Custom');
});
for (const lang of ['en', 'he']) for (const theme of ['light', 'dark']) for (const [width, election] of [[1500, 'k26'], [1024, 'k25'], [390, 'k1']] as const) {
  test(`scenario visual ${lang} ${theme} ${width} ${election}`, async ({ page }) => {
    await setup(page, lang, theme, width, election); await name(page, 'Trial', lang); await page.locator('.scn-save').click(); await edit(page, lang);
    await expect(page.locator('.scn-card .scn-title')).toContainText('Trial *');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.backup-scratch/u4/${lang}-${theme}-${width}-${election}.png`, fullPage: true });
  });
}
