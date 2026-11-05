// Charts screen (screen-by-screen audit, 2026-11-05): each test locks in one fixed defect class.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', election = 'k26', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const charts = (page: Page) => page.locator('#tab-charts').click();
const panel = (page: Page) => page.locator('#analysis-panel');
const labels = (page: Page, title: string) => panel(page).locator('figure').filter({ hasText: title }).locator('svg text[data-chart-label]');
// the drawn name only, without the <title> that carries the full name for hover
const drawn = async (page: Page, title: string) => (await expect(labels(page, title).first()).toBeVisible(), labels(page, title)).evaluateAll((ts) => ts.map((t) => [...t.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('')));

test('chart names are drawn whole when there is room, on desktop and on a phone', async ({ page }) => {
  for (const width of [1500, 390]) {
    await start(page, 'en', 'k26', width);
    await charts(page);
    for (const title of ['Share of votes vs share of seats', 'Distance from the threshold']) {
      const names = await drawn(page, title);
      expect(names, `${title} at ${width}`).toContain('Religious Zionism–Zehut');
      expect(names.filter((n) => n.includes('…')), `${title} at ${width}`).toEqual([]);
    }
  }
});

test('1949 counts the votes of lists that won no seat, as the overview does, and never names a threshold', async ({ page }) => {
  await start(page, 'en', 'k1');
  const overview = await page.locator('.fig').filter({ hasText: 'Votes with no seat' }).locator('.v').textContent();
  expect(overview).toMatch(/^[1-9]\d*\.\d%$/); // some 1949 lists won nothing although no threshold applied
  await charts(page);
  const legend = panel(page).locator('.legend').first();
  await expect(legend).toContainText(`No seat: ${overview} of votes`);
  await expect(panel(page)).not.toContainText('Below threshold');
  // the waffle legend names only lists that won seats; the rest are the hatched no-seat squares
  await expect(legend.locator('.tabnum').filter({ hasText: /^0$/ })).toHaveCount(0);
  expect((await drawn(page, 'Share of votes vs share of seats')).at(-1)).toBe('Votes with no seat');
});

test('the vote and seat waffles keep one list order and draw a line between neighbouring lists', async ({ page }) => {
  await start(page, 'he', 'k1');
  await charts(page);
  const [votes, seats] = [panel(page).locator('[data-waffle]').nth(0), panel(page).locator('[data-waffle]').nth(1)];
  // votes then seats reads left to right in Hebrew too
  expect((await votes.boundingBox())!.x).toBeLessThan((await seats.boundingBox())!.x);
  const order = (f: typeof votes) => f.locator('rect[rx="3"] title').evaluateAll((ts) => [...new Set(ts.map((t) => t.textContent))]);
  const [v, s] = [await order(votes), await order(seats)];
  expect(v.slice(0, s.length)).toEqual(s);
  expect(await votes.locator('.waffle-edges line').count()).toBeGreaterThan(10);
});

test('table names open their list, and the no-seat total matches the chart', async ({ page }) => {
  await start(page);
  await charts(page);
  await panel(page).getByRole('button', { name: 'Table', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Shas', exact: true }).click();
  await expect(page.locator('.side-panel')).toContainText('Shas');
  await expect(panel(page).getByRole('row').filter({ hasText: 'Votes with no seat' })).toContainText('5.38%');
});

test('a hover tip near the right edge stays on screen', async ({ page }) => {
  await start(page, 'en', 'k26', 1024);
  await charts(page);
  const svg = panel(page).locator('figure').filter({ hasText: 'Distance from the threshold' }).locator('svg');
  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width - 6, box.y + 14);
  const tip = panel(page).locator('.chart-tip');
  await expect(tip).toBeVisible();
  const t = (await tip.boundingBox())!;
  expect(t.x + t.width).toBeLessThanOrEqual(1024);
});

test('switching between charts and table keeps the page height and the switch under the pointer', async ({ page }) => {
  for (const width of [390, 1024, 1500]) {
    await start(page, 'en', 'k26', width);
    await charts(page);
    await expect(panel(page).locator('[data-waffle]').first()).toBeVisible();
    // scroll as far as the page allows while the switch stays visible below the sticky bars
    const seg = panel(page).getByRole('group', { name: 'View', exact: true });
    await page.evaluate((d) => window.scrollBy(0, d), (await seg.boundingBox())!.y - 160);
    for (const name of ['Table', 'Charts', 'Table']) {
      const button = panel(page).getByRole('button', { name, exact: true });
      const b = (await button.boundingBox())!;
      const [s0, h0] = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight]);
      // a real pointer click: Playwright's click() would scroll the button into view by itself
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      const [s1, h1] = await page.evaluate(() => [scrollY, document.documentElement.scrollHeight]);
      expect(Math.abs((await button.boundingBox())!.y - b.y), `${name} at ${width}`).toBeLessThan(2);
      expect(s1, `${name} at ${width}`).toBe(s0);
      expect(h1, `${name} at ${width}`).toBeGreaterThanOrEqual(h0 - 2);
    }
  }
});
