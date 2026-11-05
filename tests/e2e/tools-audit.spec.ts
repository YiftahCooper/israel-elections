// Release-candidate audit of the tool pages (area E): each test locks in one defect class that was fixed.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', election = 'k26', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const tool = (page: Page, id: string) => page.locator(`#tab-${id}`).click();
const panel = (page: Page) => page.locator('#analysis-panel');

test('a merged list keeps the first list’s colour instead of an app default', async ({ page }) => {
  await start(page);
  await tool(page, 'structure');
  const likudColour = await panel(page).getByRole('button', { name: 'Likud', exact: true }).locator('.swatch').evaluate((el) => getComputedStyle(el).backgroundColor);
  await panel(page).getByRole('button', { name: 'Likud', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Shas', exact: true }).click();
  await panel(page).getByRole('button', { name: /^Merge 2 lists/ }).click();
  const merged = page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: /Likud–Shas/ }).first();
  await expect(merged).toBeVisible();
  await tool(page, 'charts');
  await expect(panel(page).locator('.legend .swatch').first()).toHaveCSS('background-color', likudColour);
});

test('the 1949 walkthrough states the quota and threshold as that law computed them', async ({ page }) => {
  await start(page, 'en', 'k1');
  await tool(page, 'walk');
  await expect(panel(page).locator('.walk-stages button').nth(0)).toHaveText('1Threshold');
  // 1949: no percentage, but a list needed one whole quota to win any seat
  await expect(panel(page)).toContainText('No percentage threshold. A list needs one whole quota (3,592 votes');
  await panel(page).locator('.walk-stages button').nth(1).click();
  await expect(panel(page).locator('.formula')).toHaveText('quota = ⌊ 434,684 ÷ 121 ⌋ = 3,592');
});

test('a divisor method in 1949 still allocates every seat', async ({ page }) => {
  await start(page, 'en', 'k1');
  await tool(page, 'rules');
  await panel(page).getByRole('button', { name: 'Experimental' }).click();
  await panel(page).getByLabel('Remainder method', { exact: true }).selectOption('sainte-lague');
  await expect(page.getByText('Not every seat could be allocated')).toHaveCount(0);
  await tool(page, 'walk');
  // no quota stage: all 120 seats are awarded one at a time, chosen with a slider rather than 120 buttons
  await expect(panel(page).locator('.walk-stages button').filter({ hasText: 'Remainder seats (120)' })).toHaveCount(1);
  await panel(page).locator('.walk-stages button').filter({ hasText: 'Remainder seats' }).click();
  await expect(panel(page).locator('.walk-slider input')).toHaveAttribute('max', '120');
});

test('the vote sweep draws on open and redraws for a range typed in', async ({ page }) => {
  await start(page);
  await tool(page, 'sens');
  const from = panel(page).getByRole('textbox', { name: 'From', exact: true });
  const first = await from.inputValue();
  const chart = panel(page).getByRole('img', { name: 'Seats against votes' });
  await expect(chart).toContainText(first, { timeout: 60_000 });
  await from.fill('1000000'); await from.press('Enter');
  await expect(chart).toContainText('1,000,000', { timeout: 60_000 });
  await expect(chart).not.toContainText(first);
  // back to the default range, which follows the list's votes
  await panel(page).getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(from).toHaveValue(first);
  await expect(chart).toContainText(first, { timeout: 60_000 });
});

test('the sweeps refuse an empty or reversed range in place, without a result', async ({ page }) => {
  await start(page);
  await tool(page, 'sens');
  const lo = panel(page).getByRole('textbox', { name: 'From %' }), hi = panel(page).getByRole('textbox', { name: 'To %' });
  for (const [a, b] of [['5', '1'], ['3', '3'], ['-1', '2'], ['1', '101'], ['', '2']]) {
    await lo.fill(a); await lo.press('Enter'); await hi.fill(b); await hi.press('Enter');
    await expect(panel(page).getByRole('alert')).toContainText('from 0 to 100');
    await expect(panel(page).getByRole('columnheader', { name: 'Threshold above' })).toHaveCount(0);
  }
  await lo.fill('1'); await lo.press('Enter'); await hi.fill('5'); await hi.press('Enter');
  await expect(panel(page).getByRole('columnheader', { name: 'Threshold above' })).toBeVisible();
  const from = panel(page).getByRole('textbox', { name: 'From', exact: true });
  await from.fill('99999999'); await from.press('Enter');
  await expect(panel(page).getByRole('alert')).toHaveText('“To” must be above “from”.');
  await expect(panel(page).getByRole('img', { name: 'Seats against votes' })).toHaveCount(0);
});

// Owner rule (2026-11-04): Hebrew graphics read left to right like English; only text is right-to-left.
test('Hebrew charts keep the English left-to-right geometry', async ({ page }) => {
  await start(page, 'he');
  await tool(page, 'charts');
  const fig = panel(page).locator('figure').filter({ hasText: 'מרחק מאחוז החסימה' });
  const box = (await fig.locator('svg').boundingBox())!;
  const label = (await fig.locator('svg text').first().boundingBox())!;
  expect(label.x).toBeLessThan(box.x + box.width / 2);
  await tool(page, 'compare');
  await panel(page).locator('.cmp-pick').filter({ hasText: '2022' }).click();
  const figs = panel(page).locator('.cmp-chambers figure');
  await expect(figs.nth(0)).toContainText('2022'); // the earlier result is on the left, as before → after
  expect((await figs.nth(0).boundingBox())!.x).toBeLessThan((await figs.nth(1).boundingBox())!.x);
});

test('charts keep readable text on a phone', async ({ page }) => {
  await start(page, 'en', 'k26', 390);
  await tool(page, 'charts');
  const size = await panel(page).locator('figure').filter({ hasText: 'Share of votes vs share of seats' }).locator('svg text').first()
    .evaluate((el) => el.getBoundingClientRect().height);
  expect(size).toBeGreaterThan(10);
});

test('state is shown as state: the bloc in the coalition and the threshold preset in force', async ({ page }) => {
  await start(page);
  await tool(page, 'coal');
  const bloc = panel(page).getByRole('button', { name: /Netanyahu bloc/ });
  await expect(bloc).toHaveAttribute('aria-pressed', 'false');
  await bloc.click();
  await expect(bloc).toHaveAttribute('aria-pressed', 'true');
  await tool(page, 'rules');
  await expect(panel(page).getByRole('button', { name: '3.25%' })).toHaveAttribute('aria-pressed', 'true');
});

test('seat transitions read left to right in Hebrew', async ({ page }) => {
  await start(page, 'he');
  await tool(page, 'whatif');
  await panel(page).locator('.wi-q').first().click();
  await expect(panel(page).locator('.wi-preview .cmp-label bdi[dir="ltr"]').first()).toHaveText(/^\d+ → \d+$/);
});
