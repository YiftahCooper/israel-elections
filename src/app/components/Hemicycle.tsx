import { Slip } from './ui.tsx';
import { syntheticIconSvg } from '../syntheticIcon.ts';
import { CandidateName } from './CandidateName.tsx';
import memberNames from '../../data/candidate-display-names.json';
import { Floating, useHoverBridge } from '../floating.tsx';
import { blocDisplayOrder } from '../blocOrder.ts';
import { changedSeatKeys } from '../graphics.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { useDisclosure } from './Feature.tsx';
import { BlocMajorities } from './Majority.tsx';
import { useMemo, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, listLabel, methodOf, seatBlocsOf, seatedOrder, candidateName, referenceLabel, comparisonGroups } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { arcLayout, annularRegions } from '../layout.ts';
import { download, isolate, seatDeltaText } from '../format.ts';
import { electionLabel } from '../electionLabel.ts';
import { setState, useStore } from '../store.ts';
import { Info, Seg } from './ui.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';

export interface SeatInfo { listId: string; idx: number; color: string; innerColor?: string; partyId?: string; remainder: boolean; bloc: string | null; holder: string }

/** Seats in chamber order. With a bloc grouping, seats are grouped by bloc (decision 0087): each seat counts
 *  for its member's party bloc when it differs from the list's. Within a bloc, lists keep their order. */
export function seatOrder(s: Scenario, r: AllocationResult, colorBy: 'list' | 'bloc' | 'party', showComponents = true): SeatInfo[] {
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
      const party = l.parties?.find(p => p.id === c?.partyId);
      const head = seated.find(c => c.partyId)?.partyId;
      const innerColor = showComponents && split.has(l.id) && (l.parties?.length ?? 0) > 1 && party && party.id !== head ? party.color ?? l.color : undefined;
      if (innerColor) color = l.color;
      out.push({ innerColor, partyId: party?.id, listId: l.id, idx: i, color, remainder: i >= lr.initialSeats, bloc: blocs[i], holder, k: k++ });
    }
  }
  // Keep component seats together within each list/bloc, preserving original candidate indices.
  const componentRank = (st: SeatInfo) => split.has(st.listId) ? s.lists.find(l => l.id === st.listId)?.parties?.findIndex(p => p.id === st.partyId) ?? -1 : 0;
  const within = (a: SeatInfo & { k: number }, b: SeatInfo & { k: number }) => a.listId === b.listId ? componentRank(a) - componentRank(b) || a.k - b.k : a.k - b.k;
  if (!s.blocs.length) return out.sort(within);
  const order = blocDisplayOrder(s);
  const rank = (b: string | null) => order.indexOf(b);
  return out.sort((a, b) => rank(a.bloc) - rank(b.bloc) || within(a, b));
}

