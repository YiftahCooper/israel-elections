// The Localities map's place names keep their rules when the page's own font is missing (FX2, 19 Nov 2026): the web
// font is blocked and the page falls back to a much wider face, as on a device where the font never arrives. A name's
// room is kept for the text as the page draws it, so it still never runs onto the double-envelope island, another
// name, a dot, a circle or a town's tiles, and never off the map. English and Hebrew, phone and desktop, both views.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { mapLayout, settleMap } from './map-settle.ts';

const open = async (page: Page, lang: 'en' | 'he', view: 'winner' | 'mix') => {
  await page.addInitScript(([lang, view]) => {
    // a fallback much wider than the web font (a monospace face), for every text on the page
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'html:root { --font: "DejaVu Sans Mono", "Liberation Mono", monospace !important; }';
      document.head.append(style);
    });
    if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } }));
    localStorage.setItem('israel-elections:map-view', view);
  }, [lang, view]);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.route(/\.woff2?$/, route => route.abort());
  const outlines = view === 'mix' ? page.waitForResponse(r => r.url().endsWith('/data/locality-outlines-2022.geojson')) : null;
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: lang === 'he' ? 'יישובים' : 'Localities', exact: true }).click();
  await expect(page.locator('.vote-mix-canvas')).toHaveAttribute('data-island', /\d/);
  await outlines;
  await settleMap(page);
};

const overlap = (a: number[], b: number[]) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

for (const width of [1500, 390]) for (const lang of ['en', 'he'] as const) for (const view of ['winner', 'mix'] as const) {
  test(`${width} px, ${lang}, ${view}: under a wider fallback font, names keep off the island, each other, the marks and the map's edge`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await open(page, lang, view);
    const fallback = await page.evaluate(() => getComputedStyle(document.querySelector('.locality-map-label')!).fontFamily);
    expect(fallback, 'the fallback is in use').toMatch(/Mono|monospace/);
    const { island, map, labels, inked } = await mapLayout(page);
    expect(labels.length, 'some names fit').toBeGreaterThan(2);
    for (const l of labels) {
      // the text as drawn fits the room kept for it
      expect(l.text[0], `${l.name}: text inside its box`).toBeGreaterThanOrEqual(l.box[0] - 0.5);
      expect(l.text[2], `${l.name}: text inside its box`).toBeLessThanOrEqual(l.box[2] + 0.5);
      expect(overlap(l.text, island), `${l.name} is clear of the island`).toBe(false);
      expect(l.box[0] >= map[0] && l.box[2] <= map[2] && l.box[1] >= map[1] && l.box[3] <= map[3], `${l.name} is on the map`).toBe(true);
    }
    const crossing = labels.flatMap((a, i) => labels.slice(i + 1).filter(b => overlap(a.text, b.text)).map(b => `${a.name} | ${b.name}`));
    expect(crossing, 'no name on another').toEqual([]);
    expect(inked, 'no name on a dot, circle or tiles').toEqual([]);
  });
}
