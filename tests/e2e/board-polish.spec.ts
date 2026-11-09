import { expect, test } from '@playwright/test';
import { openBarMenu } from './barMenu.ts';

test('a share link is cleared when its scenario changes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'simple', hintDismissed: true })));
  await page.goto('/');
  await page.getByRole('button', { name: 'Save & share', exact: true }).click();
  await page.getByRole('button', { name: 'Copy a share link', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Share link', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Scenario name', exact: true }).fill('Another scenario');
  await page.getByRole('textbox', { name: 'Scenario name', exact: true }).press('Enter');
  await expect(page.getByRole('textbox', { name: 'Share link', exact: true })).toHaveCount(0);
});

test('first visit keeps instructions available behind a concise label', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'simple', hintDismissed: false })));
  await page.goto('/');
  const guidance = page.getByRole('button', { name: 'Explore the board', exact: true });
  await expect(guidance).toBeVisible();
  await guidance.click();
  await expect(page.getByRole('tooltip')).toContainText('Click any list, seat, bloc or figure');
});

for (const lang of ['he', 'en']) for (const width of [390, 1024, 1500]) {
  test(`save menu stays within the viewport: ${lang} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.addInitScript(v => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: v, level: 'expert', hintDismissed: true })), lang);
    await page.goto('/');
    // phones (owner, 9 Nov 2026): Save & share is a section of the bar's Menu
    const phone = await openBarMenu(page);
    if (phone) await page.locator('#phone-menu summary', { hasText: lang === 'he' ? 'שמירה ושיתוף' : 'Save & share' }).click();
    else await page.getByRole('button', { name: lang === 'he' ? 'שמירה ושיתוף' : 'Save & share', exact: true }).click();
    const menu = page.locator(phone ? '#phone-menu' : '#scenarios-menu');
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(8);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 8);
    expect(box.y + box.height).toBeLessThanOrEqual(850);
    await page.getByRole('button', { name: lang === 'he' ? 'כל התרחישים' : 'All scenarios', exact: true }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });
}
