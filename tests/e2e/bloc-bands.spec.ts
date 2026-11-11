import { readFile } from 'node:fs/promises';
import { deflateRawSync } from 'node:zlib';
import { dataset } from '../graphics-cases.ts';
import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

for (const lang of ['he', 'en'] as const) for (const theme of ['light', 'dark']) {
  test(`${lang} ${theme}: bloc borders, quiet fills and fixed seat geometry in both layouts`, async ({ page }) => {
    await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), { lang, theme, level: 'expert', hintDismissed: true });
    await page.goto('/');
    for (const election of ['k26', 'k25', 'k1']) {
      if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
      await expect(page.locator('.chamber').first().locator('[data-seat]')).toHaveCount(120);
      for (const layout of ['hemicycle', 'blocks']) {
        await page.getByRole('group', { name: lang === 'he' ? 'פריסה' : 'Chamber layout' }).getByRole('button', { name: layout === 'blocks' ? (lang === 'he' ? 'גושים' : 'Blocks') : (lang === 'he' ? 'קשת' : 'Arc'), exact: true }).click();
        const borders = page.locator('.chamber > svg .wedge');
        expect(await borders.count()).toBeGreaterThan(0);
        for (const border of await borders.all()) {
          const style = await border.evaluate(el => {
            const s = getComputedStyle(el);
            return { stroke: s.stroke, width: Number.parseFloat(s.strokeWidth), opacity: s.strokeOpacity, vector: s.vectorEffect };
          });
          expect(style.stroke).not.toBe('none');
          expect(style.width).toBeGreaterThanOrEqual(1.25);
          expect(style.opacity).toBe('1');
          expect(style.vector).toBe('non-scaling-stroke');
        }
        // Resolve real browser colours, including color-mix(), into sRGB before checking contrast.
        const contrasts = await page.locator('.chamber > svg .wedge').evaluateAll(nodes => nodes.map(el => {
          const css = getComputedStyle(el), canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d')!;
          const luminance = (color: string) => {
            ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
            const c = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; });
            return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
          };
          const border = luminance(css.getPropertyValue('--bloc-border'));
          return [css.fill, css.getPropertyValue('--surface')].map(c => { const l = luminance(c); return (Math.max(l, border) + .05) / (Math.min(l, border) + .05); });
        }));
        for (const pair of contrasts) for (const ratio of pair) expect(ratio).toBeGreaterThanOrEqual(3);
        if (election === 'k25' && layout === 'hemicycle') {
          const download = page.waitForEvent('download');
          await page.getByRole('button', { name: lang === 'he' ? 'ייצוא SVG' : 'Export SVG', exact: true }).click();
          const svg = await readFile((await (await download).path())!, 'utf8');
          expect(svg).toContain('vector-effect="non-scaling-stroke"');
          expect(svg).toMatch(/stroke="rgb\(/);
          expect(svg).not.toContain('color-mix(');
        }
        if (process.env.V1_SCREENSHOTS) for (const width of [1500, 1024, 390]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.mouse.move(0, 0);
          await page.keyboard.press('Escape');
          await page.locator('.chamber').first().screenshot({ path: `.backup-scratch/v1/${election}-${lang}-${theme}-${layout}-${width}.png` });
        }
      }
    }
  });
}


test('2x DPR: the same shared boundaries render without scaling the border', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', theme: 'dark', level: 'expert', hintDismissed: true })));
  await page.goto('/');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
  if (process.env.V1_SCREENSHOTS) {
    await page.mouse.move(0, 0);
    const svg = page.locator('.chamber > svg').first();
    await svg.screenshot({ path: '.backup-scratch/v1/k25-en-dark-arc-dpr2.png' });
    const box = (await svg.boundingBox())!;
    await page.screenshot({ path: '.backup-scratch/v1/boundary-dpr2.png', clip: { x: box.x + box.width * .45, y: box.y + 5, width: box.width * .18, height: box.height - 10 } });
  }
  await context.close();
});

// The bloc line as drawn in the app: every seat lies wholly inside its own bloc's shape and outside every other one,
// in both layouts, for two blocs (2022) and four (2021, whom each list recommended for prime minister).
for (const [n, scheme] of [[25, null], [24, 'pm-recommendations']] as const) test(`k${n} ${scheme ?? 'default'}: every seat inside its own bloc shape`, async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', hintDismissed: true })));
  const payload = { e: `k${n}`, n: 'Bloc line', b: dataset(n).buildInfo.builtAt, l: scheme ? [{ type: 'applyBlocScheme', schemeId: scheme }] : [] };
  await page.goto('/#s=' + deflateRawSync(JSON.stringify(payload)).toString('base64url'));
  await expect(page.locator('.chamber').first().locator('[data-seat]')).toHaveCount(120, { timeout: 30000 });
  for (const layout of ['Arc', 'Blocks']) {
    await page.getByRole('group', { name: 'Chamber layout' }).getByRole('button', { name: layout, exact: true }).click();
    const report = await page.locator('.chamber > svg').first().evaluate(svg => {
      const regions = [...svg.querySelectorAll<SVGGeometryElement>('[data-bloc-region]')], errors: string[] = [];
      const pt = (x: number, y: number) => { const p = (svg as SVGSVGElement).createSVGPoint(); p.x = x; p.y = y; return p; };
      svg.querySelectorAll<SVGGraphicsElement>('[data-seat]').forEach((seat, i) => {
        const b = seat.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2, r = b.width / 2;
        const round = seat.tagName === 'circle';
        const samples = Array.from({ length: 24 }, (_, k) => { const a = (k / 24) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a), m = round ? 1 : 1 / Math.max(Math.abs(c), Math.abs(s)); return pt(cx + c * r * m * 0.98, cy + s * r * m * 0.98); });
        const own = seat.getAttribute('data-bloc') === '__none' ? '__none' : seat.getAttribute('data-bloc');
        for (const region of regions) {
          const mine = region.getAttribute('data-bloc-region') === own, hits = samples.filter(p => region.isPointInFill(p)).length;
          if (mine && hits < samples.length) errors.push(`seat ${i} sticks out of its own bloc`);
          if (!mine && hits > 0) errors.push(`seat ${i} reaches into bloc ${region.getAttribute('data-bloc-region')}`);
        }
      });
      return { regions: regions.length, errors };
    });
    expect(report.regions).toBeGreaterThanOrEqual(scheme ? 4 : 2);
    expect(report.errors).toEqual([]);
  }
});
