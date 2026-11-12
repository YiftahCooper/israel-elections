// Comparing as a mode (Design A): the strip, what it compares with, Swap and Stop comparing; the Lists panel, the seat
// chart switch and the Copy votes box while comparing; Side by side opened from the strip.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

export async function start(page: Page, lang: 'en' | 'he' = 'en', level = 'standard', width = 1500, values: Record<string, unknown> = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, level, values]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2, ...(values as object) } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional', comparison: 'reference', jointSeats: 'off' }));
  }, [lang, level, values] as const);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const strip = (page: Page) => page.locator('.cmpm-strip');
const picker = (page: Page) => strip(page).getByRole('button', { name: 'Compare with', exact: true });
const turnOn = (page: Page) => page.locator('.compare-on').click();

test('comparing starts on the previous election, follows the election opened, and stops', async ({ page }) => {
  await start(page);
  await expect(strip(page)).toHaveCount(0);
  await turnOn(page);
  await expect(picker(page)).toHaveAttribute('data-value', 'prev');
  await expect(picker(page)).toContainText('2022 · 25th Knesset · Official result');
  // the strip stays while moving between screens
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await expect(strip(page)).toBeVisible();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  // the previous election follows the election you open
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(picker(page)).toContainText('2021 · 24th Knesset');
  await strip(page).getByRole('button', { name: 'Stop comparing' }).click();
  await expect(strip(page)).toHaveCount(0);
  await expect(page.locator('.compare-on')).toBeVisible();
});

test('a chosen election stays; the first Knesset has nothing earlier', async ({ page }) => {
  await start(page);
  await turnOn(page);
  await choose(picker(page), 'election:k1');
  await expect(picker(page)).toContainText('1949');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(picker(page)).toContainText('1949');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k1');
  await expect(strip(page)).toContainText('Nothing to compare');
  await strip(page).getByRole('button', { name: 'Stop comparing' }).click();
  await turnOn(page);
  await expect(strip(page)).toContainText('No earlier election to compare with.');
  // the menu still offers everything else
  await choose(picker(page), 'election:k2');
  await expect(picker(page)).toContainText('1951');
});

