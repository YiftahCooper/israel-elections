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
  await expect(now.locator('.coal-test').first()).toContainText('More for than against 67–53');
  await expect(now.locator('.coal-test').first()).toHaveAttribute('data-ok', 'true');
  await expect(now.locator('.majority-readout')).toHaveText('67 / 120 · 6 above 61');
  // outside support is drawn hatched after the members, in its own colours; no hollow abstention
  await expect(now.locator('.coal-bar i.coal-support')).toHaveCount(2);
  await expect(now.locator('.coal-bar i.coal-abstain')).toHaveCount(0);
  await expect(now.locator('.coal-partners[data-role="support"]')).toContainText('Hadash 3');
  // members are compared with the recorded first government (Labor, Meretz, Shas)
  await expect(now).toContainText('Matches the recorded first-government partners');
  // the role change is a coalition choice: marked locally as analysis, named in Undo, never a result edit
  await expect(page.locator('.coal-head .analysis-edits')).toHaveCount(1);
  await expect(page.locator('.session')).toContainText('No changes');
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
  await expect(now.locator('.coal-test').first()).toContainText('51–64');
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
  await expect(q.locator('.wi-a')).toContainText(lang === 'he' ? '48 בקואליציה + 19 תמיכה מבחוץ = 67' : '48 members + 19 outside support = 67');
  await q.getByRole('button', { name: lang === 'he' ? 'פתיחה כתרחיש' : 'Open as a scenario', exact: true }).click();
  await expect(page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.coal-now .coal-sum')).toHaveText(lang === 'he' ? '48 בקואליציה + 19 תמיכה מבחוץ = 67' : '48 members + 19 outside support = 67');
  await expect(page.locator('.coal-now .majority-readout')).toHaveText(lang === 'he' ? '67 / 120 · 6 מעל 61' : '67 / 120 · 6 above 61');
});
