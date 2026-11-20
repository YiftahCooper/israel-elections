import { expect, type Page } from './fixtures';

/** Phones (≤600px): the top bar is one row with two buttons for the rest (16 Nov 2026). The three lines open the
 *  tools and the view (level, language, theme, Settings, About) in #app-menu; the status label opens the scenario
 *  (switcher, Start over, Save & share) in #phone-menu. */
const isPhone = async (page: Page) => {
  // the bar follows the viewport a frame after a resize: wait until it shows the Menu exactly when the width is a phone's
  await page.waitForFunction(() => matchMedia('(max-width: 600px)').matches === !!document.querySelector('.band .band-menu-btn'));
  return await page.locator('.band .band-menu-btn').count() > 0;
};

/** Opens the three-lines panel (tools and view) when the bar has one; returns whether it did. */
export async function openBarMenu(page: Page) {
  if (!await isPhone(page)) return false;
  if (await page.locator('#phone-menu').count()) await closeBarMenu(page);
  if (!await page.locator('#app-menu').count()) await page.locator('.band .band-menu-btn').click();
  await expect(page.locator('#app-menu')).toBeVisible();
  return true;
}

/** Opens the scenario panel from the status label on a phone; returns whether it did. */
export async function openScenarioMenu(page: Page) {
  if (!await isPhone(page)) return false;
  if (await page.locator('#app-menu').count()) await closeBarMenu(page);
  if (!await page.locator('#phone-menu').count()) await page.locator('.band .band-status').click();
  await expect(page.locator('#phone-menu')).toBeVisible();
  return true;
}

export async function closeBarMenu(page: Page) {
  for (const id of ['#app-menu', '#phone-menu']) {
    if (!await page.locator(id).count()) continue;
    await page.keyboard.press('Escape');
    await expect(page.locator(id)).toHaveCount(0);
  }
}

/** Language and theme from the bar at any width (the phone panel names them in full). */
export async function barLanguage(page: Page, lang: 'en' | 'he') {
  if (await openBarMenu(page)) { await page.locator('#app-menu').getByRole('button', { name: lang === 'he' ? 'עברית' : 'English', exact: true }).click(); await closeBarMenu(page); }
  else {
    // tablets and computers: the language is first in Settings (19 Nov 2026), opened from the bar's gear
    await page.locator('.band .band-settings').click();
    await page.locator('dialog.personal-settings').getByRole('button', { name: lang === 'he' ? 'עברית' : 'English', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog.personal-settings')).toBeHidden();
  }
}

/** Settings from the bar's gear (desktop, tablet) or the three-lines panel (phone). */
export async function openSettings(page: Page, lang: 'en' | 'he' | string = 'en') {
  const name = lang === 'he' ? 'הגדרות' : 'Settings';
  if (await openBarMenu(page)) await page.locator('#app-menu').getByRole('button', { name, exact: true }).click();
  else await page.locator('.band').getByRole('button', { name, exact: true }).click();
}

/** Where a bar part is at this width: the bar itself, or on a phone the panel that holds it (the scenario's parts in
 *  the scenario panel, the rest in the three-lines panel). */
export async function barPart(page: Page, selector: string) {
  if (/scenario|share|start-over/.test(selector)) return page.locator(await openScenarioMenu(page) ? `#phone-menu ${selector}` : `.band ${selector}`);
  return page.locator(await openBarMenu(page) ? `#app-menu ${selector}` : `.band ${selector}`);
}
