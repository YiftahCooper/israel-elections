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
});
