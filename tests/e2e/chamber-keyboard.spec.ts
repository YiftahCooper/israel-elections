import { expect, test, type Page } from '@playwright/test';

// Audit 12 Nov 2026 (ax-screens-a-03, a-04, a-06): every seat card opens from the keyboard in both layouts and both
// languages, one tab stop for the whole chamber; Blocks dims the other seats like the arc; Blocks draws (and exports)
// every seat of a chamber larger than 120.
async function open(page: Page, { lang = 'en', layout = 'hemicycle' }: { lang?: 'en' | 'he'; layout?: string } = {}) {
  await page.addInitScript(({ lang, layout }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, chamberLayout: layout } }));
    sessionStorage.setItem('seeded', '1');
  }, { lang, layout });
  await page.goto('/');
  await expect(page.locator('.chamber [data-seat]').first()).toBeVisible();
}
const seats = (page: Page) => page.locator('.chamber').first().locator('[data-seat-pos]');
const seat = (page: Page, i: number) => page.locator('.chamber').first().locator(`[data-seat-pos="${i}"]`);
const card = (page: Page) => page.locator('.chamber .tip');

for (const lang of ['en', 'he'] as const) for (const layout of ['hemicycle', 'blocks'] as const) {
  test(`seat cards open from the keyboard: ${layout}, ${lang}`, async ({ page }) => {
    await open(page, { lang, layout });
    // one tab stop for the chamber
    await expect(seats(page)).toHaveCount(120);
    await expect(page.locator('.chamber [data-seat-pos][tabindex="0"]')).toHaveCount(1);
    await seat(page, 0).focus();
    // its name: the list, the seat's number in it, and the member the card names
    const name = await seat(page, 0).getAttribute('aria-label');
    expect(name).toMatch(lang === 'en' ? / · seat 1 · \S/ : / · מושב 1 · \S/);
    await expect(page.locator('.chamber .seat-ring')).toHaveCount(1);
    // arrows follow what is drawn, left to right in both languages (the chamber is never mirrored)
    const x0 = (await seat(page, 0).boundingBox())!.x;
    await page.keyboard.press('ArrowRight');
    const right = layout === 'blocks' ? 6 : 1;
    await expect(seat(page, right)).toBeFocused();
    expect((await seat(page, right).boundingBox())!.x).toBeGreaterThan(x0);
    await expect(page.locator('.chamber [data-seat-pos][tabindex="0"]')).toHaveCount(1);
    await expect(seat(page, right)).toHaveAttribute('tabindex', '0');
    await page.keyboard.press('ArrowLeft');
    await expect(seat(page, 0)).toBeFocused();
    if (layout === 'blocks') { await page.keyboard.press('ArrowDown'); await expect(seat(page, 1)).toBeFocused(); await page.keyboard.press('ArrowUp'); }
    // Enter opens the card for this seat; it names the same member
    await page.keyboard.press('Enter');
    await expect(card(page)).toBeVisible();
    await expect(seat(page, 0)).toHaveAttribute('aria-expanded', 'true');
    const member = name!.split(' · ').at(-1)!;
    await expect(card(page)).toContainText(member);
    // the open card follows the arrow keys
    await page.keyboard.press('ArrowRight');
    await expect(card(page)).toContainText((await seat(page, right).getAttribute('aria-label'))!.split(' · ').at(-1)!);
    await page.keyboard.press('ArrowLeft');
    // Tab goes into the card (its links), Escape closes it and returns to the seat
    if (await card(page).locator('button, a[href]').count()) {
      await page.keyboard.press('Tab');
      await expect(card(page).locator(':focus')).toHaveCount(1);
    }
    await page.keyboard.press('Escape');
    await expect(card(page)).toHaveCount(0);
    await expect(seat(page, 0)).toBeFocused();
    // Space opens it too
    await page.keyboard.press(' ');
    await expect(card(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card(page)).toHaveCount(0);
  });
}

test('the pointer works as before and shows no focus ring', async ({ page }) => {
  await open(page);
  await seat(page, 3).locator('[data-seat]').hover();
  await expect(card(page)).toBeVisible();
  await seat(page, 3).locator('[data-seat]').click();
  await expect(page.locator('.lb-row.dim').first()).toBeVisible();
  await expect(page.locator('.chamber .seat-ring')).toHaveCount(0);
});

for (const layout of ['hemicycle', 'blocks'] as const) test(`Dim other seats works in ${layout}`, async ({ page }) => {
  await open(page, { layout });
  await page.locator('.lb-row').first().click();
  const chamber = page.locator('.chamber').first();
  const selected = await chamber.locator('[data-seat]:not(.dim)').count();
  expect(selected).toBeGreaterThan(0);
  expect(selected).toBeLessThan(120);
  await expect(chamber.locator('[data-seat].dim')).toHaveCount(120 - selected);
  // a joint list's party dots fade with their seats
  await expect(chamber.locator('[data-component-seat]:not(.dim)')).toHaveCount(await chamber.locator('[data-seat]:not(.dim) + [data-component-seat]').count());
});

for (const n of [120, 121, 150, 1000]) test(`Blocks draws and exports every seat of a ${n}-seat chamber`, async ({ page }) => {
  await open(page, { layout: 'blocks' });
  if (n !== 120) {
    await page.locator('#tab-rules').click();
    await page.getByRole('button', { name: 'Experimental', exact: true }).click();
    const field = page.getByRole('textbox', { name: 'Seats', exact: true });
    await field.fill(String(n)); await field.press('Enter');
    await page.locator('#tab-board').click();
  }
  const svg = page.locator('.chamber').first().locator('> svg');
  await expect(svg.locator('[data-seat]')).toHaveCount(n, { timeout: 30_000 });
  const outside = (doc: SVGSVGElement) => {
    const vb = doc.viewBox.baseVal;
    return [...doc.querySelectorAll<SVGRectElement>('[data-seat]')].filter(r => {
      const x = Number(r.getAttribute('x')), y = Number(r.getAttribute('y')), w = Number(r.getAttribute('width')), h = Number(r.getAttribute('height'));
      return x < vb.x || y < vb.y || x + w > vb.x + vb.width || y + h > vb.y + vb.height;
    }).length;
  };
  expect(await svg.evaluate(outside)).toBe(0);
  // the drawing fits the panel: no seat runs past its right edge on screen
  const box = (await svg.boundingBox())!;
  const last = (await svg.locator('[data-seat]').last().boundingBox())!;
  expect(last.x + last.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
  // the SVG export carries the same drawing
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export SVG', exact: true }).click()]);
  const xml = await (await download.createReadStream()).toArray().then(parts => Buffer.concat(parts).toString('utf8'));
  const left = await page.evaluate(([xml, fn]) => {
    const doc = new DOMParser().parseFromString(xml, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
    document.body.appendChild(doc);
    const out = (new Function(`return ${fn}`)() as (d: SVGSVGElement) => number)(doc);
    const count = doc.querySelectorAll('[data-seat]').length;
    doc.remove();
    return { out, count };
  }, [xml, outside.toString()] as const);
  expect(left).toEqual({ out: 0, count: n });
});
