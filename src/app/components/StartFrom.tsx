import {EditMarker} from './EditMarker.tsx';
import { applyAction } from '../../model/actions.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';
import { ruleEraLabel } from '../changeValue.tsx';
import type { Scenario } from '../../model/scenario.ts';
import { PARTS, partSnapshot, type Part } from '../../model/parts.ts';
import { RULESETS } from '../../engine/rules.ts';
import { dispatch, replay, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
export function StartFrom({ s, part, listId }: { s: Scenario; part: Part; listId?: string }) {
  const L = useL(), lang = useLang();
  const saved = useStore(st => st.saved);
  const ds = useStore(st => st.datasets[s.electionId]);
  const blank = () => {
    const name = part === 'blocs' ? prompt(L('Grouping name', 'שם החלוקה'))?.trim() : undefined;
    if (part === 'blocs' && !name) return;
    dispatch({ type: 'startPart', part, listId, source: 'blank', name });
  };
  return <div className="row start-from">
    <EditMarker s={s} path={['parts',part,...(listId?[listId]:[])]} />
    <ChoicePicker label={`${L('Replace', 'החלפת')}: ${PARTS[part][lang]}`} placeholder={`${L('Replace', 'החלפת')}: ${PARTS[part][lang]}…`} value="" onChange={v => {
      if (v === 'blank') blank();
      else if (v === 'official') dispatch({ type: 'startPart', part, listId, source: 'official' });
      else if (v.startsWith('preset:')) dispatch({ type: 'startPart', part, listId, source: 'preset', presetId: v.slice(7) });
      else {
        const entry = saved.find(x => x.id === v);
        if (entry && ds) dispatch({ type: 'startPart', part, listId, source: 'saved', name: entry.name, snapshot: partSnapshot(replay(ds, entry.name, entry.log).scenario, part) });
      }
    }} options={[
      { value: 'official', label: L('Restore official result', 'שחזור התוצאה הרשמית') },
      ...(part === 'blocs' ? (s.blocSchemes ?? []).map(g => ({ value: `preset:${g.id}`, label: lang === 'he' ? g.nameHe : g.nameEn, preview: <ResultPreview s={applyAction(s, { type: 'applyBlocScheme', schemeId: g.id })} /> })) : []),
      ...(part === 'rules' ? Object.values(RULESETS).map(r => ({ value: `preset:${r.id}`, label: ruleEraLabel(r, lang) })) : []),
      ...saved.filter(x => x.electionId === s.electionId).map(x => ({ value: x.id, label: x.name, detail: L('Saved scenario', 'תרחיש שמור'), preview: ds ? <ResultPreview s={replay(ds, x.name, x.log).scenario} /> : undefined })),
      ...(PARTS[part].blank ? [{ value: 'blank', label: L('Clear this section', 'ניקוי הסעיף') }] : [])
    ]}><p className="small ink2">{listId ? L('This list only', 'רשימה זו בלבד') : part === 'votes' ? L('Votes for every list', 'הקולות של כל הרשימות') : L('Replaces this entire section', 'החלפת הסעיף כולו')}</p></ChoicePicker>
    {part === 'blocs' && <button className="btn small" aria-label={L('New grouping', 'חלוקה חדשה')} onClick={blank}>+</button>}
  </div>;
}
