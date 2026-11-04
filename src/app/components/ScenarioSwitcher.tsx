import { useActiveReference } from '../useActiveReference.ts';
import { describe } from '../actionDescription.ts';
import { voteSourceLabel } from '../voteEdit.ts';
import { baselineOf, referenceChanges, editPathLabel } from '../derive.ts';
import { changeText, ChangeValue } from '../changeValue.tsx';
import { useMemo } from 'react';
import { scenarioFromDataset, type Scenario } from '../../model/scenario.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import { getState, replay, setState, toast, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { scenarioColor } from '../scenarioIdentity.ts';
import { ChoicePicker, type Choice } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';

export function ScenarioSwitcher({ s, ds }: { s: Scenario; ds: ElectionDataset }) {
  const lang = useLang();
  const L = useL(), saved = useStore(st => st.saved);
  const { reference, loadedReference: checkpointReference, label: activeLabel } = useActiveReference();
  const drafts = useStore(st => st.scenarioDrafts);
  const official = useMemo(() => scenarioFromDataset(ds), [ds]);
  const entries = useMemo(() => saved.filter(x => x.electionId === s.electionId).map(x => { const result = replay(ds, x.name, x.log); return { ...x, failed: result.failed, scenario: { ...result.scenario, ...(x.description ? { description: x.description } : {}), id: x.id } }; }), [saved, ds, s.electionId]);
  const officialNow = !checkpointReference && s.log.length === 0;
  const dirty = !officialNow && (!checkpointReference || JSON.stringify(s.log) !== JSON.stringify(checkpointReference.log));
  const current = officialNow ? 'official' : dirty ? `draft:${s.id}:${s.log.at(-1)?.at ?? s.log.length}` : s.id;
  const preview = (x: Scenario, neutral = false) => <><span className="swatch" style={{ background: neutral ? 'var(--muted)' : scenarioColor(x) }} /><ResultPreview s={x} /></>;
  const markerBase = reference ?? official;
  const details = (x: Scenario, date: string, status: string) => {
    const action = [...x.log].reverse().map(e => e.action).find(a => ['setVotes', 'redistribute', 'transfer', 'addVoters', 'scaleAll', 'setTurnout'].includes(a.type));
    const source = !action ? L('Official votes', 'קולות רשמיים') : action.type === 'setVotes' || action.type === 'addVoters' ? voteSourceLabel({ kind: 'new' }, x, lang) : action.type === 'redistribute' ? L('Lists balanced proportionally', 'איזון יחסי בין הרשימות') : describe(action, x, lang);
    const rules = referenceChanges(x, markerBase).filter(p => p[0] === 'rules').map(p => `${editPathLabel(x, p, lang, markerBase)}: ${changeText(x, p, lang)}`);
    const count = referenceChanges(x, markerBase).length;
    const changedVotes = x.lists.some(l => l.votes !== markerBase.lists.find(y => y.id === l.id)?.votes);
    const referenceAction = [...markerBase.log].reverse().map(e => e.action).find(a => ['setVotes', 'redistribute', 'transfer', 'addVoters', 'scaleAll', 'setTurnout'].includes(a.type));
    const sourceKey = (a: typeof action) => !a || a.type === 'redistribute' ? 'proportional' : a.type === 'setVotes' || a.type === 'addVoters' ? 'new' : a.type === 'transfer' ? `transfer:${a.from}:${a.to}` : a.type;
    const exceptional = action && changedVotes && sourceKey(action) !== sourceKey(referenceAction);
    return [date.slice(0, 10), `${count} ${L('changes', 'שינויים')}`, status.includes('could not') || status.includes('לא הוחלו') ? status : '', exceptional ? source : '', ...rules].filter(Boolean).join(' · ');
  };
  const options: Choice[] = [{ value: 'official', label: L('Official result', 'התוצאה הרשמית'), detail: details(official, ds.electionDate, L('Official', 'רשמי')), preview: preview(official, true) }, ...entries.map(x => ({ value: x.id, label: x.name, detail: details(x.scenario, x.savedAt, x.failed ? L(`Saved · ${x.failed} changes could not be replayed`, `שמור · ${x.failed} שינויים לא הוחלו מחדש`) : L('Saved', 'שמור')), preview: preview(x.scenario) })),
    ...Object.entries(drafts).filter(([, x]) => x.scenario?.electionId === s.electionId).map(([key, x]) => ({ value: key, label: `${x.scenario!.name || L('Untitled scenario', 'תרחיש ללא שם')} · ${L('unsaved', 'לא נשמר')}`, detail: details(x.scenario!, x.scenario!.log.at(-1)?.at ?? ds.electionDate, L('Session draft · undo kept', 'טיוטת מפגש · הביטול נשמר')), preview: preview(x.scenario!) }))];
  if (dirty && !options.some(x => x.value === current)) options.push({ value: current, label: `${s.name || L('Untitled scenario', 'תרחיש ללא שם')} · ${L('unsaved', 'לא נשמר')}`, detail: details(s, s.log.at(-1)?.at ?? ds.electionDate, L('Session draft · undo kept', 'טיוטת מפגש · הביטול נשמר')), preview: preview(s) });
  return <ChoicePicker className="scenario-switcher election-status" label={L('Switch scenario', 'החלפת תרחיש')} value={current} options={options} onChange={key => {
    if (key === current) return;
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.band .scenario-switcher .choice-trigger')?.focus());
    const st = getState();
    if (dirty) {
      setState({ scenarioDrafts: { ...st.scenarioDrafts, [current]: { scenario: st.scenario ?? s, reference: checkpointReference, past: st.past, future: st.future } } });
      toast('info', L('Unsaved changes kept in the scenario switcher for this session.', 'השינויים שלא נשמרו נשארים במחליף התרחישים למפגש זה.'));
    }
    const draft = drafts[key];
    if (draft) setState({ ...draft, selectedListId: null, blocPanel: null });
    else {
      const entry = entries.find(x => x.id === key);
      const target = key === 'official' ? scenarioFromDataset(ds) : entry?.scenario;
      const warnings = [entry?.failed ? L(`${entry.failed} changes could not be replayed on the current data.`, `${entry.failed} שינויים לא הוחלו מחדש על הנתונים הנוכחיים.`) : '', entry && entry.baseBuiltAt !== ds.buildInfo.builtAt ? L('Historical data has been rebuilt; saved actions were replayed.', 'הנתונים ההיסטוריים נבנו מחדש; הפעולות השמורות הוחלו מחדש.') : ''].filter(Boolean);
      if (target) setState({ scenario: target, reference: key === 'official' ? null : target, past: [], future: [], selectedListId: null, blocPanel: null, notice: warnings.join(' ') || null });
    }
  }}><details className="scenario-changes"><summary>{L('Current scenario', 'התרחיש הנוכחי')} · {activeLabel.since}</summary><ul>{referenceChanges(s, reference ?? baselineOf(ds)).map(p => <li key={p.join('/')}><bdi>{editPathLabel(s, p, lang, reference ?? baselineOf(ds))}</bdi>: <ChangeValue s={s} path={p} lang={lang} /></li>)}</ul></details></ChoicePicker>;
}
