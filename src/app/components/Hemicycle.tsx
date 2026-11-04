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
import { arcLayout, bandCuts } from '../layout.ts';
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
  const rank = (b: string | null) => { const i = s.blocs.findIndex((x) => x.id === b); return i < 0 ? s.blocs.length : i; };
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
  const baselineSeats = useMemo(() => seatOrder(base, br, colorBy), [base, br, colorBy]);
  const total = s.rules.seats;
  const rtl = lang === 'he';
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
    const extra = mini ? 170 : 0;
    if (mini) {
      const inset = mini.cloneNode(true) as SVGSVGElement;
      [inset, ...inset.querySelectorAll('*')].forEach((node,i) => {
        const style = getComputedStyle([mini,...mini.querySelectorAll('*')][i]);
        for (const prop of ['fill','stroke','stroke-width','stroke-dasharray','opacity']) node.setAttribute(prop,style.getPropertyValue(prop));
      });
      inset.setAttribute('x',String(vb.x+16)); inset.setAttribute('y',String(vb.y+vb.height+25));
      inset.setAttribute('width','400'); inset.setAttribute('height','125');
      const label = document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('x',String(vb.x+16)); label.setAttribute('y',String(vb.y+vb.height+16)); label.setAttribute('font-size','14');label.setAttribute('fill',css.getPropertyValue('--ink'));
      label.textContent = L('Baseline outline — schematic losses, no occupied seats', 'מתאר הבסיס — אובדן סכמטי, ללא מושבים תפוסים');
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
    // pale regions behind each bloc's seats; their edges step row by row, midway between neighbouring blocs' seats
    const pt = (a: number, rr: number) => `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy - Math.sin(a) * rr).toFixed(1)}`;
    const placed = seats.map((_, i) => pos[rtl ? pos.length - 1 - i : i]).filter(Boolean);
    const geometry = bandCuts(placed, bandOf, bands.length, !rtl);
    const radii = geometry.radii;
    // Extend the ends below the seat centres: the boundary encloses the whole endpoint disks.
    const cuts = geometry.cuts.map(row => row.map(a => a === 0 ? -0.14 : a === Math.PI ? Math.PI + 0.14 : a));
    const edges = [R * (0.38 - rad) - 10, ...radii.slice(1).map((x, i) => (R * (radii[i] + x)) / 2), R * (1 + rad) + 10];
    const start = rtl ? -0.14 : Math.PI + 0.14, end = rtl ? Math.PI + 0.14 : -0.14;
    const arc = (a0: number, a1: number, rr: number) => `A ${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 ${a1 < a0 ? 1 : 0} ${pt(a1, rr)}`;
    const wedges = bands.map((b, k) => {
      const left = k === 0 ? radii.map(() => start) : cuts[k - 1];
      const right = k === bands.length - 1 ? radii.map(() => end) : cuts[k];
      let d = `M ${pt(left[0], edges[0])}`;
      radii.forEach((_, i) => { d += ` L ${pt(left[i], edges[i + 1])}`; if (i < radii.length - 1 && left[i + 1] !== left[i]) d += ` ${arc(left[i], left[i + 1], edges[i + 1])}`; });
      d += ` ${arc(left[radii.length - 1], right[radii.length - 1], edges[radii.length])}`;
      for (let i = radii.length - 1; i >= 0; i--) { d += ` L ${pt(right[i], edges[i])}`; if (i > 0 && right[i - 1] !== right[i]) d += ` ${arc(right[i], right[i - 1], edges[i])}`; }
      d += ` ${arc(right[0], left[0], edges[0])} Z`;
      const outline = d;
      seats.forEach((_, i) => {
        if (bandOf[i] !== k) return;
        const p = placed[i], x = cx + p.x * R, y = cy + p.y * R, rr = rad * R + 5;
        d += ` M ${x-rr} ${y} a ${rr} ${rr} 0 1 ${rtl ? 0 : 1} ${rr*2} 0 a ${rr} ${rr} 0 1 ${rtl ? 0 : 1} ${-rr*2} 0 Z`;
      });
      return { key: `${b.bloc}-${k}`, color: b.color, d, outline };
    });
    body = (
      <svg ref={svgRef} viewBox={`40 30 920 ${H - 30}`} role="img" aria-label={`${title ?? L('Knesset seat diagram', 'תרשים מושבי הכנסת')}: ${summary}`}>
        {wedges.map((w) => <path key={w.key} data-bloc-region={bands[wedges.indexOf(w)].bloc} strokeDasharray={bands[wedges.indexOf(w)].bloc === "__none" ? "4 3" : undefined} className="wedge" fillRule="nonzero" d={w.d} fill={w.color} stroke="none" />)}
        {wedges.map((w,k) => <path key={`edge-${k}`} d={w.outline} fill="none" stroke={w.color} strokeOpacity={0.65} strokeWidth={1.5} strokeDasharray={bands[k].bloc === '__none' ? '4 3' : undefined} />)}
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
          <select aria-label={L('Colour seats by', 'צביעת מושבים לפי')} value={colorBy} onChange={(e) => setState({ colorBy: e.target.value as 'list' | 'bloc' | 'party' })}>
            <option value="list">{L('Colour: list', 'צבע: רשימה')}</option>
            <option value="bloc">{L('Colour: bloc', 'צבע: גוש')}</option>
            <option value="party">{L('Colour: constituent party', 'צבע: מפלגה מרכיבה')}</option>
          </select>
        </div>
      )}
      {body}
      {changes.lost.size > 0 && <div className="baseline-mini">
        <p className="small muted">{L('Baseline outline · schematic count comparison · dashed slots: lost ordinals', 'מתאר הבסיס · השוואת כמויות סכמטית · מקווקו: מקומות שאבדו')} · {referenceLabel(labelReference,lang).name}</p>
        <svg viewBox="0 0 400 125" role="img" aria-label={L('120 empty baseline slots; dashed outlines mark losses, not occupied seats or transfers', '120 מקומות בסיס ריקים; קווים מקווקווים מציינים אובדן, לא מושבים תפוסים או העברות')}>
          {baselineSeats.map((st,i)=> <rect key={i} data-baseline-slot="" data-lost={changes.lost.has(`${st.listId}:${st.idx}`) ? '' : undefined}
            x={(rtl ? 19-i%20 : i%20)*20+2} y={Math.floor(i/20)*20+2} width={16} height={16} rx={3}
            fill="none" stroke="var(--ink)" strokeWidth={changes.lost.has(`${st.listId}:${st.idx}`)?2:1} strokeDasharray={changes.lost.has(`${st.listId}:${st.idx}`)?'3 2':undefined} opacity={changes.lost.has(`${st.listId}:${st.idx}`)?1:0.18} />)}
        </svg>
      </div>}
      <GraphicChanges s={s} r={r} reference={reference} />
      {seats.some(st=>st.bloc===null) && <span className="no-bloc-key small">{L('Dotted neutral region: No bloc', 'אזור ניטרלי מנוקד: ללא גוש')}</span>}
      <p className="small muted graphic-key">{L('Schematic count comparison: neutral outlines mark gained list ordinals. No individual seat transfers are implied.', 'השוואת כמויות סכמטית: מתאר ניטרלי מציין מקומות שנוספו לרשימה. אין משמעות של העברת מנדט מסוים.')} {referenceLabel(labelReference, lang).since}</p>
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
