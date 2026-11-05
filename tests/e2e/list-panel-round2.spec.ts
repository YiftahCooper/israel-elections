import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
// Round-2 audit of the list side panel and the shared controls it uses (5 Nov 2026).

async function start(page: Page, { lang = 'en', theme = 'light', level = 'expert', election = 'k26', width = 1500 } = {}) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), { lang, theme, level, hintDismissed: true });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const open = (page: Page, name: string) => page.getByRole('region', { name: /^(Lists|הרשימות)$/ }).getByRole('button', { name, exact: true }).click();
const hebrew = /[֐-׿]/;

test('English mode names Knesset members in English, with the registered Hebrew name beside it', async ({ page }) => {
  await start(page, { election: 'k25' }); await open(page, 'Likud');
  const panel = page.locator('.side-panel');
  const first = panel.locator('.cand').first();
  await expect(first).toContainText('Benjamin Netanyahu');
  // the Hebrew name is a secondary subtitle, never the only name
  await expect(first.locator('[lang="he"]')).toHaveText(/נתניהו/);
  await expect(panel.locator('.kv span', { hasText: /^Last elected$/ }).locator('xpath=following-sibling::span[1]')).not.toHaveText(hebrew);
  // every elected Likud member has an official English name
  const elected = panel.locator('.cand.el');
  const n = await elected.count();
  expect(n).toBeGreaterThan(20);
  for (let i = 0; i < n; i++) {
    const own = await elected.nth(i).locator(':scope > span:nth-child(2) > span').first().textContent();
    expect(own, `elected #${i + 1}`).not.toMatch(hebrew);
  }
  // the links note is one short label; its detail (incl. the source policy) is behind (i)
  await expect(panel.getByText('English Wikipedia is not linked', { exact: false })).toBeHidden();
  await expect(panel.locator('.bio-key')).toHaveText(/^Names and links/);
});

test('English link labels and sponsor lines carry no Hebrew-only or letter-by-letter text', async ({ page }) => {
  await start(page, { election: 'k25' }); await open(page, 'Likud');
  const panel = page.locator('.side-panel');
  // no garbled transliteration of the registered Hebrew party names
  await expect(panel.getByText(/^Submitted by:/)).toHaveCount(0);
  await open(page, 'Religious Zionism');
  await expect(panel.getByText(/^Submitted by:/)).toContainText('Otzma Yehudit');
  // research links name their publisher in English
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k12');
  await page.locator('.lb-row').first().click();
  const links = panel.locator('.party-links a');
  for (const t of await links.allTextContents()) expect(t).not.toMatch(hebrew);
});

