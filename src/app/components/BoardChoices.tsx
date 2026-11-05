import { applyAction } from '../../model/actions.ts';
import { partSnapshot } from '../../model/parts.ts';
import type { Scenario } from '../../model/scenario.ts';
import { dispatch, replay, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';
export function BoardChoices({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang();
  const saved = useStore(st => st.saved), ds = useStore(st => st.datasets[s.electionId]);
  return <div className="row board-choices">
    <ChoicePicker label={L('Grouping', 'חלוקה לגושים')} value={s.blocSchemeId ?? '__custom'} options={[
      ...(s.blocSchemeId === null ? [{ value: '__custom', label: s.customGroupingName ?? L('Your grouping', 'החלוקה שלכם'), preview: <ResultPreview s={s} /> }] : []),
      // a government's date is the option's detail, so the picker shows the whole name on a phone
      ...(s.blocSchemes ?? []).map(g => ({ value: g.id, label: lang === 'he' ? g.nameHe : g.nameEn, detail: g.kind === 'government' && g.date ? new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(g.date)) : undefined, preview: <ResultPreview s={applyAction(s, { type: 'applyBlocScheme', schemeId: g.id })} /> })),
      ...saved.filter(x => x.electionId === s.electionId).map(x => ({ value: `saved:${x.id}`, label: x.name, detail: L('Saved grouping', 'חלוקה שמורה'), preview: ds ? <ResultPreview s={replay(ds, x.name, x.log, x.factionSplitBaseline ?? false).scenario} /> : undefined }))
    ]} onChange={value => { if (value === '__custom') return; const entry = saved.find(x => `saved:${x.id}` === value); if (entry && ds) dispatch({ type: 'startPart', part: 'blocs', source: 'saved', name: entry.name, snapshot: partSnapshot(replay(ds, entry.name, entry.log, entry.factionSplitBaseline ?? false).scenario, 'blocs') }); else dispatch({ type: 'applyBlocScheme', schemeId: value }); }} />
  </div>;
}
