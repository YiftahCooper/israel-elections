// The Knesset on a date (owner decisions 8 and 11 Nov 2026): stepping through the 24th Knesset's term, the events
// each level shows, the seat marks, the seat card, and the election chart's card naming who else held a seat.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, { lang = 'en', level = 'standard', width = 1500, settings = {}, election = 'k24' }: { lang?: 'en' | 'he'; level?: string; width?: number; settings?: Record<string, unknown>; election?: string } = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, level, settings]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2, ...settings } }));
  }, [lang, level, settings] as const);
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
async function openTimeline(page: Page, lang: 'en' | 'he' = 'en') {
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const tl = page.locator('section.tl');
  await expect(tl.locator('.tl-chamber circle.seat')).toHaveCount(120);
  return tl;
}
const current = (tl: ReturnType<Page['locator']>) => tl.locator('.tl-tick[data-current]');
async function stepTo(tl: ReturnType<Page['locator']>, date: string, lang: 'en' | 'he' = 'en') {
  for (let i = 0; i < 80 && (await current(tl).getAttribute('data-date')) !== date; i++) await tl.getByRole('button', { name: lang === 'he' ? /^הצעד הבא/ : /^Next step/ }).click();
  await expect(current(tl)).toHaveAttribute('data-date', date);
}

test('Simple steps through the government and the term only; Silman’s seat moves and is marked', async ({ page }) => {
  await start(page, { level: 'simple' });
  const tl = await openTimeline(page);
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 9');
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
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 33');
  await page.getByRole('button', { name: 'Expert', exact: true }).first().click();
  tl = page.locator('section.tl');
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 44');
  await stepTo(tl, '2021-04-08');
  await expect(tl.locator('.tl-lines')).toContainText('Yosef Taieb replaces Aryeh Machluf Deri · Shas · Norwegian law');
  await expect(tl.locator('[data-mark="rep"]')).toHaveCount(3);
});

// the Knesset's rows give Yaakov Litzman no faction for 6–8 April 2021 (audit 12 Nov, cx-factions-05): the seat card and
// his history say so instead of leaving the faction blank
for (const lang of ['en', 'he'] as const) test(`Litzman's first two days: the faction is said to be unrecorded (${lang})`, async ({ page }) => {
  await start(page, { lang });
  const tl = await openTimeline(page, lang);
  await tl.locator('[data-person="528"] circle.seat').click();
  const first = page.locator('.tl-card .tl-holders > li').first();
  await expect(first.locator('.tl-unrec')).toHaveText(lang === 'he' ? 'הסיעה לא תועדה · 6 באפר׳ 2021 – 8 באפר׳ 2021' : 'Faction not recorded · 6 Apr 2021 – 8 Apr 2021');
  await first.getByRole('button').first().click();
  const row = page.locator('dialog[open].mk-sheet .mk-rows > li').filter({ hasText: lang === 'he' ? 'הכנסת ה־24' : '24th Knesset' });
  await expect(row).toContainText(lang === 'he' ? 'הסיעה לא תועדה עד 8 באפר׳ 2021' : 'Faction not recorded until 8 Apr 2021');
  await expect(row.locator('.mk-unrec')).toHaveCount(1);
});