test('Swap makes 2022 your work and keeps 2026 as an unsaved draft; Swap again brings it back with its Undo', async ({ page }) => {
  await start(page);
  await page.locator('.lb-row').first().click();
  const input = page.locator('aside input[aria-label="Votes"]').first();
  await input.fill('1300000'); await input.press('Enter');
  await page.keyboard.press('Escape');
  await expect(page.locator('.lb-row').first()).toContainText('29');
  await turnOn(page);
  await strip(page).getByRole('button', { name: 'Swap', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toContainText('2022');
  await expect(page.locator('.lb-row').first()).toContainText('Likud');
  await expect(page.locator('.lb-row').first()).toContainText('32');
  await expect(picker(page)).toHaveAttribute('data-value', 'swapped');
  await expect(picker(page)).toContainText('2026');
  await strip(page).getByRole('button', { name: 'Swap', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toContainText('2026');
  await expect(page.locator('.lb-row').first()).toContainText('29');
  await expect(picker(page)).toContainText('2022');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(page.locator('.lb-row').first()).toContainText('27');
});

test('a saved scenario of another election can be the reference', async ({ page }) => {
  await start(page);
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('israel-elections:v1') ?? '{}');
    raw.saved = [{ id: 'sv22', name: 'My 2022', electionId: 'k25', savedAt: '2026-11-12T00:00:00Z', baseBuiltAt: '', log: [] }];
    localStorage.setItem('israel-elections:v1', JSON.stringify(raw));
  });
  await page.reload();
  await turnOn(page);
  await choose(picker(page), 'saved:sv22');
  await expect(picker(page)).toContainText('My 2022');
});

const row = (page: Page, name: string) => page.locator('.lb li').filter({ has: page.getByRole('button', { name, exact: true }) });
test('the Lists panel shows each list in 2022: a striped bar and a line; new and gone lists say so', async ({ page }) => {
  await start(page);
  await expect(page.locator('.cmpm-refbar')).toHaveCount(0);
  await turnOn(page);
  await expect(page.locator('.cmpm-legend')).toContainText('2026');
  await expect(row(page, 'Likud')).toContainText(/2022: 32 ▼ [−-]5 · Likud/);
  await expect(row(page, 'Likud').locator('.cmpm-refbar')).toHaveCount(1);
  await expect(row(page, 'Together (Bennett)')).toContainText('Yesh Atid (joined)');
  await expect(row(page, 'Yashar!')).toContainText('2022: no list of its own (new)');
  await expect(row(page, 'Yashar!').locator('.cmpm-refbar')).toHaveCount(0);
  const only = page.locator('.cmpm-only');
  await expect(only.locator('summary')).toContainText('In 2022 only');
  await only.locator('summary').click();
  await expect(only).toContainText('The Jewish Home');
  // stopping takes the comparison away again
  await strip(page).getByRole('button', { name: 'Stop comparing' }).click();
  await expect(page.locator('.cmpm-line')).toHaveCount(0);
});

test('Settings can turn the striped bars off; the line stays', async ({ page }) => {
  await start(page, 'en', 'simple', 1500, { compareBars: false });
  await turnOn(page);
  await expect(row(page, 'Likud')).toContainText(/2022: 32 ▼ [−-]5/);
  await expect(page.locator('.cmpm-refbar')).toHaveCount(0);
  await expect(page.locator('.cmpm-legend')).toHaveCount(0);
});

test('the seat chart switch shows the 2022 chamber in the same place; its seats open no list', async ({ page }) => {
  await start(page);
  await turnOn(page);
  const sw = page.getByRole('group', { name: 'The seat chart shows' });
  await expect(sw.getByRole('button', { name: '2026' })).toHaveAttribute('aria-pressed', 'true');
  await sw.getByRole('button', { name: '2022' }).click();
  await expect(page.locator('.cmpm-chamber-note')).toContainText('Showing 2022');
  await expect(page.locator('.chamber-panel')).toContainText('Yesh Atid');
  await page.locator('.chamber-panel .chamber circle').first().click();
  await expect(page.locator('.panel-slot')).toHaveCount(0);
  await sw.getByRole('button', { name: '2026' }).click();
  await expect(page.locator('.cmpm-chamber-note')).toHaveCount(0);
  await expect(page.locator('.chamber-panel')).toContainText('Yashar!');
  // stopping the comparison takes the switch away
  await strip(page).getByRole('button', { name: 'Stop comparing' }).click();
  await expect(sw).toHaveCount(0);
});

const box = (page: Page) => page.locator('dialog[open].cmpm-copy');
const copyLikud = async (page: Page) => {
  await row(page, 'Likud').getByRole('button', { name: 'Likud', exact: true }).click();
  await row(page, 'Likud').locator('.cmpm-copy-btn').click();
};
test('Copy votes at Standard: three methods, each with its figure and result; the copy is marked and one Undo', async ({ page }) => {
  await start(page);
  await turnOn(page);
  await copyLikud(page);
  const methods = box(page).locator('.cmp-mode');
  await expect(methods).toHaveCount(3);
  // eligible voters first, then valid votes, then the number (Likud 2022: 1,115,336 of 6,788,804 eligible)
  await expect(methods.nth(0)).toContainText('Same share of all eligible voters as in 2022 (16.43%)');
  await expect(methods.nth(0)).toContainText('1,204,575');
  await expect(methods.nth(0)).toContainText(/27 → 28/);
  await expect(methods.nth(1)).toContainText('Same share of the valid votes as in 2022 (23.41%)');
  await expect(methods.nth(1)).toContainText('1,332,255');
  await expect(methods.nth(2)).toContainText('Same number of votes as in 2022 (1,115,336)');
  await expect(methods.nth(2)).toContainText(/27 → 26/);
  await expect(methods.nth(0).locator('input')).toBeChecked();
  await expect(box(page).getByRole('combobox', { name: 'Extra votes come from' })).toHaveValue('proportional');
  await box(page).getByRole('button', { name: 'Copy into 2026' }).click();
  await expect(box(page)).toHaveCount(0);
  await expect(row(page, 'Likud').locator('.lb-seats b')).toHaveText('28');
  // marked like any edit, naming where it came from
  await expect(page.locator('[data-copied]').first()).toContainText('From 2022');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(row(page, 'Likud').locator('.lb-seats b')).toHaveText('27');
});

test('Copy votes at Simple is one sentence; at Expert the two edit-copying methods wait for an edited source', async ({ page }) => {
  await start(page, 'en', 'simple');
  await turnOn(page);
  await copyLikud(page);
  await expect(box(page).locator('.cmp-mode')).toHaveCount(0);
  await expect(box(page).locator('.cmpm-copy-sentence')).toContainText('Likud gets the same share of all eligible voters as in 2022 (16.43%)');
  await expect(box(page).locator('.cmpm-copy-sentence')).toContainText('1,204,575');
  await box(page).getByRole('button', { name: 'Cancel' }).click();
  await page.evaluate(() => { const raw = JSON.parse(localStorage.getItem('israel-elections:v1') ?? '{}'); localStorage.setItem('israel-elections:v1', JSON.stringify({ ...raw, level: 'expert' })); });
  await page.reload();
  await turnOn(page);
  await copyLikud(page);
  const methods = box(page).locator('.cmp-mode');
  await expect(methods).toHaveCount(5);
  await expect(methods.nth(3).locator('input')).toBeDisabled();
  await expect(methods.nth(3)).toContainText('Only when 2022 was edited');
});

test('Copy votes for every list from the top of the Lists panel; Always makes the method the default', async ({ page }) => {
  await start(page);
  await turnOn(page);
  await page.locator('.cmpm-copy-all').click();
  await expect(box(page).locator('.cmpm-copy-ticks input')).not.toHaveCount(0);
  await box(page).getByRole('radio', { name: /Same number of votes/ }).check();
  await box(page).getByRole('radio', { name: 'Always' }).check();
  await box(page).getByRole('button', { name: 'Copy into 2026' }).click();
  await expect(page.locator('.toast, [role="status"]').filter({ hasText: 'Votes copied from 2022 for' }).first()).toBeVisible();
  // one step: Undo puts every list back
  await expect(page.getByRole('button', { name: /^Undo:/ })).toBeVisible();
  await copyLikud(page);
  await expect(box(page).getByRole('radio', { name: /Same number of votes/ })).toBeChecked();
});

test('Turnout follows the compared result and copies eligible voters and turnout from it', async ({ page }) => {
  await start(page, 'en', 'expert');
  await turnOn(page);
  await page.getByRole('tab', { name: 'Turnout', exact: true }).click();
  const fact = (id: string) => page.locator(`.tn-fact[data-fact="${id}"]`);
  await expect(fact('registered').locator('.tn-since')).toContainText('since 2022');
  await fact('registered').getByRole('button', { name: 'Copy 2022\'s eligible voters' }).click();
  await expect(page.locator('.toast').filter({ hasText: 'Eligible voters copied from 2022.' })).toBeVisible();
  await expect(fact('registered').locator('.tn-v')).toContainText('6,788,804');
  await expect(fact('registered').locator('.tn-since')).toContainText('±0');
  await fact('turnout').getByRole('button', { name: 'Copy 2022\'s turnout' }).click();
  await expect(page.locator('.toast').filter({ hasText: 'Turnout copied from 2022.' })).toBeVisible();
  await expect(fact('turnout').locator('.tn-since')).toHaveText(/^0 pp since 2022/);
  // invalid ballots too, at Expert
  await expect(fact('invalid').getByRole('button', { name: 'Copy 2022\'s invalid ballots' })).toBeVisible();
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(fact('registered').locator('.tn-v')).toContainText('6,788,804');
});

test('Rules (Expert) copies the threshold, the rules or the surplus agreements; Blocs and Coalitions show 2022 beside yours', async ({ page }) => {
  await start(page, 'en', 'expert');
  await turnOn(page);
  // Blocs on the Overview: 2022's own grouping under yours
  await expect(page.locator('.cmpm-refblocs')).toContainText('2022');
  await expect(page.locator('.cmpm-refblocs .corridor').first()).toContainText('64');
  await page.getByRole('tab', { name: 'Rules', exact: true }).click();
  const row = page.locator('.cmpm-rules-copy');
  await expect(row).toContainText('The threshold 3.25%');
  await row.getByRole('button', { name: 'Copy 2022\'s threshold' }).click();
  await expect(page.locator('.toast').filter({ hasText: 'Already the same.' })).toBeVisible();
  await row.getByRole('button', { name: 'Copy 2022\'s surplus agreements' }).click();
  await expect(page.locator('.toast').filter({ hasText: /Surplus agreements copied from 2022\. \d+ not copied: no counterpart\./ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Undo:/ })).toBeVisible();
  // Coalitions: each partner's 2022 seats and their lists' 2022 total
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await page.locator('.coal-choice').first().getByRole('button', { name: 'In', exact: true }).click();
  await expect(page.locator('.coal-partners li').filter({ hasText: 'Likud' }).locator('.cmpm-coal-ref')).toHaveText('2022: 32');
  await expect(page.locator('.cmpm-coal-total').first()).toContainText('Their lists in 2022: 32');
});
