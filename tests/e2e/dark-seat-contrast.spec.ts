// Dark theme: every seat stands out from its bloc background (review V3 F12, 19 Nov 2026: Yesh Atid's #1b06ca on the
// opposition background measured 1.15:1, Likud 1.83:1; a seat's only edge was a one-unit outline that a phone draws at
// about 0.4 px). Non-text contrast needs 3:1: each seat has a light ring at least 1 px wide on screen, at 3:1 or more
// against the background it sits on, keeping the list colours.
import { expect, test, type Page } from './fixtures';
import { choose } from './choices.ts';

async function start(page: Page, width: number) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(() => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, theme: 'dark' } }));
  });
  await page.goto('/');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
}

for (const width of [390, 1500]) {
  test(`dark, ${width} px: each seat's ring is at least 1 px and 3:1 against its bloc background`, async ({ page }) => {
    await start(page, width);
    const seats = page.locator('.chamber circle[data-seat]');
    await expect(seats.first()).toBeVisible();
    const worst = await page.evaluate(() => {
      const rgb = (c: string): number[] => {
        const m = c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
        if (m) return m.slice(1, 4).map(Number);
        const n = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/)!;
        return n.slice(1, 4).map((x) => Number(x) / 255);
      };
      const lum = (c: number[]) => { const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
      const bg: Record<string, number[]> = {};
      for (const w of document.querySelectorAll<SVGPathElement>('.chamber path[data-bloc-region]')) bg[w.dataset.blocRegion!] = rgb(getComputedStyle(w).fill);
      let ring = Infinity, contrast = Infinity;
      for (const s of document.querySelectorAll<SVGCircleElement>('.chamber circle[data-seat]')) {
        const cs = getComputedStyle(s);
        const scale = cs.vectorEffect === 'non-scaling-stroke' ? 1 : s.getScreenCTM()!.a;
        ring = Math.min(ring, parseFloat(cs.strokeWidth) * scale);
        const back = bg[s.dataset.bloc!];
        if (back) contrast = Math.min(contrast, ratio(rgb(cs.stroke), back));
      }
      return { ring, contrast };
    });
    expect(worst.ring).toBeGreaterThanOrEqual(1);
    expect(worst.contrast).toBeGreaterThanOrEqual(3);
  });
}
