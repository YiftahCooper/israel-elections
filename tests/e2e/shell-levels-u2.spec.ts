import { expect, test, type Page } from './fixtures';
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';

// Round 7 (16 Nov 2026), the shell: levels keep the user's own choices, greyed tools ask before opening, Settings is
// split by level with every part settable, the phone's two bar buttons do two jobs, short screens pin only the top
// bar, colours are reset beside each colour and listed in Settings, and a shared scenario never changes the viewer's
// settings.
const k25 = JSON.parse(readFileSync('public/data/k25.json', 'utf8'));
type Seed = { app?: Record<string, unknown>; settings?: Record<string, unknown>; preferences?: Record<string, unknown> };
const start = async (page: Page, { app = {}, settings = {}, preferences = { voteSource: 'proportional', comparison: 'reference', jointSeats: 'off' } }: Seed = {}, hash = '') => {
  await page.addInitScript(({ app, settings, preferences }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', ...app }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, starterTip: false, ...settings } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify(preferences));
    sessionStorage.setItem('seeded', '1');
  }, { app, settings, preferences });
  await page.goto('/' + hash);
  await expect(page.locator('.lb-row').first()).toBeVisible();
};
const level = (page: Page, name: string) => page.locator('.band').getByRole('group', { name: 'Complexity' }).getByRole('button', { name, exact: true });
const openSettings = (page: Page) => page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();

test('a level change keeps the user\'s own choices in Custom, and says nothing was cleared', async ({ page }) => {
  await start(page, { app: { level: 'simple', customFeatures: { rules: 'show' } } });
  await expect(page.locator('#tab-rules')).not.toHaveClass(/locked/);
  await expect(page.locator('.band .band-own')).toHaveText('+1');
  await level(page, 'Standard').click();
  // Simple is Simple as it comes; the choice waits in Custom
  await level(page, 'Simple').click();
  await expect(page.locator('#tab-rules')).toHaveClass(/locked/);
  await level(page, 'Custom').click();
  await expect(page.locator('#tab-rules')).not.toHaveClass(/locked/);
  await expect(page.locator('.toast')).toHaveCount(0);
  // the words "More in other levels" are gone: greyed tools ask instead
  await expect(page.locator('.toolbar .more-label')).toHaveCount(0);
});

