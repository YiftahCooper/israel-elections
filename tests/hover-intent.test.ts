import { beforeEach, describe, expect, test } from 'vitest';
import { HOVER_CLOSE_GRACE, HOVER_OPEN_DELAY, HOVER_SKIP_WINDOW, HoverIntent, resetHoverIntent, type HoverClock } from '../src/app/hoverIntent.ts';

/** A hand-driven clock: timers fire only when time is advanced. */
function fakeClock() {
  let t = 0, id = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const clock: HoverClock = {
    now: () => t,
    set: (fn, ms) => { timers.set(++id, { at: t + ms, fn }); return id; },
    clear: h => { timers.delete(h as number); },
  };
  const advance = (ms: number) => {
    const end = t + ms;
    for (;;) {
      const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      t = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    t = end;
  };
  return { clock, advance };
}
function box(clock: HoverClock) {
  const state = { open: false, shows: 0 };
  const intent = new HoverIntent(() => { state.open = false; }, clock);
  return { state, intent, enter: () => intent.enter(() => { state.open = true; state.shows++; }) };
}

describe('hover intent (owner, 9 Nov 2026)', () => {
  beforeEach(() => resetHoverIntent());
  test('the timings are the standard ones', () => {
    expect(HOVER_OPEN_DELAY).toBe(300);
    expect(HOVER_CLOSE_GRACE).toBeGreaterThanOrEqual(150);
    expect(HOVER_CLOSE_GRACE).toBeLessThanOrEqual(300);
  });
  test('opens only after the pointer rests for the delay', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter();
    advance(HOVER_OPEN_DELAY - 1);
    expect(a.state.open).toBe(false);
    advance(1);
    expect(a.state.open).toBe(true);
  });
  test('sweeping across a trigger opens nothing', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(150); a.intent.leave(); advance(1000);
    expect(a.state.open).toBe(false);
  });
  test('leaving keeps the box for the grace, so the pointer can reach it; reaching it keeps it open', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.leave(); advance(HOVER_CLOSE_GRACE - 1);
    expect(a.state.open).toBe(true);
    a.intent.keep(); advance(2000);
    expect(a.state.open).toBe(true);
    a.intent.leave(); advance(HOVER_CLOSE_GRACE);
    expect(a.state.open).toBe(false);
  });
  test('with one box open, the next opens at once and replaces it', () => {
    const { clock, advance } = fakeClock(), a = box(clock), b = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.leave(); advance(50);
    b.enter();
    expect(b.state.open).toBe(true);
    expect(a.state.open).toBe(false);
  });
  test('shortly after a box closed, the next still opens at once; later it waits again', () => {
    const { clock, advance } = fakeClock(), a = box(clock), b = box(clock), c = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY); a.intent.leave(); advance(HOVER_CLOSE_GRACE);
    expect(a.state.open).toBe(false);
    advance(HOVER_SKIP_WINDOW - 10); b.enter();
    expect(b.state.open).toBe(true);
    b.intent.leave(); advance(HOVER_CLOSE_GRACE + HOVER_SKIP_WINDOW + 1);
    c.enter();
    expect(c.state.open).toBe(false);
    advance(HOVER_OPEN_DELAY);
    expect(c.state.open).toBe(true);
  });
  test('a pointer moving over a chart updates an open box at once and shows only its latest place when it opens', () => {
    const { clock, advance } = fakeClock();
    let at = '';
    const intent = new HoverIntent(() => { at = ''; }, clock);
    intent.enter(() => { at = 'A'; }); advance(100);
    intent.enter(() => { at = 'B'; }); advance(HOVER_OPEN_DELAY - 100);
    expect(at).toBe('B');
    intent.enter(() => { at = 'C'; });
    expect(at).toBe('C');
  });
  test('a box closed another way (Escape, click) does not keep the next one warm for long', () => {
    const { clock, advance } = fakeClock(), a = box(clock), b = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.state.open = false; a.intent.closed();
    advance(HOVER_SKIP_WINDOW + 1); b.enter();
    expect(b.state.open).toBe(false);
  });
  // T1, 19 Nov 2026: React runs the "closed" effect of the render that removed a box a moment after that render. A
  // request the pointer made in between (it reached the next trigger first, likely on a slow machine) must stand.
  test('a late "closed" from the render that removed a box does not cancel a request made after that render', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.leave(); advance(HOVER_CLOSE_GRACE); // closes by itself
    expect(a.state.open).toBe(false);
    const stamp = a.intent.stamp; // the render that removed it
    advance(HOVER_SKIP_WINDOW + 1);
    a.enter(); // the next trigger, before that render's effects: waits for the rest delay
    a.intent.closed(stamp); // the effect, late
    advance(HOVER_OPEN_DELAY);
    expect(a.state.open).toBe(true);
  });
  test('nor when the next trigger was entered before that render (the render then already counts the request)', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.leave(); advance(HOVER_CLOSE_GRACE);
    advance(HOVER_SKIP_WINDOW + 1);
    a.enter(); // waits for the rest delay
    const stamp = a.intent.stamp; // the render that removed the old box comes only now
    a.intent.closed(stamp);
    advance(HOVER_OPEN_DELAY);
    expect(a.state.open).toBe(true);
  });
  test('a late "closed" does not make the intent forget a box opened at once after that render', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.leave(); advance(HOVER_CLOSE_GRACE);
    const stamp = a.intent.stamp;
    a.enter(); // within the "next opens at once" window
    expect(a.state.open).toBe(true);
    a.intent.closed(stamp);
    expect(a.intent.isShown).toBe(true);
    a.intent.leave(); advance(HOVER_CLOSE_GRACE); // so leaving still closes it
    expect(a.state.open).toBe(false);
  });
  test('a "closed" with no newer request still forgets the box (Escape, a click)', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    const stamp = a.intent.stamp;
    a.state.open = false; a.intent.closed(stamp);
    expect(a.intent.isShown).toBe(false);
  });
  // T1, 20 Nov 2026: the browser sends pointer events before mouse events. Moving from a trigger that listens to
  // mouseleave straight into its box (which listens to pointerenter), the box hears "entered" before the trigger hears
  // "left"; the box must stay open, and close only when the pointer leaves the box itself.
  test('moving straight from the trigger into the box keeps it open, whatever order the events come in', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.enterBox(); // the box's pointerenter
    a.intent.leave(); // the trigger's mouseleave, after it
    advance(HOVER_CLOSE_GRACE * 3);
    expect(a.state.open).toBe(true);
    a.intent.leaveBox();
    advance(HOVER_CLOSE_GRACE);
    expect(a.state.open).toBe(false);
  });
  test('a click on the trigger (keep) does not count as the pointer being in the box', () => {
    const { clock, advance } = fakeClock(), a = box(clock);
    a.enter(); advance(HOVER_OPEN_DELAY);
    a.intent.keep();
    a.intent.leave();
    advance(HOVER_CLOSE_GRACE);
    expect(a.state.open).toBe(false);
  });
});
