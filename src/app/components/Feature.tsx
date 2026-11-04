import { Seg } from './ui.tsx';
import { useEffect, useState, type ReactNode } from 'react';
import { FEATURES, FEATURE_PREVIEWS, LEVEL_LABELS, PRESETS, type FeatureId, type Visibility } from '../features.ts';
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
  return <div className="feature-disclosure">
    <button className="btn small ghost" aria-expanded={open} onClick={() => setOpen(!open)}>{L('More options', 'אפשרויות נוספות')}: {L(f[2], f[3])}</button>
    {open && <><button className="btn small" onClick={() => keepFeature(id)}>{L('Keep this visible', 'להשאיר גלוי')}</button>{children}</>}
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
        {id === 'board' ? <span className="small muted">{L('Always shown', 'תמיד גלוי')}</span> : <Seg<Visibility> label={L(en,he)} value={custom?.[id] ?? PRESETS[level][id]} onChange={v => keepFeature(id, v)}
          options={[{v:'show',label:L('Show','גלוי')},{v:'collapsed',label:L('Collapsed','מכווץ')},{v:'hidden',label:L('Hidden','מוסתר')}]} />}
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
  const shown = visibility === 'show' || open;
  const control = visibility === 'show' ? null : <div className="feature-disclosure">
    <button className="btn small ghost" aria-expanded={open} onClick={() => setOpen(!open)}>{L('More options', 'אפשרויות נוספות')}: {L(f[2],f[3])}</button>
    {open && <button className="btn small" onClick={() => keepFeature(id)}>{L('Keep this visible', 'להשאיר גלוי')}</button>}
  </div>;
  return { shown, control };
}
