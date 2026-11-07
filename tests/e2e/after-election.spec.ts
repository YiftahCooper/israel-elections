import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

test('history, split recommendations, direct elections and next-election navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k24');
  await page.locator('.band .election-about > summary').click();
  await page.getByRole('button', { name: 'Government & term →', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'After the election', exact: true })).toHaveAttribute('aria-selected', 'true');
  const history = page.locator('.after-election');
  await expect(history).toContainText('Government 36');
  await expect(page.locator('.change-summary')).toHaveCount(0);
  await expect(history.locator('.after-round')).toHaveCount(2);
  await history.getByText('Lists & recommendations', { exact: true }).nth(1).click();
  await expect(history.getByRole('cell', { name: /^Yair Lapid/ }).first()).toBeVisible();
  await history.getByRole('button', { name: '→ Next election' }).click();
  await expect(history).toHaveAttribute('data-election', 'k25');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k14');
  await expect(history).toContainText('PM elected directly');
  await expect(history.locator('.after-round')).toHaveCount(0);
  await history.getByRole('button', { name: /Next election/ }).click();
  await expect(history).toHaveAttribute('data-election', 'k15');
  await expect(history).toContainText('2001-02-06');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k1');
  await expect(history).toContainText('Not documented');
  await expect(history).toContainText('Government 1');
  await page.getByRole('button', { name: 'Sources & research coverage' }).click();
  await expect(page.locator('.after-sources')).toContainText('Pending corroboration');
});

test('history remains official after editing votes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: 'After the election', exact: true }).click();
  const original = await page.locator('.after-election').textContent();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = page.getByRole('region', { name: 'List details' }).getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1200000'); await votes.press('Enter');
  await page.getByRole('tab', { name: 'After the election', exact: true }).click();
  await expect(page.locator('.after-election')).toHaveText(original!);
  expect(await page.locator('.app').evaluate(el => (el as HTMLElement).style.getPropertyValue('--scenario-color'))).toBe('');
});
