import { useLayoutEffect, useMemo, useRef, useState } from 'react';

/** Keep phrases whole; only a saved reference's name may ellipsise. Measuring
 * text retains intrinsic width so expanding the container restores fuller copy. */
export function FittingLabel({ full, short, reference, locale = 'en-GB' }: {
  full: string; short: string; reference?: { prefix: string; name: string }; locale?: string;
}) {
  const label = useRef<HTMLElement>(null), measure = useRef<HTMLSpanElement>(null);
  const shortMeasure = useRef<HTMLSpanElement>(null), referenceMeasure = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<'full' | 'reference' | 'short'>('full');
  const first = useMemo(() => reference
    ? new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(reference.name.replace(/^[\s\p{Cf}]*/u, '')).containing(0)?.segment ?? ''
    : '', [locale, reference?.name]);
  useLayoutEffect(() => {
    const box = label.current, text = measure.current, shortText = shortMeasure.current, minimumReference = referenceMeasure.current;
    if (!box || !text || !shortText || !minimumReference) return;
    const fit = () => {
      box.style.minInlineSize = `${shortText.getBoundingClientRect().width}px`;
      const available = box.getBoundingClientRect().width;
      setMode(text.getBoundingClientRect().width <= available ? 'full'
        : reference && minimumReference.getBoundingClientRect().width <= available ? 'reference' : 'short');
    };
    fit();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    for (const el of [box, text, shortText, minimumReference]) observer?.observe(el);
    addEventListener('resize', fit);
    return () => { observer?.disconnect(); removeEventListener('resize', fit); };
  }, [full, short, reference?.prefix, reference?.name, first]);
  return <b ref={label} className="fit-label" title={full} data-compact={mode !== 'full'} data-mode={mode}>
    <span ref={measure} className="fit-label-measure" aria-hidden="true">{full}</span>
    <span ref={shortMeasure} className="fit-label-short-measure" aria-hidden="true">{short}</span>
    <span ref={referenceMeasure} className="fit-label-reference-measure" aria-hidden="true">{reference ? `${reference.prefix}${first}…` : ''}</span>
    <span className="fit-label-text" data-reference={mode === 'reference'}>{mode === 'full' ? full
      : mode === 'reference' && reference ? <><span className="fit-label-prefix">{reference.prefix}</span><bdi className="fit-label-name" dir="auto">{reference.name}</bdi></>
      : short}</span>
  </b>;
}
