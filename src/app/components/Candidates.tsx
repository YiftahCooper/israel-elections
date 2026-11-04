import { useState } from 'react';
import type { CandidateBio } from '../../data/schema.ts';
import type { SimCandidate, SimList } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { shownName } from '../derive.ts';
import { dispatch, useLevel } from '../store.ts';

export function Candidates({ l, seats, baseSeats, baseCandidates }: { l: SimList; seats: number; baseSeats: number; baseCandidates?: SimCandidate[] }) {
  const L = useL();
  const lang = useLang();
  const { simple, expert: advanced } = useLevel();
  const [showAll, setShowAll] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const c = l.candidates;

  const commit = (next: SimCandidate[], note: string) => dispatch({ type: 'candidates', listId: l.id, candidates: next, note });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= c.length || from === to) return;
    const next = [...c]; const [x] = next.splice(from, 1); next.splice(to, 0, x);
    commit(next, `move ${x.nameHe} ${from + 1}→${to + 1}`);
  };
  // candidates the official notice did not seat are skipped when seats are filled
  const seated = c.filter((x) => !x.notSeated);
  const seatPos = new Map(seated.map((x, k) => [x.id, k]));
  const lastIn = seats > 0 ? seated[Math.min(seats, seated.length) - 1] ?? null : null;
  const nextIn = seated[seats] ?? null;
  // Simple shows those elected and the next in line (skipped candidates in between stay visible)
  const cut = nextIn ? c.indexOf(nextIn) + 1 : lastIn ? c.indexOf(lastIn) + 1 : 0;
  const limit = showAll ? c.length : Math.min(c.length, simple ? Math.max(cut, seats + 1) : Math.max(cut + 5, seats + 6, 12));

  return (
    <div>
      {l.rosterUnavailable && <p className="small callout">{L('The official candidate list for this election is not available in the sources used here, so the names of those elected are not shown.', 'רשימת המועמדים הרשמית לבחירות אלה אינה זמינה במקורות שבשימוש כאן, ולכן שמות הנבחרים אינם מוצגים.')}</p>}
      {l.rosterTruncated && !l.rosterUnavailable && <p className="small callout">{L(`Only the first ${c.length} candidates of this list’s official roster are available here (everyone elected is included); later names were not transcribed.`, `כאן זמינים רק ${c.length} המועמדים הראשונים ברשימה הרשמית (כולל כל הנבחרים); השמות שאחריהם לא הוקלדו.`)}</p>}
      {!simple && !l.rosterUnavailable && <div className="kv small" style={{ marginBottom: 8 }}>
        <span>{l.rosterTruncated ? L('Candidates available', 'מועמדים זמינים') : L('Registered candidates', 'מועמדים ברשימה')}</span><span>{c.length}</span>
        <span>{L('Last elected', 'האחרון שנבחר')}</span><span>{lastIn ? <><bdi>{shownName(lastIn)}</bdi> <span className="muted">(#{c.indexOf(lastIn) + 1})</span></> : '—'}</span>
        <span>{L('Next in line', 'הבא בתור')}</span><span>{nextIn ? <><bdi>{shownName(nextIn)}</bdi> <span className="muted">(#{c.indexOf(nextIn) + 1})</span></> : l.rosterTruncated ? L('not available', 'לא זמין') : L('none', 'אין')}</span>
      </div>}
      {baseCandidates && JSON.stringify(baseCandidates) !== JSON.stringify(c) && <button className="btn small" style={{ marginBottom: 6 }} onClick={() => dispatch({ type: 'resetCandidates', listId: l.id })}>{L('Restore the registered candidate list', 'שחזור רשימת המועמדים הרשומה')}</button>}
      {seats > seated.length && !l.rosterUnavailable && !l.rosterTruncated && <p className="down small">{L(`The list has only ${seated.length} candidates for ${seats} seats.`, `ברשימה רק ${seated.length} מועמדים ל-${seats} מנדטים.`)}</p>}
      {c.length === 0 && !l.rosterUnavailable && <p className="muted small">{L('No candidates registered.', 'אין מועמדים רשומים.')}</p>}
      {c.some((x) => x.bio) && <p className="tiny muted bio-key">{L('Links: Knesset pages (official), party pages (partisan, archived from the campaign where possible), Hebrew Wikipedia (secondary). English Wikipedia is not linked: it is not reliable on Israel.',
        'קישורים: דפי הכנסת (רשמי), דפי המפלגות (מפלגתי, מארכיון תקופת הבחירות כשאפשר), ויקיפדיה העברית (משני). ויקיפדיה האנגלית אינה מקושרת: אינה אמינה בענייני ישראל.')}</p>}
      <ol className="cands" style={{ ['--c' as string]: l.color }} aria-label={L('Candidate list', 'רשימת המועמדים')}>
        {c.slice(0, limit).map((x, i) => {
          const pos = seatPos.get(x.id);
          const elected = pos !== undefined && pos < seats;
          const changed = !x.notSeated && elected !== (pos !== undefined && pos < baseSeats);
          return (
            <li key={x.id} className={`cand ${elected ? 'el' : 'out'} ${x === nextIn && seats > 0 ? 'cut' : ''} ${drag === i ? 'drag' : ''}`}
              draggable={advanced} onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)}
              onDragOver={(e) => advanced && e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}>
              <span className="rk">{i + 1}</span>
              <span style={{ minWidth: 0 }}>
                {editing === x.id ? (
                  <input type="text" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={L('Candidate name', 'שם המועמד')}
                    onBlur={() => { if (draft.trim() && draft !== x.nameHe) commit(c.map((y) => (y.id === x.id ? { ...y, nameHe: draft.trim(), displayNameHe: undefined } : y)), `rename ${shownName(x)}`); setEditing(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditing(null); }} />
                ) : (
                  <span lang="he">{shownName(x)}</span>
                )}
                {x.notes?.map((n, k) => <span key={k} className="muted tiny cand-note"> · {lang === 'he' ? n.he : n.en}</span>)}
                {(() => { const p = x.partyId ? l.parties?.find((q) => q.id === x.partyId) : undefined;
                  return p ? <span className="muted tiny"> · {lang === 'he' ? p.nameHe : p.nameEn}</span>
                    : x.partyHe && l.sponsorsHe.includes(';') ? <span className="muted tiny"> · {x.partyHe}</span> : null; })()}
                {x.originListId && x.originListId !== l.id && !l.originIds.includes(x.originListId) && <span className="muted tiny"> · {L('moved', 'הועבר')}</span>}
                {changed && <span className={`tiny ${elected ? 'up' : 'down'}`}> · {elected ? L('enters', 'נכנס') : L('leaves', 'יוצא')}</span>}
                {x.bio && <BioLinks bio={x.bio} name={shownName(x)} />}
              </span>
              {advanced ? (
                <span className="tools">
                  <button className="btn small ghost" aria-label={L('Move up', 'הזזה למעלה')} onClick={() => move(i, i - 1)} disabled={i === 0}>↑</button>
                  <button className="btn small ghost" aria-label={L('Move down', 'הזזה למטה')} onClick={() => move(i, i + 1)} disabled={i === c.length - 1}>↓</button>
                  <button className="btn small ghost" aria-label={L('Rename', 'שינוי שם')} onClick={() => { setEditing(x.id); setDraft(x.nameHe); }}>✎</button>
                  <button className="btn small ghost" aria-label={L('Insert candidate below', 'הוספת מועמד מתחת')} onClick={() => { const next = [...c]; next.splice(i + 1, 0, { id: `new-${Date.now().toString(36)}`, nameHe: L('New candidate', 'מועמד חדש') }); commit(next, 'insert'); }}>＋</button>
                  <button className="btn small ghost danger" aria-label={L('Remove', 'הסרה')} onClick={() => commit(c.filter((y) => y.id !== x.id), `remove ${x.nameHe}`)}>✕</button>
                </span>
              ) : <span className="tiny muted">{x.notSeated ? L('not seated', 'לא כיהן') : elected ? L('elected', 'נבחר') : x === nextIn ? L('next in line', 'הבא בתור') : ''}</span>}
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

const safe = (u: string | undefined) => (u && /^https:\/\//.test(u) ? u : undefined);

/** Where to read about a candidate: the Knesset's member page (official), the party's own page (partisan,
 *  archived from the campaign where possible) and Hebrew Wikipedia (a secondary source). English Wikipedia
 *  is never linked. A "probable" match was made by name under stated rules, not by an official id. */
function BioLinks({ bio, name }: { bio: CandidateBio; name: string }) {
  const L = useL();
  const knesset = safe(bio.knesset), party = safe(bio.party?.url), wiki = safe(bio.hewiki?.url);
  if (!knesset && !party && !wiki) return null;
  const year = bio.party?.archivedAt?.slice(0, 4);
  return (
    <span className="bio-links tiny" role="group" aria-label={L(`About ${name}`, `על ${name}`)}>
      {knesset && <a href={knesset} target="_blank" rel="noreferrer" title={L('Official member page, Knesset website', 'דף חבר הכנסת הרשמי, אתר הכנסת')}>{L('Knesset', 'הכנסת')}</a>}
      {party && <a href={party} target="_blank" rel="noreferrer" title={L('The party’s own page (partisan)', 'הדף של המפלגה עצמה (מקור מפלגתי)') + (year ? L(`, archived ${year}`, `, ארכיון ${year}`) : '')}>
        {L('Party', 'מפלגה')}{year ? ` ${year}` : ''}</a>}
      {wiki && <a href={wiki} target="_blank" rel="noreferrer" hrefLang="he" title={L('Hebrew Wikipedia: a secondary source', 'ויקיפדיה העברית: מקור משני')}>{L('Wikipedia (he)', 'ויקיפדיה')}</a>}
      {bio.probable && <span className="muted" title={L('Matched by name, not by an official identifier', 'הותאם לפי שם, לא לפי מזהה רשמי')}>{L('(probable match)', '(התאמה סבירה)')}</span>}
    </span>
  );
}
