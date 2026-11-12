import { Seg } from './ui.tsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { FEATURES, FEATURE_PREVIEWS, LEVEL_LABELS, PRESETS, SHOW_OR_HIDE, type FeatureId, type Visibility } from '../features.ts';
import { keepFeature, setState, useFeature, useStore } from '../store.ts';
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
export function CustomPage() {
  const L = useL(), level = useStore(st => st.level);
  const custom = useStore(st => st.customFeatures);
  return <section className="panel custom-page" aria-label={L('Custom level', 'רמה מותאמת')}>
    <header><h2>{L('Custom level', 'רמה מותאמת')}</h2></header><div className="body">
    <div className="row custom-reset">{(['simple', 'standard', 'expert'] as const).map(p => <button key={p} className="btn" onClick={() => setState({ level: p, customFeatures: null })}>{L('Reset to ', 'איפוס ל־')}{L(...LEVEL_LABELS[p])}</button>)}</div>
    {(['Explore', 'Edit', 'Analyse'] as const).map(group => <section key={group}><h3>{L(group, { Explore: 'חקירה', Edit: 'עריכה', Analyse: 'ניתוח' }[group])}</h3>
      <div className="custom-grid">{FEATURES.filter(f => f[1] === group).map(([id,,en,he]) => <div key={id} className="custom-feature">
        <div><strong>{L(en,he)}</strong><p className="small muted">{L(...FEATURE_PREVIEWS[id])}</p></div>
        {/* the Overview is the home every tool returns to: it cannot be collapsed or hidden */}
        {id === 'board' ? <span className="small muted">{L('Always shown', 'תמיד גלוי')}</span> : (() => {
          // a feature with no folded form is shown or hidden; an older Collapsed choice for it shows it
          const twoWay = SHOW_OR_HIDE.includes(id), v = custom?.[id] ?? PRESETS[level][id];
          return <Seg<Visibility> label={L(en,he)} value={twoWay && v === 'collapsed' ? 'show' : v} onChange={v => keepFeature(id, v)}
            options={[{v:'show',label:L('Show','גלוי')}, ...(twoWay ? [] : [{v:'collapsed' as const,label:L('Collapsed','מכווץ')}]), {v:'hidden',label:L('Hidden','מוסתר')}]} />;
        })()}
      </div>)}</div></section>)}
    <p className="small muted">{L('Edit markers, scenario identity, exact/sampled qualifiers and publication/data warnings always remain visible.', 'סימוני עריכה, זהות התרחיש, סייגי דיוק ודגימה ואזהרות פרסום ונתונים תמיד גלויים.')}</p>
    </div></section>;
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
