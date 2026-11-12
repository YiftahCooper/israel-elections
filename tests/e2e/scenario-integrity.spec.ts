// Faults that live on screen (audit 12 Nov 2026, ax-screens-c): a saved What if scenario exported from its card keeps its
// description; the expanded merger answer never states a false sum; damaged browser storage still lets the app start;
// on a phone the comparison strip's icon buttons keep their names.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, lang: 'en' | 'he' = 'en', width = 1500, extra: Record<string, string> = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, extra]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional', comparison: 'reference', jointSeats: 'off' }));
    for (const [k, v] of Object.entries(extra as Record<string, string>)) localStorage.setItem(k, v);
  }, [lang, extra] as const);
  await page.goto('/');
}
const MERGER = { en: 'Religious Zionism–Zehut and Otzma Yehudit on one list', he: 'הציונות הדתית–זהות ועוצמה יהודית ברשימה אחת' };

test('ax-screens-c-02: exporting a saved What if scenario from its card keeps its description', async ({ page }) => {
  await start(page);
  await page.locator('#tab-whatif').click();
  const row = page.locator('.wi-row').filter({ hasText: MERGER.en });
  await row.getByRole('button', { name: 'Open as a scenario' }).click();
  await page.locator('#tab-scenarios').click();
  const description = await page.getByRole('textbox', { name: 'Description', exact: true }).inputValue();
  expect(description).toContain('As in 2022.');
  await page.locator('.scn-save').click();
  await expect(page.locator('.scn-save')).toHaveText('Saved');
  const card = page.locator('.scn-card').first();
  const download = page.waitForEvent('download');
  await card.getByRole('button', { name: 'Export', exact: true }).click();
  const file = JSON.parse(readFileSync((await (await download).path())!, 'utf8'));
  expect(file.description).toBe(description);
});

for (const lang of ['en', 'he'] as const) test(`ax-screens-c-03: the expanded merger answer adds up (${lang})`, async ({ page }) => {
  await start(page, lang);
  await page.locator('#tab-whatif').click();
  const row = page.locator('.wi-row').filter({ hasText: MERGER[lang] });
  await row.locator('.wi-q').click();
  // the expanded line uses words, not an arrow: "A 6 + B 7 = 13 apart, 14 together +1" (WhatIf.tsx)
  const fact = row.locator('.wi-facts li').filter({ hasText: lang === 'he' ? 'בנפרד' : 'apart' }).first();
  // the parts as they were, their sum, then the joint list's own result and the difference
  await expect(fact).toContainText(lang === 'he' ? /6 \+ .*7 = 13 בנפרד/ : /6 \+ .*7 = 13 apart/);
  await expect(fact.locator('b')).toHaveText('14');
  await expect(fact).toContainText(lang === 'he' ? 'יחד' : 'together');
  await expect(fact.locator('.seat-delta')).toHaveText(/1/);
  await expect(fact).not.toContainText('14 =');
});

for (const value of ['null', '5', '"text"', '[]', '{"lang":', '{"lang":5,"level":{},"saved":"x","customFeatures":[1]}']) test(`ax-screens-c-06: the app starts with israel-elections:v1 = ${value}`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.addInitScript((value) => { if (!sessionStorage.getItem('started')) { sessionStorage.setItem('started', '1'); localStorage.setItem('israel-elections:v1', value); } }, value);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  expect(errors).toEqual([]);
});

for (const lang of ['en', 'he'] as const) test(`ax-screens-c-09: on a phone the strip's icon buttons keep their names (${lang})`, async ({ page }) => {
  await start(page, lang, 390);
  await page.locator('.compare-on').click();
  const strip = page.locator('.cmpm-strip');
  const side = strip.locator('.cmpm-side');
  await expect(side).toBeVisible();
  await expect(side.locator('span')).toBeHidden(); // only the icon shows
  await expect(side).toHaveAccessibleName(lang === 'en' ? 'Side by side' : 'זו לצד זו');
  await expect(strip.locator('.cmpm-swap')).toHaveAccessibleName(lang === 'en' ? 'Swap' : 'החלפה');
  await side.click();
  await expect(strip.locator('.cmpm-side')).toHaveAccessibleName(lang === 'en' ? 'Close side by side' : 'סגירת זו לצד זו');
});
