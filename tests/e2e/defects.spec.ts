import { expect, test } from '@playwright/test';

/** the "Valid votes" figure's value */
const validVotes = (page: import('@playwright/test').Page) => page.locator('.fig').filter({ has: page.locator('.k', { hasText: /^Valid votes/ }) }).locator('.v');

const start = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert' })));
  await page.goto('/');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true }).click();
  return page.getByRole('region', { name: 'List details' });
};

test('reset everything keeps votes supplied by the selected donor', async ({ page }) => {
  const details = await start(page);
  const source = details.getByRole('combobox', { name: /balance the difference/ });
  await source.selectOption('new');
  await details.getByLabel('Votes', { exact: true }).fill('0');
  await details.getByLabel('Votes', { exact: true }).press('Enter');
  const total = await validVotes(page).innerText();
  await source.selectOption('t:26-נף');
  await details.getByRole('button', { name: 'Restore this list as it was' }).click();
  await expect(details.getByLabel('Votes', { exact: true })).toHaveValue('524');
  await expect(validVotes(page)).toHaveText(total);
});

test('clamped and refused numeric edits display the authoritative value', async ({ page }) => {
  const details = await start(page);
  const source = details.getByRole('combobox', { name: /balance the difference/ });
  await source.selectOption('t:26-נף');
  const votes = details.getByLabel('Votes', { exact: true });
  await votes.fill('9999999'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,168,113');
  // The donor is now empty; a second clamp leaves the prop unchanged.
  await votes.fill('9999999'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,168,113');
  await votes.press('Tab');
  await expect(votes).toHaveValue('1,168,113');
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
  const before = await total.innerText();
  await page.getByRole('tab', { name: 'Merge & split', exact: true }).click();
  await page.getByLabel('List to split').selectOption('26-מחל');
  await page.getByRole('button', { name: 'Split', exact: true }).click();
  await expect(total).toHaveText(before);
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud A', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud B', exact: true })).toBeVisible();
});

test('a refused decimal edit also reverts after Escape while still focused', async ({ page }) => {
  const details = await start(page);
  const percentage = details.getByLabel('Share of valid votes (%)');
  const before = await percentage.inputValue();
  await percentage.fill('35');
  await percentage.press('Escape');
  await expect(percentage).toHaveValue(before);
  await percentage.fill('101');
  await percentage.press('Enter');
  await expect(percentage).toHaveValue(before);
});
