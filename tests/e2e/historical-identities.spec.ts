import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

for (const lang of ['en', 'he']) test(`corrected historical identities open their list and candidate details (${lang})`, async ({ page }) => {
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang })), lang);
  await page.goto('/');
  for (const [election, id, seats] of [['k2', '2-ו', 8], ['k9', '9-ימ', 1], ['k15', '15-יט', 4]] as const) {
    await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
    const row = page.locator(`button[aria-describedby="lbd-${id}"]`);
    await expect(row.locator('.lb-seats')).toHaveText(String(seats));
    await row.click();
    await expect(row).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.sp-body')).toBeVisible();
    await expect(page.locator('.sp-body')).not.toBeEmpty();
  }
});
