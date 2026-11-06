import { AnalysisEdits } from './AnalysisEdits.tsx';
import { appGroupingTag, appGroupingExplanation } from '../groupingName.ts';
import { Slip } from './ui.tsx';
import { BlocVoteStepper } from './BlocVoteStepper.tsx';
import { ScenarioSwitcher } from './ScenarioSwitcher.tsx';
import { voteSourceLabel } from '../voteEdit.ts';
import { useVoteSource, useStore } from '../store.ts';
import { FamilyGroupingLink } from './FamilyTreatment.tsx';
import { StartFrom } from './StartFrom.tsx';
// Blocs, edited where they are drawn: a panel beside the chamber with one tinted card per bloc. A bloc's name is
// edited in place, its colour from a swatch, and its members are chips moved by dragging, or by choosing a chip
// and then the bloc to move it to (the same on touch and keyboard). A constituent party of a joint list can sit in
// another bloc than its list. Regrouping never changes votes or seats; a sourced grouping is never altered, edits
// become "Your grouping" and the sourced one stays in the menu.
import { useEffect, useMemo, useRef, useState } from 'react';
import { EditMarker } from './EditMarker.tsx';
import { Plus, Trash2, X } from 'lucide-react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { groupingLabel, blocPieces, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { dispatch, setState } from '../store.ts';

/** colours that read both as a seat and as a pale region behind the seats; none is a grey, which is reserved for No bloc
 *  (tests/party-colours.test.ts) */
export const BLOC_PALETTE = ['#1f5aa5', '#1f9d73', '#c0392b', '#d98c1f', '#7b4fb0', '#1b8a9a', '#9a5b1e', '#c2477d', '#5d7a2e', '#e0b400'];
const PALETTE = BLOC_PALETTE;
const NONE = '__none';

/** a movable chip; `home` is the card it sits on */
type Unit =
  | { kind: 'list'; key: string; home: string; listId: string; n: number; parties: { partyId: string; n: number }[] }
  | { kind: 'party'; key: string; home: string; listId: string; partyId: string; n: number }
  | { kind: 'member'; key: string; home: string; listId: string; partyId: string | null; n: number };

