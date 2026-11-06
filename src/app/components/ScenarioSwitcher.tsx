import { useActiveReference } from '../useActiveReference.ts';
import { describe } from '../actionDescription.ts';
import { voteSourceLabel } from '../voteEdit.ts';
import { baselineOf, referenceChanges, editPathLabel } from '../derive.ts';
import { changeText, ChangeValue } from '../changeValue.tsx';
import { useMemo } from 'react';
import { type Scenario } from '../../model/scenario.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import { openOfficial, openSaved, replay, restoreDraft, scenarioKey, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { liveScenarioColor } from '../scenarioIdentity.ts';
import { ChoicePicker, type Choice } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';

export function ScenarioSwitcher({ s, ds }: { s: Scenario; ds: ElectionDataset }) {
  const lang = useLang();
  const L = useL(), saved = useStore(st => st.saved);
  const { reference, loadedReference: checkpointReference, label: activeLabel } = useActiveReference();
  const drafts = useStore(st => st.scenarioDrafts);
  const official = baselineOf(ds);
  const entries = useMemo(() => saved.filter(x => x.electionId === s.electionId).map(x => { const result = replay(ds, x.name, x.log, x.factionSplitBaseline ?? false); return { ...x, failed: result.failed, scenario: { ...result.scenario, ...(x.description ? { description: x.description } : {}), id: x.id } }; }), [saved, ds, s.electionId]);
  // 'official', a saved id, or unsaved work: changed since loading, or never saved (an opened share link)
  const current = scenarioKey({ scenario: s, reference: checkpointReference, saved, datasets: { [ds.id]: ds } }) ?? 'official';
  const preview = (x: Scenario, neutral = false) => <><span className="swatch" style={{ background: neutral ? 'var(--muted)' : liveScenarioColor(x, saved) }} /><ResultPreview s={x} /></>;
  // rows describe each scenario against the official result, so counts mean the same thing in every row
  const markerBase = official;
  const details = (x: Scenario, date: string, status: string) => {
    const action = [...x.log].reverse().map(e => e.action).find(a => ['setVotes', 'redistribute', 'transfer', 'addVoters', 'scaleAll', 'setTurnout'].includes(a.type));
    const source = !action ? L('Official votes', 'קולות רשמיים') : action.type === 'setVotes' || action.type === 'addVoters' ? voteSourceLabel({ kind: 'new' }, x, lang) : action.type === 'redistribute' ? L('Lists balanced proportionally', 'איזון יחסי בין הרשימות') : describe(action, x, lang);
    const rules = referenceChanges(x, markerBase).filter(p => p[0] === 'rules'||p[0]==='parts'&&p[1]==='rules').map(p => `${editPathLabel(x, p, lang, markerBase)}: ${changeText(x, p, lang)}`);
    // count the user's edits, not the fields they touched: one balanced vote edit is one edit, not dozens of lists
    const count = x.log.length;
    const changedVotes = x.lists.some(l => l.votes !== markerBase.lists.find(y => y.id === l.id)?.votes);
    const referenceAction = [...markerBase.log].reverse().map(e => e.action).find(a => ['setVotes', 'redistribute', 'transfer', 'addVoters', 'scaleAll', 'setTurnout'].includes(a.type));
    const sourceKey = (a: typeof action) => !a || a.type === 'redistribute' ? 'proportional' : a.type === 'setVotes' || a.type === 'addVoters' ? 'new' : a.type === 'transfer' ? `transfer:${a.from}:${a.to}` : a.type;
    const exceptional = action && changedVotes && sourceKey(action) !== sourceKey(referenceAction);
    return [date.slice(0, 10), count ? `${count} ${L(count === 1 ? 'edit' : 'edits', count === 1 ? 'עריכה' : 'עריכות')}` : '', status.includes('could not') || status.includes('לא הוחלו') ? status : '', exceptional ? source : '', ...rules].filter(Boolean).join(' · ');
  };
  const options: Choice[] = [{ value: 'official', label: L('Official result', 'התוצאה הרשמית'), detail: details(official, ds.electionDate, L('Official', 'רשמי')), preview: preview(official, true) }, ...entries.map(x => ({ value: x.id, label: x.name, detail: details(x.scenario, x.savedAt, x.failed ? L(`Saved · ${x.failed} changes could not be replayed`, `שמור · ${x.failed} שינויים לא הוחלו מחדש`) : L('Saved', 'שמור')), preview: preview(x.scenario) })),
    ...Object.entries(drafts).filter(([, x]) => x.scenario?.electionId === s.electionId).map(([key, x]) => ({ value: key, label: `${x.scenario!.name || L('Untitled scenario', 'תרחיש ללא שם')} *`, detail: details(x.scenario!, x.scenario!.log.at(-1)?.at ?? ds.electionDate, L('Session draft · undo kept', 'טיוטת מפגש · הביטול נשמר')), preview: preview(x.scenario!) }))];
  if (!options.some(x => x.value === current)) options.push({ value: current, label: `${s.name || L('Untitled scenario', 'תרחיש ללא שם')} *`, detail: details(s, s.log.at(-1)?.at ?? ds.electionDate, L('Session draft · undo kept', 'טיוטת מפגש · הביטול נשמר')), preview: preview(s) });
  return <ChoicePicker description={current !== 'official' && current !== s.id ? L('unsaved changes', 'שינויים שלא נשמרו') : undefined} className="scenario-switcher election-status" label={L('Switch scenario', 'החלפת תרחיש')} value={current} options={options} onChange={key => {
    if (key === current) return;
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.band .scenario-switcher .choice-trigger')?.focus());
    // every path keeps unsaved work as a session draft before replacing it (store.stashCurrent)
    if (key === 'official') openOfficial();
    else if (drafts[key]) restoreDraft(key);
    else { const x = saved.find(y => y.id === key); if (x) void openSaved(x); }
  }}><details className="scenario-changes"><summary>{L('Current scenario', 'התרחיש הנוכחי')} · {activeLabel.since}</summary><ul>{referenceChanges(s, reference ?? baselineOf(ds)).map(p => <li key={p.join('/')}><bdi>{editPathLabel(s, p, lang, reference ?? baselineOf(ds))}</bdi>: <ChangeValue s={s} path={p} lang={lang} /></li>)}</ul></details></ChoicePicker>;
}
