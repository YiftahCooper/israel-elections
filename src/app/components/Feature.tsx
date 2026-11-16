import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { FEATURES, type FeatureId } from '../features.ts';
import { keepFeature, useFeature, useStore } from '../store.ts';
import { useL } from '../i18n.ts';
export function Feature({ id, children }: { id: FeatureId; children: ReactNode }) {
  const visibility = useFeature(id), L = useL();
  const [open, setOpen] = useState(false);
  const level = useStore(st => st.level);
  useEffect(() => { setOpen(false); }, [level]);
  useEffect(() => { if (visibility === 'show') setOpen(false); }, [visibility]);
  const f = FEATURES.find(f => f[0] === id)!;
  if (visibility === 'show') return <>{children}</>;
  // Hidden leaves nothing to open (Collapsed keeps the disclosure); the settings behind it keep working
  if (visibility === 'hidden') return null;
  return <div className="feature-disclosure">
    <DisclosureToggles id={id} open={open} onToggle={() => setOpen(!open)} label={L(f[2], f[3])} />
    {open && children}
  </div>;
}
/** For sections interleaved with a drawing or read-only list, disclose the controls once. */
export function useDisclosure(id: FeatureId) {
  const visibility = useFeature(id), L = useL();
  const [open, setOpen] = useState(false);
  const level = useStore(st => st.level);
  useEffect(() => { setOpen(false); }, [level]);
  useEffect(() => { if (visibility === 'show') setOpen(false); }, [visibility]);
  const f = FEATURES.find(f => f[0] === id)!;
  const shown = visibility === 'show' || (visibility === 'collapsed' && open);
  const control = visibility !== 'collapsed' ? null : <div className="feature-disclosure">
    <DisclosureToggles id={id} open={open} onToggle={() => setOpen(!open)} label={L(f[2], f[3])} />
  </div>;
  return { shown, control };
}

/** The one look of a collapsed feature, everywhere: a quiet dashed chip naming what it opens, with a chevron; once open,
 *  "Keep this visible" beside it. The full "More options: …" wording stays in its accessible name. */
function DisclosureToggles({ id, open, onToggle, label }: { id: FeatureId; open: boolean; onToggle: () => void; label: string }) {
  const L = useL();
  return <div className="feature-toggles">
    <button type="button" className="disclosure-toggle" aria-expanded={open} aria-label={`${L('More options', 'אפשרויות נוספות')}: ${label}`} onClick={onToggle}>
      {open ? <ChevronUp className="icon sm" aria-hidden /> : <ChevronDown className="icon sm" aria-hidden />}<span>{label}</span>
    </button>
    {open && <button type="button" className="btn small ghost" onClick={() => keepFeature(id)}>{L('Keep this visible', 'להשאיר גלוי')}</button>}
  </div>;
}
