import { percentNum } from './Percentage.tsx';
import { SeatDelta } from './SeatDelta.tsx';
import './turnout.css';
import { TurnoutSteps } from './TurnoutSteps.tsx';
import { TurnoutFacts } from './TurnoutFacts.tsx';
import { StartFrom } from './StartFrom.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Save, Trash2, Upload } from 'lucide-react';
import type { ElectionId, LocalityDataset, LocalityGroup } from '../../data/schema.ts';
import type { Scenario } from '../../model/scenario.ts';
import { applyAction } from '../../model/actions.ts';
import {
  groupAction, groupChange, parseVoterGroups, resolveGroup, VOTER_GROUP_KIND,
  type GroupFacts, type GroupProblem, type VoterGroupMembers, type VoterGroupPreset,
} from '../../model/voterGroups.ts';
import { allocationOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPctNum, nonZeroFixed, signed } from '../format.ts';
import { dispatch, toast, useDigits, useStore } from '../store.ts';
import { deleteVoterGroup, exportVoterGroup, newGroupId, saveVoterGroup, useVoterGroups } from '../voterGroupStore.ts';
import { ChoicePicker, type Choice } from './ChoicePicker.tsx';
import { Info, NumberInput } from './ui.tsx';
export { mapToScenario } from '../../model/voterGroups.ts';

const locCache = new Map<ElectionId, Promise<LocalityDataset>>();
/** Loads an election's locality results; `available` is false when the election has none. */
export function useLocalities(id: ElectionId, available = true) {
  const [d, setD] = useState<LocalityDataset | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let live = true; // ignore a slower response for an election we have already left
    setD(null); setErr(null);
    if (!available) return;
    let p = locCache.get(id);
    if (!p) { p = fetch(`data/${id}-localities.json`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }); locCache.set(id, p); }
    p.then((x) => live && setD(x), (e) => { locCache.delete(id); if (live) setErr(String(e)); });
    return () => { live = false; };
  }, [id, available]);
  return { data: d, error: err };
}

type Source = { id: string; publisher?: string; url?: string; official?: boolean };
let sourcesP: Promise<Source[]> | null = null;
function useSources() {
  const [src, setSrc] = useState<Source[]>([]);
  useEffect(() => { (sourcesP ??= fetch('data/sources.json').then((r) => r.json()).catch(() => [])).then(setSrc); }, []);
  return src;
}

type Draft = { members: VoterGroupMembers | null; name: string; savedId?: string; builtIn?: boolean; change: number; vote: 'observed' | 'shares'; shares: Record<string, string>; sharesFor?: ElectionId };
const EMPTY: Draft = { members: null, name: '', change: 0, vote: 'observed', shares: {} };
// the group being edited outlives election switches, so a sourced group can be tried on each election
let lastDraft: Draft = EMPTY;
const isFacts = (f: GroupFacts | GroupProblem | null): f is GroupFacts => !!f && typeof f === 'object';


