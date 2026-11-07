// Compare workbench: defaults and explicit targets, copying between two live sides (k25 ↔ k26 and k1 ↔ k2) with every
// copied value marked, matching decisions, swap, save and share, the phone row sheet, Hebrew pinning and contrast.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', election = 'k26', width = 1500, level = 'expert') {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, level]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional' }));
  }, [lang, level]);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
async function editFirstList(page: Page, votes: string) {
  await page.locator('.lb-row').first().click();
  const input = page.locator('aside input[aria-label="Votes"], aside input[aria-label="קולות"]').first();
  await input.fill(votes); await input.press('Enter');
  await page.keyboard.press('Escape');
  if (await page.locator('aside .sp-head').count()) await page.keyboard.press('Escape');
  await expect(page.locator('aside .sp-head')).toHaveCount(0);
}
const compare = (page: Page) => page.locator('#tab-compare').click();
const picker = (page: Page) => page.getByRole('button', { name: 'Compare with', exact: true });
const row = (page: Page, name: string) => page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-rname', { hasText: name }) }).first();
const rightSeats = (page: Page, name: string) => row(page, name).locator('.cmp-rs');
const leftSeats = (page: Page, name: string) => row(page, name).locator('.cmp-ls');
const card = (page: Page, side: 'left' | 'right') => page.locator(`.cmp-card[data-side="${side}"]`);

test('an unchanged scenario opens on the previous election, earlier on the left; explicit targets stick', async ({ page }) => {
  await start(page);
  await compare(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'election:k25');
  await expect(card(page, 'left')).toContainText('2022');
  await expect(card(page, 'left')).toContainText('25th Knesset');
  await expect(card(page, 'right')).toContainText('2026');
  await expect(card(page, 'right')).toHaveAttribute('data-role', 'main');
  await expect(leftSeats(page, 'Likud')).toHaveText('32');
  await expect(rightSeats(page, 'Likud')).toHaveText('27');
  await expect(row(page, 'Likud').locator('.cmp-tag')).toHaveText('Same');
  // the other election's seats open no list of the current scenario
  await card(page, 'left').locator('[data-seat]').first().click();
  await expect(page.locator('aside .sp-head')).toHaveCount(0);
  // this election's official result: nothing differs, so the chooser
  await choose(picker(page), 'historical');
  await expect(page.locator('.cmp-empty')).toBeVisible();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await compare(page);
  await expect(page.locator('.cmp-empty')).toBeVisible();
});

test('the automatic comparison follows an edit and undo; another election chosen explicitly sticks', async ({ page }) => {
  await start(page, 'en', 'k25');
  await compare(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'election:k24');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await editFirstList(page, '1300000');
  await compare(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'historical');
  await expect(row(page, 'Likud').locator('.cmp-v .cmp-mark')).toHaveText('Edited');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(picker(page)).toHaveAttribute('data-value', 'election:k24');
  await choose(picker(page), 'election:k23');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await editFirstList(page, '1300000');
  await compare(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'election:k23');
  await expect(card(page, 'left')).toContainText('2020');
});

for (const lang of ['en', 'he'] as const) test(`the earliest election keeps the chooser (${lang})`, async ({ page }) => {
  await start(page, lang, 'k1');
  await compare(page);
  await expect(page.locator('.cmp-empty')).toBeVisible();
  await expect(page.locator('.cmp-card')).toHaveCount(0);
});

