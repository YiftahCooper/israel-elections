import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';

export type FloatingAnchor = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
/** Place floating content in viewport coordinates, preferring the side with enough room.
 * Top-layer rendering avoids clipping by a panel's scrolling body and never adds page height. */
export function positionFloating(el: HTMLElement, anchor: FloatingAnchor, preferAbove = false) {
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0;
  const width = viewport?.width ?? innerWidth, height = viewport?.height ?? innerHeight;
  const pad = 8, gap = 6;
  // Settings → Text size zooms the root: measurements are on screen, but lengths we set are scaled by the zoom
  const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1, px = (v: number) => `${v / z}px`;
  Object.assign(el.style, { position: 'fixed', inset: 'auto', margin: '0', transform: 'none',
    maxWidth: px(Math.max(0, width - pad * 2)), maxHeight: px(Math.max(0, height - pad * 2)), overflow: 'auto' });
  const box = el.getBoundingClientRect();
  el.style.visibility = anchor.bottom < top || anchor.top > top + height ? 'hidden' : 'visible';
  const below = top + height - pad - anchor.bottom - gap, above = anchor.top - top - pad - gap;
  const up = preferAbove ? above >= box.height || above > below : below < box.height && above > below;
  // Tall content scrolls on its chosen side instead of covering the trigger or header controls.
  el.style.maxHeight = px(Math.min(height - pad * 2, Math.max(80, up ? above : below)));
  const fitted = el.getBoundingClientRect();
  const rtl = getComputedStyle(el).direction === 'rtl';
  el.style.left = px(Math.max(left + pad, Math.min(rtl ? anchor.right - fitted.width : anchor.left, left + width - pad - fitted.width)));
  el.style.top = px(Math.max(top + pad, Math.min(up ? anchor.top - gap - fitted.height : anchor.bottom + gap, top + height - pad - fitted.height)));
}

export function useFloating(ref: RefObject<HTMLElement | null>, anchor: () => FloatingAnchor | null | undefined, open = true, managePopover = true, preferAbove = false) {
  const latestAnchor = useRef(anchor);
  latestAnchor.current = anchor;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    if (managePopover) { el.popover = 'manual'; if (!el.matches(':popover-open')) el.showPopover(); }
    const place = () => { const a = latestAnchor.current(); if (a) positionFloating(el, a, preferAbove); };
    place();
    const observer = new ResizeObserver(place); observer.observe(el);
    addEventListener('scroll', place, true); addEventListener('resize', place);
    visualViewport?.addEventListener('resize', place); visualViewport?.addEventListener('scroll', place);
    return () => {
      observer.disconnect(); removeEventListener('scroll', place, true); removeEventListener('resize', place);
      visualViewport?.removeEventListener('resize', place); visualViewport?.removeEventListener('scroll', place);
      if (managePopover && el.matches(':popover-open')) el.hidePopover();
    };
  }, [ref, open, managePopover, preferAbove]);
  useLayoutEffect(() => {
    const el = ref.current, a = latestAnchor.current();
    if (el && open && a) positionFloating(el, a, preferAbove);
  });
}

export function Floating({ anchor, className, id, children, preferAbove = false, onPointerEnter, onPointerLeave, role = 'tooltip', label }: { anchor: () => FloatingAnchor | null | undefined; className: string; id?: string; children: ReactNode; preferAbove?: boolean; onPointerEnter?: () => void; onPointerLeave?: () => void; role?: 'tooltip' | 'dialog'; label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useFloating(ref, anchor, true, true, preferAbove);
  return <span ref={ref} id={id} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} role={role} aria-label={label} className={className}>{children}</span>;
}
