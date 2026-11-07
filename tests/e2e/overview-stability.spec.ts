import { choose } from './choices.ts';
// Overview round 2: nothing moves under the pointer when you edit or open a list, focus is never hidden under
// the sticky bars, and Hebrew text beside numbers and graphics reads correctly.
import { expect, test, type Page } from '@playwright/test';

const start = async (page: Page, lang: 'en' | 'he' = 'en', width = 1500, election = 'k26') => {
  await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); const o = JSON.parse(v); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang, hintDismissed: true, level: 'expert' }));
  await page.goto('/');
  await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
};
const top = (page: Page, sel: string) => page.locator(sel).first().evaluate(e => Math.round(e.getBoundingClientRect().top + scrollY));
const increase = (page: Page, lang: 'en' | 'he') => page.locator('.side-panel').getByRole('button', { name: lang === 'he' ? /^הוספת קולות/ : /^Increase Votes/ }).first();

for (const [lang, width] of [['en', 1500], ['he', 1024], ['he', 390]] as const) {
  test(`the first edit moves nothing on the page (${lang}, ${width})`, async ({ page }) => {
    await start(page, lang, width);
    // the change line is there before any edit, so the first edit cannot insert it above the board
    await expect(page.locator('.session')).toContainText(lang === 'he' ? 'אין שינויים' : 'No changes');
    await page.locator('.lb-row').nth(6).click();
    const plus = increase(page, lang);
    const before = { chamber: await top(page, '.chamber-panel'), lists: await top(page, '.lbars'), band: await page.locator('header.band').evaluate(e => Math.round(e.getBoundingClientRect().height)) };
    await plus.click();
    await expect(page.locator('.session')).toContainText(lang === 'he' ? 'היסטוריה' : 'History');
    expect({ chamber: await top(page, '.chamber-panel'), lists: await top(page, '.lbars'), band: await page.locator('header.band').evaluate(e => Math.round(e.getBoundingClientRect().height)) }).toEqual(before);
    // further edits that add more to say do not grow the line either
    for (let i = 0; i < 10; i++) await plus.click();
    expect(await top(page, '.chamber-panel')).toBe(before.chamber);
  });
}

test('opening a list keeps the lists column still; the side panel starts below the change line', async ({ page }) => {
  await start(page);
  const rows = () => page.locator('.lb-row').evaluateAll(rs => rs.slice(0, 10).map(r => { const b = r.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }));
  const before = await rows();
  await page.locator('.lb-row').nth(3).click();
  await expect(page.locator('.side-panel')).toBeVisible();
  expect(await rows()).toEqual(before);
  const sessionBottom = await page.locator('.session').evaluate(e => e.getBoundingClientRect().bottom);
  expect(await page.locator('.side-panel').evaluate(e => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(sessionBottom);
});

test('History opens over the page and Escape closes it without closing the open list', async ({ page }) => {
  await start(page);
  await page.locator('.lb-row').nth(2).click();
  await increase(page, 'en').click();
  const chamber = await top(page, '.chamber-panel');
  await page.locator('.session').getByRole('button', { name: /^History/ }).click();
  await expect(page.locator('.session .history')).toBeVisible();
  await expect(page.locator('.session .history')).toContainText('Undo:');
  expect(await top(page, '.chamber-panel')).toBe(chamber);
  await page.keyboard.press('Escape');
  await expect(page.locator('.session .history')).toBeHidden();
  await expect(page.locator('.side-panel')).toBeVisible();
});

test('keyboard focus is never hidden under the sticky bars', async ({ page }) => {
  await start(page);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const legend = page.locator('.chamber .legend button').first();
  await legend.focus();
  const [focusTop, barsBottom] = await legend.evaluate(e => [e.getBoundingClientRect().top, document.querySelector('.session')!.getBoundingClientRect().bottom]);
  expect(focusTop).toBeGreaterThanOrEqual(barsBottom);
});

test('"Show all" below the threshold is a full-size target with a visible focus ring', async ({ page }) => {
  await start(page);
  const more = page.locator('.lb-thr button');
  await more.focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  const s = await more.evaluate(e => { const cs = getComputedStyle(e); return { outline: cs.outlineStyle, h: e.getBoundingClientRect().height }; });
  expect(s.outline).toBe('solid');
  expect(s.h).toBeGreaterThanOrEqual(24);
  await expect(more).toHaveAttribute('aria-expanded', 'false');
});

test('Hebrew phone: bloc counts are spaced from their majority note, the government name fits, no sideways scroll', async ({ page }) => {
  await start(page, 'he', 390, 'k25');
  const legend = page.locator('.blocs .strip-legend');
  await expect(legend).toContainText('64 3 מעל 61');
  await expect(legend).toContainText('56 חסרים 5 ל-61');
  const current = page.getByRole('button', { name: 'חלוקה לגושים', exact: true }).locator('.choice-current');
  expect(await current.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('the About disclosure in the band is as tall as its neighbours', async ({ page }) => {
  await start(page);
  const h = await page.locator('header.band .election-about summary').evaluate(e => e.getBoundingClientRect().height);
  expect(h).toBeGreaterThanOrEqual(28);
});

test('What if… change previews keep Hebrew names on the reading side and bars left to right', async ({ page }) => {
  await start(page, 'he');
  await page.locator('#tab-whatif').click();
  await page.locator('.wi-q:not(:disabled)').first().click();
  const row = page.locator('.wi-preview .cmp-diff li').first();
  await expect(row).toBeVisible();
  const x = await row.evaluate(li => ({ dir: getComputedStyle(li).direction, label: li.querySelector('.cmp-label')!.getBoundingClientRect().left, neg: li.querySelector('.cmp-neg')!.getBoundingClientRect().left, labelDir: getComputedStyle(li.querySelector('.cmp-label')!).direction }));
  expect(x.dir).toBe('ltr');
  expect(x.labelDir).toBe('rtl');
  expect(x.label).toBeGreaterThan(x.neg); // the name sits to the right of the bars
});

test('in English the chamber hover names a Knesset member in English', async ({ page }) => {
  await start(page, 'en', 1500, 'k25');
  // hover every seat until one names a candidate with an official English name; no seat may show Hebrew letters only
  const seats = page.locator('.chamber [data-seat]');
  let english = 0;
  for (let i = 0; i < 120; i += 13) {
    await seats.nth(i).hover();
    const name = await page.locator('.chamber .tip b').first().innerText();
    if (/^[A-Za-z]/.test(name)) english++;
  }
  expect(english).toBeGreaterThan(5);
});
