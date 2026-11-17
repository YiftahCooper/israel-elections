import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { choose } from './choices.ts';
import { barLanguage } from './barMenu.ts';

for (const lang of ['he', 'en'] as const) test(`k26 distinguishes the completed mandate from a new government: ${lang}`, async ({ page }) => {
  await page.goto('/');
  if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k26');
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const history = page.locator('.after-election');
  await expect(history).toContainText(lang === 'he' ? 'הרצוג הטיל על גדי איזנקוט' : 'Herzog tasked Gadi Eisenkot');
  await expect(history.locator('.after-events time[datetime="2026-11-08"]')).toHaveCount(1);
  await expect(history.locator('.after-mandate')).toHaveCount(1);
  await expect(history.locator('.after-round')).toHaveCount(1);
  await expect(history.locator('.after-coalition')).toHaveCount(0);
});

test('history, split recommendations, direct elections and next-election navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k24');
  await page.locator('.band .election-about > summary').click();
  await page.getByRole('button', { name: 'Government & term →', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'After the election', exact: true })).toHaveAttribute('aria-selected', 'true');
  const history = page.locator('.after-election');
  await expect(history).toContainText('Government 36');
  await expect(page.locator('.change-summary')).toHaveCount(0);
  await expect(history.locator('.after-round')).toHaveCount(2);
  await history.getByText('Lists & recommendations', { exact: true }).nth(1).click();
  await expect(history.getByRole('cell', { name: /^Yair Lapid/ }).first()).toBeVisible();
  await history.getByRole('button', { name: '→ Next election' }).click();
  await expect(history).toHaveAttribute('data-election', 'k25');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k14');
  await expect(history).toContainText('PM elected directly');
  await expect(history.locator('.after-round')).toHaveCount(0);
  await history.getByRole('button', { name: /Next election/ }).click();
  await expect(history).toHaveAttribute('data-election', 'k15');
  await expect(history).toContainText('6 Feb 2001');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k1');
  await expect(history).toContainText('Not documented');
  await expect(history).toContainText('Government 1');
  await page.getByRole('button', { name: 'Sources & research coverage' }).click();
  await expect(page.locator('.after-sources')).toContainText('Pending corroboration');
});

test('history remains official after editing votes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: 'After the election', exact: true }).click();
  await page.locator('section.tl .tl-chamber circle.seat').first().waitFor(); // the term timeline loads its own data
  const original = await page.locator('.after-election').textContent();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = page.getByRole('region', { name: 'List details' }).getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1200000'); await votes.press('Enter');
  await page.getByRole('tab', { name: 'After the election', exact: true }).click();
  await expect(page.locator('.after-election')).toHaveText(original!);
  expect(await page.locator('.app').evaluate(el => (el as HTMLElement).style.getPropertyValue('--scenario-color'))).toBe('');
});

