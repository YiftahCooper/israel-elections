import { expect, test } from '@playwright/test';

/** the valid total: the Invalid ballots card's breakdown (no card of its own beside its complement) */
const validVotes = (page: import('@playwright/test').Page) => page.locator('.figures');

const start = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert' })));
  await page.goto('/');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true }).click();
  return page.getByRole('region', { name: 'List details' });
};

test('reset everything keeps votes supplied by the selected donor', async ({ page }) => {
  const details = await start(page);
  const source = details.getByRole('combobox', { name: /Balance votes with/ });
  await source.selectOption('new');
  await details.getByLabel('Votes', { exact: true }).fill('0');
  await details.getByLabel('Votes', { exact: true }).press('Enter');
  const total = await validVotes(page).getAttribute('data-valid-votes');
  await source.selectOption('t:26-נף');
  await details.getByRole('button', { name: 'Restore list' }).click();
  await expect(details.getByLabel('Votes', { exact: true })).toHaveValue('524');
  await expect(validVotes(page)).toHaveAttribute('data-valid-votes', total!);
});

test('clamped and refused numeric edits display the authoritative value', async ({ page }) => {
  const details = await start(page);
  const source = details.getByRole('combobox', { name: /Balance votes with/ });
  await source.selectOption('t:26-נף');
  const votes = details.getByLabel('Votes', { exact: true });
  await votes.fill('9999999'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,168,115');
  // The donor is now empty; a second clamp leaves the prop unchanged.
  await votes.fill('9999999'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,168,115');
  await votes.press('Tab');
  await expect(votes).toHaveValue('1,168,115');
  await details.getByRole('button', { name: 'More', exact: true }).click();
  const percentage = details.getByLabel('Share of valid votes (%)');
  const old = await percentage.inputValue();
  await percentage.fill('101'); await percentage.press('Enter');
  await expect(percentage).toHaveValue(old);
  const text = details.getByLabel('Short name (English)');
  await text.fill('Edited name'); await text.press('Enter');
  await expect(text).toHaveValue('Edited name');
});

test('the split form conserves the original votes', async ({ page }) => {
  await start(page);
  const total = validVotes(page);
  const before = await total.getAttribute('data-valid-votes');
  await page.getByRole('tab', { name: 'Merge & split', exact: true }).click();
  await page.getByRole('button', { name: 'Split a list' }).click();
  await page.getByRole('group', { name: 'List' }).getByRole('button', { name: 'Likud', exact: true }).click();
  await page.getByRole('button', { name: 'Split', exact: true }).click();
  // Likud 2026 is Likud + New Hope: it splits into its parties, and the vote total is conserved
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: /^New Hope/ })).toBeVisible();
  await expect(total).toHaveAttribute('data-valid-votes', before!);
});

test('a refused decimal edit also reverts after Escape while still focused', async ({ page }) => {
  const details = await start(page);
  await details.getByRole('button', { name: 'More', exact: true }).click();
  const percentage = details.getByLabel('Share of valid votes (%)');
  const before = await percentage.inputValue();
  await percentage.fill('35');
  await percentage.press('Escape');
  await expect(percentage).toHaveValue(before);
  await percentage.fill('101');
  await percentage.press('Enter');
  await expect(percentage).toHaveValue(before);
});
