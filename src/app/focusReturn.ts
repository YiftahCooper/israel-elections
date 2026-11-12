import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

// Keyboard focus around panels, sheets and popups (WCAG 2.4.3): opening one moves focus into it, closing it gives
// focus back to the control that opened it, and leaving a popup by Tab continues in the page's order.

const CANDIDATES = 'a[href], button, input, select, textarea, summary, [tabindex]';
/** Every control Tab can reach, in the page's order. */
export function tabbables(root: ParentNode = document): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(CANDIDATES)].filter(e => e.tabIndex >= 0 && !(e as HTMLButtonElement).disabled
    && !e.closest('[inert]') && e.getClientRects().length > 0);
}

/** Focus the first control after `node` (and outside it and `skip`) in the page's order, as Tab from `node` would. */
export function focusAfter(node: Node, skip?: Node | null): boolean {
  const next = tabbables().find(e => !node.contains(e) && !skip?.contains(e) && !!(node.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
  next?.focus();
  return !!next;
}

/** Focus was lost (its element closed with the popup around it). */
const focusLost = () => { const a = document.activeElement; return !a || a === document.body || !a.isConnected; };

/** Give focus back to `opener` (or `fallback()` when it has gone) if closing left focus nowhere. */
export function restoreFocus(opener: HTMLElement | null | undefined, fallback?: () => HTMLElement | null | undefined) {
  if (!focusLost()) return;
  (opener?.isConnected ? opener : fallback?.())?.focus({ preventScroll: true });
}

/** The control focus is on now, to give it back later. */
export const currentFocus = () => { const a = document.activeElement; return a instanceof HTMLElement && a !== document.body ? a : null; };

/** A panel beside the page (not modal): when it opens, or shows another item, from the keyboard (or from nowhere),
 *  focus goes to its heading, so it is the next thing read and Tab continues inside it; a mouse opening leaves focus
 *  where it is. When it closes and focus was inside it, focus goes back to the control that opened it. */
export function usePanelFocus(ref: RefObject<HTMLElement | null>, item: unknown, fallback?: () => HTMLElement | null | undefined) {
  const opener = useRef<HTMLElement | null>(null);
  const back = useRef(fallback);
  back.current = fallback;
  useEffect(() => {
    const panel = ref.current, from = currentFocus();
    if (!panel || (from && panel.contains(from))) return;
    opener.current = from;
    if (!from || from.matches(':focus-visible')) panel.querySelector<HTMLElement>('[data-panel-heading]')?.focus({ preventScroll: true });
  }, [ref, item]);
  useEffect(() => () => restoreFocus(opener.current, () => back.current?.()), []);
}

/** A modal sheet shown with showModal() and closed by leaving the page: focus goes back to its opener (the browser's
 *  own return finds nothing once the dialog has been removed). Call in the effect that opens it. */
export function openModal(d: HTMLDialogElement | null): () => void {
  const opener = currentFocus();
  if (d && !d.open) d.showModal();
  return () => { if (d?.open) d.close(); restoreFocus(opener); };
}

/** A popup that is not modal closes when focus moves outside it (by Tab or any other way), so it never covers the
 *  control that now has focus (WCAG 2.4.11). `inside` names what counts as part of it (its own toggle, say); a dialog
 *  opened from it (Save as…, a confirmation) keeps it open. */
export function useCloseOnFocusAway(open: boolean, inside: (t: Element) => boolean, close: () => void) {
  const latest = useRef({ inside, close });
  latest.current = { inside, close };
  // attached as the popup opens, before a quick Tab can leave it
  useLayoutEffect(() => {
    if (!open) return;
    const onFocus = (e: FocusEvent) => { const t = e.target; if (t instanceof Element && !t.closest('dialog') && !latest.current.inside(t)) latest.current.close(); };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, [open]);
}

/** A popup drawn beside its control but placed at the end of the page (a portal, so no panel clips it). Without help
 *  Tab would skip it, and Tab out of it would land at the end of the page. With this: Tab from the control goes into
 *  the popup, Tab from its last control continues after the control (and closes it), Shift+Tab from its first control
 *  goes back to the control, and closing it while focus is inside gives focus back to the control (or, if the control
 *  has gone, the control around it, such as the row it was in). */
export function usePopupTabOrder(open: boolean, control: () => HTMLElement | null | undefined, popupId: string, close: () => void) {
  const latest = useRef({ control, close });
  latest.current = { control, close };
  useEffect(() => {
    if (!open) return;
    const host = latest.current.control()?.parentElement?.closest<HTMLElement>(CANDIDATES);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.defaultPrevented) return;
      const c = latest.current.control(), pop = document.getElementById(popupId);
      if (!c || !pop) return;
      const items = tabbables(pop), t = e.target;
      if (!e.shiftKey && t === c && items.length) { e.preventDefault(); items[0].focus(); }
      else if (!e.shiftKey && t === items.at(-1)) { e.preventDefault(); latest.current.close(); focusAfter(c, pop); }
      else if (e.shiftKey && t === items[0]) { e.preventDefault(); c.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); restoreFocus(latest.current.control(), () => host); };
  }, [open, popupId]);
}