test('a greyed-out tool asks: switch complexity, or add it to Custom (never to Simple)', async ({ page }) => {
  await start(page, { app: { level: 'simple' } });
  await expect(page.locator('#tab-sens')).toHaveClass(/locked/);
  await page.locator('#tab-sens').click();
  const ask = page.getByRole('dialog', { name: 'Sensitivity' });
  await expect(ask).toContainText('Part of Expert.');
  await expect(ask.getByRole('button', { name: 'Add to Simple' })).toHaveCount(0);
  await ask.getByRole('button', { name: 'Add to Custom' }).click();
  await expect(ask).toHaveCount(0);
  await expect(page.locator('#tab-sens')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-sens')).not.toHaveClass(/locked/);
  await expect(level(page, 'Custom')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.toast')).toContainText('Now Custom: Simple with your choices');
  // Simple itself still greys Sensitivity out
  await level(page, 'Simple').click();
  await expect(page.locator('#tab-sens')).toHaveClass(/locked/);
  await level(page, 'Custom').click();
  // the chip opens Settings at the list of own choices, where one press undoes it
  await page.locator('.band .band-own').click();
  const own = page.locator('.ps-own');
  await expect(own).toContainText('Sensitivity · added');
  await own.getByRole('button', { name: 'Undo: Sensitivity' }).click();
  await expect(page.locator('.ps-own')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#tab-sens')).toHaveClass(/locked/);
  // the other answer switches level
  await page.locator('#tab-charts').click();
  await page.getByRole('dialog', { name: 'Charts' }).getByRole('button', { name: 'Switch to Standard' }).click();
  await expect(level(page, 'Standard')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#tab-charts')).toHaveAttribute('aria-selected', 'true');
});

test('Settings lists every part under its complexity; adding a Standard detail on Simple makes Custom', async ({ page }) => {
  await start(page, { app: { level: 'simple' } });
  await expect(page.locator('.lb-key')).toHaveCount(0); // the agreement mark is a Standard detail
  await openSettings(page);
  const standard = page.locator('.ps-tier[data-tier="standard"]');
  await expect(standard.locator('[data-part="charts"]')).toBeVisible();
  await expect(page.locator('.ps-tier[data-tier="expert"] [data-part="turnoutCounts"]')).toBeVisible();
  // no Custom until there is a choice of one's own; the parts are right below the row
  await expect(page.locator('.ps-level').getByRole('button')).toHaveCount(3);
  await standard.locator('[data-part="agreementMarks"]').getByRole('checkbox', { name: 'Agreement marks' }).check();
  // the choice makes Custom, pressed in the same row
  await expect(page.locator('.ps-level').getByRole('button', { name: 'Custom', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('.lb-key')).toBeVisible();
  await expect(page.locator('.band .band-own')).toHaveText('+1');
});

test('Reset all settings also forgets "Always" answers and own choices, with one Undo', async ({ page }) => {
  await start(page, { app: { level: 'simple', customFeatures: { charts: 'show' } }, settings: { listOrder: 'votes' } });
  await openSettings(page);
  await page.locator('.personal-settings button.btn', { hasText: 'Reset all settings' }).click();
  const stored = () => page.evaluate(() => ({ prefs: JSON.parse(localStorage.getItem('israel-elections:preferences') ?? '{}'), app: JSON.parse(localStorage.getItem('israel-elections:v1') ?? '{}') }));
  await expect.poll(async () => (await stored()).prefs.voteSource).toBeUndefined();
  await expect.poll(async () => (await stored()).app.customFeatures).toBeNull();
  await page.locator('.toast').getByRole('button', { name: 'Undo' }).click();
  await expect.poll(async () => (await stored()).prefs.voteSource).toBe('proportional');
  await expect.poll(async () => (await stored()).app.customFeatures).toEqual({ charts: 'show' });
});

test('phone: the three lines open the tools and view; the scenario button opens the scenario', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, { app: { level: 'simple' } });
  await page.locator('.band-menu-btn').click();
  const menu = page.locator('#app-menu');
  await expect(menu.getByRole('navigation', { name: 'Tools' }).getByRole('button', { name: 'Coalitions' })).toBeVisible();
  await expect(menu.getByRole('group', { name: 'Complexity' })).toBeVisible();
  await expect(menu.locator('.scenario-switcher')).toHaveCount(0);
  await menu.getByRole('button', { name: 'Coalitions' }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator('#tab-coal')).toHaveAttribute('aria-selected', 'true');
  await page.locator('.band-status').click();
  const scenario = page.getByRole('dialog', { name: 'Scenario' });
  await expect(scenario.locator('.scenario-switcher')).toBeVisible();
  await expect(scenario.getByRole('button', { name: 'Copy a share link' })).toBeVisible(); // not folded away
  await expect(scenario.getByRole('group', { name: 'Complexity' })).toHaveCount(0);
  await expect(page.locator('#app-menu')).toHaveCount(0);
});

test('short screens pin only the top bar, and the three lines hold the tools', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await start(page, { app: { level: 'expert' } });
  await page.locator('#tab-coal').click();
  // Under load the screen may still be drawing when the first wheel turns: scroll again until the strips have gone.
  await expect.poll(async () => { await page.mouse.wheel(0, 900); return page.locator('.toolbar').evaluate(e => e.getBoundingClientRect().bottom); }).toBeLessThan(5);
  await expect.poll(() => page.locator('.band').evaluate(e => e.getBoundingClientRect().top)).toBe(0);
  await page.locator('.band-tools-btn').click();
  await page.locator('#app-menu').getByRole('button', { name: 'Charts' }).click();
  await expect(page.locator('#tab-charts')).toHaveAttribute('aria-selected', 'true');
});

test('tall desktop screens keep the tab rows pinned and need no three-lines button', async ({ page }) => {
  await start(page, { app: { level: 'expert' } });
  await expect(page.locator('.band-tools-btn')).toBeHidden();
  await page.locator('#tab-coal').click();
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.locator('.toolbar').evaluate(e => Math.round(e.getBoundingClientRect().top))).toBeGreaterThan(30);
});

test('a changed colour has a Reset beside it and is listed in Settings; the scenario stays the official result', async ({ page }) => {
  await start(page, { app: { level: 'expert' } });
  await page.locator('.lb-row').first().click();
  const panel = page.getByRole('region', { name: 'List details' });
  const colour = panel.locator('.colour-picker').filter({ hasText: /^Colour/ }).locator('input[type="color"]');
  await colour.fill('#ff00aa');
  await expect(panel.getByRole('button', { name: 'Reset: Colour' })).toBeVisible();
  await expect(page.locator('.band .scenario-switcher')).toContainText('Official result');
  await page.keyboard.press('Escape');
  await openSettings(page);
  const list = page.locator('.ps-colours');
  await expect(list.locator('li')).toHaveCount(1);
  await list.getByRole('button', { name: /^Reset: / }).click();
  await expect(list).toContainText('No colour changes here.');
});

test('opening a shared scenario leaves every setting, answer, level and own choice of the viewer unchanged', async ({ page }) => {
  const likud = k25.lists[0].id;
  const payload = { e: 'k25', n: 'Someone else', b: k25.buildInfo.builtAt, f: true, l: [{ type: 'setVotes', listId: likud, votes: 1200000 }, { type: 'setListMeta', listId: likud, patch: { color: '#ff00aa' } }] };
  const seed = { app: { level: 'standard', customFeatures: { rules: 'show', charts: 'hidden' } }, settings: { listOrder: 'votes', theme: 'dark', decimals: 3, chamberLayout: 'blocks' },
    preferences: { voteSource: 'new', comparison: 'reference', jointSeats: 'off', copyMode: 'count' } };
  await start(page, seed, '#s=' + deflateRawSync(JSON.stringify(payload)).toString('base64url'));
  await expect(page.locator('.band .scenario-switcher')).toContainText('Someone else');
  const now = await page.evaluate(() => ({ v1: JSON.parse(localStorage.getItem('israel-elections:v1')!), settings: JSON.parse(localStorage.getItem('israel-elections:settings')!), prefs: JSON.parse(localStorage.getItem('israel-elections:preferences')!) }));
  expect(now.settings.values).toEqual({ decimals: 3, starterTip: false, listOrder: 'votes', theme: 'dark', chamberLayout: 'blocks' });
  expect(now.prefs).toEqual(seed.preferences);
  expect(now.v1.level).toBe('standard');
  expect(now.v1.customFeatures).toEqual(seed.app.customFeatures);
  expect(now.v1.lang).toBe('en');
  // the author's colour shows only while their scenario is open; the official palette kept in this browser is untouched
  expect(await page.evaluate(() => localStorage.getItem('israel-elections:appearance:k25'))).toBeNull();
});
