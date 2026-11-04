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
    <label className="row small">{L('Start from…', 'התחלה מתוך…')} <select aria-label={`${L('Start from', 'התחלה מתוך')}: ${PARTS[part][lang]}`} value="" onChange={e => {
      const v = e.target.value;
      if (v === 'blank') blank();
      else if (v === 'official') dispatch({ type: 'startPart', part, listId, source: 'official' });
      else if (v.startsWith('preset:')) dispatch({ type: 'startPart', part, listId, source: 'preset', presetId: v.slice(7) });
      else {
        const entry = saved.find(x => x.id === v);
        if (entry && ds) dispatch({ type: 'startPart', part, listId, source: 'saved', name: entry.name, snapshot: partSnapshot(replay(ds, entry.name, entry.log).scenario, part) });
      }
    }}><option value="">{L('Choose a starting point', 'בחירת נקודת מוצא')}</option>
      <option value="official">{L('Official result', 'התוצאה הרשמית')}</option>
      {part === 'blocs' && s.blocSchemes?.map(g => <option key={g.id} value={`preset:${g.id}`}>{lang === 'he' ? g.nameHe : g.nameEn}</option>)}
      {part === 'rules' && Object.values(RULESETS).map(r => <option key={r.id} value={`preset:${r.id}`}>{ruleEraLabel(r, lang)}</option>)}
      {saved.filter(x => x.electionId === s.electionId).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
      {PARTS[part].blank && <option value="blank">{L('Blank', 'ריק')}</option>}
    </select></label>
    {part === 'blocs' && <button className="btn small" aria-label={L('New grouping', 'חלוקה חדשה')} onClick={blank}>+</button>}
  </div>;
}
