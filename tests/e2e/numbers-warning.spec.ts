import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

// Owner, 7 Nov: every rounded percentage shows its exact value on hover, keyboard focus or tap, at any decimal cap,
// without moving anything; and the joint-list split reminder can be dismissed at the split and restored in Settings.
test.use({ hasTouch: true });

async function open(page: Page, lang: 'en' | 'he', settings: Record<string, unknown> = {}) {
  await page.addInitScript(([lang, settings]) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: settings }));
    sessionStorage.setItem('seeded', '1');
  }, [lang, settings] as const);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const exactTip = (page: Page, lang: 'en' | 'he') => page.getByRole('tooltip').filter({ hasText: lang === 'en' ? 'the exact share' : 'השיעור המדויק' });

for (const width of [1500, 390]) for (const lang of ['en', 'he'] as const) test(`exact value on ${width === 390 ? 'tap' : 'hover'} and focus, no layout shift · ${width} · ${lang}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await open(page, lang, { decimals: 1 });
  const row = page.locator('.lb-row').first(), inRow = row.locator('.percentage[data-rounded]').first();
  const box = await inRow.boundingBox();
  if (width === 390) {
    // a tap on the value shows it and does not also open the list
    await inRow.tap();
    await expect(exactTip(page, lang)).toBeVisible();
    await expect(row).toHaveAttribute('aria-pressed', 'false');
  } else {
    await inRow.hover();
    await expect(exactTip(page, lang)).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(exactTip(page, lang)).toHaveCount(0);
    // the value is not a second tab stop inside the row: keyboard focus on the row shows it
    await expect(inRow).not.toHaveAttribute('tabindex', /.*/);
    await row.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
    await expect(row).toBeFocused();
    await expect(exactTip(page, lang)).toBeVisible();
  }
  expect(await inRow.boundingBox()).toEqual(box);
  await page.keyboard.press('Escape');
  await expect(exactTip(page, lang)).toHaveCount(0);
  // a value outside a control is a tab stop of its own
  await row.click();
  const standalone = page.locator('.ld .kv .percentage[data-rounded]').first();
  await standalone.focus();
  await expect(standalone).toHaveAttribute('tabindex', '0');
  await expect(exactTip(page, lang)).toBeVisible();
  await expect(exactTip(page, lang)).toHaveText(/^[\d.,…]+%: /);
});

async function mergeSplit(page: Page, lang: 'en' | 'he') {
  await page.locator('#tab-structure').click();
  await page.locator('.st-head > .seg button').nth(1).click();
  await page.locator('.st-task').getByRole('button', { name: lang === 'en' ? 'United Torah Judaism' : 'יהדות התורה', exact: true }).click();
}
for (const [width, lang] of [[1500, 'en'], [1500, 'he'], [390, 'en']] as const) test(`split warning: Don't show again, then back from Settings · ${width} · ${lang}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await open(page, lang);
  await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), 'k25');
  await mergeSplit(page, lang);
  const warning = page.locator('.split-warning');
  await expect(warning).toContainText(lang === 'en' ? 'The vote was cast for the whole list. The results don’t show a preference for any one party; the split here is an assumption for the scenario.' : 'הקול ניתן לרשימה כולה. תוצאות הבחירות אינן מצביעות על העדפת מפלגה ספציפית — הפיצול כאן הוא הנחה לתרחיש.');
  const box = await warning.boundingBox();
  await warning.getByRole('checkbox', { name: lang === 'en' ? "Don't show again" : 'לא להציג שוב' }).check();
  // it stays until the user leaves, so nothing moves under the pointer
  expect(await warning.boundingBox()).toEqual(box);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:settings')!).values.splitWarning)).toBe(false);
  await page.reload();
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await mergeSplit(page, lang);
  await expect(page.locator('.st-options')).toBeVisible();
  await expect(warning).toHaveCount(0);
  // Settings → Editing → Joint-list split warning brings it back
  await page.locator('.band').getByRole('button', { name: lang === 'en' ? 'Settings' : 'הגדרות', exact: true }).click();
  await page.locator('.personal-settings [data-setting="splitWarning"]').getByRole('checkbox').check();
  await page.keyboard.press('Escape');
  await expect(warning).toBeVisible();
});

test('the joint list page shows the same reminder', async ({ page }) => {
  await open(page, 'en');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.locator('.lb-row[aria-label="United Torah Judaism"]').click();
  await page.getByRole('button', { name: 'Split into separate lists' }).click();
  await expect(page.locator('.joint-split .split-warning')).toContainText('the split here is an assumption for the scenario');
});

test('2013: declared and detailed results behind (i), seats unchanged', async ({ page }) => {
  await open(page, 'en');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k19');
  await page.locator('.lb-row').first().click();
  const info = page.locator('.ld h3').filter({ hasText: 'Votes' }).locator('.info button');
  await info.click();
  await expect(page.getByText(/Declared result \(Reshumot notice and seat calculation\): 885,054\. The detailed results, shown here, sum to 885,163\. No seat changes\. Cause not documented\./)).toBeVisible();
});
