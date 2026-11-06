import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';
for (const lang of ['en', 'he'] as const) test(`${lang}: joint-list default is personal, unedited, persistent and individually overridable`, async ({ page }) => {
  await page.addInitScript(lang => {
    if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
    if (!localStorage.getItem('split-test-init')) {
      localStorage.setItem('israel-elections:preferences', JSON.stringify({ jointSeats: 'on', comparison: 'reference', voteSource: 'proportional' }));
      localStorage.setItem('split-test-init', 'yes');
    }
  }, lang);
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), 'k25');
  const row = page.getByRole('button', { name: lang === 'en' ? 'Religious Zionism' : 'הציונות הדתית', exact: true });
  await row.click();
  const panel = page.locator('.side-panel');
  const toggle = panel.getByRole('checkbox', { name: lang === 'en' ? 'Count seats by party' : 'ספירת מנדטים לפי מפלגה', exact: true });
  await expect(toggle).toBeChecked();
  await expect(page.locator('.session')).toHaveClass(/idle/);
  await expect(panel.locator('[data-marker-path="factionSplits"] .edit-marker')).toHaveCount(0);
  // The chamber has the constituent party factions rather than the joint list alone.
  const holderNames = await page.getByRole('group', { name: lang === 'en' ? 'Lists in the Knesset' : 'הרשימות בכנסת' }).textContent();
  expect(holderNames).toContain(lang === 'en' ? 'Otzma' : 'עוצמה');
  const rememberedDefault = panel.getByRole('checkbox', { name: lang === 'en' ? 'Use by default for joint lists' : 'ברירת מחדל לרשימות משותפות' });
  await rememberedDefault.uncheck();
  await expect(toggle).not.toBeChecked();
  await expect(page.locator('.session')).toHaveClass(/idle/);
  await rememberedDefault.check();
  await expect(toggle).toBeChecked();
  await expect(page.locator('.session')).toHaveClass(/idle/);
  await toggle.uncheck();
  await expect(page.locator('.session')).toHaveClass(/idle/);
  await expect(panel.locator('[data-marker-path="factionSplits"] .edit-marker')).toHaveCount(0);
  await page.waitForTimeout(350); // workspace debounce
  await page.reload();
  await row.click();
  await expect(toggle).not.toBeChecked();
  await expect(panel.getByRole('checkbox', { name: lang === 'en' ? 'Use by default for joint lists' : 'ברירת מחדל לרשימות משותפות' })).toBeChecked();
  await page.getByRole('tab', { name: lang === 'en' ? 'Rules & settings' : 'כללים והגדרות', exact: true }).click();
   await page.locator('.band').getByRole('button', { name: lang === 'en' ? 'Your settings' : 'ההגדרות שלכם', exact: true }).click();
  const setting = page.getByRole('button', { name: lang === 'en' ? 'Count joint lists’ seats by party' : 'ספירת מנדטים ברשימות משותפות לפי מפלגה', exact: true });
  await expect(setting).toHaveAttribute('data-value', 'on');
  await choose(setting, 'off');
  await expect(setting).toHaveAttribute('data-value', 'off');

});