test('k25 → k26: copy Likud’s 2022 share into 2026, marked with its origin, recalculated, undoable', async ({ page }) => {
  await start(page);
  await compare(page);
  const likud = row(page, 'Likud');
  await likud.hover();
  await likud.getByRole('button', { name: 'Copy Likud’s votes to 2026' }).click();
  const dialog = page.locator('dialog[open].cmp-ask');
  await expect(dialog).toContainText('1,332,255 votes');
  await expect(dialog).toContainText('23.41%');
  await expect(dialog.locator('.cmp-mode').filter({ hasText: 'Number of votes' })).toContainText('1,115,336');
  await dialog.getByRole('button', { name: 'Copy to 2026' }).click();
  await expect(page.locator('.toast')).toHaveText('Votes copied to 2026. Likud 30 seats.');
  await expect(rightSeats(page, 'Likud')).toHaveText('30');
  await expect(likud.locator('.cmp-v').last()).toContainText('1,332,255');
  const mark = likud.locator('.cmp-v .cmp-mark[data-copied]');
  await expect(mark).toHaveText('From 2022');
  await mark.click();
  await expect(page.locator('.cmp-mark-pop')).toContainText('From 2022 (share 23.41%)');
  await expect(page.locator('.cmp-mark-pop')).toContainText('was 1,167,591');
  await page.keyboard.press('Escape');
  await expect(card(page, 'right')).toContainText('1 change from the official result');
  // the right side is the open scenario: the Overview shows the copy, marked the same way
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await expect(page.locator('.lb-row').filter({ hasText: 'Likud' }).first()).toContainText('30');
  await expect(page.locator('[data-copied]').first()).toContainText('From 2022');
  await compare(page);
  await card(page, 'right').getByRole('button', { name: 'Undo on 2026' }).click();
  await expect(rightSeats(page, 'Likud')).toHaveText('27');
  await expect(likud.locator('.cmp-mark')).toHaveCount(0);
});

test('a copy into the earlier election stays on that side with its own undo and Start over', async ({ page }) => {
  await start(page);
  await compare(page);
  const likud = row(page, 'Likud');
  await likud.hover();
  await likud.getByRole('button', { name: 'Copy Likud’s votes to 2022' }).click();
  const dialog = page.locator('dialog[open].cmp-ask');
  await dialog.getByText('Number of votes').click();
  await dialog.getByRole('button', { name: 'Copy to 2022' }).click();
  await expect(leftSeats(page, 'Likud')).not.toHaveText('32');
  await expect(likud.locator('.cmp-ls')).toBeVisible();
  await expect(card(page, 'left')).toContainText('draft');
  await expect(rightSeats(page, 'Likud')).toHaveText('27'); // the open scenario is untouched
  await expect(card(page, 'right').getByRole('button', { name: 'Undo on 2026' })).toBeDisabled();
  await card(page, 'left').getByRole('button', { name: 'Start over' }).click();
  await expect(leftSeats(page, 'Likud')).toHaveText('32');
  await card(page, 'left').getByRole('button', { name: 'Undo on 2022' }).click();
  await expect(leftSeats(page, 'Likud')).not.toHaveText('32');
});

test('copy a whole list, then several rows at once', async ({ page }) => {
  await start(page);
  await compare(page);
  await row(page, 'Likud').getByRole('button', { name: 'More for Likud' }).click();
  await page.locator('.cmp-menu').getByRole('button', { name: 'Whole list…' }).first().click();
  const whole = page.locator('dialog[open].cmp-whole');
  await expect(whole).toContainText('Kept from 2026: rules, agreements, bloc and coalition.');
  await expect(whole).toContainText(/Entering \d+, leaving \d+/);
  await whole.getByRole('button', { name: 'Replace', exact: true }).click();
  await expect(rightSeats(page, 'Likud')).toHaveText('30');
  await expect(row(page, 'Likud').locator('.cmp-mark[data-copied]').first()).toHaveText('From 2022');
  await card(page, 'right').getByRole('button', { name: 'Undo on 2026' }).click();
  await expect(rightSeats(page, 'Likud')).toHaveText('27');
  // selection: Likud and Shas, copied as one step
  await row(page, 'Likud').getByRole('checkbox').check();
  await row(page, 'Shas').getByRole('checkbox').check();
  await expect(page.locator('.cmp-selbar')).toContainText('2 selected');
  await page.locator('.cmp-selbar').getByRole('button', { name: 'Copy votes → 2026' }).click();
  const dialog = page.locator('dialog[open].cmp-ask');
  await dialog.getByText('Number of votes').click();
  await dialog.getByRole('button', { name: 'Copy to 2026' }).click();
  await expect(rightSeats(page, 'Likud')).toHaveText('26');
  await expect(row(page, 'Shas').locator('.cmp-v').last()).toContainText('392,964');
  await card(page, 'right').getByRole('button', { name: 'Undo on 2026' }).click();
  await expect(rightSeats(page, 'Likud')).toHaveText('27');
  await expect(row(page, 'Shas').locator('.cmp-mark')).toHaveCount(0);
});

