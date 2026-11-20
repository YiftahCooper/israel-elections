// A number you can change is changed on its own tile (owner decision, 19 Nov 2026): a pencil, or a tap on the tile,
// opens a small window under it with the field, its steps and Reset; nothing on the page moves; Done, Escape or a tap
// outside closes it. Turnout, eligible voters and invalid ballots always; the threshold only under Experimental rules.
// The separate fields on the Turnout and Rules tabs are gone. On a phone the window never covers its tile, also when
// the keyboard takes half the screen.
import { expect, test, type Page } from './fixtures';
import { boxesNow, waitForStill } from './settle.ts';
import { openTool } from './openTool.ts';

async function open(page: Page, { lang = 'en', width = 1500, height = 1000 }: { lang?: 'en' | 'he'; width?: number; height?: number } = {}) {
  await page.setViewportSize({ width, height });
  await page.addInitScript(([lang]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  }, [lang] as const);
  await page.goto('/');
  await openTool(page, 'turnout');
  return page.locator('.tn-facts');
}
const tile = (page: Page, id: string) => page.locator(`.tn-facts [data-fact="${id}"]`);
const pop = (page: Page) => page.locator('.tile-pop:popover-open');
const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test('the editable tiles have a pencil; the others do not; the old fields are gone', async ({ page }) => {
  await open(page);
  for (const id of ['registered', 'turnout', 'invalid']) await expect(tile(page, id).locator('.tile-pencil')).toHaveCount(1);
  for (const id of ['cast', 'valid', 'threshold', 'boxes', 'envelopes']) await expect(tile(page, id).locator('.tile-pencil')).toHaveCount(0);
  await expect(page.locator('.turnout-national')).toHaveCount(0);
  await openTool(page, 'rules');
  await expect(page.locator('.rules-page').getByRole('textbox', { name: 'Registered voters' })).toHaveCount(0);
  await expect(page.locator('.rules-page').getByRole('textbox', { name: 'Invalid ballots' })).toHaveCount(0);
  await expect(page.locator('.rules-page').getByRole('textbox', { name: 'Turnout %' })).toHaveCount(0);
});

test('eligible voters: the window opens under its tile, nothing moves, the edit is marked and Reset undoes it', async ({ page }) => {
  await open(page);
  const t = tile(page, 'registered');
  const positions = () => page.locator('.tn-fact').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
  const before = await positions(), y = await page.evaluate(() => scrollY);
  // a tap on the tile's surface opens it, as the pencil does
  await t.locator('.tn-v').click();
  await expect(pop(page)).toBeVisible();
  await expect(pop(page)).toContainText('Change eligible voters');
  expect(await positions()).toEqual(before); expect(await page.evaluate(() => scrollY)).toBe(y);
  const tb = (await t.boundingBox())!, pb = (await pop(page).boundingBox())!;
  expect(overlaps(tb, pb)).toBe(false);
  expect(pb.y).toBeGreaterThanOrEqual(tb.y + tb.height);
  // the field has focus at once with a mouse
  const field = pop(page).getByRole('textbox', { name: 'Eligible voters' });
  await expect(field).toBeFocused();
  await field.fill('7,400,000'); await field.press('Enter');
  await expect(t.locator('.tn-v')).toHaveText(/^7,400,000/);
  await expect(t.locator('.tn-v .edit-marker')).toHaveText('Edited');
  await pop(page).getByRole('button', { name: /^Reset/ }).click();
  await expect(t.locator('.tn-v')).toHaveText('7,331,981');
  await expect(pop(page).getByRole('button', { name: /^Reset/ })).toHaveCount(0);
  await expect(field).toBeFocused();
  // Done closes it and gives focus back to the pencil
  await pop(page).getByRole('button', { name: 'Done', exact: true }).click();
  await expect(pop(page)).toHaveCount(0);
  await expect(t.locator('.tile-pencil')).toBeFocused();
});

test('invalid ballots: Escape and a tap outside close the window', async ({ page }) => {
  await open(page);
  await tile(page, 'invalid').locator('.tile-pencil').click();
  await expect(pop(page)).toContainText('Change invalid ballots');
  await pop(page).getByRole('button', { name: 'Increase Invalid ballots', exact: true }).click();
  await expect(tile(page, 'invalid').locator('.tn-v')).toHaveText(/^26,971/);
  await page.keyboard.press('Escape');
  await expect(pop(page)).toHaveCount(0);
  await tile(page, 'invalid').locator('.tile-pencil').click();
  await expect(pop(page)).toBeVisible();
  await page.locator('.tn-history h4').click();
  await expect(pop(page)).toHaveCount(0);
  await expect(tile(page, 'invalid').locator('.tn-v .edit-marker')).toHaveText('Edited');
});

