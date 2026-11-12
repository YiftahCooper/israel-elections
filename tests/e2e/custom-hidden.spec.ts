import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { FEATURES, TOOL_FEATURES } from '../../src/app/features.ts';

// Audit 12 Nov 2026 (ax-screens-a-05): at the Custom level, Hidden leaves nothing to click, while Collapsed keeps the
// disclosure. Every feature in features.ts is set to one of them, every screen that carries one is visited, and each
// feature must be found where Collapsed puts it and nowhere at Hidden. A feature added to features.ts fails here until
// a screen below shows it.
type Vis = 'collapsed' | 'hidden';
const TOOLS = new Set<string>(TOOL_FEATURES.map(f => f[0]));
const byLabel = new Map<string, string>(FEATURES.map(f => [f[2], f[0]]));

async function visit(page: Page, vis: Vis): Promise<{ disclosures: Set<string>; side: boolean }> {
  await page.addInitScript(({ vis, ids }) => {
    if (sessionStorage.getItem('seeded')) return;
    const custom = Object.fromEntries(ids.filter(id => id !== 'board').map(id => [id, vis]));
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', customFeatures: custom }));
    // a setting whose control is hidden keeps working: the chamber stays in Blocks
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { decimals: 2, starterTip: false, chamberLayout: 'blocks' } }));
    sessionStorage.setItem('seeded', '1');
  }, { vis, ids: FEATURES.map(f => f[0] as string) });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  const disclosures = new Set<string>();
  const collect = async () => {
    for (const name of await page.locator('.disclosure-toggle').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label') ?? ''))) {
      const label = name.replace(/^More options: /, '');
      expect(byLabel.has(label), label).toBe(true);
      disclosures.add(byLabel.get(label)!);
    }
  };
  const list = async (name: string) => { await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name, exact: true }).click(); await expect(page.locator('.side-panel')).toBeVisible(); await collect(); };
  // 2022: the board (chamber, figures), a list's panel and a joint list's panel
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(page.locator('.chamber rect[data-seat]')).toHaveCount(120);
  await collect();
  await list('Likud');
  await list('Religious Zionism');
  // the tools that carry features of their own, where the level offers them
  if (await page.locator('#tab-families').count()) { await page.locator('#tab-families').click(); await expect(page.locator('#tool-panel')).toBeVisible(); await collect(); }
  if (await page.locator('#tab-structure').count()) {
    await page.locator('#tab-structure').click();
    const chips = page.locator('#tool-panel [role=group][aria-label="Lists"] .chip');
    await chips.nth(0).click(); await chips.nth(1).click();
    await collect();
  }
  // Side by side opens from the comparison strip
  await page.locator('#tab-board').click();
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stop comparing', exact: true })).toBeVisible();
  const side = await page.getByRole('button', { name: 'Side by side', exact: true }).count() > 0;
  await page.getByRole('button', { name: 'Stop comparing', exact: true }).click();
  // 1988: a list with official notes
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k12');
  await list('Likud');
  return { disclosures, side };
}

test('Collapsed: every feature keeps a way to open it', async ({ page }) => {
  const { disclosures, side } = await visit(page, 'collapsed');
  for (const [id] of FEATURES) {
    if (TOOLS.has(id)) await expect(page.locator(`#tab-${id}`), id).toHaveCount(1);
    else if (id === 'compare') expect(side, id).toBe(true);
    else expect(disclosures.has(id), id).toBe(true);
  }
});

test('Hidden: no feature leaves anything to click, and its settings keep working', async ({ page }) => {
  const { disclosures, side } = await visit(page, 'hidden');
  expect([...disclosures]).toEqual([]);
  for (const [id] of FEATURES) {
    if (id === 'board') continue;
    if (TOOLS.has(id)) await expect(page.locator(`#tab-${id}`), id).toHaveCount(0);
    else if (id === 'compare') expect(side, id).toBe(false);
  }
  // links into a hidden tool are gone too (here the walkthrough's, from the 1988 list panel)
  await expect(page.getByRole('button', { name: 'Allocation steps', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Walkthrough/ })).toHaveCount(0);
});
