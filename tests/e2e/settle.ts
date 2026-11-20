// Waiting for the page to come to rest, without fixed timeouts (T1, 19 Nov 2026).
//
// A fixed wait (`waitForTimeout(400)` "for the bands to ease") is long enough on a desktop and too short on a CI runner
// several times slower; the test then measures mid-animation. These helpers wait for the thing itself: until the
// boxes of the elements a test is about to measure, and the page's scroll, have not changed for several frames in a
// row, however long each frame takes. (The map has its own, tests/e2e/map-settle.ts.)
import { expect, type Locator, type Page } from './fixtures';

/** Resolves once every element matching `selectors`, and the page's and their scroll positions, have kept still for
 *  `frames` animation frames in a row. Elements that appear or disappear count as a change. */
export const waitForStill = (page: Page, selectors: string | string[], frames = 6) => page.evaluate(async ({ selectors, frames }) => {
  const state = () => {
    const parts = [`${scrollX},${scrollY}`];
    for (const s of selectors) document.querySelectorAll(s).forEach(el => {
      const r = el.getBoundingClientRect();
      parts.push(`${r.left},${r.top},${r.width},${r.height},${el.scrollLeft},${el.scrollTop}`);
    });
    return parts.join('|');
  };
  const frame = () => new Promise(r => requestAnimationFrame(r));
  let last = state(), still = 0;
  for (let i = 0; i < 2000 && still < frames; i++) { await frame(); const now = state(); still = now === last ? still + 1 : 0; last = now; }
  if (still < frames) throw new Error(`still moving: ${selectors.join(', ')}`);
}, { selectors: Array.isArray(selectors) ? selectors : [selectors], frames });

/** Resolves once the text under `selector` has not changed for `frames` frames (content still arriving or reformatting). */
export const waitForStillText = (page: Page, selector: string, frames = 6) => page.evaluate(async ({ selector, frames }) => {
  const state = () => [...document.querySelectorAll<HTMLElement>(selector)].map(el => el.innerText).join('\u0001');
  const frame = () => new Promise(r => requestAnimationFrame(r));
  let last = state(), still = 0;
  for (let i = 0; i < 2000 && still < frames; i++) { await frame(); const now = state(); still = now === last ? still + 1 : 0; last = now; }
  if (still < frames) throw new Error(`text still changing: ${selector}`);
}, { selector, frames });

/** The given locators' boxes, read in one step so nothing can move between the reads. */
export const boxesNow = async (...locators: Locator[]) => {
  const handles = await Promise.all(locators.map(l => l.elementHandle()));
  return locators[0].page().evaluate((els) => els.map(el => { const r = el!.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }), handles);
};

/** Lets `n` animation frames pass: for a check that something did NOT happen after an action that would do it on the
 *  next frame (a scroll jump, a re-layout). Counted in frames, not milliseconds, so a slow machine waits as long. */
export const frames = (page: Page, n = 2) => page.evaluate(async (n) => { for (let i = 0; i < n; i++) await new Promise(r => requestAnimationFrame(r)); }, n);

/** The analysis panel has loaded its screen (the lazy screen's "Loading…" is gone) and its text has stopped changing. */
export const panelSettled = async (page: Page) => {
  await expect(page.locator('#analysis-panel > p.muted[role=status]')).toHaveCount(0);
  await waitForStillText(page, '#analysis-panel');
};
