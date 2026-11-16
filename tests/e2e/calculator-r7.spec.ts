// Round 7 calculator fixes: the election list downloads nothing to draw its strips; list pickers show each list's mark.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, level = 'standard') {
  await page.addInitScript((level) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); }, level);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k26');
}

test('opening the election list downloads no election: every strip comes with the list', async ({ page }) => {
  const fetched: string[] = [];
  await start(page);
  page.on('request', (r) => { if (/\/data\/k\d+\.json/.test(r.url())) fetched.push(r.url()); });
  await page.getByRole('button', { name: 'Election', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Election' });
  await expect(dialog.locator('.choice-option[data-choice-value="k1"] .result-preview i').first()).toBeVisible();
  await expect(dialog.locator('.preview-loading')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(fetched).toEqual([]);
  await dialog.locator('[data-choice-value="k25"]').click();
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k25');
  expect(fetched.filter((u) => u.endsWith('/k25.json'))).toHaveLength(1);
});

test('list pickers show each list’s logo or colour dot', async ({ page }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.locator('.lb-row').filter({ hasText: "Hadash–Ta'al" }).first().click();
  const partner = page.locator('.side-panel .agreement-partner .choice-trigger');
  await partner.click();
  const dialog = page.locator(`[id="${await partner.getAttribute('aria-controls')}"]`);
  // every list option has a mark (Ra'am: its logo)
  await expect(dialog.locator('.choice-option[data-choice-value="25-עם"] .list-mark')).toBeVisible();
  const options = dialog.locator('.choice-option[data-choice-value]:not([data-choice-value=""])');
  expect(await options.count()).toBeGreaterThan(5);
  expect(await options.locator('.list-mark').count()).toBe(await options.count());
});

test('a bloc name typed in one language is its name in both', async ({ page }) => {
  await start(page);
  await page.locator('.blocs').getByRole('button', { name: 'Edit blocs', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Bloc name' }).first();
  await input.fill('My bloc'); await input.press('Enter');
  await page.keyboard.press('Escape');
  await expect(page.locator('.blocs')).toContainText('My bloc');
  await page.getByRole('button', { name: 'עברית' }).click();
  await expect(page.locator('.blocs')).toContainText('My bloc');
  await expect(page.locator('.board-choices .choice-trigger')).toContainText('גושים מותאמים');
});

test('a mouse user can switch a table to exact values from the note a value opens', async ({ page }) => {
  await start(page);
  const value = page.locator('.lb-row').first().locator('.percentage[data-rounded]').first();
  const rounded = await value.textContent();
  await value.hover();
  const note = page.getByRole('tooltip').filter({ hasText: 'the exact share' });
  await expect(note).toBeVisible();
  await note.hover();
  await note.getByRole('button', { name: 'Exact values' }).click();
  await expect(value).not.toHaveText(rounded!);
  await expect(value).toHaveAttribute('data-exact');
});

// Turnout's "All elections" charts: the compared election sits in a soft grey band in both charts, named in a key; the
// Turnout (%) line can be turned off in Settings (turnoutHistoryLine).
test('the compared election has a grey band and a key; the turnout line can be turned off', async ({ page }) => {
  await start(page, 'expert');
  await page.locator('.compare-on').click();
  await page.getByRole('tab', { name: 'Turnout', exact: true }).click();
  const hist = page.locator('.tn-history');
  await expect(hist.locator('.tn-key')).toContainText('2022');
  await expect(hist.locator('.tn-key')).toContainText('compared');
  await expect(hist.locator('rect.tn-cmp')).toHaveCount(2);
  await expect(hist.locator('.tn-panel')).toHaveCount(2);
  await page.locator('.cmpm-strip').getByRole('button', { name: /^Stop comparing/ }).click();
  await expect(hist.locator('.tn-key')).toHaveCount(0);
  await expect(hist.locator('rect.tn-cmp')).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, turnoutHistoryLine: false } })));
  await page.reload();
  await page.getByRole('tab', { name: 'Turnout', exact: true }).click();
  await expect(page.locator('.tn-history .tn-panel')).toHaveCount(1);
  await expect(page.locator('.tn-history')).not.toContainText('Turnout (%)');
});

// A scenario carries no viewer settings: opening someone's link leaves this viewer's settings and remembered answers
// as they were (the scenario's own choices, such as counting joint lists by party, stay inside the scenario).
test('opening a shared scenario leaves the viewer’s settings and remembered answers unchanged', async ({ page, browser }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.locator('.lb-row').filter({ hasText: 'Likud' }).first().click();
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await page.locator('.coal-choice').first().getByRole('button', { name: 'In', exact: true }).click();
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await page.getByRole('button', { name: 'Copy a share link', exact: true }).click();
  const link = await page.getByRole('textbox', { name: 'Share link', exact: true }).inputValue();
  const ctx = await browser.newContext();
  const viewer = await ctx.newPage();
  const settings = { starterTip: false, decimals: 3, theme: 'dark', textSize: 'large', compareWith: 'official' };
  const preferences = { voteSource: 'proportional', comparison: 'official', jointSeats: 'off' };
  await viewer.addInitScript(([settings, preferences]) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'he', level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: settings }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify(preferences)); }, [settings, preferences] as const);
  await viewer.goto(link);
  await expect(viewer.getByRole('button', { name: 'החלפת תרחיש' })).toContainText('תרחיש משותף');
  await viewer.waitForTimeout(500);
  const stored = await viewer.evaluate(() => ({ v1: JSON.parse(localStorage.getItem('israel-elections:v1') ?? '{}'), settings: JSON.parse(localStorage.getItem('israel-elections:settings') ?? '{}'), preferences: JSON.parse(localStorage.getItem('israel-elections:preferences') ?? '{}') }));
  expect(stored.v1).toMatchObject({ lang: 'he', level: 'expert' });
  expect(stored.settings.values).toMatchObject(settings);
  expect(stored.preferences).toEqual(preferences);
  await ctx.close();
});
