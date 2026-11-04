// Blocs per election and constituent parties (decision 0087).
import { expect, test, type Page } from '@playwright/test';

const start = async (page: Page, level: string) => {
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang: 'en', hintDismissed: true, level }));
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Election' }).selectOption('k25');
  await expect(page.getByRole('group', { name: 'Grouping' })).toBeVisible();
};
const legendCount = (page: Page, bloc: string) => page.locator('.legend').filter({ hasText: bloc }).locator('span.row', { hasText: bloc }).locator('b');

test('an election opens on its first government, and other sourced groupings can be chosen', async ({ page }) => {
  await start(page, 'simple');
  const grouping = page.getByRole('group', { name: 'Grouping' });
  await expect(grouping.getByRole('button', { name: /37th government/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(legendCount(page, 'Coalition')).toHaveText('64');
  await grouping.getByRole('button', { name: 'Pre-election blocs' }).click();
  await expect(grouping.getByRole('button', { name: 'Pre-election blocs' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Edit blocs' })).toHaveCount(0); // editing is a Standard tool
});

test('moving one party of a joint list to another bloc moves only its members’ seats', async ({ page }) => {
  await start(page, 'standard');
  const before = Number(await legendCount(page, 'Coalition').innerText());
  await page.getByRole('button', { name: 'Edit blocs' }).click();
  await page.getByRole('combobox', { name: 'Bloc of New Hope' }).selectOption({ label: 'Coalition' });
  const after = Number(await legendCount(page, 'Coalition').innerText());
  expect(after).toBeGreaterThan(before);
  expect(after - before).toBeLessThan(12); // only New Hope's members, not all of National Unity
  await expect(page.getByText('Your grouping', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Grouping' }).getByRole('button', { pressed: true })).toHaveCount(0);
  await page.getByRole('group', { name: 'Grouping' }).getByRole('button', { name: /37th government/ }).click();
  await expect(legendCount(page, 'Coalition')).toHaveText(String(before));
});
