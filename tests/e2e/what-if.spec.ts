// What if…: answers that move no seat say what does change; assumptions and sources are reachable.
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, lang: 'en' | 'he' = 'en', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  await page.locator('#tab-whatif').click();
}
const row = (page: Page, title: string) => page.locator('.wi-row').filter({ hasText: title });

test('a merger that moves no seat shows the joint list as the sum of its parts', async ({ page }) => {
  await start(page);
  const r = row(page, 'Together (Bennett) and Yashar! on one list');
  await expect(r.locator('.wi-a')).toContainText('No seat changes');
  await expect(r.locator('.wi-a')).toContainText('Together (Bennett)–Yashar! 33 = 12 + 21');
  // nothing further to show, so the title does not pretend to expand
  await expect(r.locator('.wi-q')).toBeDisabled();
  await r.getByRole('button', { name: 'Assumptions: Together (Bennett) and Yashar! on one list' }).click();
  await expect(page.getByRole('tooltip')).toContainText('Their surplus agreements end: Together (Bennett) with Yisrael Beiteinu; Yashar! with The Democrats.');
});

test('turnout that keeps every share explains the unchanged seats and details the rest once', async ({ page }) => {
  await start(page);
  const r = row(page, 'Turnout of 80%');
  await expect(r).toContainText('148,188 more voters, same shares');
  await expect(r.locator('.wi-a')).toContainText('Threshold 184,972 → 189,766 votes');
  await r.locator('.wi-q').click();
  // the threshold is not repeated in the details
  await expect(r.locator('.wi-facts')).not.toContainText('Threshold');
  await expect(r.locator('.wi-facts')).toContainText('Votes per seat 44,874 → 46,037');
});

test('the questions’ data sources are one click away', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'About these questions' }).click();
  await page.getByRole('tooltip').getByRole('button', { name: 'Sources' }).click();
  await expect(page.locator('#tab-sources')).toHaveAttribute('aria-selected', 'true');
});

test('Hebrew sums read left to right', async ({ page }) => {
  await start(page, 'he');
  const sum = row(page, 'רע״ם והרשימה המשותפת ברשימה אחת').locator('.wi-a bdi[dir="ltr"]');
  await expect(sum).toHaveText('19 = 8 + 11');
});

for (const [lang, width] of [['en', 1500], ['he', 1500], ['he', 390]] as const) test(`the (i) sits on its question's own line, before the subtitle: ${lang} ${width}`, async ({ page }) => {
  await start(page, lang, width);
  for (const r of await page.locator('.wi-row').all()) {
    const title = await r.locator('.wi-q b').boundingBox(), info = await r.locator('.wi-question .info').boundingBox();
    const sub = r.locator('.wi-sub');
    // centred within the title's last line, never beside the subtitle
    expect(info!.y + info!.height / 2).toBeLessThan(title!.y + title!.height);
    expect(info!.y + info!.height / 2).toBeGreaterThan(title!.y + title!.height - 22);
    if (await sub.count()) expect((await sub.boundingBox())!.y).toBeGreaterThanOrEqual(info!.y + info!.height / 2);
  }
});
