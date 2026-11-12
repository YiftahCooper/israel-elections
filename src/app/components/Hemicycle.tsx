import {PartyDot,PartyKey,PARTY_SHARE,type JointLook}from'./PartyDot.tsx';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { Slip } from './ui.tsx';
import { syntheticIconSvg } from '../syntheticIcon.ts';
import { factLog } from '../../model/actionClassification.ts';
import { CandidateName } from './CandidateName.tsx';
import { MkSeatLink, usePersonOf } from './MkHistory.tsx';
import { SeatHoldersNote } from './TermTimeline.tsx';
import { loadTermRuntime } from '../../history/termTimeline.ts';
import memberNames from '../../data/candidate-display-names.json';
import { Floating } from '../floating.tsx';
import { useHoverIntent } from '../hoverIntent.ts';
import { blocDisplayOrder } from '../blocOrder.ts';
import { changedSeatKeys } from '../graphics.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { useDisclosure } from './Feature.tsx';
import { BlocMajorities } from './Majority.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, listLabel, methodOf, seatBlocsOf, seatedOrder, seatCandidate, candidateName, referenceLabel, comparisonGroups } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { arcLayout, annularRegions } from '../layout.ts';
import { arcSeatSlots, trayBlocRegions, trayCell, trayShape, TRAY } from '../blocLine.ts';
import { download, isolate, seatDeltaText } from '../format.ts';
import { electionLabel } from '../electionLabel.ts';
import { setSetting, setState, useSetting, useStore } from '../store.ts';
import { Info, Seg } from './ui.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';

export interface SeatInfo { listId: string; idx: number; color: string; innerColor?: string; partyColor?: string; partyId?: string; remainder: boolean; bloc: string | null; holder: string }

/** Seats in chamber order. With a bloc grouping, seats are grouped by bloc (decision 0087): each seat counts
 *  for its member's party bloc when it differs from the list's. Within a bloc, lists keep their order. `look`: how a
 *  seat of a joint list counted by party shows its party (`innerColor` for both colours, `color` for the party's only). */
