// Accessibility repairs from the whole-app review of 19 Nov 2026 (lane V4, faults A1–A12): each block is one fault.
import { barLanguage } from './barMenu.ts';
import { openTool } from './openTool.ts';
import { expect, test, type Page } from './fixtures';

type Lang = 'en' | 'he';
const T = (lang: Lang, en: string, he: string) => (lang === 'he' ? he : en);
const start = async (page: Page, lang: Lang, level = 'expert') => {
  await page.addInitScript(([lang, level]) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
    sessionStorage.setItem('seeded', '1');
  }, [lang, level]);
  await page.goto('/');
  await expect(page.getByRole('region', { name: T(lang, 'Lists', 'רשימות') })).toBeVisible();
};
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LANGS = ['en', 'he'] as const;
const phone = { viewport: { width: 390, height: 844 } };

// A1
for (const lang of LANGS) test.describe(`A1 · ${lang}`, () => {
  test.use(phone);
  // A1: the step names were display:none at phone width, so the seven step buttons had no name at all
  test(`each step of How seats were allocated keeps its name · ${lang}`, async ({ page }) => {
    await start(page, lang);
    await openTool(page, 'walk');
    const steps = page.getByRole('list', { name: T(lang, 'Allocation stages', 'שלבי החלוקה') }).getByRole('button');
    await expect(steps.first()).toBeVisible();
    await expect(steps.first()).toHaveAccessibleName(T(lang, 'Threshold', 'אחוז החסימה'));
    await expect(steps.nth(1)).toHaveAccessibleName(T(lang, 'Quota', 'המודד'));
    await expect(steps.last()).toHaveAccessibleName(T(lang, 'Result', 'התוצאה'));
    // hidden from sight only: the row still shows just the numbers
    const box = await steps.first().locator('.walk-name').boundingBox();
    expect(box && box.width <= 1 && box.height <= 1).toBe(true);
  });
});
