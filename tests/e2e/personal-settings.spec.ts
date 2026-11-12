import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

for (const lang of ['en', 'he']) test(`saved list answers survive reload, isolate elections, and clear · ${lang}`, async ({ page }) => {
  await page.addInitScript(lang => {
    if (sessionStorage.getItem('u3-seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { theme: 'light', decimals: 2 } }));
    localStorage.setItem('israel-elections:preferences', '{}');
    localStorage.setItem('israel-elections:item-preferences', '{"voteSource:k26:list:removed":"new","voteSource:k26:list:26-מחל":"invalid"}');
    sessionStorage.setItem('u3-seeded', '1');
  }, lang);
  await page.goto('/'); await page.locator('.lb-row').first().click();
  const inc = page.getByRole('button', { name: lang === 'en' ? 'Increase Votes' : 'הוספת קולות', exact: true });
  await inc.click();
  const ask = page.locator('.source-ask');
  await ask.getByRole('combobox').selectOption('proportional');
  await ask.getByRole('radio', { name: lang === 'en' ? 'For this list' : 'לרשימה זו', exact: true }).check();
  await ask.getByRole('button', { name: lang === 'en' ? 'Apply' : 'החלה', exact: true }).click();
  await page.reload(); await page.locator('.lb-row').first().click(); await inc.click();
  await expect(ask).toBeHidden();
  const gear = page.locator('.band').getByRole('button', { name: lang === 'en' ? 'Settings' : 'הגדרות', exact: true });
  await gear.click();
  const settings = page.locator('.personal-settings');
  await settings.locator('[data-setting="voteSource"] .pref-disclosure').click();
  await expect(settings.locator('.pref-items li')).toHaveCount(1);
  await expect(settings.locator('.pref-items')).toContainText('2026');
  await settings.getByRole('button', { name: lang === 'en' ? /Ask again for/ : /לשאול שוב עבור/ }).click();
  await expect(settings.locator('.pref-items li')).toHaveCount(0);
  await page.keyboard.press('Escape'); await inc.click(); await expect(ask).toBeVisible();
  await ask.getByRole('combobox').selectOption('proportional');
  await ask.getByRole('radio', { name: lang === 'en' ? 'For this list' : 'לרשימה זו', exact: true }).check();
  await ask.getByRole('button', { name: lang === 'en' ? 'Apply' : 'החלה', exact: true }).click();
  await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), 'k25');
  await page.locator('.lb-row').first().click(); await inc.click(); await expect(ask).toBeVisible(); await page.keyboard.press('Escape');
  await gear.click();
  await settings.locator('[data-setting="voteSource"] .pref-disclosure').click();
  await settings.getByRole('button', { name: lang === 'en' ? 'Forget all' : 'מחיקת הכול', exact: true }).click();
  await expect(settings.locator('.pref-items li')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:item-preferences')!))).toEqual({});
});

for (const [width, election] of [[1500, 'k26'], [1024, 'k25'], [390, 'k1']] as const) {
  for (const lang of ['en', 'he']) for (const theme of ['light', 'dark']) test(`dialog continuity ${width} ${election} ${lang} ${theme}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(({ lang, theme }) => { localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' })); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { theme, decimals: 2 } })); }, { lang, theme });
    await page.goto('/');
    await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
    // phones (one-row bar, owner 9 Nov): level, Custom and Settings are in the bar's Menu, which Settings
    // gives focus back to
    const phone = width === 390, menuBtn = page.locator('.band .band-menu-btn');
    for (const [level, tab] of [['simple', 'board'], ['standard', 'coal'], ['expert', 'rules'], ['custom', 'structure']]) {
      if (phone) await menuBtn.click();
      if (level !== 'custom') await page.getByRole('group', { name: lang === 'en' ? 'Detail level' : 'רמת פירוט' }).getByRole('button', { name: lang === 'en' ? ({ simple: 'Simple', standard: 'Standard', expert: 'Expert' }[level]!) : ({ simple: 'פשוט', standard: 'רגיל', expert: 'מומחה' }[level]!), exact: true }).click();
      else {
        await page.getByRole('button', { name: lang === 'en' ? 'Custom' : 'מותאם', exact: true }).click();
        await page.locator('.custom-feature').nth(1).getByRole('button', { name: lang === 'en' ? 'Hidden' : 'מוסתר', exact: true }).click();
      }
      if (phone && level !== 'custom') { await page.keyboard.press('Escape'); await expect(page.locator('#phone-menu')).toHaveCount(0); }
      const target = page.locator(`#tab-${tab}`); if (await target.count()) await target.click();
      const gear = phone ? menuBtn : page.locator('.band').getByRole('button', { name: lang === 'en' ? 'Settings' : 'הגדרות', exact: true });
      const fromMenu = async () => { if (phone) await page.locator('#phone-menu').getByRole('button', { name: lang === 'en' ? 'Settings' : 'הגדרות', exact: true }).click(); };
      // Focus with preventScroll so opening from a scrolled page cannot hide a jump.
      await gear.evaluate(e => (e as HTMLElement).focus({ preventScroll: true }));
      await page.evaluate(() => window.scrollTo(0, 150));
      const before = await page.evaluate(() => ({ y: scrollY, hash: location.hash, tab: document.querySelector('[role="tab"][aria-selected="true"]')?.id }));
      await page.keyboard.press('Enter'); await fromMenu();
      const dialog = page.locator('.personal-settings'); await expect(dialog).toBeVisible(); await expect(dialog).toBeFocused();
      const contrast = await dialog.locator('.ps-label-text').first().evaluate(e => {
        const luminance = (v: string) => { const c = v.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(x => { x /= 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return c[0] * .2126 + c[1] * .7152 + c[2] * .0722; };
        const fg = luminance(getComputedStyle(e).color), bg = luminance(getComputedStyle(e.closest('dialog')!).backgroundColor);
        return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      await page.keyboard.press('Tab'); expect(await dialog.evaluate(d => d.contains(document.activeElement))).toBe(true);
      if (level === 'expert') await page.screenshot({ path: `.backup-scratch/u3/settings-${election}-${lang}-${theme}-${width}.png` });
      await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); await expect(gear).toBeFocused();
      expect(await page.evaluate(() => ({ y: scrollY, hash: location.hash, tab: document.querySelector('[role="tab"][aria-selected="true"]')?.id }))).toEqual(before);
      await gear.press('Enter'); await fromMenu(); await dialog.getByRole('button', { name: lang === 'en' ? 'Close' : 'סגירה', exact: true }).click(); await expect(gear).toBeFocused();
    }
  });
}