for (const lang of ['he', 'en'] as const) test(`localised history, isolated ranges and attached help: ${lang}`, async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1024, height: 1000 });
  await page.goto('/');
  if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k24');
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const history = page.locator('.after-election');
  const government = history.locator('h3').filter({ hasText: lang === 'he' ? 'הממשלה ה־36' : 'Government 36' });
  const nameTile = history.locator('.after-coalition .after-party > bdi:not([lang])').first();
  expect(await nameTile.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  const endpoints = government.locator('time');
  await expect(endpoints.nth(0)).toHaveAttribute('datetime', '2021-06-13');
  await expect(endpoints.nth(1)).toHaveAttribute('datetime', '2022-12-29');
  const positions = await endpoints.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().x));
  if (lang === 'he') expect(positions[0]).toBeGreaterThan(positions[1]);
  else expect(positions[0]).toBeLessThan(positions[1]);
  const succession = await history.locator('.after-pms > span').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().x));
  if (lang === 'he') expect(succession[0]).toBeGreaterThan(succession[1]);
  else expect(succession[0]).toBeLessThan(succession[1]);
  await expect(history.locator('.after-formation')).toHaveAttribute('dir', 'ltr');
  for (const direction of await history.locator('.after-mandate > span').evaluateAll(nodes => nodes.map(n => getComputedStyle(n).direction))) expect(direction).toBe(lang === 'he' ? 'rtl' : 'ltr');
  await expect(history.locator('.after-pms .after-forward')).toHaveText(lang === 'he' ? '←' : '→');
  await expect(history.locator('footer .after-forward')).toHaveText(lang === 'he' ? '←' : '→');
  const formation = history.locator('section').filter({ has: page.getByRole('heading', { name: lang === 'he' ? /הרכבת הממשלה/ : /Government formation/ }) });
  const row = formation.locator('.after-events li').first();
  const rowBox = (await row.boundingBox())!;
  const dateBox = (await row.locator(':scope > .after-date-run').boundingBox())!;
  expect(Math.abs(lang === 'he' ? dateBox.x + dateBox.width - rowBox.x - rowBox.width : dateBox.x - rowBox.x)).toBeLessThan(2);
  await expect(formation.locator(':scope > .info')).toHaveCount(0);
  await expect(formation.locator('h3 .info')).toHaveCount(1);
  await formation.locator('h3 .info > button').click();
  // a recorded disagreement names each source by its publisher, never by a record id (reader text, 17 Nov)
  await expect(formation.locator('h3 .pop .after-conflict')).toContainText('The Jerusalem Post');
  await expect(formation.locator('h3 .pop')).not.toContainText(/jpost-2021-06-03|"values"|"resolution"/);
  await page.keyboard.press('Escape');
  await expect(history).not.toContainText(/\d{4}-\d{2}/);
  await expect(history).not.toContainText(/[⚖▣◎◇●]/);
  await expect(history.getByRole('heading', { name: lang === 'he' ? 'חברי הקואליציה' : 'Members', exact: true }).first()).toBeVisible();
  // All evidence controls stay on the line of their label, including dates and long event tails.
  const orphans = await history.locator('.after-help-anchor').evaluateAll(nodes => nodes.flatMap(node => {
    const info = node.querySelector('.info > button');
    if (!info || !info.getBoundingClientRect().width) return [];
    const text = document.createRange(); text.setStart(node, 0); text.setEndBefore(info.closest('.info')!);
    const last = [...text.getClientRects()].filter(r => r.width > 0).at(-1);
    const box = info.getBoundingClientRect();
    return last && Math.abs(last.y - box.y) > 14 ? [node.textContent] : [];
  }));
  expect(orphans).toEqual([]);
  const summary = history.locator('.after-support-totals').first();
  // Round 7 research (16 Nov 2026): Chikli opposed government 36 from its formation, so 61 coalition members, not 62.
  await expect(summary.locator('.after-members-total')).toHaveText('61');
  await expect(summary.locator('.after-confidence-vote')).toContainText(lang === 'he' ? '60 בעד · 59 נגד' : '60 for · 59 against');
  await expect(history.locator('[data-individual="amichai-chikli"]')).toContainText(lang === 'he' ? 'נגד' : 'Against');
  await expect(history.locator('[data-individual="saeed-alkharumi"]')).toContainText(lang === 'he' ? 'נמנע' : 'Abstained');
  await summary.locator('.after-help-anchor').nth(1).locator('.info > button').click();
  await expect(summary.locator('.pop')).toContainText('Chikli');
  await page.keyboard.press('Escape');
  // The same rendering contract applies to every reviewed election, not just the reported example.
  for (let n = 1; n <= 26; n++) {
    await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), `k${n}`);
    await expect(history).toHaveAttribute('data-election', `k${n}`);
    await expect(history).not.toContainText(/\d{4}-\d{2}/);
    const ranges = await history.locator('.after-date-run').evaluateAll(nodes => nodes.flatMap(node => {
      const times = node.querySelectorAll('time');
      return times.length === 2 && times[0].getBoundingClientRect().width ? [{ start: times[0].getBoundingClientRect().x, end: times[1].getBoundingClientRect().x }] : [];
    }));
    for (const range of ranges) {
      if (lang === 'he') expect(range.start, `range order k${n}`).toBeGreaterThan(range.end);
      else expect(range.start, `range order k${n}`).toBeLessThan(range.end);
    }
    const unisolated = await history.evaluate(root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const bad: string[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (/\d/.test(node.textContent ?? '') && !node.parentElement?.closest('bdi, [dir="ltr"]')) bad.push(node.textContent!);
      }
      return bad;
    });
    expect(unisolated, `number isolation in k${n}/${lang}`).toEqual([]);
  }
});

