// A bloc's name is never cut short in a bloc strip (fault of 16 Nov 2026: in Hebrew the Arab lists' band read «רשימות ע…»).
// A name may wrap onto two lines inside its band; when any band is too narrow even for that, every name is listed in full
// in the key beneath the strip instead (always so on a phone). Checked for 2021, 2022 and 2026, every grouping, both
// languages, every 20 px from 360 to 1500, and for the compared result's strip under it.
import { expect, test, type Page } from './fixtures';
import { choose } from './choices.ts';
import { waitForStill } from './settle.ts';

const open = async (page: Page, lang: 'en' | 'he') => {
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.addInitScript((lang) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { theme: 'light', starterTip: false, decimals: 2 } }));
  }, lang);
  await page.goto('/');
  await expect(page.locator('#tab-board')).toBeVisible();
};
const WIDTHS = Array.from({ length: (1500 - 360) / 20 + 1 }, (_, i) => 360 + i * 20);

/** every way a bloc strip on the page shows a name it cannot hold whole; empty when none */
const cutNames = (page: Page) => page.evaluate(() => {
  const faults: string[] = [];
  const shown = (e: Element) => getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility === 'visible';
  const cut = (e: Element) => (e as HTMLElement).scrollWidth > (e as HTMLElement).clientWidth + 1;
  for (const strip of document.querySelectorAll<HTMLElement>('.blocs .strip')) {
    if (getComputedStyle(strip).direction !== 'ltr') faults.push('strip is mirrored');
    const bands = [...strip.querySelectorAll('.corridor')];
    const legend = strip.parentElement!.querySelector(':scope > .strip-legend');
    const inBands = bands.filter(b => shown(b.querySelector('.label')!));
    const keyed = legend && shown(legend) ? [...legend.querySelectorAll(':scope > span')] : [];
    // each bloc is named once: in its band, or in the key
    if (inBands.length && keyed.length) faults.push(`named twice: ${inBands.length} bands and a key of ${keyed.length}`);
    if (inBands.length !== bands.length && keyed.length !== bands.length) faults.push(`${bands.length} blocs, ${inBands.length} named in bands, ${keyed.length} in the key`);
    if (window.innerWidth <= 760 && inBands.length) faults.push('names in the bands on a phone');
    for (const band of inBands) {
      const label = band.querySelector('.label')!, name = label.querySelector('.clip')!;
      const lines = new Set([...name.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top))).size;
      // the name itself is cut when it is a box narrower than its text (an ellipsis); a wrapping inline name never is
      if (cut(label) || cut(name) || lines > 2) faults.push(`band cut: ${name.textContent} (${lines} lines, ${(label as HTMLElement).scrollWidth}>${(label as HTMLElement).clientWidth})`);
    }
    for (const item of keyed) if (cut(item)) faults.push(`key cut: ${item.textContent}`);
    for (const e of [...inBands, ...keyed]) if (e.textContent!.includes('…')) faults.push(`ellipsis: ${e.textContent}`);
  }
  return faults;
});

const sweep = async (page: Page, where: string) => {
  const faults: string[] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 1000 });
    // a resize is measured on the next frame
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    for (const f of await cutNames(page)) faults.push(`${where} ${width}px: ${f}`);
  }
  return faults;
};

for (const lang of ['he', 'en'] as const) {
  test(`bloc names are never cut short · ${lang} · 2021, 2022, 2026, every grouping, 360–1500 px`, async ({ page }) => {
    test.setTimeout(240_000);
    await open(page, lang);
    const faults: string[] = [];
    for (const election of ['k24', 'k25', 'k26']) {
      await page.setViewportSize({ width: 1500, height: 1000 });
      await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
      const schemes = await page.evaluate(async (id) => ((await (await fetch(`/data/${id}.json`)).json()).blocSchemes as { id: string }[]).map(g => g.id), election);
      expect(schemes.length).toBeGreaterThan(1);
      for (const scheme of schemes) {
        await page.setViewportSize({ width: 1500, height: 1000 });
        const grouping = page.getByRole('button', { name: lang === 'en' ? 'Grouping' : 'חלוקה לגושים', exact: true });
        if ((await grouping.getAttribute('data-value')) !== scheme) await choose(grouping, scheme);
        // the bands ease to their new widths
        await waitForStill(page, '.blocs .strip .corridor');
        faults.push(...await sweep(page, `${election} ${scheme}`));
      }
    }
    expect(faults).toEqual([]);
  });

  test(`bloc names are never cut short in the compared result's strip · ${lang}`, async ({ page }) => {
    test.setTimeout(180_000);
    await open(page, lang);
    const faults: string[] = [];
    for (const election of ['k25', 'k26']) {
      await page.setViewportSize({ width: 1500, height: 1000 });
      await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
      if (!(await page.locator('.cmpm-refblocs').count())) await page.locator('.compare-on').click();
      await expect(page.locator('.cmpm-refblocs .strip')).toBeVisible();
      await waitForStill(page, '.blocs .strip .corridor');
      faults.push(...await sweep(page, `${election} compared`));
    }
    expect(faults).toEqual([]);
  });
}

test('the reported case: 2022’s Arab lists are named in full in Hebrew on a laptop and on a phone', async ({ page }) => {
  await open(page, 'he');
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k25');
  await choose(page.getByRole('button', { name: 'חלוקה לגושים', exact: true }), 'pre-election-blocs');
  const blocs = page.getByRole('region', { name: 'מנדטים לפי גוש' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  // wide enough: the name wraps onto two lines inside its band
  const band = blocs.locator('.strip .corridor').filter({ hasText: 'רשימות ערביות' });
  await expect(band.locator('.label')).toBeVisible();
  await expect(band.locator('.label .clip')).toHaveText('רשימות ערביות');
  await expect(blocs.locator('.strip-legend')).toBeHidden();
  // the grouping's bands ease to their widths, and a resize is fitted a frame later
  await waitForStill(page, '.blocs .strip .corridor');
  expect(await cutNames(page)).toEqual([]);
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect(blocs.locator('.strip-legend')).toContainText('רשימות ערביות 10');
  await waitForStill(page, ['.blocs .strip .corridor', '.blocs .strip-legend']);
  expect(await cutNames(page)).toEqual([]);
});
