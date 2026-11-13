// Audit of 12 Nov 2026, fix lane fx-overview: the seat card's list place, the chamber key, the Blocks layout, the 1949
// Qualifying votes card, candidate edit notes, the exported chamber, the step-size switch, the waffle key, edit marks in
// the lists column and the walkthrough, the export chip, and Sensitivity under Large text.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, { lang = 'en', level = 'expert', election = 'k26', settings = {}, joint = 'on', width = 1500 }: { lang?: 'en' | 'he'; level?: string; election?: string; settings?: Record<string, unknown>; joint?: string; width?: number } = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 900 : 1000 });
  await page.addInitScript(([lang, level, settings, joint]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, starterTip: false, ...settings } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional', comparison: 'reference', jointSeats: joint }));
  }, [lang, level, settings, joint] as const);
  await page.goto('/');
  await expect(page.locator('.chamber [data-seat]').first()).toBeVisible();
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const seatOf = async (page: Page, text: string) => page.locator(`.chamber [data-seat-pos="${await page.locator('.chamber [data-seat-pos]').evaluateAll((els, t) => els.findIndex(e => (e.getAttribute('aria-label') ?? '').includes(t)), text)}"]`);

for (const lang of ['en', 'he'] as const) test(`1999 Shas: the first seat's card gives Gamliel's place on the list, 2 (${lang})`, async ({ page }) => {
  await start(page, { lang, election: 'k15' });
  const seat = await seatOf(page, lang === 'he' ? 'גמליאל' : 'Gamliel');
  await expect(seat).toHaveAttribute('aria-label', lang === 'he' ? / · מושב 1 · / : / · seat 1 · /);
  await seat.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.chamber .tip')).toContainText(lang === 'he' ? 'מקום 2' : 'rank 2');
});

test('1977 counted by party: the key and the Hadash rows add up to every seat, with the member whose party is not recorded', async ({ page }) => {
  await start(page, { election: 'k9' });
  const nums = await page.locator('.chamber .legend button b').allTextContents();
  expect(nums.reduce((t, n) => t + Number(n), 0)).toBe(120);
  await expect(page.locator('.chamber .legend')).toContainText('Party not recorded · Hadash 1');
  const hadash = page.locator('.lbars li').filter({ has: page.locator('[data-party-rest]') });
  await expect(hadash.locator('[data-party-rest]')).toContainText('Party not recorded1');
  const rows = await hadash.locator('.lb-parties li b').allTextContents();
  expect(rows.reduce((t, n) => t + Number(n), 0)).toBe(Number(await hadash.locator('.lb-seats b').textContent()));
  // one swatch type: every key row starts with a seat dot, in chamber order (Likud 40 before Shinui 2 in 1988)
  await expect(page.locator('.chamber .legend button:not(:has(.component-key))')).toHaveCount(0);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k12');
  const names = await page.locator('.chamber .legend button').allTextContents();
  expect(names.findIndex(n => n.startsWith('Likud'))).toBeLessThan(names.findIndex(n => n.startsWith('Shinui')));
});

test('Blocks: a second click on the chosen list closes it and the other seats stop being dimmed', async ({ page }) => {
  await start(page, { settings: { chamberLayout: 'blocks', dimUnselected: true } });
  const seat = page.locator('.chamber [data-seat-pos="0"] [data-seat]');
  await seat.click(); await page.mouse.move(0, 0);
  await expect(page.locator('.chamber [data-seat].dim').first()).toBeVisible();
  await seat.click(); await page.mouse.move(0, 0);
  await expect(page.locator('.chamber [data-seat].dim')).toHaveCount(0);
});

