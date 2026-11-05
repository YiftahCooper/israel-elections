import { expect, test } from '@playwright/test';

for (const lang of ['en', 'he']) test(`tools keep concise labels and reveal assumptions on demand: ${lang}`, async ({ page }) => {
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  const panel = page.locator('#analysis-panel');
  await page.locator('#tab-structure').click();
  const mergeInfo = panel.getByRole('button', { name: lang === 'en' ? 'Merge assumptions' : 'הנחות האיחוד', exact: true });
  await mergeInfo.click();
  await expect(page.getByRole('tooltip')).toContainText(lang === 'en' ? 'surplus agreements are dropped' : 'הסכמי העודפים של חברותיה מבוטלים');
  await page.keyboard.press('Escape');
  await page.locator('#tab-coal').click();
  await panel.getByRole('button', { name: lang === 'en' ? 'Coalition assumptions' : 'הנחות הקואליציה', exact: true }).click();
  await expect(page.getByRole('tooltip')).toContainText(lang === 'en' ? 'political feasibility' : 'הערכה פוליטית');
  await page.keyboard.press('Escape');
  await page.locator('#tab-turnout').click();
  await panel.getByRole('button', { name: lang === 'en' ? 'Hypothetical modelling' : 'מודל היפותטי', exact: true }).click();
  await expect(page.getByRole('tooltip')).toContainText(lang === 'en' ? 'not individual voters' : 'לא מצביעים יחידים');
});

for (const lang of ['en', 'he']) test(`what-if separates explanation from the expandable result: ${lang}`, async ({ page }) => {
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/'); await page.locator('#tab-whatif').click();
  const row = page.locator('.wi-row').filter({ hasText: lang === 'en' ? 'Pure proportional representation' : 'ייצוג יחסי טהור' });
  await row.getByRole('button', { name: lang === 'en' ? 'Assumptions: Pure proportional representation' : 'הנחות: ייצוג יחסי טהור', exact: true }).click();
  await expect(page.getByRole('tooltip')).toContainText(lang === 'en' ? 'Sainte-Laguë' : 'סנט-לגה');
  await page.keyboard.press('Escape');
  await expect(row).toContainText(lang === 'en' ? 'Experimental' : 'ניסיוני');
  await row.locator('.wi-q').click();
  await expect(row.locator('.wi-preview')).toBeVisible();
  await expect(row.locator('.wi-q')).toHaveAttribute('aria-expanded', 'true');
});

test('Hebrew sensitivity ranges and majority counts read left to right', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'he', level: 'expert', hintDismissed: true })));
  await page.goto('/'); await page.locator('#tab-sens').click();
  const panel = page.locator('#analysis-panel');
  const from = await panel.getByRole('textbox', { name: 'מ', exact: true }).boundingBox();
  const to = await panel.getByRole('textbox', { name: 'עד', exact: true }).boundingBox();
  expect(from!.x).toBeLessThan(to!.x);
  const lo = await panel.getByRole('textbox', { name: 'מ-%', exact: true }).boundingBox();
  const hi = await panel.getByRole('textbox', { name: 'עד %', exact: true }).boundingBox();
  expect(lo!.x).toBeLessThan(hi!.x);
  await expect(panel.locator('.row > .small > bdi[dir="ltr"]')).toHaveText('53 / 61');
});