for (const lang of ['he', 'en'] as const) test(`support roles and honest unknown totals: ${lang}`, async ({ page }) => {
  await page.goto('/');
  if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const election = page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true });
  const history = page.locator('.after-election');
  await choose(election, 'k9');
  await expect(history.locator('[data-support-role="member-without-ministries"]').first()).toContainText(lang === 'he' ? 'אגודת ישראל' : 'Agudat');
  // Flatto-Sharon supported the government from outside (probable since 16 Nov 2026), not by his vote alone
  await expect(history.locator('[data-support-role="outside-support"]').first()).toContainText(lang === 'he' ? 'פלאטו' : 'Flatto');
  await expect(history.locator('[data-individual="moshe-dayan"]')).toContainText(lang === 'he' ? 'משה דיין' : 'Moshe Dayan');
  await expect(history.locator('.after-members-total').first()).toHaveText('62');
  await expect(history.locator('.after-support-total').first()).toHaveText('1');
  await expect(history.locator('.after-confidence-vote').first()).toContainText(lang === 'he' ? '63 בעד · 53 נגד' : '63 for · 53 against');
  await choose(election, 'k13');
  await expect(history.locator('[data-support-role="outside-support"]').first().locator('.after-party')).toHaveCount(2);
  // Confirmed since 16 Nov 2026 (independent studies, one citing the agreements of 9 July 1992): no "Provisional" mark
  await expect(history.locator('[data-support-role="outside-support"]').first()).not.toContainText(lang === 'he' ? 'זמני' : 'Provisional');
  await expect(history.locator('.after-support-total').first()).toHaveText('5');
  await expect(history.locator('.after-confidence-vote').first()).toContainText(lang === 'he' ? '67 בעד · 53 נגד' : '67 for · 53 against');
  await history.getByText(lang === 'he' ? 'שינויים בממשלה' : 'Government changes', { exact: true }).click();
  await expect(history.locator('.after-government-change .after-members-total').first()).toHaveText(lang === 'he' ? 'לא ידוע' : 'Unknown');
  await choose(election, 'k2');
  await expect(history.locator('.after-members-total').first()).toHaveText(lang === 'he' ? 'לא ידוע' : 'Unknown');
  await expect(history.locator('[data-support-role="unknown"]').first()).toBeVisible();
  await expect(history.locator('[data-support-role="member-with-ministries"] [data-support-role="unknown"]')).toHaveCount(0);
  await choose(election, 'k15');
  await expect(history.locator('.after-confidence-vote').first()).toHaveText(lang === 'he' ? 'לא ידוע' : 'Unknown');
  await choose(election, 'k25');
  await expect(history.locator('.after-members-total').first()).toHaveText('64');
  await expect(history.locator('.after-confidence-vote').first()).toContainText(lang === 'he' ? '63 בעד · 54 נגד' : '63 for · 54 against');
  await history.locator('.after-support-totals').first().locator('.after-help-anchor').nth(1).locator('.info > button').click();
  await expect(history.locator('.after-support-totals .pop')).toContainText(lang === 'he' ? 'הפער טרם הוסבר' : 'The difference has not been reconciled');
});

test('switching language on mounted history updates endpoint direction and visual order', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'אחרי הבחירות', exact: true }).click();
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k24');
  for (const lang of ['en', 'he', 'en'] as const) {
    await page.getByRole('button', { name: lang === 'en' ? 'English' : 'עברית', exact: true }).click();
    const government = page.locator('.after-election h3').filter({ hasText: lang === 'he' ? 'הממשלה ה־36' : 'Government 36' });
    const start = government.locator('time').first();
    await expect(start).toHaveCSS('direction', lang === 'he' ? 'rtl' : 'ltr');
    if (lang === 'en') {
      const positions = await start.evaluate(el => {
        const text = el.firstChild!; const day = document.createRange(), month = document.createRange();
        day.setStart(text, 0); day.setEnd(text, 2); month.setStart(text, 3); month.setEnd(text, 6);
        return { day: day.getBoundingClientRect().x, month: month.getBoundingClientRect().x };
      });
      expect(positions.day).toBeLessThan(positions.month);
    }
  }
});

