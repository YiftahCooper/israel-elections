import { choose } from './choices.ts';
// Loading behaviour introduced for speed: tab panels outside the levels' first tabs come in
// separate chunks (fetched when the page is idle), and seat-security searches run in workers.
// Each test checks that the user still gets the same content, with an accessible loading state.
import { expect, test, type Page } from '@playwright/test';

const SETTINGS = 'israel-elections:v1';
const start = async (page: Page, settings: Record<string, unknown> = {}) => {
  await page.addInitScript(([key, value]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', '1'); } }, [SETTINGS, JSON.stringify({ lang: 'en', ...settings })]);
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true })).toBeVisible();
};
const panel = (page: Page) => page.getByRole('tabpanel');
const chunk = (name: string) => new RegExp(`/assets/${name}-[\\w-]+\\.js$`);

test('Simple fetches only the code of its own tabs, after the page is shown', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (r) => { if (r.resourceType() === 'script') scripts.push(r.url()); });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await start(page);
  // Coalitions and Sources are Simple tabs: their code is prefetched once the page is idle
  await expect.poll(() => scripts.some((u) => chunk('SeatSecurity').test(u)) && scripts.some((u) => chunk('Panels').test(u)), { timeout: 10_000 }).toBe(true);
  for (const name of ['Compare', 'Charts', 'Structure', 'Sensitivity']) expect(scripts.filter((u) => chunk(name).test(u))).toEqual([]);
  await page.getByRole('tab', { name: 'Coalitions' }).click();
  await expect(panel(page).getByText(/Smallest winning coalitions/)).toBeVisible();
  await page.getByRole('tab', { name: 'Sources', exact: true }).click();
  await expect(panel(page).getByText('Electoral threshold').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('a tab whose code is still downloading shows a loading status, then its content', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((r) => { release = r; });
  await page.route(chunk('Compare'), async (route) => { await held; await route.continue(); });
  await start(page, { level: 'expert' });
  // Side by side opens from the comparison strip (it is no longer a tab)
  await page.locator('.compare-on').click();
  await page.locator('.cmpm-strip .cmpm-side').click();
  const side = page.locator('.side-by-side');
  await expect(side.getByRole('status')).toHaveText('Loading…');
  release();
  await expect(side.locator('.cmp-card')).toHaveCount(2);
  // what it is compared with is chosen in the strip above (Side by side has no picker of its own)
  await expect(page.locator('.cmpm-strip').getByRole('button', { name: 'Compare with', exact: true })).toHaveAttribute('data-value', 'prev');
  await expect(side.getByRole('status')).toHaveCount(0);
});

test('seat security is computed in background workers and fills the whole table', async ({ page }) => {
  const workers: string[] = [];
  page.on('worker', (w) => workers.push(w.url()));
  await start(page, { level: 'expert' });
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Yesh Atid', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Seat safety' }).click();
  await expect.poll(() => workers.length).toBeGreaterThan(0);
  await expect(panel(page).getByText('Closest calls:')).toBeVisible({ timeout: 60_000 });
  await expect(panel(page).getByText(/Calculating exactly/)).toHaveCount(0);
  const table = panel(page).getByRole('table', { name: 'Seat security' });
  await expect(table.getByRole('row').filter({ hasText: 'Likud' })).toHaveCount(1);
  await expect(panel(page).getByRole('region', { name: 'Below the threshold' }).getByRole('listitem').filter({ hasText: 'Balad' })).toContainText(/[\d,]+ short/);
});

test('sensitivity searches run in the background on opening the tab and report progress, then their result', async ({ page }) => {
  const workers: string[] = [];
  page.on('worker', (w) => workers.push(w.url()));
  await start(page, { level: 'expert' });
  await page.getByRole('tab', { name: 'Sensitivity' }).click();
  // nothing to press: each tool answers with its defaults
  await expect(panel(page).getByRole('status').filter({ hasText: /Searching exactly… \d+ of \d+ transfers/ })).toBeVisible();
  await expect(panel(page).getByRole('img', { name: 'Seats against votes' })).toBeVisible({ timeout: 60_000 });
  await expect(panel(page).getByText(/votes? moving from|No single transfer|No transfer found/)).toBeVisible({ timeout: 120_000 });
  await expect(panel(page).getByText(/Calculating exactly|Searching exactly/)).toHaveCount(0);
  await expect(panel(page).getByRole('button', { name: /^(Run|Search)$/ })).toHaveCount(0);
  expect(workers.length).toBeGreaterThan(0);
});
