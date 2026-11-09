import { useEffect, useRef } from 'react';

/** Hover intent for every popup that opens when a mouse rests on something: the (i) explanations, seat details,
 *  chart values, exact percentages and edit markers (owner, 9 Nov 2026). One shared timing, the common one in
 *  design systems (Radix, MUI, GitHub Primer use 300–700 ms to open and 100–300 ms to close):
 *  - a box opens after the pointer has rested HOVER_OPEN_DELAY ms, so sweeping the mouse across the page opens nothing;
 *  - leaving starts a HOVER_CLOSE_GRACE ms grace, so the pointer can cross the gap into the box (to scroll or click);
 *  - while a box is open, or within HOVER_SKIP_WINDOW ms of one closing, the next opens at once and replaces it.
 *  Click, tap and keyboard never wait: callers open those directly. */
export const HOVER_OPEN_DELAY = 300;
export const HOVER_CLOSE_GRACE = 200;
export const HOVER_SKIP_WINDOW = 300;

export interface HoverClock { now(): number; set(fn: () => void, ms: number): unknown; clear(handle: unknown): void }
const realClock: HoverClock = { now: () => performance.now(), set: (fn, ms) => setTimeout(fn, ms), clear: h => clearTimeout(h as ReturnType<typeof setTimeout>) };

/** The one box shown by hover, across the whole page (module state: one pointer, one hover box at a time). */
let shown: HoverIntent | null = null;
let lastClosed = -Infinity;

export class HoverIntent {
  private openTimer: unknown = null;
  private closeTimer: unknown = null;
  private pending: (() => void) | null = null;
  constructor(private readonly hide: () => void, private readonly clock: HoverClock = realClock) {}
  get isShown() { return shown === this; }
  /** The pointer rests on a trigger; `show` opens (or updates) the box. Repeated calls (a pointer moving over a
   *  chart) update an open box at once and only refresh what a pending one will show. */
  enter(show: () => void) {
    this.stopClose();
    if (shown === this) { show(); return; }
    if (shown || this.clock.now() - lastClosed < HOVER_SKIP_WINDOW) { this.open(show); return; }
    this.pending = show;
    if (this.openTimer === null) this.openTimer = this.clock.set(() => { this.openTimer = null; const run = this.pending; this.pending = null; if (run) this.open(run); }, HOVER_OPEN_DELAY);
  }
  /** The pointer left the trigger or the box: a pending open is dropped; an open box closes after the grace. */
  leave = () => {
    this.stopOpen();
    if (shown === this && this.closeTimer === null) this.closeTimer = this.clock.set(() => { this.closeTimer = null; this.close(); }, HOVER_CLOSE_GRACE);
  }
  /** The pointer reached the box itself: keep it open. */
  keep = () => { this.stopClose(); };
  /** Close now (another box replaced it). */
  close() {
    this.stopOpen(); this.stopClose();
    if (shown !== this) return;
    shown = null; lastClosed = this.clock.now();
    this.hide();
  }
  /** The box was closed some other way (Escape, a press outside, a click): forget it without calling hide. */
  closed() {
    this.stopOpen(); this.stopClose();
    if (shown === this) { shown = null; lastClosed = this.clock.now(); }
  }
  dispose() { this.closed(); }
  private open(show: () => void) {
    if (shown && shown !== this) shown.close();
    shown = this;
    show();
  }
  private stopOpen() { if (this.openTimer !== null) { this.clock.clear(this.openTimer); this.openTimer = null; } this.pending = null; }
  private stopClose() { if (this.closeTimer !== null) { this.clock.clear(this.closeTimer); this.closeTimer = null; } }
}

/** For tests: forget the page-wide state. */
export function resetHoverIntent() { shown = null; lastClosed = -Infinity; }

/** A component's hover intent. `hide` closes its hover-opened box; `open` tells it whether the box is open by any
 *  means, so a box closed by Escape, a click or a press outside does not keep the next one "warm". */
export function useHoverIntent(hide: () => void, open: boolean): HoverIntent {
  const latest = useRef(hide);
  latest.current = hide;
  const ref = useRef<HoverIntent | null>(null);
  if (!ref.current) ref.current = new HoverIntent(() => latest.current());
  const intent = ref.current;
  useEffect(() => { if (!open) intent.closed(); }, [open, intent]);
  useEffect(() => () => intent.dispose(), [intent]);
  return intent;
}
