// Blocs (decision 0087): the election's sourced groupings (the first government, recognised blocs) and
// the user's own. Seats count per seat: a constituent party of a joint list can sit in another bloc
// than its list. Moving parties between blocs never changes votes or seats.
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { dispatch, setState, useLevel, useStore } from '../store.ts';
import { Info } from './ui.tsx';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HE = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

export function BlocBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const { standard } = useLevel();
  const selected = useStore((st) => st.selectedListId);
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const pieces = useMemo(() => blocPieces(s, r), [s, r]);
  const total = s.rules.seats;
  const majority = Math.floor(total / 2) + 1;
  if (!s.blocs.length && !s.blocSchemes?.length) return null;
  if (r.seatsAllocated === 0) return <p className="small muted" style={{ margin: 0 }}>{L('No seats are allocated in this scenario.', 'בתרחיש זה לא חולקו מושבים.')}</p>;

  const name = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const NONE = '\0none';
  const groups = [...s.blocs.map((b) => ({ key: `bloc:${b.id}`, id: b.id as string | null, label: name(b), color: b.color })), { key: NONE, id: null, label: L('No bloc', 'ללא גוש'), color: '#8a9099' }]
    .map((g) => ({ ...g, pieces: pieces.filter((p) => p.bloc === g.id) }))
    .map((g) => ({ ...g, n: g.pieces.reduce((t, p) => t + p.n, 0) }))
    .filter((g) => g.n > 0);
  const schemes = s.blocSchemes ?? [];
  const scheme = schemes.find((x) => x.id === s.blocSchemeId);
  const when = (d?: string) => (d ? ` (${(lang === 'he' ? MONTHS_HE : MONTHS_EN)[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)})` : '');
  const schemeLabel = (x: (typeof schemes)[number]) => `${name(x)}${x.kind === 'government' ? when(x.date) : ''}`;
  const custom = s.blocSchemeId === null;
  const pick = (v: string) => { if (v !== '__custom') { setOpen(null); dispatch({ type: 'applyBlocScheme', schemeId: v }); } };
  const kindNote = scheme?.kind === 'government' ? L('who formed the first government after this election, as recorded', 'מי הרכיבו את הממשלה הראשונה אחרי הבחירות, כפי שתועד')
    : scheme ? L('a recognised grouping of this election, from cited sources', 'חלוקה מוכרת של בחירות אלה, ממקורות מצוטטים')
    : custom ? L('your own grouping', 'החלוקה שלכם') : '';
  const listName = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const partyName = (listId: string, partyId: string | null) => {
    const p = partyId ? s.lists.find((l) => l.id === listId)?.parties?.find((x) => x.id === partyId) : undefined;
    return p ? name(p) : null;
  };
  const opened = groups.find((g) => g.key === open);
  // members of the opened bloc: one line per list (or constituent party) with its seats in this bloc
  const members = opened ? Object.values(opened.pieces.reduce<Record<string, { label: string; color: string; n: number; listId: string }>>((m, p) => {
    const k = `${p.listId}|${p.partyId ?? ''}`;
    m[k] ??= { label: partyName(p.listId, p.partyId) ?? listName(p.listId), color: p.color, n: 0, listId: p.listId };
    m[k].n += p.n; return m;
  }, {})).sort((a, b) => b.n - a.n) : [];

  return (
    <section className="panel blocs" aria-label={L('Seats by bloc', 'מנדטים לפי גוש')}>
      <div className="blocs-head">
        <h2 style={{ margin: 0 }}>{L('Blocs', 'גושים')} <Info term="bloc" /></h2>
        {(schemes.length > 1 || custom) && (
          <select aria-label={L('Grouping', 'חלוקה לגושים')} value={s.blocSchemeId ?? '__custom'} onChange={(e) => pick(e.target.value)}>
            {custom && <option value="__custom">{L('Your grouping', 'החלוקה שלכם')}</option>}
            {schemes.map((x) => <option key={x.id} value={x.id}>{schemeLabel(x)}</option>)}
          </select>
        )}
        {schemes.length === 1 && scheme && <b className="small">{schemeLabel(scheme)}</b>}
        <span className="note">{kindNote}</span>
      </div>
      <div className="strip" role="group" aria-label={groups.map((g) => `${g.label} ${g.n}`).join(', ')}>
        {groups.map((g) => (
          <button key={g.key} type="button" className="corridor" style={{ flexGrow: g.n, flexBasis: 0, ['--bc' as string]: g.color }}
            aria-expanded={open === g.key} title={`${g.label}: ${g.n}`} onClick={() => setOpen(open === g.key ? null : g.key)}>
            <span className="pieces" aria-hidden>
              {g.pieces.map((p, i) => <i key={i} className={selected && selected !== p.listId ? 'dim' : ''} style={{ flexGrow: p.n, background: p.color }} />)}
            </span>
            <span className="label"><span className="clip">{g.label}</span> <b>{g.n}</b>{g.n >= majority && <span className="sr-only">{L(' (majority)', ' (רוב)')}</span>}</span>
          </button>
        ))}
        <span className="milestone" aria-hidden style={{ insetInlineStart: `${((majority - 0.5) / total) * 100}%` }}><span>{majority}</span></span>
      </div>
      {/* on narrow screens the bands are too short for their names: they are listed in full beneath */}
      <div className="strip-legend" aria-hidden>
        {groups.map((g) => <span key={g.key}><span className="swatch" style={{ background: g.color }} />{g.label} <b>{g.n}</b></span>)}
      </div>
      {opened && (
        <div className="bloc-detail">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <b>{opened.label} · {opened.n} {L('seats', 'מנדטים')}</b>
            <span className="small ink2">{opened.n >= majority ? L(`a majority (${majority} needed)`, `רוב (נדרשים ${majority})`) : L(`${majority - opened.n} short of a majority`, `חסרים ${majority - opened.n} לרוב`)}</span>
          </div>
          <div className="legend" style={{ marginTop: 6 }}>
            {members.map((m, i) => (
              <button key={i} onClick={() => setState({ selectedListId: m.listId })}><span className="swatch" style={{ background: m.color }} />{m.label} <b>{m.n}</b></button>
            ))}
          </div>
          {standard && <div style={{ marginTop: 8 }}>
            <button className="btn small" aria-expanded={editing} onClick={() => setEditing((e) => !e)}>{editing ? L('Done', 'סיום') : L('Move lists and parties between blocs', 'העברת רשימות ומפלגות בין גושים')}</button>
            {editing && <BlocEditor s={s} r={r} />}
          </div>}
        </div>
      )}
    </section>
  );
}