// Fix lane fx-after (audit 12 Nov 2026)
const openAfter = async (page: import('@playwright/test').Page, id: string, lang: 'en' | 'he') => {
  await page.goto('/');
  if (lang === 'en') await barLanguage(page, 'en');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), id);
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  return page.locator('.after-election');
};
for (const lang of ['en', 'he'] as const) test(`acting and interim prime ministers are named as such: ${lang}`, async ({ page }) => {
  const history = await openAfter(page, 'k16', lang);
  await expect(history.locator('.after-pms')).toHaveText(lang === 'en'
    ? 'Ariel Sharon · 27 Feb 2003→Ehud Olmert (acting Prime Minister) · 4 Jan 2006→Ehud Olmert (interim Prime Minister) · 14 Apr 2006'
    : 'אריאל שרון · 27 בפבר׳ 2003←אהוד אולמרט (ממלא מקום ראש הממשלה) · 4 בינו׳ 2006←אהוד אולמרט (ראש הממשלה בפועל) · 14 באפר׳ 2006');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k13');
  await expect(history.locator('.after-pms')).toContainText(lang === 'en' ? 'Shimon Peres (acting Prime Minister)' : 'שמעון פרס (ראש הממשלה בפועל)');
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k6');
  await expect(history.locator('.after-pms')).toContainText(lang === 'en' ? 'Yigal Allon (acting Prime Minister)' : 'יגאל אלון (ראש הממשלה בפועל)');
});

test('later-government rows name every faction in English, never transliterated', async ({ page }) => {
  const history = await openAfter(page, 'k10', 'en');
  await history.getByText('Government changes', { exact: true }).click();
  const change = history.locator('.after-government-change').last();
  for (const name of ['Tehiya', 'Tami', 'Movement for Social Zionist Renewal', 'National Religious Party']) await expect(change.locator('.after-coalition')).toContainText(name);
  await expect(change).not.toContainText("thyyh");
  for (const [id, name] of [['k6', 'Alignment'], ['k15', 'Yisrael BaAliyah'], ['k13', "Yi'ud"]] as const) {
    await choose(page.getByRole('button', { name: 'Election', exact: true }), id);
    await history.getByText('Government changes', { exact: true }).click();
    await expect(history.locator('.after-government-change .after-coalition').last()).toContainText(name);
  }
  // no row anywhere on the screen falls back to the neutral colour for want of a name
  await expect(history.locator('.after-party-name[lang="he"]')).toHaveCount(0);
});

test('a mid-term change shows no investiture vote of its own; a formation bar names the person tasked', async ({ page }) => {
  const history = await openAfter(page, 'k7', 'en');
  await history.getByText('Government changes', { exact: true }).click();
  const change = history.locator('.after-government-change').first();
  await expect(change).toContainText('Gahal');
  await expect(change.locator('.after-confidence-vote')).toHaveCount(0);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k10');
  await expect(history.locator('.after-mandate small')).toContainText(['Menachem Begin', 'Yitzhak Shamir']);
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k18');
  await expect(history.locator('.after-confidence-vote').first()).toHaveText('69 for · 45 against · 0 abstaining');
});

test('records added in this pass: the Lavon affair, the 1988 recommendations, Government 37 changes, Hebrew wording', async ({ page }) => {
  const history = await openAfter(page, 'k4', 'he');
  await history.getByText('שינויים בממשלה', { exact: true }).click();
  await expect(history).toContainText('פרשת לבון הובילה למשבר פוליטי ולבחירות מוקדמות.');
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k12');
  // 17 Nov 2026: Hadash, PLP and ADP rested only on an outlet not used, so they are not documented (6) and Peres has 49
  await expect(history.locator('.after-key')).toContainText('שמעון פרס 49');
  await expect(history.locator('.after-key')).toContainText('לא מתועד 6');
  await expect(history).not.toContainText('שיחה מקומית');
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k11');
  await expect(history.locator('.after-individual').filter({ hasText: 'אמירה סרטני' })).toContainText('מרשימת המערך');
  await expect(history).not.toContainText('נבחר ברשימת');
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k25');
  await history.getByText('שינויים בממשלה', { exact: true }).click();
  // 15: the nine fx-after rows, Goldknopf 15 Jun 2025 and Porush/Tesler 17 Jul 2025 (12 Nov merge), and four rows from
  // the appointment register (13 Nov): Maoz 1 Mar 2023, 5 Jun 2023 and 26 Mar 2025, Eichler 19 Jan 2026
  await expect(history.locator('.after-government-change')).toHaveCount(15);
});

