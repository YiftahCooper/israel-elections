import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';
async function start(page: Page, lang = 'en', theme = 'light') {
  await page.addInitScript(v => { if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(v)); }, { lang, theme, level: 'expert', hintDismissed: true });
  await page.goto('/');
  await expect(page.getByRole('region', { name: lang === 'he' ? 'הרשימות' : 'Lists', exact: true })).toBeVisible();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await expect(page.locator('.election .choice-trigger')).toHaveAttribute('data-value', 'k25');
  await expect(page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: lang === 'he' ? 'ליכוד' : 'Likud' }) }).locator('.lb-seats b')).toHaveText('32');
}
test('blank grouping names and unassigns all seats, with undo', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Edit blocs', exact: true }).click();
  page.once('dialog', d => d.accept('Unity government'));
  await page.getByRole('button', { name: 'New grouping', exact: true }).click();
  await expect(page.locator('.bloc-panel')).toContainText('Unity government');
  await expect(page.locator('.bp-card')).toHaveCount(3);
  const cards = page.locator('.bp-card');
  await expect(cards.nth(0).locator('.bp-seats b')).toHaveText('0');
  await expect(cards.nth(1).locator('.bp-seats b')).toHaveText('0');
  await expect(cards.nth(2).locator('.bp-seats b')).toHaveText('120');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(page.locator('.bloc-panel')).not.toContainText('Unity government');
});
test('save moves the reference, official setting restores markers, colour survives load', async ({ page }) => {
  await start(page);
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const panel = page.locator('.side-panel');
  const name = panel.getByRole('textbox', { name: 'Full name', exact: true });
  // TextField is labelled by its containing label.
  await name.fill('Edited list'); await name.press('Enter');
  await panel.locator('input[type=color]').first().fill('#123456');
  const votes = panel.getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1150000'); await votes.press('Enter');
  await expect(panel.locator('.edit-marker')).not.toHaveCount(0);
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await page.locator('.scn-form input:not([type=color])').fill('Unity');
  if (!await page.locator('.scn-options').evaluate(el => el.hasAttribute('open'))) await page.locator('.scn-options summary').click();
  await page.getByRole('combobox', { name: 'Scenario colour', exact: true }).selectOption('#417182');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await expect(page.locator('.edit-marker')).toHaveCount(0);
  await expect(page.locator('.band .election-status')).toContainText('Unity');
  await votes.fill('1150100'); await votes.press('Enter');
  await expect(panel.locator('.edit-marker')).not.toHaveCount(0);
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  if (!await page.locator('.scn-options').evaluate(el => el.hasAttribute('open'))) await page.locator('.scn-options summary').click();
    await page.locator('.scn-options').getByRole('button', { name: 'Settings…', exact: true }).click();
  await page.getByRole('group', { name: 'Mark changes since', exact: true }).getByRole('button', { name: 'Official result', exact: true }).click();
    await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  expect(await panel.locator('.edit-marker').count()).toBe(2); // name and votes; colour is appearance
  // Workspace writes are debounced; reload only once this scenario is durable.
  await expect.poll(() => page.evaluate(() => {
    const current = Object.values<{ at: number; ws: { current?: { name?: string; identityColor?: string; log: { action: { type: string; allocations?: { votes: number }[] } }[] } } }>(JSON.parse(localStorage.getItem('israel-elections:workspace:v1') ?? 'null')?.tabs ?? {}).sort((x, y) => y.at - x.at)[0]?.ws.current;
    return { name: current?.name, color: current?.identityColor };
  })).toEqual({ name: 'Unity', color: '#417182' });
  // a reload restores the work in progress (owner decision 2026-11-04): still Unity, with its colour
  await page.reload();
  await expect(page.locator('.band .election-status')).toContainText('Unity');
  await expect(page.locator('.app')).toHaveCSS('--scenario-color', '#417182');
});
for (const lang of ['en', 'he']) for (const theme of ['light', 'dark']) for (const phone of [false, true]) {
  test(`scenario chrome screenshot ${lang} ${theme} ${phone ? 'phone' : 'desktop'}`, async ({ page }) => {
    await page.setViewportSize(phone ? { width: 390, height: 844 } : { width: 1440, height: 900 });
    await start(page, lang, theme);
    await page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true }).click();
    await page.locator('.coal-choice').first().getByRole('button', { name: lang === 'he' ? 'בפנים' : 'In', exact: true }).click();
    if (!phone) expect((await page.locator('.band').boundingBox())!.height).toBeLessThanOrEqual(60);
    await page.screenshot({ path: `.backup-scratch/scenario-reference/${lang}-${theme}-${phone ? 'phone' : 'desktop'}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('tab', { name: lang === 'he' ? 'תמונת מצב' : 'Overview', exact: true }).click();
    await page.screenshot({ path: `.backup-scratch/scenario-reference/overview-${lang}-${theme}-${phone ? 'phone' : 'desktop'}.png` });
  });
}
