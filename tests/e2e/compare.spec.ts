// Side by side (owner, 12 Nov 2026, C5b): opened from the comparison strip; your work and the compared result as two
// whole results (your work on the left in English, on the right in Hebrew, C3a), one table of paired lists, copies
// between them with every copied value marked, matching decisions, Swap, save and share, the phone row sheet, Hebrew
// graphics left to right, and contrast. The figures are the official results (Likud: 32 seats in 2022, 27 in 2026).
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { openSideBySide } from './sideBySide.ts';

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
const picker = (page: Page) => page.locator('.cmpm-strip').getByRole('button', { name: 'Compare with', exact: true });
// a row by either side's name (in English your work's names are on the left)
const row = (page: Page, name: string) => page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-lname, .cmp-rname', { hasText: name }) }).first();
// in English your work is the left column, the compared result the right one
const workSeats = (page: Page, name: string) => row(page, name).locator('.cmp-ls');
const refSeats = (page: Page, name: string) => row(page, name).locator('.cmp-rs');
const card = (page: Page, role: 'main' | 'other') => page.locator(`.cmp-card[data-role="${role}"]`);
const box = (page: Page) => page.locator('dialog[open].cmp-ask');

test('opens from the strip on the previous election, your work on the left; closing returns to where you were', async ({ page }) => {
  await start(page);
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await openSideBySide(page);
  await expect(page.locator('#tab-compare')).toHaveCount(0); // no longer a tab
  await expect(picker(page)).toHaveAttribute('data-value', 'prev');
  await expect(card(page, 'main')).toHaveAttribute('data-side', 'left');
  await expect(card(page, 'main')).toContainText('Your work');
  await expect(card(page, 'main')).toContainText('2026');
  await expect(card(page, 'other')).toContainText('Compared with');
  await expect(card(page, 'other')).toContainText('25th Knesset');
  await expect(workSeats(page, 'Likud')).toHaveText('27');
  await expect(refSeats(page, 'Likud')).toHaveText('32');
  await expect(row(page, 'Likud').locator('.cmp-tag')).toHaveText('Same');
  // the change is your work against the compared result, as on the Lists panel (27 against 32)
  await expect(row(page, 'Likud').locator('.cmp-delta bdi').first()).toHaveText(/^▼\s*−5$/);
  // the compared result's seats open no list of your work
  await card(page, 'other').locator('[data-seat]').first().click();
  await expect(page.locator('aside .sp-head')).toHaveCount(0);
  await page.locator('.cmpm-strip .cmpm-side').click(); // the strip's toggle closes it
  await expect(page.locator('.side-by-side')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Coalitions', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.cmpm-strip')).toBeVisible(); // still comparing
});

test('this election’s official result is offered only once something is changed; the first Knesset has no earlier election', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  await picker(page).click();
  await expect(page.getByRole('dialog').last().locator('[data-choice-value="prev"]')).toBeVisible();
  await expect(page.getByRole('dialog').last().locator('[data-choice-value="official"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('.cmpm-strip .cmpm-stop').click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k1');
  await page.locator('.compare-on').click();
  await expect(page.locator('.cmpm-strip')).toContainText('No earlier election to compare with.');
});

test('k25 → k26: copy Likud’s 2022 votes into your work, marked with its origin, recalculated, one Undo', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  const likud = row(page, 'Likud');
  await likud.hover();
  await likud.getByRole('button', { name: 'Copy Likud’s votes into 2026' }).click();
  await expect(box(page)).toContainText('Same share of all eligible voters as in 2022 (16.43%)');
  await expect(box(page)).toContainText('1,204,575 votes');
  await expect(box(page).locator('.cmp-mode').filter({ hasText: 'Same number of votes' })).toContainText('1,115,336');
  await box(page).getByRole('button', { name: 'Copy into 2026' }).click();
  await expect(page.locator('.toast')).toHaveText('Votes copied to 2026. Likud 28 seats.');
  await expect(workSeats(page, 'Likud')).toHaveText('28');
  await expect(likud.locator('.cmp-v').first()).toContainText('1,204,575');
  const mark = likud.locator('.cmp-v .cmp-mark[data-copied]');
  await expect(mark).toHaveText('From 2022');
  await mark.click();
  await expect(page.locator('.cmp-mark-pop')).toContainText('From 2022 (share of eligible voters 16.43%)');
  await expect(page.locator('.cmp-mark-pop')).toContainText('was 1,167,591');
  await page.keyboard.press('Escape');
  await expect(card(page, 'main')).toContainText('1 change from the official result');
  // your work is the open scenario: the Overview shows the copy, marked the same way
  await page.locator('.cmpm-strip .cmpm-side').click(); // the strip's toggle closes it
  await expect(page.locator('.lb-row').filter({ hasText: 'Likud' }).first()).toContainText('28');
  await expect(page.locator('[data-copied]').first()).toContainText('From 2022');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(page.locator('.lb-row').filter({ hasText: 'Likud' }).first()).toContainText('27');
});

