import { useActiveReference } from '../useActiveReference.ts';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { changeText, ChangeValue } from '../changeValue.tsx';
import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, editPathLabel, differsFromReference, type EditPath } from '../derive.ts';
import { useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
export function EditMarker({ s, path }: { s: Scenario; path: EditPath }) {
  const L = useL(), lang = useLang(), id = useId();
  const { reference } = useActiveReference();
  const ds = useStore(st => st.datasets[s.electionId]);
  const base = reference ?? (ds ? baselineOf(ds) : null);
  const anchor = useRef<HTMLSpanElement>(null), tooltip = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false), [position, setPosition] = useState({ left: 8, top: 8 });
  useLayoutEffect(() => {
    if (!open || !anchor.current || !tooltip.current) return;
    const a = anchor.current.getBoundingClientRect(), t = tooltip.current.getBoundingClientRect();
    setPosition({ left: Math.max(8, Math.min(a.left, innerWidth - t.width - 8)),
      top: Math.max(8, Math.min(a.bottom + 4, innerHeight - t.height - 8)) });
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [open, lang]);
  if (!base || !differsFromReference(s, base, path)) return null;
  const context = editPathLabel(s, path[0] === 'agreements' && path.length === 2 ? ['agreements'] : path, lang, base);
  const label = context + ' · ' + L('Edited: was ', 'נערך: קודם ') + changeText(base, path, lang);
  return <span ref={anchor} className="edit-marker" tabIndex={0} aria-label={label} aria-describedby={open ? id : undefined}
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
    onKeyDown={e => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}>◇
    {open && createPortal(<span ref={tooltip} id={id} role="tooltip" className="edit-tooltip" style={position}>
      {context} · {L('Edited: was ', 'נערך: קודם ')}<ChangeValue s={base} path={path} lang={lang} />
    </span>, document.body)}
  </span>;
}
