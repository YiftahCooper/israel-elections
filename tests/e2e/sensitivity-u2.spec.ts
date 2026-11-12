import { test, expect } from '@playwright/test';

test('default analysis survives reload without starting workers; edits calculate automatically', async ({ page }) => {
  test.setTimeout(300_000);
  await page.addInitScript(() => { localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', level: 'expert', hintDismissed: true })); });
  await page.goto('/'); await page.locator('#tab-sens').click();
  await expect(page.locator('.sens .callout')).toBeVisible({ timeout: 120_000 });
  await expect(page.locator('.sens .sweep-tbl tbody tr')).not.toHaveCount(0);
  // a bloc-flip answer first shown as "at most" is settled by a second search; only finished analysis is kept
  await expect(page.getByText(/Searching exactly|Checking for a smaller transfer/)).toHaveCount(0, { timeout: 180_000 });
  const before = await page.locator('.sens .sweep-tbl').textContent();
  await page.reload();
  let workers = 0;
  page.on('worker', () => workers++);
  await page.locator('#tab-sens').click();
  await expect(page.locator('.sens .callout')).toBeVisible();
  await expect(page.locator('.sens .sweep-tbl')).toHaveText(before!);
  expect(workers).toBe(0);
  const from = page.getByRole('textbox', { name: 'From', exact: true });
  await from.fill('100000'); await from.press('Enter');
  await expect.poll(() => workers).toBeGreaterThan(0);
});

for (const theme of ['light', 'dark']) test(`${theme}: signed arrows contrast on result backgrounds, names use swatches, order and precision`, async ({ page }) => {
  await page.addInitScript(theme => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', theme, level: 'standard', hintDismissed: true })), theme);
  await page.goto('/'); await page.locator('#tab-sens').click();
  await expect(page.locator('.sens .sweep-tbl .swatch').first()).toBeVisible({timeout:60000});
  expect(await page.locator('.sens h3').allTextContents()).toEqual(['Votes → seats i', 'Votes to flip a majority i', 'Threshold → seats i']);
  const deltas = page.locator('.sens .seat-delta');
  const ratios = await page.locator('.sens .seat-delta, .sens .swatch + bdi').evaluateAll(els => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0,3).map(Number);
    const lum = (c: number[]) => c.map(v => { const x=v/255; return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4; }).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
    return els.map(el => {
      let p: Element|null=el; let bg='';
      while(p) { bg=getComputedStyle(p).backgroundColor; if(bg!=='rgba(0, 0, 0, 0)' && bg!=='transparent') break; p=p.parentElement; }
      const a=lum(rgb(getComputedStyle(el).color)), b=lum(rgb(bg));
      return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
    });
  });
  expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
  await expect(deltas.first()).toHaveAttribute('dir','ltr');
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect.poll(async () => {
    const row = await page.locator('.sweep-tbl tr[aria-current="true"]').boundingBox();
    const box = await page.locator('.sweep-tbl').locator('..').boundingBox();
    const header = await page.locator('.sweep-tbl thead').boundingBox();
    return !!row && !!box && !!header && row.y >= header.y + header.height - 1 && row.y + row.height <= box.y + box.height + 1;
  }).toBe(true);
  const thresholds = page.locator('.sens table').nth(1).locator('td.n[title]');
  for(const text of await thresholds.allTextContents()) expect(text).toMatch(/^\d+(\.\d{1,2})?%$/);
});
