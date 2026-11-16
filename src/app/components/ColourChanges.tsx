import { useState } from 'react';
import { baselineOf, listLabel } from '../derive.ts';
import { electionLabel } from '../electionLabel.ts';
import { useL, useLang } from '../i18n.ts';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { dispatch, forgetPalette, keptPalettes, toast, useStore } from '../store.ts';
import type { Action } from '../../model/scenario.ts';

type Change = { key: string; name: string; kind: string; from: string; to: string; reset: Action; change: (c: string) => Action };
/** Settings, Colours (owner, 16 Nov 2026): every colour the user changed, in one list to review, change or reset.
 *  Colours are never a scenario change, so nothing here marks the scenario. The open election lists each colour;
 *  other elections whose official result keeps the user's colours are listed by name, with one reset each. */
export function ColourChanges() {
  const L = useL(), lang = useLang();
  const s = useStore(st => st.scenario);
  const ds = useStore(st => st.scenario ? st.datasets[st.scenario.electionId] : undefined);
  const elections = useStore(st => st.elections);
  const [others, setOthers] = useState(keptPalettes);
  const changes: Change[] = [];
  if (s && ds) {
    const base = baselineOf(ds);
    const scheme = s.blocSchemes?.find(g => g.id === s.blocSchemeId);
    for (const l of s.lists) {
      const b = base.lists.find(x => x.id === l.id);
      if (b && b.color.toLowerCase() !== l.color.toLowerCase()) changes.push({ key: `l:${l.id}`, name: listLabel(l, lang), kind: L('list', 'רשימה'), from: b.color, to: l.color,
        reset: { type: 'resetColors', only: { list: l.id } }, change: color => ({ type: 'setListMeta', listId: l.id, patch: { color } }) });
      for (const p of l.parties ?? []) if (p.customColor && p.color && b) changes.push({ key: `p:${l.id}:${p.id}`, name: lang === 'he' ? p.nameHe : p.nameEn, kind: L('party', 'מפלגה'),
        from: partyDisplayColor(b, p.id), to: p.color, reset: { type: 'resetColors', only: { list: l.id, party: p.id } }, change: color => ({ type: 'setPartyColor', listId: l.id, partyId: p.id, color }) });
    }
    for (const bl of s.blocs) {
      const o = scheme?.blocs.find(x => x.id === bl.id)?.color;
      if (o && o.toLowerCase() !== bl.color.toLowerCase()) changes.push({ key: `b:${bl.id}`, name: lang === 'he' ? bl.nameHe : bl.nameEn, kind: L('bloc', 'גוש'), from: o, to: bl.color,
        reset: { type: 'resetColors', only: { bloc: bl.id } }, change: color => ({ type: 'setBlocAppearance', blocs: s.blocs.map(x => x.id === bl.id ? { ...x, color } : x) }) });
    }
  }
  const here = s && elections.find(e => e.id === s.electionId);
  const name = (id: string) => { const e = elections.find(x => x.id === id); return e ? electionLabel(e, elections, lang) : id; };
  return <div className="ps-colours">
    {here && <p className="small ink2 ps-colours-where">{electionLabel(here, elections, lang)}</p>}
    {changes.length === 0 ? <p className="small muted">{L('No colour changes here.', 'אין כאן שינויי צבע.')}</p>
      : <ul className="ps-colour-list">{changes.map(c => <li key={c.key}>
        <span className="ps-colour-swatches" aria-hidden><i style={{ background: c.from }} /><span>{lang === 'he' ? '←' : '→'}</span></span>
        <input type="color" value={c.to} aria-label={L(`Colour: ${c.name}`, `צבע: ${c.name}`)} onChange={e => dispatch(c.change(e.target.value))} />
        <span className="ps-colour-name"><bdi>{c.name}</bdi> <span className="tiny muted">{c.kind}</span></span>
        <button type="button" className="btn small ghost" aria-label={L(`Reset: ${c.name}`, `איפוס: ${c.name}`)} onClick={() => dispatch(c.reset)}>{L('Reset', 'איפוס')}</button>
      </li>)}</ul>}
    {changes.length > 1 && <button type="button" className="btn small" onClick={() => dispatch({ type: 'resetColors' })}>{L('Reset all colours here', 'איפוס כל הצבעים כאן')}</button>}
    {others.length > 0 && <>
      <p className="small ink2 ps-colours-where">{L('Other elections with your colours', 'בחירות אחרות עם הצבעים שלכם')}</p>
      <ul className="ps-colour-list">{others.map(id => <li key={id}><span className="ps-colour-name">{name(id)}</span>
        <button type="button" className="btn small ghost" aria-label={L(`Reset colours: ${name(id)}`, `איפוס צבעים: ${name(id)}`)} onClick={() => { forgetPalette(id); setOthers(keptPalettes()); toast('info', L('Colours reset', 'הצבעים אופסו')); }}>{L('Reset', 'איפוס')}</button></li>)}</ul>
    </>}
  </div>;
}
