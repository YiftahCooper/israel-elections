import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

test('first-use choices wait for an explicit scope; keyboard and cancellation preserve the edit', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', theme: 'dark', hintDismissed: true }));
    localStorage.setItem('israel-elections:preferences', '{}');
  });
  await page.goto('/'); await page.locator('.lb-row').first().click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  const before = await votes.inputValue();
  await votes.fill('1300000'); await votes.press('Enter');
  const ask = page.getByRole('dialog', { name: 'Votes from', exact: true });
  await expect(ask).toBeVisible(); await expect(ask).toBeFocused();
  await page.keyboard.press('Enter'); await expect(ask).toBeVisible();
  await expect(ask.getByRole('button', { name: 'Always', exact: true })).toBeDisabled();
  await ask.getByRole('button', { name: 'New voters', exact: true }).click();
  await expect(votes).toHaveValue(before);
  await page.keyboard.press('Escape'); await expect(ask).toBeHidden();
  await expect(votes).toHaveValue(before); await expect(votes).toBeFocused();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await ask.getByRole('button', { name: 'New voters', exact: true }).click();
  await ask.getByRole('button', { name: 'Always', exact: true }).click();
  await expect(ask).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:preferences')!))).toEqual({ voteSource: 'new' });
});

test('opening a saved scenario asks about its comparison, persists Always, and Settings can reset it', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', theme: 'light', hintDismissed: true }));
    if (!sessionStorage.getItem('prefs-start')) { localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional' })); sessionStorage.setItem('prefs-start', '1'); }
  });
  await page.goto('/'); await page.locator('.lb-row').first().click();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await page.getByRole('button', { name: 'Save & share', exact: true }).click();
  await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
  const saved = await page.locator('.band .scenario-switcher .choice-trigger').getAttribute('data-value');
  const switcher = page.locator('.band .scenario-switcher .choice-trigger');
  await choose(switcher, 'official');
  await choose(switcher, saved!);
  const ask = page.getByRole('dialog', { name: 'Mark differences from', exact: true });
  await expect(ask).toBeVisible();
  await ask.getByRole('button', { name: 'Official result', exact: true }).click();
  await ask.getByRole('button', { name: 'Always', exact: true }).click();
  await expect(switcher).toHaveAttribute('data-value', saved!);
  await page.reload();
  await page.getByRole('tab', { name: 'Rules', exact: true }).click();
  const setting = page.getByRole('combobox', { name: 'Mark differences from', exact: true });
  await expect(setting).toHaveValue('official'); await setting.selectOption('ask');
  await expect(setting).toHaveValue('ask');
});
