import { BlocMajorities } from './Majority.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { listLabel, methodOf, seatBlocsOf, seatedOrder, shownName } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { arcLayout, bandCuts, placeLabels } from '../layout.ts';
import { download, isolate } from '../format.ts';
import { setState, useLevel, useStore } from '../store.ts';
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
      let color = (c?.partyId && l.parties?.find((p) => p.id === c.partyId)?.color) || l.color;
      if (colorBy === 'bloc') color = s.blocs.find((b) => b.id === blocs[i])?.color ?? '#8e8e93';
      if (colorBy === 'party' && parties.length > 1) color = shade(l.color, parties.indexOf(c?.partyHe ?? ''));
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

/** True on narrow screens, where list labels around the arc would be unreadably small. */
function useNarrow(query = '(max-width: 600px)') {
  const [narrow, setNarrow] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const m = matchMedia(query); const on = () => setNarrow(m.matches);
    m.addEventListener('change', on); return () => m.removeEventListener('change', on);
  }, [query]);
  return narrow;
}

export function Hemicycle({ s, r, compact: compactProp = false, title }: { s: Scenario; r: AllocationResult; compact?: boolean; title?: string }) {
  const L = useL();
  const lang = useLang();
  const { standard, expert } = useLevel();
  // layout and colouring are Expert settings: below Expert the chamber always uses the defaults
  const layout = useStore((st) => (expert ? st.layout : 'hemicycle'));
  const colorBy = useStore((st) => (expert ? st.colorBy : 'list'));
  const selected = useStore((st) => st.selectedListId);
  const svgRef = useRef<SVGSVGElement>(null);
  // on a phone the arc fills the width without labels; the legend below names the lists instead
  const narrow = useNarrow();
  const compact = compactProp || narrow;
  const [hover, setHover] = useState<{ seat: SeatInfo; x: number; y: number } | null>(null);
  const seats = useMemo(() => seatOrder(s, r, colorBy), [s, r, colorBy]);
  const total = s.rules.seats;
  const rtl = lang === 'he';
  const { seats: pos, r: rad } = useMemo(() => arcLayout(total), [total]);
  const W = 1000, H = layout === 'hemicycle' ? 560 : 0;
  const listOf = (id: string) => s.lists.find((l) => l.id === id) as SimList;
  /** a label for a seat holder: the list, or one party of a split faction */
  const holderLabel = (key: string) => {
    const [lid, pid] = key.split(':');
    const l = listOf(lid); const p = pid ? l?.parties?.find((x) => x.id === pid) : undefined;
    return p ? (lang === 'he' ? p.nameHe : p.nameEn) : listLabel(l, lang);
  };

  // group labels at the mean angle of each list's wedge
  const groups = useMemo(() => {
    const g = new Map<string, { n: number; sx: number; sy: number }>();
    seats.forEach((st, i) => {
      const p = pos[i]; if (!p) return;
      const e = g.get(st.holder) ?? { n: 0, sx: 0, sy: 0 };
      e.n++; e.sx += Math.cos(p.a); e.sy += Math.sin(p.a); g.set(st.holder, e);
    });
    return [...g.entries()].map(([id, e]) => ({ id, n: e.n, a: Math.atan2(e.sy, e.sx) }));
  }, [seats, pos]);

  // one region per run of seats in the same bloc (seats are ordered by angle); bandOf[i] is seat i's region
  const { bands, bandOf } = useMemo(() => {
    const out: { bloc: string; color: string }[] = [];
    const bandOf: number[] = [];
    if (!s.blocs.length || layout !== 'hemicycle') return { bands: out, bandOf };
    seats.forEach((st) => {
      // seats in no bloc keep an untinted region of their own, so neighbouring regions never claim them
      const bloc = st.bloc ?? '\0none';
      if (out[out.length - 1]?.bloc !== bloc) out.push({ bloc, color: st.bloc ? s.blocs.find((b) => b.id === st.bloc)?.color ?? 'transparent' : 'transparent' });
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
    const xml = new XMLSerializer().serializeToString(clone);
    if (kind === 'svg') return download('knesset.svg', xml, 'image/svg+xml');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 2000; c.height = Math.round((2000 * el.viewBox.baseVal.height) / el.viewBox.baseVal.width);
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
    const { radii, cuts } = bandCuts(placed, bandOf, bands.length, !rtl);
    const edges = [R * (0.38 - rad) - 10, ...radii.slice(1).map((x, i) => (R * (radii[i] + x)) / 2), R * (1 + rad) + 10];
    const start = rtl ? 0 : Math.PI, end = rtl ? Math.PI : 0;
    const arc = (a0: number, a1: number, rr: number) => `A ${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 ${a1 < a0 ? 1 : 0} ${pt(a1, rr)}`;
    const wedges = bands.map((b, k) => {
      const left = k === 0 ? radii.map(() => start) : cuts[k - 1];
      const right = k === bands.length - 1 ? radii.map(() => end) : cuts[k];
      let d = `M ${pt(left[0], edges[0])}`;
      radii.forEach((_, i) => { d += ` L ${pt(left[i], edges[i + 1])}`; if (i < radii.length - 1 && left[i + 1] !== left[i]) d += ` ${arc(left[i], left[i + 1], edges[i + 1])}`; });
      d += ` ${arc(left[radii.length - 1], right[radii.length - 1], edges[radii.length])}`;
      for (let i = radii.length - 1; i >= 0; i--) { d += ` L ${pt(right[i], edges[i])}`; if (i > 0 && right[i - 1] !== right[i]) d += ` ${arc(right[i], right[i - 1], edges[i])}`; }
      d += ` ${arc(right[0], left[0], edges[0])} Z`;
      return { key: `${b.bloc}-${k}`, color: b.color, d };
    });
    body = (
      <svg ref={svgRef} viewBox={compact ? `40 40 920 450` : `-270 0 1540 ${H}`} role="img" aria-label={`${title ?? L('Knesset seat diagram', 'תרשים מושבי הכנסת')}: ${summary}`}>
        {wedges.map((w) => <path key={w.key} className="wedge" d={w.d} fill={w.color} stroke={w.color} />)}
        {seats.map((st, i) => {
          const p = pos[rtl ? pos.length - 1 - i : i]; if (!p) return null;
          const dim = selected && selected !== st.listId;
          return (
            <circle key={i} className={`seat ${dim ? 'dim' : ''}`} cx={cx + p.x * R} cy={cy + p.y * R} r={rad * R} fill={st.color}
              stroke="var(--surface)" strokeWidth={2}
              onMouseEnter={(e) => onSeat(st, e)} onMouseLeave={() => setHover(null)} onFocus={(e) => onSeat(st, e)} onBlur={() => setHover(null)}
              onClick={() => setState({ selectedListId: selected === st.listId ? null : st.listId })} />
          );
        })}
        {!compact && placeLabels(groups.map((g) => {
          const a = rtl ? Math.PI - g.a : g.a;
          return { id: g.id, n: g.n, a, text: `${holderLabel(g.id)} ${g.n}` };
        }), cx, cy, R + 14, 1.25, [-270, 0, 1270, H]).map((p) => (
          <text key={p.id} x={p.x} y={p.y} textAnchor={p.anchor} dominantBaseline="middle" fontSize={p.n < 4 ? 25 : 29} fill="var(--ink)" fontWeight={600}>{isolate(p.text)}</text>
        ))}
        <text x={cx} y={cy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill="var(--ink)">{r.seatsAllocated}</text>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="var(--ink-2)">{isolate(L(`seats · majority ${Math.floor(total / 2) + 1}`, `מנדטים · רוב ${Math.floor(total / 2) + 1}`))}</text>
      </svg>
    );
  } else {
    // blocks: one row of 10-seat columns per list
    const lists = s.lists.map((l) => ({ l, n: seats.filter((x) => x.listId === l.id).length })).filter((x) => x.n > 0);
    const cell = 16, gap = 3, perRow = 20;
    let y = 10;
    const rows = lists.map(({ l, n }) => {
      const h = Math.ceil(n / perRow) * (cell + gap);
      const row = { l, n, y }; y += h + 10; return row;
    });
    body = (
      <svg ref={svgRef} viewBox={`0 0 ${W} ${y + 10}`} role="img" aria-label={`${title ?? L('Seats by list', 'מנדטים לפי רשימה')}: ${summary}`}>
        {rows.map(({ l, n, y: y0 }) => (
          <g key={l.id}>
            <text x={rtl ? W - 10 : 10} y={y0 + 12} textAnchor={rtl ? 'end' : 'start'} fontSize={14} fill="var(--ink)" fontWeight={600}>{isolate(`${listLabel(l, lang)} ${n}`)}</text>
            {seats.filter((x) => x.listId === l.id).map((st, k) => {
              const col = k % perRow, row = Math.floor(k / perRow);
              const x0 = 260 + col * (cell + gap);
              const x = rtl ? W - x0 - cell : x0;
              return <rect key={k} className="seat" x={x} y={y0 + row * (cell + gap)} width={cell} height={cell} rx={3} fill={st.color} stroke="var(--surface)" strokeWidth={2}
                onMouseEnter={(e) => onSeat(st, e)} onMouseLeave={() => setHover(null)} onClick={() => setState({ selectedListId: selected === l.id ? null : l.id })} />;
            })}
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div className="chamber">
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
      {(!compactProp && narrow) && (
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
