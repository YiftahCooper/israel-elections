import { blocDisplayOrder } from '../blocOrder.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { EditMarker } from './EditMarker.tsx';
import { BlocMajorities } from './Majority.tsx';
// Blocs (decision 0087): the election's sourced groupings (the first government, recognised blocs) and
// the user's own. Seats count per seat: a constituent party of a joint list can sit in another bloc
// than its list. Moving parties between blocs never changes votes or seats. A bloc opens its editor
// beside the chamber (BlocPanel), where it is renamed, recoloured and its members moved.
import { useMemo } from 'react';
import { Pencil } from 'lucide-react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, groupingBaseline, allocationOf, referenceLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { setState, useStore } from '../store.ts';
import { Info } from './ui.tsx';


export function BlocBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const selected = useStore((st) => st.selectedListId);
  const panel = useStore((st) => st.blocPanel);
  const pieces = useMemo(() => blocPieces(s, r), [s, r]);
  const { base, labelReference } = useGraphicReference(s);
  const grouped = groupingBaseline(s, base);
  const before = grouped ? blocPieces(grouped, allocationOf(grouped)) : [];
  const total = s.rules.seats;
  const majority = Math.floor(total / 2) + 1;
  if (r.seatsAllocated === 0) return <p className="small muted" style={{ margin: 0 }}>{L('No seats are allocated in this scenario.', 'בתרחיש זה לא חולקו מושבים.')}</p>;

  const name = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const NONE = '__none';
  const groups = [...s.blocs.map((b) => ({ key: b.id, id: b.id as string | null, label: name(b), color: b.color })), { key: NONE, id: null, label: L('No bloc', 'ללא גוש'), color: '#8a9099' }]
    .sort((a,b)=>blocDisplayOrder(s).indexOf(a.id)-blocDisplayOrder(s).indexOf(b.id))
    .map((g) => ({ ...g, pieces: pieces.filter((p) => p.bloc === g.id) }))
    .map((g) => ({ ...g, n: g.pieces.reduce((t, p) => t + p.n, 0) }))
    .filter((g) => g.n > 0);
  const schemes = s.blocSchemes ?? [];
  const scheme = schemes.find((x) => x.id === s.blocSchemeId);
  const custom = s.blocSchemeId === null;
  const openPanel = (key: string) => setState({ blocPanel: key, selectedListId: null });
  const kindNote = scheme?.kind === 'government' ? L('who formed the first government after this election, as recorded', 'מי הרכיבו את הממשלה הראשונה אחרי הבחירות, כפי שתועד')
    : scheme ? L('a recognised grouping of this election, from cited sources', 'חלוקה מוכרת של בחירות אלה, ממקורות מצוטטים')
    : custom ? L('your own grouping', 'החלוקה שלכם') : '';
  return (
    <section className="panel blocs" aria-label={L('Seats by bloc', 'מנדטים לפי גוש')}>
      <div className="blocs-head">
        <h2 style={{ margin: 0 }}>{L('Blocs', 'גושים')} <Info term="bloc" /> <EditMarker s={s} path={['customGroupingName']} /></h2>
        <span className="note">{kindNote}</span>
        <button className="btn small" aria-expanded={!!panel} onClick={() => (panel ? setState({ blocPanel: null }) : openPanel(groups[0]?.key ?? NONE))}>
          <Pencil className="icon sm" aria-hidden />{s.blocs.length ? L('Edit blocs', 'עריכת גושים') : L('Group seats into blocs', 'חלוקת המושבים לגושים')}</button>
      </div>
      <BlocMajorities s={s} r={r} />
      {grouped && <p className="small muted" style={{margin:'4px 0'}}>{L('Dashed outline: ', 'מתאר מקווקו: ')}{referenceLabel(labelReference,lang).name}</p>}
      {grouped && <div className="bloc-reference" aria-label={referenceLabel(labelReference, lang).name}>
        {[...s.blocs.map(b => ({id:b.id as string|null,label:name(b)})),{id:null,label:L('No bloc','ללא גוש')}].sort((a,b)=>blocDisplayOrder(s).indexOf(a.id)-blocDisplayOrder(s).indexOf(b.id)).map(b => {
          const n = before.filter(p => p.bloc === b.id).reduce((t,p) => t+p.n,0);
          return n > 0 && <span key={b.id ?? NONE} style={{width:`${n/total*100}%`}} title={`${b.label} ${n}`} />;
        })}
      </div>}
      <div className="strip" role="group" aria-label={groups.map((g) => `${g.label} ${g.n}`).join(', ')}>
        {groups.map((g) => (
          <button key={g.key} type="button" className={`corridor ${g.id === null ? "no-bloc" : ""}`} style={{ flexGrow: g.n, flexBasis: 0, ['--bc' as string]: g.color }}
            aria-pressed={panel === g.key} title={L(`${g.label}: ${g.n}. Edit this bloc`, `${g.label}: ${g.n}. עריכת הגוש`)} onClick={() => openPanel(g.key)}>
            <span className="pieces" aria-hidden>
              {g.pieces.map((p, i) => <i key={i} className={selected && selected !== p.listId ? 'dim' : ''} style={{ flexGrow: p.n, background: s.lists.find(l=>l.id===p.listId)?.color ?? p.color }} />)}
            </span>
            <span className="label"><span className="clip">{g.label}</span> <b>{g.n}</b>{g.n >= majority && <span className="sr-only">{L(' (majority)', ' (רוב)')}</span>}</span>
          </button>
        ))}
        <span className="milestone" aria-hidden style={{ left: `${(majority / total) * 100}%` }}><span>{majority}</span></span>
      </div>
      {/* on narrow screens the bands are too short for their names: they are listed in full beneath */}
      <div className="strip-legend" aria-hidden>
        {groups.map((g) => <span key={g.key}><span className="swatch" style={{ background: g.color }} />{g.label} <b>{g.n}</b></span>)}
      </div>
    </section>
  );
}
