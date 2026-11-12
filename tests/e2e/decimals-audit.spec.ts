import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { openSideBySide } from './sideBySide.ts';

// Settings → Max decimal places bounds every percentage and percentage-point figure on screen. Exempt: a threshold
// set in law (3.25%, 1.5%) is a rule, shown exactly; anything inside [data-exact], where a screen is about precision;
// and a share next to a threshold, which shows one more digit rather than look like it is on the other side. Separately, no number on any screen may have five or more decimals (an unbounded float).
const LAW = new Set(['3.25', '1.5']);
const THRESHOLDS = [1, 1.5, 2, 3.25];
async function open(page: Page, max: number, election: string) {
  await page.addInitScript(max => {
    if (sessionStorage.getItem('audit-seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: max, starterTip: false } }));
    sessionStorage.setItem('audit-seeded', '1');
  }, max);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  if (election !== 'k26') await choose(page.getByRole('button', { name: 'Election', exact: true }), election);
}
/** every percentage on screen with more decimals than allowed, and every number with five or more decimals */
const offenders = (page: Page, max: number) => page.evaluate(([max, law, THRESHOLDS]) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const bad: string[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement!;
    if (el.closest('[data-exact], script, style, [hidden]') || !el.getClientRects().length) continue;
    const text = n.textContent!;
    for (const m of text.matchAll(/(\d+)\.(\d+)\s?(%|pp\b|נק׳|points)/g)) {
      if (m[2].length <= max || (law as string[]).includes(`${m[1]}.${m[2]}`)) continue;
      // one digit more, only for a share next to a threshold (1, 1.5, 2, 3.25): shown so it stays on its true side
      const v = Number(`${m[1]}.${m[2]}`);
      if (m[3] === '%' && m[2].length === max + 1 && THRESHOLDS.some((t) => Math.abs(v - t) < 10 ** -max)) continue;
      bad.push(`${m[0]} in “${text.trim().slice(0, 60)}”`);
    }
    for (const m of text.matchAll(/\d+\.\d{5,}/g)) bad.push(`unbounded ${m[0]} in “${text.trim().slice(0, 60)}”`);
  }
  return bad;
}, [max, [...LAW], THRESHOLDS] as const);

for (const max of [0, 1, 2, 3]) for (const election of ['k26', 'k25', 'k1']) test(`overview and list page · ${election} · max ${max}`, async ({ page }) => {
  await open(page, max, election);
  expect(await offenders(page, max)).toEqual([]);
  await page.locator('.lb-row').first().click();
  await expect(page.locator('.side-panel')).toBeVisible();
  expect(await offenders(page, max)).toEqual([]);
});

for (const max of [0, 1, 2, 3]) for (const tab of ['compare', 'security', 'structure', 'charts']) test(`${tab} · k25 with a change · max ${max}`, async ({ page }) => {
  await open(page, max, 'k25');
  // a change gives Compare and the charts something to compare
  await page.locator('.lb-row').first().click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await page.keyboard.press('Escape');
  // Side by side opens from the comparison strip (no longer a tab)
  if (tab === 'compare') await openSideBySide(page); else await page.locator(`#tab-${tab}`).click();
  await page.waitForTimeout(600);
  expect(await offenders(page, max)).toEqual([]);
  // the screen's own disclosures (details, folded rows) hold numbers too
  for (const d of await page.locator('#analysis-panel details:not([open]) > summary').all()) await d.click().catch(() => {});
  await page.waitForTimeout(300);
  expect(await offenders(page, max)).toEqual([]);
});

for (const max of [0, 1]) test(`a split's shares and their sum · k25 · max ${max}`, async ({ page }) => {
  await open(page, max, 'k25');
  await page.getByRole('button', { name: 'United Torah Judaism', exact: true }).click();
  await page.getByRole('button', { name: 'Split into separate lists', exact: true }).click();
  // an uneven entered share makes the shares add up to a fractional total, which the form then states
  const share = page.getByRole('spinbutton', { name: /^Vote share of/ }).first();
  await share.fill('33.337'); await share.press('Tab');
  await expect(page.getByText(/The shares add up to/)).toBeVisible();
  expect(await offenders(page, max)).toEqual([]);
});
