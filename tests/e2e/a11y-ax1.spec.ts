// Accessibility repairs from the whole-app review of 19 Nov 2026 (lane V4, faults A1–A12): each block is one fault.
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

// A2
for (const lang of LANGS) test.describe(`A2 · ${lang}`, () => {
  // A2: a choice button said only its label ("Election"), never the choice it shows
  test(`choice buttons say their current choice · ${lang}`, async ({ page }) => {
    await start(page, lang);
    const election = page.locator('.band .election-navigation .choice-trigger');
    await expect(election).toHaveAccessibleName(T(lang, 'Election: 2026 · 26th Knesset', 'בחירות: 2026 · הכנסת ה־26'));
    await expect(page.locator('.band .scenario-switcher .choice-trigger')).toHaveAccessibleName(T(lang, 'Switch scenario: Official result', 'החלפת תרחיש: התוצאה הרשמית'));
    // every choice button on these screens: its name holds the words it shows, after its label
    for (const tool of ['board', 'sens', 'turnout', 'families', 'loc', 'rules']) {
      if (tool !== 'board') await openTool(page, tool);
      const triggers = page.locator('.choice-trigger:visible');
      await expect(triggers.first()).toBeVisible();
      for (const t of await triggers.all()) {
        const shown = (await t.locator('.choice-current').innerText()).replace(/\s+/g, ' ').trim();
        await expect(t, `${tool}: ${shown}`).toHaveAccessibleName(new RegExp(`^.+: ${escape(shown)}$`));
      }
    }
    // the rules' threshold presets: the name holds the visible words in their order
    for (const b of await page.locator('#analysis-panel button[aria-pressed]').filter({ has: page.locator('.tiny') }).all()) {
      const [pct, years] = await b.evaluate(e => [e.querySelector('b')!.textContent!, e.querySelector('.tiny')!.textContent!.replace(/[()]/g, '').trim()]);
      await expect(b).toHaveAccessibleName(new RegExp(`^${escape(pct)}.*${escape(years)}`));
    }
    // inside a picker, the option in force is pressed and the others are not, the election picker too
    await election.click();
    const dialog = page.getByRole('dialog', { name: T(lang, 'Election', 'בחירות') });
    await expect(dialog.locator('[data-choice-value="k26"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(dialog.locator('[data-choice-value="k25"]')).toHaveAttribute('aria-pressed', 'false');
  });
});

// A3
for (const lang of LANGS) test.describe(`A3 · ${lang}`, () => {
  // A3: Compare replaced itself with the strip and focus fell to the page
  test(`Compare and Stop comparing keep the keyboard in place · ${lang}`, async ({ page }) => {
    await start(page, lang);
    const compare = page.getByRole('button', { name: T(lang, 'Compare', 'השוואה'), exact: true });
    await compare.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.cmpm-strip .choice-trigger')).toBeFocused();
    await expect(page.locator('.cmpm-strip .choice-trigger')).toHaveAccessibleName(new RegExp(`^${T(lang, 'Compare with', 'השוואה עם')}: `));
    // Swap keeps the keyboard in the strip too (Swap, or Compare with while the result loads)
    const swap = page.locator('.cmpm-strip .cmpm-swap');
    await swap.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.cmpm-strip .cmpm-swap, .cmpm-strip .choice-trigger').and(page.locator(':focus'))).toHaveCount(1);
    await page.getByRole('button', { name: T(lang, 'Stop comparing', 'סיום ההשוואה') }).focus();
    await page.keyboard.press('Enter');
    await expect(compare).toBeFocused();
  });
});

// A4
for (const lang of LANGS) test.describe(`A4 · ${lang}`, () => {
  // A4: Escape inside the Blocs (i) popup lost focus to the page
  test(`Escape from inside an (i) popup returns to its (i) · ${lang}`, async ({ page }) => {
    await start(page, lang);
    const info = page.getByRole('region', { name: T(lang, 'Seats by bloc', 'מנדטים לפי גוש') }).locator('h2 .info > button');
    await info.focus();
    await page.keyboard.press('Enter');
    await expect(info).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip').getByRole('link')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(info).toBeFocused();
  });
});
