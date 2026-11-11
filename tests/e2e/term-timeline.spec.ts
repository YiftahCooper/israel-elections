// The Knesset on a date (owner decisions 8 and 11 Nov 2026): stepping through the 24th Knesset's term, the events
// each level shows, the seat marks, the seat card, and the election chart's card naming who else held a seat.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, { lang = 'en', level = 'standard', width = 1500, settings = {} }: { lang?: 'en' | 'he'; level?: string; width?: number; settings?: Record<string, unknown> } = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, level, settings]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2, ...settings } }));
  }, [lang, level, settings] as const);
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k24');
}
async function openTimeline(page: Page, lang: 'en' | 'he' = 'en') {
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const tl = page.locator('section.tl');
  await expect(tl.locator('.tl-chamber circle.seat')).toHaveCount(120);
  return tl;
}
const current = (tl: ReturnType<Page['locator']>) => tl.locator('.tl-tick[data-current]');
async function stepTo(tl: ReturnType<Page['locator']>, date: string) {
  for (let i = 0; i < 80 && (await current(tl).getAttribute('data-date')) !== date; i++) await tl.getByRole('button', { name: /^Next step/ }).click();
  await expect(current(tl)).toHaveAttribute('data-date', date);
}

test('Simple steps through the government and the term only; Silman’s seat moves and is marked', async ({ page }) => {
  await start(page, { level: 'simple' });
  const tl = await openTimeline(page);
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 6');
  await expect(tl.locator('.tl-sides')).toContainText('Before the government is sworn in');
  await tl.getByRole('button', { name: 'Next step: 13 Jun 2021' }).click();
  await expect(tl.getByRole('heading', { level: 3 })).toContainText('The Knesset on 13 Jun 2021');
  await expect(tl.locator('.tl-sides')).toContainText('Coalition 61');
  await expect(tl.locator('[data-mark="D2"]')).toHaveCount(1);
  await expect(tl.locator('[data-mark="D3a"]')).toHaveCount(1);
  await expect(tl.locator('.tl-rebels')).toContainText('Amichai Chikli · Yamina — voted against the government');
  await tl.getByRole('button', { name: /^Next step/ }).click();
  await expect(tl.locator('.tl-lines')).toContainText('Idit Silman announces she is leaving the coalition');
  await expect(tl.locator('.tl-sides')).toContainText('Coalition 60');
  await expect(tl.locator('.tl-sides')).toContainText('Not in the coalition 60');
  await expect(tl.locator('[data-mark="D2"]')).toHaveCount(2);
  await expect(tl.locator('.tl-glow')).toHaveCount(1);
  // the rebels sit next to the middle, on the right
  await expect(tl.locator('[data-mark="D2"][data-side="rest"]')).toHaveCount(2);
});

test('Standard adds votes and single MKs; Expert adds seat changes, chosen by kind in Settings', async ({ page }) => {
  await start(page, { level: 'standard' });
  let tl = await openTimeline(page);
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 21');
  await page.getByRole('button', { name: 'Expert', exact: true }).first().click();
  tl = page.locator('section.tl');
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 43');
  await stepTo(tl, '2021-04-08');
  await expect(tl.locator('.tl-lines')).toContainText('Yosef Taieb replaces Aryeh Machluf Deri · Shas');
  await expect(tl.locator('[data-mark="rep"]')).toHaveCount(3);
});

test('Expert with seat changes off steps only through events', async ({ page }) => {
  await start(page, { level: 'expert', settings: { timelineSeatChanges: 'off' } });
  const tl = await openTimeline(page);
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 24');
});

test('the seat card lists everyone who held the seat, and opens their history', async ({ page }) => {
  await start(page, { level: 'simple' });
  const tl = await openTimeline(page);
  await tl.locator('[data-person="2291"] circle.seat').click();
  const card = page.locator('.tl-card');
  await expect(card).toContainText('Shas');
  await expect(card.locator('.tl-holders > li')).toHaveCount(4);
  await expect(card.locator('.tl-holders > li').nth(1)).toContainText('Yosef Taieb');
  await expect(card.locator('.tl-holders > li').nth(1)).toContainText('8 Apr 2021 – 13 Jun 2021');
  await expect(card.locator('.tl-holders > li').nth(3)).toContainText('Until the end of the term');
  await expect(card.locator('.tl-holders > li[aria-current="true"]')).toContainText('Aryeh Machluf Deri');
  await card.getByRole('button', { name: 'Yosef Taieb' }).first().click();
  await expect(page.locator('dialog[open].mk-sheet h2')).toContainText('Yosef Taieb');
});

test('keyboard: the bar is a slider, seats are one tab stop with arrow keys', async ({ page }) => {
  await start(page, { level: 'simple' });
  const tl = await openTimeline(page);
  const slider = tl.getByRole('slider');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '2');
  await page.keyboard.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '6');
  await expect(tl.locator('circle.seat[tabindex="0"]')).toHaveCount(1);
  await tl.locator('circle.seat[tabindex="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tl-card')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.tl-card')).toHaveCount(0);
});

test('Hebrew: the bar and the chart stay left to right', async ({ page }) => {
  await start(page, { lang: 'he', level: 'simple' });
  const tl = await openTimeline(page, 'he');
  await expect(tl.locator('.tl-bar')).toHaveAttribute('dir', 'ltr');
  const prev = await tl.getByRole('button', { name: /^הצעד הקודם/ }).boundingBox();
  const next = await tl.getByRole('button', { name: /^הצעד הבא/ }).boundingBox();
  expect(prev!.x).toBeLessThan(next!.x);
  await tl.getByRole('button', { name: /^הצעד הבא/ }).click();
  // coalition seats on the left: the first seats drawn (leftmost) are coalition seats
  const firstSide = await tl.locator('[data-tl-seat]').first().getAttribute('data-side');
  expect(firstSide).toBe('coalition');
  await expect(tl.locator('.tl-sides')).toContainText('קואליציה 61');
});

test('the election chart’s seat card names who else held the seat', async ({ page }) => {
  await start(page, { level: 'standard' });
  const seats = page.locator('.chamber circle[data-seat]');
  const n = await seats.count();
  for (let i = 0; i < n; i++) {
    if (await seats.nth(i).locator('title').textContent() !== 'Shas') continue;
    await seats.nth(i).hover();
    if ((await page.locator('.tip').textContent())?.includes('rank 1')) break;
  }
  const tip = page.locator('.tip');
  await expect(tip).toContainText('Who sat here');
  await expect(tip.locator('.tl-holders > li')).toHaveCount(4);
  await expect(tip).toContainText('Yosef Taieb');
});
