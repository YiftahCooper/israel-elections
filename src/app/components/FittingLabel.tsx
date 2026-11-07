import { useLayoutEffect, useRef, useState } from 'react';

/** Keep complete phrases: measure the full text against its actual allocated space.
 * The invisible measuring text retains intrinsic width, so shortening cannot lock
 * the label in compact mode when its container grows again. */
export function FittingLabel({ full, short }: { full: string; short: string }) {
  const label = useRef<HTMLElement>(null), measure = useRef<HTMLSpanElement>(null), shortMeasure = useRef<HTMLSpanElement>(null);
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const box = label.current, text = measure.current, shortText = shortMeasure.current;
    if (!box || !text || !shortText) return;
    const fit = () => {
      // Even a large count stays whole if its short form exceeds the usual label share.
      box.style.minInlineSize = `${shortText.getBoundingClientRect().width}px`;
      setCompact(text.getBoundingClientRect().width > box.getBoundingClientRect().width + 0.25);
    };
    fit();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    observer?.observe(box); observer?.observe(text); observer?.observe(shortText);
    addEventListener('resize', fit);
    return () => { observer?.disconnect(); removeEventListener('resize', fit); };
  }, [full, short]);
  return <b ref={label} className="fit-label" title={full} data-compact={compact}>
    <span ref={measure} className="fit-label-measure" aria-hidden="true">{full}</span>
    <span ref={shortMeasure} className="fit-label-short-measure" aria-hidden="true">{short}</span>
    <span className="fit-label-text">{compact ? short : full}</span>
  </b>;
}
