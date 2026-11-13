import { choose } from './choices.ts';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { if (!sessionStorage.getItem('context-seeded')) { localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', hintDismissed: true })); sessionStorage.setItem('context-seeded', '1'); } });
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Lists', exact: true })).toBeVisible();
});
test('k14 displays the independent PM ballot in Simple', async ({ page }) => {
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k14');
  const pm = page.getByRole('region', { name: 'Prime Minister result' });
  await expect(pm).toContainText('Benjamin Netanyahu');
  await expect(pm).toContainText('1,501,023');
  await expect(pm).toContainText('50% of valid PM votes');
  // the share is computed from the votes (1,501,023 of 2,972,589 = 50.4955%); the notice's rounded 50.49% is quoted, not called exact
  await expect(pm.locator('.pm-candidate').first()).toContainText('1,501,023 · 50.5%');
  await pm.getByText('Ballot totals & sources').click();
  await expect(pm).toContainText('3,121,270');
  await expect(pm.locator('.pm-published')).toContainText('Shares printed in the official results notice: Benjamin Netanyahu 50.49% · Shimon Peres 49.51%');
  await expect(page.getByRole('region', { name: 'The Knesset', exact: true })).toBeVisible();
});
test('2001 is PM-only and returns to the unaltered k15 chamber', async ({ page }) => {
  const picker = page.getByRole('button', { name: 'Election', exact: true });
  await choose(picker, 'pm2001');
  await expect(picker).toHaveAttribute('data-value', 'pm2001');
  const pm = page.getByRole('region', { name: 'Prime Minister result' });
  await expect(pm).toContainText('No Knesset was elected');
  await expect(page.getByRole('button', { name: 'Save & share', exact: true })).toHaveCount(0);
  await expect(pm).toContainText('1,698,077');
  await expect(page.getByRole('region', { name: 'The Knesset', exact: true })).toHaveCount(0);
  await pm.getByRole('button', { name: 'The 15th Knesset' }).click();
  await expect(picker).toHaveAttribute('data-value', 'k15');
  await expect(page.getByRole('region', { name: 'The Knesset', exact: true })).toBeVisible();
});
test('k1 explains the Constituent Assembly in expandable context', async ({ page }) => {
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k1');
  await page.getByText('About', { exact: true }).click();
  await expect(page.getByText(/This election chose the Constituent Assembly/)).toBeVisible();
});

for (const lang of ['he', 'en']) for (const theme of ['light', 'dark']) for (const size of ['desktop', 'phone']) {
  test(`context and PM layouts: ${lang} ${theme} ${size}`, async ({ page }) => {
    await page.setViewportSize(size === 'phone' ? { width: 390, height: 844 } : { width: 1500, height: 1000 });
    await page.evaluate(({ lang, theme }) => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, theme, hintDismissed: true })), { lang, theme });
    await page.reload();
    const picker = page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true });
    for (const id of ['k14', 'k15', 'pm2001', 'k1']) {
      await choose(picker, id);
      await expect(picker).toHaveAttribute('data-value', id);
      if (id === 'k1') {
        // phones: About is in the bar's Menu (one-row bar, owner 9 Nov)
        if (size === 'phone') await page.locator('.band .band-menu-btn').click();
        await page.getByText(lang === 'he' ? 'אודות' : 'About', { exact: true }).click();
      }
      else await expect(page.getByRole('region', { name: lang === 'he' ? 'תוצאות הבחירות לראש הממשלה' : 'Prime Minister result' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (process.env.CAPTURE_SCREENSHOTS) await page.screenshot({ path: `.backup-scratch/era-implementation/screenshots/${id}-${lang}-${theme}-${size}.png`, fullPage: true });
    }
  });
}
