// Outside support and arranged abstention in the Coalitions tool: the totals line, both tests (more for than
// against, and 61), the bar treatment, named undo, analysis marking, reload, and the What if… question.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

const start = async (page: Page, lang: 'en' | 'he' = 'en', width = 1500) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'standard', hintDismissed: true })); sessionStorage.setItem('seeded', '1'); } }, lang);
  await page.goto('/');
};
const card = (page: Page, name: string) => page.locator('.coal-choice').filter({ has: page.locator('.coal-who > span:last-child', { hasText: new RegExp(`^${name} \\d`) }) });
const role = async (page: Page, name: string, label: string) => { const c = card(page, name); await expect(c).toHaveCount(1); await c.getByRole('button', { name: label, exact: true }).click(); };

test('1992 recreated: 62 members + 5 outside support = 67, the recorded 67–53', async ({ page }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k13');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  for (const n of ['Labor', 'Meretz', 'Shas']) await role(page, n, 'In');
  for (const n of ['Hadash', 'Arab Democratic Party']) await role(page, n, 'Support');
  const now = page.locator('.coal-now');
  await expect(now.locator('.coal-sum')).toHaveText('62 members + 5 outside support = 67');
  await expect(now.locator('.coal-test').first()).toContainText('More for than against: 67 for · 53 against');
  await expect(now.locator('.coal-test').first()).toHaveAttribute('data-ok', 'true');
  await expect(now.locator('.majority-readout')).toHaveText('67 / 120 · 6 above 61');
  // outside support is drawn hatched after the members, in its own colours; no hollow abstention
  await expect(now.locator('.coal-bar i.coal-support')).toHaveCount(2);
  await expect(now.locator('.coal-bar i.coal-abstain')).toHaveCount(0);
  await expect(now.locator('.coal-partners[data-role="support"]')).toContainText('Hadash 3');
  // compared with the recorded first government, outside support included; one bloc repeats no total
  await expect(now).toContainText('Matches the recorded first government and its outside support');
  await expect(now.locator('.coal-blocs')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Recorded first government', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // each role change is a counted change, marked and named in Undo; votes and seats stay as they were
  await expect(page.locator('.coal-head .analysis-edits')).toHaveCount(1);
  await expect(page.locator('.session')).toContainText('5 changes from the official result');
  await expect(page.locator('.session')).toContainText('Votes and seats unchanged');
  await expect(page.locator('.band').getByRole('button', { name: 'Undo: Coalition: 3 in · 2 outside support', exact: true })).toBeVisible();
  await page.locator('.band').getByRole('button', { name: 'Undo: Coalition: 3 in · 2 outside support', exact: true }).click();
  await expect(card(page, 'Arab Democratic Party').getByRole('button', { name: 'Any', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(card(page, 'Hadash').getByRole('button', { name: 'Support', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // the session keeps the roles across a reload
  await page.reload();
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await expect(card(page, 'Hadash').getByRole('button', { name: 'Support', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.coal-now .coal-sum')).toHaveText('62 members + 3 outside support = 65');
});

test('an arranged abstention lowers the confidence-vote bar below 61, and the search follows it', async ({ page }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  for (const n of ['Yesh Atid', 'National Unity', 'Yisrael Beiteinu', 'Labor']) await role(page, n, 'In');
  await role(page, "Ra'am", 'Support');
  await role(page, "Hadash–Ta'al", 'Abstain');
  const now = page.locator('.coal-now');
  await expect(now.locator('.coal-sum').first()).toHaveText('46 members + 5 outside support = 51');
  await expect(now.locator('.coal-sum').nth(1)).toHaveText('5 abstaining');
  await expect(now.locator('.coal-test').first()).toHaveAttribute('data-ok', 'false');
  await expect(now.locator('.coal-test').first()).toContainText('51 for · 64 against');
  // 115 voting: 58 for is enough to form a government, though short of 61
  await expect(now.locator('.coal-bar .maj.conf em')).toHaveText('58');
  await expect(now.locator('.coal-bar i.coal-abstain')).toHaveCount(1);
  await page.locator('.coal-list > li:not(.coal-detail) > button').first().click();
  const detail = page.locator('.coal-detail');
  await expect(detail.locator('.coal-test').first()).toHaveAttribute('data-ok', 'true');
  await expect(detail.locator('.coal-test').nth(1)).toHaveAttribute('data-ok', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const lang of ['en', 'he'] as const) test(`What if…: a minority government with outside support opens in Coalitions ${lang}`, async ({ page }) => {
  await start(page, lang);
  await page.getByRole('tab', { name: lang === 'he' ? 'מה אם…' : 'What if…', exact: true }).click();
  const q = page.locator('.wi-row').filter({ hasText: lang === 'he' ? 'ממשלת מיעוט בתמיכה מבחוץ' : 'A minority government with outside support' });
  await expect(q).toHaveCount(1);
  await expect(q.locator('.wi-a')).toContainText(lang === 'he' ? '48 בקואליציה + 19 תמיכה מבחוץ = 67 · 67 בעד · 53 נגד' : '48 members + 19 outside support = 67 · 67 for · 53 against');
  await q.getByRole('button', { name: lang === 'he' ? 'פתיחה כתרחיש' : 'Open as a scenario', exact: true }).click();
  await expect(page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.coal-now .coal-sum')).toHaveText(lang === 'he' ? '48 בקואליציה + 19 תמיכה מבחוץ = 67' : '48 members + 19 outside support = 67');
  await expect(page.locator('.coal-now .majority-readout')).toHaveText(lang === 'he' ? '67 / 120 · 6 מעל 61' : '67 / 120 · 6 above 61');
});

for (const lang of ['en', 'he'] as const) test(`the recorded first government fills its roles, provisional outside support marked: ${lang}`, async ({ page }) => {
  await start(page, lang, 390);
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k13');
  await page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true }).click();
  // the sourced grouping's outside-support group is not offered as a member fill
  await expect(page.locator('.coal').getByRole('button', { name: lang === 'he' ? 'תמיכה מבחוץ' : 'Outside support', exact: true })).toHaveCount(0);
  const fill = page.getByRole('button', { name: lang === 'he' ? 'הממשלה הראשונה המתועדת' : 'Recorded first government', exact: true });
  await fill.click();
  await expect(fill).toHaveAttribute('aria-pressed', 'true');
  const now = page.locator('.coal-now');
  await expect(now.locator('.coal-sum')).toHaveText(lang === 'he' ? '62 בקואליציה + 5 תמיכה מבחוץ = 67' : '62 members + 5 outside support = 67');
  await expect(now.locator('.coal-test').first()).toContainText(lang === 'he' ? '67 בעד · 53 נגד' : '67 for · 53 against');
  // Hebrew reads the count left to right, exactly as every majority count: 67 on the left of 120
  const count = now.locator('.majority-readout bdi[dir="ltr"]');
  await expect(count).toHaveText('67 / 120');
  const [a, b] = await count.evaluate((el) => { const xs: Record<string, number> = {}; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n: Node | null;
    while ((n = w.nextNode())) for (const m of n.textContent!.matchAll(/\d+/g)) { const r = document.createRange(); r.setStart(n, m.index!); r.setEnd(n, m.index! + m[0].length); xs[m[0]] = r.getBoundingClientRect().x; }
    return [xs['67'], xs['120']]; });
  expect(a).toBeLessThan(b);
  // the (i) shows each role's certainty as recorded, never upgraded
  await page.locator('.coal-record .info > button').click();
  await expect(page.getByRole('tooltip')).toContainText(lang === 'he' ? 'זמני' : 'provisional');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const lang of ['en', 'he'] as const) test(`the recorded first government discloses where it differs from the recorded vote: ${lang}`, async ({ page }) => {
  await start(page, lang);
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k20');
  await page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true }).click();
  await page.getByRole('button', { name: lang === 'he' ? 'הממשלה הראשונה המתועדת' : 'Recorded first government', exact: true }).click();
  const line = page.locator('.coal-now .coal-recorded');
  await expect(line).toHaveText(lang === 'he' ? 'ההצבעה המתועדת: 61 בעד · 59 נגד. כאן התוצאה שונה, כי תפקידים אינם ידועים i.' : 'Recorded vote: 61 for · 59 against. Differs here because roles are unknown i.');
  await line.locator('.info > button').click();
  await expect(page.getByRole('tooltip')).toContainText(lang === 'he' ? 'התפקיד לא ידוע' : 'role unknown');
  // a choice of one's own is no longer the record: the line goes
  await card(page, lang === 'he' ? 'הליכוד' : 'Likud').getByRole('button', { name: lang === 'he' ? 'כל אפשרות' : 'Any', exact: true }).click();
  await expect(line).toHaveCount(0);
});

test('a loaded record that adds up shows no gap line', async ({ page }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k13');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await page.getByRole('button', { name: 'Recorded first government', exact: true }).click();
  await expect(page.locator('.coal-now .coal-sum')).toHaveText('62 members + 5 outside support = 67');
  await expect(page.locator('.coal-recorded')).toHaveCount(0);
});

// On a phone with large text, the test line "✗ More for than against: 51 for · 64 against" is wider than the card;
// it wraps between its parts and stays inside the card, never splitting a mark from its label or a number from its word;
// the totals line above keeps "= 51" together.
for (const lang of ['en', 'he'] as const) test(`the confidence-vote tests wrap inside the card on a phone with large text: ${lang}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.addInitScript((lang) => { if (!sessionStorage.getItem('seeded')) {
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'standard', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, textSize: 'large' } }));
    sessionStorage.setItem('seeded', '1'); } }, lang);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true }).click();
  const he = lang === 'he';
  for (const n of he ? ['יש עתיד', 'המחנה הממלכתי', 'ישראל ביתנו', 'העבודה'] : ['Yesh Atid', 'National Unity', 'Yisrael Beiteinu', 'Labor']) await role(page, n, he ? 'בפנים' : 'In');
  await role(page, he ? 'רע״ם' : "Ra'am", he ? 'תומכת' : 'Support');
  await role(page, he ? 'חד״ש–תע״ל' : "Hadash–Ta'al", he ? 'נמנעת' : 'Abstain');
  const now = page.locator('.coal-now');
  await expect(now.locator('.coal-test').first()).toContainText(he ? '51 בעד · 64 נגד' : 'More for than against: 51 for · 64 against');
  const m = await now.evaluate((card) => {
    const cs = getComputedStyle(card), r = card.getBoundingClientRect(), z = (card as Element & { currentCSSZoom?: number }).currentCSSZoom ?? 1;
    const left = r.left + (parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft)) * z, right = r.right - (parseFloat(cs.borderRightWidth) + parseFloat(cs.paddingRight)) * z;
    return { left, right, overflow: document.documentElement.scrollWidth - innerWidth,
      tests: [...card.querySelectorAll('.coal-test')].map((t) => { const b = t.getBoundingClientRect(); return { text: t.textContent, left: b.left, right: b.right }; }),
      // a part on one line has all its boxes at one height (Hebrew gives one box per direction run: digits, word)
      split: [...card.querySelectorAll('.coal-part, .coal-term, .coal-test .coal-for, .coal-test .coal-against')].filter((p) => { const tops = [...p.getClientRects()].map((x) => x.top); return Math.max(...tops) - Math.min(...tops) > 4; }).map((p) => p.textContent) };
  });
  expect(m.overflow).toBeLessThanOrEqual(0);
  for (const t of m.tests) {
    expect(t.right, t.text!).toBeLessThanOrEqual(m.right + 0.5);
    expect(t.left, t.text!).toBeGreaterThanOrEqual(m.left - 0.5);
  }
  expect(m.split).toEqual([]);
});

// c-aftermath-03: the button and the comparison line under the partners share one definition of the recorded first
// government; the audit saw 'Different from the recorded first-government partners' right after the button in these.
for (const id of ['k20', 'k9', 'k12', 'k14']) test(`after Recorded first government the comparison says it matches: ${id}`, async ({ page }) => {
  await start(page);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), id);
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  await page.getByRole('button', { name: 'Recorded first government', exact: true }).click();
  const now = page.locator('.coal-now');
  await expect(now).toContainText('Matches the recorded first');
  await expect(now).not.toContainText('Different from the recorded first-government partners');
});
