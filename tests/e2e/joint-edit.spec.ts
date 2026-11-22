// Who runs on a joint list can be edited from the list's panel: Balad joins Hadash–Ta'al (2022), a party moves to its own
// list, and Undo puts each change back. Every change is marked.
import { expect, test, type Page } from './fixtures';
import { choose } from './choices.ts';

async function start(page: Page) {
  await page.addInitScript(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); });
  await page.goto('/');
  await choose(page.getByRole('button', { name: /^Election(: |$)/ }), 'k25');
}
const row = (page: Page, name: string) => page.locator('.lb-row').filter({ hasText: name }).first();

test('Balad joins Hadash–Ta’al from its panel, with all its votes; the change is marked and undoable', async ({ page }) => {
  await start(page);
  await row(page, "Hadash–Ta'al").click();
  const panel = page.locator('.side-panel');
  const section = panel.locator('section.joint-edit');
  await expect(section.getByRole('heading', { name: /Who runs on this list/ })).toBeVisible();
  await choose(section.getByRole('button', { name: /^Add a list to this one(: |$)/ }), '25-ד');
  await expect(page.locator('.lb-row').filter({ hasText: /^.*Balad/ })).toHaveCount(0);
  await expect(panel.locator('.party-rows')).toContainText('Balad');
  await expect(panel.locator('.party-row').filter({ hasText: 'Balad' }).locator('.edit-marker')).toBeVisible();
  // the joint vote: 178,735 + 138,617
  await expect(row(page, "Hadash–Ta'al")).toContainText('317,352');
  await page.getByRole('button', { name: /^Undo/ }).first().click();
  await expect(row(page, 'Balad')).toBeVisible();
});

test('a party of a joint list runs on its own, taking its share of the votes', async ({ page }) => {
  await start(page);
  await row(page, "Hadash–Ta'al").click();
  const section = page.locator('.side-panel section.joint-edit');
  await choose(section.getByRole('button', { name: /^Party to move(: |$)/ }), 'taal');
  await expect(section.getByRole('button', { name: "Where Ta'al goes" })).toHaveAttribute('data-value', '__own');
  await section.getByRole('spinbutton').fill('40');
  await expect(section).toContainText('71,494 votes');
  await section.getByRole('button', { name: "Run Ta'al on its own" }).click();
  await expect(row(page, "Ta'al")).toBeVisible();
  await expect(row(page, "Hadash–Ta'al")).toContainText('107,241');
});

test('a list with no parties of its own can join another from its panel', async ({ page }) => {
  await start(page);
  await row(page, 'Balad').click();
  await choose(page.locator('.side-panel section.joint-edit').getByRole('button', { name: /^Run inside another list(: |$)/ }), '25-ום');
  await expect(page.locator('.side-panel .party-rows')).toContainText('Balad');
});

test('the share link of a joint-list edit is short and opens the same lists; a gallery entry shares as #g=', async ({ page }) => {
  await start(page);
  await row(page, "Hadash–Ta'al").click();
  await choose(page.locator('.side-panel section.joint-edit').getByRole('button', { name: /^Add a list to this one(: |$)/ }), '25-ד');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await page.getByRole('button', { name: 'Copy a share link', exact: true }).click();
  const link = await page.getByRole('textbox', { name: 'Share link', exact: true }).inputValue();
  expect(link.length).toBeLessThan(400);
  // the gallery index names this link as entry 7
  await page.route('**/data/scenarios.json', (route) => route.fulfill({ json: { timestamp: Date.now() - 1000, entries: [{ issue: 7, author: 'someone', date: '2026-11-01T00:00:00Z', likes: 0,
    name: 'Balad with Hadash–Ta’al', description: '', electionId: 'k25', year: '2022', tags: [], shareLink: link }] } }));
  await page.goto('about:blank');
  await page.goto(link.replace(/#s=.*/, '#g=7'));
  await expect(page.getByRole('button', { name: /^Switch scenario(: |$)/ })).toContainText('Shared scenario');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await expect(row(page, "Hadash–Ta'al")).toContainText('317,352');
  await expect(page.locator('.lb-row').filter({ hasText: /Balad/ })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await page.getByRole('button', { name: 'Copy a share link', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Share link', exact: true })).toHaveValue(/#g=7$/);
});
