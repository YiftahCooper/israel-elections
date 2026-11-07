import { expect, test } from '@playwright/test';
// Unsaved work survives a reload of the tab, with undo (owner decision 2026-11-04).
test('a reload restores unsaved edits and their undo', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', theme: 'light', level: 'standard', hintDismissed: true })); } });
  await page.goto('/');
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1200000'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,200,000');
  await page.waitForTimeout(400); // the workspace is written a moment after the last change
  await page.reload();
  await expect(page.locator('.band .election-status')).toContainText('*');
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  await expect(page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true })).toHaveValue('1,200,000');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true })).toHaveValue('1,167,591');
});
