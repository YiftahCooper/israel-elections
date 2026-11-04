import { expect, test, type Page } from '@playwright/test';
// Scenario identity and navigation chrome (release-candidate audit, area C).
async function start(page: Page, lang: 'en' | 'he' = 'en', level = 'expert', size = { width: 1500, height: 1000 }) {
  await page.setViewportSize(size);
  await page.addInitScript(v => { if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', JSON.stringify(v)); }, { lang, theme: 'light', level, hintDismissed: true });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const chip = (page: Page) => page.locator('.band .scenario-switcher .choice-current');
const appColor = (page: Page) => page.locator('.app').evaluate(e => getComputedStyle(e).getPropertyValue('--scenario-color').trim());
async function editLikud(page: Page, votes: string) {
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const field = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  await field.fill(votes); await field.press('Enter');
  await expect(chip(page)).toContainText('unsaved');
}
async function switcherOptions(page: Page) {
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  const values = await page.locator('dialog[open] .choice-option').evaluateAll(els => els.map(e => e.getAttribute('data-choice-value') ?? ''));
  return values;
}

test('a duplicate gets its own colour and its own history; a draft already shows the colour saving gives it', async ({ page }) => {
  await start(page);
  await editLikud(page, '1300000');
  const draftColour = await appColor(page);
  await page.getByRole('button', { name: 'Save & share' }).click();
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await expect(chip(page)).not.toContainText('unsaved');
  expect(await appColor(page)).toBe(draftColour);
  await page.getByRole('button', { name: 'Save & share' }).click();
  await page.getByRole('button', { name: 'Duplicate scenario' }).click();
  await expect(chip(page)).toContainText('(copy)');
  expect(await appColor(page)).not.toBe(draftColour);
  // undo can never turn the copy back into the original (a later save would overwrite it)
  await expect(page.getByRole('button', { name: /^Undo/ }).first()).toBeDisabled();
  // the next new draft previews the least-used colour, not the first palette colour again
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await page.locator('dialog[open] [data-choice-value="official"]').click();
  await expect(chip(page)).toHaveText('Official result');
  expect(await appColor(page)).toBe('');
  await editLikud(page, '1250000');
  const third = await appColor(page);
  expect([draftColour]).not.toContain(third);
});

test('deleting the open saved scenario keeps it open as unsaved work', async ({ page }) => {
  await start(page);
  page.on('dialog', d => d.accept());
  await editLikud(page, '1300000');
  await page.getByRole('button', { name: 'Save & share' }).click();
  const name = page.getByRole('textbox', { name: 'Scenario name' });
  await name.fill('Doomed'); await name.press('Enter');
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await expect(chip(page)).toHaveText('Doomed');
  await page.getByRole('button', { name: 'Save & share' }).click();
  await page.locator('#scenarios-menu').getByRole('button', { name: 'Delete Doomed', exact: true }).click();
  await expect(chip(page)).toHaveText('Doomed · unsaved');
  // switching away keeps it in the switcher
  await page.keyboard.press('Escape');
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await page.locator('dialog[open] [data-choice-value="official"]').click();
  expect((await switcherOptions(page)).length).toBe(2);
});

test('a share link pasted into an open tab opens; switching away keeps it; resuming a draft does not duplicate it', async ({ page }) => {
  await start(page);
  await editLikud(page, '1300000');
  await page.getByRole('button', { name: 'Save & share' }).click();
  await page.getByRole('button', { name: 'Copy a share link' }).click();
  const url = await page.locator('#scenarios-menu input[readonly]').inputValue();
  await page.keyboard.press('Escape');
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await page.locator('dialog[open] [data-choice-value="official"]').click();
  await expect(chip(page)).toHaveText('Official result');
  await page.evaluate(u => { location.hash = new URL(u).hash; }, url);
  await expect(chip(page)).toHaveText('Shared scenario · unsaved');
  await expect(page.locator('.lb-row').first().locator('.lb-seats b')).toHaveText('29');
  expect(await page.evaluate(() => location.hash)).toBe('');
  await page.locator('.band .scenario-switcher .choice-trigger').click();
  await page.locator('dialog[open] [data-choice-value="official"]').click();
  const values = await switcherOptions(page);
  expect(values).toHaveLength(3); // official, the first draft, the shared scenario
  await page.locator(`dialog[open] [data-choice-value="${values[2]}"]`).click();
  await expect(chip(page)).toHaveText('Shared scenario · unsaved');
  expect(await switcherOptions(page)).toHaveLength(3);
  await page.keyboard.press('Escape');
  // a damaged link says so instead of doing nothing
  await page.evaluate(() => { location.hash = '#s=AAAA'; });
  await expect(page.locator('.toast')).toContainText('damaged');
});

test('every tool has one name: the tab strip and the Custom page agree', async ({ page }) => {
  await start(page, 'he', 'simple');
  const tabs = (await page.locator('.toolbar [role=tab]').evaluateAll(els => els.map(e => e.childNodes[0]?.textContent ?? ''))).sort();
  await page.locator('.band .band-custom').click();
  const cards = await page.locator('.custom-feature strong').allTextContents();
  for (const t of tabs) expect(cards).toContain(t);
  expect(tabs).toContain('מה אם…');
  // the Overview is the home page: it cannot be collapsed or hidden
  await expect(page.locator('.custom-feature').filter({ hasText: 'תמונת מצב' }).locator('.seg')).toHaveCount(0);
});

test('tablet: the strip stays one line and stays visible under the wrapped band', async ({ page }) => {
  await start(page, 'en', 'standard', { width: 1024, height: 800 });
  const label = page.locator('.toolbar .more-label');
  expect((await label.boundingBox())!.height).toBeLessThan(24);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(200);
  const band = (await page.locator('.band').boundingBox())!;
  const strip = (await page.locator('.toolbar').boundingBox())!;
  expect(strip.y).toBeGreaterThanOrEqual(band.y + band.height - 1);
  await expect(page.locator('#tab-board')).toBeInViewport();
});

test('phone: About opens on screen, names each list, and closes on Escape', async ({ page }) => {
  await start(page, 'he', 'simple', { width: 390, height: 844 });
  const about = page.locator('.band .election-about');
  await about.locator('summary').click();
  const list = about.locator('ul');
  await expect(list).toBeInViewport();
  await expect(list).toContainText('הרשימה המשותפת:');
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
});

test('a failed election load keeps the open election and a plain message', async ({ page }) => {
  await start(page, 'he', 'standard');
  await page.route(/data\/k12\.json/, r => r.fulfill({ status: 500, body: 'x' }));
  await page.locator('.band .election .choice-trigger').click();
  await page.locator('dialog[open] [data-choice-value="k12"]').click();
  const banner = page.locator('.banner.err');
  await expect(banner).toContainText('בדקו את החיבור');
  await expect(banner.locator('bdi[dir=ltr]')).toContainText('HTTP 500');
  await expect(page.locator('.band .election .choice-trigger')).toHaveAttribute('data-value', 'k26');
});
