// Party history and "compared with last time" (docs/features/party-history.md): the panel section and full sheet at
// every level, the row line from Standard (with its Settings switch), Compare's notes and reasons, Hebrew charts drawn
// left to right, the phone sheet, contrast, and that viewing history is never an edit.
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, { lang = 'en', level = 'standard', width = 1500, values = {} }: { lang?: 'en' | 'he'; level?: string; width?: number; values?: Record<string, unknown> } = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, level, values]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2, ...(values as object) } }));
  }, [lang, level, values] as const);
  await page.goto('/');
}
const listRow = (page: Page, name: string) => page.locator('.lb-row', { has: page.locator('.lb-name', { hasText: new RegExp(`^${name}`) }) }).first();
const sheet = (page: Page) => page.locator('dialog[open].ph-sheet');

test('the panel shows the party history and the comparison; the full sheet moves by keyboard and edits nothing', async ({ page }) => {
  await start(page, { level: 'simple' });
  await listRow(page, 'The Democrats').click();
  const sec = page.locator('aside .ph-sec');
  await expect(sec.getByRole('button', { name: 'The Democrats', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(sec.getByRole('button', { name: 'Meretz', exact: true })).toBeVisible();
  await expect(sec.locator('.ph-chain')).toHaveText('Mapai → Labor → The Democrats');
  const line = sec.locator('.ph-cmpline');
  await expect(line).toContainText('Since 2022');
  await expect(line).toContainText('Labor + Meretz');
  await expect(line.locator('.ph-num').first()).toHaveText(/^4 → 8 ▲ \+4$/);
  await expect(line.locator('.ph-cert')).toHaveText('Probable');

  await sec.getByRole('button', { name: 'Full history', exact: true }).click();
  await expect(sheet(page)).toContainText('Ran in 26 of 26 elections');
  await expect(sheet(page).locator('.ph-card')).toContainText('2026 · The Democrats');
  await expect(sheet(page).locator('.ph-card')).toContainText('Elected: The Democrats 7 · Meretz 1');
  await expect(sheet(page).locator('.ph-events')).toContainText('Labor renamed The Democrats');
  await expect(sheet(page).locator('.ph-events')).toContainText('To verify');
  await sheet(page).locator('.ph-bar[aria-pressed="true"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(sheet(page).locator('.ph-card')).toContainText('2022 · Labor');
  await page.keyboard.press('Home');
  await expect(sheet(page).locator('.ph-card')).toContainText('1949 · Mapai');
  // Simple: the exact figures stay folded
  await expect(sheet(page).locator('details.ph-exact')).not.toHaveAttribute('open', '');
  await sheet(page).getByRole('button', { name: 'Meretz', exact: true }).click();
  await expect(sheet(page).locator('.ph-head')).toContainText('Meretz');
  await page.keyboard.press('Escape');
  await expect(sheet(page)).toHaveCount(0);
  // viewing history is not an edit
  await expect(page.locator('.session')).toContainText('No changes');
});

test('Expert opens the exact figures; a joint list without a recorded link is compared as a group or as new', async ({ page }) => {
  await start(page, { level: 'expert' });
  await listRow(page, 'Yashar!').click();
  await expect(page.locator('aside .ph-cmpline[data-kind="new"]')).toContainText('no 2022 list');
  await listRow(page, 'Joint List').click();
  const sec = page.locator('aside .ph-sec');
  await expect(sec.locator('.ph-chips button').first()).toHaveText('Hadash');
  await expect(sec.locator('.ph-cmpline')).toContainText('Hadash–Ta\'al + Balad');
  await sec.getByRole('button', { name: 'Full history', exact: true }).click();
  await expect(sheet(page).locator('details.ph-exact')).toHaveAttribute('open', '');
  await expect(sheet(page).locator('.ph-table tbody tr')).toHaveCount(18);
});

test('the row line shows from Standard once its Settings switch is on', async ({ page }) => {
  await start(page, { values: { lastTimeRows: true } });
  await expect(listRow(page, 'Joint List').locator('.ph-rowline')).toHaveText(/^2022: 5 ▲ \+6 · Hadash–Ta'al \+ Balad$/);
  await expect(listRow(page, 'Yashar!').locator('.ph-rowline')).toHaveText('New · no 2022 list');
  await expect(listRow(page, 'Otzma Yehudit').locator('.ph-rowline')).toContainText('Religious Zionism → 3 lists');
  // unchanged name: the name is left out
  await expect(listRow(page, 'Yisrael Beiteinu').locator('.ph-rowline')).toHaveText(/^2022: 6 ▲ \+1$/);
  const described = await listRow(page, 'Joint List').getAttribute('aria-describedby');
  await expect(page.locator(`[id="${described}"]`)).toContainText('2022: 5 seats (6 more)');
});
for (const [what, level, values] of [['by default', 'standard', {}], ['by default at Expert', 'expert', {}], ['at Simple even when switched on', 'simple', { lastTimeRows: true }]] as const)
  test(`no row line when ${what}`, async ({ page }) => {
    await start(page, { level, values });
    await expect(listRow(page, 'Joint List')).toBeVisible();
    await expect(page.locator('.ph-rowline')).toHaveCount(0);
  });

test('in Hebrew the chart is drawn left to right and every word is Hebrew', async ({ page }) => {
  await start(page, { lang: 'he' });
  await listRow(page, 'הדמוקרטים').click();
  const sec = page.locator('aside .ph-sec');
  await expect(sec.locator('.ph-cmpline')).toContainText('לעומת 2022');
  await expect(sec.locator('.ph-cert')).toHaveText('סביר');
  await sec.getByRole('button', { name: 'היסטוריה מלאה', exact: true }).click();
  const bars = sheet(page).locator('.ph-bar');
  const first = (await bars.first().boundingBox())!, last = (await bars.last().boundingBox())!;
  expect(first.x).toBeLessThan(last.x);
  await expect(sheet(page).locator('.ph-events')).toContainText('העבודה שינתה את שמה לדמוקרטים');
  await expect(sheet(page).locator('.ph-events')).not.toContainText(/[A-Za-z]{3,}/);
});

test('Compare tags the Democrats as ran jointly, notes the comparison under the later list and explains it', async ({ page }) => {
  await start(page);
  await page.locator('#tab-compare').click();
  const row = (name: string) => page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-rname', { hasText: name }) }).first();
  await expect(row('The Democrats').locator('.cmp-tag')).toHaveText('Ran jointly');
  await expect(row('The Democrats').locator('.ph-cmpnote')).toHaveText(/^= Labor, renamed \+ Meretz 2022\s*Probable$/);
  await expect(row('Likud').locator('.ph-cmpnote')).toHaveText(/^not counted: New Hope.* ran inside National Unity in 2022$/);
  await expect(row('Shas').locator('.ph-cmpnote')).toHaveCount(0);
  await page.getByRole('button', { name: 'Matching', exact: true }).click();
  const panel = page.locator('dialog[open].cmp-matching');
  await panel.getByRole('button', { name: 'All', exact: true }).click();
  const dem = panel.locator('li').filter({ hasText: 'Labor + Meretz' });
  await expect(dem).toContainText('The Democrats (2026) is compared with Labor (4 seats) and Meretz (0 seats) in 2022, taken together.');
  await expect(dem).toContainText('How sure: Probable');
  await expect(dem).toContainText('Labor renamed The Democrats (2024)');
  await expect(dem).not.toContainText('labor-democrats-rename');
});

test('each pairing in Compare says what is compared with what, why and how sure, behind the (i) by its tag', async ({ page }) => {
  await start(page);
  await page.locator('#tab-compare').click();
  const row = (name: string) => page.locator('tr.cmp-row').filter({ has: page.locator('.cmp-rname', { hasText: name }) }).first();
  await row('Joint List').getByRole('button', { name: 'Why this pairing: Joint List' }).click();
  const pop = page.locator('.pop').filter({ hasText: 'This pairing' });
  await expect(pop).toContainText('Joint List (2026) is compared with Hadash–Ta\'al (5 seats) and Balad (0 seats) in 2022, taken together.');
  await expect(pop).toContainText('Why: Same leading party: Hadash.');
  await expect(pop).toContainText('How sure: Confirmed');
  await expect(pop).toContainText('A joint list’s votes are never divided among its parties.');
  await page.keyboard.press('Escape');
  await row('Likud').getByRole('button', { name: 'Why this pairing: Likud' }).click();
  await expect(page.locator('.pop').filter({ hasText: 'This pairing' })).toContainText('Not counted: New Hope');
  await page.keyboard.press('Escape');
  await row('The Democrats').getByRole('button', { name: /^Why this pairing/ }).click();
  const dem = page.locator('.pop').filter({ hasText: 'This pairing' });
  await expect(dem).toContainText('Labor renamed The Democrats (2024)');
  await expect(dem.getByRole('link', { name: /IDI/ })).toBeVisible();
});

test('the chart names its events, explains where they sit, and marks the chosen election without a dashed box', async ({ page }) => {
  await start(page);
  await listRow(page, 'Likud').click();
  const sec = page.locator('aside .ph-sec');
  // the panel chart's lines have a key in words
  await expect(sec.locator('.ph-legend')).toContainText('Merger, split or new name');
  await sec.getByRole('button', { name: 'Full history', exact: true }).click();
  const chart = sheet(page).locator('.ph-chart');
  await expect(chart.locator('.ph-flag text')).toHaveText(['Merged (probable)', 'Merged (probable)', 'Faction split', 'Faction split']);
  await expect(chart).not.toContainText('?');
  await expect(chart.locator('.ph-selband')).toHaveCount(1);
  await expect(chart.locator('.ph-axis.sel')).toHaveText('’26');
  // the list below numbers the same events; no "?" or letter glyphs
  await expect(sheet(page).locator('.ph-events .ph-evdot')).toHaveText(['1', '2', '3', '4']);
  await sheet(page).getByRole('button', { name: 'Where events are drawn' }).click();
  await expect(page.locator('.pop').filter({ hasText: 'Where events are drawn' })).toContainText('89% of the way from the 2003 election to the 2006 one');
  // a weak link is dashed and says so in words
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await listRow(page, 'The Democrats').click();
  await sec.getByRole('button', { name: 'Full history', exact: true }).click();
  await expect(sheet(page).locator('.ph-ev.weak .ph-flag text')).toContainText('Union agreed (provisional)');
  await expect(sheet(page).locator('.ph-legend')).toContainText('Dashed: not yet established');
});

test('in Hebrew the event flags and the event key are Hebrew', async ({ page }) => {
  await start(page, { lang: 'he' });
  await listRow(page, 'הליכוד').click();
  await page.locator('aside .ph-sec').getByRole('button', { name: 'היסטוריה מלאה', exact: true }).click();
  await expect(sheet(page).locator('.ph-flag text').first()).toHaveText('איחוד (סביר)');
  await expect(sheet(page).locator('.ph-legend')).toContainText('איחוד, פילוג או שם חדש');
});

test('on a phone a crowded chart numbers its events, matching the list below', async ({ page }) => {
  await start(page, { width: 390 });
  await listRow(page, 'The Democrats').click();
  await page.locator('aside .ph-sec').getByRole('button', { name: 'Full history', exact: true }).click();
  await expect(sheet(page).locator('.ph-evnum text')).toHaveText(['1', '2', '3', '4', '5,6,7']);
  await expect(sheet(page).locator('.ph-flag')).toHaveCount(0);
});

test('on a phone the full history fills the screen', async ({ page }) => {
  await start(page, { width: 390 });
  await listRow(page, 'The Democrats').click();
  await page.locator('aside .ph-sec').getByRole('button', { name: 'Full history', exact: true }).click();
  const box = (await sheet(page).boundingBox())!;
  expect(Math.round(box.width)).toBe(390);
  const chart = (await sheet(page).locator('.ph-chart').boundingBox())!;
  expect(chart.height).toBeGreaterThan(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

for (const theme of ['light', 'dark'] as const) test(`history text and chips have readable contrast (${theme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  await start(page);
  await listRow(page, 'The Democrats').click();
  await page.locator('aside .ph-sec').getByRole('button', { name: 'Full history', exact: true }).click();
  await expect(sheet(page).locator('.ph-events')).toBeVisible();
  const ratios = await page.locator('.ph-rowline, .ph-cmpline, .ph-cert, .ph-legend span, .ph-chain, .ph-card div, .ph-events li > span:not(.ph-evmeta):not(.ph-evdot)').evaluateAll(nodes => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = (color: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const light = (c: number[]) => c.slice(0, 3).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const bg = (el: Element | null): string => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (rgb(c)[3] === 255) return c; } return getComputedStyle(document.body).backgroundColor; };
    return nodes.filter(n => n.getClientRects().length).map(n => { const f = light(rgb(getComputedStyle(n).color)), b = light(rgb(bg(n))); return { text: n.textContent, ratio: (Math.max(f, b) + .05) / (Math.min(f, b) + .05) }; });
  });
  expect(ratios.length).toBeGreaterThan(10);
  for (const r of ratios) expect(r.ratio, r.text ?? '').toBeGreaterThanOrEqual(4.5);
});