for (const lang of ['en', 'he'] as const) test(`1949 Qualifying votes: no threshold, 21 lists take part, 12 won a seat (${lang})`, async ({ page }) => {
  await start(page, { lang, election: 'k1' });
  const fig = page.locator('.fig').filter({ hasText: lang === 'he' ? 'קולות משתתפים' : 'Qualifying votes' });
  await fig.getByRole('button').first().click();
  await expect(fig.locator('.more')).toContainText(lang === 'he' ? 'אין אחוז חסימה: כל 21 הרשימות משתתפות; 12 זכו במנדט' : 'No threshold: all 21 lists take part; 12 won a seat');
  await expect(fig.locator('.more')).not.toContainText(lang === 'he' ? 'שעברו' : 'passed');
});

for (const lang of ['en', 'he'] as const) test(`moving a candidate: the Edited note names the two who swapped, briefly (${lang})`, async ({ page }) => {
  await start(page, { lang });
  await page.locator('.lb-row').first().click();
  await page.getByRole('button', { name: lang === 'he' ? 'הזזה למטה' : 'Move down' }).first().click();
  const mark = page.locator('[data-marker-path$="/candidates"] .edit-marker').first();
  const label = (await mark.getAttribute('aria-label'))!;
  expect(label).toMatch(lang === 'he' ? /נערך: הזזה: .+1 → 2/ : /Edited: moved: .+1 → 2/);
  expect(label.length).toBeLessThan(200);
  await mark.focus();
  await expect(page.locator('.edit-tooltip')).toContainText(lang === 'he' ? 'הזזה' : 'moved');
});

for (const lang of ['en', 'he'] as const) test(`the exported chamber names its grouping and blocs, and cuts names between words (${lang})`, async ({ page }) => {
  await start(page, { lang });
  const [d] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: lang === 'he' ? 'ייצוא SVG' : 'Export SVG', exact: true }).click()]);
  const xml = Buffer.concat(await (await d.createReadStream()).toArray()).toString('utf8');
  const texts = await page.evaluate(x => [...new DOMParser().parseFromString(x, 'image/svg+xml').querySelectorAll('text')].map(t => t.textContent ?? ''), xml);
  expect(texts).toContain(lang === 'he' ? 'גושים לפני הבחירות · 27 באוק׳ 2026' : 'Pre-election blocs · 27 Oct 2026');
  expect(texts.filter(t => /⁦\d+ \/ 120⁩ · /.test(t))).toHaveLength(3);
  // a shortened name ends at a whole word and keeps the list's name after it
  const cut = texts.filter(t => t.includes('…'));
  expect(cut.length).toBeGreaterThan(0);
  for (const t of cut) expect(t).toMatch(/[^\s(]… · \S/);
});

test('the step-size switch has one size everywhere and never wraps', async ({ page }) => {
  await start(page);
  const check = async () => {
    for (const seg of await page.locator('.numeric-stepper .seg').all()) {
      const buttons = await seg.locator('button').evaluateAll(bs => bs.map(b => ({ h: b.getBoundingClientRect().height, f: getComputedStyle(b).fontSize, lines: Math.round(b.scrollHeight / parseFloat(getComputedStyle(b).lineHeight || '16')) })));
      for (const b of buttons) { expect(b.f).toBe('12.5px'); expect(b.h).toBeLessThan(34); }
      const box = (await seg.boundingBox())!, field = (await seg.locator('xpath=..').locator('xpath=..').boundingBox())!;
      expect(box.width).toBeLessThan(field.width);
    }
  };
  await page.locator('#tab-rules').click(); await check();
  // the lone Settings… button keeps its content width
  const settings = page.locator('.rules-page > .btn');
  expect((await settings.boundingBox())!.width).toBeLessThan(200);
  await page.locator('#tab-turnout').click(); await check();
  await page.locator('#tab-board').click(); await page.locator('.lb-row').first().click(); await check();
});

test('the seats waffle keys every party colour of a list counted by party', async ({ page }) => {
  await start(page);
  await page.locator('#tab-charts').click();
  const legend = page.locator('[data-waffle]').first().locator('../..').locator('.legend');
  await expect(legend).toContainText('Meretz · The Democrats 1');
  await expect(legend).toContainText('New Hope – the National Right · Likud 1');
});