export function Turnout({ s }: { s: Scenario }) {
  const digits = useDigits();

  const L = useL(), lang = useLang();
  const hasLocalities = useStore((st) => st.datasets[s.electionId]?.hasLocalities !== false);
  const { data } = useLocalities(s.electionId, hasLocalities);
  const saved = useVoterGroups();
  const sources = useSources();
  const [d, setDraft] = useState<Draft>(lastDraft);
  const set = (patch: Partial<Draft>) => setDraft((x) => (lastDraft = { ...x, ...patch }));
  const file = useRef<HTMLInputElement>(null);
  const [showAll, setShowAll] = useState(false);

  const groupName = (g: LocalityGroup) => (lang === 'he' ? g.nameHe : g.nameEn);
  const sourced = useMemo(() => (data?.groups ?? []).map((g) => ({ g, f: resolveGroup(s, data, { type: 'sourced', groupId: g.id }) })), [s, data]);
  const facts = useMemo(() => (d.members ? resolveGroup(s, data, d.members) : null), [s, data, d.members]);
  const f = isFacts(facts) ? facts : null;
  const curPct = f && f.electorate ? (100 * f.cast) / f.electorate : 0;
  const canObserve = !!f?.mix && f.mix.some((x) => x > 0);
  const vote = d.vote === 'observed' && canObserve ? 'observed' : 'shares';
  const shareOf = (id: string) => { const n = Number(d.shares[id]); return d.sharesFor && d.sharesFor !== s.electionId ? 0 : Number.isFinite(n) && n > 0 ? n : 0; };
  const weights = vote === 'observed' ? f!.mix! : s.lists.map((l) => shareOf(l.id));
  const shareSum = s.lists.reduce((t, l) => t + shareOf(l.id), 0);
  const change = useMemo(() => (f ? groupChange(s, f, d.change, weights) : null), [s, f, d.change, weights.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const label = `${d.name || L('Voter group', 'קבוצת מצביעים')} ${d.change >= 0 ? '+' : '−'}${nonZeroFixed(Math.abs(d.change), digits)} ${L('pp', 'נק׳')}`;
  const seatDiff = useMemo(() => {
    if (!change || change.error || !change.delta) return null;
    try {
      const before = allocationOf(s);
      const after = allocationOf(applyAction(s, groupAction(change, label)));
      return s.lists.map((l) => ({ l, n: (after.lists.find((x) => x.id === l.id)?.seats ?? 0) - (before.lists.find((x) => x.id === l.id)?.seats ?? 0) })).filter((x) => x.n !== 0).sort((a, b) => b.n - a.n);
    } catch { return null; }
  }, [s, change, label]);

  const preset = (): VoterGroupPreset | null => d.members && {
    kind: VOTER_GROUP_KIND, schemaVersion: 1, id: d.savedId ?? newGroupId(), name: d.name.trim() || L('Voter group', 'קבוצת מצביעים'), createdAt: new Date().toISOString(),
    members: d.members, turnoutChange: d.change,
    vote: vote === 'observed' ? { type: 'observed' } : { type: 'shares', electionId: s.electionId, shares: Object.fromEntries(s.lists.filter((l) => shareOf(l.id) > 0).map((l) => [l.id, shareOf(l.id)])) },
  };
  const load = (p: VoterGroupPreset, builtIn = false) => setDraft(lastDraft = {
    members: p.members, name: p.name, savedId: builtIn ? undefined : p.id, builtIn, change: p.turnoutChange, vote: p.vote.type,
    shares: p.vote.type === 'shares' ? Object.fromEntries(Object.entries(p.vote.shares).map(([k, v]) => [k, String(v)])) : {}, sharesFor: p.vote.type === 'shares' ? p.vote.electionId : undefined,
  });
  const choose = (v: string) => {
    if (v === 'manual') return load({ ...base(), name: L('Custom group', 'קבוצה מותאמת אישית'), members: { type: 'manual', electorate: 100_000, turnoutPct: 50, invalidPct: 1 }, vote: { type: 'shares', electionId: s.electionId, shares: {} } });
    if (v === 'share') return load({ ...base(), name: L('Localities by vote', 'יישובים לפי הצבעה'), members: { type: 'voteShare', electionId: s.electionId, listIds: [], minPct: 50 } });
    if (v.startsWith('src:')) { const g = data?.groups?.find((x) => x.id === v.slice(4)); if (g) load({ ...base(), name: groupName(g), members: { type: 'sourced', groupId: g.id } }, true); return; }
    const p = saved.find((x) => x.id === v.slice(6)); if (p) load(p);
  };
  const base = (): VoterGroupPreset => ({ kind: VOTER_GROUP_KIND, schemaVersion: 1, id: '', name: '', createdAt: '', members: { type: 'sourced', groupId: '' }, turnoutChange: 0, vote: { type: 'observed' } });
  const value = !d.members ? '' : d.savedId ? `saved:${d.savedId}` : d.members.type === 'sourced' ? `src:${d.members.groupId}` : d.members.type === 'voteShare' ? 'share' : 'manual';

  const problemText = (p: GroupProblem) => ({
    'needs-localities': L('Needs locality results (2003 on)', 'דורש תוצאות לפי יישובים (מ-2003)'),
    'no-registered': L('No registered-voter counts by locality', 'אין מספרי בעלי זכות בחירה לפי יישוב'),
    'unknown-group': L('Not defined for this election', 'לא מוגדר לבחירות אלה'),
    'other-election': L('Defined for another election', 'מוגדר לבחירות אחרות'),
    empty: L('No localities match', 'אין יישובים מתאימים'),
  })[p];
  const options: Choice[] = [
    ...sourced.map(({ g, f }) => ({ value: `src:${g.id}`, label: groupName(g), group: L('Official locality data', 'נתונים רשמיים לפי יישובים'), disabled: !isFacts(f),
      detail: isFacts(f) ? (lang === 'he' ? <>{fmtInt(f.localities!)}{" יישובים · "}{fmtInt(f.electorate)}{" בעלי זכות · הצבעה "}{percentNum(100 * f.cast / f.electorate, digits)}</> : <>{fmtInt(f.localities!)}{" localities · "}{fmtInt(f.electorate)}{" registered · turnout "}{percentNum(100 * f.cast / f.electorate, digits)}</>) : problemText(f) })),
    ...(!hasLocalities ? [{ value: 'none', label: L('Groups from locality results', 'קבוצות מתוצאות היישובים'), group: L('Official locality data', 'נתונים רשמיים לפי יישובים'), disabled: true, detail: problemText('needs-localities') }] : []),
    ...(data ? [{ value: 'share', label: L('Localities where chosen lists got ≥ X%', 'יישובים שבהם רשימות נבחרות קיבלו ≥ X%'), group: L('Official locality data', 'נתונים רשמיים לפי יישובים'), disabled: data.rows.every((r) => r.registered === null), detail: data.rows.every((r) => r.registered === null) ? problemText('no-registered') : undefined }] : []),
    ...saved.map((p) => { const r = resolveGroup(s, data, p.members); return { value: `saved:${p.id}`, label: p.name, group: L('Saved in this browser', 'שמורות בדפדפן זה'), detail: isFacts(r) ? `${signed(Math.round(p.turnoutChange * 10) / 10)} ${L('pp', 'נק׳')}` : problemText(r) }; }),
    { value: 'manual', label: L('Custom group…', 'קבוצה מותאמת אישית…'), group: L('Your own', 'משלכם') },
  ];

  const sg = d.members?.type === 'sourced' ? data?.groups?.find((g) => g.id === (d.members as { groupId: string }).groupId) : undefined;
  const lists = useMemo(() => [...s.lists].filter((l) => !l.withdrawn).sort((a, b) => b.votes - a.votes), [s.lists]);
  const mixTotal = f?.mix?.reduce((a, b) => a + b, 0) ?? 0;
  const apply = () => { if (change && !change.error && change.delta) dispatch(groupAction(change, label)); };

  return (
    <div className="turnout">
      <TurnoutFacts s={s} />
      <h3>{L('Change turnout', 'שינוי שיעור ההצבעה')}</h3>
      <div className="turnout-national"><TurnoutSteps s={s}><StartFrom s={s} part="totals" /></TurnoutSteps></div>

      <section className="vg" aria-label={L('Voter group', 'קבוצת מצביעים')}>
        <div className="vg-head">
          <h3>{L('Voter group', 'קבוצת מצביעים')} <Info title={L('Hypothetical modelling', 'מודל היפותטי')}>
            {L('Change one group’s turnout and see the national result. The change is your assumption, not an official result. Locality groups describe places, not individual voters, and double-envelope votes are not attributed to localities.', 'שנו את שיעור ההצבעה של קבוצה אחת וראו את התוצאה הארצית. השינוי הוא הנחה שלכם ואינו תוצאה רשמית. קבוצות יישובים מתארות מקומות ולא מצביעים יחידים, וקולות המעטפות החיצוניות אינם משויכים ליישובים.')}</Info></h3>
          <ChoicePicker label={L('Voter group', 'קבוצת מצביעים')} placeholder={L('Choose a group…', 'בחירת קבוצה…')} value={value} options={options} onChange={choose} />
          <span className="vg-files">
            {d.members && <button type="button" className="btn small" onClick={() => {
              const name = prompt(L('Name this voter group', 'שם לקבוצת המצביעים'), d.name)?.trim(); if (!name) return;
              const p = preset()!; const next = { ...p, name, id: d.savedId ?? p.id }; saveVoterGroup(next); load(next); toast('info', L('Voter group saved in this browser.', 'קבוצת המצביעים נשמרה בדפדפן זה.'));
            }}><Save className="icon sm" aria-hidden />{d.savedId ? L('Save changes', 'שמירת השינויים') : L('Save', 'שמירה')}</button>}
            {d.members && <button type="button" className="btn small" onClick={() => exportVoterGroup(preset()!)}><Download className="icon sm" aria-hidden />{L('Export', 'ייצוא')}</button>}
            <button type="button" className="btn small" onClick={() => file.current?.click()}><Upload className="icon sm" aria-hidden />{L('Import', 'ייבוא')}</button>
            {d.savedId && <button type="button" className="btn small ghost" aria-label={L('Delete saved group', 'מחיקת הקבוצה השמורה')} title={L('Delete saved group', 'מחיקת הקבוצה השמורה')} onClick={() => {
              if (!confirm(L(`Delete “${d.name}” from this browser?`, `למחוק את "${d.name}" מדפדפן זה?`))) return;
              deleteVoterGroup(d.savedId!); set({ savedId: undefined });
            }}><Trash2 className="icon sm" aria-hidden /></button>}
          </span>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={async (e) => {
            const x = e.target.files?.[0]; e.target.value = ''; if (!x) return;
            try { const ps = parseVoterGroups(await x.text()); ps.forEach(saveVoterGroup); load(ps[0]); toast('info', L(`Imported ${ps.length} voter group${ps.length > 1 ? 's' : ''}.`, `יובאו ${ps.length} קבוצות מצביעים.`)); }
            catch (err) { toast('error', err instanceof Error ? err.message : String(err)); }
          }} />
        </div>

        {!d.members && <p className="small ink2">{data?.groups?.length
          ? L('Pick a group, move its turnout, and add or remove its voters.', 'בחרו קבוצה, שנו את שיעור ההצבעה שלה והוסיפו או הסירו מצביעים.')
          : L('Choose a saved or custom group.', 'בחרו קבוצה שמורה או מותאמת אישית.')}</p>}

        {d.members && <div className="vg-body">
          <div className="vg-who">
            {d.members.type === 'manual' && <>
              <h4>{L('Custom group', 'קבוצה מותאמת אישית')} <Info title={L('Define your group', 'הגדרת הקבוצה שלכם')}>
                {L('Enter the number of eligible voters in your group, its current turnout and its share of invalid ballots. Then choose how its voters divide among lists. These are your assumptions, not measured results.', 'הזינו את מספר בעלי זכות הבחירה בקבוצה, את שיעור ההצבעה הנוכחי שלה ואת שיעור הפתקים הפסולים. לאחר מכן הגדירו כיצד מצביעיה מתחלקים בין הרשימות. אלו הנחות שלכם, לא תוצאות שנמדדו.')}
              </Info></h4>
              <div className="vg-fields">
                <label className="field">{L('Group size', 'גודל הקבוצה')}<NumberInput value={d.members.electorate} label={L('Group size', 'גודל הקבוצה')} onCommit={(n) => n > 0 && set({ members: { ...(d.members as Extract<VoterGroupMembers, { type: 'manual' }>), electorate: n } })} /></label>
                <PctField label={L('Current turnout %', 'שיעור הצבעה נוכחי %')} value={d.members.turnoutPct} max={100} onCommit={(n) => set({ members: { ...(d.members as Extract<VoterGroupMembers, { type: 'manual' }>), turnoutPct: n } })} />
                <PctField label={L('Invalid ballots %', 'פתקים פסולים %')} value={d.members.invalidPct} max={99.9} onCommit={(n) => set({ members: { ...(d.members as Extract<VoterGroupMembers, { type: 'manual' }>), invalidPct: n } })} />
              </div>
            </>}
            {d.members.type === 'voteShare' && (() => {
              const m = d.members;
              const shown = showAll ? lists : lists.slice(0, 10);
              const pick = (l: Scenario['lists'][number]) => {
                const on = l.originIds.every((o) => m.listIds.includes(o));
                set({ members: { ...m, electionId: s.electionId, listIds: on ? m.listIds.filter((o) => !l.originIds.includes(o)) : [...new Set([...m.listIds, ...l.originIds])] } });
              };
              return <div className="vg-share">
                <span className="small">{L('Localities where', 'יישובים שבהם')}</span>
                <span className="vg-chips" role="group" aria-label={L('Lists', 'רשימות')}>{shown.filter((l) => l.originIds.length).map((l) => <button key={l.id} type="button" className="chip" aria-pressed={l.originIds.every((o) => m.listIds.includes(o))} onClick={() => pick(l)}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}</button>)}
                  {lists.length > 10 && <button type="button" className="btn small ghost" onClick={() => setShowAll(!showAll)}>{showAll ? L('Fewer', 'פחות') : L(`+${lists.length - 10} more`, `+${lists.length - 10} נוספות`)}</button>}</span>
                <span className="small row">{L('together got ≥', 'קיבלו יחד ≥')} <PctField label={L('Minimum share %', 'שיעור מינימלי %')} bare value={m.minPct} max={100} onCommit={(n) => set({ members: { ...m, minPct: n } })} /> {L('of valid votes', 'מהקולות הכשרים')}</span>
              </div>;
            })()}
            {facts && !f && (d.members.type === 'voteShare' && !d.members.listIds.length ? <p className="small ink2">{L('Pick one or more lists.', 'בחרו רשימה אחת או יותר.')}</p> : <p className="small bad">{problemText(facts as GroupProblem)}</p>)}
            {f && d.members.type !== 'manual' && <p className="small vg-facts">
              {(lang === 'he' ? <>{fmtInt(f.localities!)}{" יישובים · "}{fmtInt(f.electorate)}{" בעלי זכות · הצבעה "}{percentNum(curPct, digits)}{" · פסולים "}{percentNum(f.cast ? 100 * f.invalid / f.cast : 0, digits)}</> : <>{fmtInt(f.localities!)}{" localities · "}{fmtInt(f.electorate)}{" registered · turnout "}{percentNum(curPct, digits)}{" · invalid "}{percentNum(f.cast ? 100 * f.invalid / f.cast : 0, digits)}</>)}{' '}
              <Info title={L('Definition and source', 'הגדרה ומקור')}>
                {sg ? <>{lang === 'he' ? sg.definitionHe : sg.definitionEn} {L(`Classification year ${sg.classificationYear}.`, `שנת סיווג ${sg.classificationYear}.`)}{' '}
                  {sg.sourceIds.map((id) => sources.find((x) => x.id === id)).filter((x) => x?.official && x.url).map((x) => <a key={x!.id} href={x!.url} target="_blank" rel="noreferrer">{x!.publisher} </a>)}</>
                  : L('Measured from this election’s official results by locality.', 'נמדד מהתוצאות הרשמיות של בחירות אלה לפי יישובים.')}
                {' '}{(lang === 'he' ? data?.demographicNoteHe : data?.demographicNoteEn) ?? L('Places, not people. Envelopes excluded.', 'מקומות, לא אנשים. המעטפות החיצוניות אינן כלולות.')}
              </Info></p>}
          </div>

          {f && <>
            <div className="vg-turnout">
              <label className="small" htmlFor="vg-change">{L('Turnout', 'שיעור הצבעה')}</label>
              <span className="vg-range"><bdi dir="ltr"><b>{percentNum(curPct, digits)}</b> → <b>{percentNum(curPct + d.change, digits)}</b></bdi> <span className="ink2">({signed(Math.round(d.change * 10) / 10)} {L('pp', 'נק׳')})</span></span>
              <input id="vg-change" type="range" min={-Math.floor(curPct * 10) / 10} max={Math.floor((100 - curPct) * 10) / 10} step={0.1} value={d.change}
                aria-valuetext={`${fmtPctNum(curPct + d.change, digits)}`} onChange={(e) => set({ change: Number(e.target.value) })} />
              <PctField label={L('New turnout %', 'שיעור הצבעה חדש %')} bare value={Math.round((curPct + d.change) * 10) / 10} max={100} onCommit={(n) => set({ change: Math.round((n - curPct) * 10) / 10 })} />
            </div>

            <div className="vg-vote">
              <span className="small">{canObserve ? L('How they vote', 'איך הם מצביעים') : L('How they vote (% per list)', 'איך הם מצביעים (% לכל רשימה)')}</span>
              {canObserve && <span className="seg" role="group" aria-label={L('How they vote', 'איך הם מצביעים')}>
                <button type="button" aria-pressed={vote === 'observed'} onClick={() => set({ vote: 'observed' })}>{L('Like this group voted', 'כמו שהקבוצה הצביעה')}</button>
                <button type="button" aria-pressed={vote === 'shares'} onClick={() => set({ vote: 'shares' })}>{L('My shares', 'חלוקה שלי')}</button>
              </span>}
              {vote === 'observed' && mixTotal > 0 && <div className="vg-mix" role="img" aria-label={lists.filter((l) => f.mix![s.lists.indexOf(l)] > 0).slice(0, 6).map((l) => `${listLabel(l, lang)} ${fmtPctNum(100 * f.mix![s.lists.indexOf(l)] / mixTotal, digits)}`).join(', ')}>
                <div className="vg-bar">{[...s.lists.keys()].filter((i) => f.mix![i] / mixTotal >= 0.01).sort((a, b) => f.mix![b] - f.mix![a]).map((i) => <i key={s.lists[i].id} style={{ background: s.lists[i].color, flex: f.mix![i] }} title={`${listLabel(s.lists[i], lang)} ${fmtPctNum(100 * f.mix![i] / mixTotal, digits)}`} />)}
                  {/* lists under 1% share one segment instead of a run of slivers */}
                  {(() => { const rest = f.mix!.filter((x) => x / mixTotal < 0.01).reduce((a, b) => a + b, 0); return rest > 0 && <i key="other" className="vg-other" style={{ flex: rest }} title={`${L('Other lists', 'רשימות אחרות')} ${fmtPctNum(100 * rest / mixTotal, digits)}`} />; })()}</div>
                <div className="vg-legend small">{[...s.lists.keys()].filter((i) => f.mix![i] / mixTotal >= 0.03).sort((a, b) => f.mix![b] - f.mix![a]).map((i) => <span key={i}><span className="swatch" style={{ background: s.lists[i].color }} />{listLabel(s.lists[i], lang)} {percentNum(100 * f.mix![i] / mixTotal, digits)}</span>)}</div>
              </div>}
              {vote === 'shares' && <>
                {d.sharesFor && d.sharesFor !== s.electionId && <p className="small bad">{L('These shares were set for another election’s lists; set them again here.', 'החלוקה הוגדרה לרשימות של בחירות אחרות; הגדירו אותה מחדש כאן.')}</p>}
                <div className="vg-shares">{lists.slice(0, showAll ? undefined : 12).map((l) => <label key={l.id} className="vg-share-row small">
                  <span className="swatch" style={{ background: l.color }} /><span className="vg-name">{listLabel(l, lang)}</span>
                  <input type="text" inputMode="decimal" aria-label={`${listLabel(l, lang)} %`} value={d.sharesFor === s.electionId || !d.sharesFor ? d.shares[l.id] ?? '' : ''} 
                    onChange={(e) => set({ shares: { ...(d.sharesFor && d.sharesFor !== s.electionId ? {} : d.shares), [l.id]: e.target.value }, sharesFor: s.electionId })} />%
                </label>)}</div>
                <p className="small ink2">{lists.length > 12 && <button type="button" className="btn small ghost" onClick={() => setShowAll(!showAll)}>{showAll ? L('Fewer lists', 'פחות רשימות') : L(`All ${lists.length} lists`, `כל ${lists.length} הרשימות`)}</button>}
                  {shareSum > 0 && Math.abs(shareSum - 100) > 0.01 && (lang === 'he' ? <>{" סך הכול "}{percentNum(shareSum, digits)}{", מותאם ל-100%."}</> : <>{" Total "}{percentNum(shareSum, digits)}{", scaled to 100%."}</>)}</p>
              </>}
            </div>

            <div className="vg-result">
              {change?.error === 'range' && <p id="vg-why" className="small bad">{L('Turnout must stay between 0% and 100%.', 'שיעור ההצבעה חייב להישאר בין 0% ל-100%.')}</p>}
              {change?.error === 'no-split' && <p id="vg-why" className="small bad">{L('Give at least one list a share.', 'תנו חלק לרשימה אחת לפחות.')}</p>}
              {change?.error === 'too-few' && <p id="vg-why" className="small bad">{L('Some lists do not have enough votes to remove.', 'לחלק מהרשימות אין די קולות להסרה.')}</p>}
              {change && !change.error && change.delta !== 0 && <>
                <p className="small"><bdi dir="ltr">{signed(change.delta)}</bdi> {L('ballots', 'פתקים')} · <bdi dir="ltr">{signed(change.invalid)}</bdi> {L('invalid', 'פסולים')}</p>
                <div className="vg-seats small" aria-live="polite">{seatDiff?.length ? seatDiff.map(({ l, n }) => <span key={l.id} className="chip"><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <b><bdi dir="ltr"><SeatDelta value={n} /></bdi></b></span>) : <span className="ink2">{L('No seat changes', 'אין שינוי במנדטים')}</span>}</div>
              </>}
              <button type="button" className="btn primary" disabled={!change || !!change.error || !change.delta} aria-describedby={change?.error ? 'vg-why' : undefined} onClick={apply}>
                {!change?.delta ? L('Move the turnout to add or remove voters', 'שנו את שיעור ההצבעה כדי להוסיף או להסיר מצביעים')
                  : change.delta > 0 ? L(`Add ${fmtInt(change.delta)} voters`, `הוספת ${fmtInt(change.delta)} מצביעים`) : L(`Remove ${fmtInt(-change.delta)} voters`, `הסרת ${fmtInt(-change.delta)} מצביעים`)}
              </button>
            </div>
          </>}
        </div>}
      </section>
    </div>
  );
}

/** A percentage field that commits on Enter or blur; rejects text outside 0…max. */
function PctField({ label, value, max, onCommit, bare }: { label: string; value: number; max: number; onCommit: (n: number) => void; bare?: boolean }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => { const n = Number(text.replace('%', '').trim()); if (text.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= max) onCommit(n); else setText(String(value)); };
  const input = <input type="text" inputMode="decimal" className="vg-pct" aria-label={label} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); }} />;
  return bare ? input : <label className="field">{label}{input}</label>;
}
