// The line of changes on a phone: with no changes it is one line centred in its usual height (no blank strip under
// "No changes"), and the first change fills the second line without moving anything.
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, lang: 'en' | 'he') {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((lang) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional', comparison: 'reference', jointSeats: 'off' }));
  }, lang);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}

for (const lang of ['en', 'he'] as const) test(`phone line of changes: no blank strip, no jump at the first change (${lang})`, async ({ page }) => {
  await start(page, lang);
  const line = page.locator('.session');
  await expect(line).toHaveClass(/idle/);
  const idle = (await line.boundingBox())!;
  const label = (await line.locator('> b').boundingBox())!;
  // the label sits in the middle of the line, not on its top half
  expect(Math.abs((label.y + label.height / 2) - (idle.y + idle.height / 2))).toBeLessThanOrEqual(2);
  await expect(line.locator('.session-changes')).toBeHidden();

  await page.locator('.lb-row').first().click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: lang === 'en' ? 'Votes' : 'קולות', exact: true });
  const v = Number((await votes.inputValue()).replace(/[^0-9]/g, ''));
  await votes.fill(String(v + 80_000)); await votes.press('Enter');
  await expect(line).not.toHaveClass(/idle/);
  await expect(line.locator('.session-changes')).toBeVisible();
  expect((await line.boundingBox())!.height).toBe(idle.height);
});
