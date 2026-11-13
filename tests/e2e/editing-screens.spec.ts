import { expect, test, type Page } from '@playwright/test';
const start = async (page: Page, lang = 'en') => {
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, level: 'expert', theme: lang === 'he' ? 'dark' : 'light', hintDismissed: true })), lang);
  await page.goto('/');
};
const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true }).click();
const steady = async (button: ReturnType<Page['getByRole']>) => {
  await button.scrollIntoViewIfNeeded(); const before = (await button.boundingBox())!;
  await button.click(); const after = (await button.boundingBox())!;
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
};
test('M1: official structure has no reset', async ({ page }) => {
  await start(page); await tab(page, 'Merge & split');
  await expect(page.getByRole('button', { name: 'Official lists', exact: true })).toHaveCount(0);
});
test('WI1: questions stay independently open', async ({ page }) => {
  await start(page); await tab(page, 'What if…');
  const questions = page.locator('.wi-q:not(:disabled)');
  await questions.nth(0).click(); await steady(questions.nth(1));
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await expect(questions.nth(1)).toHaveAttribute('aria-expanded', 'true');
});
test('R1 R2 R3 R4 T1 T2: explanations stay live, edits stay put and labels are readable', async ({ page }) => {
  await start(page); await tab(page, 'Rules');
  const fields = page.locator('.rules-fields');
  for (const info of await fields.locator('.info button').all()) { await expect(info).toBeEnabled(); }
  await expect(fields.getByRole('textbox', { name: 'Threshold %', exact: true })).toBeDisabled();
  await steady(page.getByRole('button', { name: 'Experimental', exact: true }));
  await steady(page.getByRole('button', { name: 'Increase Turnout %', exact: true }));
  await expect(page.locator('.band').getByRole('button', { name: /^Undo:/ })).toHaveAccessibleName(/Turnout set to \d+\.\d{2}%/);
  await expect(page.getByRole('button', { name: '0.1 pp', exact: true })).toBeVisible();
  await steady(page.getByRole('button', { name: 'Increase Registered voters', exact: true }));
  const rulesSteps = (await page.locator('.rules-turnout .seg').boundingBox())!;
  const picker = (await page.getByRole('button', { name: 'Use another election’s turnout', exact: true }).boundingBox())!;
  const field = (await page.locator('.rules-turnout .stepper-controls').boundingBox())!;
  expect(Math.abs(picker.y - field.y)).toBeLessThanOrEqual(1);
  await tab(page, 'Turnout');
  const turnoutSteps = (await page.locator('.turnout-national .numeric-stepper .seg').boundingBox())!;
  expect(turnoutSteps.width).toBe(rulesSteps.width);
});
for (const lang of ['en', 'he']) test(`FA1 FA2: stable family scale and explicit navigation (${lang})`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await start(page, lang);
  await tab(page, lang === 'en' ? 'Party families' : 'משפחות מפלגות');
  await steady(page.getByRole('button', { name: lang === 'en' ? 'Target share (%)' : 'יעד שיעור הקולות (%)', exact: true }));
  await expect(page.getByRole('button', { name: lang === 'en' ? 'Apply grouping & open Overview' : 'החלת החלוקה ופתיחת תמונת המצב', exact: true })).toBeVisible();
});
test('SC1 SC2: disabled scenario actions explain their requirements', async ({ page }) => {
  await page.route('**/data/scenarios.json', route => route.fulfill({ json: { entries: [], timestamp: Date.now() - 1000 } }));
  await start(page); await tab(page, 'Scenarios');
  await expect(page.locator('.scenario-gallery [role="status"]')).toContainText(/updated \d{1,2} [A-Za-z]{3} \d{4}/);
  for (const name of ['Duplicate', 'Start over']) {
    const button = page.locator('main').getByRole('button', { name, exact: true });
    await expect(button).toBeDisabled(); await expect(button).toHaveAttribute('title', /.+/);
  }
  await page.getByText('Publish this scenario on GitHub', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Publish on GitHub ↗', exact: true })).toHaveAttribute('title', /Change something first/);
});
test('L1 L2 SC1: locality info is square; address controls align; sticky map clears chrome', async ({ page }) => {
  await start(page); await tab(page, 'Localities');
  const info = page.locator('.locality-map-tool .info button').first();
  await expect(info).toBeVisible(); const box = (await info.boundingBox())!;
  expect(box.width).toBe(box.height);
  const form = page.locator('.locality-map-address'), input = form.locator('input'), button = form.getByRole('button', { name: 'Find address', exact: true });
  await expect(button).toHaveAttribute('title', /address/i);
  const a = (await input.boundingBox())!, b = (await button.boundingBox())!;
  expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1); expect(a.height).toBe(b.height);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const map = (await page.locator('.locality-map-canvas').boundingBox())!;
  const chrome = (await page.locator('.session').boundingBox())!;
  await page.screenshot({path:'.backup-scratch/editing/locality-after.png',fullPage:true});
  expect(map.y).toBeGreaterThanOrEqual(chrome.y + chrome.height);
});

test('R1: withdrawn votes stay locked while source explanations remain available', async ({ page }) => {
  await start(page); await page.locator('.lb-row').first().click();
  await page.getByRole('checkbox', { name: 'Withdrawn from the race' }).check();
  await expect(page.getByRole('button', { name: 'Increase Votes', exact: true })).toBeDisabled();
  const info = page.getByRole('button', { name: 'Where the votes come from', exact: true });
  await info.click(); await expect(page.getByRole('tooltip')).toContainText('Taking votes');
});
for (const lang of ['en','he']) for (const theme of ['light','dark']) for (const width of [390,1024,1500]) test(`editing layout ${lang} ${theme} ${width}`, async ({ page }) => {
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(({lang,theme})=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang,theme,level:'expert',hintDismissed:true})),{lang,theme});
  await page.goto('/');
  for (const id of ['rules','families','loc','scenarios','structure','whatif','turnout']) {
    await page.locator('#tab-'+id).click();
    await expect(page.locator('#analysis-panel')).toBeVisible();
    await expect(page.locator('#analysis-panel')).not.toHaveText(/^(Loading…|טוען…)$/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (id === 'rules' || id === 'families') await page.screenshot({path:`.backup-scratch/editing/${id}-${lang}-${theme}-${width}.png`,fullPage:true});
  }
});

test('R2: phone mode switch stays under the pointer when its reset appears', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await start(page);
  await tab(page,'Rules');
  await steady(page.getByRole('button',{name:'Experimental',exact:true}));
});

test('turnout step choices stay on one line on a Hebrew phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, 'he');
  await tab(page, 'שיעור הצבעה');
  const steps = page.locator('.numeric-stepper .seg button');
  await expect(steps.first()).toBeVisible();
  // one line of text in each (a phone's step buttons are 44 px tall for touch, so height alone no longer tells)
  for (const b of await steps.all()) {
    expect((await b.boundingBox())!.height).toBeLessThanOrEqual(44);
    expect(await b.evaluate(el => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].map(x => Math.round(x.top))).size; })).toBe(1);
  }
});
