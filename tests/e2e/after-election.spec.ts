import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

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
  await expect(formation.locator('h3 .pop')).toContainText('jpost-2021-06-03'); // research source IDs remain verbatim
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
  await expect(summary.locator('.after-members-total')).toHaveText('62');
  await expect(summary.locator('.after-confidence-vote')).toContainText(lang === 'he' ? '60 בעד · 59 נגד' : '60 for · 59 against');
  await expect(history.locator('[data-individual="amichai-chikli"]')).toContainText(lang === 'he' ? 'נגד' : 'Against');
  await expect(history.locator('[data-individual="said-al-harumi"]')).toContainText(lang === 'he' ? 'נמנע' : 'Abstained');
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
  await expect(history.locator('[data-support-role="confidence-vote-only"]').first()).toContainText(lang === 'he' ? 'פלאטו' : 'Flatto');
  await expect(history.locator('[data-individual="moshe-dayan"]')).toContainText(lang === 'he' ? 'משה דיין' : 'Moshe Dayan');
  await expect(history.locator('.after-members-total').first()).toHaveText('62');
  await expect(history.locator('.after-confidence-vote').first()).toContainText(lang === 'he' ? '63 בעד · 53 נגד' : '63 for · 53 against');
  await choose(election, 'k13');
  await expect(history.locator('[data-support-role="outside-support"]').first().locator('.after-party')).toHaveCount(2);
  await expect(history.locator('[data-support-role="outside-support"]').first()).toContainText(lang === 'he' ? 'זמני' : 'Provisional');
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