// Fix lane fx-after2 (audit 12 Nov 2026, second pass)
for (const lang of ['en', 'he'] as const) test(`each recommendation group is named under its own run of the bar, left to right: ${lang}`, async ({ page }) => {
  const history = await openAfter(page, 'k26', lang);
  for (const id of ['k26', 'k25', 'k21', 'k22', 'k11', 'k9']) {
    if (id !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), id);
    await expect(history).toHaveAttribute('data-election', id);
    const round = history.locator('.after-round').first();
    const geometry = await round.evaluate(root => {
      const bar = root.querySelector('.after-bar')!.getBoundingClientRect();
      const groups = [...root.querySelectorAll('.after-group')].map(g => g.getBoundingClientRect());
      const brackets = [...root.querySelectorAll('.after-bracket')].map(g => g.getBoundingClientRect());
      const labels = [...root.querySelectorAll<HTMLElement>('.after-group-label')].map(l => ({ key: l.dataset.group, box: l.getBoundingClientRect() }));
      return { bar: { left: bar.left, right: bar.right }, groups: groups.map(g => ({ left: g.left, right: g.right })), brackets: brackets.map(g => ({ left: g.left, right: g.right })), labels: labels.map(l => ({ key: l.key, left: l.box.left, right: l.box.right, top: l.box.top, bottom: l.box.bottom })) };
    });
    expect(geometry.labels.length, id).toBe(geometry.groups.length);
    geometry.groups.forEach((g, i) => {
      // the bracket spans exactly its group's run of the bar
      expect(Math.abs(geometry.brackets[i].left - g.left), `${id} bracket ${i}`).toBeLessThan(1.5);
      expect(Math.abs(geometry.brackets[i].right - g.right), `${id} bracket ${i}`).toBeLessThan(1.5);
      const l = geometry.labels[i]; const centre = (l.left + l.right) / 2;
      // centred under its run; a label wider than a run at the bar's end ends with the bar instead, over its run
      const atEnd = l.right - l.left > g.right - g.left && (Math.abs(l.right - geometry.bar.right) < 1.5 || Math.abs(l.left - geometry.bar.left) < 1.5);
      if (atEnd) expect(l.left <= (g.left + g.right) / 2 && (g.left + g.right) / 2 <= l.right, `${id} ${l.key} covers its run`).toBe(true);
      else expect(centre >= g.left - 0.5 && centre <= g.right + 0.5, `${id} ${l.key} centre ${centre} in ${g.left}–${g.right}`).toBe(true);
      expect(l.left >= geometry.bar.left - 0.5 && l.right <= geometry.bar.right + 0.5, `${id} ${l.key} inside the bar's width`).toBe(true);
    });
    // no two labels overlap
    for (const [i, a] of geometry.labels.entries()) for (const b of geometry.labels.slice(i + 1))
      expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top, `${id} ${a.key}/${b.key} overlap`).toBe(true);
  }
  // 2026: the 7 who made no recommendation sit at the right end in both languages, as on the bar
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k26');
  const labels = history.locator('.after-round').first().locator('.after-group-label');
  await expect(labels).toHaveText(lang === 'he' ? ['גדי איזנקוט 67', 'בנימין נתניהו 46', 'ללא המלצה 7'] : ['Gadi Eisenkot 67', 'Benjamin Netanyahu 46', 'No recommendation 7']);
  const xs = await labels.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().left));
  expect(xs[0]).toBeLessThan(xs[1]); expect(xs[1]).toBeLessThan(xs[2]);
});