test('a copy into the compared result stays there, as its own draft with its own Undo and Start over', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  await row(page, 'Likud').getByRole('button', { name: 'More for Likud' }).click();
  // the row menu has both directions; the second heading is the compared result
  await page.locator('.cmp-menu').getByRole('button', { name: 'Votes…' }).nth(1).click();
  await box(page).getByRole('radio', { name: /Same number of votes/ }).check();
  await box(page).getByRole('button', { name: 'Copy into 2022' }).click();
  await expect(refSeats(page, 'Likud')).not.toHaveText('32');
  await expect(card(page, 'other')).toContainText('draft');
  await expect(workSeats(page, 'Likud')).toHaveText('27'); // your work is untouched
  await expect(card(page, 'main').getByRole('button', { name: 'Undo on 2026' })).toBeDisabled();
  await card(page, 'other').getByRole('button', { name: 'Start over' }).click();
  await expect(refSeats(page, 'Likud')).toHaveText('32');
  await card(page, 'other').getByRole('button', { name: 'Undo on 2022' }).click();
  await expect(refSeats(page, 'Likud')).not.toHaveText('32');
});

test('copy a whole list, then several rows at once', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  await row(page, 'Likud').getByRole('button', { name: 'More for Likud' }).click();
  await page.locator('.cmp-menu').getByRole('button', { name: 'Whole list…' }).first().click();
  const whole = page.locator('dialog[open].cmp-whole');
  await expect(whole).toContainText('Kept from 2026: rules, agreements, bloc and coalition.');
  await expect(whole).toContainText(/Entering \d+, leaving \d+/);
  await whole.getByRole('button', { name: 'Replace', exact: true }).click();
  await expect(workSeats(page, 'Likud')).not.toHaveText('27');
  await expect(row(page, 'Likud').locator('.cmp-mark[data-copied]').first()).toHaveText('From 2022');
  await card(page, 'main').getByRole('button', { name: 'Undo on 2026' }).click();
  await expect(workSeats(page, 'Likud')).toHaveText('27');
  // selection: Likud and Shas, copied as one step
  await row(page, 'Likud').getByRole('checkbox').check();
  await row(page, 'Shas').getByRole('checkbox').check();
  await expect(page.locator('.cmp-selbar')).toContainText('2 selected');
  await page.locator('.cmp-selbar').getByRole('button', { name: 'Copy votes into 2026' }).click();
  await box(page).getByRole('radio', { name: /Same number of votes/ }).check();
  await box(page).getByRole('button', { name: 'Copy into 2026' }).click();
  await expect(workSeats(page, 'Likud')).toHaveText('26');
  await expect(row(page, 'Shas').locator('.cmp-v').first()).toContainText('392,964');
  await card(page, 'main').getByRole('button', { name: 'Undo on 2026' }).click();
  await expect(workSeats(page, 'Likud')).toHaveText('27');
  await expect(row(page, 'Shas').locator('.cmp-mark')).toHaveCount(0);
});

test('a split copies only as a group; nothing is left to check in 2022 → 2026; a new list can be mapped by hand', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  const rz = row(page, 'Religious Zionism–Zehut');
  await expect(rz.locator('.cmp-tag')).toHaveText('Split');
  await rz.hover();
  await expect(rz.getByRole('button', { name: /copy the group/ }).first()).toBeDisabled();
  const line = page.locator('tr.cmp-groupline');
  await expect(line).toContainText('Religious Zionism');
  await expect(line).toContainText('3 lists');
  await expect(line.getByRole('button', { name: 'Copy the group’s votes to 2026' })).toBeVisible();
  const dem = row(page, 'The Democrats');
  await expect(dem.locator('.cmp-tag')).toHaveText('Ran jointly');
  await page.locator('.cmp-toolbar').getByRole('button', { name: /Matching/ }).click();
  const panel = page.locator('dialog[open].cmp-matching');
  await panel.getByRole('button', { name: 'To check', exact: true }).click();
  await expect(panel.locator('.cmp-match-list')).toHaveText('Nothing here.');
  await panel.getByRole('button', { name: 'All', exact: true }).click();
  const yashar = panel.locator('li').filter({ hasText: 'Yashar!' }).first();
  await yashar.getByRole('button', { name: 'Map to…' }).click();
  await expect(yashar.locator('.cmp-mapto li').first()).toContainText('shared candidates');
  await page.keyboard.press('Escape');
  await dem.hover();
  await expect(dem.getByRole('button', { name: /Copy .*’s votes into 2026/ })).toBeEnabled();
});