test('turnout: steps, another election\'s turnout, and an exact Reset', async ({ page }) => {
  await open(page);
  await tile(page, 'turnout').locator('.tile-pencil').click();
  await expect(pop(page).getByRole('button', { name: 'Use another election’s turnout', exact: true })).toBeVisible();
  for (let i = 0; i < 3; i++) await pop(page).getByRole('button', { name: 'Increase Turnout %', exact: true }).click();
  await expect(tile(page, 'turnout').locator('.tn-v')).toHaveText(/^78\.28%/);
  await expect(tile(page, 'turnout').locator('.tn-v .edit-marker')).toHaveText('Edited');
  // Reset brings every count back exactly: no edit mark is left anywhere
  await pop(page).getByRole('button', { name: /^Reset/ }).click();
  await expect(tile(page, 'turnout').locator('.tn-v')).toHaveText('77.98%');
  await expect(page.locator('.edit-marker')).toHaveCount(0);
});

test('the threshold tile is changed on its tile only under Experimental rules', async ({ page }) => {
  await open(page);
  await expect(tile(page, 'threshold').locator('.tile-pencil')).toHaveCount(0);
  await openTool(page, 'rules');
  await page.getByRole('button', { name: 'Experimental', exact: true }).click();
  await openTool(page, 'turnout');
  await tile(page, 'threshold').locator('.tile-pencil').click();
  await expect(pop(page)).toContainText('Change the threshold');
  await pop(page).getByRole('button', { name: '2% (2006–2013)', exact: true }).click();
  await expect(tile(page, 'threshold').locator('.tn-d')).toHaveText('2% of valid votes');
  await expect(tile(page, 'threshold').locator('.tn-v .edit-marker')).toHaveText('Edited');
  await pop(page).getByRole('button', { name: /^Reset/ }).click();
  await expect(tile(page, 'threshold').locator('.tn-d')).toHaveText('3.25% of valid votes');
});

test('the Overview: turnout and invalid ballots are changed in their tiles\' windows', async ({ page }) => {
  await open(page);
  await openTool(page, 'board');
  const fig = (k: RegExp) => page.locator('.fig').filter({ has: page.locator('.k', { hasText: k }) });
  await fig(/^Invalid ballots/).locator(':scope > button').click();
  await expect(fig(/^Invalid ballots/).locator('.tile-editor')).toBeVisible();
  await fig(/^Invalid ballots/).getByRole('button', { name: 'Increase Invalid ballots', exact: true }).click();
  await expect(fig(/^Invalid ballots/).locator(':scope > button .v')).toHaveText(/^26,971/);
  await page.keyboard.press('Escape');
  await fig(/^Turnout/).locator(':scope > button').click();
  await fig(/^Turnout/).getByRole('button', { name: 'Increase Turnout %', exact: true }).click();
  await expect(fig(/^Turnout/).locator(':scope > button .v .edit-marker')).toHaveText('Edited');
});

for (const lang of ['en', 'he'] as const) test(`on a phone the window never covers its tile, also with the keyboard open (${lang})`, async ({ page }) => {
  await open(page, { lang, width: 390, height: 844 });
  const t = tile(page, 'turnout');
  await t.scrollIntoViewIfNeeded();
  await t.locator('.tile-pencil').click();
  await expect(pop(page)).toBeVisible();
  expect(overlaps((await t.boundingBox())!, (await pop(page).boundingBox())!)).toBe(false);
  // the keyboard takes about half the screen: the window moves, still beside the tile, its field still on screen
  await page.setViewportSize({ width: 390, height: 420 });
  await waitForStill(page, ['.tn-facts [data-fact]', '.tile-pop']);
  const [tb, pb] = await boxesNow(t, pop(page));
  expect(overlaps(tb, pb)).toBe(false);
  const fb = (await pop(page).locator('input').first().boundingBox())!;
  expect(fb.y).toBeGreaterThanOrEqual(0); expect(fb.y + fb.height).toBeLessThanOrEqual(420);
});
