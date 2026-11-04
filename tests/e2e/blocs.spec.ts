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

test('a joint list can run as separate lists, with the vote shares stated as an assumption', async ({ page }) => {
  await start(page, 'standard');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button').filter({ has: page.getByText('United Torah Judaism', { exact: true }) }).click();
  const details = page.getByRole('region', { name: 'List details' });
  await expect(details.getByText('Parties on this joint list')).toBeVisible();
  await details.getByText('Run as separate lists…').click();
  await expect(details.getByText(/the shares below are an assumption/)).toBeVisible();
  await details.getByRole('button', { name: 'Run as 2 separate lists' }).click();
  const lists = page.getByRole('region', { name: 'Lists' });
  await expect(lists.getByRole('button').filter({ has: page.getByText('Agudat Yisrael', { exact: true }) })).toBeVisible();
  await expect(lists.getByRole('button').filter({ has: page.getByText('Degel HaTorah', { exact: true }) })).toContainText('Below threshold');
  await page.getByRole('button', { name: /Undo/ }).click();
  await expect(lists.getByRole('button').filter({ has: page.getByText('United Torah Judaism', { exact: true }) })).toBeVisible();
});
