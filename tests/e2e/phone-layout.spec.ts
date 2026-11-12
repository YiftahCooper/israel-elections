// Phone, tablet and Large-text layout (audit 12 Nov 2026, fx-phone): nothing a reader needs is cut off, covered or
// out of reach. Every check measures boxes (inside, not overlapping, inside the screen); none compares pixels.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { openSideBySide } from './sideBySide.ts';

type Opts = { lang?: 'en' | 'he'; width?: number; height?: number; text?: 'normal' | 'large'; level?: string };
async function start(page: Page, { lang = 'en', width = 390, height = 844, text = 'normal', level = 'expert' }: Opts = {}) {
  // one page runs several cases: each writes its own settings from a static file of the same origin (the app, if
  // loaded, saves its own settings as it unloads), then opens the app
  await page.setViewportSize({ width, height });
  await page.goto('/robots.txt');
  await page.evaluate(([lang, level, text]) => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('israel-elections:preferences', '{"voteSource":"proportional","comparison":"reference","jointSeats":"off"}');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2, textSize: text } }));
  }, [lang, level, text] as const);
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}
const box = async (l: Locator) => (await l.boundingBox())!;
const inside = (a: { x: number; width: number }, b: { x: number; width: number }) => a.x >= b.x - 1 && a.x + a.width <= b.x + b.width + 1;
const electionPicker = (page: Page, lang: 'en' | 'he') => page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }).first();

test('What if on a phone: no seat change runs under its row\'s "Open as a scenario" button', async ({ page }) => {
  for (const c of [{ lang: 'en', width: 360, height: 740 }, { lang: 'he', width: 360, height: 740 }, { lang: 'en', width: 390, height: 844, text: 'large' }] as Opts[]) {
    await start(page, c);
    await page.locator('#tab-whatif').click();
    await expect(page.locator('.wi-chip').first()).toBeVisible();
    const hits = await page.locator('.wi-row').evaluateAll(rows => rows.flatMap(row => {
      const b = row.querySelector(':scope > .btn')?.getBoundingClientRect(); if (!b) return [];
      return [...row.querySelectorAll('.wi-chip')].filter(ch => { const r = ch.getBoundingClientRect(); return r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom; }).map(ch => ch.textContent);
    }));
    expect(hits, JSON.stringify(c)).toEqual([]);
  }
});

test('dates in About and the Prime Minister panel use the app\'s date format', async ({ page }) => {
  await start(page, { lang: 'he', width: 360, height: 740 });
  await page.locator('.band .band-menu-btn').click();
  await page.locator('#phone-menu .election-about summary').click();
  const dates = page.locator('#phone-menu .election-about li time');
  await expect(dates.first()).toHaveText('24 בספט׳ 2026');
  await expect(dates.first()).toHaveAttribute('datetime', '2026-09-24');
  for (const t of await dates.allTextContents()) expect(t).not.toMatch(/\d{4}-\d{2}/);
  await start(page, { width: 1500, height: 1000, level: 'simple' });
  await choose(electionPicker(page, 'en'), 'k14');
  await expect(page.locator('.pm-result header h2')).toHaveText('Prime Minister · 29 May 1996');
});

