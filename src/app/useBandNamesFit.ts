// A bloc's name is never cut short in a bloc strip (fault reported 16 Nov: «רשימות ע…»). Each band's name may wrap onto
// two lines; when any band is still too narrow for its whole name (a word wider than the band, or a third line), every
// name moves to the key beneath the strip, as on a phone. All or nothing, so a strip never mixes the two ways of naming.
// Band widths depend only on seats (flex-basis 0), never on the labels, so the choice cannot feed back into the widths.
import { useLayoutEffect, useRef, useState } from 'react';

const MAX_NAME_LINES = 2;

/** whether every band's label in the strip fits whole; the labels are measured even while hidden (see styles.css) */
export function bandNamesFit(strip: HTMLElement): boolean {
  for (const label of strip.querySelectorAll<HTMLElement>('.corridor .label')) {
    if (label.scrollWidth > label.clientWidth + 1) return false;
    const name = label.querySelector<HTMLElement>('.clip');
    if (!name) continue;
    const lines = new Set([...name.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top)));
    if (lines.size > MAX_NAME_LINES) return false;
  }
  return true;
}

/** a callback ref for the strip, and whether its names fit inside their bands (false: they go in the key beneath) */
export function useBandNamesFit() {
  const [strip, setStrip] = useState<HTMLElement | null>(null);
  const [fit, setFit] = useState(true);
  const observer = useRef<ResizeObserver | null>(null);
  // measured after every render (names, seats and language change the answer) and whenever the strip or a band is
  // resized (a band's width eases to its new seats after the render)
  useLayoutEffect(() => {
    if (!strip) return;
    setFit(bandNamesFit(strip));
    strip.querySelectorAll('.corridor').forEach(band => observer.current?.observe(band));
  });
  useLayoutEffect(() => {
    if (!strip) return;
    const measure = () => setFit(bandNamesFit(strip));
    const ro = observer.current = new ResizeObserver(measure);
    ro.observe(strip);
    strip.querySelectorAll('.corridor').forEach(band => ro.observe(band));
    let live = true;
    document.fonts?.ready.then(() => { if (live) measure(); });
    return () => { live = false; ro.disconnect(); observer.current = null; };
  }, [strip]);
  return [setStrip, fit] as const;
}