test('a split copies only as a group; a pairing to check is accepted in Matching; a new list can be mapped by hand', async ({ page }) => {
  await start(page);
  await compare(page);
  const rz = row(page, 'Religious Zionism–Zehut');
  await expect(rz.locator('.cmp-tag')).toHaveText('Split');
  await rz.hover();
  await expect(rz.getByRole('button', { name: /copy the group/ }).first()).toBeDisabled();
  const line = page.locator('tr.cmp-groupline');
  await expect(line).toContainText('Religious Zionism');
  await expect(line).toContainText('3 lists');
  // the Democrats need a decision: no copy until then
  const dem = row(page, 'The Democrats');
  await expect(dem.locator('.cmp-tag')).toHaveText('Check');
  await page.locator('.cmp-toolbar').getByRole('button', { name: /Matching/ }).click();
  const panel = page.locator('dialog[open].cmp-matching');
  await panel.getByRole('button', { name: 'To check', exact: true }).click();
  await panel.getByRole('button', { name: 'Accept Labor' }).click();
  await panel.getByRole('button', { name: 'All', exact: true }).click();
  const yashar = panel.locator('li').filter({ hasText: 'Yashar!' }).first();
  await yashar.getByRole('button', { name: 'Map to…' }).click();
  await expect(yashar.locator('.cmp-mapto li').first()).toContainText('shared candidates');
  await page.keyboard.press('Escape');
  await expect(dem.locator('.cmp-tag')).not.toHaveText('Check');
  await dem.hover();
  await expect(dem.getByRole('button', { name: /Copy .*’s votes to 2026/ })).toBeEnabled();
});

test('swap keeps the pairing and a saved comparison and its link reopen both sides', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await start(page);
  await compare(page);
  await page.getByRole('button', { name: 'Swap sides' }).click();
  await expect(card(page, 'left')).toHaveAttribute('data-role', 'main');
  await expect(card(page, 'left')).toContainText('2026');
  await page.getByRole('button', { name: 'Swap sides' }).click();
  await expect(card(page, 'right')).toHaveAttribute('data-role', 'main');
  // a copy into 2022, then share: the link carries both sides
  const likud = row(page, 'Likud');
  await likud.hover();
  await likud.getByRole('button', { name: 'Copy Likud’s votes to 2022' }).click();
  await page.locator('dialog[open].cmp-ask').getByRole('button', { name: 'Copy to 2022' }).click();
  const copied = await leftSeats(page, 'Likud').innerText();
  expect(copied).not.toBe('32');
  await page.getByRole('button', { name: 'Save comparison' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.toast')).toHaveText('Comparison saved in this browser.');
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.locator('.toast')).toContainText('Link copied');
  const link: string = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/#c=[A-Za-z0-9_-]+$/);
  const other = await context.newPage();
  await other.goto(link.replace(/^https?:\/\/[^/]+/, ''));
  await expect(other.locator('.cmp-wb')).toBeVisible({ timeout: 15_000 });
  await expect(other.locator('tr.cmp-row').filter({ has: other.locator('.cmp-rname', { hasText: 'Likud' }) }).first().locator('.cmp-ls')).toHaveText(copied);
  await other.close();
  await expect(page.getByRole('button', { name: 'Saved comparisons' })).toBeVisible();
});