test('the list panel\'s History chart and note fit the panel on phones, and the full sheet never scrolls sideways', async ({ page }) => {
  for (const c of [{ lang: 'en', width: 360, height: 740 }, { lang: 'he', width: 360, height: 740 }, { lang: 'en', text: 'large' }, { lang: 'he', text: 'large' }] as Opts[]) {
    await start(page, c);
    await page.locator('.lb-row').first().click();
    const panel = page.locator('aside.side-panel');
    await expect(panel.locator('.ph-chartbtn')).toBeVisible();
    const p = await box(panel);
    for (const part of [panel.locator('.ph-compact'), panel.locator('.ph-chartbtn')]) expect(inside(await box(part), p), JSON.stringify(c)).toBe(true);
    if (c.width === 360) {
      await panel.locator('.ph-sec').getByRole('button', { name: c.lang === 'he' ? 'היסטוריה מלאה' : 'Full history', exact: true }).click();
      const sheet = page.locator('dialog[open].ph-sheet');
      await expect(sheet.locator('.ph-head')).toBeVisible();
      expect(await sheet.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(0);
    }
  }
});

test('Large text on a phone: every full-screen sheet fits the screen, its close button in view', async ({ page }) => {
  for (const lang of ['en', 'he'] as const) {
    await start(page, { lang, text: 'large' });
    const close = lang === 'he' ? 'סגירה' : 'Close';
    const fits = async (sheet: Locator) => {
      await expect(sheet).toBeVisible();
      const r = await box(sheet);
      expect(r.y).toBeGreaterThanOrEqual(-1); expect(r.y + r.height).toBeLessThanOrEqual(845);
      expect(r.x).toBeGreaterThanOrEqual(-1); expect(r.x + r.width).toBeLessThanOrEqual(391);
      const c = await box(sheet.getByRole('button', { name: close }).first());
      expect(c.y).toBeGreaterThanOrEqual(0); expect(c.x).toBeGreaterThanOrEqual(0); expect(c.x + c.width).toBeLessThanOrEqual(390);
      expect(await sheet.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(0);
    };
    await page.locator('.lb-row').first().click();
    await page.locator('.ph-sec').getByRole('button', { name: lang === 'he' ? 'היסטוריה מלאה' : 'Full history', exact: true }).click();
    await fits(page.locator('dialog[open].ph-sheet'));
    await page.keyboard.press('Escape');
    await page.locator('.cands .mk-name').filter({ visible: true }).first().click();
    await fits(page.locator('dialog[open].mk-sheet'));
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await page.locator('#tab-families').click();
    await page.locator('.families button').filter({ visible: true }).filter({ hasText: lang === 'he' ? /פירוט|עריכ/ : /breakdown|Edit/i }).first().click();
    await fits(page.locator('dialog[open].family-sheet'));
  }
});

test('Side by side: phone rows keep a readable name; the change never sits on the Copy votes button', async ({ page }) => {
  for (const c of [{ lang: 'en', width: 360, height: 740 }, { lang: 'he', width: 360, height: 740 }, { lang: 'he', text: 'large' }, { lang: 'he', width: 768, height: 1024 }, { lang: 'en', width: 1024, height: 768 }, { lang: 'en', width: 1500, height: 1000 }] as Opts[]) {
    await start(page, c);
    await openSideBySide(page);
    const m = await page.locator('.cmp-table').evaluate(t => {
      const hit = (a: DOMRect, b: DOMRect) => a.right > b.left + 0.5 && a.left < b.right - 0.5 && a.bottom > b.top + 0.5 && a.top < b.bottom - 0.5;
      const over: string[] = [];
      for (const mid of t.querySelectorAll('tr .cmp-mid')) {
        const btn = mid.querySelector('.cmp-copy-votes')?.getBoundingClientRect(), cell = mid.getBoundingClientRect();
        for (const k of mid.querySelectorAll('.cmp-delta > *')) {
          const r = k.getBoundingClientRect(); if (!r.width) continue;
          if ((btn && hit(r, btn)) || r.left < cell.left - 1 || r.right > cell.right + 1) over.push(k.textContent ?? '');
        }
      }
      const names = [...t.querySelectorAll('tr.cmp-row > .cmp-rname')].map(e => e.getBoundingClientRect().width);
      return { over, minName: Math.min(...names) };
    });
    expect(m.over, JSON.stringify(c)).toEqual([]);
    if ((c.width ?? 390) < 761) expect(m.minName, JSON.stringify(c)).toBeGreaterThanOrEqual(100);
  }
});

test('Sensitivity: range rows read low to high under one label; the tables fit a 360px phone in Hebrew', async ({ page }) => {
  for (const lang of ['he', 'en'] as const) {
    await start(page, { lang, width: 360, height: 740 });
    await page.locator('#tab-sens').click();
    const panel = page.locator('#analysis-panel');
    for (const [name, from, to] of lang === 'he' ? [['טווח קולות', 'מ', 'עד'], ['טווח אחוזים', 'מ-%', 'עד %']] : [['Vote range', 'From', 'To'], ['Threshold range', 'From %', 'To %']]) {
      const group = panel.getByRole('group', { name, exact: true });
      await expect(group).toBeVisible();
      const lo = await box(group.getByRole('textbox', { name: from, exact: true })), hi = await box(group.getByRole('textbox', { name: to, exact: true }));
      expect(lo.x).toBeLessThan(hi.x); // left to right, as on the chart's axis, in both languages
      const label = await box(group.getByText(name, { exact: true }));
      if (lang === 'he') expect(label.x).toBeGreaterThan(hi.x); else expect(label.x).toBeLessThan(lo.x);
    }
    await expect(panel.locator('.tablewrap')).toHaveCount(2);
    for (const t of await panel.locator('.tablewrap').all()) expect(await t.evaluate(e => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(0);
  }
});

test('the election selector shows its whole name: desktop, and phones with Large text', async ({ page }) => {
  const cut = (page: Page) => page.locator('.band .election .choice-current').evaluate(e => [e, ...e.querySelectorAll('.choice-current-part')].some(p => p.scrollWidth > p.clientWidth + 1));
  await start(page, { width: 1500, height: 1000 });
  await choose(electionPicker(page, 'en'), 'k22');
  await expect(page.locator('.band .election .choice-current')).toHaveText('September 2019 · 22nd Knesset', { useInnerText: true });
  expect(await cut(page)).toBe(false);
  for (const lang of ['en', 'he'] as const) {
    await start(page, { lang, text: 'large' });
    expect(await cut(page), lang).toBe(false);
  }
});

test('phones: the (i) of the change line stays beside its label; the result strip never shows a bare "from …"', async ({ page }) => {
  for (const c of [{ lang: 'he' }, { lang: 'en', text: 'large' }] as Opts[]) {
    await start(page, c);
    const label = await box(page.locator('.session > b')), info = await box(page.locator('.session > .info'));
    expect(Math.abs((label.y + label.height / 2) - (info.y + info.height / 2)), JSON.stringify(c)).toBeLessThan(8);
    await page.locator('.lb-row').first().click();
    await expect(page.locator('aside .phone-result-strip > span').first()).toHaveText(c.lang === 'he' ? 'ללא שינוי מהתוצאה הרשמית' : 'No change from the official result');
  }
});

test('Large text: the bloc panel opens with the chosen bloc right under its header', async ({ page }) => {
  await start(page, { text: 'large' });
  await choose(electionPicker(page, 'en'), 'k25');
  const bands = page.locator('button.corridor').filter({ visible: true });
  await bands.nth(1).click();
  const card = page.locator('aside .bp-card.focus');
  await expect(card).toBeVisible();
  await expect.poll(async () => Math.abs((await box(card)).y - await page.locator('aside.side-panel header').first().evaluate(h => h.getBoundingClientRect().bottom))).toBeLessThan(3);
});
