import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

// Audit 12 Nov 2026, lane c-levels: what the Custom level and the level switch promise, held to what the app does.
// Each test names the finding it protects.
const start = async (page: Page, app: Record<string, unknown>, settings: Record<string, unknown> = {}, extra: Record<string, string> = {}, ready = '.lb-row') => {
  await page.addInitScript(({ app, settings, extra }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', ...app }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, starterTip: false, ...settings } }));
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
    sessionStorage.setItem('seeded', '1');
  }, { app, settings, extra });
  await page.goto('/');
  await expect(page.locator(ready).first()).toBeVisible();
};
const he = (page: Page) => page.evaluate(() => document.documentElement.lang === 'he');
const levelGroup = (page: Page) => page.locator('.band').getByRole('group', { name: /^(Detail level|רמת פירוט)$/ });
const listButton = (page: Page, name: string) => page.getByRole('region', { name: /^(Lists|הרשימות)$/ }).getByRole('button', { name, exact: true });
const details = (page: Page) => page.getByRole('region', { name: /^(List details|פרטי רשימה)$/ });

test('c-levels-02: Custom Show brings a tool into this level; Collapsed puts it with the other levels', async ({ page }) => {
  await start(page, { level: 'simple', customFeatures: { charts: 'show', rules: 'show' } });
  for (const id of ['charts', 'rules']) {
    await expect(page.locator(`#tab-${id}`)).not.toHaveClass(/locked/);
    // no "(Standard)" / "(Expert)" announced for a tool this level now shows
    await expect(page.locator(`#tab-${id} .sr-only`)).toHaveCount(0);
  }
  // listed before "More in other levels" under its heading
  const before = (id: string) => page.locator(`#tab-${id}`).evaluate(t => {
    const more = t.parentElement!.querySelector('.more-label');
    return !more || !!(t.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(await before('charts')).toBe(true);
  expect(await before('rules')).toBe(true);
});

test('c-levels-02: Custom Collapsed mutes a tool of this level and says why', async ({ page }) => {
  await start(page, { level: 'expert', customFeatures: { rules: 'collapsed' } });
  await expect(page.locator('#tab-rules')).toHaveClass(/locked/);
  await expect(page.locator('#tab-rules')).toHaveAccessibleName('Rules (Collapsed)');
  await expect(page.locator('#tab-charts')).not.toHaveClass(/locked/);
  // still opens in full when pressed
  await page.locator('#tab-rules').click();
  await expect(page.getByRole('heading', { name: 'Rules', exact: true })).toBeVisible();
});

test('c-levels-03: a hidden tool has no way in (About, Save & share, a saved comparison)', async ({ page }) => {
  const link = { v: 1, main: { e: 'k25', n: '', f: false, l: [] }, other: { e: 'k24', n: '', f: false, l: [] }, m: [] };
  await start(page, { level: 'expert', customFeatures: { after: 'hidden', compare: 'hidden' } }, {},
    { 'israel-elections:comparisons': JSON.stringify([{ id: 'c1', name: 'Test comparison', savedAt: '2026-11-01T00:00:00.000Z', link }]) });
  await expect(page.locator('#tab-after')).toHaveCount(0);
  await page.locator('details.election-about summary, .election-about summary').first().click();
  await expect(page.getByRole('button', { name: 'Government & term →', exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  // Side by side hidden: a saved comparison opens as a comparison on the Overview, never on the Side by side page
  await page.locator('#tab-scenarios').click();
  await page.locator('.scn-comparisons').getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop comparing', exact: true })).toBeVisible();
  await expect(page.locator('.side-by-side')).toHaveCount(0);
  await expect(page.locator('#tab-board')).toHaveAttribute('aria-selected', 'true');
});

for (const lang of ['en', 'he'] as const) {
  test(`c-levels-04: a level change that clears Custom says so and Undo brings it back (${lang})`, async ({ page }) => {
    const custom = { security: 'show', agreements: 'hidden' };
    await start(page, { lang, level: 'simple', customFeatures: custom });
    const H = await he(page);
    await expect(page.locator('.band-custom')).toHaveAttribute('aria-pressed', 'true');
    await levelGroup(page).getByRole('button', { name: H ? 'רגיל' : 'Standard', exact: true }).click();
    const toast = page.locator('.toast');
    await expect(toast).toContainText(H ? 'הבחירות ברמה המותאמת נוקו' : 'Custom choices cleared');
    await expect(page.locator('.band-custom')).toHaveAttribute('aria-pressed', 'false');
    // the Undo label is readable: its ink is not its background (it inherited the toast's light text on a light button)
    const ink = await toast.locator('.toast-action').evaluate(b => { const c = getComputedStyle(b); return [c.color, c.backgroundColor]; });
    expect(ink[0]).not.toBe(ink[1]);
    await toast.getByRole('button', { name: H ? 'ביטול' : 'Undo', exact: true }).click();
    await expect(page.locator('.band-custom')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.band-custom')).toContainText(H ? 'על בסיס פשוט' : 'based on Simple');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:v1')!));
    expect(stored.level).toBe('simple');
    expect(stored.customFeatures).toEqual(custom);
  });
}

test('c-levels-04: a level change with no Custom choices says nothing', async ({ page }) => {
  await start(page, { level: 'simple' });
  await levelGroup(page).getByRole('button', { name: 'Standard', exact: true }).click();
  await expect(levelGroup(page).getByRole('button', { name: 'Standard', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.toast')).toHaveCount(0);
});

test('c-levels-08: Settings shows Custom as the current level, and leaving it says so', async ({ page }) => {
  await start(page, { level: 'simple', customFeatures: { security: 'show' } });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const row = page.getByRole('dialog').getByRole('group', { name: 'Detail level', exact: true });
  await expect(row.getByRole('button', { name: 'Simple', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(row.getByRole('button', { name: /^Custom/ })).toHaveAttribute('aria-pressed', 'true');
  await row.getByRole('button', { name: 'Simple', exact: true }).click();
  await expect(page.locator('.toast')).toContainText('Custom choices cleared');
  await expect(row.getByRole('button', { name: 'Simple', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('c-levels-05: Open on Last tool reopens After the election', async ({ page }) => {
  await start(page, { level: 'standard', tool: 'after' }, { openOn: 'last' }, {}, '#tab-after');
  await expect(page.locator('#tab-after')).toHaveAttribute('aria-selected', 'true');
});

test('c-levels-06 and 15: the Custom page says what Side by side and the merged list section do', async ({ page }) => {
  await start(page, { level: 'simple' });
  await page.locator('.band-custom').click();
  const side = page.getByRole('group', { name: 'Side by side', exact: true });
  await expect(side.getByRole('button', { name: 'Show', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // Side by side has no folded form: it is offered at every level or hidden
  await expect(side.getByRole('button', { name: 'Collapsed', exact: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Merged list details', exact: true })).toBeVisible();
  await expect(page.getByText('Split list identity')).toHaveCount(0);
  // the official notes are a truth label, not a choice
  await expect(page.getByText('Official list notes')).toHaveCount(0);
});

for (const lang of ['en', 'he'] as const) {
  test(`c-levels-07: 1949 notes show at Simple, and "not seated" carries its reason (${lang})`, async ({ page }) => {
    await start(page, { lang, level: 'simple' });
    const H = await he(page);
    await choose(page.getByRole('button', { name: H ? 'בחירות' : 'Election', exact: true }), 'k1');
    await listButton(page, H ? 'מפא״י' : 'Mapai').click();
    await expect(details(page).getByRole('heading', { name: H ? 'הערות על המקורות' : 'Notes on the sources (in Hebrew)', exact: true })).toBeVisible();
    await expect(details(page).locator('.disclosure-toggle')).not.toContainText([H ? 'הערות רשמיות לרשימה' : 'Official list notes']);
    const dayan = details(page).locator('.cands li').filter({ hasText: 'דיין משה' });
    await expect(dayan).toContainText(H ? 'לא כיהן' : 'not seated');
    await dayan.getByRole('button', { name: H ? 'למה לא כיהן' : 'Why not seated', exact: true }).click();
    await expect(page.locator('.pop').filter({ hasText: 'אינו מופיע בין הנבחרים' })).toBeVisible();
  });

  test(`c-levels-10: Simple's "Who gets in" says how many it lists, then all elected, then the roster (${lang})`, async ({ page }) => {
    await start(page, { lang, level: 'simple' });
    const H = await he(page);
    await choose(page.getByRole('button', { name: H ? 'בחירות' : 'Election', exact: true }), 'k25');
    await listButton(page, H ? 'הליכוד' : 'Likud').click();
    const heading = details(page).getByRole('heading', { name: H ? /^מי נכנס לכנסת/ : /^Who gets in/ });
    await expect(heading).toHaveText(H ? 'מי נכנס לכנסת (10 הראשונים מתוך 32)' : 'Who gets in (first 10 of 32)');
    const rows = details(page).locator('.cands li');
    await expect(details(page).locator('.cands li.el')).toHaveCount(10);
    await details(page).getByRole('button', { name: H ? 'הצגת כל 32 הנבחרים' : 'Show all 32 elected', exact: true }).click();
    await expect(heading).toHaveText(H ? 'מי נכנס לכנסת (32)' : 'Who gets in (32)');
    await expect(details(page).locator('.cands li.el')).toHaveCount(32);
    await expect(details(page).locator('.cands li.cut')).toHaveCount(1);
    const all = details(page).getByRole('button', { name: H ? /^הצגת כל \d+ המועמדים$/ : /^Show all \d+ candidates$/ });
    await all.click();
    expect(await rows.count()).toBeGreaterThan(33);
  });
}
