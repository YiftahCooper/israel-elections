import { expect, test, type Page } from '@playwright/test';

// Find an MK over the seat chart (owner card "seat", 16 Nov 2026): typing a name rings that member's seat and names it,
// the other seats fade; several matches are offered as buttons; it works in both layouts and both languages.
async function open(page: Page, { lang = 'en', layout = 'hemicycle', level = 'simple' }: { lang?: 'en' | 'he'; layout?: string; level?: string } = {}) {
  await page.addInitScript(({ lang, layout, level }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level, hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { chamberLayout: layout, starterTip: false } }));
    sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('started', '1');
  }, { lang, layout, level });
  await page.goto('/');
  await expect(page.locator('.chamber [data-seat]').first()).toBeVisible();
}
const box = (page: Page) => page.locator('.chamber .find-mk input').first();

for (const lang of ['en', 'he'] as const) for (const layout of ['hemicycle', 'blocks'] as const) {
  test(`one name rings one seat and names it: ${layout}, ${lang}`, async ({ page }) => {
    await open(page, { lang, layout });
    // visible at the simplest level, labelled in words
    await expect(page.locator('.chamber .find-mk label').first()).toHaveText(lang === 'en' ? 'Find an MK' : 'חיפוש ח״כ');
    await box(page).fill(lang === 'en' ? 'Netanyahu' : 'נתניהו');
    const mark = page.locator('.chamber .found-mark');
    await expect(mark).toHaveCount(1);
    await expect(mark.locator('text')).toContainText(lang === 'en' ? 'Benjamin Netanyahu' : 'בנימין נתניהו');
    await expect(mark.locator('text')).toContainText(lang === 'en' ? '#1' : 'מקום 1');
    // the ringed seat is the member's own: its name for a screen reader says so
    await expect(page.locator('.chamber [data-seat-pos]:has(.seat.found)')).toHaveAttribute('aria-label', lang === 'en' ? /Netanyahu/ : /נתניהו/);
    await expect(page.locator('.chamber svg.finding')).toHaveCount(1);
    // clearing the box clears the ring and the fade
    await box(page).fill('');
    await expect(mark).toHaveCount(0);
    await expect(page.locator('.chamber svg.finding')).toHaveCount(0);
  });
}

test('several matches are offered as buttons; choosing one rings it', async ({ page }) => {
  await open(page);
  await box(page).fill('Cohen');
  const choices = page.locator('.chamber .find-mk-choices button');
  expect(await choices.count()).toBeGreaterThan(1);
  await expect(page.locator('.chamber .found-mark')).toHaveCount(0);
  const label = (await choices.nth(1).innerText()).trim();
  await choices.nth(1).click();
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.chamber .found-mark text')).toHaveText(label);
  // Enter takes the first match
  await box(page).fill('Cohen');
  await box(page).press('Enter');
  await expect(page.locator('.chamber .found-mark text')).toHaveText((await choices.first().innerText()).trim());
});

test('a name that is not in this Knesset says so', async ({ page }) => {
  await open(page);
  await box(page).fill('Zzzz');
  await expect(page.locator('.chamber .find-mk-result')).toContainText('No MK by that name');
  await expect(page.locator('.chamber .found-mark')).toHaveCount(0);
});

test('on a phone the box is a full-size tap target', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, { lang: 'he' });
  const bb = (await box(page).boundingBox())!;
  expect(bb.height).toBeGreaterThanOrEqual(44);
  expect(bb.x + bb.width).toBeLessThanOrEqual(390);
});
