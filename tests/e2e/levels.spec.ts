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
// a card is named by its list; agreement chips mention the partner, so match the name exactly
const listCard = (page: Page, name: string) => page.getByRole('region', { name: 'Lists' }).getByRole('button').filter({ has: page.getByText(name, { exact: true }) });
const analysisTabs = (page: Page) => page.getByRole('tablist', { name: 'Analysis' }).getByRole('tab');
const details = (page: Page) => page.getByRole('region', { name: 'List details' });

test('a first visit opens in Simple with only the essential controls', async ({ page }) => {
  await start(page);
  await expect(levelButton(page, 'Simple')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Click a party to change its votes' })).toBeVisible();
  await expect(analysisTabs(page)).toHaveText(['What if…', 'Coalitions', 'How the seats were allocated', 'Sources & definitions']);
  await expect(page.getByRole('button', { name: 'Start over' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Scenario name' })).toHaveCount(0);

  await listCard(page, 'Likud').click();
  await expect(details(page).getByText(/^Who gets in \(\d+\)$/)).toBeVisible();
  await expect(details(page).getByLabel('Votes', { exact: true })).toBeVisible();
  await expect(details(page).getByRole('combobox')).toHaveCount(0);
  await expect(details(page).getByRole('button', { name: 'Withdraw list' })).toHaveCount(0);
});

test('Standard adds scenario management and consequential list edits, but not identity editing', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await expect(analysisTabs(page)).toHaveCount(9);
  await expect(page.getByRole('tab', { name: 'Mergers, splits & agreements' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Scenario name' })).toBeVisible();

  await listCard(page, 'Likud').click();
  await expect(details(page).getByRole('combobox', { name: /balance the difference/ })).toBeVisible();
  await expect(details(page).getByRole('button', { name: 'Withdraw list' })).toBeVisible();
  await expect(details(page).getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  await expect(details(page).getByLabel('Short name (English)')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Chamber layout' })).toHaveCount(0);
});

test('Expert shows every tool, including identity editing and chamber display options', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Expert').click();
  await expect(analysisTabs(page)).toHaveCount(13);
  await expect(page.getByRole('group', { name: 'Chamber layout' })).toBeVisible();
  await listCard(page, 'Likud').click();
  await expect(details(page).getByLabel('Short name (English)')).toBeVisible();
  await expect(details(page).getByRole('button', { name: 'Move up' }).first()).toBeVisible();
});

test('settings saved by the two-level version open at the matching new level', async ({ page }) => {
  await start(page, { level: 'advanced' });
  await expect(levelButton(page, 'Expert')).toHaveAttribute('aria-pressed', 'true');
});

test('the chosen level and a dismissed hint survive a reload', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await levelButton(page, 'Standard').click();
  await page.reload();
  await expect(levelButton(page, 'Standard')).toHaveAttribute('aria-pressed', 'true');
  await levelButton(page, 'Simple').click();
  await expect(page.getByRole('status').filter({ hasText: 'Click a party to change its votes' })).toHaveCount(0);
});

test('Simple balances vote edits proportionally even if another source was chosen in Standard', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await listCard(page, 'Likud').click();
  await details(page).getByRole('combobox', { name: /balance the difference/ }).selectOption('new');

  await levelButton(page, 'Simple').click();
  await expect(details(page).getByText('The other parties’ votes shrink or grow in proportion')).toBeVisible();
  const yashar = listCard(page, 'Yashar!');
  const before = await yashar.getByText(/^[\d,]+$/).innerText();
  const votes = details(page).getByLabel('Votes', { exact: true });
  await votes.fill('1300000');
  await votes.press('Enter');
  await expect(listCard(page, 'Likud')).toContainText('1,300,000');
  // proportional balancing takes votes from every other list; "new voters" would leave Yashar! unchanged
  await expect(yashar.getByText(/^[\d,]+$/)).not.toHaveText(before);
});

// ---- review findings: nothing that changes the result may vanish when switching to a lower level

test('Simple still shows a list’s surplus agreement and its state', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await listCard(page, 'Likud').click();
  await details(page).getByRole('button', { name: 'Switch off' }).click();
  await levelButton(page, 'Simple').click();
  await expect(details(page).getByText(/Surplus-vote agreement with Religious Zionism–Zehut · switched off/)).toBeVisible();
});

test('rules changed by an experimental preset are named at every level, and no zero seat price is shown', async ({ page }) => {
  await start(page);
  await page.getByText('Pure proportional representation').locator('..').getByRole('button', { name: 'Try it' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Experimental rules' })).toContainText('remainder seats by Sainte-Laguë (law: Bader–Ofer)');
  await expect(page.getByText(/A list needs at least 0 votes \(0%\) to win seats\.$/)).toBeVisible();
});

test('a search typed in Standard does not keep filtering the lists in Simple', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await page.getByRole('searchbox', { name: 'Search lists' }).fill('Likud');
  await expect(listCard(page, 'Yashar!')).toHaveCount(0);
  await levelButton(page, 'Simple').click();
  await expect(listCard(page, 'Yashar!')).toBeVisible();
});

test('the bloc of a list can be changed in Standard', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Standard').click();
  await listCard(page, 'Likud').click();
  await details(page).getByRole('combobox', { name: 'Bloc' }).selectOption({ label: 'None' });
  await expect(page.getByText(/Netanyahu bloc\s*26/)).toBeVisible();
});

test('percentage precision chosen in Expert does not apply below Expert', async ({ page }) => {
  await start(page);
  await levelButton(page, 'Expert').click();
  await page.getByRole('tab', { name: 'Rules & settings' }).click();
  await page.getByRole('combobox', { name: 'Decimal places for percentages' }).selectOption('8');
  await expect(listCard(page, 'Likud')).toContainText('20.51498437%');
  await levelButton(page, 'Simple').click();
  await expect(listCard(page, 'Likud')).toContainText('20.51%');
});

test('a failed election load keeps the open election and offers a retry', async ({ page }) => {
  await page.route('**/data/k25.json', (route) => route.fulfill({ status: 404, body: 'missing' }));
  await start(page);
  await page.getByRole('combobox', { name: 'Election' }).selectOption('k25');
  await expect(page.getByRole('alert').filter({ hasText: 'Could not load the k25 election data' })).toBeVisible();
  await expect(page.getByRole('alert').getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(listCard(page, 'Likud')).toContainText('27');
});

test('the picker labels the open election correctly even if the index omits it', async ({ page }) => {
  const rows = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string }[];
  await page.route('**/data/elections.json', (route) => route.fulfill({ json: rows.filter((r) => r.id !== 'k26') }));
  await start(page);
  // wait until the (routed) index has replaced the built-in fallback, which does list 2026
  await expect(page.getByRole('combobox', { name: 'Election' }).locator('option[value="k16"]')).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Election' })).toHaveValue('k26');
  await expect(page.getByRole('combobox', { name: 'Election' }).locator('option:checked')).toHaveText('2026 · 26th Knesset');
});
