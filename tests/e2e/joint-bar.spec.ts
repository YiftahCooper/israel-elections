import { expect, test } from './fixtures';
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';

// 2026 with every joint list counted by party, as a share link
const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
const link = '/#s=' + deflateRawSync(JSON.stringify({ e: 'k26', n: 'Joint', b: ds.buildInfo.builtAt,
  l: ds.lists.filter((x: { parties?: unknown[] }) => (x.parties?.length ?? 0) >= 2).map((x: { id: string }) => ({ type: 'setFactionSplit', listId: x.id, split: true })) })).toString('base64url');

// A joint list counted by party (owner card joint-bar, 16 Nov 2026, option A): its bar shows each party in its own
// colour with a thin gap between parties and no frame; the list's own colour frames its symbol instead.
test('joint list bar: party segments with gaps, no frame; the symbol is framed in the list colour', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, jointListSeats: 'both' } }));
    sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('started', '1');
  });
  await page.goto(link);
  const joint = page.locator('.lb-row:has(.slip-joint)').first();
  await expect(joint).toBeVisible();
  const bar = joint.locator('.lb-bar > i').first();
  // no frame in the list's colour above and below the party colours
  expect(await bar.evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe('0px');
  // one gap (page colour) between each pair of parties
  const image = await bar.evaluate((e) => getComputedStyle(e).backgroundImage);
  expect(image).toContain('linear-gradient');
  expect(image).toContain('calc(');
  // the frame round the symbol is the list's own colour, and a list that is not joint has none
  const frame = await joint.locator('.slip-joint').evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(frame).not.toBe('rgba(0, 0, 0, 0)');
  await expect(page.locator('.lb-row:not(:has(.slip-joint)) .slip').first()).toBeVisible();
  // the List look keeps one colour and no frame round the symbol
  await page.evaluate(() => { const k = 'israel-elections:settings'; const v = JSON.parse(localStorage.getItem(k)!); v.values.jointListSeats = 'list'; localStorage.setItem(k, JSON.stringify(v)); });
  await page.reload();
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await expect(page.locator('.slip-joint')).toHaveCount(0);
});
