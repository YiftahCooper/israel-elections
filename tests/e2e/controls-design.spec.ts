import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert', hintDismissed: true })));
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
});
test('one election timeline, official seat previews and an in-place Open', async ({ page }) => {
  await page.getByRole('button', { name: 'Election', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Previous election', exact: true })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'All elections', exact: true })).toHaveCount(0);
  await expect(dialog.locator('.choice-era').first()).toHaveCSS('border-inline-start-width', '0px');
  await expect(dialog.locator('.election-row .result-preview').first()).toBeVisible();
  const row = dialog.locator('[data-choice-value="k21"]');
  await expect(row).toContainText('April 2019');
  // one click opens the election: every row already carries its seat preview
  await row.click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.election .choice-trigger')).toHaveAttribute('data-value', 'k21');
  await page.getByRole('button', { name: 'Election', exact: true }).click();
  await dialog.getByRole('searchbox').fill('2001');
  await expect(dialog.locator('.pm-only')).toBeVisible();
  await expect(dialog.locator('.election-row')).toHaveCount(1);
  await expect(dialog.locator('.pm-only .result-preview')).toHaveCount(0);
  await page.screenshot({ path: '.backup-scratch/controls/election-pm-only-en-light-desktop.png' });
  await page.keyboard.press('Escape');
});
test('one vote stepper, three goals, overflow for rarer operations', async ({ page }) => {
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const panel = page.locator('.side-panel');
  // one vote stepper (the seat count above it is its own, single-step control)
  await expect(panel.locator('.numeric-stepper')).toHaveCount(2);
  await expect(panel.getByRole('group', { name: 'Votes controls', exact: true })).toHaveCount(1);
  await expect(panel.locator('.vote-goals > button')).toHaveCount(3);
  await expect(panel.getByRole('button', { name: 'Transfer 1 pp', exact: true })).not.toBeVisible();
  await panel.getByRole('button', { name: 'Scale, share & transfer', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Transfer 1 pp', exact: true })).toBeVisible();
});
test('saved official snapshots stay neutral; edited scenarios get distinct identities', async ({ page }) => {
  const picker = page.getByRole('button', { name: 'Switch scenario', exact: true });
  for (const name of ['A', 'B', 'C', 'D']) {
    // U7: names alone are metadata; only factual edits receive scenario tint.
    if (name !== 'A') {
      await page.locator('.lb-row').first().click();
      await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
      await page.keyboard.press('Escape');
    }
    await page.getByRole('button', { name: 'Save & share', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Scenario name', exact: true });
    await input.fill(name); await input.press('Enter');
    await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
    await choose(picker, 'official');
  }
  await picker.click();
  const dialog = page.getByRole('dialog');
  const colours = await Promise.all(['B', 'C', 'D'].map(name => dialog.getByRole('button', { name, exact: true }).locator('.swatch').evaluate(el => getComputedStyle(el).backgroundColor)));
  expect(new Set(colours).size).toBe(3);
  const neutral = await dialog.getByRole('button', { name: 'A', exact: true }).locator('.swatch').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(colours).not.toContain(neutral);
  await expect(dialog).not.toContainText('Historical rules unchanged');
  await expect(dialog).not.toContainText('Latest vote source');
});
test('threshold goal stays under the pointer when its consequence appears', async ({ page }) => {
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.getByRole('button', { name: 'עברית', exact: true }).click();
  await page.getByRole('region', { name: 'הרשימות', exact: true }).getByRole('button', { name: 'מרצ', exact: true }).click();
  const panel = page.locator('.side-panel');
  const cross = panel.getByRole('button', { name: 'מעבר אחוז החסימה', exact: true });
  await cross.click();
  await panel.getByRole('button', { name: 'מעט מתחת לחסימה', exact: true }).click();
  await expect(cross).toBeEnabled({ timeout: 30000 });
  await cross.scrollIntoViewIfNeeded();
  const before = await cross.boundingBox();
  await cross.hover();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect((await cross.boundingBox())!.y).toBeCloseTo(before!.y, 1);
  await cross.click();
  await expect(panel.locator('.crossing')).toContainText('עברה את');
});
