import { useMemo } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { EditMarker } from './EditMarker.tsx';
import { ChoicePicker, type Choice } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';
import { applyAction } from '../../model/actions.ts';
import { ruleEraLabel } from '../changeValue.tsx';
import type { Scenario } from '../../model/scenario.ts';
import { startEffect, type StartAction } from '../../model/partEffect.ts';
import { PARTS, partSnapshot, type Part } from '../../model/parts.ts';
import { RULESETS } from '../../engine/rules.ts';
import { baseContext, dispatch, replay, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';

type Option = Choice & { action: StartAction };

/** Section reset/copy controls. Only choices that would change the section appear:
 * "Official …" when the section differs from the official result, "Copy from…" for sourced
 * presets and same-election saved scenarios whose section differs, and a named clear action. */
export function StartFrom({ s: shown, part, listId }: { s: Scenario; part: Part; listId?: string }) {
  const L = useL(), lang = useLang();
  // a drag or hover preview never adds or removes these buttons, so nothing moves under the pointer
  const committed = useStore(st => st.scenario), preview = useStore(st => st.preview);
  const s = shown === preview && committed ? committed : shown;
  const saved = useStore(st => st.saved);
  const ds = useStore(st => st.datasets[s.electionId]);
  const partName = lang === 'en' ? PARTS[part].en.toLocaleLowerCase() : PARTS[part].he;
  // the button names what comes back, so it reads correctly inside a list's panel too
  const officialLabel: Record<Part, [string, string]> = {
    votes: ['Official votes (all lists)', 'הקולות הרשמיים (כל הרשימות)'], identity: ['Official name and colour', 'השם והצבע הרשמיים'],
    structure: ['Official lists', 'הרשימות הרשמיות'], agreements: ['Official agreements', 'ההסכמים הרשמיים'], blocs: ['Default grouping', 'חלוקת ברירת המחדל'],
    coalitions: ['Official coalition', 'הקואליציה הרשמית'], candidates: ['Official roster', 'רשימת המועמדים הרשמית'], rules: ['Official rules', 'הכללים הרשמיים'], totals: ['Official turnout', 'שיעור ההצבעה הרשמי'],
  };
  const clearLabel: Partial<Record<Part, string>> = {
    agreements: L('Remove all agreements', 'ביטול כל ההסכמים'),
    coalitions: L('Clear the coalition', 'ניקוי הקואליציה'),
    candidates: L('Empty this roster', 'ריקון רשימת המועמדים'),
  };
  const { official, others } = useMemo(() => {
    const base = baseContext(ds).base;
    const official: StartAction = { type: 'startPart', part, listId, source: 'official' };
    const keep = (o: Option): Option | null => {
      const effect = startEffect(s, o.action, base);
      if (effect === 'same') return null;
      return effect === 'change' ? o : { ...o, disabled: true, detail: L('Not compatible with this scenario', 'לא מתאים לתרחיש זה') };
    };
    const presets: Option[] = part === 'blocs'
      ? (s.blocSchemes ?? []).map(g => ({ value: `preset:${g.id}`, label: lang === 'he' ? g.nameHe : g.nameEn, group: L('Sourced groupings', 'חלוקות ממקור מתועד'), preview: <ResultPreview s={applyAction(s, { type: 'applyBlocScheme', schemeId: g.id })} />, action: { type: 'startPart', part, source: 'preset', presetId: g.id } }))
      : part === 'rules' ? Object.values(RULESETS).map(r => ({ value: `preset:${r.id}`, label: ruleEraLabel(r, lang), group: L('Rules of an era', 'כללי תקופה'), action: { type: 'startPart', part, source: 'preset', presetId: r.id } })) : [];
    const fromSaved: Option[] = ds ? saved.filter(x => x.electionId === s.electionId).map(x => {
      const sc = replay(ds, x.name, x.log).scenario;
      return { value: x.id, label: x.name, group: L('Saved scenarios', 'תרחישים שמורים'), preview: <ResultPreview s={sc} />, action: { type: 'startPart', part, listId, source: 'saved', name: x.name, snapshot: partSnapshot(sc, part) } };
    }) : [];
    const clear: Option[] = clearLabel[part] ? [{ value: 'blank', label: clearLabel[part]!, action: { type: 'startPart', part, listId, source: 'blank' } }] : [];
    // where the official part is the blank one (no coalition choices), offer only the named clear action
    const blankIsOfficial = (() => { try { return !!clear.length && !!base && JSON.stringify(partSnapshot(base, part)) === JSON.stringify(partSnapshot(applyAction(s, clear[0].action, undefined, { base }), part)); } catch { return false; } })();
    return {
      official: ds && !blankIsOfficial && startEffect(s, official, base) === 'change' ? official : null,
      others: [...presets, ...fromSaved, ...clear].map(keep).filter((o): o is Option => !!o),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, part, listId, saved, ds, lang]);
  const newGrouping = () => {
    const name = prompt(L('Grouping name', 'שם החלוקה'))?.trim();
    if (name) dispatch({ type: 'startPart', part: 'blocs', source: 'blank', name });
  };
  const single = others.length === 1 && !others[0].disabled && !others[0].group ? others[0] : null;
  return <div className="row start-from">
    <EditMarker s={s} path={['parts', part, ...(listId ? [listId] : [])]} />
    {official && <button type="button" className="btn small" title={L(`Restore ${partName} as officially published`, `שחזור ${partName} לפי הפרסום הרשמי`)} onClick={() => dispatch(official)}>
      <RotateCcw className="icon sm" aria-hidden />{L(...officialLabel[part])}</button>}
    {single && <button type="button" className="btn small" onClick={() => dispatch(single.action)}>{single.label}</button>}
    {!single && others.length > 0 && <ChoicePicker label={L(`Copy ${partName} from…`, `העתקת ${partName} מ…`)} placeholder={L('Copy from…', 'העתקה מ…')} value="" options={others}
      onChange={v => { const o = others.find(x => x.value === v); if (o && !o.disabled) dispatch(o.action); }}>
      <p className="small ink2">{listId ? L('Changes this list only', 'משנה רשימה זו בלבד') : L(`Replaces all ${partName}`, `החלפה מלאה: ${partName}`)}</p>
    </ChoicePicker>}
    {part === 'blocs' && <button type="button" className="btn small" onClick={newGrouping}><Plus className="icon sm" aria-hidden />{L('New grouping', 'חלוקה חדשה')}</button>}
  </div>;
}
