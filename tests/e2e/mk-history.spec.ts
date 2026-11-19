// An MK's own history (owner decisions M1–M3, 9 Nov 2026): it opens from the MK's seat in the chamber and from their
// name in a list's candidates; one row per Knesset; runs that did not win a seat; Hebrew graphics left to right; the
// phone sheet; viewing it is never an edit.
import { expect, test, type Page } from './fixtures';
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
  await expect(rows.nth(3)).toContainText('Membership ended'); // with the recorded reason where there is one (16 Nov 2026)
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

// Round 7, 16 Nov 2026 (owner cards k26-open, mq1-source, mk9-timeline, deaths): the rows explain themselves; the 26th
// Knesset is open; a run tied by research shows its sources; a membership ends with its recorded reason
test('Silman: a key explains the rows; the 26th Knesset has opened; her 2022 resignation is named', async ({ page }) => {
  await start(page);
  await hoverSeat(page, 'Likud', 16);
  await page.locator('.tip').getByRole('button', { name: 'Her history' }).click();
  const key = card(page).locator('.mk-key');
  await expect(key).toBeVisible();
  await key.getByRole('button', { name: 'How to read the rows' }).click();
  await expect(page.getByText(/whole Knesset/).first()).toBeVisible();
  await key.getByRole('button', { name: 'How to read the rows' }).click();
  const rows = card(page).locator('.mk-rows > li');
  await expect(rows.filter({ hasText: '24th Knesset' })).toContainText('Membership ended · Resigned');
  // she was not elected in 2026: not in the 26th Knesset, which opened in November
  const k26 = rows.filter({ hasText: '26th Knesset' });
  await expect(k26).toContainText('Not in this Knesset (from Nov 2026)');
  await expect(k26).not.toContainText('not yet opened');
});

test('a run tied by research shows the sources that tie it', async ({ page }) => {
  await start(page, { k: 'k16' });
  await listRow(page, 'Likud').click();
  await page.getByRole('button', { name: /^Show all \d+ candidates$/ }).click();
  await page.locator('aside .cands .mk-name', { hasText: /קהלני|Kahalani/ }).first().click();
  const row = card(page).locator('.mk-rows > li').filter({ hasText: '16th Knesset' });
  await row.getByRole('button', { name: 'Source' }).click();
  const pop = page.getByRole('link', { name: /idi|Israel Democracy/i });
  await expect(pop.first()).toBeVisible();
  await expect(page.getByText('Hebrew Wikipedia (a secondary source)').first()).toBeVisible();
});

// 19 Nov 2026: the Knesset's records of the 26th Knesset's opening are in the data, so the time in it is drawn.
test('an MK elected in 2026: the 26th Knesset opened on 10 Nov 2026 and the time in it is drawn from then', async ({ page }) => {
  await start(page, { k: 'k26' });
  await hoverSeat(page, 'Likud', 1);
  await page.locator('.tip').getByRole('button', { name: /history$/ }).click();
  const k26 = card(page).locator('.mk-rows > li').filter({ hasText: '26th Knesset' });
  await expect(k26.locator('.mk-pending')).toHaveCount(0);
  await expect(k26.locator('.mk-block')).toHaveText('from 10 Nov 2026');
});

// Round 8, 19 Nov 2026 (card mk-career wording): "Her history" / "His history" only where the Knesset's own record of
// the person gives the gender; anyone it has no record for gets neutral words, in both languages. Never from a name.
test('the seat button is gendered only from the Knesset’s record: Karkabi Sabbah hers, Amos neutral', async ({ page }) => {
  await start(page, { k: 'k26' });
  await hoverSeat(page, 'Joint List', 7);
  await expect(page.locator('.tip').getByRole('button', { name: 'Her history' })).toBeVisible();
  await hoverSeat(page, 'Shas', 6);
  const neutral = page.locator('.tip').getByRole('button', { name: 'MK history' });
  await expect(neutral).toBeVisible();
  await neutral.click();
  // elected by the count, withdrew before the opening (Shas No. 6)
  await expect(card(page).locator('.mk-rows > li').first()).toContainText('Elected; did not sit');
  await expect(card(page).locator('.mk-key')).toContainText('their time in it');
});
test('Hebrew: neutral words for someone without a Knesset record', async ({ page }) => {
  await start(page, { lang: 'he', k: 'k26' });
  await hoverSeat(page, 'ש״ס', 6, 'מקום');
  await page.locator('.tip').getByRole('button', { name: 'המסלול בכנסת', exact: true }).click();
  await expect(card(page).locator('.mk-rows > li').first()).toContainText('בין הנבחרים; ללא כהונה');
  await expect(card(page).locator('.mk-key')).toContainText('הצבוע – זמן הכהונה בה');
});

// Owner, 19 Nov 2026: an event is a short ink line with a number, not an arrow; days with no faction recorded are
// dotted, never striped (stripes mean only partners' seats on a joint list); the key explains both.
test('Eichler: numbered event lines match the lines under the row; days without a faction are dotted', async ({ page }) => {
  await start(page);
  await hoverSeat(page, 'United Torah Judaism', 7);
  await page.locator('.tip').getByRole('button', { name: 'His history' }).click();
  const c = card(page), row = c.locator('.mk-rows > li').filter({ hasText: '25th Knesset' });
  await expect(c).not.toContainText('▼');
  // four days apart: one line, numbered 1–2, never two numbers drawn over each other
  await expect(row.locator('.mk-mark b')).toHaveText(['1–2']);
  await expect(row.locator('.mk-events .mk-enum[aria-label]')).toHaveText(['1', '2']);
  await expect(row.locator('.mk-events li').filter({ has: page.getByLabel('Event 1', { exact: true }) })).toContainText('15 Jan 2026');
  const unrec = row.locator('.mk-unrec');
  expect(await unrec.count()).toBeGreaterThan(0);
  const bg = await unrec.first().evaluate(el => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('radial-gradient');
  expect(bg).not.toContain('linear-gradient');
  const key = c.locator('.mk-key');
  await expect(key).toContainText('No faction recorded');
  await expect(key).toContainText('A recorded event, by its number under the row');
  await expect(key.locator('.mk-key-seg.mk-unrec')).toHaveCount(1);
});

test('no key entry for unrecorded days when there are none: Silman', async ({ page }) => {
  await start(page);
  await hoverSeat(page, 'Likud', 16);
  await page.locator('.tip').getByRole('button', { name: 'Her history' }).click();
  await expect(card(page).locator('.mk-unrec')).toHaveCount(0);
  await expect(card(page).locator('.mk-key')).not.toContainText('No faction recorded');
});
