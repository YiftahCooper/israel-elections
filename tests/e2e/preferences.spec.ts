import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

test('first-use choices wait for an explicit scope; keyboard and cancellation preserve the edit', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert', theme: 'dark', hintDismissed: true }));
    localStorage.setItem('israel-elections:preferences', '{}');
  });
  await page.goto('/'); await page.locator('.lb-row').first().click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  const before = await votes.inputValue();
  await votes.fill('1300000'); await votes.press('Enter');
  const ask = page.getByRole('dialog', { name: 'Votes come from', exact: true });
  await expect(ask).toBeVisible(); await expect(ask).toBeFocused();
  await page.keyboard.press('Enter'); await expect(ask).toBeVisible();
  await expect(ask.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
  await ask.getByRole('combobox').selectOption('new');
  await expect(votes).toHaveValue(before);
  await page.keyboard.press('Escape'); await expect(ask).toBeHidden();
  await expect(votes).toHaveValue(before); await expect(votes).toBeFocused();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await ask.getByRole('combobox').selectOption('new');
  await ask.getByRole('radio', { name: 'Always', exact: true }).check();
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(ask).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:preferences')!))).toEqual({ voteSource: 'new' });
});

test('opening a saved scenario asks about its comparison, persists Always, and Settings can reset it', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert', theme: 'light', hintDismissed: true }));
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
  const ask = page.getByRole('dialog', { name: 'Mark changes since', exact: true });
  await expect(ask).toBeVisible();
  await ask.getByRole('combobox').selectOption('official');
  await ask.getByRole('radio', { name: 'Always', exact: true }).check();
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(switcher).toHaveAttribute('data-value', saved!);
  await page.reload();
  await page.getByRole('tab', { name: 'Rules', exact: true }).click();
  await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
  const setting = page.getByRole('group', { name: 'Mark changes since', exact: true });
  await expect(setting.getByRole('button', { name: 'Official result', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await setting.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(setting.getByRole('button', { name: 'Ask', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

for (const scope of ['Just this once', 'For this scenario']) test(`comparison scope: ${scope}`, async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert', theme: 'light', hintDismissed: true }));
    localStorage.setItem('israel-elections:preferences', '{"voteSource":"proportional"}');
  });
  await page.goto('/'); await page.locator('.lb-row').first().click();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await page.getByRole('button', { name: 'Save & share', exact: true }).click();
  await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
  const picker = page.locator('.band .scenario-switcher .choice-trigger');
  const saved = (await picker.getAttribute('data-value'))!;
  await choose(picker, 'official'); await choose(picker, saved);
  const ask = page.locator('.source-ask');
  await expect(ask.getByRole('radio')).toHaveCount(3);
  await ask.getByRole('combobox').selectOption('reference');
  await ask.getByRole('radio', { name: scope, exact: true }).check();
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(picker).toHaveAttribute('data-value', saved);
  await choose(picker, 'official'); await choose(picker, saved);
  if (scope === 'Just this once') {
    await expect(ask).toBeVisible(); await page.keyboard.press('Escape');
    await expect(picker).toHaveAttribute('data-value', 'official');
  } else { await expect(ask).toBeHidden(); await expect(picker).toHaveAttribute('data-value', saved); }
});
