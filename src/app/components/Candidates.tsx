import { useState } from 'react';
import type { SimCandidate, SimList } from '../../model/scenario.ts';
import { useL } from '../i18n.ts';
import { dispatch, useStore } from '../store.ts';

export function Candidates({ l, seats, baseSeats, baseCandidates }: { l: SimList; seats: number; baseSeats: number; baseCandidates?: SimCandidate[] }) {
  const L = useL();
  const advanced = useStore((st) => st.level === 'advanced');
  const [showAll, setShowAll] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const c = l.candidates;
  const limit = showAll ? c.length : Math.min(c.length, Math.max(seats + 6, 12));
  const commit = (next: SimCandidate[], note: string) => dispatch({ type: 'candidates', listId: l.id, candidates: next, note });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= c.length || from === to) return;
    const next = [...c]; const [x] = next.splice(from, 1); next.splice(to, 0, x);
    commit(next, `move ${x.nameHe} ${from + 1}→${to + 1}`);
  };
  const lastIn = seats > 0 ? c[Math.min(seats, c.length) - 1] : null;
  const nextIn = c[seats] ?? null;

  return (
    <div>
      <div className="kv small" style={{ marginBottom: 8 }}>
        <span>{L('Registered candidates', 'מועמדים ברשימה')}</span><span>{c.length}</span>
        <span>{L('Last elected', 'האחרון שנבחר')}</span><span>{lastIn ? <><bdi>{lastIn.nameHe}</bdi> <span className="muted">(#{seats})</span></> : '—'}</span>
        <span>{L('Next in line', 'הבא בתור')}</span><span>{nextIn ? <><bdi>{nextIn.nameHe}</bdi> <span className="muted">(#{seats + 1})</span></> : L('none', 'אין')}</span>
      </div>
      {baseCandidates && JSON.stringify(baseCandidates) !== JSON.stringify(c) && <button className="btn small" style={{ marginBottom: 6 }} onClick={() => dispatch({ type: 'resetCandidates', listId: l.id })}>{L('Restore the registered candidate list', 'שחזור רשימת המועמדים הרשומה')}</button>}
      {seats > c.length && <p className="down small">{L(`The list has only ${c.length} candidates for ${seats} seats.`, `ברשימה רק ${c.length} מועמדים ל-${seats} מנדטים.`)}</p>}
      {c.length === 0 && <p className="muted small">{L('No candidates registered.', 'אין מועמדים רשומים.')}</p>}
      <ol className="cands" style={{ ['--c' as string]: l.color }} aria-label={L('Candidate list', 'רשימת המועמדים')}>
        {c.slice(0, limit).map((x, i) => {
          const elected = i < seats;
          const changed = elected !== i < baseSeats;
          return (
            <li key={x.id} className={`cand ${elected ? 'el' : 'out'} ${i === seats && seats > 0 ? 'cut' : ''} ${drag === i ? 'drag' : ''}`}
              draggable={advanced} onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)}
              onDragOver={(e) => advanced && e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}>
              <span className="rk">{i + 1}</span>
              <span style={{ minWidth: 0 }}>
                {editing === x.id ? (
                  <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={L('Candidate name', 'שם המועמד')}
                    onBlur={() => { if (draft.trim() && draft !== x.nameHe) commit(c.map((y) => (y.id === x.id ? { ...y, nameHe: draft.trim() } : y)), `rename ${x.nameHe}`); setEditing(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditing(null); }} />
                ) : (
                  <span lang="he">{x.nameHe}</span>
                )}
                {x.partyHe && l.sponsorsHe.includes(';') && <span className="muted tiny"> · {x.partyHe}</span>}
                {x.originListId && x.originListId !== l.id && !l.originIds.includes(x.originListId) && <span className="muted tiny"> · {L('moved', 'הועבר')}</span>}
                {changed && <span className={`tiny ${elected ? 'up' : 'down'}`}> · {elected ? L('enters', 'נכנס') : L('leaves', 'יוצא')}</span>}
              </span>
              {advanced ? (
                <span className="tools">
                  <button className="btn small ghost" aria-label={L('Move up', 'הזזה למעלה')} onClick={() => move(i, i - 1)} disabled={i === 0}>↑</button>
                  <button className="btn small ghost" aria-label={L('Move down', 'הזזה למטה')} onClick={() => move(i, i + 1)} disabled={i === c.length - 1}>↓</button>
                  <button className="btn small ghost" aria-label={L('Rename', 'שינוי שם')} onClick={() => { setEditing(x.id); setDraft(x.nameHe); }}>✎</button>
                  <button className="btn small ghost" aria-label={L('Insert candidate below', 'הוספת מועמד מתחת')} onClick={() => { const next = [...c]; next.splice(i + 1, 0, { id: `new-${Date.now().toString(36)}`, nameHe: L('New candidate', 'מועמד חדש') }); commit(next, 'insert'); }}>＋</button>
                  <button className="btn small ghost danger" aria-label={L('Remove', 'הסרה')} onClick={() => commit(c.filter((y) => y.id !== x.id), `remove ${x.nameHe}`)}>✕</button>
                </span>
              ) : <span className="tiny muted">{elected ? L('elected', 'נבחר') : ''}</span>}
            </li>
          );
        })}
      </ol>
      {c.length > limit && <button className="btn small" style={{ marginTop: 6 }} onClick={() => setShowAll(true)}>{L(`Show all ${c.length} candidates`, `הצגת כל ${c.length} המועמדים`)}</button>}
      {showAll && c.length > 12 && <button className="btn small ghost" style={{ marginTop: 6 }} onClick={() => setShowAll(false)}>{L('Show fewer', 'הצגת פחות')}</button>}
      {advanced && <button className="btn small" style={{ marginTop: 6, marginInlineStart: 6 }} onClick={() => commit([...c, { id: `new-${Date.now().toString(36)}`, nameHe: L('New candidate', 'מועמד חדש') }], 'append')}>{L('Add candidate at end', 'הוספת מועמד בסוף')}</button>}
    </div>
  );
}
