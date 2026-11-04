import { blocDisplayOrder } from '../blocOrder.ts';
import { GraphicChanges } from './GraphicChanges.tsx';
import { changedSeatKeys } from '../graphics.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { useDisclosure } from './Feature.tsx';
import { BlocMajorities } from './Majority.tsx';
import { useMemo, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { listLabel, methodOf, seatBlocsOf, seatedOrder, shownName, referenceLabel, comparisonGroups } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { arcLayout, annularRegions } from '../layout.ts';
import { download, isolate, signed } from '../format.ts';
import { setState, useStore } from '../store.ts';
import { Seg } from './ui.tsx';

export interface SeatInfo { listId: string; idx: number; color: string; remainder: boolean; bloc: string | null; holder: string }

/** Seats in chamber order. With a bloc grouping, seats are grouped by bloc (decision 0087): each seat counts
 *  for its member's party bloc when it differs from the list's. Within a bloc, lists keep their order. */
export function seatOrder(s: Scenario, r: AllocationResult, colorBy: 'list' | 'bloc' | 'party'): SeatInfo[] {
  const out: (SeatInfo & { k: number })[] = [];
  const split = new Set(s.factionSplits ?? []);
  let k = 0;
  for (const l of s.lists) {
    const lr = r.lists.find((x) => x.id === l.id);
    if (!lr || !lr.seats) continue;
    const seated = seatedOrder(l);
    const blocs = seatBlocsOf(s, l, lr.seats);
    const parties = [...new Set(seated.map((c) => c.partyHe ?? ''))];
    for (let i = 0; i < lr.seats; i++) {
      const c = seated[i];
      // a constituent party's own colour (decision 0087) where the research gives one
      let color = l.color;
      if (colorBy === 'bloc') color = s.blocs.find((b) => b.id === blocs[i])?.color ?? '#8e8e93';
      if (colorBy === 'party') color = (c?.partyId && l.parties?.find(p => p.id === c.partyId)?.color) || (parties.length > 1 ? shade(l.color, parties.indexOf(c?.partyHe ?? '')) : l.color);
      const holder = split.has(l.id) && c?.partyId && l.parties?.some((p) => p.id === c.partyId) ? `${l.id}:${c.partyId}` : l.id;
      out.push({ listId: l.id, idx: i, color, remainder: i >= lr.initialSeats, bloc: blocs[i], holder, k: k++ });
    }
  }
  if (!s.blocs.length) return out;
  const order = blocDisplayOrder(s);
  const rank = (b: string | null) => order.indexOf(b);
  return out.sort((a, b) => rank(a.bloc) - rank(b.bloc) || a.k - b.k);
}

function shade(hex: string, i: number): string {
  if (i <= 0) return hex;
  const n = parseInt(hex.slice(1), 16);
  const f = [0, 0.38, -0.3, 0.6, -0.5][i % 5];
  const ch = (v: number) => Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function Hemicycle({ s, r, compact: compactProp = false, title, reference }: { s: Scenario; r: AllocationResult; compact?: boolean; title?: string; reference?: Scenario }) {
  const L = useL();
  const { shown: standard, control: standardControl } = useDisclosure('chamberLegend');
  const { shown: expert, control: expertControl } = useDisclosure('chamberOptions');
  const lang = useLang();

  // layout and colouring are Expert settings: below Expert the chamber always uses the defaults
  const layout = useStore((st) => (expert ? st.layout : 'hemicycle'));
  const colorBy = useStore((st) => (expert ? st.colorBy : 'list'));
  const selected = useStore((st) => st.selectedListId);
  const svgRef = useRef<SVGSVGElement>(null);
  // on a phone the arc fills the width without labels; the legend below names the lists instead

  const [hover, setHover] = useState<{ seat: SeatInfo; x: number; y: number } | null>(null);
  const seats = useMemo(() => seatOrder(s, r, colorBy), [s, r, colorBy]);
  const { base, result: br, labelReference } = useGraphicReference(s, reference);
  const changes = useMemo(() => changedSeatKeys(s, r, base, br), [s, r, base, br]);
  const hasChanges = changes.gained.size > 0 || changes.lost.size > 0;
  const baselineSeats = useMemo(() => seatOrder(base, br, colorBy), [base, br, colorBy]);
  const total = s.rules.seats;
  const rtl = false; // Geometry is physically left-to-right in both languages, like the 61 marker.
  const { seats: pos, r: rad } = useMemo(() => arcLayout(total), [total]);
  const W = 1000, H = layout === 'hemicycle' ? 560 : 0;
  const listOf = (id: string) => s.lists.find((l) => l.id === id) as SimList;
  // one region per run of seats in the same bloc (seats are ordered by angle); bandOf[i] is seat i's region
  const { bands, bandOf } = useMemo(() => {
    const out: { bloc: string; color: string }[] = [];
    const bandOf: number[] = [];
    if (layout !== 'hemicycle') return { bands: out, bandOf };
    seats.forEach((st) => {
      // seats in no bloc keep an untinted region of their own, so neighbouring regions never claim them
      const bloc = st.bloc ?? '__none';
      if (out[out.length - 1]?.bloc !== bloc) out.push({ bloc, color: st.bloc ? s.blocs.find((b) => b.id === st.bloc)?.color ?? 'transparent' : 'var(--muted)' });
      bandOf.push(out.length - 1);
    });
    return { bands: out, bandOf };
  }, [seats, s.blocs, layout]);

  const onSeat = (st: SeatInfo, evt: React.MouseEvent | React.FocusEvent) => {
    const box = (evt.currentTarget as SVGElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    const t = (evt.currentTarget as SVGElement).getBoundingClientRect();
    setHover({ seat: st, x: t.left - box.left + t.width / 2, y: t.top - box.top });
  };

  const exportSvg = (kind: 'svg' | 'png') => {
    const el = svgRef.current; if (!el) return;
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const css = getComputedStyle(document.body);
    clone.style.background = css.getPropertyValue('--surface');
    clone.querySelectorAll('text').forEach((t) => t.setAttribute('fill', css.getPropertyValue('--ink')));
    // Downloads are standalone: resolve theme/CSS tokens and retain the external legend.
    const originalNodes = [el, ...el.querySelectorAll('*')];
    [clone, ...clone.querySelectorAll('*')].forEach((node, i) => {
      const style = getComputedStyle(originalNodes[i]);
      for (const prop of ['fill','stroke','stroke-width','stroke-dasharray','fill-opacity','stroke-opacity'])
        node.setAttribute(prop, style.getPropertyValue(prop));
    });
    const vb = el.viewBox.baseVal;
    const rows = s.lists.map(l => ({l,n:r.lists.find(x=>x.id===l.id)?.seats ?? 0})).filter(x=>x.n>0);
    const mini = svgRef.current?.parentElement?.querySelector('.baseline-mini svg') as SVGSVGElement | null;
    const extra = mini ? 270 : 0;
    if (mini) {
      const inset = mini.cloneNode(true) as SVGSVGElement;
      [inset, ...inset.querySelectorAll('*')].forEach((node,i) => {
        const style = getComputedStyle([mini,...mini.querySelectorAll('*')][i]);
        for (const prop of ['fill','stroke','stroke-width','stroke-dasharray','opacity']) node.setAttribute(prop,style.getPropertyValue(prop));
      });
      inset.setAttribute('x',String(vb.x+16)); inset.setAttribute('y',String(vb.y+vb.height+25));
      inset.setAttribute('width','400'); inset.setAttribute('height','230');
      const label = document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('x',String(vb.x+16)); label.setAttribute('y',String(vb.y+vb.height+16)); label.setAttribute('font-size','14');label.setAttribute('fill',css.getPropertyValue('--ink'));
      label.textContent = referenceLabel(labelReference,lang).name;
      clone.appendChild(label);clone.appendChild(inset);
    }
    clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height+extra+Math.ceil(rows.length/2)*28+16}`);
    rows.forEach(({l,n},i) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',String(vb.x+16+(i%2)*vb.width/2));
      text.setAttribute('y',String(vb.y+vb.height+extra+20+Math.floor(i/2)*28));
      text.setAttribute('fill',css.getPropertyValue('--ink'));
      text.setAttribute('font-size','16');
      text.setAttribute('direction','ltr');
      const label = listLabel(l,lang);
      const g = comparisonGroups(s,r,base,br).find(g=>g.bIds.includes(l.id));
      const delta = g?.bIds.length === 1 ? ` · ${g.seatsA} → ${g.seatsB} (${signed(g.seatsB-g.seatsA)})` : '';
      text.textContent = isolate(`${label.length>24 ? label.slice(0,23)+'…' : label} ${n}${delta}`);
      clone.appendChild(text);
    });
    const xml = new XMLSerializer().serializeToString(clone);
    if (kind === 'svg') return download('knesset.svg', xml, 'image/svg+xml');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 2000; c.height = Math.round((2000 * clone.viewBox.baseVal.height) / clone.viewBox.baseVal.width);
      const ctx = c.getContext('2d')!; ctx.fillStyle = css.getPropertyValue('--surface') || '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => b && download('knesset.png', b), 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  };

  const summary = s.lists.map((l) => ({ l, n: r.lists.find((x) => x.id === l.id)?.seats ?? 0 })).filter((x) => x.n > 0)
    .map(({ l, n }) => `${listLabel(l, lang)} ${n}`).join(', ');
  // how a remainder seat was won depends on the era's method
  const m = methodOf(s.rules);
  const remainderHow = L(`Seat won by ${m.en}`, `מנדט שהושג בשיטת ${m.he}`);
  const hv = hover ? listOf(hover.seat.listId) : null;
  const cand = hover && hv ? seatedOrder(hv)[hover.seat.idx] ?? null : null;

  let body: React.ReactNode;
  if (layout === 'hemicycle') {
    const cx = W / 2, cy = 470, R = 400;
    const wedges = annularRegions(pos, bandOf, rad, cx, cy, R);
    body = (
      <svg ref={svgRef} viewBox={`40 30 920 ${H - 30}`} role="img" aria-label={`${title ?? L('Knesset seat diagram', 'תרשים מושבי הכנסת')}: ${summary}`}>
        {wedges.map(w => <g key={w.band}>
          <path data-bloc-region={bands[w.band].bloc} className="wedge" d={w.fill} fill={bands[w.band].color} stroke="none" />
          <path d={w.outline} fill="none" stroke={bands[w.band].color} strokeOpacity={0.65} strokeWidth={1.5} strokeDasharray={bands[w.band].bloc === '__none' ? '4 3' : undefined} />
        </g>)}
        {seats.map((st, i) => {
          const p = pos[rtl ? pos.length - 1 - i : i]; if (!p) return null;
          const dim = selected && selected !== st.listId;
          return (
            <circle key={i} className={`seat ${dim ? 'dim' : ''}`} cx={cx + p.x * R} cy={cy + p.y * R} r={rad * R} fill={st.color}
              data-seat="" data-bloc={st.bloc ?? "__none"} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? "var(--ink)" : "var(--surface)"} strokeWidth={changes.gained.has(`${st.listId}:${st.idx}`) ? 4 : 2}
              onMouseEnter={(e) => onSeat(st, e)} onMouseLeave={() => setHover(null)} onFocus={(e) => onSeat(st, e)} onBlur={() => setHover(null)}
              onClick={() => setState({ selectedListId: selected === st.listId ? null : st.listId })} />
          );
        })}
        <text x={cx} y={cy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill="var(--ink)">{r.seatsAllocated}</text>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="var(--ink-2)">{isolate(L(`seats · majority ${Math.floor(total / 2) + 1}`, `מנדטים · רוב ${Math.floor(total / 2) + 1}`))}</text>
      </svg>
    );
  } else {
    // Fixed 20 × 6 tray: topology and number of lists never change the geometry.
    body = <svg ref={svgRef} viewBox="0 0 1000 320" role="img" aria-label={summary}>
      {seats.map((st, i) => {
        const x = 24 + (rtl ? 19-i%20 : i%20)*48, y = 16+Math.floor(i/20)*48;
        const bc = s.blocs.find(b => b.id === st.bloc)?.color ?? 'var(--muted)';
        return <g key={i}><rect data-bloc-region={st.bloc ?? '__none'} x={x-5} y={y-5} width={46} height={46} rx={8} fill={bc} className="wedge" />
          <rect data-seat="" className="seat" x={x} y={y} width={36} height={36} rx={4} fill={st.color} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? 'var(--ink)' : 'var(--surface)'} strokeWidth={3}
            onMouseEnter={e => onSeat(st,e)} onMouseLeave={() => setHover(null)} onClick={() => setState({selectedListId: st.listId})} />
        </g>;
      })}

    </svg>;
  }

  return (
    <div className="chamber">{expertControl}{standardControl}
      {/* on the board the bloc bar directly below already carries this line; Compare's chambers stand alone */}
      {compactProp && <BlocMajorities s={s} r={r} />}
      {expert && !compactProp && (
        <div className="row chamber-tools" style={{ justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
          <Seg label={L('Chamber layout', 'פריסה')} value={layout} onChange={(v) => setState({ layout: v })} options={[{ v: 'hemicycle', label: L('Arc', 'קשת') }, { v: 'blocks', label: L('Blocks', 'גושים') }]} />

        </div>
      )}
      {body}
      {hasChanges && <div className="baseline-mini">
        <span className="small muted">{referenceLabel(labelReference,lang).name}</span>
        <svg viewBox="40 30 920 530" role="img" aria-label={referenceLabel(labelReference,lang).name}>
          {annularRegions(pos, baselineSeats.map(st=>blocDisplayOrder(base).indexOf(st.bloc)),rad).map(w=>{
            const id=blocDisplayOrder(base)[w.band], color=base.blocs.find(b=>b.id===id)?.color ?? 'var(--muted)';
            return <g key={w.band}><path className="wedge" d={w.fill} fill={color} stroke="none" /><path d={w.outline} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.65} /></g>;
          })}
          {baselineSeats.map((st,i)=> <circle key={i} data-reference-seat="" data-lost={changes.lost.has(`${st.listId}:${st.idx}`) ? '' : undefined}
            cx={500+pos[i].x*400} cy={470+pos[i].y*400} r={rad*400} fill={st.color}
            stroke={changes.lost.has(`${st.listId}:${st.idx}`)?'var(--ink)':'var(--surface)'} strokeWidth={changes.lost.has(`${st.listId}:${st.idx}`)?5:2} strokeDasharray={changes.lost.has(`${st.listId}:${st.idx}`)?'4 3':undefined} />)}
          <text x={500} y={440} textAnchor="middle" fontSize={44} fill="var(--ink)">{br.seatsAllocated}</text>
        </svg>
      </div>}
      <p className="small muted graphic-key">{hasChanges ? L(`Outlined: seats gained since ${referenceLabel(labelReference,lang).name}. Small chamber: ${referenceLabel(labelReference,lang).name}.`, `מתאר: מנדטים שנוספו מאז ${referenceLabel(labelReference,lang).name}. הכנסת הקטנה: ${referenceLabel(labelReference,lang).name}.`) : L(`Reference: ${referenceLabel(labelReference,lang).name}`, `בסיס: ${referenceLabel(labelReference,lang).name}`)} <span tabIndex={0} className="comparison-info" aria-label={L('About these outlines','על המתארים')} title={L('Outlines compare list seat counts. Dashed outlines in the reference chamber show losses. They do not identify a seat or voter moving between lists. Dashed bars show the reference; neutral ink shows the difference.', 'המתארים משווים את מספר המנדטים של הרשימות. קווים מקווקווים בכנסת הקטנה מציינים אובדן. אין משמעות של מנדט או בוחר שעבר בין רשימות. מתארי העמודות המקווקווים מציינים את הבסיס; דיו ניטרלי מציין שינוי.')}>(i)</span></p>
      <GraphicChanges s={s} r={r} reference={reference} compact />
      {hover && hv && (
        <div className="tip" style={{ left: Math.max(0, hover.x - 100), top: Math.max(0, hover.y - 96) }}>
          <div className="row"><span className="swatch" style={{ background: hover.seat.color }} /><b>{listLabel(hv, lang)}</b> <span className="muted">({hv.letters})</span></div>
          {cand ? <div><b>{shownName(cand)}</b> · {L('rank', 'מקום')} {hover.seat.idx + 1}{cand.notes?.map((n, k) => <div key={k} className="muted small">{lang === 'he' ? n.he : n.en}</div>)}</div>
            : hv.rosterUnavailable || hv.rosterTruncated ? <div className="muted">{L(`Seat ${hover.seat.idx + 1} of the list; candidate names are not available for this election`, `מושב ${hover.seat.idx + 1} של הרשימה; שמות המועמדים אינם זמינים לבחירות אלה`)}</div>
            : <div className="bad">{L('Vacant — the list has too few candidates', 'מושב ריק — אין די מועמדים ברשימה')}</div>}
          {cand?.partyHe && <div className="muted small">{L('Party: ', 'מפלגה: ')}{cand.partyHe}</div>}
          <div className="muted small">{hover.seat.remainder ? remainderHow : L('Seat won by whole quota', 'מנדט שהושג במודד שלם')}</div>
        </div>
      )}
      {!compactProp && (
        <div className="legend" role="group" aria-label={L('Lists in the Knesset', 'הרשימות בכנסת')} style={{ marginTop: 6 }}>
          {seats.some(st=>st.bloc===null) && <span className="row no-bloc-legend"><span className="swatch" style={{background:'color-mix(in srgb, var(--muted) 30%, var(--surface))',border:'1px dotted var(--muted)'}} />{L('No bloc','ללא גוש')}</span>}
          {s.lists.map((l) => ({ l, n: r.lists.find((x) => x.id === l.id)?.seats ?? 0 })).filter((x) => x.n > 0).map(({ l, n }) => (
            <button key={l.id} aria-pressed={selected === l.id} onClick={() => setState({ selectedListId: selected === l.id ? null : l.id })}>
              <span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <b className="tabnum">{n}</b>
            </button>
          ))}
        </div>
      )}
      {!compactProp && standard && (
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn small ghost" onClick={() => exportSvg('svg')}>{L('Export SVG', 'ייצוא SVG')}</button>
          <button className="btn small ghost" onClick={() => exportSvg('png')}>{L('Export PNG', 'ייצוא PNG')}</button>
        </div>
      )}
    </div>
  );
}
