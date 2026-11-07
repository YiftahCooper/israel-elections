// Seat safety screen review (5 Nov 2026): each test locks in one repaired behaviour.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  await page.locator('#tab-security').click();
}
const panel = (page: Page) => page.locator('#analysis-panel');
const done = (page: Page) => expect(panel(page).getByRole('status')).toHaveCount(0, { timeout: 60_000 });

test('every row is laid out at once in its final order, and figures fill in without reordering', async ({ page }) => {
  await start(page);
  const rows = panel(page).locator('.sec-row:not(.head) .sec-name');
  // the table does not wait for the searches: all 11 seated lists of 2026 are there from the start
  await expect(rows).toHaveCount(11);
  const first = await rows.allInnerTexts();
  await done(page);
  expect(await rows.allInnerTexts()).toEqual(first);
  expect(first.slice(0, 2)).toEqual(['Likud', 'Yashar!']);
});

test('switching election while the tab is open shows the new election instead of failing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await start(page);
  await done(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(panel(page).getByRole('table', { name: 'Seat security' }).getByRole('button', { name: 'Yesh Atid', exact: true })).toBeVisible();
  await expect(panel(page).getByText('Something went wrong')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a closest call quotes the same figure as the table', async ({ page }) => {
  await start(page);
  await done(page);
  const call = panel(page).locator('.sec-call').first();
  const [, name, sign, votes] = (await call.innerText()).match(/^(.+?)\s+([+−])([\d,]+)$/)!;
  const row = panel(page).locator('.sec-row').filter({ has: page.getByRole('button', { name, exact: true }) });
  await expect(row.locator(sign === '+' ? '.sec-r' : '.sec-l')).toContainText(votes);
});

test('in Hebrew the chart reads left to right: losses, seats, gains; the list name stays at the start', async ({ page }) => {
  await start(page, 'he');
  await done(page);
  const row = panel(page).locator('.sec-row:not(.head)').first();
  const x = async (sel: string) => (await row.locator(sel).boundingBox())!.x;
  const [lose, seats, gain, name] = [await x('.sec-l'), await x('.sec-seats'), await x('.sec-r'), await x('.sec-name')];
  expect(lose).toBeLessThan(seats);
  expect(seats).toBeLessThan(gain);
  expect(gain).toBeLessThan(name);
  // the loss bar grows away from the seats (its right edge touches the seats column), the gain bar from them
  const bar = async (sel: string) => (await row.locator(`${sel} .sec-bar`).boundingBox())!;
  const lb = await bar('.sec-l'), gb = await bar('.sec-r');
  expect(lb.x + lb.width).toBeLessThanOrEqual(seats);
  expect(gb.x).toBeGreaterThanOrEqual(seats);
});

test('lists below the threshold show how far each is from it; smaller ones open on request', async ({ page }) => {
  await start(page);
  const below = panel(page).getByRole('region', { name: 'Below the threshold' });
  await expect(below.getByRole('listitem')).toHaveCount(2);
  await expect(below.getByRole('listitem').first()).toContainText(/^Reservists[\s\S]*[\d,]+ short$/);
  await expect(below.getByRole('listitem').first().getByRole('img')).toHaveAttribute('aria-label', /^[\d,]+ of [\d,]+ votes$/);
  const more = below.locator('button[aria-expanded]');
  await expect(more).toHaveText(/^\d+ smaller lists$/);
  const n = Number((await more.innerText()).match(/\d+/)![0]);
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(below.getByRole('listitem')).toHaveCount(2 + n);
  await expect(more).toHaveText('Fewer');
});

test('the vote source is named before use and switches the figures', async ({ page }) => {
  await start(page);
  await expect(panel(page).getByText('Votes from', { exact: true })).toBeVisible();
  const source = panel(page).getByRole('group', { name: 'Votes from' });
  await done(page);
  const likud = panel(page).locator('.sec-row').filter({ hasText: 'Likud' }).locator('.sec-r');
  const before = await likud.innerText();
  await source.getByRole('button', { name: 'New voters' }).click();
  await expect(source.getByRole('button', { name: 'New voters' })).toHaveAttribute('aria-pressed', 'true');
  await done(page);
  await expect(likud).not.toHaveText(before);
  // going back is instant: the first figures are remembered
  await source.getByRole('button', { name: 'Other lists' }).click();
  await expect(likud).toHaveText(before);
  await expect(panel(page).getByRole('status')).toHaveCount(0);
});
