import { expect, test } from '@playwright/test';
for (const lang of ['en', 'he'] as const) test(`changes and History follow the app language (${lang})`, async ({ page }) => {
  // Deliberately use the opposite browser locale to detect accidental ambient formatting.
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  const session = page.locator('.session');
  await expect(session).toContainText(lang === 'he' ? 'אין שינויים' : 'No changes');
  await page.locator('.lb-row').nth(6).click();
  const plus = page.locator('.side-panel').getByRole('button', { name: lang === 'he' ? /^הוספת קולות/ : /^Increase Votes/ }).first();
  for (let i = 0; i < 3; i++) await plus.click();
  await expect(session.locator('b').first()).toHaveText(lang === 'he' ? '3 שינויים מהתוצאה הרשמית' : '3 changes from the official result');
  await session.getByRole('button', { name: lang === 'he' ? 'היסטוריה · 3 שינויים' : 'History · 3 changes', exact: true }).click();
  const history = session.locator('.history');
  await expect(history.locator('li')).toHaveCount(3);
  await expect(history).toContainText(lang === 'he' ? '3 שינויים מהתוצאה הרשמית' : '3 changes from the official result');
  for (const time of await history.locator('li .tiny').allTextContents()) expect(time).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
  await expect(history).not.toContainText(/historical result|התוצאה ההיסטורית|\bedit(s)?\b/);
});
