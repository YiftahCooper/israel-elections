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
  await page.getByRole('tab', { name: 'Compare' }).click();
  await expect(panel(page).getByRole('status')).toHaveText('Loading…');
  await expect(page.getByRole('tab', { name: 'Compare' })).toHaveAttribute('aria-selected', 'true');
  release();
  await expect(panel(page).getByRole('option', { name: /official result/i }).first()).toBeAttached();
  await expect(panel(page).getByRole('status')).toHaveCount(0);
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
  await expect(table.getByRole('row').filter({ hasText: 'Balad' })).toContainText('to pass the threshold');
});

test('sensitivity searches run in the background and report progress, then their result', async ({ page }) => {
  const workers: string[] = [];
  page.on('worker', (w) => workers.push(w.url()));
  await start(page, { level: 'expert' });
  await page.getByRole('tab', { name: 'Sensitivity' }).click();
  await panel(page).getByRole('button', { name: 'Run' }).first().click();
  await expect(panel(page).getByRole('img', { name: 'Seats against votes' })).toBeVisible({ timeout: 60_000 });
  await expect(panel(page).getByRole('status')).toHaveCount(0);

  await panel(page).getByRole('button', { name: 'Search', exact: true }).click();
  await expect(panel(page).getByRole('status')).toContainText(/Searching exactly… \d+ of \d+ transfers/);
  await expect(panel(page).getByText(/votes moving from|No single transfer|No transfer found/)).toBeVisible({ timeout: 120_000 });
  await expect(panel(page).getByRole('status')).toHaveCount(0);
  expect(workers.length).toBeGreaterThan(0);
});
