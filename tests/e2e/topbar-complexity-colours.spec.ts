import { expect, test, type Page } from './fixtures';

// 19 Nov 2026 (owner): language and theme live in Settings, Undo, Redo and Start over on the line of changes; the top bar
// takes one row when everything fits and two balanced rows otherwise; a scenario's colours yield to the viewer's own;
// each scenario has its own colour, chosen where it is saved.
const start = async (page: Page, app: Record<string, unknown> = {}, extra: Record<string, string> = {}) => {
  await page.addInitScript(({ app, extra }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard', ...app }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, starterTip: false } }));
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
    sessionStorage.setItem('seeded', '1');
  }, { app, extra });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
};
const top = async (page: Page, sel: string) => Math.round((await page.locator(sel).first().boundingBox())!.y);

for (const lang of ['en', 'he'] as const) test(`the bar: one row when it fits, two balanced rows when not (${lang})`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await start(page, { lang });
  const band = page.locator('.band');
  await expect(band).toHaveAttribute('data-rows', '1');
  expect((await band.boundingBox())!.height).toBeLessThanOrEqual(56);
  // nothing that moved is left in the bar
  await expect(band.getByRole('button', { name: /^(Undo|Redo|ביטול|ביצוע מחדש)/ })).toHaveCount(0);
  await expect(band.getByRole('button', { name: /^(English|עברית)$/ })).toHaveCount(0);
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(band).toHaveAttribute('data-rows', '2');
  // first row: the brand, the election and Settings; second row: the scenario and complexity, each at an end
  const row1 = await top(page, '.band .election'), row2 = await top(page, '.band .scenario-switcher');
  expect(row2).toBeGreaterThan(row1 + 20);
  expect(Math.abs(await top(page, '.band .band-settings') - row1)).toBeLessThan(12);
  expect(Math.abs(await top(page, '.band .complexity') - row2)).toBeLessThan(12);
  expect((await band.boundingBox())!.height).toBeLessThanOrEqual(100);
  // the same 1440 screen at 150% zoom is a 960px page: still two rows, nothing cut off
  await page.setViewportSize({ width: 960, height: 600 });
  await expect(band).toHaveAttribute('data-rows', '2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(960);
});

test('Undo, Redo and Start over sit on the line of changes, greyed out until there is something to take back', async ({ page }) => {
  await start(page);
  const line = page.locator('.session');
  const undo = line.getByRole('button', { name: /^Undo/ }), redo = line.getByRole('button', { name: /^Redo/ }), over = line.getByRole('button', { name: 'Start over', exact: true });
  await expect(undo).toBeDisabled(); await expect(redo).toBeDisabled(); await expect(over).toBeDisabled();
  await page.locator('.lb-row').first().click();
  await page.locator('.side-panel').getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await expect(undo).toBeEnabled(); await expect(over).toBeEnabled();
  await undo.click();
  await expect(line).toContainText('No changes');
  await expect(redo).toBeEnabled();
  // the keyboard shortcuts are unchanged
  await page.locator('body').click({ position: { x: 5, y: 600 } });
  await page.keyboard.press('Control+y');
  await expect(undo).toBeEnabled();
  await page.keyboard.press('Control+z');
  await expect(undo).toBeDisabled();
});

test('the language is the first thing in Settings, its name in both scripts, reached from the gear', async ({ page }) => {
  await start(page, { lang: 'he' });
  const gear = page.locator('.band .band-settings');
  await expect(gear).toHaveAttribute('title', /Settings and language/);
  await gear.click();
  const first = page.locator('.personal-settings .ps-row').first();
  await expect(first).toHaveAttribute('data-setting', 'lang');
  await expect(first).toContainText('Language');
  await first.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test("opening someone else's scenario keeps the viewer's own colours where set; its other colours stay", async ({ page, browser }) => {
  // the author: a saved scenario with Shas recoloured, shared as a link
  await start(page, { saved: [{ id: 'au', name: 'Author', electionId: 'k26', savedAt: '2026-11-19T00:00:00Z', baseBuiltAt: '', log: [{ type: 'setVotes', listId: '26-שס', votes: 239533 }, { type: 'setListMeta', listId: '26-שס', patch: { color: '#aa0000' } }, { type: 'setListMeta', listId: '26-ג', patch: { color: '#00aa00' } }] }] });
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await page.locator('dialog[open] .choice-option', { hasText: 'Author' }).click();
  const ask = page.locator('dialog[open]').getByRole('button').filter({ hasText: /official|scenario/i }).first();
  if (await ask.isVisible().catch(() => false)) await ask.click();
  await expect(page.locator('.lb-row[data-list-id="26-שס"] .lb-bar i').first()).toHaveCSS('background-color', 'rgb(170, 0, 0)');
  await page.locator('.band .band-share > .tool').click();
  await page.getByRole('button', { name: 'Copy a share link', exact: true }).click();
  const link = await page.getByRole('textbox', { name: 'Share link', exact: true }).inputValue();
  // the viewer recoloured Shas on the official result of the same election
  const viewer = await browser.newPage();
  await viewer.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard' }));
    localStorage.setItem('israel-elections:preferences', '{"voteSource":"proportional","comparison":"reference","jointSeats":"off"}');
    localStorage.setItem('israel-elections:appearance:k26', JSON.stringify([{ type: 'setListMeta', listId: '26-שס', patch: { color: '#123456' } }]));
    sessionStorage.setItem('seeded', '1');
  });
  await viewer.goto(link);
  await expect(viewer.locator('.lb-row[data-list-id="26-שס"] .lb-bar i').first()).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  // the author's colour shows where the viewer has none of their own
  await expect(viewer.locator('.lb-row[data-list-id="26-ג"] .lb-bar i').first()).toHaveCSS('background-color', 'rgb(0, 170, 0)');
  // and colours are never changes
  await expect(viewer.locator('.session')).toContainText(/No changes|1 change/);
  await viewer.close();
});

test('a scenario takes its own colour from the Save & share box; the official result keeps the neutral bar', async ({ page }) => {
  await start(page);
  const band = page.locator('.band');
  const neutral = await band.evaluate(e => getComputedStyle(e).backgroundColor);
  await page.locator('.band .band-share > .tool').click();
  await expect(page.locator('.scenario-colour')).toHaveCount(0); // the official result has no colour of its own
  await page.keyboard.press('Escape');
  await page.locator('.lb-row').first().click();
  await page.locator('.side-panel').getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await expect.poll(() => band.evaluate(e => getComputedStyle(e).backgroundColor)).not.toBe(neutral);
  await page.locator('.band .band-share > .tool').click();
  await page.locator('.scenario-colour').getByRole('button', { name: /^Ochre/ }).click();
  await expect(page.locator('.scenario-colour').getByRole('button', { name: /^Ochre/ })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => band.evaluate(e => getComputedStyle(e).backgroundColor)).toBe('rgb(218, 114, 5)');
  // a colour is never a change
  await expect(page.locator('.session')).toContainText('1 change');
});
