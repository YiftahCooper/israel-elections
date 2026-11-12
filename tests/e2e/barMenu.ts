import { expect, type Page } from '@playwright/test';

/** Phones (≤600px, owner 9 Nov 2026): the top bar is one row and the rest (level, language, theme, scenario,
 *  Save & share, Settings, About) is in its Menu. Opens the Menu when the bar has one; returns whether it did. */
export async function openBarMenu(page: Page) {
  const button = page.locator('.band .band-menu-btn');
  // the bar follows the viewport a frame after a resize: wait until it shows the Menu exactly when the width is a phone's
  await page.waitForFunction(() => matchMedia('(max-width: 600px)').matches === !!document.querySelector('.band .band-menu-btn'));
  if (!await button.count()) return false;
  if (!await page.locator('#phone-menu').count()) await button.click();
  await expect(page.locator('#phone-menu')).toBeVisible();
  return true;
}

export async function closeBarMenu(page: Page) {
  if (!await page.locator('#phone-menu').count()) return;
  await page.keyboard.press('Escape');
  await expect(page.locator('#phone-menu')).toHaveCount(0);
}

/** Language and theme from the bar at any width (the phone Menu names them in full). */
export async function barLanguage(page: Page, lang: 'en' | 'he') {
  if (await openBarMenu(page)) { await page.locator('#phone-menu').getByRole('button', { name: lang === 'he' ? 'עברית' : 'English', exact: true }).click(); await closeBarMenu(page); }
  else await page.getByRole('button', { name: lang === 'he' ? 'עב' : 'EN', exact: true }).click();
}

/** Settings from the bar's gear (desktop, tablet) or its Menu (phone). */
export async function openSettings(page: Page, lang: 'en' | 'he' | string = 'en') {
  const name = lang === 'he' ? 'הגדרות' : 'Settings';
  if (await openBarMenu(page)) await page.locator('#phone-menu').getByRole('button', { name, exact: true }).click();
  else await page.locator('.band').getByRole('button', { name, exact: true }).click();
}

/** Where the bar's scenario switcher and About are at this width: the bar itself, or its open Menu on a phone. */
export async function barPart(page: Page, selector: string) {
  return page.locator(await openBarMenu(page) ? `#phone-menu ${selector}` : `.band ${selector}`);
}