/** Inline editor: bloc names and colours, and which bloc each seat-holding list and constituent party joins. */
export function BlocEditor({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [draft, setDraft] = useState('');
  const name = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const seated = s.lists.map((l) => ({ l, n: r.lists.find((x) => x.id === l.id)?.seats ?? 0 })).filter((x) => x.n > 0);
  const blocOptions = (extra?: { v: string; label: string }) => [
    ...(extra ? [<option key={extra.v} value={extra.v}>{extra.label}</option>] : []),
    ...s.blocs.map((b) => <option key={b.id} value={b.id}>{name(b)}</option>),
    <option key="__none" value="__none">{L('No bloc', 'ללא גוש')}</option>,
  ];
  return (
    <div className="bloc-editor">
      <p className="small ink2">{L('Changes here regroup seats only; votes and seats do not change. A sourced grouping is never altered: your edits become “Your grouping”.', 'השינויים כאן מקבצים מושבים בלבד; הקולות והמנדטים אינם משתנים. חלוקה מתועדת לעולם אינה משתנה: העריכות שלכם הופכות ל„החלוקה שלכם”.')}</p>
      <h3>{L('Blocs', 'גושים')}</h3>
      {s.blocs.map((b, i) => (
        <div key={b.id} className="row" style={{ marginBottom: 4 }}>
          <input type="color" value={b.color} aria-label={L(`Colour of ${b.nameEn}`, `צבע ${b.nameHe}`)}
            onChange={(e) => dispatch({ type: 'setBlocs', blocs: s.blocs.map((x, k) => (k === i ? { ...x, color: e.target.value } : x)) })} />
          <input type="text" defaultValue={name(b)} aria-label={L('Bloc name', 'שם הגוש')} key={`${b.id}-${lang}-${name(b)}`}
            onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== name(b)) dispatch({ type: 'setBlocs', blocs: s.blocs.map((x, k) => (k === i ? (lang === 'he' ? { ...x, nameHe: v } : { ...x, nameEn: v }) : x)) }); }} />
          <button className="btn small ghost danger icon-only" aria-label={L(`Remove bloc ${b.nameEn}`, `הסרת הגוש ${b.nameHe}`)}
            onClick={() => dispatch({ type: 'setBlocs', blocs: s.blocs.filter((_, k) => k !== i) })}><X className="icon sm" aria-hidden /></button>
        </div>
      ))}
      <div className="row">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={L('New bloc name', 'שם גוש חדש')} aria-label={L('New bloc name', 'שם גוש חדש')} />
        <button className="btn small" disabled={!draft.trim()} onClick={() => { dispatch({ type: 'setBlocs', blocs: [...s.blocs, { id: `b-${Date.now().toString(36)}`, nameHe: draft.trim(), nameEn: draft.trim(), color: '#8a6fb0' }] }); setDraft(''); }}>{L('Add bloc', 'הוספת גוש')}</button>
      </div>
      <h3 style={{ marginTop: 10 }}>{L('Who sits where', 'מי יושב היכן')}</h3>
      <div className="tablewrap" style={{ maxHeight: 'none' }}>
        <table className="data">
          <tbody>
            {seated.map(({ l, n }) => {
              const elected = electedOf(l, n);
              return [
                <tr key={l.id}>
                  <td><span className="swatch" style={{ background: l.color }} /> <b>{listLabel(l, lang)}</b> <span className="muted tabnum">{n}</span></td>
                  <td><select aria-label={L(`Bloc of ${l.shortEn ?? l.shortHe}`, `הגוש של ${l.shortHe}`)} value={l.bloc ?? '__none'}
                    onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { bloc: e.target.value === '__none' ? null : e.target.value } })}>{blocOptions()}</select></td>
                </tr>,
                ...(l.parties ?? []).map((p) => {
                  const held = elected.filter((c) => c.partyId === p.id).length;
                  const own = s.partyBlocs && p.id in s.partyBlocs;
                  if (!held && !own) return null; // a party with no elected member has no seat to move
                  return (
                    <tr key={`${l.id}:${p.id}`} className="sub">
                      <td style={{ paddingInlineStart: 22 }}><span className="swatch" style={{ background: p.color ?? l.color }} /> {name(p)} <span className="muted tabnum">{held}</span></td>
                      <td><select aria-label={L(`Bloc of ${p.nameEn}`, `הגוש של ${p.nameHe}`)} value={own ? s.partyBlocs![p.id] ?? '__none' : '__list'}
                        onChange={(e) => { const v = e.target.value; dispatch(v === '__list' ? { type: 'setPartyBloc', partyId: p.id, bloc: null, inherit: true } : { type: 'setPartyBloc', partyId: p.id, bloc: v === '__none' ? null : v }); }}>
                        {blocOptions({ v: '__list', label: L(`Same as the list (${l.bloc ? name(s.blocs.find((b) => b.id === l.bloc) ?? { nameHe: '', nameEn: '' }) : 'no bloc'})`, `כמו הרשימה (${l.bloc ? name(s.blocs.find((b) => b.id === l.bloc) ?? { nameHe: '', nameEn: '' }) : 'ללא גוש'})`) })}
                      </select></td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>
      <p className="tiny muted">{L('A party’s count is its elected members on this list; members whose party is not recorded stay with the list.', 'המספר ליד מפלגה הוא נבחריה ברשימה זו; נבחרים שמפלגתם אינה מתועדת נשארים עם הרשימה.')}</p>
    </div>
  );
}