for (const lang of ['en', 'he'] as const) test(`an open mandate is drawn inside the timeline as ongoing, its name beside it: ${lang}`, async ({ page }) => {
  const history = await openAfter(page, 'k26', lang);
  const formation = history.locator('.after-formation');
  const line = (await formation.locator('.after-date-line').boundingBox())!;
  const mandate = formation.locator('.after-mandate');
  await expect(mandate).toHaveAttribute('data-open', 'true');
  await expect(mandate.locator('small')).toHaveText(lang === 'he' ? 'גדי איזנקוט · בתוקף' : 'Gadi Eisenkot · ongoing');
  const bar = (await mandate.locator('span').boundingBox())!, name = (await mandate.locator('small').boundingBox())!;
  expect(bar.width).toBeGreaterThan(20);
  expect(bar.x + bar.width).toBeLessThanOrEqual(line.x + line.width + 1);
  // the name ends where the bar ends, inside the line
  expect(Math.abs(name.x + name.width - (bar.x + bar.width))).toBeLessThan(2);
  expect(name.x).toBeGreaterThanOrEqual(line.x);
  await expect(formation.locator('.after-date-line > span').last()).toContainText(lang === 'he' ? 'נבדק' : 'Checked');
  // a closed mandate keeps its own end and no "ongoing"
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k25');
  await expect(history.locator('.after-mandate[data-open]')).toHaveCount(0);
});

for (const lang of ['en', 'he'] as const) test(`the next-election button names the Knesset; the dissolution is said once: ${lang}`, async ({ page }) => {
  const history = await openAfter(page, 'k22', lang);
  await expect(history.locator('footer button.btn')).toHaveText(lang === 'he' ? '← הבחירות הבאות · 2020 · הכנסת ה־23' : '→ Next election · 2020 · 23rd Knesset');
  await expect(history.locator('.after-events time[datetime="2019-12-12"]')).toHaveCount(1); // the dissolution, listed once
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k20');
  await expect(history.locator('footer .after-events')).toHaveCount(1); // 2018: the dissolution is listed nowhere else
  await expect(history.locator('footer button.btn')).toContainText(lang === 'he' ? 'אפריל 2019 · הכנסת ה־21' : 'April 2019 · 21st Knesset');
});

