import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { openSideBySide } from './sideBySide.ts';

// Each setting is seeded the way a returning visitor has it (the sparse `israel-elections:settings` record), then its
// effect is checked where it applies. Seeds run once per test, so a reload sees what the app itself stored.
type Seed = { lang?: 'en' | 'he'; level?: string; settings?: Record<string, unknown>; preferences?: Record<string, string>; };
async function open(page: Page, seed: Seed = {}, election?: string) {
  await page.addInitScript(seed => {
    if (sessionStorage.getItem('settings-seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: seed.lang ?? 'en', level: seed.level ?? 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: seed.settings ?? {} }));
    if (seed.preferences) localStorage.setItem('israel-elections:preferences', JSON.stringify(seed.preferences));
    sessionStorage.setItem('settings-seeded', '1');
  }, seed);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  if (election) await choose(page.getByRole('button', { name: seed.lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
// on a phone, Settings is in the bar's Menu (owner, 9 Nov 2026): the helper opens the menu first
const gear = (page: Page, lang: 'en' | 'he' = 'en') => ({ click: async () => {
  if (await page.locator('.band .band-menu-btn').count()) { await page.locator('.band .band-menu-btn').click(); await page.locator('#phone-menu').getByRole('button', { name: lang === 'en' ? 'Settings' : 'הגדרות', exact: true }).click(); }
  else await page.locator('.band').getByRole('button', { name: lang === 'en' ? 'Settings' : 'הגדרות', exact: true }).click();
} });
const dialog = (page: Page) => page.locator('.personal-settings');
const row = (page: Page, id: string) => dialog(page).locator(`[data-setting="${id}"]`);
const stored = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:settings') ?? 'null'));

test.describe('the Settings popup', () => {
  test('every level shows every setting, Simple first, then Standard and Expert under their separators', async ({ page }) => {
    await open(page, { level: 'simple' });
    await gear(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect(row(page, 'starterTip')).toBeVisible();
    await expect(dialog(page).locator('[data-tier="simple"] [data-setting="voteSource"]')).toBeVisible();
    await expect(dialog(page).locator('[data-tier="expert"] [data-setting="chamberLayout"]')).toBeAttached();
    await expect(dialog(page).locator('.ps-more')).toHaveCount(0);
    await row(page, 'level').getByRole('button', { name: 'Standard', exact: true }).click();
    // the starter tip exists only at Simple
    await expect(row(page, 'starterTip')).toHaveCount(0);
    await expect(row(page, 'chamberLayout')).toBeAttached();
    // Custom… still opens the feature list
    await row(page, 'level').getByRole('button', { name: 'Custom…', exact: true }).click();
    await expect(page.locator('.custom-feature').first()).toBeVisible();
  });

  for (const lang of ['en', 'he'] as const) test(`search finds rows in both languages, from every level · ${lang}`, async ({ page }) => {
    await open(page, { lang, level: 'simple' });
    await gear(page, lang).click();
    const search = dialog(page).getByRole('searchbox');
    await search.fill('logo');
    await expect(row(page, 'listSymbol')).toBeVisible();
    await search.fill('סמל');
    await expect(row(page, 'listSymbol')).toBeVisible();
    // a Standard row found from Simple sits under the Standard separator
    await search.fill(lang === 'en' ? 'withdrew' : 'פרשו');
    await expect(row(page, 'withdrawnLists')).toBeVisible();
    await expect(dialog(page).locator('.ps-tier-sep')).toHaveText([lang === 'en' ? 'Standard' : 'רגיל']);
    await search.fill('zzzz');
    await expect(dialog(page).locator('[data-setting]')).toHaveCount(0);
  });

  test('toggling never moves the rows under the pointer; the changed dot and group Reset keep their space', async ({ page }) => {
    await open(page);
    await gear(page).click();
    const target = row(page, 'withdrawnLists');
    const below = row(page, 'listOrder');
    // Standard settings sit below the Simple ones now: bring the row into view before measuring
    await target.scrollIntoViewIfNeeded();
    const before = [await target.boundingBox(), await below.boundingBox()];
    await target.getByRole('checkbox').click();
    await expect(target.locator('.ps-dot')).toHaveText('•');
    const after = [await target.boundingBox(), await below.boundingBox()];
    expect(after).toEqual(before);
    expect(await stored(page)).toEqual({ v: 2, values: { withdrawnLists: false } });
  });

  test('Reset all returns to the defaults and Undo brings the choices back', async ({ page }) => {
    await open(page, { settings: { density: 'comfortable', decimals: 3 } });
    await gear(page).click();
    await dialog(page).locator('.ps-foot > button.btn').click();
    expect((await stored(page)).values).toEqual({});
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
    await page.getByRole('button', { name: 'Undo', exact: true }).last().click();
    expect((await stored(page)).values).toEqual({ density: 'comfortable', decimals: 3 });
  });

  test('at phone width it is a full-screen sheet with 44px segments', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    await gear(page).click();
    const box = await dialog(page).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(388);
    expect(box!.height).toBeGreaterThanOrEqual(840);
    const seg = row(page, 'density').locator('.seg button').first();
    expect((await seg.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the ask dialog links to the setting it answers', async ({ page }) => {
    await open(page, { preferences: { comparison: 'reference', jointSeats: 'off' } });
    await page.locator('.lb-row').first().click();
    await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
    const ask = page.locator('.source-ask');
    await ask.getByRole('button', { name: 'Change in Settings', exact: true }).click();
    await expect(ask).toBeHidden();
    await expect(row(page, 'voteSource')).toBeInViewport();
  });
});

test.describe('every setting takes effect', () => {
  test('theme: Device follows the system; a choice is kept', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await gear(page).click();
    await row(page, 'theme').getByRole('button', { name: 'Dark', exact: true }).click();
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect((await stored(page)).values).toEqual({ theme: 'dark' });
  });

  test('spacing, text size and reduced motion set the page', async ({ page }) => {
    await open(page);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-density', 'compact');
    const rowHeight = async () => (await page.locator('.lb-row').first().boundingBox())!.height;
    const compact = await rowHeight();
    await gear(page).click();
    await row(page, 'density').getByRole('button', { name: 'Comfortable', exact: true }).click();
    await expect(html).toHaveAttribute('data-density', 'comfortable');
    expect(await rowHeight()).toBeGreaterThan(compact);
    await row(page, 'textSize').getByRole('button', { name: 'Large', exact: true }).click();
    await expect(html).toHaveAttribute('data-text', 'large');
    await row(page, 'reduceMotion').getByRole('checkbox').check();
    await expect(html).toHaveAttribute('data-motion', 'reduce');
    expect(await page.locator('.lb-row').first().evaluate(e => getComputedStyle(e).transitionDuration)).toMatch(/^0s|^1e-/);
  });

  for (const [width, lang] of [[1500, 'en'], [1300, 'he'], [390, 'en'], [390, 'he']] as const) test(`large text never pushes the page sideways · ${width} ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await open(page, { lang, settings: { textSize: 'large' } });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await gear(page, lang).click();
    await expect(dialog(page)).toBeInViewport({ ratio: 0.95 });
  });

  // breakpoints follow the zoomed page: at 1024 large text lays out as a 890px page would (1024 / 1.15), at 1500 as 1304
  for (const [width, lang] of [[1024, 'en'], [1024, 'he'], [1500, 'en'], [1500, 'he']] as const) test(`large text: the top bar takes the layout of the narrower page · ${width} ${lang}`, async ({ page, browser }) => {
    const bar = async (p: Page) => p.evaluate(() => {
      const band = document.querySelector<HTMLElement>('.band')!, tabs = document.querySelector<HTMLElement>('.toolbar')!;
      return { height: band.offsetHeight, labels: [...document.querySelectorAll('.band .tool .label')].filter(e => getComputedStyle(e).display !== 'none').length, wraps: getComputedStyle(band).flexWrap,
        gap: Math.round(tabs.getBoundingClientRect().top - band.getBoundingClientRect().bottom), sideways: document.documentElement.scrollWidth - innerWidth };
    });
    await page.setViewportSize({ width, height: 900 });
    await open(page, { lang, settings: { textSize: 'large' } });
    const large = await bar(page);
    const ctx = await browser.newContext({ viewport: { width: Math.round(width / 1.15), height: 900 }, baseURL: test.info().project.use.baseURL });
    const normal = await ctx.newPage();
    await open(normal, { lang });
    const plain = await bar(normal);
    await ctx.close();
    expect(large.sideways).toBeLessThanOrEqual(0);
    // the same layout, only larger: the same rows (layout heights in the page's own pixels), labels and wrapping
    expect(Math.abs(large.height - plain.height)).toBeLessThanOrEqual(2);
    expect(large.labels).toBe(plain.labels);
    expect(large.wraps).toBe(plain.wraps);
    // the tabs sit right under the bar: no gap, no overlap
    expect(Math.abs(large.gap)).toBeLessThanOrEqual(1);
  });

  test('starter tip: shown at Simple until turned off', async ({ page }) => {
    await open(page, { level: 'simple' });
    const tip = page.locator('.banner.note').filter({ hasText: 'Pick a list' });
    await expect(tip).toBeVisible();
    await gear(page).click();
    await row(page, 'starterTip').getByRole('checkbox').uncheck();
    await page.keyboard.press('Escape');
    await expect(tip).toHaveCount(0);
    await page.reload();
    await expect(tip).toHaveCount(0);
  });

  test('open on: the last page returns after a reload', async ({ page }) => {
    await open(page, { settings: { openOn: 'last' } });
    await page.locator('#tab-charts').click();
    await page.reload();
    await expect(page.locator('#tab-charts')).toHaveAttribute('aria-selected', 'true');
  });
  test('open on: the overview by default', async ({ page }) => {
    await open(page);
    await page.locator('#tab-charts').click();
    await page.reload();
    await expect(page.locator('#tab-charts')).not.toHaveAttribute('aria-selected', 'true');
  });

  test('list symbol: ballot letters replace logos', async ({ page }) => {
    await open(page);
    const logos = () => page.locator('.lb-row .slip img').count();
    expect(await logos()).toBeGreaterThan(0);
    await gear(page).click();
    await row(page, 'listSymbol').getByRole('button', { name: 'Ballot letters', exact: true }).click();
    await expect.poll(logos).toBe(0);
  });

  test('vote counts: off at Simple, on at Standard', async ({ page }) => {
    await open(page, { level: 'simple' });
    const stats = page.locator('.lb-row').first();
    await expect(stats).not.toContainText(/\d{1,3},\d{3},?\d* · /);
    await gear(page).click();
    await row(page, 'voteCounts').getByRole('checkbox').check();
    await expect(stats).toContainText(/\d{1,3},\d{3}.* · /);
  });

  test('max decimal places: 1 at Simple, 2 at Standard, 3 at Expert, a choice at every level', async ({ page }) => {
    await open(page, { level: 'simple' });
    // k26 Likud is 20.515…%, so each cap shows its full number of digits
    const share = () => page.locator('.lb-row').first().innerText();
    await expect.poll(share).toMatch(/\d+\.\d%/);
    await gear(page).click();
    await row(page, 'level').getByRole('button', { name: 'Standard', exact: true }).click();
    await expect.poll(share).toMatch(/\d+\.\d\d%/);
    await row(page, 'level').getByRole('button', { name: 'Expert', exact: true }).click();
    await expect.poll(share).toMatch(/\d+\.\d\d\d%/);
    await row(page, 'decimals').getByRole('button', { name: '0', exact: true }).click();
    await row(page, 'level').getByRole('button', { name: 'Simple', exact: true }).click();
    await expect.poll(share).toMatch(/\d+%/);
    await expect.poll(share).not.toMatch(/\d\.\d+%/);
  });
  test('lists with no seats: over 0.5%, all, or folded; lists that withdrew', async ({ page }) => {
    await open(page);
    const out = page.locator('.lb-row.out');
    const over = await out.count();
    await gear(page).click();
    await row(page, 'seatlessLists').getByRole('button', { name: 'All', exact: true }).click();
    await expect.poll(() => out.count()).toBeGreaterThan(over);
    const all = await out.count();
    await row(page, 'withdrawnLists').getByRole('checkbox').uncheck();
    await expect.poll(() => out.count()).toBeLessThan(all);
    await row(page, 'seatlessLists').getByRole('button', { name: 'Folded', exact: true }).click();
    await expect(out).toHaveCount(0);
  });

  test('list order: by name', async ({ page }) => {
    await open(page);
    await gear(page).click();
    await row(page, 'listOrder').getByRole('button', { name: 'Name', exact: true }).click();
    await page.keyboard.press('Escape');
    const names = await page.locator('.lb-row:not(.out) .lb-name').allInnerTexts();
    expect(names.length).toBeGreaterThan(3);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
  });

  test('dim the others: on by default, can be off', async ({ page }) => {
    await open(page);
    await page.locator('.lb-row').first().click();
    await expect(page.locator('.lb-row.dim').first()).toBeVisible();
    await expect(page.locator('.chamber circle.dim').first()).toBeAttached();
    await gear(page).click();
    await row(page, 'dimUnselected').getByRole('checkbox').uncheck();
    await expect(page.locator('.lb-row.dim')).toHaveCount(0);
  });

  test('seat chart: layout, bloc shading, key and reference chamber', async ({ page }) => {
    await open(page);
    const chamber = page.locator('.chamber').first();
    await expect(chamber.locator('.wedge').first()).toBeAttached();
    await gear(page).click();
    await row(page, 'blocShading').getByRole('checkbox').uncheck();
    await expect(chamber.locator('.wedge')).toHaveCount(0);
    await row(page, 'chamberKey').getByRole('checkbox').uncheck();
    await expect(chamber.locator('.legend')).toHaveAttribute('data-key-off', '');
    await expect(chamber.locator('.legend')).toBeHidden();
    await row(page, 'chamberLayout').getByRole('button', { name: 'Blocks', exact: true }).click();
    await expect(chamber.locator('svg rect[aria-label], svg rect title').first()).toBeAttached();
    await expect(chamber.locator('svg circle')).toHaveCount(0);
    await page.keyboard.press('Escape');
    // the reference mini-chamber shows only after a change, and only while the setting is on
    await page.locator('.lb-row').first().click();
    await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
    for (let i = 0; i < 30 && !(await page.locator('.baseline-mini').count()); i++) await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
    await expect(page.locator('.baseline-mini')).toBeVisible();
    await gear(page).click();
    await row(page, 'referenceChamber').getByRole('checkbox').uncheck();
    await expect(page.locator('.baseline-mini')).toHaveCount(0);
  });

  test('seat colour and party colour in seats', async ({ page }) => {
    await open(page, { preferences: { voteSource: 'proportional', comparison: 'reference', jointSeats: 'on' } }, 'k25');
    const fills = () => page.locator('.chamber circle').evaluateAll(cs => new Set(cs.map(c => getComputedStyle(c).fill)).size);
    const byList = await fills();
    await gear(page).click();
    await row(page, 'jointListSeats').getByRole('button', { name: 'List', exact: true }).click();
    await expect.poll(fills).toBeLessThan(byList);
    await row(page, 'seatColour').getByRole('button', { name: 'Bloc', exact: true }).click();
    await expect.poll(fills).toBeLessThanOrEqual(4);
  });

  test('all candidates: the list page opens with every candidate', async ({ page }) => {
    await open(page);
    await page.locator('.lb-row').first().click();
    const shown = () => page.locator('ol.cands > li').count();
    const short = await shown();
    await page.keyboard.press('Escape');
    await gear(page).click();
    await row(page, 'allCandidates').getByRole('checkbox').check();
    await page.keyboard.press('Escape');
    await page.locator('.lb-row').nth(1).click();
    await page.locator('.lb-row').first().click();
    await expect.poll(shown).toBeGreaterThan(short);
  });

  test('confirm start over: off starts over at once', async ({ page }) => {
    await open(page, { settings: { confirmStartOver: false } });
    await page.locator('.lb-row').first().click();
    await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
    await page.getByRole('button', { name: /^Start over/ }).first().click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.locator('.edit-marker, [data-edited]')).toHaveCount(0);
  });

  test('community scenarios: off hides the gallery and says where to turn it on', async ({ page }) => {
    await open(page, { settings: { communityScenarios: false } });
    await page.locator('#tab-scenarios').click();
    await expect(page.getByText('Community scenarios are off', { exact: false })).toBeVisible();
  });

  test('compare with: the official result, once something is changed', async ({ page }) => {
    await open(page, { settings: { compareWith: 'official' } });
    await page.getByRole('button', { name: 'Likud', exact: true }).click();
    const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
    await votes.fill('1300000'); await votes.press('Enter'); await page.keyboard.press('Escape');
    await page.locator('.compare-on').click();
    await expect(page.locator('.cmpm-strip').getByRole('button', { name: 'Compare with', exact: true })).toHaveAttribute('data-value', 'official');
  });

  test('popups on hover: off waits for a click', async ({ page }) => {
    await open(page, { settings: { hoverPopups: false } });
    const info = page.locator('.info:visible').first();
    await info.hover();
    await page.waitForTimeout(400);
    await expect(page.locator('.info-pop, [role="tooltip"]').filter({ visible: true })).toHaveCount(0);
    await info.click();
    await expect(page.locator('.info-pop, [role="tooltip"], [role="dialog"]').filter({ visible: true }).first()).toBeVisible();
  });

  test('tables instead of charts: the Charts page opens as a table', async ({ page }) => {
    await open(page, { settings: { preferTables: true } });
    await page.locator('#tab-charts').click();
    await expect(page.locator('[role="tabpanel"] table').first()).toBeVisible();
  });

  test('hover previews: pointing at a step says what it would do, unless turned off', async ({ page }) => {
    await open(page);
    await page.locator('.lb-row').first().click();
    const say = page.locator('.quick-consequence');
    await page.getByRole('button', { name: 'Increase Votes', exact: true }).hover();
    await expect(say).not.toHaveText('');
    await page.reload();
    await gear(page).click();
    await row(page, 'hoverPreviews').getByRole('checkbox').uncheck();
    await page.keyboard.press('Escape');
    await page.locator('.lb-row').first().click();
    await page.getByRole('button', { name: 'Increase Votes', exact: true }).hover();
    await page.waitForTimeout(300);
    await expect(say).toHaveText('');
  });

  test('option previews: the grouping picker draws each result, unless turned off', async ({ page }) => {
    await open(page, {}, 'k25');
    const picker = page.getByRole('button', { name: 'Grouping', exact: true });
    await picker.click();
    const pop = page.locator(`[id="${await picker.getAttribute('aria-controls')}"]`);
    await expect(pop.locator('.result-preview').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await gear(page).click();
    await row(page, 'optionPreviews').getByRole('checkbox').uncheck();
    await page.keyboard.press('Escape');
    await picker.click();
    await expect(pop.locator('.choice-option').first()).toBeVisible();
    await expect(pop.locator('.result-preview')).toHaveCount(0);
  });

  test('parties of seatless lists: hidden at Standard, All shows them under the list (2022, Jewish Home)', async ({ page }) => {
    await open(page, { level: 'standard', settings: { seatlessLists: 'all' }, preferences: { voteSource: 'proportional', comparison: 'reference', jointSeats: 'on' } }, 'k25');
    const parties = page.getByRole('list', { name: /The Jewish Home/ });
    await expect(page.getByRole('button', { name: 'The Jewish Home', exact: true })).toBeVisible();
    await expect(parties).toHaveCount(0);
    await gear(page).click();
    await row(page, 'jointListParties').getByRole('button', { name: 'All', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(parties.getByText(/New Right/)).toBeVisible();
  });

  test('keep messages open: a message stays until closed', async ({ page }) => {
    await open(page, { settings: { keepMessages: true, density: 'comfortable' } });
    await gear(page).click();
    await dialog(page).locator('[data-group="general"] .ps-reset').click();
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await page.waitForTimeout(8000);
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(toast).toHaveCount(0);
  });
  test('messages close by themselves by default', async ({ page }) => {
    await open(page, { settings: { density: 'comfortable' } });
    await gear(page).click();
    await dialog(page).locator('[data-group="general"] .ps-reset').click();
    await expect(page.locator('.toast')).toBeVisible();
    await expect(page.locator('.toast')).toHaveCount(0, { timeout: 9000 });
  });
});

test.describe('Compare follows Settings', () => {
  const compareRow = (page: Page, name: string) => page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-rname', { hasText: name }) }).first();
  test('Copy votes: default method, set in Settings, is where the box starts', async ({ page }) => {
    await open(page, { preferences: { voteSource: 'proportional' } });
    await gear(page).click();
    const r = row(page, 'copyMode');
    await expect(r.getByRole('group', { name: 'Copy votes: default method' })).toBeVisible();
    await r.getByRole('button', { name: 'Same number of votes', exact: true }).click();
    await page.keyboard.press('Escape');
    await openSideBySide(page);
    const likud = compareRow(page, 'Likud');
    await likud.hover();
    await likud.getByRole('button', { name: 'Copy Likud’s votes into 2026' }).click();
    // the box always opens, starting on the default
    const ask = page.locator('dialog[open].cmp-ask');
    await expect(ask.getByRole('radio', { name: /Same number of votes/ })).toBeChecked();
    await ask.getByRole('button', { name: 'Copy into 2026' }).click();
    await expect(page.locator('.toast')).toContainText('Votes copied to 2026.');
    await expect(likud.locator('.cmp-v').first()).toContainText('1,115,336');
  });
  test('an answer for one list is named by its list, and the box links to its row in Settings', async ({ page }) => {
    await open(page, { preferences: { voteSource: 'proportional' } });
    await openSideBySide(page);
    const likud = compareRow(page, 'Likud');
    await likud.hover();
    await likud.getByRole('button', { name: 'Copy Likud’s votes into 2026' }).click();
    const ask = page.locator('dialog[open].cmp-ask');
    await ask.getByRole('radio', { name: 'For this list' }).check();
    await ask.getByRole('button', { name: 'Copy into 2026' }).click();
    await gear(page).click();
    const r = row(page, 'copyMode');
    await r.getByRole('button', { name: /Remembered for 1/ }).click();
    await expect(r.locator('.pref-items')).toContainText('Likud');
    await expect(r.locator('.pref-items')).toContainText('Same share of eligible voters');
    await expect(r.locator('.pref-items')).not.toContainText('Unknown list');
    await page.keyboard.press('Escape');
    await likud.hover();
    await likud.getByRole('button', { name: 'Copy Likud’s votes into 2026' }).click();
    await page.locator('dialog[open].cmp-ask').getByRole('button', { name: 'Change the default in Settings' }).click();
    await expect(row(page, 'copyMode')).toBeInViewport();
  });
  for (const [mode, expectZero] of [['all', true], ['over', 'some'], ['folded', false]] as const) test(`Lists with no seats: ${mode} sets which seatless rows Compare starts with`, async ({ page }) => {
    await open(page, { settings: { seatlessLists: mode } });
    await openSideBySide(page);
    await expect(page.locator('tr.cmp-row').first()).toBeVisible();
    const rows = await page.locator('tr.cmp-row').evaluateAll(trs => trs.map(tr => {
      const n = (sel: string) => Number(tr.querySelector(sel)?.textContent || 0);
      const share = (i: number) => Number((tr.querySelectorAll('.cmp-s')[i]?.textContent ?? '').replace(/[<%]/g, '') || 0);
      return { seats: n('.cmp-ls') + n('.cmp-rs'), share: Math.max(share(0), share(1)), group: tr.querySelector('.cmp-delta .tiny') !== null };
    }));
    const seatless = rows.filter(r => r.seats === 0 && !r.group);
    if (expectZero === true) expect(seatless.length).toBeGreaterThan(5);
    if (expectZero === false) expect(seatless).toEqual([]);
    if (expectZero === 'some') { expect(seatless.length).toBeGreaterThan(0); expect(seatless.every(r => r.share >= 0.5)).toBe(true); }
    await expect(page.getByRole('checkbox', { name: 'Lists with no seats' })).toBeChecked({ checked: mode === 'all' });
  });
});

test.describe('parties with no seats (2022, Religious Zionism)', () => {
  test('hidden at Standard in the list column, the joint list page and the bloc editor; one click shows them', async ({ page }) => {
    await open(page, { level: 'standard', preferences: { voteSource: 'proportional', comparison: 'reference', jointSeats: 'on' } }, 'k25');
    const rz = page.getByRole('button', { name: 'Religious Zionism', exact: true });
    await expect(rz).toBeVisible();
    const partyRows = page.locator('.lb-parties, .lb-party').filter({ hasText: /Atid Ehad|Eretz Yisrael Shelanu/ });
    await expect(partyRows).toHaveCount(0);
    await rz.click();
    const more = page.getByRole('button', { name: /\+\d+ with no seats/ }).first();
    await expect(more).toBeVisible();
    await more.click();
    await expect(page.getByText(/Atid Ehad|Eretz Yisrael Shelanu/).first()).toBeVisible();
    // the bloc editor offers only the parties that can move a seat
    await page.keyboard.press('Escape');
    const blocStrip = page.getByRole('region', { name: 'Seats by bloc' });
    await blocStrip.getByRole('button', { name: 'Edit blocs' }).click();
    const editor = page.getByRole('complementary', { name: 'Edit blocs' });
    const zeroSub = editor.locator('.bp-sub').filter({ hasText: /Atid Ehad|Eretz Yisrael Shelanu/ });
    await expect(editor.locator('.bp-sub').filter({ hasText: /Otzma/ })).toBeVisible();
    await expect(zeroSub).toHaveCount(0);
    await gear(page).click();
    await row(page, 'jointListParties').getByRole('button', { name: 'All', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(zeroSub.first()).toBeVisible();
    await expect(page.getByRole('list', { name: /Religious Zionism/ }).getByText(/Atid Ehad|Eretz Yisrael Shelanu/).first()).toBeVisible();
  });
});
