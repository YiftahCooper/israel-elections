// Faults found by the 19 Nov review of the top bar, Overview, editing, Compare and History (lane FV1).
import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, election: string, { lang = 'en', level = 'standard', prefs = '' } = {}) {
  await page.addInitScript(([lang, level, prefs]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
    if (prefs) localStorage.setItem('israel-elections:preferences', prefs);
  }, [lang, level, prefs]);
  await page.goto('/');
  const lists = page.getByRole('region', { name: lang === 'he' ? 'הרשימות' : 'Lists', exact: true });
  await expect(lists).toBeVisible();
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
  return lists;
}

test('1949: the coalition is 73, as the government record says; WIZO and the Yemenites voted confidence only', async ({ page }) => {
  await start(page, 'k1');
  const bar = page.locator('section.blocs .strip');
  await expect(bar).toHaveAttribute('aria-label', /Coalition 73, Voted confidence only 2, Opposition 45/);
  await expect(page.locator('section.blocs .strip-legend')).toContainText('Voted confidence only 2');
  // a group that is not a side gets no distance from 61
  await expect(page.locator('section.blocs .strip-legend')).not.toContainText('59 short of 61');
});

test('1977: a bare majority reads "exactly 61"; outside support has no distance from 61; Likud is one block', async ({ page }) => {
  // joint lists counted by party (the app's default), so Likud's three parties have their own colours
  await start(page, 'k9', { prefs: '{"voteSource":"proportional","comparison":"reference","jointSeats":"on"}' });
  const legend = page.locator('section.blocs .strip-legend');
  await expect(legend).toContainText('Coalition 61 exactly 61');
  await expect(legend).not.toContainText('0 above 61');
  await expect(legend).not.toContainText('60 short of 61');
  // each of Likud's three parties is one piece in the bar (no alternating stripes)
  const colours = await page.locator('section.blocs .corridor').first().locator('.pieces i').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  const runs = colours.filter((c, i) => c !== colours[i - 1]);
  expect(new Set(runs).size).toBe(runs.length);
});
