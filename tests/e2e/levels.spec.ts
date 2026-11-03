// The three interface levels: Simple (minimal), Standard (common, consequential edits) and Expert
// (every tool). A level changes what is shown, never what is computed.
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
