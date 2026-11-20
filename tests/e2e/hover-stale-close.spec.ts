// Hover boxes under awkward event timing (T1, 19–20 Nov 2026; both found by the PW_SLOW run).
//
// 1. A hover box that closes by itself must not undo the next one.
//
// When a seat card closes after its grace, React removes it and runs the hover intent's "closed" effect a moment later.
// On a slow machine the pointer can reach the next seat in between. That effect used to treat the new seat's request
// as closed too: a card asked for at once stayed open for good (the intent forgot it, so leaving never closed it), and
// one still waiting for the rest delay never opened (mk-history.spec.ts, "Karkabi Sabbah hers", failed so under a
// 4x slower CPU). The test puts the next seat's mouse-enter exactly in that gap: in the microtask after the old card
// leaves the page, before React's effects.
//
// 2. Moving the pointer from a seat straight onto its card (where the card overlaps the seat) closed the card under the
// pointer: the browser sends the card's pointerenter before the seat's mouseleave, so "keep it open" ran before "close
// after the grace". The test sends the events in that order.
import { expect, test, type Page } from './fixtures';

const open = async (page: Page) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard', hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  });
  await page.goto('/');
  await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
};

test('a seat entered while the previous card is being removed still closes when the pointer leaves it', async ({ page }) => {
  await open(page);
  const seats = page.locator('.chamber [data-seat]');
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

test('moving from a seat straight onto its card keeps the card open until the pointer leaves the card', async ({ page }) => {
  await open(page);
  await page.locator('.chamber [data-seat]').nth(10).hover();
  const tip = page.locator('.chamber .tip');
  await expect(tip).toHaveCount(1);
  // the browser's order when the pointer crosses from the seat into the card: pointer events, then mouse events
  await page.evaluate(() => {
    const seat = document.querySelectorAll('.chamber [data-seat]')[10], card = document.querySelector('.chamber .tip')!;
    seat.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: card, pointerType: 'mouse' }));
    card.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, relatedTarget: seat, pointerType: 'mouse' }));
    seat.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: card }));
    card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: seat }));
    (window as unknown as { __crossed: number }).__crossed = performance.now();
  });
  // well past the grace, in the page's own time: the card is still there
  await page.waitForFunction(() => performance.now() - (window as unknown as { __crossed: number }).__crossed > 600);
  await expect(tip).toHaveCount(1);
  // leaving the card closes it
  await page.evaluate(() => {
    const card = document.querySelector('.chamber .tip')!;
    card.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: document.body, pointerType: 'mouse' }));
    card.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
  });
  await expect(tip).toHaveCount(0);
});