test('k1 → k2: copying the 1949 threshold switches 1951 to experimental rules, marked', async ({ page }) => {
  await start(page, 'en', 'k2');
  await compare(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'election:k1');
  await expect(row(page, 'Mapai').locator('.cmp-tag')).toHaveText('Same');
  await expect(page.locator('tr.cmp-groupline')).toContainText('4 lists');
  const thr = page.locator('.cmp-band-row[data-key="threshold"]');
  await thr.getByRole('button', { name: 'Copy threshold to 1951' }).click();
  await expect(page.locator('.toast')).toContainText('Copied to 1951.');
  const values = thr.locator('.cmp-band-v');
  await expect(values.first()).toHaveText(await values.last().innerText());
  await expect(page.locator('.cmp-band-row[data-key="thrvotes"] .cmp-band-v').last()).toHaveText('None');
  await expect(page.locator('.cmp-band-row[data-key="rules"] .cmp-band-v').last()).toContainText('experimental');
  await page.getByRole('tab', { name: 'Rules', exact: true }).click();
  await expect(page.locator('[data-copied]').filter({ hasText: 'From 1949' })).toBeVisible();
});

test('phone: tap a row, copy from the sheet; 44px targets and no sideways scroll', async ({ page }) => {
  await start(page, 'en', 'k26', 390);
  await compare(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  for (const b of await page.locator('tr.cmp-row .cmp-more-btn').all()) { const box = (await b.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44); }
  await row(page, 'Likud').locator('.cmp-rname').click();
  const sheet = page.locator('dialog[open].cmp-sheet');
  await expect(sheet).toContainText('1,115,336 votes');
  for (const b of await sheet.locator('.cmp-menu-item').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await sheet.getByRole('button', { name: 'Votes', exact: true }).first().click();
  const dialog = page.locator('dialog[open].cmp-ask');
  await expect(dialog).toBeInViewport();
  await dialog.getByRole('button', { name: 'Copy to 2026' }).click();
  await expect(rightSeats(page, 'Likud')).toHaveText('30');
  await expect(row(page, 'Likud').locator('.cmp-rname .cmp-mark[data-copied]')).toHaveText('From 2022');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test('Hebrew keeps the graphics left to right: 2022 on the left, signs and arrows unmirrored', async ({ page }) => {
  await start(page, 'he');
  await compare(page);
  const l = (await card(page, 'left').boundingBox())!, r = (await card(page, 'right').boundingBox())!;
  expect(l.x).toBeLessThan(r.x);
  await expect(card(page, 'left')).toContainText('2022');
  const likud = row(page, 'הליכוד');
  expect((await likud.locator('.cmp-ls').boundingBox())!.x).toBeLessThan((await likud.locator('.cmp-rs').boundingBox())!.x);
  await expect(likud.locator('.cmp-delta bdi').first()).toHaveText(/^▼\s*−5$/);
  await likud.hover();
  await likud.getByRole('button', { name: 'העתקת הקולות של הליכוד ל־2026' }).click();
  await expect(page.locator('dialog[open].cmp-ask')).toContainText('העתקה לפי');
  await page.locator('dialog[open].cmp-ask').getByRole('button', { name: 'העתקה ל־2026' }).click();
  await expect(likud.locator('.cmp-v .cmp-mark[data-copied]')).toHaveText('מ־2022');
});

for (const theme of ['light', 'dark'] as const) test(`tags and marks have readable contrast (${theme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  await start(page);
  await compare(page);
  const likud = row(page, 'Likud');
  await likud.hover();
  await likud.getByRole('button', { name: 'Copy Likud’s votes to 2026' }).click();
  await page.locator('dialog[open].cmp-ask').getByRole('button', { name: 'Copy to 2026' }).click();
  await expect(likud.locator('.cmp-v .cmp-mark')).toBeVisible();
  const ratios = await page.locator('.cmp-tag, .cmp-mark').evaluateAll(nodes => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = (color: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const light = (c: number[]) => c.slice(0, 3).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const bg = (el: Element | null): string => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (rgb(c)[3] === 255) return c; } return getComputedStyle(document.body).backgroundColor; };
    return nodes.filter(n => n.getClientRects().length).map(n => { const f = light(rgb(getComputedStyle(n).color)), b = light(rgb(bg(n))); return { text: n.textContent, ratio: (Math.max(f, b) + .05) / (Math.min(f, b) + .05) }; });
  });
  expect(ratios.length).toBeGreaterThan(5);
  for (const r of ratios) expect(r.ratio, r.text ?? '').toBeGreaterThanOrEqual(4.5);
});
