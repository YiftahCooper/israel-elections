// A hover box that closes by itself must not undo the next one (T1, 19 Nov 2026; found by the PW_SLOW run).
//
// When a seat card closes after its grace, React removes it and runs the hover intent's "closed" effect a moment later.
// On a slow machine the pointer can reach the next seat in between. That effect used to treat the new seat's request
// as closed too: a card asked for at once stayed open for good (the intent forgot it, so leaving never closed it), and
// one still waiting for the rest delay never opened (mk-history.spec.ts, "Karkabi Sabbah hers", failed so under a
// 4x slower CPU). The test puts the next seat's mouse-enter exactly in that gap: in the microtask after the old card
// leaves the page, before React's effects.
import { expect, test } from './fixtures';

test('a seat entered while the previous card is being removed still closes when the pointer leaves it', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  });
  await page.goto('/');
  const seats = page.locator('.chamber [data-seat]');
  await expect(seats).toHaveCount(120);
  const tip = page.locator('.chamber .tip');
  // the first card, opened by resting on a seat
  await seats.nth(10).hover();
  await expect(tip).toHaveCount(1);
  const first = await tip.textContent();
  // when that card leaves the page, the pointer "enters" another seat in the same moment
  await page.evaluate(() => {
    const seat = document.querySelectorAll('.chamber [data-seat]')[100];
    const watch = new MutationObserver(() => {
      if (document.querySelector('.chamber .tip')) return;
      watch.disconnect();
      seat.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }));
      (window as unknown as { __entered: boolean }).__entered = true;
    });
    watch.observe(document.body, { childList: true, subtree: true });
  });
  // leaving the first seat: its card closes after the grace
  await page.mouse.move(5, 5);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __entered?: boolean }).__entered ?? false)).toBe(true);
  // the second seat's card opens (within the "next opens at once" window) ...
  await expect(tip).toHaveCount(1);
  await expect(tip).not.toHaveText(first!);
  // ... and closes when the pointer leaves that seat
  await page.locator('.chamber [data-seat]').nth(100).dispatchEvent('mouseout', { relatedTarget: null });
  await expect(tip).toHaveCount(0);
});
