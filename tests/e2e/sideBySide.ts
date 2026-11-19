// Side by side opens from the comparison strip (owner, 12 Nov 2026, C5b), no longer from a Compare tab.
import { expect, type Page } from './fixtures';

export async function openSideBySide(page: Page) {
  if (!(await page.locator('.cmpm-strip').count())) {
    // the Compare button lives in the change line of the Overview and the tool pages
    if (!(await page.locator('.compare-on').count())) await page.locator('#tab-board').click();
    await page.locator('.compare-on').click();
  }
  await page.locator('.cmpm-strip .cmpm-side').click();
  await expect(page.locator('.side-by-side')).toBeVisible();
  // the section is there at once; its screen loads lazily, and the reference and the workbench inside it after that.
  // Tests that measure or loop over its rows must not start on a "Loading…".
  await expect(page.locator('.side-by-side .cmp')).toBeVisible();
  await expect(page.locator('.side-by-side').getByText(/^(Loading…|טוען…)$/)).toHaveCount(0);
}