test('Expert with seat changes off steps only through events', async ({ page }) => {
  await start(page, { level: 'expert', settings: { timelineSeatChanges: 'off' } });
  const tl = await openTimeline(page);
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 25');
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
  await expect(slider).toHaveAttribute('aria-valuenow', '9');
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

// Owner, 12 Nov 2026: the arrows go through every event on the timeline. The ticks on the bar are the steps.
// KNS_KnessetDates 169 opens k26 on 10 Nov 2026; retained data/raw/research/k25-term-boundary.json.
// The sourced k25 term-end adds one closing step to the former 39-step snapshot.
for (const [election, level, total] of [['k24', 'simple', 9], ['k24', 'standard', 33], ['k24', 'expert', 44], ['k25', 'standard', 40], ['k21', 'expert', 9]] as const) {
  test(`${election} ${level}: ▶ stops at every tick on the bar, in order, and ◀ comes back the same way`, async ({ page }) => {
    await start(page, { level, election });
    const tl = await openTimeline(page);
    const ticks = await tl.locator('.tl-tick').evaluateAll((els) => els.map((e) => e.getAttribute('data-date')));
    expect(ticks).toHaveLength(total);
    const next = tl.getByRole('button', { name: /^Next step/ }), prev = tl.getByRole('button', { name: /^Previous step/ });
    const seen = [await current(tl).getAttribute('data-date')];
    while (await next.isEnabled()) { await next.click(); seen.push(await current(tl).getAttribute('data-date')); }
    expect(seen).toEqual(ticks);
    await expect(tl.locator('.tl-count')).toHaveText(`Step ${total} of ${total}`);
    const back = [await current(tl).getAttribute('data-date')];
    while (await prev.isEnabled()) { await prev.click(); back.push(await current(tl).getAttribute('data-date')); }
    expect(back.reverse()).toEqual(ticks);
  });
}

test('a step that moves no seat keeps the chart and says what happened, with its sources', async ({ page }) => {
  await start(page, { level: 'standard' });
  const tl = await openTimeline(page);
  await stepTo(tl, '2021-08-25');
  const sides = () => tl.locator('[data-tl-seat]').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-tl-seat')}:${e.getAttribute('data-side')}`));
  const before = await sides();
  await tl.getByRole('button', { name: 'Next step: 4 Nov 2021' }).click();
  await expect(tl.locator('.tl-lines li[data-kind="budget-vote"]')).toHaveCount(1);
  expect(await sides()).toEqual(before);
  await expect(tl.locator('.tl-sides')).toContainText('Coalition 61');
  await expect(tl.locator('.tl-glow')).toHaveCount(0);
  await tl.locator('.tl-lines li[data-kind="budget-vote"] button').click();
  await expect(page.locator(".pop a[href^=\"https://\"]").first()).toBeVisible();
});

test('the bar says "End" only when a step is there', async ({ page }) => {
  await start(page, { level: 'standard', election: 'k25' });
  const tl = await openTimeline(page);
  await expect(tl.locator('.tl-end-label.start')).toHaveText('Start');
  // Official opening record and all final k25 memberships agree: 10 Nov 2026, not the snapshot date.
  // Source: KNS_KnessetDates 169; retained data/raw/research/k25-term-boundary.json.
  await expect(tl.locator('.tl-end-label.end')).toHaveText('End');
});

// Audit of 12 Nov 2026: the 25th Knesset's records closed on 10 Nov 2026, the day the 26th opened. The last step is one
// line and the chamber as it stood on the last day, at the bar's end.
test('k25: the term ends with one line and the chamber as it stood', async ({ page }) => {
  await start(page, { level: 'expert', election: 'k25' });
  const tl = await openTimeline(page);
  await tl.getByRole('slider').focus();
  await page.keyboard.press('End');
  await expect(current(tl)).toHaveAttribute('data-date', '2026-11-10');
  await expect(current(tl)).toHaveAttribute('style', /left: 100%/);
  await expect(tl.locator('.tl-lines li')).toHaveCount(1);
  await expect(tl.locator('.tl-lines li[data-kind="term-end"]')).toHaveCount(1);
  await expect(tl.locator('.tl-sides')).toContainText('Coalition 61');
  await expect(tl.locator('[data-mark="rep"]')).toHaveCount(0);
});

// Audit of 12 Nov 2026 (c-screens-people-01): United Torah Judaism is one faction of two parties. Degel HaTorah's four
// MKs left the coalition on 14 Jul 2025, Agudat Yisrael's three on 15 Jul.
test('k25: a party leaving a shared faction moves only its own seats', async ({ page }) => {
  await start(page, { level: 'simple', election: 'k25' });
  const tl = await openTimeline(page);
  await stepTo(tl, '2025-07-14');
  await expect(tl.locator('.tl-lines li[data-item="k25-degel-exit"]')).toHaveCount(1);
  await expect(tl.locator('.tl-sides')).toContainText('Coalition 64');
  await expect(tl.locator('[data-mark="D4o"]')).toHaveCount(4);
  await stepTo(tl, '2025-07-15');
  await expect(tl.locator('.tl-sides')).toContainText('Coalition 61');
  await expect(tl.locator('[data-mark="D4o"]')).toHaveCount(3);
});

test('a faction move names its factions in English', async ({ page }) => {
  await start(page, { level: 'expert', election: 'k21' });
  const tl = await openTimeline(page);
  await stepTo(tl, '2019-06-02');
  await expect(tl.locator('.tl-lines')).toContainText("2 MKs recorded moving from Ra'am–Balad to Balad.");
  await expect(tl.locator('.tl-lines')).toContainText('1 MK recorded moving from Likud to Ahi.');
  await expect(tl.locator('.tl-lines')).not.toContainText('between factions');
});

// Audit of 12 Nov 2026 (c-screens-people-04, c-famous-late-09): the timeline names each faction as the seat cards and
// MK history do (tests/term-timeline-names.test.ts checks every line; these are the two steps the audit named).
for (const lang of ['en', 'he'] as const) {
  test(`${lang}: the 25th Knesset on 13 Mar 2024 and the 24th on 15 Aug 2022 name the factions as MK history does`, async ({ page }) => {
    await start(page, { lang, level: 'standard', election: 'k25' });
    let tl = await openTimeline(page, lang);
    await stepTo(tl, '2024-03-13', lang);
    await expect(tl.locator('.tl-lines li[data-item="k25-faction-3"]')).toContainText(lang === 'he'
      ? 'רישום החברות עבר מסיעת המחנה הממלכתי לסיעת הימין הממלכתי (4 ח״כים).' : '4 MKs recorded moving from National Unity to National Right.');
    await page.getByRole('button', { name: lang === 'he' ? 'מומחה' : 'Expert', exact: true }).first().click();
    await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k24');
    tl = await openTimeline(page, lang);
    // a date outside the 24th Knesset's term (13 Mar 2024) is not kept: the timeline starts at the term's first step
    await expect(tl.locator('.tl-count')).toHaveText(/^(Step|צעד) 1 /);
    await stepTo(tl, '2022-08-15', lang);
    const lines = tl.locator('.tl-lines');
    if (lang === 'en') {
      await expect(lines.locator('li[data-item="k24-committee-2022-08-15-18"]')).toContainText('Yamina splits into Yamina and National Unity; National Unity then splits into National Unity and Beyahad (Bennett); New Hope splits into New Hope – Unity for Israel and Derekh Eretz.');
      await expect(lines.locator('li[data-item="k24-committee-2022-08-15-16"]')).toContainText('United Torah Judaism faction splits into Degel HaTorah and Agudat Yisrael.');
      await expect(lines).not.toContainText('National Camp');
      await expect(lines).not.toContainText('Beyachad');
    } else {
      await expect(lines.locator('li[data-item="k24-committee-2022-08-15-18"]')).toContainText('אושרו התפלגויות ימינה, המחנה הממלכתי ותקווה חדשה.');
      await expect(lines.locator('li[data-item="k24-committee-2022-08-15-17"]')).toContainText('אושרה התפלגות סיעת הציונות הדתית לסיעות הציונות הדתית ונעם - בראשות חה״כ אבי מעוז.');
    }
  });
}

// One fact, one wording: MK history says "Membership ended" where the Knesset records no reason (fx-tlnames)
test('a seat card says "Membership ended", with the reason only where one is recorded', async ({ page }) => {
  await start(page, { level: 'simple', election: 'k25' });
  const tl = await openTimeline(page);
  await tl.locator('[data-person="12944"] circle.seat').click();
  const card = page.locator('.tl-card');
  await expect(card.locator('.tl-holders > li').first()).toContainText('Membership ended');
  await expect(card).not.toContainText('reason not yet recorded');
  await expect(card).not.toContainText('Left the Knesset');
  await page.keyboard.press('Escape');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k24');
  const tl24 = await openTimeline(page);
  await tl24.locator('[data-person="2291"] circle.seat').click();
  await expect(page.locator('.tl-card .tl-holders > li').first()).toContainText('Membership ended · Norwegian law');
});

test('the 21st Knesset: no government formed, so no sides; the dissolution is a step', async ({ page }) => {
  await start(page, { level: 'simple', election: 'k21' });
  const tl = await openTimeline(page);
  await expect(tl.locator('.tl-count')).toHaveText('Step 1 of 3');
  await expect(tl.locator('.tl-sides')).toHaveText('No government was formed in this Knesset');
  await expect(tl.locator('.tl-lines')).toContainText('21st Knesset membership begins.');
  await tl.getByRole('button', { name: 'Next step: 30 May 2019' }).click();
  await expect(tl.locator('.tl-lines')).toContainText('The Knesset passed the dissolution law, 74 for · 45 against');
  await expect(tl.locator('[data-side="coalition"]')).toHaveCount(0);
  await expect(tl.locator('.tl-end-label.end')).toHaveText('End');
});

// fx-after2 (c-design-principles-11): the term chamber names its colours, as the Overview chamber does
for (const lang of ['en', 'he'] as const) test(`the term chamber has a list key that follows the date: ${lang}`, async ({ page }) => {
  await start(page, { lang, level: 'expert', election: 'k22' });
  const tl = await openTimeline(page, lang);
  const key = tl.getByRole('group', { name: lang === 'he' ? 'הרשימות בכנסת' : 'Lists in the Knesset' });
  if (lang === 'en') for (const row of ['Blue and White 33', 'Likud 32']) await expect(key).toContainText(row);
  const sum = async () => (await key.locator('b').allInnerTexts()).reduce((n, t) => n + Number(t), 0);
  const filled = async () => Number(await tl.locator('.tl-chamber svg > text').first().textContent());
  // each item carries the list's slip; its seats add up to the seats held on the shown date, at every step
  await expect(key.locator('.slip').first()).toBeVisible();
  for (let i = 0; i < 6; i++) {
    expect(await sum()).toBe(await filled());
    const next = tl.getByRole('button', { name: lang === 'he' ? /^הצעד הבא/ : /^Next step/ });
    if (await next.isDisabled()) break;
    await next.click();
  }
  // the 25th Knesset: a vacant seat leaves its list's count
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await expect(tl.locator('.tl-chamber circle.seat')).toHaveCount(120);
  expect(await sum()).toBe(await filled());
});
