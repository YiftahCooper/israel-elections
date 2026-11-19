// Hover timing measured in the page (T1, 19 Nov 2026).
//
// The hover boxes open after the pointer has rested 300 ms, close 200 ms after it leaves, and open at once on a click,
// on focus, or while another is open (src/app/hoverIntent.ts; its logic is unit-tested with a fake clock). Checked from
// the test runner with fixed waits and 100–200 ms timeouts, these depend on how fast the machine is: on a slow CI
// runner "opens at once" can take longer than 200 ms to render, and a 60 ms wait can outlast a 200 ms grace. So the page
// itself records when the pointer moved, a click or focus happened, and when the box appeared, changed or went, with
// `performance.now()`, and the tests compare those times with the app's own constants.
import { HOVER_CLOSE_GRACE, HOVER_OPEN_DELAY, HOVER_SKIP_WINDOW } from '../../src/app/hoverIntent.ts';
import { expect, type Page } from './fixtures';

// a timer never fires early; this only absorbs rounding between the event's and the observer's clocks
const SLACK = 5;

interface Mark { t: number; what: 'pointermove' | 'pointerdown' | 'focusin' | 'shown' | 'changed' | 'gone' }

/** Starts recording in the page: the pointer's moves, clicks and focus, and when the first visible element matching
 *  `selector` appears, changes its text or goes. Call once per page. */
export const recordHover = (page: Page, selector: string) => page.evaluate((selector) => {
  const log: { t: number; what: string }[] = [];
  (window as unknown as { __hover: typeof log }).__hover = log;
  const box = () => [...document.querySelectorAll<HTMLElement>(selector)].find(el => el.getClientRects().length);
  let last = box()?.textContent ?? null;
  const look = () => {
    const now = box()?.textContent ?? null;
    if (now === last) return;
    log.push({ t: performance.now(), what: now === null ? 'gone' : last === null ? 'shown' : 'changed' });
    last = now;
  };
  new MutationObserver(look).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true });
  for (const type of ['pointermove', 'pointerdown', 'focusin']) document.addEventListener(type, () => log.push({ t: performance.now(), what: type }), { capture: true });
}, selector);

const marks = (page: Page) => page.evaluate(() => (window as unknown as { __hover: Mark[] }).__hover) as Promise<Mark[]>;
/** Forget what was recorded so far. */
export const clearHover = (page: Page) => page.evaluate(() => { (window as unknown as { __hover: Mark[] }).__hover.length = 0; });

/** Waits for the box to reach `what` and returns how long after the last pointer move, click or focus before it, or
 *  (`which: 'first'`) after the first one since the record was cleared: the rest delay runs from the moment the pointer
 *  entered the trigger, and moving on within it does not restart it. */
export const delayTo = async (page: Page, what: 'shown' | 'changed' | 'gone', cause: Mark['what'] = 'pointermove', which: 'first' | 'last' = 'last') => {
  await expect.poll(async () => (await marks(page)).some(m => m.what === what), { message: `the box is ${what}` }).toBe(true);
  const log = await marks(page), i = log.findIndex(m => m.what === what);
  const causes = log.slice(0, i).filter(m => m.what === cause);
  const before = which === 'first' ? causes[0] : causes.at(-1);
  expect(before, `a ${cause} before the box was ${what}`).toBeTruthy();
  return log[i].t - before!.t;
};

export const expectWaitedForRest = (ms: number) => expect(ms, 'opened only after the pointer rested').toBeGreaterThanOrEqual(HOVER_OPEN_DELAY - SLACK);
export const expectKeptForGrace = (ms: number) => expect(ms, 'stayed for the grace after the pointer left').toBeGreaterThanOrEqual(HOVER_CLOSE_GRACE - SLACK);
/** "At once": without the rest delay. However slow the machine, a render does not take the 300 ms the timer would. */
export const expectAtOnce = (ms: number) => expect(ms, 'opened at once, not after the rest delay').toBeLessThan(HOVER_OPEN_DELAY);

/** Nothing opened: waits, in the page's own time, until the rest delay has passed since the last pointer move, then
 *  checks the box never appeared. */
export const expectNothingOpens = async (page: Page) => {
  await page.waitForFunction((ms) => {
    const log = (window as unknown as { __hover: { t: number; what: string }[] }).__hover;
    const moved = log.filter(m => m.what === 'pointermove').at(-1)?.t ?? 0;
    return performance.now() - moved > ms;
  }, HOVER_OPEN_DELAY + 100);
  expect((await marks(page)).filter(m => m.what === 'shown')).toEqual([]);
};

/** Waits, in the page's own time, until the window in which a closed box lets the next open at once has passed. */
export const pastSkipWindow = (page: Page) => page.waitForFunction((ms) => {
  const log = (window as unknown as { __hover: { t: number; what: string }[] }).__hover;
  const gone = log.filter(m => m.what === 'gone').at(-1)?.t ?? 0;
  return performance.now() - gone > ms;
}, HOVER_SKIP_WINDOW + 50);