test('an edited list carries the mark at its votes in the lists column with the panel closed; the walkthrough keeps a gap', async ({ page }) => {
  await start(page);
  const likud = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: /^Likud/ }) });
  await likud.click();
  await page.getByRole('group', { name: 'Votes step size', exact: true }).getByRole('button', { name: '10k', exact: true }).click();
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await likud.click();
  await expect(page.locator('.side-panel')).toHaveCount(0);
  await expect(likud.locator('.lb-sub .edit-marker')).toHaveText('Edited');
  await expect(likud.locator('.lb-name .edit-marker')).toHaveCount(0);
  // a list donating votes proportionally carries no mark
  await expect(page.locator('.lb-row .edit-marker')).toHaveCount(1);
  await page.locator('#tab-walk').click();
  const cell = page.locator('td.walk-votes').filter({ has: page.locator('.edit-marker') }).first();
  const [mark, cellBox] = [(await cell.locator('.edit-marker').boundingBox())!, (await cell.boundingBox())!];
  const figure = await cell.evaluate(td => { const r = document.createRange(); r.selectNodeContents(td.lastChild!); return r.getBoundingClientRect().left; });
  expect(figure - (mark.x + mark.width)).toBeGreaterThanOrEqual(4);
  expect(cellBox.height).toBeLessThan(40);
});

test('Simple: the export chip opens its buttons beside it', async ({ page }) => {
  await start(page, { level: 'simple' });
  const chip = page.getByRole('button', { name: /Export the chamber/ });
  await chip.click();
  const [a, b] = [(await chip.boundingBox())!, (await page.getByRole('button', { name: 'Export SVG', exact: true }).boundingBox())!];
  expect(Math.abs(b.y - a.y)).toBeLessThan(40);
});

// Large text zooms the page by 1.15: a distance measured on screen is divided by it before it becomes a scrollTop. The old
// code overshot, then padded the table to make room: the 300px table grew to some 2,000px and the chosen row landed far
// below the header.
test('Sensitivity under Large text on a phone: the chosen row is brought just under the header, and the table keeps its size', async ({ page }) => {
  await start(page, { settings: { textSize: 'large' }, width: 390 });
  await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  await page.locator('#tab-sens').click();
  await expect(page.locator('.sweep-tbl tr[aria-current="true"]')).toBeVisible({ timeout: 60_000 });
  // the chosen row carries .sel; before any choice, the row of the current result
  const state = () => page.evaluate(() => {
    const box = document.querySelector('.sweep-tbl')!.parentElement as HTMLElement, b = box.getBoundingClientRect();
    const row = (box.querySelector('tbody tr.sel') ?? box.querySelector('tbody tr[aria-current="true"]'))!.getBoundingClientRect();
    return { top: row.top - b.top, bottom: row.bottom - b.top, head: box.querySelector('thead th')!.getBoundingClientRect().bottom - b.top, height: b.height, max: parseFloat(box.style.maxHeight) * 1.15 };
  });
  const check = async (what: string, last = false) => {
    const st = await state();
    expect(st.height, `${what}: the table keeps its height`).toBeLessThanOrEqual(st.max + 4);
    // the row starts at the header; the last row cannot scroll that far and ends at the table's bottom instead
    if (last) expect(Math.abs(st.bottom - st.height), what).toBeLessThan(6);
    else expect(Math.abs(st.top - st.head), what).toBeLessThan(3);
  };
  await expect.poll(async () => { const st = await state(); return Math.abs(st.top - st.head) < 3; }, { timeout: 5_000 }).toBe(true);
  await check('the current row');
  await page.locator('.sweep-tbl tbody tr[tabindex="0"]').focus();
  for (const key of ['End', 'Home', 'ArrowDown', 'ArrowDown', 'ArrowDown']) { await page.keyboard.press(key); await page.waitForTimeout(250); await check(key, key === 'End'); }
});
