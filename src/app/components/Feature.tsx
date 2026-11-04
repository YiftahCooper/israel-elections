import { useEffect, useState, type ReactNode } from 'react';
import { FEATURES, PRESETS, type FeatureId, type Visibility } from '../features.ts';
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
    <div className="row">{(['simple', 'standard', 'expert'] as const).map(p => <button key={p} className="btn" onClick={() => setState({ level: p, customFeatures: null })}>{L('Reset to ', 'איפוס ל־')}{L({simple:'Simple',standard:'Standard',expert:'Expert'}[p], {simple:'פשוט',standard:'רגיל',expert:'מומחה'}[p])}</button>)}</div>
    {(['Explore', 'Edit', 'Analyse'] as const).map(group => <section key={group}><h3>{L(group, { Explore: 'חקירה', Edit: 'עריכה', Analyse: 'ניתוח' }[group])}</h3>
      {FEATURES.filter(f => f[1] === group).map(([id,,en,he]) => <label key={id} className="custom-feature"><span>{L(en,he)}</span>
        <select aria-label={L(en,he)} value={custom?.[id] ?? PRESETS[level][id]} onChange={e => keepFeature(id, e.target.value as Visibility)}>
          <option value="show">{L('Show', 'גלוי')}</option><option value="collapsed">{L('Collapsed', 'מכווץ')}</option><option value="hidden">{L('Hidden', 'מוסתר')}</option>
        </select></label>)}</section>)}
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
