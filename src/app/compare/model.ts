// View model shared by the Compare workbench and its dialogs.
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Action, Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, referenceChanges } from '../derive.ts';
import { copyOriginOf } from '../../model/editScopes.ts';
import type { CopySource } from './copy.ts';
import type { MatchRow } from './match.ts';

export interface SideModel {
  role: 'main' | 'other';
  /** draft key ('main' for the main scenario) */
  key: string;
  sc: Scenario; r: AllocationResult;
  /** the side's starting point: markers, As change and Start over compare with it */
  start: Scenario;
  ds: ElectionDataset;
  /** "2022" */
  year: string;
  /** what the side shows: "Official result", "Your scenario", a saved name, "2022 draft" */
  name: string;
  /** an unedited official result (a copy from it is "From 2022") */
  official: boolean;
  edited: boolean;
  frame: string;
  canUndo: boolean; canRedo: boolean;
  undo: () => void; redo: () => void; startOver: () => void;
  apply: (a: Action) => boolean;
}
export const sourceOf = (x: SideModel): CopySource => ({ sc: x.sc, start: x.start, name: x.official ? x.year : x.name, official: x.official });

export interface Cells { ids: string[]; lists: SimList[]; votes: number; seats: number; total: number; withdrawn: boolean }
export function cellsOf(x: SideModel, ids: string[]): Cells | null {
  if (!ids.length) return null;
  const lists = ids.map((id) => x.sc.lists.find((l) => l.id === id)).filter((l): l is SimList => !!l);
  return { ids, lists, votes: lists.reduce((t, l) => t + l.votes, 0), seats: lists.reduce((t, l) => t + (x.r.lists.find((y) => y.id === l.id)?.seats ?? 0), 0), total: Number(x.r.totalValid), withdrawn: lists.every((l) => l.withdrawn) };
}
export const seatsOf = (sc: Scenario, ids: string[]) => { const r = allocationOf(sc); return ids.reduce((t, id) => t + (r.lists.find((l) => l.id === id)?.seats ?? 0), 0); };

/** A list's own marks on one side: its changed inputs since the side's starting point (balance-only vote changes excluded). */
export function listMarks(x: SideModel, id: string) {
  const paths = referenceChanges(x.sc, x.start).filter((p) => p[0] === 'lists' && p[1] === id || p[0] === 'parts' && p[2] === id);
  return paths.map((p) => ({ path: p, origin: copyOriginOf(x.sc, p)?.provenance }));
}

/** Rows the copy treats as one unit, for the selection bar (a split group counts once). */
export function unitsFor(rows: MatchRow[], selected: Set<string>, all: MatchRow[], direction: 'toRight' | 'toLeft', unit: (r: MatchRow, all: MatchRow[], d: 'toRight' | 'toLeft') => { src: string[]; dst: string[] } | null) {
  const seen = new Set<string>(); const out: { src: string[]; dst: string[] }[] = []; let skipped = 0;
  for (const r of rows) {
    if (!selected.has(r.key)) continue;
    const g = r.group ?? r.key;
    if (seen.has(g)) continue; seen.add(g);
    const u = unit(r, all, direction);
    if (u) out.push(u); else skipped++;
  }
  return { units: out, skipped };
}
