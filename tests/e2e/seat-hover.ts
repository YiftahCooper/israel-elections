// Hovering the chamber's seats one after another (T1, 20 Nov 2026).
//
// The open seat card can cover the next seat. The card rightly stays open while the pointer is on it, so a hover aimed
// at a covered seat lands on the card (Playwright then retries until it times out). A person would go round it: so do
// the tests. Then they read the card once it has stopped changing: the previous seat's card is replaced a frame later.
import { expect, type Locator, type Page } from './fixtures';
import { waitForStillText } from './settle.ts';

export async function hoverSeat(page: Page, seat: Locator) {
  await seat.scrollIntoViewIfNeeded();
  const covered = await seat.evaluate(el => {
    const card = document.querySelector('.tip');
    if (!card) return false;
    const r = el.getBoundingClientRect(), c = card.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
    return x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
  });
  if (covered) {
    await page.mouse.move(0, 0);
    await expect(page.locator('.tip')).toHaveCount(0);
  }
  await seat.hover();
  await expect(page.locator('.tip')).toBeVisible();
  await waitForStillText(page, '.tip');
}
