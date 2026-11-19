import {PartyDot,PartyKey,PARTY_SHARE,type JointLook}from'./PartyDot.tsx';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { Slip, SlipName } from './ui.tsx';
import './chamber-key.css';
import { syntheticIconSvg } from '../syntheticIcon.ts';
import { factLog } from '../../model/actionClassification.ts';
import { CandidateName } from './CandidateName.tsx';
import { MkSeatLink, usePersonOf } from './MkHistory.tsx';
import { SeatHoldersNote } from './TermTimeline.tsx';
import { loadTermRuntime } from '../../history/termTimeline.ts';
import { Floating } from '../floating.tsx';
import { useHoverIntent } from '../hoverIntent.ts';
import { blocDisplayOrder } from '../blocOrder.ts';
import { changedSeatKeys } from '../graphics.ts';
import { useGraphicReference } from '../useGraphicReference.ts';
import { useDisclosure } from './Feature.tsx';
import { BlocMajorities } from './Majority.tsx';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { LangLabel, nameProps } from './LangLabel.tsx';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, listLabel, methodOf, seatBlocsOf, seatedOrder, seatCandidate, candidateName, memberNameGivenFirst, referenceLabel, comparisonGroups, groupingLabel, majorityText, seeksMajority } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { untitledName } from '../scenarioDocument.ts';
import { arcLayout, annularRegions } from '../layout.ts';
import { arcSeatSlots, frontRowFirst, trayBlocRegions, trayCell, trayShape, TRAY } from '../blocLine.ts';
import { download, isolate, seatDeltaText } from '../format.ts';
import { electionLabel } from '../electionLabel.ts';
import { setSetting, setState, useSetting, useStore } from '../store.ts';
import { Info, Seg } from './ui.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
import { FindMk, foundSeat, type MkEntry } from './FindMk.tsx';
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

/** The group whose places a seat shares: its list (one party of it, when a joint list is counted by party) in its bloc. */
export const seatGroup = (st: SeatInfo) => `${st.holder}|${st.bloc ?? ''}`;

/** `text` cut to at most `max` characters at a word boundary, with an ellipsis. */
export function clipWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1), space = cut.lastIndexOf(' ');
  return (space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s·,(–-]+$/u, '') + '…';
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

