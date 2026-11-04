// Blocs (decision 0087): the election's sourced groupings (the first government, recognised blocs) and
// the user's own. Seats count per seat: a constituent party of a joint list can sit in another bloc
// than its list. Moving parties between blocs never changes votes or seats.
import { useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { dispatch, useLevel } from '../store.ts';
import { Info, Seg } from './ui.tsx';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HE = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

export function BlocBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const { standard } = useLevel();
  const [editing, setEditing] = useState(false);
  const pieces = useMemo(() => blocPieces(s, r), [s, r]);
  const total = s.rules.seats;
  const majority = Math.floor(total / 2) + 1;
  if (!s.blocs.length && !s.blocSchemes?.length) return null;
  if (r.seatsAllocated === 0) return <p className="small muted" style={{ margin: 0 }}>{L('No seats are allocated in this scenario.', 'בתרחיש זה לא חולקו מושבים.')}</p>;

  const name = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const groups = [...s.blocs.map((b) => ({ id: b.id as string | null, label: name(b), color: b.color })), { id: null, label: L('No bloc', 'ללא גוש'), color: 'var(--axis)' }]
    .map((g) => ({ ...g, pieces: pieces.filter((p) => p.bloc === g.id) }))
    .map((g) => ({ ...g, n: g.pieces.reduce((t, p) => t + p.n, 0) }))
    .filter((g) => g.id !== null || g.n > 0);
  const schemes = s.blocSchemes ?? [];
  const scheme = schemes.find((x) => x.id === s.blocSchemeId);
  const when = (d?: string) => (d ? ` (${(lang === 'he' ? MONTHS_HE : MONTHS_EN)[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)})` : '');
  const schemeLabel = (x: (typeof schemes)[number]) => `${name(x)}${x.kind === 'government' ? when(x.date) : ''}`;
  const options = schemes.map((x) => ({ v: x.id, label: schemeLabel(x) }));
  const custom = s.blocSchemeId === null;
  const pick = (v: string) => { if (v !== '__custom') dispatch({ type: 'applyBlocScheme', schemeId: v }); };
  const kindNote = scheme?.kind === 'government' ? L('who formed the first government after this election: a matter of record', 'מי הרכיבו את הממשלה הראשונה אחרי הבחירות: עובדה מתועדת')
    : scheme ? L('a recognised grouping of this election, from cited sources', 'חלוקה מוכרת של בחירות אלה, ממקורות מצוטטים')
    : L('your own grouping; choose a sourced one to restore it', 'החלוקה שלכם; בחרו חלוקה מתועדת כדי לשחזר');
  const listName = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const partyName = (listId: string, partyId: string | null) => {
    const p = partyId ? s.lists.find((l) => l.id === listId)?.parties?.find((x) => x.id === partyId) : undefined;
    return p ? name(p) : null;
  };

  return (
    <div>
      <div className="row small" style={{ justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <span className="ink2">{L('Seats by bloc', 'מנדטים לפי גוש')} <Info term="bloc" /></span>
        <span className="muted">{L(`majority ${majority}`, `רוב ${majority}`)}</span>
      </div>
      {/* sourced groupings as buttons (a select when there are many); an edited grouping is shown beside them */}
      {(options.length > 1 || custom) && <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {options.length <= 3
          ? <Seg label={L('Grouping', 'חלוקה לגושים')} value={s.blocSchemeId ?? '__custom'} onChange={pick} options={options} />
          : <select aria-label={L('Grouping', 'חלוקה לגושים')} value={s.blocSchemeId ?? '__custom'} onChange={(e) => pick(e.target.value)}>
              {custom && <option value="__custom">{L('Your grouping', 'החלוקה שלכם')}</option>}
              {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>}
        {custom && <span className="chip exp">{L('Your grouping', 'החלוקה שלכם')}</span>}
      </div>}
      {options.length === 1 && scheme && <div className="small"><b>{schemeLabel(scheme)}</b></div>}
      <p className="tiny muted" style={{ margin: '4px 0 6px' }}>{kindNote}</p>
      <div className="blocbar" role="img" aria-label={groups.map((g) => `${g.label} ${g.n}`).join(', ')}>
        {groups.map((g) => g.n > 0 && (
          <div key={g.id ?? 'none'} className="blocbar-group" style={{ flexBasis: `${(g.n / total) * 100}%` }} title={`${g.label}: ${g.n}`}>
            <div className="blocbar-bloc" style={{ background: g.color }} />
            <div className="blocbar-pieces">
              {g.pieces.map((p, i) => <div key={i} style={{ flexGrow: p.n, background: p.color }} title={`${partyName(p.listId, p.partyId) ?? listName(p.listId)}: ${p.n}`} />)}
            </div>
          </div>
        ))}
        <span className="majority-line" style={{ insetInlineStart: `calc(${(majority / total) * 100}% - 1px)` }} aria-hidden />
      </div>
      <div className="legend" style={{ marginTop: 6 }}>
        {groups.map((g) => (
          <span key={g.id ?? 'none'} className="row" style={{ gap: 5 }}>
            <span className="swatch" style={{ background: g.color }} />{g.label} <b className="tabnum">{g.n}</b>{g.n >= majority && <span className="chip ok">{L('majority', 'רוב')}</span>}
          </span>
        ))}
      </div>
      {standard && (
        <div style={{ marginTop: 8 }}>
          <button className="btn small" aria-expanded={editing} onClick={() => setEditing((e) => !e)}>{editing ? L('Done', 'סיום') : L('Edit blocs', 'עריכת גושים')}</button>
          {editing && <BlocEditor s={s} r={r} />}
        </div>
      )}
    </div>
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
          <button className="btn small ghost danger" aria-label={L(`Remove bloc ${b.nameEn}`, `הסרת הגוש ${b.nameHe}`)}
            onClick={() => dispatch({ type: 'setBlocs', blocs: s.blocs.filter((_, k) => k !== i) })}>✕</button>
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
