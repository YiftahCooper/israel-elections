// Touch: tapping a seat opens the seat card (who sits there, their MK history), and the list opens from the card
// (review V3 F13, 19 Nov 2026: on a touch phone a tap opened the list's full-screen sheet over the card, so an MK's name
// and history could not be reached from the chamber). A mouse click still selects the list.
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, lang: 'en' | 'he') {
  await page.addInitScript((lang) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } }));
  }, lang);
  await page.goto('/');
}

test.describe('touch phone (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  for (const lang of ['en', 'he'] as const) test(`${lang}: a tap opens the seat card; the list opens from it`, async ({ page }) => {
    const L = (en: string, he: string) => (lang === 'en' ? en : he);
    await start(page, lang);
    const seats = page.locator('.chamber circle[data-seat]');
    await seats.first().tap();
    const tip = page.locator('.tip');
    await expect(tip).toBeVisible();
    await expect(tip).toContainText(L('rank', 'מקום'));
    await expect(tip.getByRole('button', { name: lang === 'en' ? /history$/ : /המסלול/ })).toBeVisible();
    await expect(page.locator('.side-panel')).toHaveCount(0);
    // another seat: the card moves to it, nothing covers the chamber
    const first = await tip.innerText();
    // the far end of the arc: on a phone the card covers the seats around the one tapped
    await seats.last().tap();
    await expect(tip).not.toHaveText(first);
    await expect(page.locator('.side-panel')).toHaveCount(0);
    await tip.getByRole('button', { name: L('List details', 'פרטי הרשימה') }).tap();
    await expect(page.locator('.side-panel')).toBeVisible();
    await expect(tip).toHaveCount(0);
  });
});

test('mouse: a click on a seat still selects its list', async ({ page }) => {
  await page.setViewportSize({ width: 1500, height: 1000 });
  await start(page, 'en');
  await page.locator('.chamber circle[data-seat]').first().click();
  await expect(page.locator('.side-panel')).toBeVisible();
});
