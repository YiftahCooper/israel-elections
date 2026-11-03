// The "definition of success" sequence from the product specification (§16), run in a real browser
// against the 2022 election. Each step asserts the engine-backed result, not just that a control exists.
import { expect, test, type Page } from '@playwright/test';

const seatsOf = async (page: Page, name: string) => {
  const card = page.locator('.card', { has: page.locator('.name', { hasText: new RegExp(`^${name}$`) }) });
  return Number((await card.locator('.seats').innerText()).split('\n')[0]);
};

test('2022: merge, add voters, drop agreement, push Balad over, find Ra’am’s next seat, compare, share', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'Advanced' }).click();
  await page.getByRole('button', { name: '2022 · 25th' }).click();
  await expect(page.locator('.card .name', { hasText: 'Yesh Atid' })).toBeVisible();
  expect(await seatsOf(page, 'Likud')).toBe(32);

  // 1–2. Merge Labor and Meretz into one list with a combined (alternating) candidate list
  await page.getByRole('tab', { name: /Mergers, splits/ }).click();
  await page.getByRole('checkbox', { name: /^Labor/ }).check();
  await page.getByRole('checkbox', { name: /^Meretz/ }).check();
  await page.getByLabel('Merged list name').fill('Labor–Meretz');
  await page.getByRole('button', { name: 'Merge', exact: true }).click();
  await expect(page.locator('.card .name', { hasText: 'Labor–Meretz' })).toBeVisible();
  const merged = await seatsOf(page, 'Labor–Meretz');
  expect(merged).toBeGreaterThanOrEqual(8);

  // 3. 200,000 additional voters for Arab lists (custom split)
  await page.getByRole('tab', { name: 'Turnout model' }).click();
  await page.getByLabel('Electorate', { exact: true }).fill('400000');
  await page.getByLabel('Electorate', { exact: true }).press('Enter');
  await page.getByLabel('Current turnout %').fill('50');
  await page.getByLabel('Hypothetical turnout %').fill('100');
  await page.getByLabel('Invalid-ballot rate % (of new voters)').fill('0');
  const shares = page.getByLabel('Share %');
  const rows = page.locator('tr', { has: shares });
  for (const [list, pct] of [["Ra'am", '40'], ["Hadash–Ta'al", '30'], ['Balad', '30']] as const) {
    await rows.filter({ hasText: list }).getByLabel('Share %').fill(pct);
  }
  await page.getByRole('button', { name: 'Add these voters' }).click();
  await expect(page.locator('.tile', { hasText: 'Valid votes' }).locator('.v')).toHaveText('4,964,742');

  // 4. Remove the Likud–Religious Zionism agreement
  await page.getByRole('tab', { name: /Mergers, splits/ }).click();
  await page.locator('li.cand', { hasText: 'Likud ⇄ Religious Zionism' }).getByRole('button', { name: 'Remove agreement' }).click();
  await expect(page.locator('li.cand', { hasText: 'Likud ⇄ Religious Zionism' })).toHaveCount(0);

  // 5. Balad up to the threshold: exact minimum, applied
  await page.locator('.card', { hasText: 'Balad' }).click();
  // (if the added voters already carried Balad over, the tool correctly offers no "minimum" button)
  const minBtn = page.getByRole('button', { name: 'Minimum to pass threshold' });
  if (await minBtn.count()) {
    await minBtn.click();
    await expect(page.locator('.callout', { hasText: 'more votes' })).toBeVisible();
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
  }
  await expect(page.locator('.card', { hasText: 'Balad' }).locator('.chip.no', { hasText: 'Below threshold' })).toHaveCount(0);

  // 6. How many more votes does Ra'am need for its next seat?
  await page.locator('.card', { hasText: "Ra'am" }).first().click();
  await page.getByRole('button', { name: /Votes for seat \d+/ }).click();
  await expect(page.locator('.callout', { hasText: 'more votes' })).toBeVisible();
  await expect(page.locator('.callout', { hasText: 'the result does not change' })).toBeVisible();

  // 7–9. The chamber still has exactly 120 seats; compare with history; candidates entering/leaving listed
  await expect(page.locator('.chamber circle.seat')).toHaveCount(120);
  await page.getByRole('tab', { name: 'Compare' }).click();
  await expect(page.getByText(/Entering the Knesset \(\d+\)/)).toBeVisible();
  await expect(page.getByText(/Leaving the Knesset \(\d+\)/)).toBeVisible();

  // 10. Save and share; the share link replays to the same result
  await page.getByPlaceholder('Untitled scenario').fill('Spec success path');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: /Scenarios/ }).click();
  await page.getByRole('button', { name: 'Create share link' }).click();
  const link = await page.getByLabel('Share link').inputValue();
  expect(link).toContain('#s=');
  const before = await page.locator('.tile', { hasText: 'Valid votes' }).locator('.v').innerText();
  const p2 = await page.context().newPage();
  await p2.goto(link);
  await p2.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(p2.locator('.tile', { hasText: 'Valid votes' }).locator('.v')).toHaveText(before);
  expect(errors).toEqual([]);
});