test('Swap makes 2022 your work; a saved comparison and its link reopen both sides', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await start(page);
  await openSideBySide(page);
  await page.locator('.cmp-swap').click();
  await expect(card(page, 'main')).toContainText('2022');
  await expect(card(page, 'other')).toContainText('2026');
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toContainText('2022');
  await page.locator('.cmp-swap').click();
  await expect(card(page, 'main')).toContainText('2026');
  // a copy into the compared 2022, then share: the link carries both sides
  await row(page, 'Likud').getByRole('button', { name: 'More for Likud' }).click();
  await page.locator('.cmp-menu').getByRole('button', { name: 'Votes…' }).nth(1).click();
  await box(page).getByRole('button', { name: 'Copy into 2022' }).click();
  const copied = await refSeats(page, 'Likud').innerText();
  expect(copied).not.toBe('32');
  await page.getByRole('button', { name: 'Save comparison' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.toast')).toContainText('Comparison saved');
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.locator('.toast')).toContainText('Link copied');
  const link: string = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/#c=[A-Za-z0-9_-]+$/);
  const other = await context.newPage();
  await other.goto(link.replace(/^https?:\/\/[^/]+/, ''));
  await expect(other.locator('.cmp-wb')).toBeVisible({ timeout: 15_000 });
  await expect(other.locator('tr.cmp-row').filter({ has: other.locator('.cmp-rname', { hasText: 'Likud' }) }).first().locator('.cmp-rs')).toHaveText(copied);
  await other.close();
  await expect(page.getByRole('button', { name: 'Saved comparisons' })).toBeVisible();
});

test('k1 → k2: copying the 1949 threshold switches 1951 to experimental rules, marked', async ({ page }) => {
  await start(page, 'en', 'k2');
  await openSideBySide(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'prev');
  await expect(card(page, 'other')).toContainText('1949');
  await expect(row(page, 'Mapai').locator('.cmp-tag')).toHaveText('Same');
  await expect(page.locator('tr.cmp-groupline')).toContainText('4 lists');
  const thr = page.locator('.cmp-band-row[data-key="threshold"]');
  await thr.getByRole('button', { name: 'Copy threshold to 1951' }).click();
  await expect(page.locator('.toast')).toContainText('Copied to 1951.');
  const values = thr.locator('.cmp-band-v');
  await expect(values.first()).toHaveText(await values.last().innerText());
  await expect(page.locator('.cmp-band-row[data-key="rules"] .cmp-band-v').first()).toContainText('experimental');
  await page.getByRole('tab', { name: 'Rules', exact: true }).click();
  await expect(page.locator('[data-copied]').filter({ hasText: 'From 1949' })).toBeVisible();
});

