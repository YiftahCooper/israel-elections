import { groupingName, appGroupingExplanation, appGroupingTag } from '../groupingName.ts';
import { blocDisplayOrder } from '../blocOrder.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { EditMarker } from './EditMarker.tsx';
// Blocs (decision 0087): the election's sourced groupings (the first government, recognised blocs) and
// the user's own. Seats count per seat: a constituent party of a joint list can sit in another bloc
// than its list. Moving parties between blocs never changes votes or seats. A bloc opens its editor
// beside the chamber (BlocPanel), where it is renamed, recoloured and its members moved.
import { useEffect, useMemo, useRef } from 'react';
import { Pencil } from 'lucide-react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, groupingBaseline, allocationOf, referenceLabel, groupingLabel, majorityText } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { setState, useStore } from '../store.ts';
import { Info } from './ui.tsx';


export function BlocBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const previewing = useStore(st => st.preview) === s;
  const selected = useStore((st) => st.selectedListId);
  const panel = useStore((st) => st.blocPanel);
  const showComponents = useStore(st=>st.showComponentSeats);
  const pieces = useMemo(() => blocPieces(s, r), [s, r]);
  const { base, labelReference } = useGraphicReference(s);
  const grouped = groupingBaseline(s, base);
  const before = grouped ? blocPieces(grouped, allocationOf(grouped)) : [];
  const previous = useRef({ election: s.electionId, scheme: s.blocSchemeId, seats: new Map<string | null, number>() });
  const counts = useMemo(() => {
    const out = new Map<string | null, number>();
    for (const p of pieces) out.set(p.bloc, (out.get(p.bloc) ?? 0) + p.n);
    return out;
  }, [pieces]);
  useEffect(() => { if (previewing) return; previous.current = { election: s.electionId, scheme: s.blocSchemeId, seats: counts }; }, [s.electionId, s.blocSchemeId, counts, previewing]);
  const total = s.rules.seats;
  const majority = Math.floor(total / 2) + 1;
  if (r.seatsAllocated === 0) return <p className="small muted" style={{ margin: 0 }}>{L('No seats are allocated in this scenario.', 'בתרחיש זה לא חולקו מושבים.')}</p>;

  const scheme = s.blocSchemes?.find(x => x.id === s.blocSchemeId);
  const name = (b: { nameHe: string; nameEn: string; appDefined?: boolean }) => groupingName(b, lang);
  const NONE = '__none';
  const groups = [...s.blocs.map((b) => ({ key: b.id, id: b.id as string | null, label: name(b), contextLabel: groupingName(b, lang, scheme), showMarker: b.appDefined && !scheme?.appDefined, shortLabel: groupingName({...b, appDefined: false}, lang), appDefined: b.appDefined, color: b.color })), { key: NONE, id: null, label: L('No bloc', 'ללא גוש'), contextLabel: L('No bloc', 'ללא גוש'), showMarker: false, shortLabel: L('No bloc', 'ללא גוש'), appDefined: false, color: '#8a9099' }]
    .sort((a,b)=>blocDisplayOrder(s).indexOf(a.id)-blocDisplayOrder(s).indexOf(b.id))
    .map((g) => ({ ...g, pieces: pieces.filter((p) => p.bloc === g.id) }))
    .map((g) => ({ ...g, n: g.pieces.reduce((t, p) => t + p.n, 0) }))
    .filter((g) => g.n > 0);
  // the reference outline is drawn only when some bloc's seats differ from it: an outline equal to the bar is noise
  const referenceBlocs = grouped ? [...s.blocs.map(b => ({ id: b.id as string | null, label: name(b) })), { id: null, label: L('No bloc', 'ללא גוש') }]
    .sort((a, b) => blocDisplayOrder(s).indexOf(a.id) - blocDisplayOrder(s).indexOf(b.id))
    .map(b => ({ ...b, n: before.filter(p => p.bloc === b.id).reduce((t, p) => t + p.n, 0) })) : [];
  const changed = referenceBlocs.some(b => b.n !== (groups.find(g => g.id === b.id)?.n ?? 0));
  // the majority consequence is said once, on the bloc itself (with a sourced grouping's name and date above the bar)
  const consequence = (n: number) => majorityText(n, total, lang).split(' · ')[1];
  const custom = s.blocSchemeId === null;
  const openPanel = (key: string) => setState({ blocPanel: key, selectedListId: null });
  const kindNote = scheme?.appDefined ? appGroupingExplanation(lang) : scheme?.kind === 'government' ? L('who formed the first government after this election, as recorded', 'מי הרכיבו את הממשלה הראשונה אחרי הבחירות, כפי שתועד')
    : scheme ? L('a recognised grouping of this election, from cited sources', 'חלוקה מוכרת של בחירות אלה, ממקורות מצוטטים')
    : custom ? L('your own grouping', 'החלוקה שלכם') : '';
  return (
    <section className="panel blocs" aria-label={L('Seats by bloc', 'מנדטים לפי גוש')}>
      <div className="blocs-head">
        <h2 style={{ margin: 0 }}>{L('Blocs', 'גושים')} <Info term="bloc">{kindNote}</Info> <EditMarker s={s} path={['customGroupingName']} /></h2>
        <button className="btn small" aria-expanded={!!panel} onClick={() => (panel ? setState({ blocPanel: null }) : openPanel(groups[0]?.key ?? NONE))}>
          <Pencil className="icon sm" aria-hidden />{s.blocs.length ? L('Edit blocs', 'עריכת גושים') : L('Group seats into blocs', 'חלוקת המושבים לגושים')}</button>
      </div>
      <div className="majority-context small"><span className="muted" title={scheme?.appDefined ? appGroupingExplanation(lang) : undefined}>{groupingLabel(s, lang)}</span></div>
      {changed && <p className="small muted" style={{margin:'4px 0'}}>{L('Dashed outline: ', 'מתאר מקווקו: ')}{referenceLabel(labelReference,lang).name}</p>}
      {changed && <div className="bloc-reference" aria-label={referenceLabel(labelReference, lang).name}>
        {referenceBlocs.map(b => b.n > 0 && <span key={b.id ?? NONE} style={{width:`${b.n/total*100}%`}} title={`${b.label} ${b.n}`} />)}
      </div>}
      <div className="strip" role="group" aria-label={`${groupingLabel(s, lang)}: ${groups.map(g => `${g.contextLabel} ${g.n}`).join(', ')}`}>
        {groups.map((g) => (
          <button key={g.key} type="button" className={`corridor ${g.id === null ? "no-bloc" : ""}`} style={{ flexGrow: g.n, flexBasis: 0, ['--bc' as string]: g.color }}
            aria-pressed={panel === g.key} title={(g.appDefined ? appGroupingExplanation(lang) + " " : "") + L(`${g.label}: ${g.n}${g.id !== null ? ` (${consequence(g.n)})` : ''}. Edit this bloc`, `${g.label}: ${g.n}${g.id !== null ? ` (${consequence(g.n)})` : ''}. עריכת הגוש`)} onClick={() => openPanel(g.key)}>
            <span className="pieces" aria-hidden>
              {g.pieces.map((p, i) => <i key={i} className={selected && selected !== p.listId ? 'dim' : ''} style={{ flexGrow: p.n, background: showComponents && (s.factionSplits ?? []).includes(p.listId) ? p.color : s.lists.find(l=>l.id===p.listId)?.color ?? p.color, borderBlock: showComponents && (s.factionSplits ?? []).includes(p.listId) ? `3px solid ${s.lists.find(l=>l.id===p.listId)?.color}` : undefined, boxSizing: 'border-box' }} />)}
            </span>
            <span className="label"><span className="clip">{g.shortLabel}</span>{g.showMarker && <small className="app-grouping-tag">· {appGroupingTag(lang)}</small>} <b key={g.n >= majority ? 'majority' : 'minority'} className={g.id !== null && previous.current.election === s.electionId && previous.current.scheme === s.blocSchemeId && previous.current.seats.has(g.id) && ((previous.current.seats.get(g.id)! >= majority) !== (g.n >= majority)) ? 'tick' : ''}>{g.n}</b>{g.id !== null && <> <bdi className="consequence">{consequence(g.n)}</bdi></>}{g.n >= majority && <span className="sr-only">{L(' (majority)', ' (רוב)')}</span>}</span>
          </button>
        ))}
        <span className="milestone" aria-hidden style={{ left: `${(majority / total) * 100}%` }}><span>{majority}</span></span>
      </div>
      {/* on narrow screens the bands are too short for their names: they are listed in full beneath */}
      <div className="strip-legend" aria-hidden>
        {groups.map((g) => <span key={g.key} title={g.appDefined ? appGroupingExplanation(lang) : undefined}><span className="swatch" style={{ background: g.color }} />{g.contextLabel} <b key={g.n >= majority ? 'majority' : 'minority'} className={g.id !== null && previous.current.election === s.electionId && previous.current.scheme === s.blocSchemeId && previous.current.seats.has(g.id) && ((previous.current.seats.get(g.id)! >= majority) !== (g.n >= majority)) ? 'tick' : ''}>{g.n}</b>{g.id !== null && <> <bdi className="consequence">{consequence(g.n)}</bdi></>}</span>)}
      </div>
    </section>
  );
}
