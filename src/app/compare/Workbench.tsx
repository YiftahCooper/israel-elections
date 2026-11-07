// The Compare workbench (docs/design/compare-workbench.md): two live sides pinned left → right in both languages,
// their chambers and blocs, one head-to-head table of paired lists, and copies between the sides.
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ArrowLeftRight, MoreHorizontal, Redo2, Undo2 } from 'lucide-react';
import { inputPart } from '../../model/editScopes.ts';
import { PARTS, partSnapshot } from '../../model/parts.ts';
import { allocationOf, editPathLabel, electedOf, listLabel, markerReference, METHODS, resultChanges } from '../derive.ts';
import { baselineOf } from '../factionDefaults.ts';
import { changeText } from '../changeValue.tsx';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, fmtPp, fmtRat, pctExactNote } from '../format.ts';
import { setState, toast, useDigits, useLevel, useSetting, useStore } from '../store.ts';
import { Floating } from '../floating.tsx';
import { Hemicycle } from '../components/Hemicycle.tsx';
import { SeatDelta } from '../components/SeatDelta.tsx';
import { CandidateName } from '../components/CandidateName.tsx';
import { Info, Slip } from '../components/ui.tsx';
import { matchRows, copyUnit, type MatchRow } from './match.ts';
import { planAgreements, planColour, planRoster, planRules, planTotals, planVotes, type CopyUnit, type Plan } from './copy.ts';
import { remembered } from './answers.ts';
import { COPY_ARROWS, COMPARE_MAIN_SIDE, comparisonLink, comparisonOf, openComparison, pairKey, saveComparison, savedComparisons, setOverrides, setSwap } from './sides.ts';
import { cellsOf, listMarks, sourceOf, unitsFor, type Cells, type SideModel } from './model.ts';
import { CopyVotesDialog, MatchingPanel, RowSheet, SaveDialog, VotesEditor, WholeListDialog, tagText, TAG_INFO, type CopyRequest, type WholeRequest } from './dialogs.tsx';
import { markerLead } from './copyText.ts';
import { ChoicePicker } from '../components/ChoicePicker.tsx';
import { partyLabel as partyName } from '../../families/registry.ts';
import { narrowerThan } from '../textScale.ts';
import './compare.css';

type Dir = 'toRight' | 'toLeft';
type Filter = 'all' | 'different' | 'edited' | 'unmatched';
const narrow = () => narrowerThan(760);