export function BlocPanel({ s, r, focus }: { s: Scenario; r: AllocationResult; focus: string }) {
  const L = useL();
  const src = useVoteSource();
  const ds = useStore(st => st.datasets[s.electionId]);
  const lang = useLang();
  const [picked, setPicked] = useState<Unit | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [paletteFor, setPaletteFor] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const cards = useRef<Record<string, HTMLElement | null>>({});
  const total = s.rules.seats, majority = Math.floor(total / 2) + 1;
  const name = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const listOf = (id: string) => s.lists.find((l) => l.id === id)!;
  const partyOf = (listId: string, partyId: string | null) => (partyId ? listOf(listId)?.parties?.find((p) => p.id === partyId) : undefined);

  // every bloc's members, as the things that can be moved: a list (with its constituent parties inside), a party
  // seated away from its list, or members placed individually by a sourced grouping (shown, moved with their list)
  const units = useMemo(() => {
    const by = new Map<string, Unit[]>();
    const add = (bloc: string | null, u: Unit) => { const k = bloc ?? NONE; by.set(k, [...(by.get(k) ?? []), u]); };
    const pieces = blocPieces(s, r);
    for (const l of s.lists) {
      const mine = pieces.filter((p) => p.listId === l.id);
      if (!mine.length) {
        add(l.bloc, { kind: 'list', key: `l:${l.id}`, home: l.bloc ?? NONE, listId: l.id, n: 0, parties: (l.parties ?? []).map(p => ({ partyId: p.id, n: 0 })) });
        continue;
      }
      const home = mine.filter((p) => p.bloc === l.bloc);
      if (home.length) {
        const parties = new Map<string, number>();
        for (const p of home) if (p.partyId && (l.parties?.length ?? 0) > 1) parties.set(p.partyId, (parties.get(p.partyId) ?? 0) + p.n);
        for (const p of l.parties ?? []) if (!parties.has(p.id)) parties.set(p.id, 0);
        add(l.bloc, { kind: 'list', key: `l:${l.id}`, home: l.bloc ?? NONE, listId: l.id, n: home.reduce((t, p) => t + p.n, 0), parties: [...parties].map(([partyId, n]) => ({ partyId, n })) });
      }
      const away = new Map<string, { bloc: string | null; partyId: string | null; n: number }>();
      for (const p of mine.filter((x) => x.bloc !== l.bloc)) {
        const k = `${p.bloc}|${p.partyId}`;
        away.set(k, { bloc: p.bloc, partyId: p.partyId, n: (away.get(k)?.n ?? 0) + p.n });
      }
      for (const a of away.values()) {
        const own = a.partyId && s.partyBlocs && a.partyId in s.partyBlocs && s.partyBlocs[a.partyId] === a.bloc;
        add(a.bloc, own ? { kind: 'party', key: `p:${a.partyId}`, home: a.bloc ?? NONE, listId: l.id, partyId: a.partyId!, n: a.n } : { kind: 'member', key: `m:${l.id}:${a.partyId}:${a.bloc}`, home: a.bloc ?? NONE, listId: l.id, partyId: a.partyId, n: a.n });
      }
    }
    for (const v of by.values()) v.sort((a, b) => b.n - a.n);
    return by;
  }, [s, r]);
  const seatsIn = (k: string) => (units.get(k) ?? []).reduce((t, u) => t + u.n, 0);

  useEffect(() => { const card = cards.current[focus], body = card?.closest('.sp-body');
    if (card && body) body.scrollTop += card.getBoundingClientRect().top - body.getBoundingClientRect().top; }, [focus]);
  // Escape first cancels a move or closes the colours, before it closes the panel (the app's handler)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || (!picked && !paletteFor)) return;
      e.stopPropagation(); setPicked(null); setPaletteFor(null);
    };
    document.addEventListener('keydown', onKey, true); return () => document.removeEventListener('keydown', onKey, true);
  }, [picked, paletteFor]);

  const setBlocs = (blocs: Scenario['blocs']) => dispatch({ type: 'setBlocs', blocs });
  const rename = (id: string, v: string) => setBlocs(s.blocs.map((b) => (b.id === id ? (lang === 'he' ? { ...b, nameHe: v } : { ...b, nameEn: v }) : b)));
  const recolour = (id: string, c: string) => setBlocs(s.blocs.map((b) => (b.id === id ? { ...b, color: c } : b)));
  const remove = (id: string) => setBlocs(s.blocs.filter((b) => b.id !== id));
  const addBloc = () => {
    const id = `b-${Date.now().toString(36)}`;
    const used = new Set(s.blocs.map((b) => b.color.toLowerCase()));
    setBlocs([...s.blocs, { id, nameHe: 'גוש חדש', nameEn: 'New bloc', color: PALETTE.find((c) => !used.has(c)) ?? PALETTE[s.blocs.length % PALETTE.length] }]);
    setFresh(id);
  };
  /** moves a chip to a bloc (NONE for no bloc) */
  const move = (u: Unit, to: string) => {
    const bloc = to === NONE ? null : to;
    setPicked(null); setOver(null);
    if (u.kind === 'list') { if (listOf(u.listId).bloc !== bloc) dispatch({ type: 'setListMeta', listId: u.listId, patch: { bloc } }); return; }
    if (!u.partyId) return;
    // a party moved back to its list's bloc simply follows its list again
    if (listOf(u.listId).bloc === bloc) dispatch({ type: 'setPartyBloc', partyId: u.partyId, bloc: null, inherit: true });
    else dispatch({ type: 'setPartyBloc', partyId: u.partyId, bloc });
  };
  const moveParty = (listId: string, partyId: string, home: string): Unit => ({ kind: 'party', key: `p:${partyId}`, home, listId, partyId, n: 0 });

  const chipLabel = (u: Unit) => {
    const l = listOf(u.listId);
    if (u.kind === 'list') return listLabel(l, lang);
    const p = partyOf(u.listId, u.partyId);
    return p ? `${name(p)} (${listLabel(l, lang)})` : listLabel(l, lang);
  };
  const dragProps = (u: Unit) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', u.key); e.dataTransfer.effectAllowed = 'move'; setPicked(u); },
    onDragEnd: () => { setOver(null); setPicked(null); },
  });

  const keys = [...s.blocs.map((b) => b.id), NONE].filter((k) => k !== NONE || seatsIn(NONE) > 0 || picked);
  const schemes = s.blocSchemes ?? [];

  return (
    <aside className="panel side-panel bloc-panel" aria-label={L('Edit blocs', 'עריכת גושים')}>
      {ds && <div className="sheet-scenario-switcher"><ScenarioSwitcher s={s} ds={ds} /></div>}
      <header className="sp-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: 0 }}>{L('Blocs', 'גושים')}</h2>
          <div className="small ink2">{L('Drag a list or party to another bloc, or choose it and then the bloc. Seats and votes do not change.', 'גררו רשימה או מפלגה לגוש אחר, או בחרו בה ואז בגוש. המנדטים והקולות אינם משתנים.')}</div>
        </div>
        <button className="btn ghost icon-only" aria-label={L('Close', 'סגירה')} onClick={() => setState({ blocPanel: null })}><X className="icon" aria-hidden /></button>
      </header>
      <div className="sp-body">
        <FamilyGroupingLink />
        <StartFrom s={s} part="blocs" />
        <button className="btn small" onClick={()=>dispatch({type:'resetColors'})}>{L('Reset colours','איפוס צבעים')}</button>
        <p className="tiny muted">{L(`Vote changes here are balanced by: ${voteSourceLabel(src, s, lang)}`, `שינויי קולות כאן מתקזזים מול: ${voteSourceLabel(src, s, lang)}`)}</p>
        <p className="small">{groupingLabel(s, lang)} <AnalysisEdits s={s} outlet="bloc-panel" /></p>
        {picked && (
          <p className="bp-picked small" role="status">
            {L(`Moving ${chipLabel(picked)}: choose a bloc.`, `מעבירים את ${chipLabel(picked)}: בחרו גוש.`)}
            <button className="btn small ghost" onClick={() => setPicked(null)}>{L('Cancel', 'ביטול')}</button>
          </p>
        )}
        <ol className="bp-cards">
          {keys.map((k) => {
            const b = s.blocs.find((x) => x.id === k);
            const color = b?.color ?? '#8a9099';
            const n = seatsIn(k);
            const target = !!picked && over !== null ? over === k : false;
            const units_ = units.get(k) ?? [];
            return (
              <li key={k} ref={(el) => { cards.current[k] = el; }} className={`bp-card ${focus === k ? 'focus' : ''} ${target ? 'over' : ''} ${picked && picked.home !== k ? 'can-drop' : ''}`}
                style={{ ['--bc' as string]: color }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (over !== k) setOver(k); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver((o) => (o === k ? null : o)); }}
                onDrop={(e) => { e.preventDefault(); if (picked && picked.home !== k) move(picked, k); }}>
                <div className="bp-head">
                  {b ? <>
                    <button className="bp-swatch" style={{ background: color }} aria-label={L(`Colour of ${name(b)}`, `הצבע של ${name(b)}`)} aria-expanded={paletteFor === k} onClick={() => setPaletteFor(paletteFor === k ? null : k)} />
                    <EditMarker s={s} path={['blocs', k, 'color']} /><EditMarker s={s} path={['blocs', k, lang === 'he' ? 'nameHe' : 'nameEn']} />
                    <BlocName key={`${k}-${lang}-${name(b)}`} value={name(b)} autoFocus={fresh === k} label={L('Bloc name', 'שם הגוש')} onCommit={(v) => { setFresh(null); if (v && v !== name(b)) rename(k, v); }} />{b.appDefined && !s.blocSchemes?.find(g => g.id === s.blocSchemeId)?.appDefined && <small title={appGroupingExplanation(lang)}>· {appGroupingTag(lang)}</small>}
                  </> : <><span className="bp-swatch none" aria-hidden /><b className="bp-name-static">{L('No bloc', 'ללא גוש')}</b></>}
                  <span className="bp-seats"><b>{n}</b><small>{n >= majority ? L('majority', 'רוב') : L(`${majority - n} short`, `חסרים ${majority - n}`)}</small></span>
                  {b && <button className="btn small ghost danger icon-only" aria-label={L(`Delete the bloc ${name(b)} (its members move to no bloc)`, `מחיקת הגוש ${name(b)} (חבריו יעברו ל"ללא גוש")`)} onClick={() => remove(k)}><Trash2 className="icon sm" aria-hidden /></button>}
                </div>
                {b && paletteFor === k && (
                  <div className="bp-palette" role="group" aria-label={L('Colours', 'צבעים')}>
                    {PALETTE.map((c) => <button key={c} style={{ background: c }} aria-label={c} aria-pressed={c.toLowerCase() === color.toLowerCase()} onClick={() => { recolour(k, c); setPaletteFor(null); }} />)}
                    <label className="bp-custom">{L('Other…', 'אחר…')}<input type="color" value={color} onChange={(e) => recolour(k, e.target.value)} /></label>
                  </div>
                )}
                <div className="bp-meter" aria-hidden><i style={{ width: `${Math.min(100, (n / total) * 100)}%` }} /><span style={{ insetInlineStart: `${((majority - 0.5) / total) * 100}%` }} /></div>
                <BlocVoteStepper s={s} r={r} bloc={k === NONE ? null : k} />
                <ul className="bp-chips">
                  {units_.map((u) => {
                    const l = listOf(u.listId);
                    const p = u.kind === 'list' ? undefined : partyOf(u.listId, u.partyId);
                    const chosen = picked?.key === u.key;
                    return (
                      <li key={u.key}>
                        <span className={`bp-chip ${chosen ? 'picked' : ''} ${u.kind === 'member' ? 'fixed' : ''} ${u.kind === 'list' && u.parties.length > 1 ? 'joint' : ''}`}>
                          <button type="button" className="bp-chip-main" aria-pressed={chosen} disabled={u.kind === 'member'}
                            title={u.kind === 'member' ? L('Placed member by member by the sourced grouping; moves with the list', 'שובצו חבר אחר חבר לפי החלוקה המתועדת; זזים עם הרשימה') : undefined}
                            onClick={() => setPicked(chosen ? null : u)} {...(u.kind === 'member' ? {} : dragProps(u))}>
                            <Slip size="sm" letters={p ? '' : l.letters} name={p ? name(p) : listLabel(l,lang)} color={p?.color ?? l.color} logo={p ? p.logo : l.logo} synthetic={p ? undefined : l.synthetic} />
                            <span className="bp-chip-name">{chipLabel(u)}<EditMarker s={s} path={u.kind === 'party' ? ['partyBlocs', u.partyId] : ['lists', u.listId, 'bloc']} /></span>
                            <b className="tabnum">{u.n}</b>
                          </button>
                          {u.kind === 'list' && u.parties.length > 1 && (
                            <span className="bp-subchips">
                              {u.parties.map((x) => {
                                const pp = partyOf(u.listId, x.partyId)!;
                                const unit = moveParty(u.listId, x.partyId, u.home);
                                const subChosen = picked?.key === unit.key;
                                return (
                                  <button key={x.partyId} type="button" className={`bp-sub ${subChosen ? 'picked' : ''}`} aria-pressed={subChosen}
                                    aria-label={L(`${name(pp)}, ${x.n === 1 ? '1 seat' : `${x.n} seats`}: move this party on its own`, `${name(pp)}, ${x.n === 1 ? 'מנדט אחד' : `${x.n} מנדטים`}: העברת המפלגה לבדה`)}
                                    onClick={() => setPicked(subChosen ? null : unit)} {...dragProps(unit)}>
                                    <Slip size="sm" letters="" name={name(pp)} color={pp.color ?? l.color} logo={pp.logo} />{name(pp)} <b className="tabnum">{x.n}</b>
                                  </button>
                                );
                              })}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                  {!units_.length && <li className="tiny muted">{L('No seats yet: drag a list here.', 'אין עדיין מנדטים: גררו לכאן רשימה.')}</li>}
                </ul>
                {picked && picked.home !== k && (
                  <button className="btn small primary bp-here" onClick={() => move(picked, k)}>{b ? L(`Move here`, 'העברה לכאן') : L('Leave without a bloc', 'השארה ללא גוש')}</button>
                )}
              </li>
            );
          })}
        </ol>
        <button className="btn bp-add" onClick={addBloc}><Plus className="icon sm" aria-hidden />{L('New bloc', 'גוש חדש')}</button>
        <p className="tiny muted" style={{ marginTop: 10 }}>{s.blocSchemeId === null && schemes.length
          ? L('Your grouping. The sourced groupings stay available under “Start from”; Undo reverses any change.', 'החלוקה שלכם. החלוקות המתועדות נשארות זמינות תחת "נקודת מוצא"; ביטול מחזיר כל שינוי.')
          : L('Editing never alters a sourced grouping: your changes become “Your grouping”. Undo reverses any change.', 'עריכה לעולם אינה משנה חלוקה מתועדת: השינויים הופכים ל"החלוקה שלכם". ביטול מחזיר כל שינוי.')}</p>
      </div>
    </aside>
  );
}

/** A bloc's name, edited where it is shown; Enter or leaving the field keeps it, Escape restores it. */
function BlocName({ value, onCommit, label, autoFocus }: { value: string; onCommit: (v: string) => void; label: string; autoFocus?: boolean }) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) { ref.current?.focus(); ref.current?.select(); } }, [autoFocus]);
  return (
    <input ref={ref} className="bp-name" type="text" value={text} aria-label={label} dir="auto"
      onChange={(e) => setText(e.target.value)} onBlur={() => onCommit(text.trim() || value)}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape' && text !== value) { setText(value); e.stopPropagation(); } }} />
  );
}
