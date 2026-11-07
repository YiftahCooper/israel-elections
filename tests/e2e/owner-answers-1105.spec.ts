import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { choose } from './choices.ts';

test.describe.configure({ mode: 'parallel' });

const dataset = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
for (const lang of ['en', 'he']) for (const theme of ['light', 'dark']) for (const width of [1440, 390]) {
  test(`owner answers: ${lang} ${theme} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(({ lang, theme }) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, theme, level: 'expert', hintDismissed: true })), { lang, theme });
    mkdirSync('.backup-scratch/owner-answers/screenshots', { recursive: true });
    await page.goto('/');
    // A real list without a logo uses its own letters, in either UI language.
    const badge = page.locator('.lb-row .slip:not(.logo)').filter({ hasText: /^ט$/ }).first();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute('lang', 'he');
    await expect(badge).toHaveAttribute('dir', 'rtl');
    await expect(badge).toHaveAttribute('title', lang === 'en' ? 'Ballot letters ט (no logo)' : 'אותיות הפתק ט (ללא סמל)');
    await badge.click();
    const panel = page.locator('.side-panel');
    // Constituent badges must never borrow the parent list’s letters.
    const neutral = panel.locator('.party-row .slip:not(.logo)');
    await expect(neutral.first()).toHaveText('—');
    await expect(neutral.first()).toHaveAttribute('title', /no logo or separate ballot letters|אין סמל או אותיות פתק נפרדות/);
    const hebrewNames = panel.locator('.cands bdi[lang="he"][dir="rtl"]');
    await expect(hebrewNames.first()).toBeAttached();
    if (lang === 'en') {
      await panel.getByRole('button', { name: 'Candidate names and links', exact: true }).click();
      await expect(page.locator('.pop').filter({ hasText: 'Hebrew-only names have no official English spelling recorded' })).toBeVisible();
      await page.keyboard.press('Escape');
    }
    await panel.locator('.cands').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.backup-scratch/owner-answers/screenshots/candidates-${lang}-${theme}-${width}.png` });
    await page.getByRole('button', { name: lang === 'en' ? 'Close' : 'סגירה', exact: true }).click();
    await page.locator('#tab-sources').click();
    const info = page.getByRole('button', { name: lang === 'en' ? 'Data status details' : 'פירוט מצב הנתונים', exact: true });
    await expect(info).toBeVisible();
    await expect(info.locator('..').locator('..')).toHaveText(lang === 'en' ? 'Official final results i' : 'תוצאות סופיות רשמיות i');
    await info.hover();
    await expect(page.locator('.pop')).toContainText(dataset('k26').status[lang === 'en' ? 'noteEn' : 'noteHe'].replace('Gazette publication unverified', 'Gazette publication not yet verified').replace('הפרסום ברשומות לא אומת', 'הפרסום ברשומות טרם אומת'));
    await info.click();
    await page.screenshot({ path: `.backup-scratch/owner-answers/screenshots/status-${lang}-${theme}-${width}.png` });
    await page.mouse.move(0, 0);
    await expect(info).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    // Also retain historical limitations rather than deleting them in the concise summary.
    await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), 'k17');
    await info.click();
    await expect(page.locator('.pop')).toContainText(dataset('k17').status[lang === 'en' ? 'noteEn' : 'noteHe']);
    // Exercise the seat-hover path when a candidate has no English spelling.
    // The fixture removes only nameEn; identity, ranks and votes stay unchanged.
    await page.route('**/data/k26.json', async route => {
      const data = dataset('k26');
      for (const list of data.lists) for (const candidate of list.candidates) delete candidate.nameEn;
      await route.fulfill({ json: data });
    });
    await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), 'k26');
    await page.locator('#tab-board').click();
    await page.reload();
    await page.locator('.chamber [data-seat]').first().hover();
    const hoverName = page.locator('.tip bdi[lang="he"][dir="rtl"]');
    await expect(hoverName).toBeVisible();
    if (lang === 'en') await expect(hoverName).toHaveAttribute('title', 'Hebrew name — no official English spelling recorded');
    // Compare renders candidate names too, including candidates shifted by roster edits.
    await page.locator('.lb-row').first().click();
    await page.locator('.side-panel .cands').getByRole('button', { name: lang === 'en' ? 'Remove' : 'הסרה', exact: true }).first().click();
    await page.locator('.side-panel').getByRole('button', { name: lang === 'en' ? 'Close' : 'סגירה', exact: true }).click();
    await page.locator('#tab-compare').click();
    await page.locator('details.cmp-section > summary').click();
    const compared = page.locator('.cmp-section li bdi[lang="he"][dir="rtl"]');
    await expect(compared.first()).toBeVisible();
    if (lang === 'en') await expect(compared.first()).toHaveAttribute('title', 'Hebrew name — no official English spelling recorded');


  });
}

for (const lang of ['en', 'he']) test(`all 26 status notes retained in ${lang}`, async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  await page.locator('#tab-sources').click();
  for (let n = 1; n <= 26; n++) {
    await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), `k${n}`);
    const info = page.getByRole('button', { name: lang === 'en' ? 'Data status details' : 'פירוט מצב הנתונים', exact: true });
    await info.click();
    const expected = dataset(`k${n}`).status[lang === 'en' ? 'noteEn' : 'noteHe'].replace('Gazette publication unverified', 'Gazette publication not yet verified').replace('הפרסום ברשומות לא אומת', 'הפרסום ברשומות טרם אומת');
    await expect(page.locator('.pop')).toContainText(expected);
    await page.keyboard.press('Escape');
  }
});
