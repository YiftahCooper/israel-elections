import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { choose } from './choices.ts';

// Owner, 19 Nov 2026: every entry in the seat chart's key carries its list's ballot letters or logo, or sits in a
// group headed by them; a party of a joint list shows its own logo where the app holds one, never ballot letters.
async function start(page: Page, lang: 'en' | 'he', level: string, election = 'k26', width = 1500) {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(([lang, level]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, starterTip: false } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional', comparison: 'reference', jointSeats: 'on' }));
  }, [lang, level] as const);
  await page.goto('/');
  await expect(page.locator('.chamber [data-seat]').first()).toBeVisible();
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}

const unmarked = (page: Page) => page.locator('.chamber .legend').evaluate(legend => [...legend.children].flatMap(el => {
  if (el.classList.contains('no-bloc-legend')) return [];
  if (el.classList.contains('key-group')) {
    const head = el.querySelector(':scope > .key-group-head .slip:not(.dot)');
    const letters = [...el.querySelectorAll(':scope > button:not(.key-group-head) .slip:not(.logo)')];
    return [...(head ? [] : [`no list mark: ${el.textContent}`]), ...letters.map(x => `party with letters: ${x.closest('button')!.textContent}`)];
  }
  return el.querySelector('.slip:not(.dot)') ? [] : [`no mark: ${el.textContent}`];
}));

test('2026 at Standard: each joint list is one group under its logo, its parties inside', async ({ page }) => {
  await start(page, 'en', 'standard');
  const legend = page.locator('.chamber .legend');
  const likud = legend.getByRole('group', { name: 'Likud', exact: true });
  await expect(likud.locator('.key-group-head')).toHaveText(/^Likud\s*27$/);
  await expect(likud.locator('.key-group-head .slip.logo')).toHaveCount(1);
  await expect(likud.locator('button:not(.key-group-head)')).toHaveText([/^Likud\s*26$/, /^New Hope – The United Right\s*1$/]);
  // New Hope's own 2026 logo; Likud's party row does not repeat its list's logo
  await expect(likud.locator('button:not(.key-group-head)').nth(1).locator('.slip.logo img')).toHaveAttribute('src', /newhope-2026/);
  await expect(likud.locator('button:not(.key-group-head)').first().locator('.slip')).toHaveCount(0);
  // United Torah Judaism has no logo at this election: its ballot letter heads the group
  await expect(legend.getByRole('group', { name: 'United Torah Judaism', exact: true }).locator('.key-group-head .slip')).toHaveText('ג');
  expect(await unmarked(page)).toEqual([]);
  // the heading picks the list, as a seat does
  await likud.locator('.key-group-head').click();
  await expect(likud.locator('.key-group-head')).toHaveAttribute('aria-pressed', 'true');
});

for (const [lang, level, election, width] of [['he', 'expert', 'k11', 390], ['en', 'simple', 'k26', 1500], ['he', 'standard', 'k1', 390]] as const)
  test(`every key entry is marked: ${election} ${level} ${lang} ${width}`, async ({ page }) => {
    await start(page, lang, level, election, width);
    expect(await unmarked(page)).toEqual([]);
    if (level === 'simple') await expect(page.locator('.chamber .legend .key-group')).toHaveCount(0);
    if (election === 'k11') await expect(page.locator('.chamber .legend').getByRole('group', { name: 'המערך', exact: true }).locator('.key-group-head .slip')).toHaveText('אמת');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

test('the exported picture keeps the groups, the ballot letters and the logos', async ({ page }) => {
  await start(page, 'en', 'standard');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG', exact: true }).click();
  const svg = await readFile(await (await download).path(), 'utf8');
  // logos travel inside the file, so it stands alone
  const images = svg.match(/<image [^>]*href="([^"]*)"/g) ?? [];
  expect(images.length).toBe(14); // nine lists and five parties with a logo of their own
  expect(images.every(x => x.includes('href="data:image/'))).toBe(true);
  expect(svg).toContain('>ג</text>'); // United Torah Judaism's letter
  expect(svg).toMatch(/font-weight="700"[^>]*>Likud ⁦?27/);
  expect(svg).toMatch(/>New Hope – The United Right ⁦?1/);
  // one frame per joint list with two or more parties seated (2026: eight)
  expect((svg.match(/<rect [^>]*rx="8" fill="none"/g) ?? []).length).toBe(8);
});
