import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

test('history, split recommendations, direct elections and next-election navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
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
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await page.getByRole('tab', { name: 'After the election', exact: true }).click();
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
  if (lang === 'en') await page.getByRole('button', { name: 'EN', exact: true }).click();
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
  expect(positions[0]).toBeLessThan(positions[1]);
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
  await expect(history.getByRole('heading', { name: lang === 'he' ? 'רשימות בעת ההקמה' : 'Lists at formation' })).toBeVisible();
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
  // The same rendering contract applies to every reviewed election, not just the reported example.
  for (let n = 1; n <= 26; n++) {
    await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), `k${n}`);
    await expect(history).toHaveAttribute('data-election', `k${n}`);
    await expect(history).not.toContainText(/\d{4}-\d{2}/);
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