export function seatOrder(s: Scenario, r: AllocationResult, colorBy: 'list' | 'bloc' | 'party', look: JointLook = 'both'): SeatInfo[] {
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
      if (colorBy === 'party') color = (c?.partyId && l.parties?.some(p => p.id === c.partyId) && partyDisplayColor(l, c.partyId)) || (parties.length > 1 ? shade(l.color, parties.indexOf(c?.partyHe ?? '')) : l.color);
      const holder = split.has(l.id) && c?.partyId && l.parties?.some((p) => p.id === c.partyId) ? `${l.id}:${c.partyId}` : l.id;
      const party = l.parties?.find(p => p.id === c?.partyId);
      const partyColor = split.has(l.id) && (l.parties?.length ?? 0) > 1 && party ? partyDisplayColor(l, party.id) : undefined;
      const innerColor = look === 'both' ? partyColor : undefined;
      if (innerColor) color = l.color;
      else if (look === 'party' && partyColor && colorBy === 'list') color = partyColor;
      out.push({ innerColor, partyColor: look === 'list' ? undefined : partyColor, partyId: party?.id, listId: l.id, idx: i, color, remainder: i >= lr.initialSeats, bloc: blocs[i], holder, k: k++ });
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

/** One row of the chamber's key. A joint list counted by party has one row per party, and one more for its seats whose
 *  member has no recorded party (`p` null), so every seat drawn is in the key (audit c-screens-overview-02). */
export interface ChamberKeyRow { key: string; l: SimList; p: NonNullable<SimList['parties']>[number] | null; byParty: boolean; n: number; colors: string[] }
/** The key in the order the seats are drawn: each list where its first seat is, a list counted by party expanded into
 *  its party rows in place (audit c-design-principles-06), with the colours its seats actually carry. */
export function chamberKeyRows(s: Scenario, seats: SeatInfo[], look: JointLook): ChamberKeyRow[] {
  const split = new Set(look === 'list' ? [] : s.factionSplits ?? []);
  const rows = new Map<string, ChamberKeyRow>();
  for (const st of seats) {
    const byParty = split.has(st.listId), key = byParty ? `${st.listId}:${st.partyId ?? ''}` : st.listId;
    let row = rows.get(key);
    if (!row) {
      const l = s.lists.find(x => x.id === st.listId)!;
      rows.set(key, row = { key, l, p: byParty ? l.parties?.find(p => p.id === st.partyId) ?? null : null, byParty, n: 0, colors: [] });
    }
    row.n++;
    if (!row.colors.includes(st.color)) row.colors.push(st.color);
  }
  return [...rows.values()];
}

/** `paired`: drawn beside its reference chamber (Compare), so the small reference chamber and change list are not repeated. */
export function Hemicycle({ s, r, compact: compactProp = false, title, reference, paired = false }: { s: Scenario; r: AllocationResult; compact?: boolean; title?: string; reference?: Scenario; paired?: boolean }) {
  const L = useL();
  const { shown: standard, control: standardControl } = useDisclosure('chamberLegend');
  const { shown: expert, control: expertControl } = useDisclosure('chamberOptions');
  const lang = useLang();

  // personal settings (Settings → Seat chart); the inline controls below are the same values, at their point of use.
  // A hidden setting keeps working, so they apply at every level.
  const layout = useSetting('chamberLayout');
  const colorBy = useSetting('seatColour');
  const jointLook = useSetting('jointListSeats');
  const blocShading = useSetting('blocShading'), referenceChamber = useSetting('referenceChamber'), chamberKey = useSetting('chamberKey');
  const dimOthers = useSetting('dimUnselected'), hoverPopups = useSetting('hoverPopups');
  const previewing = useStore(st => st.preview) === s;
  const committed = useStore(st => st.scenario);
  const evidenceScenario = previewing && committed ? committed : s;
  const evidenceResult = previewing && committed ? allocationOf(committed) : r;
  const selected = useStore((st) => st.selectedListId);
  const elections = useStore((st) => st.elections);
  const svgRef = useRef<SVGSVGElement>(null);
  // on a phone the arc fills the width without labels; the legend below names the lists instead

  const [hover, setHover] = useState<{ seat: SeatInfo; anchor: Element } | null>(null);
  const seats = useMemo(() => seatOrder(s, r, colorBy, jointLook), [s, r, colorBy, jointLook]);
  const { base, result: br, labelReference } = useGraphicReference(s, reference);
  const changes = useMemo(() => changedSeatKeys(s, r, base, br), [s, r, base, br]);
  // Supplemental evidence follows completed edits, keeping the first drag from
  // mounting a second chamber and moving the legend under the pointer.
  const evidenceChanges = useMemo(() => changedSeatKeys(evidenceScenario, evidenceResult, base, br), [evidenceScenario, evidenceResult, base, br]);
  const hasChanges = !paired && (evidenceChanges.gained.size > 0 || evidenceChanges.lost.size > 0);
  const baselineSeats = useMemo(() => seatOrder(base, br, colorBy, jointLook), [base, br, colorBy, jointLook]);
  const baselineBands = useMemo(() => baselineSeats.map(st => blocDisplayOrder(base).indexOf(st.bloc)), [baselineSeats, base]);
  const componentDescription = L('Constituent display colours distinguish every party, including the lead. Missing or similar colours are adjusted for display, without changing researched colours.', 'צבעי התצוגה מבחינים בין כל המפלגות, כולל המפלגה המובילה. צבעים חסרים או דומים מותאמים לתצוגה בלי לשנות את הצבעים שנחקרו.');
  const total = s.rules.seats;
  // Geometry is physically left-to-right in both languages, like the 61 marker.
  const { seats: pos, r: rad } = useMemo(() => arcLayout(total), [total]);
  // Include the floor beneath baseline seats and the full outer border in the drawing bounds.
  const W = 1000, H = Math.max(490, 470 + (rad + 0.015) * 400 + 2);
  const listOf = (id: string) => s.lists.find((l) => l.id === id) as SimList;
  // one region per run of seats in the same bloc (seats are ordered by angle); bandOf[i] is seat i's region
  const { bands, bandOf } = useMemo(() => {
    const out: { bloc: string; color: string }[] = [];
    const bandOf: number[] = [];
    seats.forEach((st) => {
      // seats in no bloc keep an untinted region of their own, so neighbouring regions never claim them
      const bloc = st.bloc ?? '__none';
      if (out[out.length - 1]?.bloc !== bloc) out.push({ bloc, color: st.bloc ? s.blocs.find((b) => b.id === st.bloc)?.color ?? 'transparent' : 'var(--muted)' });
      bandOf.push(out.length - 1);
    });
    return { bands: out, bandOf };
  }, [seats, s.blocs]);
  // where each seat sits: blocs are placed so the line between them can run as straight as the seats allow
  const placed = useMemo(() => { const slot = arcSeatSlots(pos, bandOf, rad); return slot.map((k) => pos[k]); }, [pos, bandOf, rad]);
  const baselinePlaced = useMemo(() => arcSeatSlots(pos, baselineBands, rad).map((k) => pos[k]), [pos, baselineBands, rad]);

  const hoverBridge = useHoverIntent(() => setHover(null), !!hover);
  /** click and the keyboard open the seat card at once; a resting mouse opens it after the shared hover delay */
  const onSeat = (st: SeatInfo, evt: React.MouseEvent | React.KeyboardEvent) => {
    hoverBridge.keep();
    void loadTermRuntime();
    setHover({ seat: st, anchor: evt.currentTarget });
  };
  // The keyboard reaches the seats as one tab stop (the seat last focused); arrow keys move between seats in the order
  // they are drawn, left to right, also in Hebrew, since the chamber is never mirrored. Enter or Space opens the seat
  // card, Escape closes it and focus stays on (or comes back to) the seat.
  const [stop, setStop] = useState(0);
  // the focus ring is drawn only for a seat the keyboard reached (a click shows none), around the seat: a shape
  const [ring, setRing] = useState<number | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const tray = trayShape(seats.length);
  const seatAt = (i: number) => svgRef.current?.querySelector<SVGGElement>(`[data-seat-pos="${i}"]`) ?? null;
  const inCard = (n: EventTarget | null) => !!n && !!card.current?.contains(n as Node);
  const onSeatKey = (e: React.KeyboardEvent<SVGGElement>, i: number) => {
    const across = layout === 'blocks' ? tray.rows : 1;
    const to = e.key === 'ArrowRight' ? i + across : e.key === 'ArrowLeft' ? i - across : e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1
      : e.key === 'Home' ? 0 : e.key === 'End' ? seats.length - 1 : null;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hover?.seat === seats[i]) setHover(null); else onSeat(seats[i], e);
    } else if (to !== null) {
      e.preventDefault();
      const j = Math.max(0, Math.min(seats.length - 1, to)), el = seatAt(j);
      el?.focus();
      // an open card follows the focus, so the seats can be read one after another
      if (el && hover) setHover({ seat: seats[j], anchor: el });
    }
  };
  // leaving the seats and the card for anything else closes the card; a sheet opened from the card (an MK's history)
  // keeps it, so closing the sheet gives focus back to the card's button
  const onSeatsBlur = (e: React.FocusEvent) => { const to = e.relatedTarget as Element | null; if (hover && !inCard(to) && !to?.closest?.('[data-seat-pos], dialog')) setHover(null); };
  useEffect(() => {
    if (!hover) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || (e.target as Element).closest?.('dialog')) return;
      e.stopImmediatePropagation();
      const back = inCard(document.activeElement);
      setHover(null);
      if (back) seatAt(stop)?.focus();
    };
    const onDoc = (e: PointerEvent) => { const t = e.target as Element; if (!inCard(t) && !t.closest?.('[data-seat-pos], dialog')) setHover(null); };
    document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onDoc);
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onDoc); };
  }, [hover, stop]); // eslint-disable-line react-hooks/exhaustive-deps
  // the seat card's "Who sat here" starts loading as the mouse arrives, so the card opens at its full size: a card
  // that grew after opening could slide under the resting pointer and close itself
  const onSeatHover = (st: SeatInfo, evt: React.MouseEvent) => { const anchor = evt.currentTarget; void loadTermRuntime(); hoverBridge.enter(() => setHover({ seat: st, anchor })); };

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
      for (const prop of ['fill','stroke','stroke-width','stroke-dasharray','fill-opacity','stroke-opacity','vector-effect','stroke-linejoin','stroke-linecap'])
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
        for (const prop of ['fill','stroke','stroke-width','stroke-dasharray','opacity','fill-opacity','stroke-opacity','vector-effect','stroke-linejoin','stroke-linecap']) node.setAttribute(prop,style.getPropertyValue(prop));
        if (node instanceof SVGElement && node.classList.contains('wedge')) node.removeAttribute('style');
      });
      inset.setAttribute('x',String(rtlText ? vb.x + vb.width - 416 : vb.x+16)); inset.setAttribute('y',String(vb.y+vb.height+25));
      inset.setAttribute('width','400'); inset.setAttribute('height','230');
      clone.appendChild(svgText(colStart(0), vb.y+vb.height+16, 14, referenceLabel(labelReference,lang).name));
      clone.appendChild(inset);
    }
    // the legend in chamber order, each list with its seat colour(s), and old → new only where the seats changed
    const groupsNow = comparisonGroups(s,r,base,br);
    const rowsY = vb.y+vb.height+extra+20;
    const exportRows = keyRows.map(({l,p,byParty,n,colors})=>({l,n,byParty,colors:p && jointLook==='both' ? [l.color] : colors,label:keyName(l,p,byParty),
      inner:p && jointLook==='both' ? partyDisplayColor(l,p.id) : undefined as string | undefined}));
    exportRows.forEach(({l,n,byParty,colors,label,inner},i) => {
      const x = colStart(i % 2), y = rowsY + Math.floor(i/2)*32, dir = rtlText ? -1 : 1;
      colors.forEach((c,k)=>{
        const dot = document.createElementNS(NS,'circle');
        dot.setAttribute('cx',String(x+dir*(7+k*16))); dot.setAttribute('cy',String(y-5)); dot.setAttribute('r','7'); dot.setAttribute('fill',c); clone.appendChild(dot);
        if(inner) { const fill=dot.cloneNode() as SVGCircleElement;fill.setAttribute('r',String(7*PARTY_SHARE));fill.setAttribute('fill',inner);clone.appendChild(fill); }
      });
      const artwork = syntheticIconSvg(l);
      if (artwork && !byParty) {
        const tile = new DOMParser().parseFromString(artwork, 'image/svg+xml').documentElement;
        tile.innerHTML = tile.innerHTML.replaceAll('id="tile"', `id="tile-${i}"`).replaceAll('url(#tile)', `url(#tile-${i})`);
        tile.setAttribute('x', String(rtlText ? x - 44 : x)); tile.setAttribute('y', String(y - 19));
        tile.setAttribute('width', '44'); tile.setAttribute('height', '24'); clone.appendChild(tile);
      }
      const g = groupsNow.find(g=>g.bIds.includes(l.id));
      const delta = !byParty && g?.bIds.length===1 ? g.seatsB-g.seatsA : 0;
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
    clone.appendChild(svgText(colStart(0), captionY, 13, `${entry ? electionLabel(entry, elections, lang) : ''}${entry ? ' · ' : ''}${factLog(s).length ? s.name || L('Scenario', 'תרחיש') : L('Official result', 'התוצאה הרשמית')}`));
    const scheme = s.blocSchemes?.find(g => g.id === s.blocSchemeId);
    const appBlocs = s.blocs.filter(b => b.appDefined);
    const provenance = scheme?.appDefined ? groupingName(scheme, lang) : appBlocs.map(b => groupingName(b, lang)).join(' · ');
    if (provenance) {
      clone.appendChild(svgText(colStart(0), captionY + 22, 13, provenance));
      const description = document.createElementNS(NS, 'desc');
      description.textContent = appGroupingExplanation(lang); clone.appendChild(description);
    }
    clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${captionY - vb.y + (provenance ? 38 : 14)}`);
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
  // the member in this seat and their place on the full list (a candidate who was not seated keeps their place)
  const { candidate: cand, place: candPlace } = hover && hv ? seatCandidate(hv, hover.seat.idx) : { candidate: null, place: null };

  // Only certain official identities use the Knesset's given-name-first display; user edits keep their text.
  function memberName(c: NonNullable<typeof cand>) {
    const unchanged = originalDataset?.lists.some(l => l.candidates.some(x => x.id === c.id && x.nameHe === c.nameHe));
    const sourced = c.bio?.knesset && (!c.bio.probable || c.bio.memberConfirmed) && !c.displayNameHe && unchanged
      ? (memberNames as Record<string, string>)[c.bio.knesset.split('/').at(-1)!] : undefined;
    return lang === 'he' && sourced ? sourced : candidateName(c, lang);
  }
  const hoverCandidateName = cand ? memberName(cand) : '';

  const seatLabel = (st: SeatInfo) => {
    const l = listOf(st.listId), party = l.parties?.find(p => p.id === st.partyId);
    return `${party && (s.factionSplits ?? []).includes(l.id) ? (lang === 'he' ? party.nameHe : party.nameEn) + ' · ' : ''}${listLabel(l, lang)}`;
  };
  // each seat's name for a screen reader: the list, the seat's number in it, and the member where the card names one
  const seatNames = useMemo(() => seats.map(st => {
    const l = listOf(st.listId), c = seatedOrder(l)[st.idx];
    const name = c ? memberName(c) : l.rosterUnavailable || l.rosterTruncated ? '' : L('vacant', 'ריק');
    return [seatLabel(st), `${L('seat', 'מושב')} ${st.idx + 1}`, name].filter(Boolean).join(' · ');
  }), [seats, lang, originalDataset]); // eslint-disable-line react-hooks/exhaustive-deps
  /** a seat as one keyboard control: the tab stop moves with the arrow keys (see onSeatKey) */
  const seatButton = (i: number) => ({
    'data-seat-pos': i, className: 'seat-btn', role: 'button', tabIndex: i === Math.min(stop, seats.length - 1) ? 0 : -1,
    'aria-label': seatNames[i], 'aria-haspopup': 'dialog' as const, 'aria-expanded': hover?.seat === seats[i],
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => onSeatKey(e, i), onFocus: (e: React.FocusEvent<SVGGElement>) => { setStop(i); setRing(e.currentTarget.matches(':focus-visible') ? i : null); },
    onBlur: (e: React.FocusEvent) => { setRing(null); onSeatsBlur(e); },
  });
  let body: React.ReactNode;
  if (layout === 'hemicycle') {
    const cx = W / 2, cy = 470, R = 400;
    const wedges = annularRegions(placed, bandOf, rad, cx, cy, R);
    body = (
      <svg ref={svgRef} viewBox={`40 30 920 ${H - 30}`} role="group" aria-label={`${title ?? L('Knesset seat diagram', 'תרשים מושבי הכנסת')}: ${summary}`}>
        {seats.some(st => st.innerColor) && <desc>{componentDescription}</desc>}
        {blocShading && wedges.map(w => <g key={w.band}>
          {/* Shared edges are covered by an opaque border, avoiding antialiasing seams. */}
          <path data-bloc-region={bands[w.band].bloc} className={`wedge solid ${bands[w.band].bloc === '__none' ? 'unassigned' : ''}`} d={w.fill}
            style={{ ['--bc' as string]: bands[w.band].color }} />
        </g>)}
        {seats.map((st, i) => {
          const p = placed[i]; if (!p) return null;
          const dim = dimOthers && selected && selected !== st.listId;
          return (
            <g key={i} {...seatButton(i)}><circle className={`seat ${dim ? 'dim' : ''}`} cx={cx + p.x * R} cy={cy + p.y * R} r={rad * R} fill={st.color}
              data-seat="" data-bloc={st.bloc ?? "__none"} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? "var(--ink)" : "var(--ink-2)"} strokeWidth={changes.gained.has(`${st.listId}:${st.idx}`) ? 4 : 1}
              onMouseEnter={(e) => { if (hoverPopups) onSeatHover(st, e); }} onMouseLeave={hoverBridge.leave}
              onClick={(e) => { if (!hoverPopups) onSeat(st, e); setState({ selectedListId: selected === st.listId ? null : st.listId }); }}><title>{seatLabel(st)}</title></circle>
            {st.innerColor && <PartyDot partyId={st.partyId} x={cx+p.x*R} y={cy+p.y*R} r={rad*R} color={st.innerColor} className={dim?'seat dim':'seat'}/>}
            </g>
          );
        })}
        {ring !== null && placed[ring] && <circle className="seat-ring" cx={cx + placed[ring].x * R} cy={cy + placed[ring].y * R} r={rad * R + 4} />}
        <text className="centre-total" x={cx} y={cy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill="var(--ink)">{r.seatsAllocated}</text>
        <text className="centre-sub" x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="var(--ink-2)">{isolate(L(`seats · majority ${Math.floor(total / 2) + 1}`, `מנדטים · רוב ${Math.floor(total / 2) + 1}`))}</text>
      </svg>
    );
  } else {
    // A 20 × 6 tray for every Knesset, filled column by column so each bloc is a band read left to right, as in the half
    // circle; topology and number of lists never change the geometry. A chamber of more than 120 seats (Rules) gets
    // a larger tray, so every seat is drawn (and exported).
    const regions = trayBlocRegions(bandOf, tray.rows);
    body = <svg ref={svgRef} viewBox={`0 0 ${tray.width} ${tray.height}`} role="group" aria-label={summary}>
      {seats.some(st => st.innerColor) && <desc>{componentDescription}</desc>}
      {/* one shape per bloc, meeting along the bloc line: a straight edge with at most one rounded step */}
      {blocShading && regions.regions.map(w => <path key={w.band} data-bloc-region={bands[w.band].bloc} aria-hidden="true" pointerEvents="none"
        className={`wedge solid ${bands[w.band].bloc === '__none' ? 'unassigned' : ''}`} d={w.fill} style={{ ['--bc' as string]: bands[w.band].color }} />)}
      {seats.map((st, i) => {
        const [x, y] = trayCell(i, tray.rows), c = TRAY.cell;
        const dim = dimOthers && selected && selected !== st.listId;
        return <g key={i} {...seatButton(i)}>
          <rect data-seat="" data-bloc={st.bloc ?? "__none"} className={`seat ${dim ? 'dim' : ''}`} x={x} y={y} width={c} height={c} rx={4} fill={st.color} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? 'var(--ink)' : 'var(--ink-2)'} strokeWidth={changes.gained.has(`${st.listId}:${st.idx}`)?4:1}
            onMouseEnter={e => { if (hoverPopups) onSeatHover(st,e); }} onMouseLeave={hoverBridge.leave} onClick={e => { if (!hoverPopups) onSeat(st,e); setState({ selectedListId: selected === st.listId ? null : st.listId }); }}><title>{seatLabel(st)}</title></rect>
          {st.innerColor && <PartyDot partyId={st.partyId} x={x+c/2} y={y+c/2} r={c/2} square={{rx:4}} color={st.innerColor} className={dim ? 'seat dim' : 'seat'}/>}
        </g>;
      })}
      {ring !== null && ring < seats.length && (([x, y]) => <rect className="seat-ring" x={x - 4} y={y - 4} width={TRAY.cell + 8} height={TRAY.cell + 8} rx={7} />)(trayCell(ring, tray.rows))}
    </svg>;
  }

  // lists in the order their seats are drawn (blocs left to right, No bloc between their halves), each with the colours
  // its seats actually carry in the chosen colour mode
  const keyRows = chamberKeyRows(s, seats, jointLook);
  // a party row names its party and its list; seats whose member has no recorded party keep the list's name
  const keyName = (l: SimList, p: ChamberKeyRow['p'], byParty: boolean) => {
    if (!byParty) return listLabel(l, lang);
    const name = p ? (lang === 'he' ? p.nameHe : p.nameEn) : L('Party not recorded', 'מפלגה לא מתועדת');
    return name === listLabel(l, lang) ? name : `${name} · ${listLabel(l, lang)}`;
  };
  const head = !compactProp && (expertControl || standardControl || expert);
  return (
    <div className="chamber">
      {head && <div className="chamber-tools">
        {expert && <>
          <Seg label={L('Chamber layout', 'פריסה')} value={layout} onChange={(v) => setSetting('chamberLayout', v)} options={[{ v: 'hemicycle', label: L('Arc', 'קשת') }, { v: 'blocks', label: L('Blocks', 'גושים') }]} />
          <ChoicePicker label={L('Colour seats by', 'צביעת מושבים לפי')} value={colorBy} options={(['list', 'bloc', 'party'] as const).map(value => ({ value, label: value === 'list' ? L('List', 'רשימה') : value === 'bloc' ? L('Bloc', 'גוש') : L('Party', 'מפלגה'), preview: <ResultPreview s={s} blocs={value === 'bloc'} party={value === 'party'} /> }))} onChange={value => setSetting('seatColour', value as typeof colorBy)} />
        </>}
        {expertControl}{standardControl}
      </div>}
      {/* on the board the bloc bar directly below already carries this line; Compare's chambers stand alone */}
      {compactProp && <BlocMajorities s={s} r={r} />}
      {body}
      {/* the card comes next in the page, so Tab goes from a seat into its card (its links) */}
      {/* the per-list seat changes are said once, in the change line under the tools strip */}
      {hover && hv && (
        <Floating onPointerEnter={hoverBridge.keep} onPointerLeave={hoverBridge.leave} className="tip" preferAbove anchor={() => hover.anchor.getBoundingClientRect()}
          role="dialog" label={seatNames[seats.indexOf(hover.seat)] ?? seatLabel(hover.seat)}><div ref={card} onBlur={onSeatsBlur}>
          <div className="row"><Slip {...hv} name={listLabel(hv, lang)} size="sm" /><b>{listLabel(hv, lang)}</b> <span className="muted">({hv.letters})</span></div>
          {cand ? <div><b><CandidateName candidate={cand} text={hoverCandidateName} /></b> · {L('rank', 'מקום')} {candPlace}{cand.notes?.map((n, k) => <div key={k} className="muted small">{lang === 'he' ? n.he : n.en}</div>)}</div>
            : hv.rosterUnavailable || hv.rosterTruncated ? <div className="muted">{L(`Seat ${hover.seat.idx + 1} of the list; candidate names are not available for this election`, `מושב ${hover.seat.idx + 1} של הרשימה; שמות המועמדים אינם זמינים לבחירות אלה`)}</div>
            : <div className="bad">{L('Vacant — the list has too few candidates', 'מושב ריק — אין די מועמדים ברשימה')}</div>}
          {(hover.seat.partyId || cand?.partyHe) && <div className="muted small row">{hover.seat.partyColor && <PartyKey hover partyId={hover.seat.partyId} color={hover.seat.partyColor} ring={hover.seat.innerColor ? hv.color : undefined}/>}{seatLabel(hover.seat)}</div>}
          <div className="muted small">{hover.seat.remainder ? remainderHow : L('Seat won by whole quota', 'מנדט שהושג במודד שלם')}</div>
          <MkSeatLink candidate={cand} />
          {!factLog(s).length && <SeatHolders electionId={s.electionId} candidate={cand} />}
        </div></Floating>
      )}
      {hasChanges && referenceChamber && <div className="baseline-mini">
        <span className="small muted">{referenceLabel(labelReference,lang).name}</span>
        <svg viewBox={`40 30 920 ${H - 30}`} role="img" aria-label={referenceLabel(labelReference,lang).name}>
          {annularRegions(baselinePlaced, baselineBands,rad).map(w=>{
            const id=blocDisplayOrder(base)[w.band], color=base.blocs.find(b=>b.id===id)?.color ?? 'var(--muted)';
            return <g key={w.band}><path className={`wedge solid ${id === null ? 'unassigned' : ''}`} d={w.fill} style={{ ['--bc' as string]: color }} /></g>;
          })}
          {baselineSeats.map((st,i)=> <g key={i}><circle data-reference-seat="" data-lost={changes.lost.has(`${st.listId}:${st.idx}`) ? '' : undefined}
            cx={500+baselinePlaced[i].x*400} cy={470+baselinePlaced[i].y*400} r={rad*400} fill={st.color}
            stroke={changes.lost.has(`${st.listId}:${st.idx}`)?'var(--ink)':'var(--ink-2)'} strokeWidth={changes.lost.has(`${st.listId}:${st.idx}`)?5:1} strokeDasharray={changes.lost.has(`${st.listId}:${st.idx}`)?'4 3':undefined} />{st.innerColor && <PartyDot x={500+baselinePlaced[i].x*400} y={470+baselinePlaced[i].y*400} r={rad*400} color={st.innerColor}/>}</g>)}
          <text x={500} y={440} textAnchor="middle" fontSize={44} fill="var(--ink)">{br.seatsAllocated}</text>
        </svg>
      </div>}
      {/* the key is needed only when there is something to compare; the reference is named once, under the small chamber */}
      {hasChanges && <p className="small muted graphic-key">{L('Seat changes', 'שינויי מנדטים')} · {referenceLabel(labelReference,lang).name} <Info title={L('About these outlines','על המתארים')}>{L(`Outlined: seats gained compared with ${referenceLabel(labelReference,lang).name}. Dashed, in the small chamber: seats lost. Outlines compare list seat counts, not individual seats or voters moving between lists. Dashed bars show the reference; neutral ink shows the difference.`, `מתאר: מנדטים שנוספו לעומת ${referenceLabel(labelReference,lang).name}. מקווקו, בכנסת הקטנה: מנדטים שאבדו. המתארים משווים את מספר המנדטים של הרשימות; אין משמעות של מנדט או בוחר שעבר בין רשימות. מתארי העמודות המקווקווים מציינים את הבסיס; דיו ניטרלי מציין שינוי.`)}</Info></p>}
      {!compactProp && (
        <div className="legend" data-key-off={chamberKey ? undefined : ''} role="group" aria-label={L('Lists in the Knesset', 'הרשימות בכנסת')} style={{ marginTop: 6 }}>
          {seats.some(st=>st.bloc===null) && <span className="row no-bloc-legend"><span className="swatch bloc-swatch unassigned" style={{['--bc' as string]:'var(--muted)'}} />{L('No bloc','ללא גוש')}</span>}
          {keyRows.map(({ key, l, p, byParty, n, colors }) => {
            const pick = () => setState({ selectedListId: selected === l.id ? null : l.id });
            return byParty
              ? <button key={key} aria-pressed={selected === l.id} onClick={pick}>{p ? <PartyKey partyId={p.id} color={partyDisplayColor(l, p.id)} ring={jointLook === 'both' ? l.color : undefined} /> : <PartyKey color={l.color} />}{keyName(l, p, true)} <b className="tabnum"><bdi dir="ltr">{n}</bdi></b></button>
              : <ListKeyItem key={key} list={l} seats={n} seatColors={colors} pressed={selected === l.id} onPick={pick} />;
          })}
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

/** Who else held this seat during the term (owner decision F1, 11 Nov 2026): the official result only. */
/** One list in a chamber's key: its slip, name and seats. Shared by this chamber and the term chamber on After the
 *  election; without `onPick` it is a plain label. */
export function ListKeyItem({ list, seats, seatColors, pressed, onPick }: { list: Parameters<typeof Slip>[0] & Parameters<typeof listLabel>[0]; seats: number; seatColors?: string[]; pressed?: boolean; onPick?: () => void }) {
  const lang = useLang();
  // `seatColors`: the colours its seats carry, as the same dot the party rows use, so the whole key has one swatch
  const body = <>{seatColors?.map(c => <PartyKey key={c} color={c} />)}<span aria-hidden="true"><Slip {...list} name={listLabel(list, lang)} size="sm" /></span>{listLabel(list, lang)} <b className="tabnum"><bdi dir="ltr">{seats}</bdi></b></>;
  return onPick ? <button aria-pressed={pressed} onClick={onPick}>{body}</button> : <span className="legend-item">{body}</span>;
}

function SeatHolders({ electionId, candidate }: { electionId: string; candidate: { id: string; nameHe: string } | null }) {
  return <SeatHoldersNote electionId={electionId} personId={usePersonOf(candidate)} />;
}
