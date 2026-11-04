import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
async function start(page: Page, lang = 'en', theme = 'light') {
  await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), { lang, theme, level: 'expert', hintDismissed: true });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await expect(page.locator('.election .choice-trigger')).toHaveAttribute('data-value', 'k25');
}
async function detail(page: Page) {
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  return page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
}
async function save(page: Page, name: string) {
  const close = page.locator('.side-panel').getByRole('button', { name: 'Close', exact: true });
  if (await close.count()) await close.click();
  await page.getByRole('button', { name: 'Save & share', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Scenario name', exact: true });
  await input.fill(name); await input.press('Enter');
  await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
}
for (const phone of [false, true]) test(`Official → A → B → Official retains unsaved edits and undo (${phone ? 'phone' : 'desktop'})`, async ({ page }) => {
  if (phone) await page.setViewportSize({ width: 390, height: 844 });
  await start(page); let votes = await detail(page);
  await votes.fill('1120000'); await votes.press('Enter'); await save(page, 'A');
  const switcher = page.getByRole('button', { name: 'Switch scenario', exact: true });
  await choose(switcher, 'official'); votes = await detail(page);
  await votes.fill('1130000'); await votes.press('Enter'); await save(page, 'B');
  await choose(switcher, 'official'); votes = await detail(page);
  await votes.fill('1140000'); await votes.press('Enter'); await save(page, 'C');
  await switcher.click();
  await page.screenshot({ path: `.backup-scratch/controls/scenarios-en-light-${phone ? 'phone' : 'desktop'}.png` });
  await page.getByRole('dialog').getByRole('button', { name: 'A', exact: true }).click();
  votes = await detail(page); await expect(votes).toHaveValue('1,120,000');
  await page.getByRole('group', { name: 'Votes step size', exact: true }).getByRole('button', { name: '10k', exact: true }).click();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await switcher.click(); await page.getByRole('dialog').getByRole('button', { name: 'B', exact: true }).click();
  await choose(switcher, 'official'); await expect(switcher).toContainText('Official result');
  await switcher.click(); await page.getByRole('dialog').getByRole('button', { name: 'A · unsaved', exact: true }).click();
  votes = await detail(page); await expect(votes).toHaveValue('1,130,000');
  if (phone) await page.locator('.side-panel').getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: /^Undo:/ }).click();
  if (phone) votes = await detail(page);
  await expect(votes).toHaveValue('1,120,000');
});
test('round up uses the exact next-seat boundary and +10k is one undo', async ({ page }) => {
  await start(page); const votes = await detail(page);
  const row = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: 'Likud' }) });
  await expect(row.locator('.lb-seats b')).toHaveText('32');
  const next = page.getByRole('button', { name: /^Reach next seat/ });
  await expect(next).toBeEnabled({ timeout: 30000 }); await next.click();
  await expect(row.locator('.lb-seats b')).toHaveText('33');
  const before = await votes.inputValue(); await page.getByRole('group', { name: 'Votes step size', exact: true }).getByRole('button', { name: '10k', exact: true }).click(); await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  expect(Number((await votes.inputValue()).replaceAll(',', ''))).toBe(Number(before.replaceAll(',', '')) + 10000);
  await page.getByRole('button', { name: /^Undo:/ }).click(); await expect(votes).toHaveValue(before);
});
test('a threshold jump is named as multiple seats and applied as votes', async ({ page }) => {
  await start(page);
  const row = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: 'Meretz' }) });
  await row.click();
  await expect(page.locator('.seat-search-status')).toContainText('+4 seats', { timeout: 30000 });
  await page.getByRole('button', { name: 'Cross the threshold', exact: true }).click();
  await expect(row.locator('.lb-seats b')).toHaveText('4');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(row.locator('.lb-seats b')).toHaveText('0');
});
test('fine vote/share nudges and a paired 1pp transfer are single undo steps', async ({ page }) => {
  await start(page); const votes = await detail(page);
  const before = await votes.inputValue();
  const value = (text: string) => Number(text.replaceAll(',', ''));
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  expect(value(await votes.inputValue())).toBe(value(before) + 1);
  await page.getByRole('button', { name: /^Undo:/ }).click(); await expect(votes).toHaveValue(before);
  await page.getByRole('group', { name: 'Votes step size', exact: true }).getByRole('button', { name: '0.1pp', exact: true }).click();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  expect(value(await votes.inputValue())).toBeGreaterThan(value(before));
  await page.getByRole('button', { name: /^Undo:/ }).click(); await expect(votes).toHaveValue(before);
  const donorRow = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: 'Yesh Atid' }) });
  const donorVotes = async () => value((await donorRow.locator('.lb-sub').innerText()).split(' · ')[0]);
  const donorBefore = await donorVotes();
  await page.locator('.side-panel').getByRole('button', { name: 'More', exact: true }).click();
  await page.getByRole('button', { name: 'Transfer 1pp', exact: true }).click();
  const gain = value(await votes.inputValue()) - value(before);
  expect(gain).toBe(47647);
  expect(donorBefore - await donorVotes()).toBe(gain);
  await page.getByRole('button', { name: /^Undo:/ }).click(); await expect(votes).toHaveValue(before);
  expect(await donorVotes()).toBe(donorBefore);
});
for (const phone of [false, true]) test(`election picker keyboard ${phone ? 'phone' : 'desktop'}`, async ({ page }) => {
  await page.setViewportSize(phone ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await start(page); const picker = page.getByRole('button', { name: 'Election', exact: true });
  await picker.focus(); await page.keyboard.press('Enter');
  const search = page.getByRole('searchbox'); await expect(search).toBeFocused(); await search.fill('September 2019');
  await search.press('ArrowDown');
  await expect(picker).toHaveAttribute('data-value', 'k25');
  // Enter on the focused row opens it (one step, like a click)
  await page.keyboard.press('Enter');
  await expect(picker).toHaveAttribute('data-value', 'k22'); await expect(picker).toBeFocused();
  await picker.press('Enter'); await page.keyboard.press('Escape'); await expect(picker).toBeFocused();
});
for (const lang of ['he', 'en']) for (const theme of ['light', 'dark']) for (const phone of [false, true]) test(`controls screenshots ${lang} ${theme} ${phone ? 'phone' : 'desktop'}`, async ({ page }) => {
  await page.setViewportSize(phone ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await start(page, lang, theme); await page.evaluate(() => document.fonts.ready);
  if (!phone) expect((await page.locator('.band').boundingBox())!.height).toBeLessThanOrEqual(60);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const suffix = `${lang}-${theme}-${phone ? 'phone' : 'desktop'}`;
  await page.screenshot({ path: `.backup-scratch/controls/board-${suffix}.png` });
  await page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }).click();
  await expect(page.getByRole('dialog').locator('.election-row .result-preview').first()).toBeVisible();
  await page.screenshot({ path: `.backup-scratch/controls/elections-${suffix}.png` });
  await page.keyboard.press('Escape');
  await page.getByRole('region', { name: lang === 'he' ? 'הרשימות' : 'Lists', exact: true }).getByRole('button', { name: lang === 'he' ? 'הליכוד' : 'Likud', exact: true }).click();
  await expect(page.getByRole('button', { name: lang === 'he' ? /^הגעה למנדט הבא/ : /^Reach next seat/ })).toBeEnabled({ timeout: 30000 });
  const stepper = page.locator('.side-panel .numeric-stepper');
  const minus = await stepper.locator('.stepper-nudge').first().boundingBox();
  const plus = await stepper.locator('.stepper-nudge').last().boundingBox();
  expect(lang === 'he' ? minus!.x > plus!.x : minus!.x < plus!.x).toBe(true);
  await expect(stepper.getByRole('textbox')).toHaveCSS('direction', 'ltr');
  await page.screenshot({ path: `.backup-scratch/controls/vote-actions-${suffix}.png` });
});