test('events never go backwards on the page, in all 26 elections', async ({ page }) => {
  test.setTimeout(240_000);
  const history = await openAfter(page, 'k1', 'en');
  const audit: Record<string, string[]> = {};
  for (let n = 1; n <= 26; n++) {
    if (n > 1) await choose(page.getByRole('button', { name: 'Election', exact: true }), `k${n}`);
    await expect(history).toHaveAttribute('data-election', `k${n}`);
    const lists = await history.locator('ol.after-events').evaluateAll(ols => ols.map(ol => [...ol.children].map(li => li.querySelector('time')!.getAttribute('datetime')!)));
    for (const dates of lists) dates.slice(1).forEach((d, i) => {
      const a = dates[i], k = Math.min(a.length, d.length);
      expect(d.slice(0, k) >= a.slice(0, k), `k${n}: ${a} then ${d}`).toBe(true);
    });
    audit[`k${n}`] = lists.flat();
  }
  // the audit's three cases
  const k6 = await (async () => { await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k6'); return history.locator('section').filter({ has: page.getByRole('heading', { name: 'During the term' }) }).locator('li').allInnerTexts(); })();
  expect(k6.findIndex(t => t.includes('national unity government'))).toBeLessThan(k6.findIndex(t => t.includes('fought Egypt, Jordan and Syria')));
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k9');
  const k9 = await history.locator('section').filter({ has: page.getByRole('heading', { name: 'During the term' }) }).locator('li').allInnerTexts();
  expect(k9.findIndex(t => t.includes('Coastal Road massacre'))).toBeLessThan(k9.findIndex(t => t.includes('Operation Litani')));
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k2');
  const k2 = await history.locator('section').filter({ has: page.getByRole('heading', { name: 'Government formation' }) }).locator('li').allInnerTexts();
  expect(k2.findIndex(t => t.includes('tasked Sharett'))).toBeLessThan(k2.findIndex(t => t.includes('confidence in government 6')));
});

for (const lang of ['en', 'he'] as const) test(`Sources: the election's own data leads; aftermath sources follow, named, one per address: ${lang}`, async ({ page }) => {
  await openAfter(page, 'k26', lang);
  await page.getByRole('tab', { name: lang === 'he' ? 'מקורות' : 'Sources', exact: true }).click();
  const panel = page.locator('#analysis-panel');
  await expect(panel.locator('h3').first()).toHaveText(lang === 'he' ? 'מצב הנתונים' : 'Data status');
  const block = panel.locator('.after-sources');
  const links = block.locator('.after-source-list > li > a');
  await expect(links).toHaveCount(22);
  for (const text of await links.allInnerTexts()) expect(text).not.toMatch(/^www\.|\.(com|org|il)$/);
  await expect(links.filter({ hasText: lang === 'he' ? /^בית הנשיא$/ : /^President's Residence$/ })).toHaveCount(16);
  if (lang === 'he') for (const name of ['מעריב', 'הארץ', 'ישראל היום']) await expect(links.filter({ hasText: name }).first()).toBeVisible();
  await expect(block.locator('.after-source-list > li').first()).toContainText(lang === 'he' ? 'רשמי · נשלף' : 'Official · Retrieved');
});

// 16 Nov 2026: the government card shows its rotation agreement, also when the rotation never happened. The agreements
// are the research lane's file; this runs once that file is in the checkout.
for (const lang of ['en', 'he'] as const) test(`a government's rotation agreement is on its card, kept or not: ${lang}`, async ({ page }) => {
  test.skip(!existsSync('data/research/government-rotation-agreements.json'), 'rotation research not yet in this checkout');
  await page.goto('/');
  if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  const open = async (k: string) => {
    await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), k);
    await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
    return page.locator('.after-election .after-rotation');
  };
  let rot = await open('k23');
  await expect(rot).toContainText(lang === 'he' ? 'ראש הממשלה החלופי: בני גנץ · רוטציה מתוכננת ל־17 בנוב׳ 2021 · הרוטציה לא התקיימה' : 'Alternate Prime Minister: Benny Gantz · rotation planned for 17 Nov 2021 · did not take place');
  rot = await open('k24');
  await expect(rot).toContainText(lang === 'he' ? 'יאיר לפיד' : 'took place early, on 1 Jul 2022');
  await rot.getByRole('button', { name: lang === 'he' ? 'הסכם רוטציה' : 'Rotation agreement' }).click();
  await expect(page.getByRole('link', { name: /Israel Democracy Institute/ })).toBeVisible();
  rot = await open('k11');
  await expect(rot).toContainText(lang === 'he' ? 'הסכם רוטציה: יצחק שמיר · אחרי 25 חודשים' : 'Rotation agreement: Yitzhak Shamir · after 25 months · took place on 20 Oct 1986');
  await expect(rot).not.toContainText(lang === 'he' ? 'החלופי' : 'Alternate');
  // no agreement, no line
  await open('k25');
  await expect(page.locator('.after-election .after-rotation')).toHaveCount(0);
});

// the rotation line wraps on a phone: the page never scrolls sideways (it did, by 250 px, before the line could wrap)
test('phone, Hebrew: the government card with its rotation line fits the screen', async ({ page }) => {
  test.skip(!existsSync('data/research/government-rotation-agreements.json'), 'rotation research not yet in this checkout');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await choose(page.getByRole('button', { name: 'בחירות', exact: true }), 'k24');
  await page.getByRole('tab', { name: 'אחרי הבחירות', exact: true }).click();
  await expect(page.locator('.after-rotation')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

// facts/coalition-61 (16 Nov 2026): a coalition counted below the seats its lists won says why, list by list
for (const lang of ['en', 'he'] as const) test(`the coalition count names the lists that joined only in part: ${lang}`, async ({ page }) => {
  await page.goto('/');
  if (lang === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), 'k23');
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const total = page.locator('.after-support-totals .after-help-anchor').first();
  await expect(total).toContainText(lang === 'he' ? 'חברי הקואליציה 73' : 'Members 73');
  await total.getByRole('button').click();
  const pop = page.locator('.pop').filter({ hasText: lang === 'he' ? 'מקורות וסייגים' : 'Sources & qualifications' });
  await expect(pop).toContainText(lang === 'he' ? 'רשימות הקואליציה זכו ב־98 מנדטים; 73 מחבריהן נספרים' : 'The coalition’s lists won 98 seats; 73 of their members are counted');
  await expect(pop).toContainText(lang === 'he' ? 'כחול לבן 17 מתוך 33' : 'Blue and White 17 of 33');
});
