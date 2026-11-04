// Blocs per election and constituent parties (decision 0087).
import { expect, test, type Page } from '@playwright/test';

const start = async (page: Page, level: string) => {
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang: 'en', hintDismissed: true, level }));
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Election' }).selectOption('k25');
  await expect(page.getByRole('combobox', { name: 'Grouping' })).toBeVisible();
};
const blocs = (page: Page) => page.getByRole('region', { name: 'Seats by bloc' });
/** a bloc's band in the strip; its seat count is the bold figure in its label */
const band = (page: Page, bloc: string) => blocs(page).getByRole('button', { name: new RegExp(`^${bloc}`) });
const blocCount = (page: Page, bloc: string) => band(page, bloc).locator('.label b');
const editor = (page: Page) => page.getByRole('complementary', { name: 'Edit blocs' });
const listRow = (page: Page, name: string) => page.getByRole('region', { name: 'Lists' }).getByRole('button', { name, exact: true });

test('an election opens on its first government, and other sourced groupings can be chosen', async ({ page }) => {
  await start(page, 'simple');
  const grouping = page.getByRole('combobox', { name: 'Grouping' });
  await expect(grouping.locator('option:checked')).toHaveText(/37th government/);
  await expect(blocCount(page, 'Coalition')).toHaveText('64');
  await grouping.selectOption({ label: 'Pre-election blocs' });
  await expect(grouping.locator('option:checked')).toHaveText('Pre-election blocs');
  // a band opens the bloc editor beside the chamber, at every level
  await band(page, 'Netanyahu bloc').click();
  await expect(editor(page).getByRole('textbox', { name: 'Bloc name' }).first()).toHaveValue('Netanyahu bloc');
  await page.keyboard.press('Escape');
  await expect(editor(page)).toHaveCount(0);
});

test('a bloc is renamed and recoloured where it is shown, and Undo restores it', async ({ page }) => {
  await start(page, 'simple');
  await blocs(page).getByRole('button', { name: 'Edit blocs' }).click();
  const name = editor(page).getByRole('textbox', { name: 'Bloc name' }).first();
  await name.fill('Government');
  await name.press('Enter');
  await expect(band(page, 'Government')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Grouping' }).locator('option:checked')).toHaveText('Your grouping');
  await editor(page).getByRole('button', { name: 'Colour of Government' }).click();
  await editor(page).getByRole('button', { name: '#c0392b' }).click();
  await expect(band(page, 'Government')).toHaveCSS('--bc', '#c0392b');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(band(page, 'Coalition')).toBeVisible();
});

test('moving one party of a joint list to another bloc moves only its members’ seats', async ({ page }) => {
  await start(page, 'standard');
  const before = Number(await blocCount(page, 'Coalition').innerText());
  await band(page, 'Coalition').click();
  // choose the party, then the bloc it moves to
  await editor(page).getByRole('button', { name: /^New Hope, 4 seats/ }).click();
  await expect(editor(page).getByRole('status')).toContainText('Moving New Hope');
  await editor(page).locator('.bp-card').first().getByRole('button', { name: 'Move here' }).click();
  const after = Number(await blocCount(page, 'Coalition').innerText());
  expect(after).toBeGreaterThan(before);
  expect(after - before).toBeLessThan(12); // only New Hope's members, not all of National Unity
  const grouping = page.getByRole('combobox', { name: 'Grouping' });
  await expect(grouping.locator('option:checked')).toHaveText('Your grouping');
  await grouping.selectOption({ label: '37th government (Netanyahu VI) (Dec 2022)' });
  await expect(blocCount(page, 'Coalition')).toHaveText(String(before));
});

test('a joint list’s faction can split after the election, keeping votes and seats', async ({ page }) => {
  await start(page, 'standard');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'National Unity', exact: true }).click();
  const details = page.getByRole('region', { name: 'List details' });
  await details.getByRole('checkbox', { name: 'Faction split after the election' }).check();
  // each party now has its own row of seats under the list, and its own place in the chamber
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('list', { name: /factions after the split/ }).getByText('New Hope')).toBeVisible();
  await expect(listRow(page, 'National Unity')).toContainText('12');
  await expect(page.getByRole('status').filter({ hasText: 'Since official result' })).toContainText('No seats changed');
});

test('a joint list can run as separate lists, with the vote shares stated as an assumption', async ({ page }) => {
  await start(page, 'standard');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'United Torah Judaism', exact: true }).click();
  const details = page.getByRole('region', { name: 'List details' });
  await expect(details.getByText('Parties on this joint list')).toBeVisible();
  await details.getByRole('button', { name: 'What if they had run separately?' }).click();
  await expect(details.getByText(/the shares below are an assumption/)).toBeVisible();
  await details.getByRole('button', { name: 'Run as 2 separate lists' }).click();
  await expect(listRow(page, 'Agudat Yisrael')).toBeVisible();
  await expect(listRow(page, 'Degel HaTorah').locator('.lb-seats b')).toHaveText('0'); // below the threshold on its own
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(listRow(page, 'United Torah Judaism')).toBeVisible();
});