test('phone: tap a row, copy from the sheet; 44px targets and no sideways scroll', async ({ page }) => {
  await start(page, 'en', 'k26', 390);
  await openSideBySide(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  for (const b of await page.locator('tr.cmp-row .cmp-more-btn').all()) { const box = (await b.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44); expect(box.width).toBeGreaterThanOrEqual(44); }
  await row(page, 'Likud').locator('.cmp-rname').click();
  const sheet = page.locator('dialog[open].cmp-sheet');
  await expect(sheet).toContainText('1,115,336 votes');
  for (const b of await sheet.locator('.cmp-menu-item').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await sheet.getByRole('button', { name: 'Votes…', exact: true }).first().click();
  await expect(box(page)).toBeInViewport();
  await box(page).getByRole('button', { name: 'Copy into 2026' }).click();
  await expect(workSeats(page, 'Likud')).toHaveText('28');
  await expect(row(page, 'Likud').locator('.cmp-lname .cmp-mark[data-copied]').first()).toHaveText('From 2022');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test('Hebrew: your work on the right, graphics still left to right, signs unmirrored', async ({ page }) => {
  await start(page, 'he');
  await openSideBySide(page);
  await expect(card(page, 'main')).toHaveAttribute('data-side', 'right');
  const l = (await card(page, 'other').boundingBox())!, r = (await card(page, 'main').boundingBox())!;
  expect(l.x).toBeLessThan(r.x);
  await expect(card(page, 'other')).toContainText('2022');
  const likud = row(page, 'הליכוד');
  expect((await likud.locator('.cmp-ls').boundingBox())!.x).toBeLessThan((await likud.locator('.cmp-rs').boundingBox())!.x);
  await expect(likud.locator('.cmp-delta bdi').first()).toHaveText(/^▼\s*−5$/);
  await likud.hover();
  await likud.getByRole('button', { name: 'העתקת הקולות של הליכוד ל־2026' }).click();
  await expect(box(page)).toContainText('מה נשאר זהה');
  await expect(box(page)).toContainText('אותו חלק מכלל בעלי זכות הבחירה כמו ב־2022');
  await box(page).getByRole('button', { name: 'העתקה ל־2026' }).click();
  await expect(likud.locator('.cmp-v .cmp-mark[data-copied]')).toHaveText('מ־2022');
});

for (const theme of ['light', 'dark'] as const) test(`tags and marks have readable contrast (${theme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  await start(page);
  await openSideBySide(page);
  const likud = row(page, 'Likud');
  await likud.hover();
  await likud.getByRole('button', { name: 'Copy Likud’s votes into 2026' }).click();
  await box(page).getByRole('button', { name: 'Copy into 2026' }).click();
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

test('your work stays on the left in English even when the compared election is later; groups keep their no-seat members', async ({ page }) => {
  await start(page, 'en', 'k25');
  await openSideBySide(page);
  await choose(picker(page), 'election:k26');
  await expect(card(page, 'main')).toHaveAttribute('data-side', 'left');
  await expect(card(page, 'main')).toContainText('2022');
  await expect(card(page, 'other')).toContainText('2026');
  await expect(page.getByRole('checkbox', { name: 'Lists with no seats' })).not.toBeChecked();
  // Balad 2022 (no seats) stays inside the Joint List row; Noam (no seats) inside the Religious Zionism group
  const joint = page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-rname', { hasText: 'Joint List' }) });
  await expect(joint.locator('.cmp-lname')).toContainText('Balad');
  await expect(page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-rname', { hasText: 'Noam' }) })).toBeVisible();
});

test('the share change carries its unit', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  await expect(row(page, 'Likud').locator('.cmp-pp')).toHaveText(/^[−+]2\.89 pp$/);
  await page.locator('.cmp-table th.cmp-mid').getByRole('button').click();
  await expect(page.getByText(/share of valid votes in percentage points/)).toBeVisible();
});

test('an import that puts someone on two lists warns, names both, and removes only on request', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  await row(page, 'Likud').getByRole('button', { name: 'More for Likud' }).click();
  await page.locator('.cmp-menu').getByRole('button', { name: 'Whole list…' }).first().click();
  const dialog = page.locator('dialog[open].cmp-whole');
  const warn = dialog.locator('.cmp-dupes');
  await expect(warn).toContainText('1 on two lists');
  await expect(warn).toContainText('Tally Gotliv · also on Otzma Yehudit');
  await warn.getByRole('button', { name: 'Remove from Otzma Yehudit' }).click();
  await expect(warn).toContainText('removed from Otzma Yehudit');
  await warn.getByRole('button', { name: 'Undo' }).click();
  await expect(warn).toContainText('also on Otzma Yehudit');
  await dialog.getByRole('button', { name: 'Replace', exact: true }).click();
  await expect(row(page, 'Otzma Yehudit').locator('.cmp-mark')).toHaveCount(0);
  await card(page, 'main').getByRole('button', { name: 'Undo on 2026' }).click();
  await row(page, 'Likud').getByRole('button', { name: 'More for Likud' }).click();
  await page.locator('.cmp-menu').getByRole('button', { name: 'Candidates' }).first().click();
  const ask = page.locator('dialog[open].cmp-whole');
  await ask.locator('.cmp-dupes').getByRole('button', { name: 'Remove from Otzma Yehudit' }).click();
  await ask.getByRole('button', { name: 'Copy candidates' }).click();
  await expect(row(page, 'Otzma Yehudit').locator('.cmp-rname .cmp-mark, .cmp-lname .cmp-mark').first()).toHaveText('Edited');
  await expect(row(page, 'Likud').locator('.cmp-mark[data-copied]').first()).toHaveText('From 2022');
});

test('saved comparisons are listed on the Scenarios page with Open, Copy link and Delete', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await start(page);
  await openSideBySide(page);
  await page.getByRole('button', { name: 'Save comparison' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.toast')).toContainText('see Scenarios');
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  const saved = page.locator('.scn-comparisons .scn-card');
  await expect(saved).toHaveCount(1);
  await expect(saved).toContainText('2022 ↔ 2026');
  await saved.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.locator('.toast')).toContainText('Link copied');
  await saved.getByRole('button', { name: 'Open' }).click();
  await expect(page.locator('.cmp-wb')).toBeVisible();
  await page.locator('.cmpm-strip .cmpm-side').click(); // the strip's toggle closes it
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  page.once('dialog', (d) => d.accept());
  await page.locator('.scn-comparisons .scn-card').getByRole('button', { name: /^Delete / }).click();
  await expect(page.locator('.scn-comparisons')).toHaveCount(0);
});
