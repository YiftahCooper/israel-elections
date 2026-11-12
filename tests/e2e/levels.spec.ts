import { TOOL_FEATURES } from '../../src/app/features.ts';
// The three interface levels: Simple (minimal), Standard (common, consequential edits) and Expert
// (every tool). A level changes what is shown, never what is computed.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const SETTINGS = 'israel-elections:v1';
const start = async (page: Page, settings: Record<string, unknown> = {}) => {
  await page.addInitScript(([key, value]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', '1'); } }, [SETTINGS, JSON.stringify({ lang: 'en', ...settings })]);
  await page.goto('/');
  await expect(listCard(page, 'Likud')).toBeVisible();
};
const levelButton = (page: Page, name: string) => page.getByRole('group', { name: 'Detail level' }).getByRole('button', { name, exact: true });
// a list's row button is named by the list (agreement buttons are named "Surplus-vote agreement with …")
const listCard = (page: Page, name: string) => page.getByRole('region', { name: 'Lists' }).getByRole('button', { name, exact: true });
// a list's row is the button itself (its numbers are its description)
const listRow = (page: Page, name: string) => listCard(page, name);
const analysisTabs = (page: Page) => page.getByRole('navigation', { name: 'Tools' }).getByRole('tab');
const TOOL_COUNT = TOOL_FEATURES.length; // the Overview, Scenarios and every tool, listed at every level
const details = (page: Page) => page.getByRole('region', { name: 'List details' });

test('a first visit opens in Simple with only the essential controls', async ({ page }) => {
  await start(page);
  await expect(levelButton(page, 'Simple')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Pick a list. Try a change.' })).toBeVisible();
  // every tool is listed; this level's own come first
  await expect(analysisTabs(page)).toHaveCount(TOOL_COUNT);
  await expect(analysisTabs(page).first()).toHaveText('Overview');
  await expect(page.getByRole('button', { name: 'Start over' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Scenario name' })).toHaveCount(0);

  await listCard(page, 'Likud').click();
  await expect(details(page).getByText(/^Who gets in \((first 10 of )?\d+\)$/)).toBeVisible();
  await expect(details(page).getByLabel('Votes', { exact: true })).toBeVisible();
  await expect(details(page).getByRole('combobox')).toHaveCount(0);
  await expect(details(page).getByRole('checkbox', { name: 'Withdrawn from the race' })).toHaveCount(0);
});

test('Standard adds scenario management and consequential list edits, but not identity editing', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await expect(analysisTabs(page)).toHaveCount(TOOL_COUNT);
  await expect(page.getByRole('tab', { name: 'Merge & split', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Save & share/ }).click();
  await expect(page.getByRole('button', { name: 'Save in this browser' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Save & share/ }).click();
  await expect(page.getByRole('textbox', { name: 'Scenario name' })).toBeVisible();
  await page.keyboard.press('Escape');

  await listCard(page, 'Likud').click();
  await expect(details(page).getByRole('combobox', { name: 'Votes come from' })).toBeVisible();
  await expect(details(page).getByRole('checkbox', { name: 'Withdrawn from the race' })).toBeVisible();
  await expect(details(page).getByRole('combobox', { name: 'Agreement partner' })).toHaveValue(/.+/);
  await expect(details(page).getByLabel('Short name (English)')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Chamber layout' })).toHaveCount(0);
});

test('Expert shows every tool, including identity editing and chamber display options', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Expert').click();
  await expect(analysisTabs(page)).toHaveCount(TOOL_COUNT);
  await expect(page.getByRole('group', { name: 'Chamber layout' })).toBeVisible();
  await listCard(page, 'Likud').click();
  await expect(details(page).getByLabel('Short name (English)')).toBeVisible();
  await expect(details(page).getByRole('button', { name: 'Move up' }).first()).toBeVisible();
});

test('unsupported stored levels fall back to Simple without migration', async ({ page }) => {
  await start(page, { level: 'advanced' });
  await expect(levelButton(page, 'Simple')).toHaveAttribute('aria-pressed', 'true');
});

test('the chosen level and a dismissed hint survive a reload', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await levelButton(page, 'Standard').click();
  await page.reload();
  await expect(levelButton(page, 'Standard')).toHaveAttribute('aria-pressed', 'true');
  await levelButton(page, 'Simple').click();
  await expect(page.getByRole('status').filter({ hasText: 'Pick a list. Try a change.' })).toHaveCount(0);
});

test('Simple asks where added votes come from too, with each answer’s effect in view (owner, 9 Nov)', async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('ask-simple')) { localStorage.setItem('israel-elections:preferences', '{}'); sessionStorage.setItem('ask-simple', '1'); } });
  await start(page);
  await levelButton(page, 'Simple').click();
  // Simple rows show shares, not vote counts: read Yashar!'s votes in its details first
  await listCard(page, 'Yashar!').click();
  const votes = details(page).getByLabel('Votes', { exact: true });
  const yashar = await votes.inputValue();
  await listCard(page, 'Likud').click();
  await votes.fill('1300000');
  await votes.press('Enter');
  const ask = page.getByRole('dialog', { name: 'Votes come from', exact: true });
  await expect(ask).toBeVisible();
  // the two answers Simple offers, each with its consequence; no single-list transfers at Simple
  await expect(ask.locator('.source-consequences li')).toHaveCount(2);
  await expect(ask.locator('.source-consequences')).toContainText('Turnout stays the same');
  await expect(ask.locator('.source-consequences')).toContainText('Turnout changes');
  await expect(ask.getByRole('combobox').locator('optgroup')).toHaveCount(0);
  for (const scope of ['Just this once', 'For this list', 'Always']) await expect(ask.getByRole('radio', { name: scope, exact: true })).toBeVisible();
  await ask.getByRole('combobox').selectOption('new');
  await expect(ask.locator('.source-consequences li[data-chosen]')).toContainText('New voters');
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(votes).toHaveValue('1,300,000');
  // new voters leave the other lists' votes alone
  await listCard(page, 'Yashar!').click();
  await expect(votes).toHaveValue(yashar);
});

// ---- review findings: nothing that changes the result may vanish when switching to a lower level

test('Simple still shows a list’s surplus agreement and its state', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await listCard(page, 'Likud').click();
  await details(page).getByRole('checkbox', { name: 'In force' }).uncheck();
  await levelButton(page, 'Simple').click();
  await expect(details(page).getByText(/With Religious Zionism–Zehut · switched off/)).toBeVisible();
});

test('rules changed by an experimental preset are named at every level, and no zero seat price is shown', async ({ page }) => {
  await start(page);
  await page.getByRole('tab', { name: 'What if…' }).click();
  await page.getByRole('button', { name: /^More questions/ }).click(); // Simple starts with the first few
  await page.getByRole('listitem').filter({ hasText: 'Pure proportional representation' }).getByRole('button', { name: 'Open as a scenario' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Alternative electoral system' })).toContainText('remainder seats by Sainte-Laguë (law: Bader–Ofer)');
  await expect(page.locator('.fig').filter({ hasText: 'Threshold' })).toContainText('None');
  await page.getByRole('button', { name: 'Experimental rules', exact: true }).click();
  await expect(page.getByRole('tooltip')).toContainText('not a legally possible Israeli result');
  // a method without a quota stage has no general quota: no "votes per seat" figure at all
  await expect(page.getByRole('button', { name: /^Votes per seat/ })).toHaveCount(0);
});

test('the bloc of a list can be changed in Standard', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await listCard(page, 'Likud').click();
  await details(page).getByRole('combobox', { name: 'Bloc', exact: true }).selectOption({ label: 'None' });
  await expect(page.getByRole('region', { name: 'Seats by bloc' }).getByRole('button', { name: /^Netanyahu bloc/ })).toContainText('26');
});

test('a chosen maximum of decimal places applies at every level', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Expert').click();
  await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('group', { name: 'Max decimal places', exact: true }).getByRole('button', { name: '3', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Overview' }).click();
  await expect(listRow(page, 'Likud').first()).toContainText('20.515%');
  await levelButton(page, 'Simple').click();
  await expect(listRow(page, 'Likud').first()).toContainText('20.515%');
});

test('a failed election load keeps the open election and offers a retry', async ({ page }) => {
  await page.route('**/data/k25.json', (route) => route.fulfill({ status: 404, body: 'missing' }));
  await start(page);
  // This test expects refusal, so do not use choose()'s successful-load barrier.
  await page.getByRole('button', { name: 'Election', exact: true }).click();
  await page.getByRole('dialog').locator('[data-choice-value="k25"]').click();
  await expect(page.getByRole('alert').filter({ hasText: /Could not load the 2022 · 25th Knesset election data/ })).toBeVisible();
  await expect(page.getByRole('alert').getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(listRow(page, 'Likud').first()).toContainText('27');
});

test('the picker labels the open election correctly even if the index omits it', async ({ page }) => {
  const rows = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string }[];
  await page.route('**/data/elections.json', (route) => route.fulfill({ json: rows.filter((r) => r.id !== 'k26') }));
  await start(page);
  // wait until the (routed) index has replaced the built-in fallback, which does list 2026
  await page.getByRole('button', { name: 'Election', exact: true }).click();
  await expect(page.getByRole('dialog').locator('[data-choice-value="k16"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k26');
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toContainText('2026 · 26th Knesset');
});

test('a tool opened from its tab shows at once at every level, with no second disclosure', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'standard', hintDismissed: true })));
  await page.goto('/');
  // an Expert tool at Standard: its tab says so, and opening it shows the tool itself
  await page.getByRole('tab', { name: /^Rules/ }).click();
  await expect(page.getByRole('heading', { name: 'Electoral rules', exact: true })).toBeVisible();
});
