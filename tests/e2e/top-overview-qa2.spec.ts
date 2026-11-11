import { expect, test } from '@playwright/test';
import { barLanguage, closeBarMenu, openBarMenu } from './barMenu.ts';
import { choose } from './choices.ts';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert', hintDismissed: true })));
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

for (const width of [390, 1024, 1500]) test(`scenario and header slots stay usable across elections at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const heights: number[] = [];
  for (const id of ['k26', 'k25', 'k12', 'k1']) {
    await choose(page.getByRole('button', { name: 'Election', exact: true }), id);
    heights.push((await page.locator('.band').boundingBox())!.height);
    // phones (owner, 9 Nov 2026): a one-row bar whose status label stands for the scenario; level and switcher in its Menu
    if (width === 390) { await expect(page.locator('.band .band-status')).toBeVisible(); await openBarMenu(page); }
    const scenario = page.locator(width === 390 ? '#phone-menu .scenario-switcher' : '.band .scenario-switcher');
    expect((await scenario.boundingBox())!.width).toBeGreaterThan(200);
    expect(await scenario.locator('.choice-current').evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBeTruthy();
    const levels = page.locator('.band-levels');
    expect(await levels.evaluate(e => [...e.children].every(x => Math.abs(x.getBoundingClientRect().top - e.firstElementChild!.getBoundingClientRect().top) < 5))).toBeTruthy();
    await closeBarMenu(page);
  }
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(2);
});

test('all seven figure cards toggle closed, independently and without page scrolling', async ({ page }) => {
  for (const button of await page.locator('.fig > button').all()) {
    await button.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await button.click(); await expect(button).toHaveAttribute('aria-expanded', 'true');
    await button.click(); await expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => scrollY)).toBe(before);
  }
});

test('tab selection preserves every sibling position and overflow remains discoverable', async ({ page }) => {
  const tabs = page.locator('.toolbar [role=tab]');
  const positions = () => tabs.evaluateAll(es => es.map(e => ({ x: e.getBoundingClientRect().x, w: e.getBoundingClientRect().width })));
  const initial = await positions();
  await page.locator('#tab-families').click();
  expect(await positions()).toEqual(initial);
  await page.locator('#tab-board').click();
  expect(await positions()).toEqual(initial);
  await page.setViewportSize({ width: 1024, height: 1000 });
  expect(await page.locator('.toolbar .tabs').evaluate(e => getComputedStyle(e).scrollbarWidth)).toBe('thin');
  await expect(page.locator('.toolbar .tabs')).toHaveAttribute('data-more', '');
  await page.locator('.toolbar .tabs').evaluate(e => { e.scrollLeft = e.scrollWidth; });
  await expect(page.locator('.toolbar .tabs')).not.toHaveAttribute('data-more');
});

test('show all stays in place and every stat value shares its row baseline', async ({ page }) => {
  const toggle = page.locator('.lb-thr button');
  await toggle.scrollIntoViewIfNeeded();
  const before = await toggle.boundingBox();
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const after = await toggle.boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 0); expect(after!.y).toBeCloseTo(before!.y, 0);
  const values = await page.locator('.fig .v').evaluateAll(es => es.map(e => e.getBoundingClientRect().top));
  // Cards wrapping to a second grid row are compared within that row.
  const cards = await page.locator('.fig').evaluateAll(es => es.map(e => e.getBoundingClientRect().top));
  for (let i = 0; i < values.length; i++) for (let j = 0; j < i; j++) if (cards[i] === cards[j]) expect(values[i]).toBe(values[j]);
});

test('fallback slips use the same identity in the list and inspector', async ({ page }) => {
  const row = page.locator('.lb-row').filter({ has: page.locator('.slip:not(.logo)') }).first();
  const identity = await row.locator('.slip:not(.logo)').first().evaluate(e => e.textContent ?? '');
  await row.click();
  await expect(page.locator('.side-panel .sp-head .slip:not(.logo)').first()).toHaveText(identity);
});


test('Hebrew phone values, names, grouping and shared name wrapping stay readable', async ({ page }) => {
  await page.getByRole('button', { name: 'עב', exact: true }).click();
  await page.getByRole('button', { name: 'מצב כהה', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 1000 });
  const sum = page.locator('.fig .v bdi').last();
  await expect(sum).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('.session')).toHaveCSS('height', '50px');
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k12');
  expect(await page.locator('.board-choices .choice-current').evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBeTruthy();
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k26');
  const seat = page.locator('circle[data-seat]').filter({ hasText: 'הליכוד' }).first();
  await seat.hover();
  await expect(page.locator('.chamber .tip')).toContainText('בנימין נתניהו');
});


// The two 2026 rosters that once came from a fallback transcription now rest on the official gazette; its credit is
// written in English, so an English page shows no Hebrew in the description.
test('sources: the 2026 candidate gazette is credited as official, in English on an English page', async ({ page }) => {
  await page.locator('#tab-sources').click();
  const gazette = page.locator('.credits li').filter({ hasText: 'Yalkut HaPirsumim 15023 (13 Oct 2026)' });
  await expect(gazette).toBeVisible();
  await expect(gazette.locator('.chip.ok')).toHaveText('official');
  expect(await gazette.locator(':scope > span[dir="auto"]').innerText()).not.toMatch(/[א-ת]/);
  await expect(page.locator('.credits li').filter({ hasText: 'bechirot.fyi' })).toHaveCount(0);
});

test('shared selected labels keep their weights and positions', async ({ page }) => {
  await page.locator('#tab-families').click();
  const chips = page.locator('.family-chip'); await expect(chips.first()).toBeVisible();
  const boxes = () => chips.evaluateAll(es => es.map(e => [e.getBoundingClientRect().x, e.getBoundingClientRect().width]));
  const before = await boxes(); await chips.nth(1).click(); expect(await boxes()).toEqual(before);
  await page.locator('#tab-walk').click();
  const stages = page.locator('.walk-stages button'); await expect(stages.first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 1000 });
  const positions = () => stages.evaluateAll(es => es.map(e => [e.getBoundingClientRect().x, e.getBoundingClientRect().width]));
  const original = await positions(); await stages.nth(2).click(); expect(await positions()).toEqual(original);
});

test('unsaved status stays readable without growing the band after an edit', async ({ page }) => {
  const height = (await page.locator('.band').boundingBox())!.height;
  await page.locator('.lb-row').first().click();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await page.locator('.side-panel').getByRole('button', { name: 'Close', exact: true }).click();
  const label = page.locator('.band .scenario-switcher .choice-current');
  await expect(label).toContainText('*');
  expect(await label.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBeTruthy();
  expect((await page.locator('.band').boundingBox())!.height).toBe(height);
});

for (const width of [390, 1024, 1500]) test(`Hebrew header stays stable across elections at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await barLanguage(page, 'he');
  const heights: number[] = [];
  for (const id of ['k26', 'k25', 'k12', 'k1']) {
    await choose(page.getByRole('button', { name: 'בחירות', exact: true }), id);
    heights.push((await page.locator('.band').boundingBox())!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(2);
});


test('active Custom keeps its phone label compact and its base accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  const before = (await page.locator('.band').boundingBox())!.height;
  // phones (owner, 9 Nov 2026): Custom is in the bar's Menu, named with its base there too
  await openBarMenu(page);
  await page.getByRole('button', { name: 'Custom', exact: true }).click();
  await page.getByRole('group', { name: 'Charts', exact: true }).getByRole('button', { name: 'Hidden', exact: true }).click();
  await openBarMenu(page);
  await expect(page.getByRole('button', { name: 'Custom · based on Expert', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect((await page.locator('.band').boundingBox())!.height).toBe(before);
});
