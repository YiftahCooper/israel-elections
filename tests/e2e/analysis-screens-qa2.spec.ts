import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, lang: 'en' | 'he', width: number) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, theme: lang === 'he' ? 'dark' : 'light', level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
}
for (const lang of ['en', 'he'] as const) for (const width of [390, 1500]) {
  test(`${lang}/${width}: seat tracks preserve proportions and never rescale arriving results (S1, S3)`, async ({ page }) => {
    await start(page, lang, width);
    await page.locator('#tab-security').click();
    await page.waitForFunction(() => document.querySelectorAll('.sec-bar').length > 0);
    const changes = await page.evaluate(async () => {
      const widths = new Map<Element, number>(); let changes = 0;
      for (let i = 0; i < 80; i++) {
        document.querySelectorAll('.sec-bar').forEach(el => {
          const w = el.getBoundingClientRect().width;
          if (widths.has(el) && Math.abs(widths.get(el)! - w) > 1) changes++;
          widths.set(el, w);
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return changes;
    });
    expect(changes).toBe(0);
    const bars = page.locator('.sec-row:not(.head) .sec-l .sec-bar');
    await expect(bars).toHaveCount(11);
    const [a, b, c] = await Promise.all([0, 2, 3].map(i => bars.nth(i).boundingBox()));
    expect(b!.width / a!.width).toBeCloseTo(Math.sqrt(23535 / 12099), 1);
    expect(c!.width / a!.width).toBeCloseTo(Math.sqrt(33403 / 12099), 1);
  });

  test(`${lang}/${width}: sensitivity reserves loading space and uses complete labels and regular ticks (N1–N3)`, async ({ page }) => {
    await start(page, lang, width);
    await page.locator('#tab-sens').click();
    await expect(page.locator('.sens-result')).toBeVisible();
    const initial = (await page.locator('.sens-result').boundingBox())!;
    const chart = page.locator('.sens svg[aria-label]').first();
    await expect(chart).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('.sens-result .callout')).toBeVisible({ timeout: 120_000 });
    const final = (await page.locator('.sens-result').boundingBox())!;
    expect(Math.abs(initial.y - final.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(initial.height - final.height)).toBeLessThanOrEqual(1);
    const ticks = await chart.locator('text').allTextContents();
    expect(ticks.slice(0, 5)).toEqual(['0', '10', '20', '30', '40']);
    const ladder = page.locator('.sens svg[aria-label]').nth(1);
    expect(await ladder.textContent()).not.toContain('…');
    const values = ladder.locator('.halo');
    expect(await values.count()).toBeGreaterThan(0);
    await expect(values.first()).toHaveAttribute('x', await values.last().getAttribute('x') ?? '');
    const table = page.locator('.sens .tablewrap').nth(1);
    const clipped = await table.evaluate(box => {
      const bottom = box.querySelector('th')!.getBoundingClientRect().bottom;
      return [...box.querySelectorAll('tbody tr')].some(row => { const r = row.getBoundingClientRect(); return r.top < bottom - 1 && r.bottom > bottom + 1; });
    });
    expect(clipped).toBe(false);
    for (const box of await page.locator('.sens .tablewrap').all()) {
      const current = box.locator('tr[aria-current="true"]');
      const [row, header, viewport] = [(await current.boundingBox())!, (await box.locator('th').first().boundingBox())!, (await box.boundingBox())!];
      expect(row.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
      expect(row.y + row.height).toBeLessThanOrEqual(viewport.y + viewport.height + 1);
    }
  });

  test(`${lang}/${width}: chart names, formula help, comparison options and coalitions stay aligned (C1–CO1)`, async ({ page }) => {
    await start(page, lang, width);
    await page.locator('#tab-charts').click();
    const distance = page.locator('svg').filter({ has: page.locator('text', { hasText: '+152,748' }) });
    await expect(distance).toHaveCount(1);
    const name = distance.locator('[data-chart-label]').first();
    const bar = distance.locator('.bar').first();
    const [n, b] = [(await name.boundingBox())!, (await bar.boundingBox())!];
    expect(b.y - n.y).toBeLessThan(40);
    if (lang === 'he' && width === 390) {
      for (const chart of await page.locator('svg:has([data-chart-label])').all()) {
        await expect(chart.locator('[data-chart-label]').first()).toHaveAttribute('text-anchor', 'end');
      }
    }
    await page.locator('#tab-walk').click();
    const formula = page.locator('.formula').first();
    const help = formula.locator('button');
    await expect(help).toHaveCount(1);
    const lastNumber = help.locator('..');
    const [parent, info] = [(await lastNumber.boundingBox())!, (await help.boundingBox())!];
    expect(Math.abs(info.y - parent.y)).toBeLessThanOrEqual(6);
    expect(await lastNumber.evaluate(el => el.getClientRects().length)).toBe(1);
    expect((await page.getByRole('region', { name: lang === 'en' ? 'Lists by votes' : 'רשימות לפי קולות' }).boundingBox())!.width).toBeLessThanOrEqual(720);
    await page.locator('#tab-compare').click();
    // Explicitly return to the identical official result to audit the chooser controls.
    await choose(page.getByRole('button', { name: lang === 'en' ? 'Compare with' : 'השוואה עם', exact: true }), 'historical');
    await expect(page.locator('.cmp-empty')).toBeVisible();
    const heights = await page.locator('.cmp-picks > button, .cmp-picks .choice-trigger').evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().height));
    expect(heights.length).toBeGreaterThan(1);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    await page.locator('#tab-coal').click();
    const row = page.locator('.coal-list > li > button').first();
    const [count, track] = [(await row.locator('.coal-n').boundingBox())!, (await row.locator('.coal-bar').boundingBox())!];
    expect(Math.abs(count.y + count.height / 2 - track.y - track.height / 2)).toBeLessThan(1);
    // phone cards stay compact: the name on one line, the five roles (In/Support/Abstain/Out/Any) on the next
    if (width === 390) expect(Math.max(...await page.locator('.coal-choice').evaluateAll(cs => cs.map(c => c.getBoundingClientRect().height)))).toBeLessThanOrEqual(72);
  });
}
