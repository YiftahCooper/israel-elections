import { expect, test, type Page } from '@playwright/test';

// Audit 12 Nov 2026 (c-a11y-01, 02, 04–10; c-screens-overview-07): keyboard focus, names and contrast, in English
// and Hebrew. Opening a panel or sheet moves focus into it (from the keyboard), closing it gives focus back to the
// control that opened it, a popup closes when focus leaves it, and Tab past an edit marker goes on in the page.
async function open(page: Page, lang: 'en' | 'he', { width = 1500, theme }: { width?: number; theme?: 'light' | 'dark' } = {}) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(([lang, theme]) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, ...(theme ? { theme } : {}) } }));
    sessionStorage.setItem('seeded', '1');
  }, [lang, theme] as const);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const T = (lang: 'en' | 'he', en: string, he: string) => lang === 'en' ? en : he;
const focusIn = (page: Page, selector: string) => page.evaluate(s => !!document.activeElement?.closest(s), selector);
const lum = (rgb: string) => {
  const [r, g, b] = rgb.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

for (const lang of ['en', 'he'] as const) {
  test(`a list's panel takes focus when opened from the keyboard and gives it back on closing · ${lang}`, async ({ page }) => {
    await open(page, lang);
    const row = page.locator('.lb-row').first();
    await row.focus();
    await page.keyboard.press('Enter');
    // focus is at the panel's heading, so the next Tab is inside the panel, not 40 stops later
    await expect(page.locator('.side-panel h2')).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await focusIn(page, '.side-panel')).toBe(true);
    // Escape closes it and focus goes back to the row
    await page.keyboard.press('Escape');
    await expect(page.locator('.side-panel')).toHaveCount(0);
    await expect(row).toBeFocused();
    // so does its Close button
    await page.keyboard.press('Enter');
    await page.locator('.side-panel .sp-head').getByRole('button', { name: T(lang, 'Close', 'סגירה'), exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.side-panel')).toHaveCount(0);
    await expect(row).toBeFocused();
  });

  test(`a mouse opening leaves focus where it was · ${lang}`, async ({ page }) => {
    await open(page, lang);
    const row = page.locator('.lb-row').nth(1);
    await row.click();
    await expect(page.locator('.side-panel')).toBeVisible();
    await expect(row).toBeFocused();
  });

  test(`closing an MK's history or a party's history gives focus back to its opener · ${lang}`, async ({ page }) => {
    await open(page, lang);
    await page.locator('.lb-row').first().focus();
    await page.keyboard.press('Enter');
    const name = page.locator('.side-panel button.mk-name').first();
    await name.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('dialog[open].mk-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open].mk-sheet')).toHaveCount(0);
    await expect(name).toBeFocused();
    // the sheet's own Close button
    await page.keyboard.press('Enter');
    await page.locator('dialog[open].mk-sheet .mk-acts').getByRole('button', { name: T(lang, 'Close', 'סגירה'), exact: true }).click();
    await expect(name).toBeFocused();
    // the party's full history
    const full = page.locator('.side-panel .ph-chartbtn').first();
    await full.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('dialog[open].ph-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open].ph-sheet')).toHaveCount(0);
    await expect(full).toBeFocused();
    // the panel is still open beneath (Escape closed the sheet only)
    await expect(page.locator('.side-panel')).toBeVisible();
  });

  test(`an MK's history opened from a seat card gives focus back to the card · ${lang}`, async ({ page }) => {
    await open(page, lang);
    await page.locator('.chamber [data-seat-pos][tabindex="0"]').focus();
    await page.keyboard.press('Enter');
    const link = page.locator('.chamber .tip .mk-seatlink');
    await link.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('dialog[open].mk-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open].mk-sheet')).toHaveCount(0);
    await expect(link).toBeFocused();
  });

  test(`the blocs panel takes focus and gives it back · ${lang}`, async ({ page }) => {
    await open(page, lang);
    const edit = page.getByRole('button', { name: T(lang, 'Edit blocs', 'עריכת גושים'), exact: true });
    await edit.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.bloc-panel h2')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('.bloc-panel')).toHaveCount(0);
    await expect(edit).toBeFocused();
  });

  test(`Save & share and About close when focus leaves them · ${lang}`, async ({ page }) => {
    await open(page, lang);
    const share = page.locator('button[aria-controls="scenarios-menu"]');
    await share.focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#scenarios-menu')).toBeVisible();
    for (let i = 0; i < 40 && await focusIn(page, '.band'); i++) await page.keyboard.press('Tab');
    expect(await focusIn(page, '.band')).toBe(false);
    await expect(page.locator('#scenarios-menu')).toHaveCount(0);
    const about = page.locator('.band .election-about');
    await about.locator('summary').focus(); await page.keyboard.press('Enter');
    await expect(about).toHaveAttribute('open', '');
    for (let i = 0; i < 40 && await focusIn(page, '.election-about'); i++) await page.keyboard.press('Tab');
    await expect(about).not.toHaveAttribute('open', '');
    // Shift+Tab out of it closes it too
    await about.locator('summary').focus(); await page.keyboard.press('Enter');
    await page.keyboard.press('Shift+Tab');
    await expect(about).not.toHaveAttribute('open', '');
  });

  test(`a figure's details close when focus leaves them · ${lang}`, async ({ page }) => {
    await open(page, lang);
    const shown = () => page.evaluate(() => document.querySelectorAll('.more:popover-open').length);
    await page.locator('.fig > button[popovertarget]').first().focus();
    await page.keyboard.press('Enter');
    expect(await shown()).toBe(1);
    // Tab goes into them (the browser puts them right after their button); past their end they close
    await page.keyboard.press('Tab');
    expect(await focusIn(page, '.more')).toBe(true);
    for (let i = 0; i < 60 && await focusIn(page, '.more'); i++) await page.keyboard.press('Tab');
    await expect.poll(shown).toBe(0);
  });

  test(`the phone Menu closes when focus leaves it · ${lang}`, async ({ page }) => {
    await open(page, lang, { width: 390 });
    const button = page.locator('.band .band-menu-btn');
    await button.click();
    await expect(page.locator('#phone-menu')).toBeVisible();
    // Shift+Tab before its start goes to the page behind it: the menu closes rather than hide the focused control
    await page.locator('#phone-menu').getByRole('button').first().focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#phone-menu')).toHaveCount(0);
    // the Menu button is part of it: focus there keeps it open
    await button.click();
    await button.focus();
    await expect(page.locator('#phone-menu')).toBeVisible();
  });

  test(`Tab past an edit marker goes on in the page · ${lang}`, async ({ page }) => {
    await open(page, lang);
    const rows = page.locator('.lb-row');
    await rows.first().click();
    await page.getByRole('button', { name: T(lang, 'Increase Votes', 'הוספת קולות'), exact: true }).click();
    await page.keyboard.press('Escape');
    const marker = page.locator('.lbars .edit-marker').first();
    await marker.focus();
    // into its popup (Restore), then on to the next row, not to the end of the page
    await page.keyboard.press('Tab');
    await expect(page.locator('.edit-tooltip .marker-restore')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(rows.nth(1)).toBeFocused();
    await expect(page.locator('.edit-tooltip')).toHaveCount(0);
    // Shift+Tab from Restore goes back to the marker
    await marker.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    await expect(marker).toBeFocused();
    // the rest of the board is still reached by Tab from the top
    await page.locator('.band .tool').first().focus();
    const edit = page.getByRole('button', { name: T(lang, 'Edit blocs', 'עריכת גושים'), exact: true });
    let reached = false;
    for (let i = 0; i < 160 && !reached; i++) { await page.keyboard.press('Tab'); reached = await edit.evaluate(e => e === document.activeElement); }
    expect(reached).toBe(true);
  });

  test(`rounded percentages are not tab stops; each table has one Exact values switch · ${lang}`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator('.percentage[tabindex]')).toHaveCount(0);
    // a screen reader reads the exact value with the figure (its description), and the page's text stays the figure
    const figure = page.locator('.board .percentage[data-standalone]').first();
    await expect(figure).toHaveAccessibleDescription(new RegExp(T(lang, 'the exact share', 'השיעור המדויק')));
    await expect(figure).toHaveText(/^[\d.,]+%[0.]*$/);
    await page.locator('#tab-walk').click();
    const table = page.locator('#analysis-panel table').first();
    const sw = table.locator('.exact-switch');
    await expect(sw).toHaveCount(1);
    await expect(sw).toHaveAccessibleName(T(lang, 'Exact values', 'ערכים מדויקים'));
    // its words are drawn by CSS, so the table's text is unchanged
    expect(await sw.textContent()).toBe('');
    // hidden from the eye until it has keyboard focus
    expect((await sw.boundingBox())!.width).toBeLessThanOrEqual(1);
    const first = table.locator('.percentage[data-rounded]').first();
    // the figure as seen (without the invisible padding zeros)
    const seen = () => first.evaluate(e => [...e.childNodes].filter(n => !(n instanceof Element && n.matches('.pct-pad'))).map(n => n.textContent).join('').trim());
    const rounded = await seen();
    await sw.focus();
    expect((await sw.boundingBox())!.width).toBeGreaterThan(20);
    await page.keyboard.press('Enter');
    await expect(sw).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(seen).toMatch(/^[\d.,]+…?%$/);
    // drawn left to right in Hebrew too ("20.514911…%", never "%…20.514911")
    await expect(first).toHaveAttribute('dir', 'ltr');
    const [digit, pct] = await first.evaluate(e => { const r = document.createRange(), t = e.firstChild!, s = t.textContent!; const at = (i: number) => { r.setStart(t, i); r.setEnd(t, i + 1); return r.getBoundingClientRect().left; }; return [at(0), at(s.length - 1)]; });
    expect(pct).toBeGreaterThan(digit);
    expect((await seen()).length).toBeGreaterThan(rounded.length);
    await page.keyboard.press('Enter');
    await expect.poll(seen).toBe(rounded);
  });

  test(`form fields are named by their words, not by their (i) · ${lang}`, async ({ page }) => {
    await open(page, lang);
    await page.locator('#tab-rules').click();
    await page.getByRole('button', { name: T(lang, 'Experimental', 'ניסיוני'), exact: true }).click();
    const quota = page.getByRole('combobox', { name: T(lang, 'Quota rounding', 'עיגול המודד'), exact: true });
    await expect(quota).toHaveCount(1);
    // the words focus the field (they used to open the (i))
    await page.locator('.rules-page label', { hasText: T(lang, 'Threshold %', 'אחוז חסימה %') }).click();
    await expect(page.getByRole('textbox', { name: T(lang, 'Threshold %', 'אחוז חסימה %'), exact: true })).toBeFocused();
    // a rule's checkbox is named once, without its (i)'s name repeated
    await expect(page.getByRole('checkbox', { name: T(lang, 'Half-seats cap', 'מגבלת מחצית'), exact: true })).toHaveCount(1);
  });

  test(`text in the other language is marked, and the page has one h1 · ${lang}`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator('h1')).toHaveCount(1);
    const he = page.locator('.band').getByRole('button', { name: 'עברית', exact: true });
    const en = page.locator('.band').getByRole('button', { name: 'English', exact: true });
    await expect(he).toHaveAttribute('lang', 'he'); await expect(he).toHaveText('עב');
    await expect(en).toHaveAttribute('lang', 'en'); await expect(en).toHaveText('EN');
    if (lang === 'en') {
      // a glossary term's Hebrew name follows its English name, marked as Hebrew, and stays out of the (i)'s name
      await page.locator('#tab-rules').click();
      const info = page.locator('.rules-page .field', { hasText: 'Quota rounding' }).locator('.info button');
      expect(await info.getAttribute('aria-label')).not.toMatch(/[\u0590-\u05FF]/);
      await info.click();
      await expect(page.locator('.pop b [lang="he"]')).toHaveText(/[\u0590-\u05FF]/);
      await page.keyboard.press('Escape');
      await page.locator('#tab-sources').click();
      await expect(page.locator('dl dt [lang="he"]').first()).toBeVisible();
    }
  });
}

