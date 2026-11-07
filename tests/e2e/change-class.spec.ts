import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

// Owner, 7 November 2026: grouping and coalition edits are scenario changes (counted, in History, marked, tinted),
// with "Votes and seats unchanged" where nothing else changed. Only appearance (colours) is exempt.
const start = async (page: Page, lang: 'en' | 'he', election = 'k25') => {
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } })); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang, hintDismissed: true, level: 'standard' }));
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
};
const tint = (page: Page) => page.locator('.app').evaluate(el => (el as HTMLElement).style.getPropertyValue('--scenario-color'));
const session = (page: Page) => page.locator('.session');
const historyCounts = async (page: Page) => {
  await session(page).locator('button[popovertarget]').click();
  const counts = session(page).locator('.history .history-counts');
  await expect(counts).toBeVisible();
  return counts;
};
const moveFirstList = async (page: Page) => {
  await page.locator('.blocs-head .btn').first().click();
  const cards = page.locator('.bloc-panel .bp-card');
  await cards.first().locator('.bp-chip-main:not([disabled])').first().click();
  await cards.nth(1).locator('.bp-here').click();
};

for (const lang of ['en', 'he'] as const) test(`${lang}: moving a list between blocs is one change; votes and seats unchanged`, async ({ page }) => {
  const one = lang === 'en' ? '1 change from the official result' : 'שינוי אחד מהתוצאה הרשמית';
  const note = lang === 'en' ? 'Votes and seats unchanged' : 'הקולות והמנדטים לא השתנו';
  await start(page, lang);
  const seatsBefore = await page.locator('.lb-seats').allInnerTexts();
  await moveFirstList(page);
  await expect(session(page)).toContainText(one);
  await expect(session(page)).toContainText(note);
  expect(await tint(page)).not.toBe('');
  await expect(page.locator('.band .scenario-switcher .choice-trigger')).not.toHaveAttribute('data-value', 'official');
  await expect(page.locator('.bloc-panel .edit-marker').first()).toBeVisible();
  expect(await page.locator('.lb-seats').allInnerTexts()).toEqual(seatsBefore);
  await page.keyboard.press('Escape');
  const counts = await historyCounts(page);
  await expect(counts).toHaveText(`${one} · ${note}`);
  await expect(session(page).locator('.history ol li')).toHaveCount(1);
  // the scenario switcher's summary agrees
  await page.keyboard.press('Escape');
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await expect(page.locator('.scenario-changes summary')).toContainText(`${one} · ${note}`);
});

test('recolouring a bloc is not a change: still the official result, untinted', async ({ page }) => {
  await start(page, 'en');
  await page.getByRole('region', { name: 'Seats by bloc' }).getByRole('button', { name: 'Edit blocs' }).click();
  await page.locator('.bloc-panel .bp-swatch').first().click();
  await page.locator('.bloc-panel').getByRole('button', { name: '#c23b2d' }).click();
  await expect(page.locator('.bloc-panel .bp-card').first()).toHaveCSS('--bc', '#c23b2d');
  await expect(session(page)).toContainText('No changes');
  await expect(session(page)).not.toContainText('Votes and seats unchanged');
  expect(await tint(page)).toBe('');
  await expect(page.locator('.band .scenario-switcher .choice-trigger')).toHaveAttribute('data-value', 'official');
  await expect(page.locator('.bloc-panel .edit-marker')).toHaveCount(0);
});

test('a coalition role change counts and is listed in History; a vote edit drops the note', async ({ page }) => {
  await start(page, 'en');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await page.locator('.coal-choice').first().getByRole('button', { name: 'Support', exact: true }).click();
  await expect(session(page)).toContainText('1 change from the official result');
  await expect(session(page)).toContainText('Votes and seats unchanged');
  expect(await tint(page)).not.toBe('');
  const counts = await historyCounts(page);
  await expect(counts).toHaveText('1 change from the official result · Votes and seats unchanged');
  await expect(session(page).locator('.history ol li')).toContainText('Coalition: 1 outside support');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1120000'); await votes.press('Enter');
  await expect(session(page)).toContainText('2 changes from the official result');
  await expect(session(page)).not.toContainText('Votes and seats unchanged');
});