test('Restore list appears for a non-vote edit only; a vote edit has Restore votes instead', async ({ page }) => {
  await start(page); await open(page, 'Likud');
  const panel = page.locator('.side-panel');
  await panel.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await expect(panel.locator('.vote-goals').getByRole('button', { name: 'Restore votes', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Restore list', exact: true })).toHaveCount(0);
  // the list's own bloc (Standing), not a component party's
  await panel.locator('select').filter({ has: page.locator('option', { hasText: /^None$/ }) }).first().selectOption({ index: 0 });
  const restore = panel.getByRole('button', { name: 'Restore list', exact: true });
  await expect(restore).toBeVisible();
  // beside the 32px bloc field it is the field's height
  expect(Math.round((await restore.boundingBox())!.height)).toBe(32);
  await restore.click();
  await expect(panel.getByRole('button', { name: 'Restore list', exact: true })).toHaveCount(0);
  await expect(panel.locator('.vote-goals').getByRole('button', { name: 'Restore votes', exact: true })).toBeHidden();
});

for (const lang of ['en', 'he']) test(`renaming a candidate does not move its row or buttons (${lang})`, async ({ page }) => {
  await start(page, { lang });
  await page.locator('.lb-row').first().click();
  const row = page.locator('.side-panel .cand').nth(1);
  await row.scrollIntoViewIfNeeded();
  const rename = row.getByRole('button', { name: lang === 'en' ? 'Rename' : 'שינוי שם', exact: true });
  const before = (await rename.boundingBox())!, rowBefore = (await row.boundingBox())!;
  await rename.click();
  await expect(row.getByRole('textbox')).toBeFocused();
  const after = (await rename.boundingBox())!, rowAfter = (await row.boundingBox())!;
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(rowAfter.height - rowBefore.height)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
});

test('joint-list parties without a colour of their own are told apart on candidates, party rows and when split', async ({ page }) => {
  await start(page, { election: 'k25' }); await open(page, 'United Torah Judaism');
  const panel = page.locator('.side-panel');
  const listColour = await panel.locator('.cands').evaluate(e => getComputedStyle(e).getPropertyValue('--c').trim());
  const component = panel.locator('.cand[data-component-party]').first();
  await expect(component).toBeVisible();
  const partyColour = await component.evaluate(e => getComputedStyle(e).getPropertyValue('--c').trim());
  expect(partyColour.toLowerCase()).not.toBe(listColour.toLowerCase());
  await panel.getByRole('button', { name: 'Split into separate lists', exact: true }).click();
  await panel.getByRole('button', { name: 'Run as 2 separate lists', exact: true }).click();
  const swatches = await page.getByRole('region', { name: 'Lists' }).locator('.lb-row').evaluateAll(rows => rows.map(r => r.querySelector('.slip')?.getAttribute('style') ?? ''));
  const parts = swatches.filter(st => st.includes(listColour) || st.includes(partyColour));
  expect(new Set(parts).size).toBe(2);
});

test('a short picker has no search box; choosing the option in force is not an edit', async ({ page }) => {
  await start(page);
  const colourBy = page.locator('.chamber-tools').getByRole('button', { name: 'Colour seats by', exact: true });
  await colourBy.click();
  const dialog = page.locator(`[id="${await colourBy.getAttribute('aria-controls')}"]`);
  await expect(dialog.getByRole('searchbox')).toHaveCount(0);
  await expect(dialog.locator('.choice-option[aria-pressed="true"]')).toBeFocused();
  await page.keyboard.press('Escape');
  // the election picker (26 options) keeps its search
  const grouping = page.getByRole('button', { name: 'Grouping', exact: true });
  const current = await grouping.getAttribute('data-value');
  await choose(grouping, current!);
  await expect(page.getByRole('button', { name: /^Undo/ }).first()).toBeDisabled();
});

test('secondary sources use a neutral chip, not the error red', async ({ page }) => {
  await start(page);
  await page.getByRole('tab', { name: 'Sources', exact: true }).click();
  const chip = page.locator('.chip.secondary').first();
  await expect(chip).toBeVisible();
  expect(await page.locator('.chip.no')
    .filter({ hasText: /^secondary$/ }).count()).toBe(0);
  const [colour, bad] = await chip.evaluate(e => [getComputedStyle(e).color, getComputedStyle(document.documentElement).getPropertyValue('--bad')]);
  expect(colour).not.toBe(bad);
});

test('the vote slider is visible in dark mode', async ({ page }) => {
  await start(page, { theme: 'dark' });
  await page.locator('.lb-row').first().click();
  const accent = await page.locator('.side-panel input[type="range"]').evaluate(e => getComputedStyle(e).accentColor);
  const shell = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--shell').trim());
  expect(accent).not.toContain('10, 34, 64'); // the shell navy #0a2240
  expect(shell).toBeTruthy();
});

test('the vote-source question keeps its (i) apart from its title', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:preferences', '{}'));
  await start(page); await open(page, 'Likud');
  await page.locator('.side-panel').getByRole('button', { name: 'Increase Votes', exact: true }).click();
  const ask = page.locator('dialog.source-ask');
  await expect(ask).toBeVisible();
  const gap = await ask.evaluate(d => {
    const b = d.querySelector('p > b')!.getBoundingClientRect(), i = d.querySelector('p > .info > button')!.getBoundingClientRect();
    return (i.left + 4) - b.right; // the drawn circle is inset 4px in its button
  });
  expect(gap).toBeGreaterThanOrEqual(3);
  await ask.getByRole('button', { name: 'Cancel', exact: true }).click();
});
