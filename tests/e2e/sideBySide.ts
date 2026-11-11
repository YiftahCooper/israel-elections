// Side by side opens from the comparison strip (owner, 12 Nov 2026, C5b), no longer from a Compare tab.
import { expect, type Page } from '@playwright/test';

export async function openSideBySide(page: Page) {
  if (!(await page.locator('.cmpm-strip').count())) {
    // the Compare button lives in the change line of the Overview and the tool pages
    if (!(await page.locator('.compare-on').count())) await page.locator('#tab-board').click();
    await page.locator('.compare-on').click();
  }
  await page.locator('.cmpm-strip .cmpm-side').click();
  await expect(page.locator('.side-by-side')).toBeVisible();
}
