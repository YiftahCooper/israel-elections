import { COMPLEXITY_LABEL, CUSTOM_LABEL, LEVEL_LABELS, ownChoices, type Preset } from '../features.ts';
import { useL } from '../i18n.ts';
import { setCustom, setLevel, setState, useStore } from '../store.ts';
import { Seg } from './ui.tsx';

type Choice = Preset | 'custom';
/** The complexity control (top bar, phone menu, Settings): Simple, Standard and Expert as they are, and Custom, the
 *  user's own, which is offered once the user has made a choice of their own (owner, 19 Nov 2026). Beside it, while
 *  there are choices, their count opens them in Settings (owner, 16 Nov 2026: one place to see and undo them). */
export function Complexity({ count = true, before }: { count?: boolean; before?: () => void }) {
  const L = useL();
  const level = useStore(st => st.level), custom = useStore(st => st.custom);
  const own = useStore(st => ownChoices(st.customFeatures, st.level).length);
  const value: Choice = custom && own ? 'custom' : level;
  const named = (['simple', 'standard', 'expert'] as const).map(v => ({ v: v as Choice, label: L(...LEVEL_LABELS[v]) }));
  const customTitle = L(`${LEVEL_LABELS[level][0]} and ${own === 1 ? 'one choice' : `${own} choices`} of your own`, `"${LEVEL_LABELS[level][1]}" ועוד ${own === 1 ? 'בחירה אחת' : `${own} בחירות`} שלכם`);
  const options = own ? [...named, { v: 'custom' as Choice, label: L(...CUSTOM_LABEL), title: customTitle }] : named;
  return <span className="band-levels complexity" data-custom={value === 'custom' ? '' : undefined}>
    <Seg<Choice> label={L(...COMPLEXITY_LABEL)} value={value} options={options} onChange={v => v === 'custom' ? setCustom() : setLevel(v)} />
    {count && own > 0 && <button type="button" className="btn small band-custom band-own" aria-haspopup="dialog"
      title={own === 1 ? L('Custom: one choice of your own. Open in Settings', 'מותאם אישית: בחירה אחת שלכם. פתיחה בהגדרות') : L(`Custom: ${own} choices of your own. Open in Settings`, `מותאם אישית: ${own} בחירות שלכם. פתיחה בהגדרות`)}
      aria-label={own === 1 ? L('Custom: one choice of your own', 'מותאם אישית: בחירה אחת שלכם') : L(`Custom: ${own} choices of your own`, `מותאם אישית: ${own} בחירות שלכם`)}
      onClick={() => { before?.(); setState({ settingsOpen: true, settingsFocus: 'own' }); }}><bdi dir="ltr">+{own}</bdi></button>}
  </span>;
}
