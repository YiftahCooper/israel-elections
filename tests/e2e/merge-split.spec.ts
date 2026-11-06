// Merge & split screen audit (5 Nov): the preview and the record of applied changes compare a split once with all its
// parts, the page stays put after applying, split vote shares are explicit and editable, and each era's agreement rule shows.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', election = 'k26', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
  await page.locator('#tab-structure').click();
}
const panel = (page: Page) => page.locator('#analysis-panel');
const task = (page: Page, i: number) => page.locator('.st-head > .seg button').nth(i).click();

test('a plain split is compared once with the list it came from, not once per part', async ({ page }) => {
  await start(page, 'en', 'k25');
  await task(page, 1);
  await panel(page).getByRole('group', { name: 'List' }).getByRole('button', { name: 'Likud', exact: true }).click();
  const rows = panel(page).locator('.st-preview .st-rows li');
  const split = rows.filter({ hasText: 'Likud A' });
  await expect(split).toHaveCount(1);
  await expect(split).toContainText('Likud B');
  // 32 seats before, A + B after: the net change is a couple of seats, never −17 for each half
  const d = Number((await split.locator('.cmp-d').innerText()).replace(/[▲▼\s]/g, '').replace('−', '-'));
  expect(Math.abs(d)).toBeLessThan(5);
});

test('split vote shares are stated, editable and conserve the list’s votes; parts get distinguishable colours', async ({ page }) => {
  await start(page);
  await task(page, 1);
  await panel(page).getByRole('group', { name: 'List' }).getByRole('button', { name: 'United Torah Judaism', exact: true }).click();
  const share = (name: string) => panel(page).getByLabel(`Vote share of ${name} (%)`);
  await expect(share('Degel HaTorah')).toBeVisible();
  const segments = panel(page).locator('.st-sharebar i');
  await expect(segments).toHaveCount(3);
  const colours = await segments.evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  expect(new Set(colours).size).toBe(3);
  const total = async () => (await panel(page).locator('.st-share .tabnum').allInnerTexts()).reduce((t, v) => t + Number(v.replace(/[^\d]/g, '')), 0);
  const before = await total();
  await share('Degel HaTorah').fill('50');
  await share('Agudat Yisrael').fill('50');
  await share('Homat Torat Yisrael').fill('0');
  await expect(panel(page).locator('.st-share .tabnum').last()).toHaveText('0 votes');
  expect(await total()).toBe(before);
  await expect(panel(page).getByRole('button', { name: 'Reset shares' })).toBeVisible();
});

test('applying a merge keeps the page and records it; a second merge works too', async ({ page }) => {
  await start(page);
  const pick = (name: string) => panel(page).getByRole('group', { name: 'Lists' }).getByRole('button', { name, exact: true }).click();
  await pick('Likud'); await pick('Shas');
  await panel(page).getByRole('button', { name: 'Merge 2 lists' }).click();
  await expect(page.locator('#tab-structure')).toHaveAttribute('aria-selected', 'true');
  const applied = page.locator('#st-applied');
  await expect(applied).toContainText('Likud–Shas');
  await pick('Ra\'am'); await pick('Joint List');
  await panel(page).getByRole('button', { name: 'Merge 2 lists' }).click();
  await expect(applied.locator('.st-rows li')).toHaveCount(2);
  await expect(page.locator('.toast-error')).toHaveCount(0);
  // each resulting list opens on the Overview
  await applied.getByRole('button', { name: /Likud–Shas/ }).click();
  await expect(page.locator('#tab-board')).toHaveAttribute('aria-selected', 'true');
});

test('the task tabs stay in place when switching to agreements, and each era states its agreement rule', async ({ page }) => {
  await start(page, 'en', 'k1');
  const tabs = page.locator('.st-head > .seg');
  const y0 = (await tabs.boundingBox())!.y;
  await task(page, 3);
  expect((await tabs.boundingBox())!.y).toBe(y0);
  await expect(panel(page).locator('.st-rule')).toHaveText('Rule: Pairs of lists · each must win a whole-quota seat');
  // an agreement with no effect says so once (its chip), not again in a second line
  const dead = panel(page).locator('.st-agreements li').filter({ has: page.locator('.chip.no') }).first();
  await expect(dead.locator('.st-effect')).toHaveCount(0);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k12');
  await expect(panel(page).locator('.st-rule')).toHaveText('Rule: Pairs of lists · both must pass the 1% threshold');
});

for (const lang of ['en', 'he'] as const) test(`no sideways scroll and still sub-tabs on a phone: ${lang}`, async ({ page }) => {
  await start(page, lang, 'k26', 390);
  const tabs = page.locator('.st-head > .seg');
  const y0 = (await tabs.boundingBox())!.y;
  for (const i of [0, 1, 2, 3, 0]) {
    await task(page, i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    // the sub-tabs never move under the pointer, including to and from Surplus agreements
    expect((await tabs.boundingBox())!.y).toBe(y0);
  }
});

test('the "All lists" toggle is a chip aligned with the list chips', async ({ page }) => {
  await start(page);
  const more = panel(page).getByRole('button', { name: /^All \d+ lists$/ });
  const [chip, box] = [await panel(page).locator('.chip.coal').first().boundingBox(), await more.boundingBox()];
  expect(box!.x).toBe(chip!.x);
  expect(box!.height).toBe(chip!.height);
  await expect(more.locator('svg')).toHaveCount(1);
  await more.click();
  await expect(more).toHaveCount(0);
});
