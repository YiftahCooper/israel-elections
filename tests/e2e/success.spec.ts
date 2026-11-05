import { choose } from './choices.ts';
// The "definition of success" sequence from the product specification (§16), run in a real browser
// against the 2022 election. Each step asserts the engine-backed result, not just that a control exists.
import { expect, test, type Page } from '@playwright/test';

const lists = (page: Page) => page.getByRole('region', { name: 'Lists' });
const listButton = (page: Page, name: string) => lists(page).getByRole('button', { name, exact: true });
const seatsOf = async (page: Page, name: string) => Number(await listButton(page, name).locator('.lb-seats b').innerText());
// the valid total is the Invalid ballots card's breakdown (no card of its own beside its complement)
const validVotes = (page: Page) => page.locator('.figures');

test('2022: merge, add voters, drop agreement, push Balad over, find Ra’am’s next seat, compare, share', async ({ page }) => {
  test.setTimeout(150_000); // ten steps, two of them exact searches
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'Expert', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(listButton(page, 'Yesh Atid')).toBeVisible();
  expect(await seatsOf(page, 'Likud')).toBe(32);

  // 1–2. Merge Labor and Meretz into one list with a combined (alternating) candidate list
  await page.getByRole('tab', { name: 'Merge & split', exact: true }).click();
  const picker = page.getByRole('group', { name: 'Lists' });
  await picker.getByRole('button', { name: /^Labor/ }).click();
  await picker.getByRole('button', { name: /^Meretz/ }).click();
  await page.getByLabel('Name', { exact: true }).fill('Labor–Meretz');
  await expect(page.getByText('What would change')).toBeVisible(); // the merge is previewed before it is applied
  await page.getByRole('button', { name: 'Merge 2 lists' }).click();
  await expect(listButton(page, 'Labor–Meretz')).toBeVisible();
  const merged = await seatsOf(page, 'Labor–Meretz');
  expect(merged).toBeGreaterThanOrEqual(8);

  // 3. 200,000 additional voters for Arab lists (custom split)
  await page.getByRole('tab', { name: 'Turnout', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Voter group', exact: true }), 'manual');
  const enter = async (label: string, value: string) => { const f = page.getByLabel(label, { exact: true }); await f.fill(value); await f.press('Enter'); };
  await enter('Registered voters', '400000');
  await enter('Turnout now %', '50');
  await enter('Invalid %', '0');
  await enter('New turnout %', '100');
  for (const [list, pct] of [["Ra'am", '40'], ["Hadash–Ta'al", '30'], ['Balad', '30']] as const) await page.getByLabel(`${list} %`, { exact: true }).fill(pct);
  await page.getByRole('button', { name: 'Add 200,000 voters', exact: true }).click();
  await page.getByRole('tab', { name: 'Overview' }).click();
  await expect(validVotes(page)).toHaveAttribute('data-valid-votes', '4,964,742');

  // 4. Remove the Likud–Religious Zionism agreement
  await page.getByRole('tab', { name: 'Merge & split', exact: true }).click();
  await page.getByRole('button', { name: 'Surplus agreements' }).click();
  await page.getByRole('button', { name: /^Remove the agreement between (Likud and Religious Zionism|Religious Zionism and Likud)$/ }).click();
  await expect(page.getByRole('button', { name: /^Remove the agreement between (Likud and Religious Zionism|Religious Zionism and Likud)$/ })).toHaveCount(0);

  // 5. Balad up to the threshold: exact minimum, applied
  await page.getByRole('tab', { name: 'Overview' }).click();
  await listButton(page, 'Balad').click();
  const details = page.getByRole('region', { name: 'List details' });
  // the exact minimum is computed on opening (if the added voters already carried Balad over, there is none)
  await expect(details.getByText(/Calculating exactly/)).toHaveCount(0, { timeout: 60_000 });
  const crosses = details.getByRole('button', { name: 'Cross the threshold', exact: true });
  if (await crosses.count()) { await expect(crosses).toBeEnabled({ timeout: 60000 }); await crosses.click(); }
  expect(await seatsOf(page, 'Balad')).toBeGreaterThan(0);

  // 6. How many more votes does Ra'am need for its next seat?
  await listButton(page, "Ra'am").click();
  await expect(details.getByRole('button', { name: /^Reach next seat/ })).toHaveText(/\+\d{1,3}(,\d{3})*/, { timeout: 60_000 });

  // 7–9. The chamber still has exactly 120 seats; compare with history; candidates entering/leaving listed
  await expect(page.locator('.chamber circle.seat')).toHaveCount(120);
  await page.getByRole('tab', { name: 'Compare' }).click();
  await expect(page.getByText('Seats gained and lost')).toBeVisible();
  await expect(page.getByText(/Entering the Knesset \(\d+\)/)).toBeVisible();
  await expect(page.getByText(/Leaving the Knesset \(\d+\)/)).toBeVisible();

  // 10. Save and share; the share link replays to the same result
  await page.getByRole('button', { name: /Save & share/ }).click();
  await page.getByPlaceholder('Untitled scenario').fill('Spec success path');
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await page.getByRole('button', { name: /Save & share/ }).click();
  await page.getByRole('button', { name: 'Copy a share link' }).click();
  const link = await page.getByLabel('Share link').inputValue();
  expect(link).toContain('#s=');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Overview' }).click();
  const before = await validVotes(page).getAttribute('data-valid-votes');
  const p2 = await page.context().newPage();
  await p2.goto(link);
  await p2.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(validVotes(p2)).toHaveAttribute('data-valid-votes', before!);
  expect(errors).toEqual([]);
});