function shade(hex: string, i: number): string {
  if (i <= 0) return hex;
  const n = parseInt(hex.slice(1), 16);
  const f = [0, 0.38, -0.3, 0.6, -0.5][i % 5];
  const ch = (v: number) => Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** `paired`: drawn beside its reference chamber (Compare), so the small reference chamber and change list are not repeated. */
export function Hemicycle({ s, r, compact: compactProp = false, title, reference, paired = false }: { s: Scenario; r: AllocationResult; compact?: boolean; title?: string; reference?: Scenario; paired?: boolean }) {
  const L = useL();
  const { shown: standard, control: standardControl } = useDisclosure('chamberLegend');
  const { shown: expert, control: expertControl } = useDisclosure('chamberOptions');
  const lang = useLang();

  // layout and colouring are Expert settings: below Expert the chamber always uses the defaults
  const layout = useStore((st) => (expert ? st.layout : 'hemicycle'));
  const colorBy = useStore((st) => (expert ? st.colorBy : 'list'));
  const showComponents = useStore(st => st.showComponentSeats);
  const previewing = useStore(st => st.preview) === s;
  const committed = useStore(st => st.scenario);
  const evidenceScenario = previewing && committed ? committed : s;
  const evidenceResult = previewing && committed ? allocationOf(committed) : r;
  const selected = useStore((st) => st.selectedListId);
  const elections = useStore((st) => st.elections);
  const svgRef = useRef<SVGSVGElement>(null);
  // on a phone the arc fills the width without labels; the legend below names the lists instead

  const [hover, setHover] = useState<{ seat: SeatInfo; anchor: Element } | null>(null);
  const seats = useMemo(() => seatOrder(s, r, colorBy, showComponents), [s, r, colorBy, showComponents]);
  const { base, result: br, labelReference } = useGraphicReference(s, reference);
  const changes = useMemo(() => changedSeatKeys(s, r, base, br), [s, r, base, br]);
  // Supplemental evidence follows completed edits, keeping the first drag from
  // mounting a second chamber and moving the legend under the pointer.
  const evidenceChanges = useMemo(() => changedSeatKeys(evidenceScenario, evidenceResult, base, br), [evidenceScenario, evidenceResult, base, br]);
  const hasChanges = !paired && (evidenceChanges.gained.size > 0 || evidenceChanges.lost.size > 0);
  const baselineSeats = useMemo(() => seatOrder(base, br, colorBy, showComponents), [base, br, colorBy, showComponents]);
  const total = s.rules.seats;
  const rtl = false; // Geometry is physically left-to-right in both languages, like the 61 marker.
  const { seats: pos, r: rad } = useMemo(() => arcLayout(total), [total]);
  const W = 1000, H = layout === 'hemicycle' ? 490 : 0;
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

  const hoverBridge = useHoverBridge(() => setHover(null));
  const onSeat = (st: SeatInfo, evt: React.MouseEvent | React.FocusEvent) => {
    hoverBridge.cancel();
    setHover({ seat: st, anchor: evt.currentTarget });
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
      // regions carry their colour in an inline color-mix(var(...)) style; the resolved fill was just copied above
      if (node instanceof SVGElement && node.classList.contains('wedge')) node.removeAttribute('style');
    });
    const vb = el.viewBox.baseVal;
    const NS = 'http://www.w3.org/2000/svg', ink = css.getPropertyValue('--ink'), rtlText = lang === 'he';
    const svgText = (x: number, y: number, size: number, content: string) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', String(x)); t.setAttribute('y', String(y)); t.setAttribute('font-size', String(size)); t.setAttribute('fill', ink);
      // Hebrew lines run right to left from the column's right edge; numbers stay a left-to-right isolate inside them
      t.setAttribute('direction', rtlText ? 'rtl' : 'ltr'); t.setAttribute('text-anchor', 'start');
      t.textContent = content; return t;
    };
    // a column's start edge: the left edge in English, the right edge in Hebrew, with the first column on the reading side
    const colStart = (col: number) => (rtlText ? vb.x + vb.width - 16 - col * vb.width / 2 : vb.x + 16 + col * vb.width / 2);
    const mini = svgRef.current?.parentElement?.querySelector('.baseline-mini svg') as SVGSVGElement | null;
    const extra = mini ? 270 : 0;
    if (mini) {
      const inset = mini.cloneNode(true) as SVGSVGElement;
      [inset, ...inset.querySelectorAll('*')].forEach((node,i) => {
        const style = getComputedStyle([mini,...mini.querySelectorAll('*')][i]);
        for (const prop of ['fill','stroke','stroke-width','stroke-dasharray','opacity','fill-opacity','stroke-opacity']) node.setAttribute(prop,style.getPropertyValue(prop));
      });
      inset.setAttribute('x',String(rtlText ? vb.x + vb.width - 416 : vb.x+16)); inset.setAttribute('y',String(vb.y+vb.height+25));
      inset.setAttribute('width','400'); inset.setAttribute('height','230');
      clone.appendChild(svgText(colStart(0), vb.y+vb.height+16, 14, referenceLabel(labelReference,lang).name));
      clone.appendChild(inset);
    }
    // the legend in chamber order, each list with its seat colour(s), and old → new only where the seats changed
    const groupsNow = comparisonGroups(s,r,base,br);
    const rowsY = vb.y+vb.height+extra+20;
    const exportRows = legendRows.flatMap(({l,n,colors}) => {
      const components = componentRows.filter(row=>row.l.id===l.id);
      return components.length ? components.map(({p,n})=>({l,n,colors:[l.color],label:componentName(l,p),inner:p.id===seatedOrder(l).find(c=>c.partyId)?.partyId ? undefined : p.color}))
        : [{l,n,colors,label:listLabel(l,lang),inner:undefined}];
    });
    exportRows.forEach(({l,n,colors,label,inner},i) => {
      const x = colStart(i % 2), y = rowsY + Math.floor(i/2)*32, dir = rtlText ? -1 : 1;
      colors.forEach((c,k)=>{
        const dot = document.createElementNS(NS,'circle');
        dot.setAttribute('cx',String(x+dir*(7+k*16))); dot.setAttribute('cy',String(y-5)); dot.setAttribute('r','7'); dot.setAttribute('fill',c); clone.appendChild(dot);
        if(inner) { const fill=dot.cloneNode() as SVGCircleElement; fill.setAttribute('r','4.5'); fill.setAttribute('fill',inner); clone.appendChild(fill); }
      });
      const artwork = syntheticIconSvg(l);
      if (artwork && !componentRows.some(row => row.l.id === l.id)) {
        const tile = new DOMParser().parseFromString(artwork, 'image/svg+xml').documentElement;
        tile.innerHTML = tile.innerHTML.replaceAll('id="tile"', `id="tile-${i}"`).replaceAll('url(#tile)', `url(#tile-${i})`);
        tile.setAttribute('x', String(rtlText ? x - 44 : x)); tile.setAttribute('y', String(y - 19));
        tile.setAttribute('width', '44'); tile.setAttribute('height', '24'); clone.appendChild(tile);
      }
      const g = groupsNow.find(g=>g.bIds.includes(l.id));
      const delta = !componentRows.some(row=>row.l.id===l.id) && g?.bIds.length===1 ? g.seatsB-g.seatsA : 0;
      const numbers = delta && g ? `${g.seatsA} → ${g.seatsB}` : String(n);
      const legend = svgText(x+dir*(artwork ? 50 : 8+colors.length*16),y,16,`${label.length>42?label.slice(0,41)+'…':label} \u2066${numbers}\u2069`);
      if (delta) {
        const change = document.createElementNS(NS, 'tspan');
        change.textContent = ` \u2066(${seatDeltaText(delta)})\u2069`;
        change.setAttribute('fill', css.getPropertyValue(delta > 0 ? '--seat-gain' : '--seat-loss').trim());
        legend.appendChild(change);
      }
      clone.appendChild(legend);
    });
    const entry = elections.find(e=>e.id===s.electionId);
    const captionY = rowsY + Math.ceil(exportRows.length/2)*32 + 8;
    clone.appendChild(svgText(colStart(0), captionY, 13, `${entry ? electionLabel(entry, elections, lang) : ''}${entry ? ' · ' : ''}${s.log.length ? s.name || L('Scenario', 'תרחיש') : L('Official result', 'התוצאה הרשמית')}`));
    clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${captionY - vb.y + 14}`);
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
  const originalDataset = useStore(st => st.datasets[s.electionId]);
  const cand = hover && hv ? seatedOrder(hv)[hover.seat.idx] ?? null : null;

  // Only certain official identities use the Knesset's given-name-first display; user edits keep their text.
  const unchangedCandidate = cand && originalDataset?.lists.some(l => l.candidates.some(c => c.id === cand.id && c.nameHe === cand.nameHe));
  const sourcedName = cand?.bio?.knesset && !cand.bio.probable && !cand.displayNameHe && unchangedCandidate
    ? (memberNames as Record<string, string>)[cand.bio.knesset.split('/').at(-1)!] : undefined;
  const hoverCandidateName = cand ? (lang === 'he' && sourcedName ? sourcedName : candidateName(cand, lang)) : '';

  const seatLabel = (st: SeatInfo) => {
    const l = listOf(st.listId), party = l.parties?.find(p => p.id === st.partyId);
    return `${party && (s.factionSplits ?? []).includes(l.id) ? (lang === 'he' ? party.nameHe : party.nameEn) + ' · ' : ''}${listLabel(l, lang)}`;
  };
  let body: React.ReactNode;
  if (layout === 'hemicycle') {
    const cx = W / 2, cy = 470, R = 400;
    const wedges = annularRegions(pos, bandOf, rad, cx, cy, R);
    body = (
      <svg ref={svgRef} viewBox={`40 30 920 ${H - 30}`} role="img" aria-label={`${title ?? L('Knesset seat diagram', 'תרשים מושבי הכנסת')}: ${summary}`}>
        {wedges.map(w => <g key={w.band}>
          {/* opaque mix rather than fill-opacity: adjacent regions then meet without translucent seams, and a hairline
              stroke in the same colour closes the antialiasing gap between them */}
          <path data-bloc-region={bands[w.band].bloc} className="wedge solid" d={w.fill}
            style={{ fill: `color-mix(in srgb, ${bands[w.band].color} var(--wedge-mix), var(--surface))`, stroke: `color-mix(in srgb, ${bands[w.band].color} var(--wedge-mix), var(--surface))` }} />
        </g>)}
        {seats.map((st, i) => {
          const p = pos[rtl ? pos.length - 1 - i : i]; if (!p) return null;
          const dim = selected && selected !== st.listId;
          return (
            <g key={i}><circle className={`seat ${dim ? 'dim' : ''}`} cx={cx + p.x * R} cy={cy + p.y * R} r={rad * R} fill={st.color}
              data-seat="" data-bloc={st.bloc ?? "__none"} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? "var(--ink)" : "var(--surface)"} strokeWidth={changes.gained.has(`${st.listId}:${st.idx}`) ? 4 : 2}
              onMouseEnter={(e) => onSeat(st, e)} onMouseLeave={hoverBridge.leave} onFocus={(e) => onSeat(st, e)} onBlur={() => setHover(null)}
              onClick={() => setState({ selectedListId: selected === st.listId ? null : st.listId })}><title>{seatLabel(st)}</title></circle>
            {st.innerColor && <circle data-component-seat={st.partyId} pointerEvents="none" cx={cx + p.x * R} cy={cy + p.y * R} r={rad * R * .64} fill={st.innerColor} className={dim ? 'seat dim' : 'seat'} />}
            </g>
          );
        })}
        <text className="centre-total" x={cx} y={cy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill="var(--ink)">{r.seatsAllocated}</text>
        <text className="centre-sub" x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="var(--ink-2)">{isolate(L(`seats · majority ${Math.floor(total / 2) + 1}`, `מנדטים · רוב ${Math.floor(total / 2) + 1}`))}</text>
      </svg>
    );
  } else {
    // Fixed 20 × 6 tray: topology and number of lists never change the geometry.
    body = <svg ref={svgRef} viewBox="0 0 1000 320" role="img" aria-label={summary}>
      {seats.map((st, i) => {
        const x = 24 + (rtl ? 19-i%20 : i%20)*48, y = 16+Math.floor(i/20)*48;
        const bc = s.blocs.find(b => b.id === st.bloc)?.color ?? 'var(--muted)';
        return <g key={i}><rect data-bloc-region={st.bloc ?? '__none'} x={x-5} y={y-5} width={46} height={46} rx={8} fill={bc} stroke="none" className="wedge" />
          <rect data-seat="" className="seat" x={x} y={y} width={36} height={36} rx={4} fill={st.color} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? 'var(--ink)' : 'var(--surface)'} strokeWidth={3}
            onMouseEnter={e => onSeat(st,e)} onMouseLeave={hoverBridge.leave} onClick={() => setState({selectedListId: st.listId})}><title>{seatLabel(st)}</title></rect>
          {st.innerColor && <circle data-component-seat={st.partyId} pointerEvents="none" cx={x+18} cy={y+18} r={12} fill={st.innerColor} />}
        </g>;
      })}
      {/* Only the outside edge of each bloc is outlined; there are no per-seat frames. */}
      {seats.map((st, i) => {
        const col = i % 20, row = Math.floor(i / 20);
        const x = 19 + col * 48, y = 11 + row * 48;
        const same = (n: number) => n >= 0 && n < seats.length && seats[n].bloc === st.bloc;
        const d = [
          (row === 0 || !same(i - 20)) ? `M${x} ${y}h48` : '',
          (col === 19 || !same(i + 1)) ? `M${x + 48} ${y}v48` : '',
          (row === Math.ceil(seats.length / 20) - 1 || !same(i + 20)) ? `M${x} ${y + 48}h48` : '',
          (col === 0 || !same(i - 1)) ? `M${x} ${y}v48` : '',
        ].join(' ');
        if (!d.trim()) return null;
        return <g key={`boundary-${i}`} aria-hidden="true" pointerEvents="none">
          <path data-bloc-boundary-gap="" d={d} fill="none" stroke="var(--surface)" strokeWidth={8} />
          <path data-bloc-boundary={st.bloc ?? '__none'} d={d} fill="none" stroke={s.blocs.find(b => b.id === st.bloc)?.color ?? 'var(--muted)'} strokeWidth={3} />
        </g>;
      })}
    </svg>;
  }

  // lists in the order their seats are drawn (blocs left to right, No bloc between their halves), each with the colours
  // its seats actually carry in the chosen colour mode
  const legendRows = [...new Set(seats.map(st => st.listId))].map(id => ({ l: listOf(id), n: r.lists.find(x => x.id === id)?.seats ?? 0, colors: [...new Set(seats.filter(st => st.listId === id).map(st => st.color))] }));
  const componentName = (l: SimList, p: NonNullable<SimList['parties']>[number]) => { const name = lang === 'he' ? p.nameHe : p.nameEn; return name === listLabel(l,lang) ? name : `${name} · ${listLabel(l,lang)}`; };
  const componentRows = legendRows.flatMap(({l}) => (s.factionSplits ?? []).includes(l.id) && showComponents ? (l.parties ?? []).map(p => ({l,p,n:seats.filter(st=>st.listId===l.id && st.partyId===p.id).length})).filter(x=>x.n>0) : []);
  const head = !compactProp && (expertControl || standardControl || expert);
  return (
    <div className="chamber">
      {head && <div className="chamber-tools">
        {expert && <>
          <Seg label={L('Chamber layout', 'פריסה')} value={layout} onChange={(v) => setState({ layout: v })} options={[{ v: 'hemicycle', label: L('Arc', 'קשת') }, { v: 'blocks', label: L('Blocks', 'גושים') }]} />
          <ChoicePicker label={L('Colour seats by', 'צביעת מושבים לפי')} value={colorBy} options={(['list', 'bloc', 'party'] as const).map(value => ({ value, label: value === 'list' ? L('List', 'רשימה') : value === 'bloc' ? L('Bloc', 'גוש') : L('Party', 'מפלגה'), preview: <ResultPreview s={s} blocs={value === 'bloc'} party={value === 'party'} /> }))} onChange={value => setState({ colorBy: value as typeof colorBy })} />
        </>}
        {expertControl}{standardControl}
      </div>}
      {/* on the board the bloc bar directly below already carries this line; Compare's chambers stand alone */}
      {compactProp && <BlocMajorities s={s} r={r} />}
      {body}
      {hasChanges && <div className="baseline-mini">
        <span className="small muted">{referenceLabel(labelReference,lang).name}</span>
        <svg viewBox="40 30 920 460" role="img" aria-label={referenceLabel(labelReference,lang).name}>
          {annularRegions(pos, baselineSeats.map(st=>blocDisplayOrder(base).indexOf(st.bloc)),rad).map(w=>{
            const id=blocDisplayOrder(base)[w.band], color=base.blocs.find(b=>b.id===id)?.color ?? 'var(--muted)';
            return <g key={w.band}><path className="wedge" d={w.fill} fill={color} stroke="none" /></g>;
          })}
          {baselineSeats.map((st,i)=> <g key={i}><circle data-reference-seat="" data-lost={changes.lost.has(`${st.listId}:${st.idx}`) ? '' : undefined}
            cx={500+pos[i].x*400} cy={470+pos[i].y*400} r={rad*400} fill={st.color}
            stroke={changes.lost.has(`${st.listId}:${st.idx}`)?'var(--ink)':'var(--surface)'} strokeWidth={changes.lost.has(`${st.listId}:${st.idx}`)?5:2} strokeDasharray={changes.lost.has(`${st.listId}:${st.idx}`)?'4 3':undefined} />{st.innerColor && <circle cx={500+pos[i].x*400} cy={470+pos[i].y*400} r={rad*400*.64} fill={st.innerColor} />}</g>)}
          <text x={500} y={440} textAnchor="middle" fontSize={44} fill="var(--ink)">{br.seatsAllocated}</text>
        </svg>
      </div>}
      {/* the key is needed only when there is something to compare; the reference is named once, under the small chamber */}
      {hasChanges && <p className="small muted graphic-key">{L('Seat changes', 'שינויי מנדטים')} · {referenceLabel(labelReference,lang).name} <Info title={L('About these outlines','על המתארים')}>{L(`Outlined: seats gained since ${referenceLabel(labelReference,lang).name}. Dashed, in the small chamber: seats lost. Outlines compare list seat counts, not individual seats or voters moving between lists. Dashed bars show the reference; neutral ink shows the difference.`, `מתאר: מנדטים שנוספו מאז ${referenceLabel(labelReference,lang).name}. מקווקו, בכנסת הקטנה: מנדטים שאבדו. המתארים משווים את מספר המנדטים של הרשימות; אין משמעות של מנדט או בוחר שעבר בין רשימות. מתארי העמודות המקווקווים מציינים את הבסיס; דיו ניטרלי מציין שינוי.`)}</Info></p>}
      {/* the per-list seat changes are said once, in the change line under the tools strip */}
      {hover && hv && (
        <Floating onPointerEnter={hoverBridge.cancel} onPointerLeave={hoverBridge.leave} className="tip" preferAbove anchor={() => hover.anchor.getBoundingClientRect()}>
          <div className="row"><Slip {...hv} name={listLabel(hv, lang)} size="sm" /><b>{listLabel(hv, lang)}</b> <span className="muted">({hv.letters})</span></div>
          {cand ? <div><b><CandidateName candidate={cand} text={hoverCandidateName} /></b> · {L('rank', 'מקום')} {hover.seat.idx + 1}{cand.notes?.map((n, k) => <div key={k} className="muted small">{lang === 'he' ? n.he : n.en}</div>)}</div>
            : hv.rosterUnavailable || hv.rosterTruncated ? <div className="muted">{L(`Seat ${hover.seat.idx + 1} of the list; candidate names are not available for this election`, `מושב ${hover.seat.idx + 1} של הרשימה; שמות המועמדים אינם זמינים לבחירות אלה`)}</div>
            : <div className="bad">{L('Vacant — the list has too few candidates', 'מושב ריק — אין די מועמדים ברשימה')}</div>}
          {cand?.partyHe && <div className="muted small">{seatLabel(hover.seat)}</div>}
          <div className="muted small">{hover.seat.remainder ? remainderHow : L('Seat won by whole quota', 'מנדט שהושג במודד שלם')}</div>
        </Floating>
      )}
      {!compactProp && (
        <div className="legend" role="group" aria-label={L('Lists in the Knesset', 'הרשימות בכנסת')} style={{ marginTop: 6 }}>
          {seats.some(st=>st.bloc===null) && <span className="row no-bloc-legend"><span className="swatch" style={{background:'color-mix(in srgb, var(--muted) 30%, var(--surface))',border:'1px dotted var(--muted)'}} />{L('No bloc','ללא גוש')}</span>}
          {componentRows.map(({l,p,n}) => <button key={`${l.id}:${p.id}`} aria-pressed={selected === l.id} onClick={()=>setState({selectedListId:selected === l.id ? null : l.id})}><span className="component-key" style={{background:p.color ?? l.color,borderColor:l.color}} />{componentName(l,p)} <b>{n}</b></button>)}
          {legendRows.filter(({l})=>!componentRows.some(row=>row.l.id===l.id)).map(({ l, n }) => (
            <button key={l.id} aria-pressed={selected === l.id} onClick={() => setState({ selectedListId: selected === l.id ? null : l.id })}>
              <span aria-hidden="true"><Slip {...l} name={listLabel(l, lang)} size="sm" /></span>{listLabel(l, lang)} <b className="tabnum">{n}</b>
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
