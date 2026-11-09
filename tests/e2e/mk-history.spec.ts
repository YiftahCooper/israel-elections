// An MK's own history (owner decisions M1–M3, 9 Nov 2026): it opens from the MK's seat in the chamber and from their
// name in a list's candidates; one row per Knesset; runs that did not win a seat; Hebrew graphics left to right; the
// phone sheet; viewing it is never an edit.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, { lang = 'en', width = 1500, k = 'k25' }: { lang?: 'en' | 'he'; width?: number; k?: string } = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  }, [lang] as const);
  await page.goto('/');
  if (k !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), k);
}
const card = (page: Page) => page.locator('dialog[open].mk-sheet');
const listRow = (page: Page, name: string) => page.locator('.lb-row', { has: page.locator('.lb-name', { hasText: new RegExp(`^${name}`) }) }).first();

/** Hover the seats of a list until the seat card names the given place. */
async function hoverSeat(page: Page, list: string, rank: number, word = 'rank') {
  const seats = page.locator('circle[data-seat]');
  const n = await seats.count();
  for (let i = 0; i < n; i++) {
    if (await seats.nth(i).locator('title').textContent() !== list) continue;
    await seats.nth(i).hover();
    if ((await page.locator('.tip').textContent())?.includes(`${word} ${rank}`)) return;
  }
  throw new Error(`no seat ${list} ${rank}`);
}

test('opens from the seat: Idit Silman, six elections, three not elected', async ({ page }) => {
  await start(page);
  await hoverSeat(page, 'Likud', 16);
  const tip = page.locator('.tip');
  await expect(tip).toContainText('Idit Silman');
  await tip.getByRole('button', { name: 'Her history' }).click();
  await expect(card(page).getByRole('heading', { level: 2 })).toContainText('Idit Silman');
  const rows = card(page).locator('.mk-rows > li');
  await expect(rows).toHaveCount(6);
  await expect(rows.nth(0)).toContainText('21st Knesset');
  await expect(rows.nth(1)).toContainText('Not elected');
  await expect(rows.nth(1)).toContainText('1 place short');
  await expect(rows.nth(3)).toContainText('Sat from the first sitting');
  await expect(rows.nth(3)).toContainText('Left the Knesset');
  await expect(rows.nth(5)).toContainText('No. 46 · the list won 27');
  await expect(rows.nth(5)).toContainText('19 places short');
  await expect(card(page)).toContainText('shown from 2009 on');
  await page.keyboard.press('Escape');
  await expect(card(page)).toHaveCount(0);
  // looking is not an edit
  await expect(page.locator('.session')).toContainText('No changes');
});

test('opens from a name in a list’s candidates: Ayelet Shaked’s lists below the threshold', async ({ page }) => {
  await start(page, { k: 'k24' });
  await listRow(page, 'Yamina').click();
  await page.locator('aside .cands .mk-name', { hasText: 'Ayelet Shaked' }).click();
  const rows = card(page).locator('.mk-rows > li');
  await expect(rows).toHaveCount(7);
  await expect(rows.nth(2)).toContainText('The list got 3.22%, below the 3.25% threshold');
  await expect(rows.nth(1)).toContainText('Faction: New Right (until then Jewish Home)');
  // a name matched by its listed spelling says how
  await rows.nth(2).getByRole('button', { name: 'How this list is linked' }).click();
  await expect(page.getByText('No other member of the Knesset has this name.')).toBeVisible();
  await card(page).getByRole('button', { name: 'Close' }).click();
  await expect(card(page)).toHaveCount(0);
});

test('only people who sat in the Knesset have a link', async ({ page }) => {
  await start(page);
  await listRow(page, 'Likud').click();
  const cands = page.locator('aside .cands');
  await expect(cands.locator('li').first().locator('.mk-name')).toHaveCount(1);
  // No. 119 never sat in the Knesset; No. 120, an honorary last place, is Moshe Nissim, a former Likud MK
  await page.getByRole('button', { name: /^Show all \d+ candidates$/ }).click();
  await expect(cands.locator('li', { hasText: 'אחימאיר' }).locator('.mk-name')).toHaveCount(0);
  await expect(cands.locator('li', { hasText: 'נסים משה' }).locator('.mk-name')).toHaveCount(1);
});

test('Hebrew, dark: text mirrors, the bars still run left to right', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await start(page, { lang: 'he' });
  await hoverSeat(page, 'הליכוד', 16, 'מקום');
  await page.locator('.tip').getByRole('button', { name: 'המסלול שלה בכנסת' }).click();
  const rows = card(page).locator('.mk-rows > li');
  await expect(rows.nth(1)).toContainText('לא נבחרה');
  await expect(rows.nth(5)).toContainText('חסרו 19 מקומות');
  await expect(card(page).locator('.mk-bar').first()).toHaveAttribute('dir', 'ltr');
  await expect(card(page).locator('.mk-places').first()).toHaveAttribute('direction', 'ltr');
});

test('phone: the card fills the screen and its rows stack', async ({ page }) => {
  await start(page, { width: 390, k: 'k24' });
  await listRow(page, 'Yamina').click();
  await page.locator('.cands .mk-name', { hasText: 'Ayelet Shaked' }).filter({ visible: true }).click();
  const box = await card(page).boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(388);
  const overflow = await card(page).evaluate((d) => d.scrollWidth - d.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