export function Workbench({ main, other, picker }: { main: SideModel; other: SideModel; picker: ReactNode }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const { simple, expert } = useLevel();
  const swapPref = useStore((st) => st.compare.swap);
  const pair = pairKey(main.sc.electionId, other.sc.electionId);
  const overrides = useStore((st) => st.compare.overrides[pair]) ?? [];
  // the main scenario is on the right; between elections, the earlier one is on the left unless the user swapped
  const otherLater = other.ds.electionDate > main.ds.electionDate;
  const mainLeft = swapPref ?? (otherLater || COMPARE_MAIN_SIDE === 'left');
  const [left, right] = mainLeft ? [main, other] : [other, main];
  const cross = left.sc.electionId !== right.sc.electionId;
  /** how a side is named in "Copy … to X": its year between elections, its own name within one */
  const nameOf = (x: SideModel) => cross ? x.year : x.name;
  const sideOf = (d: Dir) => d === 'toRight' ? { from: left, to: right } : { from: right, to: left };

  const rows = useMemo(() => matchRows(left.sc, right.sc, overrides), [left.sc, right.sc, overrides]);
  // a stable order: the starting points' seats, so rows never move while either side is edited
  const order = useMemo(() => {
    const rs = allocationOf(right.start), ls = allocationOf(left.start);
    const seat = (r: typeof rs, ids: string[]) => ids.reduce((t, id) => t + (r.lists.find((l) => l.id === id)?.seats ?? 0), 0);
    const vote = (sc: typeof right.start, ids: string[]) => ids.reduce((t, id) => t + (sc.lists.find((l) => l.id === id)?.votes ?? 0), 0);
    const score = (row: MatchRow) => row.right.length ? [1, seat(rs, row.right), vote(right.start, row.right)] : [0, seat(ls, row.left), vote(left.start, row.left)];
    const groupScore = new Map<string, number[]>();
    for (const row of rows) if (row.group && row.left.length) groupScore.set(row.group, score(row));
    const keyOf = (row: MatchRow) => row.group ? groupScore.get(row.group) ?? score(row) : score(row);
    return [...rows].sort((a, b) => { const x = keyOf(a), y = keyOf(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i]; if (a.group && a.group === b.group) return (b.left.length ? 1 : 0) - (a.left.length ? 1 : 0) || score(b)[1] - score(a)[1]; return a.key.localeCompare(b.key); });
  }, [rows, left.start, right.start]);

  const [filter, setFilter] = useState<Filter>('all');
  const [kept, setKept] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  // Settings → Lists with no seats sets where the table starts (All: shown; Over 0.5%: those with at least 0.5% on
  // either side; Folded: none); the switch here shows or hides all of them for this visit
  const seatlessLists = useSetting('seatlessLists');
  const [zeroPick, setZero] = useState<boolean | null>(null);
  const zero = zeroPick ?? seatlessLists === 'all';
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<{ row: MatchRow; anchor: HTMLElement } | null>(null);
  const [copyReq, setCopyReq] = useState<CopyRequest | null>(null);
  const [wholeReq, setWholeReq] = useState<WholeRequest | null>(null);
  const [editing, setEditing] = useState<{ side: SideModel; listId: string } | null>(null);
  const [sheet, setSheet] = useState<MatchRow | null>(null);
  const [matching, setMatching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focusSide, setFocusSide] = useState<'main' | 'other' | null>(null);

  const view = (row: MatchRow) => ({ l: cellsOf(left, row.left), r: cellsOf(right, row.right) });
  const qualifies = (row: MatchRow, f: Filter) => {
    const { l, r } = view(row);
    const marked = row.left.some((id) => listMarks(left, id).length) || row.right.some((id) => listMarks(right, id).length);
    if (f === 'edited') return marked;
    if (f === 'unmatched') return row.tag === 'new' || row.tag === 'ended' || row.tag === 'check';
    if (f === 'different') return marked || (l?.seats ?? 0) !== (r?.seats ?? 0) || !cross && (l?.votes ?? 0) !== (r?.votes ?? 0) || !!row.group;
    return true;
  };
  const hasSeats = (row: MatchRow) => { const { l, r } = view(row); const inGroup = row.group && order.some((x) => x.group === row.group && ((cellsOf(left, x.left)?.seats ?? 0) > 0 || (cellsOf(right, x.right)?.seats ?? 0) > 0)); const notable = !zeroPick && seatlessLists === 'over' && [l, r].some((c) => c && c.total > 0 && c.votes * 200 >= c.total);
    return (l?.seats ?? 0) > 0 || (r?.seats ?? 0) > 0 || !!inGroup || notable || row.right.some((id) => listMarks(right, id).length) || row.left.some((id) => listMarks(left, id).length); };
  const matchesQuery = (row: MatchRow) => !query.trim() || [...row.left.map((id) => left.sc.lists.find((l) => l.id === id)), ...row.right.map((id) => right.sc.lists.find((l) => l.id === id))]
    .some((l) => l && `${l.nameHe} ${l.shortHe} ${l.shortEn ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const counts = Object.fromEntries((['all', 'different', 'edited', 'unmatched'] as Filter[]).map((f) => [f, order.filter((r) => qualifies(r, f) && (f === 'unmatched' || zero || hasSeats(r))).length])) as Record<Filter, number>;
  const visible = order.filter((row) => (qualifies(row, filter) || kept.has(row.key)) && (zero || filter === 'unmatched' || hasSeats(row)) && matchesQuery(row));
  const pickFilter = (f: Filter) => { setFilter(f); setKept(new Set()); };
  const toCheck = rows.filter((r) => r.tag === 'check').length;

  // ---- copies
  const commit = (plan: Plan & { ok: true }, to: SideModel, text: string) => {
    if (!to.apply(plan.action)) return false;
    setFocusSide(to.role);
    const seats = allocationOf(plan.result);
    const ids = plan.targets.map((t) => t.listId);
    const n = (id: string) => { const l = plan.result.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : ''; };
    // announced politely (the toast is a status region): "Votes copied to 2026. Likud 30 seats."
    toast('info', `${text}${ids.length === 1 ? ` ${n(ids[0])} ${seats.lists.find((x) => x.id === ids[0])?.seats ?? 0} ${L('seats', 'מנדטים')}.` : ''}`);
    return true;
  };
  const votesTitle = (units: CopyUnit[], from: SideModel, to: SideModel) => {
    const names = units.map((u) => u.src.map((id) => { const l = from.sc.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; }).join(' + '));
    return names.length === 1 ? L(`Copy ${names[0]}’s votes to ${nameOf(to)}`, `העתקת הקולות של ${names[0]} ל${cross ? '־' : ''}${nameOf(to)}`) : L(`Copy the votes of ${names.length} rows to ${nameOf(to)}`, `העתקת הקולות של ${names.length} שורות ל${cross ? '־' : ''}${nameOf(to)}`);
  };
  const copyVotes = (units: CopyUnit[], d: Dir, ask = false) => {
    const { from, to } = sideOf(d);
    const one = units.length === 1 && units[0].dst.length === 1 ? units[0].dst[0] : null;
    const title = votesTitle(units, from, to);
    const rem = remembered(to.sc, one, cross);
    if (!ask && rem.mode && rem.source) {
      const plan = planVotes({ from: sourceOf(from), to: to.sc, ctx: { base: to.start }, units, mode: rem.mode, policy: rem.source });
      if (!plan.ok) { toast('error', lang === 'he' ? plan.reason.he : plan.reason.en); return; }
      commit(plan, to, L(`Votes copied to ${nameOf(to)}.`, `הקולות הועתקו ל${cross ? '־' : ''}${nameOf(to)}.`));
      return;
    }
    setCopyReq({ from, to, units, title, cross });
  };
  const direct = (plan: Plan, to: SideModel, text: string) => {
    if (!plan.ok) { toast('error', lang === 'he' ? plan.reason.he : plan.reason.en); return; }
    commit(plan, to, text);
  };
  const copyField = (field: 'turnout' | 'registered' | 'invalid' | 'threshold' | 'rules' | 'agreements', d: Dir) => {
    const { from, to } = sideOf(d);
    const done = L(`Copied to ${nameOf(to)}.`, `הועתק ל${cross ? '־' : ''}${nameOf(to)}.`);
    if (field === 'threshold' || field === 'rules') return direct(planRules({ from: sourceOf(from), to: to.sc, ctx: { base: to.start }, what: field }), to, done);
    if (field === 'agreements') {
      const plan = planAgreements({ from: sourceOf(from), to: to.sc, ctx: { base: to.start }, rows, direction: d });
      const skipped = plan.skipped?.length ? L(` ${plan.skipped.length} not copied: no matching pair.`, ` ${plan.skipped.length} לא הועתקו: אין זוג מתאים.`) : '';
      return direct(plan, to, done + skipped);
    }
    direct(planTotals({ from: sourceOf(from), to: to.sc, ctx: { base: to.start }, field }), to, done);
  };
  const oneToOne = (row: MatchRow, d: Dir) => { const u = copyUnit(row, rows, d); return u && u.src.length === 1 && u.dst.length === 1 ? u : null; };

  const arrow = (row: MatchRow | null, units: CopyUnit[] | null, d: Dir, what: string) => {
    const { to } = sideOf(d);
    const label = units ? L(`Copy ${what}’s votes to ${nameOf(to)}`, `העתקת הקולות של ${what} ל${cross ? '־' : ''}${nameOf(to)}`) : row?.tag === 'check' ? L('Accept or reject this match first', 'אשרו או דחו קודם את ההתאמה') : row?.group ? L('Votes of a split list can’t be divided by list: copy the group', 'אין לחלק קולות של רשימה מפוצלת לפי רשימה: העתיקו את הקבוצה') : L('No counterpart to copy', 'אין מקבילה להעתקה');
    return <button type="button" className="cmp-arrow" aria-label={label} title={label} disabled={!units} onClick={(e) => { e.stopPropagation(); if (units) copyVotes(units, d); }}>{d === 'toRight' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}</button>;
  };

  // ---- the row menu (both directions, every field); on a phone the row sheet instead
  const menuItems = (row: MatchRow, close: () => void) => {
    const items: ReactNode[] = [];
    const btn = (k: string, text: string, run: () => void, disabled = false) => <button key={k} type="button" className="btn small ghost cmp-menu-item" disabled={disabled} onClick={() => { close(); run(); }}>{text}</button>;
    for (const d of ['toRight', 'toLeft'] as Dir[]) {
      const { from, to } = sideOf(d);
      const u = copyUnit(row, rows, d), one = oneToOne(row, d);
      const srcOnly = d === 'toRight' ? row.left.length && !row.right.length : row.right.length && !row.left.length;
      items.push(<p key={`h${d}`} className="cmp-menu-head">{L(`To ${nameOf(to)}`, `אל ${nameOf(to)}`)} <span aria-hidden>{d === 'toRight' ? '→' : '←'}</span></p>);
      if (u) {
        items.push(btn(`v${d}`, L('Votes', 'קולות'), () => copyVotes([u], d)));
        items.push(btn(`va${d}`, L('Votes as…', 'קולות לפי…'), () => copyVotes([u], d, true)));
      }
      if (one && !simple) {
        items.push(btn(`w${d}`, L('Whole list…', 'הרשימה כולה…'), () => setWholeReq({ from, to, srcId: one.src[0], dstId: one.dst[0], cross })));
        items.push(btn(`c${d}`, L('Candidates', 'מועמדים'), () => direct(planRoster({ from: sourceOf(from), to: to.sc, ctx: { base: to.start }, srcId: one.src[0], dstId: one.dst[0] }), to, L(`Candidates copied to ${nameOf(to)}.`, `המועמדים הועתקו ל${cross ? '־' : ''}${nameOf(to)}.`))));
        items.push(btn(`k${d}`, L('Colour', 'צבע'), () => direct(planColour({ from: sourceOf(from), to: to.sc, ctx: { base: to.start }, srcId: one.src[0], dstId: one.dst[0] }), to, L(`Colour copied to ${nameOf(to)}.`, `הצבע הועתק ל${cross ? '־' : ''}${nameOf(to)}.`))));
      }
      if (srcOnly && !simple) for (const id of d === 'toRight' ? row.left : row.right) items.push(btn(`a${d}${id}`, L('Add as a new list…', 'הוספה כרשימה חדשה…'), () => setWholeReq({ from, to, srcId: id, dstId: null, cross })));
      if (!u && !srcOnly) items.push(<p key={`n${d}`} className="tiny muted cmp-menu-note">{row.tag === 'check' ? L('Accept or reject the match first.', 'אשרו או דחו קודם את ההתאמה.') : L('No counterpart.', 'אין מקבילה.')}</p>);
    }
    items.push(<hr key="hr" />);
    for (const x of [left, right]) for (const id of (x === left ? row.left : row.right)) {
      const l = x.sc.lists.find((y) => y.id === id)!;
      items.push(btn(`e${x.role}${id}`, L(`Edit votes: ${listLabel(l, 'en')} ${x.year}`, `עריכת קולות: ${listLabel(l, 'he')} ${x.year}`), () => setEditing({ side: x, listId: id })));
      if (x.role === 'main') items.push(btn(`o${id}`, L(`Open ${listLabel(l, 'en')}`, `פתיחת ${listLabel(l, 'he')}`), () => setState({ selectedListId: id })));
    }
    if (!simple && cross) items.push(btn('m', row.tag === 'check' ? L('Check this match…', 'בדיקת ההתאמה…') : L('Matching…', 'התאמת רשימות…'), () => setMatching(true)));
    return items;
  };

  // ---- selection (Standard and Expert)
  const unitSel = (d: Dir) => unitsFor(order, selected, rows, d, copyUnit);
  const toggle = (row: MatchRow) => {
    const keys = row.group ? order.filter((x) => x.group === row.group).map((x) => x.key) : [row.key];
    const next = new Set(selected); const on = !selected.has(row.key);
    keys.forEach((k) => on ? next.add(k) : next.delete(k)); setSelected(next);
  };

  const share = async () => {
    const link = await comparisonLink(comparisonOf(main.sc, other.sc, swapPref, overrides));
    try { await navigator.clipboard.writeText(link); toast('info', L('Link copied. It opens both sides and your pairings.', 'הקישור הועתק. הוא פותח את שני הצדדים ואת ההתאמות שלכם.')); }
    catch { toast('error', L('The browser refused to copy the link.', 'הדפדפן סירב להעתיק את הקישור.')); }
  };
  const savedList = savedComparisons();

  const onKey = (e: KeyboardEvent) => {
    // Ctrl/⌘ Z and Y act on the side last edited or focused; the main side is the board's own history
    if (focusSide !== 'other' || !(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'z' || k === 'y') { e.preventDefault(); if (k === 'y' || e.shiftKey) other.redo(); else other.undo(); }
  };

  const groupLines = new Map<string, MatchRow>();
  for (const row of visible) if (row.group) groupLines.set(row.group, row);

  return <div className="cmp-wb" data-arrows={COPY_ARROWS} onKeyDown={onKey}>
    <div className="row cmp-panel-head">
      <span className="cmp-head-actions">
        {savedList.length > 0 && <ChoicePicker label={L('Saved comparisons', 'השוואות שמורות')} placeholder={L('Saved comparisons', 'השוואות שמורות')} value="" options={savedList.map((c) => ({ value: c.id, label: c.name, detail: new Date(c.savedAt).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB') }))} onChange={(id) => { const c = savedList.find((x) => x.id === id); if (c) void openComparison(c.link); }} />}
        <button type="button" className="btn small" onClick={() => setSaving(true)}>{L('Save comparison', 'שמירת ההשוואה')}</button>
        <button type="button" className="btn small" onClick={() => void share()}>{L('Copy link', 'העתקת קישור')}</button>
      </span>
    </div>

    <div className="cmp-sides" dir="ltr">
      {[left, right].map((x, i) => <SideCard key={x.role} x={x} picker={x.role === 'other' ? picker : null} focused={focusSide === x.role} onFocus={() => setFocusSide(x.role)} align={i === 0 ? 'left' : 'right'} />)}
      <div className="cmp-centre">
        <button type="button" className="btn small cmp-swap" onClick={() => { setSwap(!mainLeft); setCopyReq(null); setWholeReq(null); setMenu(null); }} aria-label={L('Swap sides', 'החלפת הצדדים')} title={L('Swap sides', 'החלפת הצדדים')}><ArrowLeftRight size={16} /><span>{L('Swap', 'החלפה')}</span></button>
        <span className="tiny muted cmp-centre-key" dir={lang === 'he' ? 'rtl' : 'ltr'}>{L('Change:', 'שינוי:')} <bdi dir="ltr">{nameOf(right)} − {nameOf(left)}</bdi></span>
      </div>
    </div>

    <div className="cmp-toolbar row">
      <span className="cmp-filters" role="group" aria-label={L('Show rows', 'הצגת שורות')}>
        {([['all', L('All', 'הכול')], ['different', L('Different', 'שונות')], ['edited', L('Edited', 'נערכו')], ['unmatched', L('Unmatched', 'ללא התאמה')]] as [Filter, string][]).map(([f, t]) =>
          <button key={f} type="button" className={`btn small ${filter === f ? 'primary' : 'ghost'}`} aria-pressed={filter === f} onClick={() => pickFilter(f)}>{t} <span className="cmp-count">{counts[f]}</span></button>)}
      </span>
      {!simple && <input type="search" className="cmp-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={L('Find a list…', 'חיפוש רשימה…')} aria-label={L('Find a list', 'חיפוש רשימה')} />}
      {!simple && <label className="cmp-switch small"><input type="checkbox" checked={zero} onChange={(e) => setZero(e.target.checked)} />{L('Lists with no seats', 'רשימות ללא מנדטים')}</label>}
      {cross && <button type="button" className="btn small" onClick={() => setMatching(true)} disabled={simple && !toCheck}>{L('Matching', 'התאמת רשימות')}{toCheck > 0 && <span className="cmp-tag tag-check">{L(`${toCheck} to check`, `${toCheck} לבדיקה`)}</span>}</button>}
    </div>
    {selected.size > 0 && !simple && (() => { const r = unitSel('toRight'), l = unitSel('toLeft'); return <div className="cmp-selbar row" role="region" aria-label={L('Selected rows', 'שורות שנבחרו')}>
      <b>{L(`${selected.size} selected`, `${selected.size} נבחרו`)}</b>
      {r.skipped > 0 && <span className="small cmp-refused">{L(`${r.skipped} need a decision (no counterpart or to check)`, `${r.skipped} דורשות החלטה (אין מקבילה או לבדיקה)`)}</span>}
      <button type="button" className="btn small" disabled={!r.units.length || r.skipped > 0} onClick={() => copyVotes(r.units, 'toRight')}>{L(`Copy votes → ${nameOf(right)}`, `העתקת קולות ← ${nameOf(right)}`)}</button>
      <button type="button" className="btn small" disabled={!l.units.length || l.skipped > 0} onClick={() => copyVotes(l.units, 'toLeft')}>{L(`← ${nameOf(left)}`, `${nameOf(left)} →`)}</button>
      <button type="button" className="btn small ghost" onClick={() => setSelected(new Set())}>{L('Clear', 'ניקוי')}</button>
    </div>; })()}

    <div className="tablewrap cmp-tablewrap" role="region" aria-label={L('Lists side by side', 'הרשימות זו מול זו')} tabIndex={0}>
      <table className={`cmp-table ${simple ? 'is-simple' : ''}`} dir="ltr">
        <thead><tr>
          {!simple && <th className="cmp-tick"><span className="sr-only">{L('Select', 'בחירה')}</span></th>}
          <th className="cmp-name cmp-lname" dir={lang === 'he' ? 'rtl' : 'ltr'}>{nameOf(left)}</th><th className="n cmp-v">{L('Votes', 'קולות')}</th><th className="n cmp-s">{L('Share', 'שיעור')}</th><th className="n">{L('Seats', 'מנדטים')}</th>
          <th className="cmp-mid">{L('Change', 'שינוי')}</th>
          <th className="n">{L('Seats', 'מנדטים')}</th><th className="n cmp-s">{L('Share', 'שיעור')}</th><th className="n cmp-v">{L('Votes', 'קולות')}</th><th className="cmp-name cmp-rname" dir={lang === 'he' ? 'rtl' : 'ltr'}>{nameOf(right)}</th>
          <th className="cmp-more"><span className="sr-only">{L('More', 'עוד')}</span></th>
        </tr></thead>
        <tbody>
          {visible.map((row) => {
            const { l, r } = view(row);
            const toR = copyUnit(row, rows, 'toRight'), toL = copyUnit(row, rows, 'toLeft');
            const grouped = !!row.group;
            const d = !grouped && l && r ? r.seats - l.seats : null;
            const shareD = !grouped && l && r && l.total && r.total ? { num: 100n * (BigInt(r.votes) * BigInt(l.total) - BigInt(l.votes) * BigInt(r.total)), den: BigInt(l.total) * BigInt(r.total) } : null;
            const what = (r ?? l)?.lists.map((x) => listLabel(x, lang)).join(' + ') ?? '';
            const last = row.group && groupLines.get(row.group) === row;
            const isSel = selected.has(row.key);
            return [<tr key={row.key} className={`cmp-row ${isSel ? 'selected' : ''}`} data-tag={row.tag} data-row={row.key}
              onClick={(e) => { if (narrow() && !(e.target as HTMLElement).closest('button,input,a')) setSheet(row); }}>
              {!simple && <td className="cmp-tick"><input type="checkbox" checked={isSel} onChange={() => toggle(row)} aria-label={L(`Select ${what}`, `בחירת ${what}`)} /></td>}
              <NameCell x={left} c={l} row={row} side="left" lang={lang} />
              <td className="n cmp-v">{l ? <VotesCell x={left} c={l} onEdit={(id) => setEditing({ side: left, listId: id })} /> : null}</td>
              <td className="n cmp-s" title={l ? pctExactNote(l.votes, l.total, digits, left.sc.rules.thresholdPct, lang) : undefined}>{l && <bdi dir="ltr">{fmtPct(l.votes, l.total, digits, left.sc.rules.thresholdPct)}</bdi>}</td>
              <td className="n cmp-seats cmp-ls">{l ? <b>{l.seats}</b> : null}</td>
              <td className="cmp-mid">
                <span className="cmp-mid-in">
                  {arrow(row, toL && !grouped ? [toL] : null, 'toLeft', what)}
                  <span className="cmp-delta">
                    {grouped ? <span className="tiny muted">{L('see group', 'ראו קבוצה')}</span> : d !== null ? <SeatDelta value={d} /> : <span className="muted">—</span>}
                    {!simple && shareD && shareD.num !== 0n && <span className="tiny muted cmp-pp"><bdi dir="ltr">{fmtPp(shareD, digits)}{L(' pp', ' נק׳')}</bdi></span>}
                    <span className={`cmp-tag tag-${row.tag}`} title={L(...TAG_INFO[row.tag])}>{tagText(row.tag, L)}</span>
                  </span>
                  {arrow(row, toR && !grouped ? [toR] : null, 'toRight', what)}
                </span>
              </td>
              <td className="n cmp-seats cmp-rs">{r ? <b>{r.seats}</b> : null}</td>
              <td className="n cmp-s" title={r ? pctExactNote(r.votes, r.total, digits, right.sc.rules.thresholdPct, lang) : undefined}>{r && <bdi dir="ltr">{fmtPct(r.votes, r.total, digits, right.sc.rules.thresholdPct)}</bdi>}</td>
              <td className="n cmp-v">{r ? <VotesCell x={right} c={r} onEdit={(id) => setEditing({ side: right, listId: id })} /> : null}</td>
              <NameCell x={right} c={r} row={row} side="right" lang={lang} />
              <td className="cmp-more"><button type="button" className="btn small ghost cmp-more-btn" aria-label={L(`More for ${what}`, `עוד עבור ${what}`)} aria-haspopup="dialog" aria-expanded={menu?.row.key === row.key}
                onClick={(e) => { e.stopPropagation(); if (narrow()) setSheet(row); else setMenu(menu?.row.key === row.key ? null : { row, anchor: e.currentTarget }); }}><MoreHorizontal size={16} /></button></td>
            </tr>,
            last ? <GroupLine key={`${row.group}:line`} group={row.group!} rows={rows} left={left} right={right} simple={simple} copy={(u, dir) => copyVotes([u], dir)} nameOf={nameOf} /> : null];
          })}
          {!visible.length && <tr><td colSpan={11} className="muted small cmp-none">{L('No rows here. Choose All to see every list.', 'אין כאן שורות. בחרו "הכול" כדי לראות את כל הרשימות.')}</td></tr>}
        </tbody>
      </table>
    </div>

    <KeyBand left={left} right={right} simple={simple} expert={expert} copy={copyField} nameOf={nameOf} />

    {!cross && <People left={left} right={right} />}
    {cross && <p className="small muted">{L('Lists are paired from party records', 'הרשימות מותאמות לפי רישומי המפלגות')} <Info title={L('Pairing lists', 'התאמת רשימות')}>{L('Pairs come from the party registry and documented lineage, never from names or ballot letters. A copy is a snapshot: later edits on the other side don’t change it. Seats are always recalculated.', 'ההתאמות לפי מרשם המפלגות והשושלת המתועדת, לעולם לא לפי שמות או אותיות. העתקה היא תמונת מצב: עריכות מאוחרות בצד השני אינן משנות אותה. המנדטים תמיד מחושבים מחדש.')}</Info></p>}

    {menu && createPortal(<Floating anchor={() => menu.anchor.getBoundingClientRect()} className="cmp-menu" role="dialog" label={L('Row actions', 'פעולות לשורה')}>
      <span className="cmp-menu-in" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setMenu(null); menu.anchor.focus(); } }}>
        {menuItems(menu.row, () => setMenu(null))}
        <button type="button" className="btn small ghost cmp-menu-item" onClick={() => setMenu(null)}>{L('Close', 'סגירה')}</button>
      </span>
    </Floating>, document.body)}
    {copyReq && <CopyVotesDialog req={copyReq} onClose={() => setCopyReq(null)} onDone={(plan, req) => { if (commit(plan, req.to, L(`Votes copied to ${nameOf(req.to)}.`, `הקולות הועתקו ל${cross ? '־' : ''}${nameOf(req.to)}.`))) setCopyReq(null); }} />}
    {wholeReq && <WholeListDialog req={wholeReq} onClose={() => setWholeReq(null)} onDone={(plan, text) => { if (commit(plan, wholeReq.to, text + '.')) setWholeReq(null); }} />}
    {editing && <VotesEditor side={editing.side} listId={editing.listId} onClose={() => setEditing(null)} />}
    {matching && <MatchingPanel rows={order} left={left} right={right} overrides={overrides} setOverrides={(o) => setOverrides(pair, o)} onClose={() => setMatching(false)} />}
    {sheet && <RowSheet row={sheet} left={left} right={right} onClose={() => setSheet(null)} actions={<>{menuItems(sheet, () => setSheet(null))}</>} />}
    {saving && <SaveDialog suggested={`${nameOf(left)} ↔ ${nameOf(right)}`} onClose={() => setSaving(false)} onSave={(name) => {
      if (saveComparison(name, comparisonOf(main.sc, other.sc, swapPref, overrides))) { toast('info', L('Comparison saved in this browser.', 'ההשוואה נשמרה בדפדפן זה.')); setSaving(false); }
      else toast('error', L('The browser refused to save (storage full or blocked).', 'הדפדפן סירב לשמור (האחסון מלא או חסום).'));
    }} />}
  </div>;
}

/** One side: its picker or name, identity, own undo/redo and Start over, chamber and blocs. */
function SideCard({ x, picker, focused, onFocus, align }: { x: SideModel; picker: ReactNode; focused: boolean; onFocus: () => void; align: 'left' | 'right' }) {
  const L = useL(), lang = useLang();
  const elections = useStore((st) => st.elections);
  const e = elections.find((y) => y.id === x.sc.electionId);
  const changes = resultChanges(x.sc, baselineOf(x.ds)).length;
  const title = `${x.year} · ${x.name}`;
  return <section className={`cmp-card ${focused ? 'focused' : ''}`} data-side={align} data-role={x.role} style={{ borderColor: x.frame }} dir={lang === 'he' ? 'rtl' : 'ltr'} onPointerDown={onFocus} onFocus={onFocus} aria-label={title}>
    <div className="cmp-card-head">
      <span className="cmp-card-election"><b>{e ? x.year : x.sc.electionId}</b> <span className="muted small">{e ? (lang === 'he' ? `הכנסת ה־${e.knesset}` : `${e.knesset}th Knesset`.replace(/^(\d*1)th/, '$1st').replace(/^(\d*2)th/, '$2nd').replace(/^(\d*3)th/, '$3rd').replace(/^1([123])(st|nd|rd)/, '1$1th')) : ''}</span></span>
      {picker}
    </div>
    <div className="cmp-identity">
      {/* the official result keeps a neutral identity: no swatch (an empty square would read as a checkbox) */}
      {!x.official && <span className="swatch" style={{ background: x.frame }} aria-hidden />}
      <b><bdi>{x.name}</bdi></b>
      {changes > 0 && <span className="tiny muted">{changes === 1 ? L('1 change from the official result', 'שינוי אחד מהתוצאה הרשמית') : L(`${changes} changes from the official result`, `${changes} שינויים מהתוצאה הרשמית`)}</span>}
      <span className="cmp-card-tools">
        <button type="button" className="btn small ghost" disabled={!x.canUndo} onClick={x.undo} aria-label={L(`Undo on ${x.year}`, `ביטול ב־${x.year}`)} title={L('Undo', 'ביטול')}><Undo2 size={15} /></button>
        <button type="button" className="btn small ghost" disabled={!x.canRedo} onClick={x.redo} aria-label={L(`Redo on ${x.year}`, `חזרה ב־${x.year}`)} title={L('Redo', 'חזרה')}><Redo2 size={15} /></button>
        {(x.role === 'other' ? x.edited : changes > 0) && <button type="button" className="btn small ghost" onClick={x.startOver}>{L('Start over', 'התחלה מחדש')}</button>}
      </span>
    </div>
    {/* the other side's seats open no list: its lists are not the open scenario */}
    <div className="cmp-chamber" onClickCapture={x.role === 'other' ? (ev) => ev.stopPropagation() : undefined}><Hemicycle s={x.sc} r={x.r} reference={x.start} compact paired title={title} /></div>
    {x.edited && <p className="tiny muted cmp-outline-key">{L(`Outlined: seats gained since ${x.role === 'main' ? 'its starting point' : 'the official result'}`, `מתאר: מנדטים שנוספו מאז נקודת ההתחלה`)}</p>}
  </section>;
}

/** The list name, slip, note and its marks (a copied value says where it came from). */
function NameCell({ x, c, row, side, lang }: { x: SideModel; c: Cells | null; row: MatchRow; side: 'left' | 'right'; lang: 'he' | 'en' }) {
  const L = useL();
  const notes = row.notes.filter((n) => n.side === side);
  const cls = `cmp-name cmp-${side === 'left' ? 'lname' : 'rname'}`;
  if (!c) return <td className={cls} data-year={x.year} dir={lang === 'he' ? 'rtl' : 'ltr'}>{row.inLeft && side === 'left' ? <span className="muted small">{L(`in ${listLabel(x.sc.lists.find((l) => l.id === row.inLeft)!, 'en')}`, `בתוך ${listLabel(x.sc.lists.find((l) => l.id === row.inLeft)!, 'he')}`)}</span> : <span className="muted">—</span>}</td>;
  return <td className={cls} data-year={x.year} dir={lang === 'he' ? 'rtl' : 'ltr'}>
    {c.lists.map((l) => { const all = listMarks(x, l.id), isVotes = (m: { path: readonly string[] }) => m.path[0] === 'lists' && m.path[2] === 'votes';
      const marks = all.filter((m) => !isVotes(m)), votes = all.filter(isVotes);
      // the open scenario's lists open their panel, as on every other screen; the other side's lists are not the open scenario
      const name = x.role === 'main'
        ? <button type="button" className="table-action cmp-open" onClick={(e) => { e.stopPropagation(); setState({ selectedListId: l.id }); }}><bdi className="cmp-list-name">{listLabel(l, lang)}</bdi></button>
        : <bdi className="cmp-list-name">{listLabel(l, lang)}</bdi>;
      return <span key={l.id} className="cmp-list"><Slip {...l} name={listLabel(l, lang)} size="sm" />{name}
        {l.withdrawn && <span className="tiny muted"> · {L('withdrew', 'פרשה')}</span>}
        {marks.slice(0, 1).map((m) => <Mark key={m.path.join('/')} x={x} path={m.path} />)}
        {/* on a phone the votes column is hidden: its mark moves here, so a copied or edited value is never unmarked */}
        {!marks.length && votes.slice(0, 1).map((m) => <span key={m.path.join('/')} className="cmp-phone-only"><Mark x={x} path={m.path} /></span>)}
      </span>; })}
    {notes.map((n, i) => <span key={i} className="tiny muted cmp-note">{n.kind === 'with'
      ? L(`with ${n.partyIds.map((p) => partyName(p, 'en')).join(', ')}`, `עם ${n.partyIds.map((p) => partyName(p, 'he')).join(', ')}`)
      : L(`${n.partyIds.map((p) => partyName(p, 'en')).join(', ')} moved on`, `${n.partyIds.map((p) => partyName(p, 'he')).join(', ')} עברה`)}</span>)}
  </td>;
}

function VotesCell({ x, c, onEdit }: { x: SideModel; c: Cells; onEdit: (id: string) => void }) {
  const L = useL(), lang = useLang();
  const marks = c.lists.flatMap((l) => listMarks(x, l.id).filter((m) => m.path[0] === 'lists' && m.path[2] === 'votes'));
  const one = c.lists.length === 1 ? c.lists[0] : null;
  return <span className="cmp-votes">
    {marks.slice(0, 1).map((m) => <Mark key={m.path.join('/')} x={x} path={m.path} />)}
    {one ? <button type="button" className="table-action cmp-vbtn" onClick={(e) => { e.stopPropagation(); onEdit(one.id); }} aria-label={L(`Edit votes: ${listLabel(one, 'en')} ${x.year}`, `עריכת קולות: ${listLabel(one, 'he')} ${x.year}`)}><bdi dir="ltr">{fmtInt(c.votes)}</bdi></button>
      : <bdi dir="ltr" title={c.lists.map((l) => `${listLabel(l, lang)} ${fmtInt(l.votes)}`).join(' · ')}>{fmtInt(c.votes)}</bdi>}
  </span>;
}

/** A side's own marker: "From 2022" for a copied value, "Edited" otherwise; the previous value and Restore. */
function Mark({ x, path }: { x: SideModel; path: readonly string[] }) {
  const L = useL(), lang = useLang();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const origin = listMarks(x, path[1]).find((m) => m.path.join('/') === path.join('/'))?.origin;
  const before = markerReference(x.sc, x.start, path);
  const part = inputPart(path);
  const word = origin ? markerLead(origin, lang, x.sc.electionId).split(' · ')[0].replace(/ \(.*\)$/, '') : L('Edited', 'נערך');
  const text = `${editPathLabel(x.sc, path, lang, x.start)} · ${markerLead(origin, lang, x.sc.electionId)}${changeText(before, path, lang)}`;
  const listId = path[0] === 'lists' ? path[1] : path[2];
  return <>
    <button ref={ref} type="button" className="cmp-mark" data-copied={origin ? 'true' : undefined} aria-label={text} aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>{word}</button>
    {open && createPortal(<Floating anchor={() => ref.current?.getBoundingClientRect()} className="edit-tooltip cmp-mark-pop" role="dialog" label={text}>
      <span onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.focus(); } }}>{text}
        {origin && <span className="tiny muted cmp-snap">{L('A snapshot: later edits on the other side don’t change it.', 'תמונת מצב: עריכות מאוחרות בצד השני אינן משנות אותה.')}</span>}
        {part && <button type="button" className="btn small marker-restore" onClick={() => { x.apply({ type: 'startPart', part, source: 'saved', snapshot: partSnapshot(before, part), name: L('Starting point', 'נקודת ההתחלה'), ...(listId ? { listId } : {}) }); setOpen(false); }}>{L('Restore ', 'שחזור ')}{PARTS[part][lang]}</button>}
        <button type="button" className="btn small ghost" onClick={() => setOpen(false)}>{L('Close', 'סגירה')}</button>
      </span>
    </Floating>, document.body)}
  </>;
}

/** A split: one honest line for the whole group ("Religious Zionism 2022 → 3 lists, 14 → 13"), copied as a whole. */
function GroupLine({ group, rows, left, right, simple, copy, nameOf }: { group: string; rows: MatchRow[]; left: SideModel; right: SideModel; simple: boolean; copy: (u: CopyUnit, d: Dir) => void; nameOf: (x: SideModel) => string }) {
  const L = useL(), lang = useLang();
  const g = rows.filter((r) => r.group === group);
  const lIds = [...new Set(g.flatMap((r) => [...r.left, ...(r.inLeft ? [r.inLeft] : [])]))], rIds = g.flatMap((r) => r.right);
  const l = cellsOf(left, lIds)!, r = cellsOf(right, rIds)!;
  const name = lIds.map((id) => listLabel(left.sc.lists.find((x) => x.id === id)!, lang)).join(' + ');
  const toR = copyUnit(g[0], rows, 'toRight')!, toL = copyUnit(g[0], rows, 'toLeft')!;
  const label = (d: Dir) => L(`Copy the group’s votes to ${nameOf(d === 'toRight' ? right : left)}`, `העתקת קולות הקבוצה ל${nameOf(d === 'toRight' ? right : left)}`);
  return <tr className="cmp-groupline">
    {!simple && <td />}
    <td colSpan={4} dir={lang === 'he' ? 'rtl' : 'ltr'} className="small"><b><bdi>{name}</bdi></b> <span className="muted">{L(`${left.year} → ${rIds.length} lists`, `${left.year} ← ${rIds.length} רשימות`)}</span> <Info title={L('A split list', 'רשימה שהתפצלה')}>{L('Its voters can’t be divided among the new lists, so only the group is compared and copied. A group copy keeps the destination lists’ own balance.', 'אי אפשר לחלק את בוחריה בין הרשימות החדשות, ולכן רק הקבוצה כולה מושווית ומועתקת. העתקת קבוצה שומרת על האיזון בין רשימות היעד.')}</Info></td>
    <td className="cmp-mid"><span className="cmp-mid-in">
      <button type="button" className="cmp-arrow" aria-label={label('toLeft')} title={label('toLeft')} onClick={() => copy(toL, 'toLeft')}><ArrowLeft size={16} /></button>
      <span className="cmp-delta"><bdi dir="ltr">{l.seats} → {r.seats}</bdi> <SeatDelta value={r.seats - l.seats} /></span>
      <button type="button" className="cmp-arrow" aria-label={label('toRight')} title={label('toRight')} onClick={() => copy(toR, 'toRight')}><ArrowRight size={16} /></button>
    </span></td>
    <td colSpan={5} />
  </tr>;
}

/** Key numbers and rules, head to head. Inputs carry copy arrows; results never do. */
function KeyBand({ left, right, simple, expert, copy, nameOf }: { left: SideModel; right: SideModel; simple: boolean; expert: boolean; copy: (f: 'turnout' | 'registered' | 'invalid' | 'threshold' | 'rules' | 'agreements', d: Dir) => void; nameOf: (x: SideModel) => string }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const turnout = (x: SideModel) => x.sc.registered ? fmtPct(x.sc.lists.reduce((t, l) => t + l.votes, 0) + x.sc.invalid, x.sc.registered, digits) : '—';
  const thrVotes = (x: SideModel) => Number(x.sc.rules.thresholdPct) === 0 ? L('None', 'אין') : fmtInt(x.r.thresholdVotes);
  const method = (x: SideModel) => `${METHODS[x.sc.rules.remainderMethod]?.[lang] ?? x.sc.rules.remainderMethod} · ${x.sc.rules.seats}${x.sc.mode === 'experimental' ? L(' · experimental', ' · ניסיוני') : ''}`;
  type Row = { k: string; label: string; l: string; r: string; field?: 'turnout' | 'registered' | 'invalid' | 'threshold' | 'rules' | 'agreements'; show: boolean };
  const rows: Row[] = [
    { k: 'valid', label: L('Valid votes', 'קולות כשרים'), l: fmtInt(left.r.totalValid), r: fmtInt(right.r.totalValid), show: true },
    { k: 'turnout', label: L('Turnout', 'שיעור הצבעה'), l: turnout(left), r: turnout(right), field: 'turnout', show: true },
    { k: 'registered', label: L('Registered voters', 'בעלי זכות בחירה'), l: fmtInt(left.sc.registered), r: fmtInt(right.sc.registered), field: 'registered', show: !simple },
    { k: 'invalid', label: L('Invalid ballots', 'קולות פסולים'), l: fmtInt(left.sc.invalid), r: fmtInt(right.sc.invalid), field: 'invalid', show: expert },
    { k: 'threshold', label: L('Threshold', 'אחוז החסימה'), l: `${left.sc.rules.thresholdPct}%`, r: `${right.sc.rules.thresholdPct}%`, field: 'threshold', show: !simple },
    { k: 'thrvotes', label: L('Threshold (votes)', 'אחוז החסימה (קולות)'), l: thrVotes(left), r: thrVotes(right), show: true },
    { k: 'rules', label: L('Seat method', 'שיטת החלוקה'), l: method(left), r: method(right), field: 'rules', show: expert },
    { k: 'agreements', label: L('Surplus agreements', 'הסכמי עודפים'), l: String(left.sc.agreements.filter((a) => a.enabled).length), r: String(right.sc.agreements.filter((a) => a.enabled).length), field: 'agreements', show: !simple },
    { k: 'quota', label: L('Votes per seat', 'קולות למנדט'), l: fmtRat(left.r.quota, 0), r: fmtRat(right.r.quota, 0), show: true },
    { k: 'elected', label: L('Lists elected', 'רשימות שנבחרו'), l: String(left.r.lists.filter((x) => x.seats > 0).length), r: String(right.r.lists.filter((x) => x.seats > 0).length), show: true },
    { k: 'unrep', label: L('Votes with no seat', 'קולות ללא מנדט'), l: fmtPct(left.r.unrepresentedVotes, left.r.totalValid, digits), r: fmtPct(right.r.unrepresentedVotes, right.r.totalValid, digits), show: true },
  ];
  const btn = (row: Row, d: Dir) => { const to = d === 'toRight' ? right : left; const label = L(`Copy ${row.label.toLowerCase()} to ${nameOf(to)}`, `העתקת ${row.label} ל${nameOf(to)}`);
    return <button type="button" className="cmp-arrow" aria-label={label} title={label} disabled={row.l === row.r} onClick={() => copy(row.field!, d)}>{d === 'toRight' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}</button>; };
  return <section className="cmp-section cmp-band" aria-label={L('Key numbers and rules', 'מספרי מפתח וכללים')}>
    <h3>{L('Key numbers and rules', 'מספרי מפתח וכללים')}</h3>
    <div className="cmp-band-grid" dir="ltr">
      {rows.filter((r) => r.show).map((row) => <div key={row.k} className={`cmp-band-row ${row.field ? 'input' : ''}`} data-key={row.k}>
        <span className="cmp-band-v"><bdi dir="ltr">{row.l}</bdi></span>
        <span className="cmp-band-mid">{row.field ? btn(row, 'toLeft') : <span className="cmp-arrow-space" />}<span className="cmp-band-k" dir={lang === 'he' ? 'rtl' : 'ltr'}>{row.label}</span>{row.field ? btn(row, 'toRight') : <span className="cmp-arrow-space" />}</span>
        <span className="cmp-band-v"><bdi dir="ltr">{row.r}</bdi></span>
      </div>)}
    </div>
  </section>;
}

/** Within one election: who enters and who leaves the Knesset (collapsed). */
function People({ left, right }: { left: SideModel; right: SideModel }) {
  const L = useL(), lang = useLang();
  const elected = (x: SideModel) => new Map(x.sc.lists.flatMap((l) => electedOf(l, x.r.lists.find((y) => y.id === l.id)?.seats ?? 0).map((c) => [c.id, { c, l }] as const)));
  const a = elected(left), b = elected(right);
  const entering = [...b.entries()].filter(([id]) => !a.has(id)).map(([, v]) => v), leaving = [...a.entries()].filter(([id]) => !b.has(id)).map(([, v]) => v);
  if (!entering.length && !leaving.length) return null;
  return <details className="cmp-section">
    <summary className="small">{L(`Entering ${entering.length} · leaving ${leaving.length}`, `נכנסים ${entering.length} · יוצאים ${leaving.length}`)}</summary>
    <div className="grid2 stack-sm">
      <div><h3>{L(`Entering the Knesset (${entering.length})`, `נכנסים לכנסת (${entering.length})`)}</h3><ul className="small">{entering.map(({ c, l }) => <li key={c.id}><CandidateName candidate={c} /> <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul></div>
      <div><h3>{L(`Leaving the Knesset (${leaving.length})`, `יוצאים מהכנסת (${leaving.length})`)}</h3><ul className="small">{leaving.map(({ c, l }) => <li key={c.id}><CandidateName candidate={c} /> <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul></div>
    </div>
    <p className="small muted">{L('Election-night candidates', 'מועמדים בליל הבחירות')} <Info title={L('Candidate coverage', 'כיסוי המועמדים')}>{L('Elected candidates are the first names on each list as registered (election night). Later changes in membership are not modelled.', 'הנבחרים הם המועמדים הראשונים בכל רשימה כפי שנרשמה (ליל הבחירות). שינויים מאוחרים בהרכב אינם מוצגים.')}</Info></p>
  </details>;
}

