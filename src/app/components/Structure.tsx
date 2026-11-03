import { useMemo, useState } from 'react';
import { allocate } from '../../engine/allocate.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, signed } from '../format.ts';
import { dispatch, dispatchMany, setState } from '../store.ts';
import { Info, NumberInput } from './ui.tsx';

const newId = () => `sim-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function Structure({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  return (
    <div className="grid2" style={{ alignItems: 'start', gap: 18 }}>
      <div><Agreements s={s} r={r} base={base} /><hr /><AddList s={s} /></div>
      <div><Merge s={s} /><hr /><Split s={s} /></div>
    </div>
  );
}

function Agreements({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  const L = useL();
  const lang = useLang();
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const name = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const effects = useMemo(() => Object.fromEntries(s.agreements.map((ag) => {
    const alt = allocate(toEngineInput({ ...s, agreements: s.agreements.map((x) => (x.id === ag.id ? { ...x, enabled: !x.enabled } : x)) }));
    const d = r.lists.map((x) => ({ id: x.id, d: x.seats - (alt.lists.find((y) => y.id === x.id)?.seats ?? 0) })).filter((x) => x.d !== 0);
    return [ag.id, d];
  })), [s, r]);
  const used = new Set(s.agreements.filter((x) => x.enabled).flatMap((x) => x.members));
  const exp = s.mode === 'experimental';
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h4>{L('Surplus-vote agreements', 'הסכמי עודפים')} <Info term="surplus" /></h4>
        {JSON.stringify(s.agreements) !== JSON.stringify(base.agreements) && <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'agreements' })}>{L('Restore historical agreements', 'שחזור ההסכמים ההיסטוריים')}</button>}
      </div>
      {s.agreements.length === 0 && <p className="muted small">{L('None.', 'אין.')}</p>}
      <ul className="cands">
        {s.agreements.map((ag) => {
          const st = r.agreements.find((x) => x.id === ag.id);
          const eff = effects[ag.id] ?? [];
          return (
            <li key={ag.id} className="cand" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
              <span>
                <b>{ag.members.map(name).join(' ⇄ ')}</b>{' '}
                {!ag.enabled ? <span className="chip">{L('off', 'כבוי')}</span> : st?.active ? <span className="chip ok">{L('active', 'בתוקף')}</span> : <span className="chip no">{st?.reason === 'member-failed-threshold' ? L(`no effect: ${st.failedMembers.map(name).join(', ')} below threshold`, `ללא השפעה: ${st.failedMembers.map(name).join(', ')} מתחת לחסימה`)
                  : st?.reason === 'member-withdrawn' ? L('no effect: a partner withdrew', 'ללא השפעה: שותפה פרשה')
                  : st?.reason === 'duplicate-membership' ? L('no effect: a list is already in another agreement', 'ללא השפעה: רשימה כבר בהסכם אחר')
                  : st?.reason === 'too-many-members' ? L('not allowed under these rules', 'לא מותר לפי הכללים')
                  : st?.reason === 'unknown-list' ? L('refers to a list that no longer exists', 'מתייחס לרשימה שאינה קיימת') : ''}</span>}
                {ag.members.length > 2 && <span className="chip exp">{L('not legal in Israel', 'לא חוקי בישראל')}</span>}
                <div className="small muted">{eff.length === 0 ? L(ag.enabled ? 'Switching it off changes no seats.' : 'Switching it on changes no seats.', ag.enabled ? 'כיבויו אינו משנה מנדטים.' : 'הפעלתו אינה משנה מנדטים.') : `${ag.enabled ? L('Effect of the agreement: ', 'השפעת ההסכם: ') : L('Switching it on would give: ', 'הפעלתו הייתה נותנת: ')}${eff.map((e) => `${name(e.id)} ${signed(ag.enabled ? e.d : -e.d)}`).join(' · ')}`}</div>
              </span>
              <span className="tools">
                <button className="btn small" onClick={() => dispatch({ type: 'setAgreement', agreement: { ...ag, enabled: !ag.enabled } })}>{ag.enabled ? L('Off', 'כיבוי') : L('On', 'הפעלה')}</button>
                <button className="btn small danger" onClick={() => dispatch({ type: 'removeAgreement', id: ag.id })} aria-label={L('Remove agreement', 'הסרת הסכם')}>✕</button>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="row" style={{ marginTop: 8 }}>
        <select value={a} onChange={(e) => setA(e.target.value)} aria-label={L('First list', 'רשימה ראשונה')}><option value="">{L('List…', 'רשימה…')}</option>{s.lists.filter((x) => exp || !used.has(x.id)).sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        ⇄
        <select value={b} onChange={(e) => setB(e.target.value)} aria-label={L('Second list', 'רשימה שנייה')}><option value="">{L('List…', 'רשימה…')}</option>{s.lists.filter((x) => x.id !== a && (exp || !used.has(x.id))).sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        <button className="btn small primary" disabled={!a || !b} onClick={() => { if (dispatch({ type: 'setAgreement', agreement: { id: `sim-agr-${newId()}`, members: [a, b], enabled: true } })) { setA(''); setB(''); } }}>{L('Add agreement', 'הוספת הסכם')}</button>
      </div>
      {exp && <p className="small muted">{L('Experimental rules: agreements of up to ', 'כללים ניסיוניים: הסכמים של עד ')}{s.rules.maxAgreementSize}{L(' lists (set in the Rules tab). Add a third list by editing an agreement below.', ' רשימות (בלשונית הכללים).')}</p>}
      {exp && s.rules.maxAgreementSize > 2 && s.agreements.map((ag) => (
        <div key={ag.id} className="row small" style={{ marginTop: 4 }}>
          {ag.members.map(name).join(' ⇄ ')}
          <select defaultValue="" onChange={(e) => { if (e.target.value) dispatch({ type: 'setAgreement', agreement: { ...ag, members: [...ag.members, e.target.value] } }); }} aria-label={L('Add member', 'הוספת חברה')}>
            <option value="">{L('+ add member', '+ הוספה')}</option>
            {s.lists.filter((x) => !ag.members.includes(x.id)).sort((x, y) => y.votes - x.votes).slice(0, 25).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function Merge({ s }: { s: Scenario }) {
  const L = useL();
  const lang = useLang();
  const [ids, setIds] = useState<string[]>([]);
  const [nameHe, setName] = useState('');
  const [letters, setLetters] = useState('');
  const [color, setColor] = useState('#7a6fd0');
  const [retention, setRetention] = useState('100');
  const [order, setOrder] = useState<'interleave' | 'concat'>('interleave');
  const sel = s.lists.filter((l) => ids.includes(l.id));
  const total = sel.reduce((t, l) => t + l.votes, 0);
  const ret = retention.trim() === '' ? NaN : Number(retention);
  // identical to the merge action's rounding
  const kept = Number.isFinite(ret) ? Number((BigInt(total) * BigInt(Math.round(ret * 100))) / 10000n) : 0;
  const defaultName = sel.map((l) => listLabel(l, lang)).join('–');
  const defaultHe = sel.map((l) => l.shortHe).join('–'), defaultEn = sel.map((l) => l.shortEn ?? l.shortHe).join('–');
  const go = () => {
    const id = newId();
    // a typed name is used in both languages; otherwise each language gets its own default
    const ok = dispatchMany([{ type: 'merge', ids, newId: id, nameHe: nameHe || defaultHe, letters: letters || sel[0]?.letters || '', color, retentionPct: ret, candidateOrder: order, nonRetained: 'abstain' },
      { type: 'setListMeta', listId: id, patch: { shortEn: nameHe || defaultEn } }]);
    if (ok) { setIds([]); setName(''); setLetters(''); setState({ selectedListId: id }); }
  };
  return (
    <div>
      <h4>{L('Merge lists into one', 'איחוד רשימות')}</h4>
      <p className="small ink2">{L('The merged list is one list for the threshold and for seat allocation. Its agreements with others are dropped; add new ones afterwards.', 'הרשימה המאוחדת היא רשימה אחת לאחוז החסימה ולחלוקה. הסכמי העודפים של המתאחדות מבוטלים; ניתן להוסיף חדשים.')}</p>
      <div className="tablewrap" style={{ maxHeight: 180 }}>
        {[...s.lists].sort((a, b) => b.votes - a.votes).slice(0, 30).map((l) => (
          <label key={l.id} className="row small" style={{ padding: '3px 8px' }}>
            <input type="checkbox" checked={ids.includes(l.id)} onChange={(e) => setIds(e.target.checked ? [...ids, l.id] : ids.filter((x) => x !== l.id))} />
            <span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <span className="muted">{fmtInt(l.votes)}</span>
          </label>
        ))}
      </div>
      <div className="grid2" style={{ marginTop: 8 }}>
        <label className="field">{L('Merged list name', 'שם הרשימה המאוחדת')}<input type="text" value={nameHe} placeholder={defaultName} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field">{L('Merged list letters', 'אותיות הרשימה המאוחדת')}<input type="text" value={letters} placeholder={sel[0]?.letters} onChange={(e) => setLetters(e.target.value)} /></label>
        <label className="field">{L('Voters retained %', 'שימור מצביעים %')}<input type="text" inputMode="decimal" value={retention} onChange={(e) => setRetention(e.target.value)} /></label>
        <label className="field">{L('Colour', 'צבע')}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label className="field">{L('Candidate order', 'סדר המועמדים')}
          <select value={order} onChange={(e) => setOrder(e.target.value as 'interleave' | 'concat')}>
            <option value="interleave">{L('Alternate (1st of each, 2nd of each…)', 'לסירוגין (ראשון מכל אחת, שני…)')}</option>
            <option value="concat">{L('One list after the other (selection order)', 'רשימה אחר רשימה (לפי סדר הבחירה)')}</option>
          </select>
        </label>
      </div>
      <p className="small muted">{ids.length >= 2 ? L(`Combined ${fmtInt(total)} votes; at ${ret}% retention the merged list keeps ${fmtInt(kept)} and ${fmtInt(total - kept)} voters stay home. Reorder candidates afterwards in the list panel.`, `יחד ${fmtInt(total)} קולות; בשימור ${ret}% נשארים ${fmtInt(kept)} ו-${fmtInt(total - kept)} נמנעים. אפשר לסדר מחדש את המועמדים בחלונית הרשימה.`) : L('Select two or more lists.', 'בחרו שתי רשימות או יותר.')}</p>
      <button className="btn primary" disabled={ids.length < 2 || !(ret >= 0 && ret <= 100)} onClick={go}>{L('Merge', 'איחוד')}</button>
    </div>
  );
}

function Split({ s }: { s: Scenario }) {
  const L = useL();
  const lang = useLang();
  const [id, setId] = useState('');
  const l = s.lists.find((x) => x.id === id);
  const parties = l ? [...new Set(l.candidates.map((c) => c.partyHe).filter(Boolean) as string[])] : [];
  const [mode, setMode] = useState<'party' | 'alternate' | 'top'>('alternate');
  const [shareA, setShareA] = useState(50);
  const [topN, setTopN] = useState(10);
  const [nameA, setNameA] = useState(''); const [nameB, setNameB] = useState('');
  const effMode = mode === 'party' && parties.length < 2 ? 'alternate' : mode;
  const assign = (): [string[], string[]] => {
    if (!l) return [[], []];
    const c = l.candidates;
    if (effMode === 'party') return [c.filter((x) => x.partyHe === parties[0]).map((x) => x.id), c.filter((x) => x.partyHe !== parties[0]).map((x) => x.id)];
    if (effMode === 'top') return [c.slice(0, topN).map((x) => x.id), c.slice(topN).map((x) => x.id)];
    return [c.filter((_, i) => i % 2 === 0).map((x) => x.id), c.filter((_, i) => i % 2 === 1).map((x) => x.id)];
  };
  const go = () => {
    if (!l) return;
    const [ca, cb] = assign();
    const va = Math.round((l.votes * shareA) / 100);
    const a = newId(), b = newId() + 'b';
    const nA = nameA || (effMode === 'party' ? parties[0] : `${l.shortHe} א`), nB = nameB || (effMode === 'party' ? parties.slice(1).join(' / ') : `${l.shortHe} ב`);
    const eA = nameA || (effMode === 'party' ? parties[0] : `${l.shortEn ?? l.shortHe} A`), eB = nameB || (effMode === 'party' ? parties.slice(1).join(' / ') : `${l.shortEn ?? l.shortHe} B`);
    if (dispatchMany([{ type: 'split', id: l.id, parts: [
      { newId: a, nameHe: nA, letters: l.letters, color: l.color, votes: va, candidateIds: ca },
      { newId: b, nameHe: nB, letters: `${l.letters}2`, color: '#8a8f99', votes: l.votes - va, candidateIds: cb },
    ] }, { type: 'setListMeta', listId: a, patch: { shortEn: eA } }, { type: 'setListMeta', listId: b, patch: { shortEn: eB } }])) { setId(''); setState({ selectedListId: a }); }
  };
  return (
    <div>
      <h4>{L('Split a list in two', 'פיצול רשימה')}</h4>
      <div className="row">
        <select value={id} onChange={(e) => setId(e.target.value)} aria-label={L('List to split', 'רשימה לפיצול')}>
          <option value="">{L('Choose a list…', 'בחרו רשימה…')}</option>
          {[...s.lists].sort((a, b) => b.votes - a.votes).slice(0, 30).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
        </select>
      </div>
      {l && (
        <>
          <div className="grid2" style={{ marginTop: 8 }}>
            <label className="field">{L('Candidates', 'מועמדים')}
              <select value={effMode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                {parties.length >= 2 && <option value="party">{L(`By constituent party (${parties[0]} vs the rest)`, `לפי מפלגה (${parties[0]} מול השאר)`)}</option>}
                <option value="alternate">{L('Alternate ranks', 'מקומות לסירוגין')}</option>
                <option value="top">{L('Top N to the first list', 'N הראשונים לרשימה הראשונה')}</option>
              </select>
            </label>
            {effMode === 'top' && <label className="field">N<NumberInput value={topN} onCommit={setTopN} label="N" width={80} /></label>}
            <label className="field">{L('First list name', 'שם הרשימה הראשונה')}<input type="text" value={nameA} onChange={(e) => setNameA(e.target.value)} /></label>
            <label className="field">{L('Second list name', 'שם הרשימה השנייה')}<input type="text" value={nameB} onChange={(e) => setNameB(e.target.value)} /></label>
          </div>
          <label className="field" style={{ marginTop: 8 }}>{L(`Vote share of the first list: ${shareA}% (${fmtInt(Math.round((l.votes * shareA) / 100))} / ${fmtInt(l.votes - Math.round((l.votes * shareA) / 100))})`, `חלק הקולות של הראשונה: ${shareA}% (${fmtInt(Math.round((l.votes * shareA) / 100))} / ${fmtInt(l.votes - Math.round((l.votes * shareA) / 100))})`)}
            <input type="range" min={0} max={100} value={shareA} onChange={(e) => setShareA(Number(e.target.value))} />
          </label>
          {parties.length < 2 && mode === 'party' && <p className="small muted">{L('The official data does not record per-candidate parties for this list.', 'הנתונים הרשמיים אינם מציינים מפלגה לכל מועמד ברשימה זו.')}</p>}
          <button className="btn primary" style={{ marginTop: 6 }} onClick={go}>{L('Split', 'פיצול')}</button>
        </>
      )}
    </div>
  );
}

function AddList({ s }: { s: Scenario }) {
  const L = useL();
  const [nameHe, setName] = useState(''); const [letters, setLetters] = useState(''); const [votes, setVotes] = useState(100_000);
  void s;
  return (
    <div>
      <h4>{L('Add a new list', 'הוספת רשימה חדשה')}</h4>
      <div className="grid2">
        <label className="field">{L('New list name', 'שם הרשימה החדשה')}<input type="text" value={nameHe} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field">{L('New list letters', 'אותיות הרשימה החדשה')}<input type="text" value={letters} onChange={(e) => setLetters(e.target.value)} /></label>
        <label className="field">{L('Votes (new voters)', 'קולות (מצביעים חדשים)')}<NumberInput value={votes} onCommit={setVotes} label={L('Votes', 'קולות')} /></label>
      </div>
      <button className="btn primary" style={{ marginTop: 6 }} disabled={!nameHe} onClick={() => { const id = newId(); if (dispatch({ type: 'addList', newId: id, nameHe, letters, color: '#5f9ea0', votes })) { setName(''); setLetters(''); setState({ selectedListId: id }); } }}>{L('Add list', 'הוספה')}</button>
      <p className="small muted">{L('A new list starts with no candidates; add them in the list panel (Advanced). Move votes to it with the vote tools.', 'רשימה חדשה מתחילה ללא מועמדים; הוסיפו אותם בחלונית הרשימה (מתקדם).')}</p>
    </div>
  );
}