for (const theme of ['light', 'dark'] as const) test(`focus ring on the band and dimmed rows keep their contrast · ${theme}`, async ({ page }) => {
  await open(page, 'en', { theme });
  await page.locator('.band .tool').first().focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  const [ring, band] = await page.evaluate(() => [getComputedStyle(document.activeElement!).outlineColor, getComputedStyle(document.querySelector('.band')!).backgroundColor]);
  expect(contrast(ring, band)).toBeGreaterThanOrEqual(3);
  // a list open: the other rows fade their logo and bar, never their words and numbers below 4.5:1
  await page.locator('.lb-row').first().click();
  const texts = await page.locator('.lb-row.dim').first().evaluate(row => {
    const bg = getComputedStyle(row.closest('.lbars')!).backgroundColor;
    return [...row.querySelectorAll<HTMLElement>('.lb-name, .lb-sub > span, .lb-seats b')].map(el => {
      let opacity = 1; for (let x: HTMLElement | null = el; x; x = x.parentElement) opacity *= Number(getComputedStyle(x).opacity);
      return { fg: getComputedStyle(el).color, bg, opacity };
    });
  });
  expect(texts.length).toBeGreaterThan(0);
  for (const t of texts) { expect(t.opacity).toBe(1); expect(contrast(t.fg, t.bg)).toBeGreaterThanOrEqual(4.5); }
});