/** A ballot slip drawn into an exported picture: the list's letters, its logo, or its scenario artwork. */
export interface ExportMark { letters: string; color: string; logo?: SimList['logo']; synthetic?: string }
const SVG_NS = 'http://www.w3.org/2000/svg';
const asDataUrl = (file: string) => fetch(new URL(file, document.baseURI)).then(r => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
  .then(b => new Promise<string>((done, fail) => { const f = new FileReader(); f.onload = () => done(String(f.result)); f.onerror = fail; f.readAsDataURL(b); }));
/** Each mark as a 44 × 24 tile, the size of the key's slips. Logos are embedded as data, so the downloaded SVG and the
 *  PNG drawn from it stand alone; a logo that cannot be read falls back to the ballot letters. */
export async function exportMarks(marks: ExportMark[], symbol: 'logo' | 'letters'): Promise<Map<ExportMark, (id: string) => SVGSVGElement>> {
  const slipFill = getComputedStyle(document.body).getPropertyValue('--slip').trim() || '#fff';
  const files = [...new Set(marks.flatMap(m => (m.logo && !m.synthetic && !(symbol === 'letters' && m.letters) ? [m.logo.file] : [])))];
  const data = new Map(await Promise.all(files.map(f => asDataUrl(f).then(u => [f, u] as const, () => [f, ''] as const))));
  const tile = (fill: string, stroke: string) => {
    const svg = document.createElementNS(SVG_NS, 'svg'); svg.setAttribute('width', '44'); svg.setAttribute('height', '24'); svg.setAttribute('viewBox', '0 0 44 24');
    const box = document.createElementNS(SVG_NS, 'rect');
    for (const [k, v] of [['x', '0.75'], ['y', '0.75'], ['width', '42.5'], ['height', '22.5'], ['rx', '3'], ['fill', fill], ['stroke', stroke], ['stroke-width', '1.5']]) box.setAttribute(k, v);
    svg.appendChild(box); return svg;
  };
  return new Map(marks.map(m => [m, (id: string) => {
    if (m.synthetic) {
      const art = new DOMParser().parseFromString(m.synthetic, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
      art.innerHTML = art.innerHTML.replaceAll('id="tile"', `id="tile-${id}"`).replaceAll('url(#tile)', `url(#tile-${id})`);
      art.setAttribute('width', '44'); art.setAttribute('height', '24'); return art;
    }
    const url = m.logo && data.get(m.logo.file);
    if (m.logo && url) {
      const svg = tile(m.logo.background === 'dark' ? '#1d2430' : '#fff', m.color), img = document.createElementNS(SVG_NS, 'image');
      for (const [k, v] of [['x', '3'], ['y', '2.5'], ['width', '38'], ['height', '19'], ['preserveAspectRatio', 'xMidYMid meet'], ['href', url]]) img.setAttribute(k, v);
      svg.appendChild(img); return svg;
    }
    const svg = tile(slipFill, m.color), t = document.createElementNS(SVG_NS, 'text');
    for (const [k, v] of [['x', '22'], ['y', '12.5'], ['text-anchor', 'middle'], ['dominant-baseline', 'central'], ['direction', 'rtl'], ['fill', '#111'], ['font-weight', '700'], ['font-size', m.letters.length > 4 ? '9' : '12']]) t.setAttribute(k, v);
    t.textContent = m.letters; svg.appendChild(t); return svg;
  }]));
}

/** The key's entries: one per list, at its first row. A joint list counted by party is one group, headed by the
 *  list's own ballot letters or logo, with its party rows inside: the parties of a joint list had no ballot letters of
 *  their own in that election, so each sits under its list's mark (owner, 19 Nov 2026). */
export interface ChamberKeyGroup { l: SimList; byParty: boolean; n: number; rows: ChamberKeyRow[] }
export function chamberKeyGroups(rows: ChamberKeyRow[]): ChamberKeyGroup[] {
  const groups = new Map<string, ChamberKeyGroup>();
  for (const row of rows) {
    let g = groups.get(row.l.id);
    if (!g) groups.set(row.l.id, g = { l: row.l, byParty: row.byParty, n: 0, rows: [] });
    g.n += row.n; g.rows.push(row);
  }
  return [...groups.values()];
}

/** A party's own logo at this election, when the app holds one that is not its list's logo (a party that shares its
 *  list's logo would show the same picture twice). Never ballot letters: a party inside a joint list had none. */
export const ownPartyLogo = (l: SimList, p: ChamberKeyRow['p']) => (p?.logo && p.logo.file !== l.logo?.file ? p.logo : undefined);

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
  const jointLook = useSetting('jointListSeats'), symbol = useSetting('listSymbol');
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

  // `touch`: opened by a tap, so the card itself offers the list (a tap does not open the list's sheet over it)
  const [hover, setHover] = useState<{ seat: SeatInfo; anchor: Element; touch?: boolean } | null>(null);
  // the last press on a seat was a finger (review V3 F13, 19 Nov 2026: on a touch phone a tap fired the hover and the
  // click, and the click opened the list's full-screen sheet over the seat card, so no MK could be reached from a seat)
  const touchPress = useRef(false);
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
  // where each seat sits: blocs are placed so the line between them can run as straight as the seats allow; within a
  // list, its candidates fill its places front row first, each row left to right
  const placed = useMemo(() => frontRowFirst(arcSeatSlots(pos, bandOf, rad).map((k) => pos[k]), seats.map(seatGroup)), [pos, bandOf, rad, seats]);
  const baselinePlaced = useMemo(() => frontRowFirst(arcSeatSlots(pos, baselineBands, rad).map((k) => pos[k]), baselineSeats.map(seatGroup)), [pos, baselineBands, rad, baselineSeats]);

  const hoverBridge = useHoverIntent(() => setHover(null), !!hover);
  /** click and the keyboard open the seat card at once; a resting mouse opens it after the shared hover delay */
  const onSeat = (st: SeatInfo, evt: React.MouseEvent | React.KeyboardEvent, touch = false) => {
    hoverBridge.keep();
    void loadTermRuntime();
    setHover({ seat: st, anchor: evt.currentTarget, touch });
  };
  /** A seat pressed: a tap opens its card (a second tap on it closes it) and the card opens the list; a mouse click
   *  selects the list, with the card at once where Popups on hover is off. */
  const onSeatClick = (st: SeatInfo, evt: React.MouseEvent) => {
    if (touchPress.current) { if (hover?.seat === st) setHover(null); else onSeat(st, evt, true); return; }
    if (!hoverPopups) onSeat(st, evt);
    setState({ selectedListId: selected === st.listId ? null : st.listId });
  };
  const seatPointer = {
    onPointerDown: (e: React.PointerEvent) => { touchPress.current = e.pointerType === 'touch'; },
    onMouseLeave: () => { if (!touchPress.current) hoverBridge.leave(); },
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
    const down = layout === 'blocks' ? tray.cols : 1;
    const to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'ArrowDown' ? i + down : e.key === 'ArrowUp' ? i - down
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

  const exportSvg = async (kind: 'svg' | 'png') => {
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
    // the legend in chamber order, as on screen: each list with its seat colour(s), its ballot letters or logo, and
    // old → new only where the seats changed; a joint list counted by party is one framed group under its list's mark,
    // its parties inside with their own logo where the app holds one (owner, 19 Nov 2026)
    const groupsNow = comparisonGroups(s,r,base,br);
    const rowsY = vb.y+vb.height+extra+20, LINE = 32, colWidth = vb.width / 2 - 24;
    type Line = { l: SimList; dots: { c: string; inner?: string }[]; mark?: ExportMark; label: string; n: number; delta: number; head?: boolean; indent?: boolean; group?: number };
    const deltaOf = (l: SimList) => { const g = groupsNow.find(g=>g.bIds.includes(l.id)); return g?.bIds.length===1 ? g.seatsB-g.seatsA : 0; };
    const listMark = (l: SimList): ExportMark => ({ letters: l.letters, color: l.color, logo: l.logo, synthetic: syntheticIconSvg(l) ?? undefined });
    const dotsOf = (row: ChamberKeyRow) => row.p && jointLook==='both' ? [{ c: row.l.color, inner: partyDisplayColor(row.l,row.p.id) }] : row.colors.map(c => ({ c }));
    const lines: Line[][] = keyGroups.map(({ l, byParty, n, rows }, gi) => {
      if (!byParty || rows.length === 1) return [{ l, dots: dotsOf(rows[0]), mark: listMark(l), label: exportName(l, rows[0].p, byParty), n, delta: deltaOf(l) }];
      return [{ l, dots: [], mark: listMark(l), label: clipWords(listLabel(l, lang), 40), n, delta: deltaOf(l), head: true, group: gi },
        ...rows.map(row => { const own = ownPartyLogo(l, row.p);
          return { l, dots: dotsOf(row), mark: own && row.p ? { letters: '', color: partyDisplayColor(l, row.p.id), logo: own } : undefined, indent: true, group: gi, n: row.n, delta: 0,
            label: clipWords(row.p ? partyName(row.p) : L('Party not recorded', 'מפלגה לא מתועדת'), own ? 34 : 40) }; })];
    });
    // two columns, a group never split between them; the first column takes the first half of the lines
    const totalLines = lines.reduce((t, g) => t + g.length, 0);
    // a framed group keeps a small gap above and below, so neighbouring frames never touch
    const GAP = 8;
    let col = 0, lineNo = 0, y = 0;
    const colEnd = [0, 0];
    const placed: { line: Line; col: number; y: number }[] = [];
    for (const g of lines) {
      if (col === 0 && lineNo > 0 && lineNo + g.length / 2 > totalLines / 2) { col = 1; lineNo = 0; y = 0; }
      const framed = g.length > 1;
      if (framed && y > 0) y += GAP;
      g.forEach(line => { placed.push({ line, col, y }); y += LINE; lineNo++; });
      if (framed) y += GAP;
      colEnd[col] = y;
    }
    const marks = await exportMarks(placed.map(x => x.line.mark).filter((m): m is ExportMark => !!m), symbol);
    const dir = rtlText ? -1 : 1;
    // the frame of a joint list's group, under its lines
    for (const g of new Set(placed.filter(x => x.line.group !== undefined).map(x => x.line.group!))) {
      const mine = placed.filter(x => x.line.group === g), top = rowsY + mine[0].y - 25, bottom = rowsY + mine[mine.length - 1].y + 11;
      const frame = document.createElementNS(NS, 'rect'), x0 = colStart(mine[0].col) - 8 * dir;
      frame.setAttribute('x', String(rtlText ? x0 - colWidth : x0)); frame.setAttribute('y', String(top)); frame.setAttribute('width', String(colWidth)); frame.setAttribute('height', String(bottom - top));
      frame.setAttribute('rx', '8'); frame.setAttribute('fill', 'none'); frame.setAttribute('stroke', css.getPropertyValue('--rule-2').trim() || '#bbb'); frame.setAttribute('stroke-width', '1');
      clone.appendChild(frame);
    }
    placed.forEach(({ line, col, y: at }, i) => {
      const y = rowsY + at;
      let x = colStart(col) + (line.indent ? 22 * dir : 0);
      for (const { c, inner } of line.dots) {
        const dot = document.createElementNS(NS,'circle');
        dot.setAttribute('cx',String(x+dir*7)); dot.setAttribute('cy',String(y-5)); dot.setAttribute('r','7'); dot.setAttribute('fill',c); clone.appendChild(dot);
        if(inner) { const fill=dot.cloneNode() as SVGCircleElement;fill.setAttribute('r',String(7*PARTY_SHARE));fill.setAttribute('fill',inner);clone.appendChild(fill); }
        x += dir * 16;
      }
      if (line.mark) {
        const tile = marks.get(line.mark)!(`k${i}`);
        tile.setAttribute('x', String(rtlText ? x - 44 - 2 : x + 2)); tile.setAttribute('y', String(y - 17));
        clone.appendChild(tile); x += dir * 50;
      } else x += dir * 4;
      const numbers = line.delta ? `${line.n - line.delta} → ${line.n}` : String(line.n);
      const legend = svgText(x,y,16,`${line.label} \u2066${numbers}\u2069`);
      if (line.head) legend.setAttribute('font-weight', '700');
      if (line.delta) {
        const change = document.createElementNS(NS, 'tspan');
        change.textContent = ` \u2066(${seatDeltaText(line.delta)})\u2069`;
        change.setAttribute('fill', css.getPropertyValue(line.delta > 0 ? '--seat-gain' : '--seat-loss').trim());
        legend.appendChild(change);
      }
      clone.appendChild(legend);
    });
    const entry = elections.find(e=>e.id===s.electionId);
    const captionY = rowsY + Math.max(...colEnd, LINE) + 8;
    clone.appendChild(svgText(colStart(0), captionY, 13, `${entry ? electionLabel(entry, elections, lang) : ''}${entry ? ' · ' : ''}${factLog(s).length ? s.name || untitledName(lang) : L('Official result', 'התוצאה הרשמית')}`));
    // the picture leaves the app, so it names the grouping its seats are arranged (and shaded) by, and each bloc with
    // its seats, as the bloc bar does on the board (audit c-screens-overview-12)
    const scheme = s.blocSchemes?.find(g => g.id === s.blocSchemeId);
    const groupingLines = s.blocs.length ? [groupingLabel(s, lang), ...blocDisplayOrder(s).map(id => {
      const n = seats.filter(st => st.bloc === id).length, b = s.blocs.find(x => x.id === id);
      return !n && !b ? '' : `${b ? groupingName(b, lang, scheme) : L('No bloc', 'ללא גוש')}: ${b && seeksMajority(id) ? majorityText(n, total, lang).replace(/^(\d+ \/ \d+)/, '\u2066$1\u2069') : n}`;
    }).filter(Boolean)] : [];
    groupingLines.forEach((line, i) => clone.appendChild(svgText(colStart(0), captionY + 22 * (i + 1), 13, line)));
    if (scheme?.appDefined || s.blocs.some(b => b.appDefined)) {
      const description = document.createElementNS(NS, 'desc');
      description.textContent = appGroupingExplanation(lang); clone.appendChild(description);
    }
    clone.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${captionY - vb.y + 14 + 22 * groupingLines.length + (groupingLines.length ? 2 : 0)}`);
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

  // Every member reads given name first (memberNameGivenFirst: the Knesset's record, else the printed name turned round),
  // in English too when the member has no English name yet (new members of the 26th Knesset); user edits keep their text.
  function memberName(c: NonNullable<typeof cand>) {
    if (lang === 'en' && c.nameEn) return c.nameEn;
    const unchanged = originalDataset?.lists.some(l => l.candidates.some(x => x.id === c.id && x.nameHe === c.nameHe));
    return unchanged ? memberNameGivenFirst(c) : candidateName(c, lang);
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
  // Find an MK: the names each seat answers to (both languages), and its label when found
  const [findQ, setFindQ] = useState(''), [findPick, setFindPick] = useState<number | null>(null);
  const mkEntries = useMemo(() => seats.flatMap((st, i): MkEntry[] => {
    const l = listOf(st.listId), { candidate: c, place } = seatCandidate(l, st.idx);
    if (!c) return [];
    const name = memberName(c);
    return [{ seat: i, names: [candidateName(c, 'he'), candidateName(c, 'en'), name], label: L(`${name} · ${listLabel(l, lang)} #${place}`, `${name} · ${listLabel(l, lang)}, מקום ${place}`) }];
  }), [seats, lang, originalDataset]); // eslint-disable-line react-hooks/exhaustive-deps
  // the chart's members, so Find an MK can tell who entered after the first sitting (FindMk laterMembers)
  const seatedIds = useMemo(() => seats.flatMap((st) => { const c = seatedOrder(listOf(st.listId))[st.idx]; return c ? [c.id] : []; }), [seats]); // eslint-disable-line react-hooks/exhaustive-deps
  const found = foundSeat(mkEntries, findQ, findPick);
  const foundLabel = found === null ? null : mkEntries.find((e) => e.seat === found)!.label;
  /** The found seat's ring and its name over it (under it in the top row), kept inside the drawing [x0, x1]. */
  const foundMark = (x: number, y: number, half: number, top: number, x0: number, x1: number, square: boolean) => {
    if (!foundLabel) return null;
    const fs = 26, w = foundLabel.length * fs * 0.55, ly = y - half - 16 - fs < top ? y + half + 14 + fs : y - half - 16;
    const lx = Math.min(x1 - w / 2 - 8, Math.max(x0 + w / 2 + 8, x));
    return <g className="found-mark" aria-hidden="true" pointerEvents="none">
      {square ? <rect x={x - half - 6} y={y - half - 6} width={2 * half + 12} height={2 * half + 12} rx={9} /> : <circle cx={x} cy={y} r={half + 6} />}
      <text x={lx} y={ly} textAnchor="middle" fontSize={fs} direction={lang === 'he' ? 'rtl' : 'ltr'}>{foundLabel}</text>
    </g>;
  };
  /** a seat as one keyboard control: the tab stop moves with the arrow keys (see onSeatKey) */
  const seatId = useId();
  const seatButton = (i: number) => ({
    'data-seat-pos': i, className: 'seat-btn', role: 'button', tabIndex: i === Math.min(stop, seats.length - 1) ? 0 : -1,
    ...nameProps(seatNames[i], lang, `${seatId}-${i}`), 'aria-haspopup': 'dialog' as const, 'aria-expanded': hover?.seat === seats[i],
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => onSeatKey(e, i), onFocus: (e: React.FocusEvent<SVGGElement>) => { setStop(i); setRing(e.currentTarget.matches(':focus-visible') ? i : null); },
    onBlur: (e: React.FocusEvent) => { setRing(null); onSeatsBlur(e); },
  });
  let body: React.ReactNode;
  if (layout === 'hemicycle') {
    const cx = W / 2, cy = 470, R = 400;
    const wedges = annularRegions(placed, bandOf, rad, cx, cy, R);
    body = (
      <svg ref={svgRef} className={found !== null ? 'finding' : undefined} viewBox={`40 30 920 ${H - 30}`} role="group" aria-label={`${title ?? L('Knesset seat diagram', 'תרשים מושבי הכנסת')}: ${summary}`}>
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
            <g key={i} {...seatButton(i)}><circle className={`seat ${dim ? 'dim' : ''} ${i === found ? 'found' : ''}`} cx={cx + p.x * R} cy={cy + p.y * R} r={rad * R} fill={st.color}
              data-seat="" data-bloc={st.bloc ?? "__none"} data-gained={changes.gained.has(`${st.listId}:${st.idx}`) ? '' : undefined} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? "var(--ink)" : "var(--ink-2)"} strokeWidth={changes.gained.has(`${st.listId}:${st.idx}`) ? 4 : 1}
              onMouseEnter={(e) => { if (hoverPopups && !touchPress.current) onSeatHover(st, e); }} {...seatPointer}
              onClick={(e) => onSeatClick(st, e)}><title>{seatLabel(st)}</title></circle>
            {st.innerColor && <PartyDot partyId={st.partyId} x={cx+p.x*R} y={cy+p.y*R} r={rad*R} color={st.innerColor} className={dim?'seat dim':'seat'}/>}
            </g>
          );
        })}
        {ring !== null && placed[ring] && <circle className="seat-ring" cx={cx + placed[ring].x * R} cy={cy + placed[ring].y * R} r={rad * R + 4} />}
        {found !== null && placed[found] && foundMark(cx + placed[found].x * R, cy + placed[found].y * R, rad * R, 30, 40, 960, false)}
        <text className="centre-total" x={cx} y={cy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill="var(--ink)">{r.seatsAllocated}</text>
        <text className="centre-sub" x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="var(--ink-2)">{isolate(L(`seats · majority ${Math.floor(total / 2) + 1}`, `מנדטים · רוב ${Math.floor(total / 2) + 1}`))}</text>
      </svg>
    );
  } else {
    // A 20 × 6 tray for every Knesset, filled row by row, left to right, so each bloc is a horizontal stripe; topology
    // and number of lists never change the geometry. A chamber of more than 120 seats (Rules) gets
    // a larger tray, so every seat is drawn (and exported).
    const regions = trayBlocRegions(bandOf, tray.cols);
    body = <svg ref={svgRef} className={found !== null ? 'finding' : undefined} viewBox={`0 0 ${tray.width} ${tray.height}`} role="group" aria-label={summary}>
      {seats.some(st => st.innerColor) && <desc>{componentDescription}</desc>}
      {/* one shape per bloc, meeting along the bloc line: a straight edge with at most one rounded step */}
      {blocShading && regions.regions.map(w => <path key={w.band} data-bloc-region={bands[w.band].bloc} aria-hidden="true" pointerEvents="none"
        className={`wedge solid ${bands[w.band].bloc === '__none' ? 'unassigned' : ''}`} d={w.fill} style={{ ['--bc' as string]: bands[w.band].color }} />)}
      {seats.map((st, i) => {
        const [x, y] = trayCell(i, tray.cols), c = TRAY.cell;
        const dim = dimOthers && selected && selected !== st.listId;
        return <g key={i} {...seatButton(i)}>
          <rect data-seat="" data-bloc={st.bloc ?? "__none"} data-gained={changes.gained.has(`${st.listId}:${st.idx}`) ? '' : undefined} className={`seat ${dim ? 'dim' : ''} ${i === found ? 'found' : ''}`} x={x} y={y} width={c} height={c} rx={4} fill={st.color} stroke={changes.gained.has(`${st.listId}:${st.idx}`) ? 'var(--ink)' : 'var(--ink-2)'} strokeWidth={changes.gained.has(`${st.listId}:${st.idx}`)?4:1}
            onMouseEnter={e => { if (hoverPopups && !touchPress.current) onSeatHover(st,e); }} {...seatPointer} onClick={e => onSeatClick(st, e)}><title>{seatLabel(st)}</title></rect>
          {st.innerColor && <PartyDot partyId={st.partyId} x={x+c/2} y={y+c/2} r={c/2} square={{rx:4}} color={st.innerColor} className={dim ? 'seat dim' : 'seat'}/>}
        </g>;
      })}
      {ring !== null && ring < seats.length && (([x, y]) => <rect className="seat-ring" x={x - 4} y={y - 4} width={TRAY.cell + 8} height={TRAY.cell + 8} rx={7} />)(trayCell(ring, tray.cols))}
      {found !== null && found < seats.length && (([x, y]) => foundMark(x + TRAY.cell / 2, y + TRAY.cell / 2, TRAY.cell / 2, 0, 0, tray.width, true))(trayCell(found, tray.cols))}
    </svg>;
  }

  // lists in the order their seats are drawn (blocs left to right, No bloc between their halves), each with the colours
  // its seats actually carry in the chosen colour mode
  const keyRows = chamberKeyRows(s, seats, jointLook), keyGroups = chamberKeyGroups(keyRows);
  const partyName = (p: NonNullable<ChamberKeyRow['p']>) => (lang === 'he' ? p.nameHe : p.nameEn);
  // an exported key line has room for about 42 characters: a party row shortens its party's name first, so the list's
  // name stays whole, and a cut falls between words
  const exportName = (l: SimList, p: ChamberKeyRow['p'], byParty: boolean) => {
    const full = keyName(l, p, byParty), list = listLabel(l, lang), max = 42;
    if (full.length <= max) return full;
    if (byParty && full.endsWith(` · ${list}`) && list.length + 8 <= max) return `${clipWords(full.slice(0, -list.length - 3), max - list.length - 3)} · ${list}`;
    return clipWords(full, max);
  };
  // a party row names its party and its list; seats whose member has no recorded party keep the list's name
  const keyName = (l: SimList, p: ChamberKeyRow['p'], byParty: boolean) => {
    if (!byParty) return listLabel(l, lang);
    const name = p ? (lang === 'he' ? p.nameHe : p.nameEn) : L('Party not recorded', 'מפלגה לא מתועדת');
    return name === listLabel(l, lang) ? name : `${name} · ${listLabel(l, lang)}`;
  };
  const head = !compactProp && (expertControl || standardControl || expert || standard);
  return (
    <div className="chamber">
      {head && <div className="chamber-tools">
        {expert && <>
          <Seg label={L('Chamber layout', 'פריסה')} value={layout} onChange={(v) => setSetting('chamberLayout', v)} options={[{ v: 'hemicycle', label: L('Arc', 'קשת') }, { v: 'blocks', label: L('Blocks', 'משבצות') }]} />
          <ChoicePicker label={L('Colour seats by', 'צביעת מושבים לפי')} value={colorBy} options={(['list', 'bloc', 'party'] as const).map(value => ({ value, label: value === 'list' ? L('List', 'רשימה') : value === 'bloc' ? L('Bloc', 'גוש') : L('Party', 'מפלגה'), preview: <ResultPreview s={s} blocs={value === 'bloc'} party={value === 'party'} /> }))} onChange={value => setSetting('seatColour', value as typeof colorBy)} />
        </>}
        {expertControl}{standardControl}
        {/* the export buttons open beside their chip, in the tools row (audit c-levels-09: they appeared under the key) */}
        {standard && <span className="row chamber-export">
          <button className="btn small ghost" onClick={() => exportSvg('svg')}>{L('Export SVG', 'ייצוא SVG')}</button>
          <button className="btn small ghost" onClick={() => exportSvg('png')}>{L('Export PNG', 'ייצוא PNG')}</button>
        </span>}
      </div>}
      {/* on the board the bloc bar directly below already carries this line; Compare's chambers stand alone */}
      {compactProp && <BlocMajorities s={s} r={r} />}
      {!compactProp && mkEntries.length > 0 && <FindMk entries={mkEntries} query={findQ} onQuery={setFindQ} pick={findPick} onPick={setFindPick} knesset={Number(s.electionId.slice(1))} seatedCandidateIds={seatedIds} />}
      {body}
      {/* spoken seat names with a Hebrew name on an English page (or the reverse) are marked with the name's language */}
      {seatNames.map((n, i) => <LangLabel key={i} id={`${seatId}-${i}`} text={n} />)}
      {/* the card comes next in the page, so Tab goes from a seat into its card (its links) */}
      {/* the per-list seat changes are said once, in the change line under the tools strip */}
      {hover && hv && (
        <Floating onPointerEnter={hoverBridge.keep} onPointerLeave={hoverBridge.leave} className="tip" preferAbove anchor={() => hover.anchor.getBoundingClientRect()}
          role="dialog" label={seatNames[seats.indexOf(hover.seat)] ?? seatLabel(hover.seat)} labelledBy={'aria-labelledby' in nameProps(seatNames[seats.indexOf(hover.seat)] ?? '', lang, '') ? `${seatId}-${seats.indexOf(hover.seat)}` : undefined}><div ref={card} onBlur={onSeatsBlur}>
          <div className="row"><SlipName list={hv} name={listLabel(hv, lang)} /></div>
          {cand ? <div><b><CandidateName candidate={cand} text={hoverCandidateName} /></b> · {L('rank', 'מקום')} {candPlace}{cand.notes?.map((n, k) => <div key={k} className="muted small">{lang === 'he' ? n.he : n.en}</div>)}</div>
            : hv.rosterUnavailable || hv.rosterTruncated ? <div className="muted">{L(`Seat ${hover.seat.idx + 1} of the list; candidate names are not available for this election`, `מושב ${hover.seat.idx + 1} של הרשימה; שמות המועמדים אינם זמינים לבחירות אלה`)}</div>
            : <div className="bad">{L('Vacant — the list has too few candidates', 'מושב ריק — אין די מועמדים ברשימה')}</div>}
          {(hover.seat.partyId || cand?.partyHe) && <div className="muted small row">{hover.seat.partyColor && <PartyKey hover partyId={hover.seat.partyId} color={hover.seat.partyColor} ring={hover.seat.innerColor ? hv.color : undefined}/>}{seatLabel(hover.seat)}</div>}
          <div className="muted small">{hover.seat.remainder ? remainderHow : L('Seat won by whole quota', 'מנדט שהושג במודד שלם')}</div>
          <MkSeatLink candidate={cand} />
          {!factLog(s).length && <SeatHolders electionId={s.electionId} candidate={cand} />}
          {hover.touch && <button type="button" className="btn small" onClick={() => { setHover(null); setState({ selectedListId: hover.seat.listId }); }}>{L('List details', 'פרטי הרשימה')}</button>}
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
      {hasChanges && <p className="small muted graphic-key">{L('Seat changes', 'שינויי מנדטים')} · {referenceLabel(labelReference,lang).name} <Info title={L('About these outlines','על המתארים')}>{L(`Outlined: seats gained compared with ${referenceLabel(labelReference,lang).name}. Dashed, in the small chamber: seats lost. Outlines compare list seat counts, not individual seats or voters moving between lists. Dashed bars show the reference; neutral ink shows the difference.`, `בקו מתאר: מנדטים שנוספו לעומת ${referenceLabel(labelReference,lang).name}. מקווקו, בכנסת הקטנה: מנדטים שאבדו. המתארים משווים את מספר המנדטים של הרשימות; אין משמעות של מנדט או בוחר שעבר בין רשימות. מתארי העמודות המקווקווים מציינים את הבסיס; דיו ניטרלי מציין שינוי.`)}</Info></p>}
      {!compactProp && (
        <div className="legend" data-key-off={chamberKey ? undefined : ''} role="group" aria-label={L('Lists in the Knesset', 'הרשימות בכנסת')} style={{ marginTop: 6 }}>
          {seats.some(st=>st.bloc===null) && <span className="row no-bloc-legend"><span className="swatch bloc-swatch unassigned" style={{['--bc' as string]:'var(--muted)'}} />{L('No bloc','ללא גוש')}</span>}
          {keyGroups.map(({ l, byParty, n: total, rows }) => {
            const pick = () => setState({ selectedListId: selected === l.id ? null : l.id });
            if (!byParty) return <ListKeyItem key={l.id} list={l} seats={total} seatColors={rows[0].colors} pressed={selected === l.id} onPick={pick} />;
            const dot = (p: ChamberKeyRow['p']) => p ? <PartyKey partyId={p.id} color={partyDisplayColor(l, p.id)} ring={jointLook === 'both' ? l.color : undefined} /> : <PartyKey color={l.color} />;
            const logo = (p: ChamberKeyRow['p']) => { const own = ownPartyLogo(l, p); return own && p ? <span aria-hidden="true"><Slip letters="" name={partyName(p)} color={partyDisplayColor(l, p.id)} logo={own} size="sm" /></span> : null; };
            const listMark = <span aria-hidden="true"><Slip {...l} name={listLabel(l, lang)} size="sm" /></span>;
            // a joint list whose seats all went to one party: one entry, its seat dot beside the list's mark
            if (rows.length === 1) return <button key={l.id} aria-pressed={selected === l.id} onClick={pick}>{dot(rows[0].p)}{listMark}{keyName(l, rows[0].p, true)} <b className="tabnum"><bdi dir="ltr">{total}</bdi></b></button>;
            return <span key={l.id} className="key-group" role="group" aria-label={listLabel(l, lang)} style={{ ['--lc' as string]: l.color }}>
              <button className="key-group-head" aria-pressed={selected === l.id} onClick={pick}>{listMark}<strong>{listLabel(l, lang)}</strong> <b className="tabnum key-total"><bdi dir="ltr">{total}</bdi></b></button>
              {rows.map(({ key, p, n }) => <button key={key} aria-pressed={selected === l.id} onClick={pick}>{dot(p)}{logo(p)}{p ? partyName(p) : L('Party not recorded', 'מפלגה לא מתועדת')} <b className="tabnum"><bdi dir="ltr">{n}</bdi></b></button>)}
            </span>;
          })}
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
