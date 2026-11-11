// The Knesset-term timeline and the seat cards (scripts/term-timeline-runtime.ts compiles the data;
// src/app/components/TermTimeline.tsx draws it). The runtime is its own chunk, requested the first time a timeline or a
// seat card could show it. Everything below the loader is pure and tested in tests/term-timeline.test.ts.
import { useEffect, useState } from 'react';
import type { Importance, MarkKind, SeatChangeKind, TermRuntime, TermTimelineRuntime, TimelineItem, TimelineStep } from '../../scripts/term-timeline-runtime.ts';

export type { Importance, MarkKind, SeatChangeKind, TermRuntime, TermTimelineRuntime, TimelineItem, TimelineStep };
export type { PackedHolder, Pairing } from '../../scripts/term-timeline-runtime.ts';

let runtime: TermTimelineRuntime | null = null;
let loading: Promise<TermTimelineRuntime> | null = null;
export function loadTermRuntime(): Promise<TermTimelineRuntime> {
  loading ??= import('virtual:term-timeline').then((m) => (runtime = m.default as TermTimelineRuntime));
  return loading;
}
export function useTermRuntime(): TermTimelineRuntime | null {
  const [rt, setRt] = useState(runtime);
  useEffect(() => { if (!rt) void loadTermRuntime().then(setRt); }, [rt]);
  return rt;
}

const RANK: Record<Importance, number> = { simple: 0, standard: 1, expert: 2 };
/** Is an item shown? Events: at their level and above. Seat changes: none at Off; at Important, those the research
 *  rates Simple or Standard; at All, those plus the kinds the Expert setting keeps. */
export function visibleItem(it: TimelineItem, level: Importance, seatChanges: 'off' | 'important' | 'all', kinds: Record<SeatChangeKind, boolean>): boolean {
  if (it.held) return false;
  if (it.type === 'event') return RANK[it.importance] <= RANK[level];
  if (seatChanges === 'off') return false;
  if (it.importance !== 'expert') return true;
  return seatChanges === 'all' && kinds[it.change ?? 'unknown'];
}

export interface StepView { step: TimelineStep; items: TimelineItem[] }
export interface TimelineChoice { level: Importance; seatChanges: 'off' | 'important' | 'all'; kinds: Record<SeatChangeKind, boolean> }

/** The steps a reader steps through: every date with something shown at their level and settings. */
export function visibleSteps(term: TermRuntime, c: TimelineChoice): StepView[] {
  return (term.timeline?.steps ?? []).map((step) => ({ step, items: step.items.filter((it) => visibleItem(it, c.level, c.seatChanges, c.kinds)) })).filter((s) => s.items.length > 0);
}

/** The person in a seat on a date (the last day of the term on its end date). */
export function holderAt(term: TermRuntime, seat: number, date: string) {
  const d = date >= term.end ? new Date(Date.parse(`${term.end}T00:00:00Z`) - 86400000).toISOString().slice(0, 10) : date;
  return term.seats[seat].holders.find((h) => h[1] <= d && (h[2] === null || d < h[2])) ?? null;
}

/** Seats in chamber order (left to right) and how many are on the coalition side (the left).
 *  Each side lists its lists largest first; a seat on the side its list mostly is not (a rebel, a party that changed
 *  sides alone) sits next to the middle, out of its list's block. Before the first government: one block, by list. */
export function chamberOrder(term: TermRuntime, step: TimelineStep, listRank: (list: string | null) => number): { order: number[]; left: number } {
  const n = term.seats.length;
  const coal = step.coalition ? new Set(step.coalition) : null;
  const size = new Map<string | null, number>();
  for (const s of term.seats) size.set(s.list, (size.get(s.list) ?? 0) + 1);
  const byList = (a: number, b: number) => (size.get(term.seats[b].list) ?? 0) - (size.get(term.seats[a].list) ?? 0) || listRank(term.seats[a].list) - listRank(term.seats[b].list) || a - b;
  const all = Array.from({ length: n }, (_, i) => i);
  if (!coal) return { order: all.sort(byList), left: 0 };
  const inCoal = new Map<string | null, number>();
  for (const i of coal) inCoal.set(term.seats[i].list, (inCoal.get(term.seats[i].list) ?? 0) + 1);
  const listSide = (l: string | null) => (inCoal.get(l) ?? 0) * 2 > (size.get(l) ?? 0) ? 'c' : 'o';
  const mover = (i: number) => (coal.has(i) ? 'c' : 'o') !== listSide(term.seats[i].list);
  const left = all.filter((i) => coal.has(i)), right = all.filter((i) => !coal.has(i));
  left.sort((a, b) => Number(mover(a)) - Number(mover(b)) || byList(a, b));
  right.sort((a, b) => Number(mover(b)) - Number(mover(a)) || byList(a, b));
  return { order: [...left, ...right], left: left.length };
}

/** The marks to draw at a step: rebels always; the other marks only for items the reader sees. */
export function stepMarks(view: StepView): Map<number, MarkKind | 'D2'> {
  const m = new Map<number, MarkKind | 'D2'>();
  for (const [seat] of view.step.rebels) m.set(seat, 'D2');
  for (const it of view.items) for (const [seat, kind] of it.marks) if (!m.has(seat) || kind !== 'rep') m.set(seat, kind);
  return m;
}
/** Seats that glow at a step: moved between the sides, or changed hands, by an item the reader sees. */
export function stepGlow(view: StepView): Set<number> {
  return new Set(view.items.flatMap((it) => [...it.moved, ...(it.type === 'seat' && it.seat !== undefined ? [it.seat] : [])]));
}
