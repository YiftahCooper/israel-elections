// Places the CBS locality file has no point for, placed by this project and always shown as approximate.
//
// Hebron's Jewish community (the Central Elections Committee's locality 3400; in 2006 the row has no code) votes at one
// polling station in the city. The CBS locality list has no entry for it, so the map had no dot. The point below is the
// Jewish quarter of Hebron, between Beit Hadassah and the Avraham Avinu neighbourhood, to within about half a
// kilometre. It is not the polling station's building, whose exact position has not been established (research lane
// R2, 16 Nov 2026: the official list names the Jabotinsky Centre). Other dots are CBS locality reference points, not
// polling stations either.
import type { Coordinate } from './locality-coordinates.ts';

export interface ManualPoint extends Coordinate { code: number; nameHe: string; noteEn: string; noteHe: string }

export const MANUAL_POINTS: readonly ManualPoint[] = [
  { code: 3400, nameHe: 'חברון', lat: 31.5248, lon: 35.1085,
    noteEn: 'Approximate position, in the Jewish quarter of Hebron. The polling station’s exact position is not known.',
    noteHe: 'מיקום משוער, ברובע היהודי בחברון. המיקום המדויק של הקלפי אינו ידוע.' },
];

/** The project's approximate point for a row with no CBS point (matched by code, or by name for a row with no code). */
export function manualPoint(row: { code: number | null; nameHe: string }): ManualPoint | null {
  return MANUAL_POINTS.find(p => row.code === null ? row.nameHe.trim() === p.nameHe : row.code === p.code) ?? null;
}
