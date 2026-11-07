import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';

for (const lang of ['en', 'he']) for (const theme of ['light', 'dark']) for (const width of [1500, 1024, 390]) {
  test(`controls copy and ranges ${lang} ${theme} ${width}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(v => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(v)), { lang, theme, level: 'expert', hintDismissed: true });
    await page.addInitScript(() => localStorage.setItem('israel-elections:preferences', '{}'));
    await page.goto('/');
    for (const election of ['k26', 'k25', 'k12', 'k1']) {
      await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
      await page.locator('.lb-row').first().click();
      const panel = page.locator('.side-panel');
      const steps = panel.getByRole('group', { name: lang === 'en' ? 'Votes step size' : 'קולות גודל צעד', exact: true });
      await expect(steps.getByRole('button', { name: '1', exact: true })).toHaveCount(0);
      const votes = panel.getByRole('textbox', { name: lang === 'en' ? 'Votes' : 'קולות', exact: true });
      const original = Number((await votes.inputValue()).replaceAll(',', ''));
      const slider = panel.getByRole('slider');
      expect(Number((await slider.locator('xpath=following-sibling::div[1]/span[last()]').textContent())!.replaceAll(',', ''))).toBeGreaterThan(original * 2);
      // cube-root track: the list's own votes sit well inside the track, never squeezed against 0
      expect(Number(await slider.inputValue())).toBeGreaterThan(200);
      await expect(slider).toHaveAttribute('aria-valuetext', original.toLocaleString('en-US'));
      await panel.getByRole('button', { name: lang === 'en' ? 'Scale, share & transfer' : 'הכפלה, אחוזים והעברה', exact: true }).click();
      await panel.screenshot({ path: `.backup-scratch/task-b/after-${election}-${lang}-${theme}-${width}.png` });
      const split = panel.getByRole('checkbox', { name: lang === 'en' ? 'Count seats by party' : 'ספירת מנדטים לפי מפלגה', exact: true });
      if (await split.count()) {
        await split.scrollIntoViewIfNeeded();
        if (width === 390) expect((await panel.locator('.party-row > span:nth-child(2)').first().boundingBox())!.width).toBeGreaterThan(120);
        await panel.screenshot({ path: `.backup-scratch/task-b/after-joint-${election}-${lang}-${theme}-${width}.png` });
        await split.check(); await expect(split).toBeChecked();
        await split.uncheck();
      }
      await votes.fill(String(original + 1000)); await votes.press('Enter');
      const ask = page.locator('.source-ask');
      await expect(ask.getByRole('radio')).toHaveCount(3);
      await ask.getByRole('combobox').selectOption('new');
      await ask.screenshot({ path: `.backup-scratch/task-b/after-prefs-${election}-${lang}-${theme}-${width}.png` });
      await page.keyboard.press('Escape');
      expect(Number((await votes.inputValue()).replaceAll(',', ''))).toBe(original);
      // unedited votes and no saved scenarios: nothing to reset or copy, so no replacement control
      await expect(panel.locator('.start-from').first().locator('button')).toHaveCount(0);
      await panel.getByRole('button', { name: lang === 'en' ? 'Close' : 'סגירה', exact: true }).click();
      if (election === 'k26') {
        await page.getByRole('region', { name: lang === 'en' ? 'Lists' : 'הרשימות', exact: true }).getByRole('button', { name: lang === 'en' ? 'The Democrats' : 'הדמוקרטים', exact: true }).click();
        await expect(panel.locator('.party-row > b')).toHaveText(['7', '1']);
        await expect(panel.getByText(lang === 'en' ? '· Lead party' : '· מפלגה מובילה', { exact: true })).toHaveCount(1);
        await panel.locator('.party-rows').scrollIntoViewIfNeeded();
        await panel.screenshot({ path: `.backup-scratch/task-b/after-democrats-${lang}-${theme}-${width}.png` });
        await panel.getByRole('button', { name: lang === 'en' ? 'Close' : 'סגירה', exact: true }).click();
      }
    }
  });
}

for (const scope of ['Just this once', 'For this list']) test(`source scope: ${scope}`, async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang: 'en', theme: 'dark', level: 'expert', hintDismissed: true }));
    localStorage.setItem('israel-elections:preferences', '{}');
  });
  await page.goto('/'); await page.locator('.lb-row').first().click();
  const panel = page.locator('.side-panel'), ask = page.locator('.source-ask');
  const votes = panel.getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('123457'); await votes.press('Enter');
  await expect(ask.getByRole('radio')).toHaveCount(3);
  await ask.getByRole('combobox').selectOption('new');
  await ask.getByRole('radio', { name: scope, exact: true }).check();
  await ask.screenshot({ path: `.backup-scratch/task-b/after-prefs-${scope.replaceAll(' ', '-')}.png` });
  await ask.getByRole('button', { name: 'Apply', exact: true }).press('Enter');
  await expect(votes).toHaveValue('123,457');
  await expect(panel.locator('.edit-marker').first()).toHaveText('Edited');
  await panel.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  if (scope === 'Just this once') {
    await expect(ask).toBeVisible(); await page.keyboard.press('Escape');
    await expect(votes).toHaveValue('123,457');
  } else { await expect(ask).toBeHidden(); await expect(votes).toHaveValue('133,457'); }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:preferences')!))).toEqual({});
});
