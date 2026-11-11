/** The Localities map's historical lines as one remembered choice (Settings `mapLines` and `mapLinesOff`): the
 *  "All lines and areas" switch, and the single lines unticked while it is on. "On" always means at least one line
 *  shows, so the switch in Settings and the box in the map's key never disagree. */
export interface MapLineChoice { on: boolean; off: readonly string[] }
export type AllLines = 'all' | 'some' | 'none';

export const shownLines = (ids: readonly string[], c: MapLineChoice): string[] => c.on ? ids.filter(id => !c.off.includes(id)) : [];
export function allLines(ids: readonly string[], c: MapLineChoice): AllLines {
  const n = shownLines(ids, c).length;
  return n === 0 ? 'none' : n === ids.length ? 'all' : 'some';
}
/** Ticks or unticks one line; unticking the last one turns the whole switch off. */
export function tickLine(ids: readonly string[], c: MapLineChoice, id: string, show: boolean): MapLineChoice {
  const shown = new Set(shownLines(ids, c));
  if (show) shown.add(id); else shown.delete(id);
  return shown.size ? { on: true, off: ids.filter(x => !shown.has(x)) } : { on: false, off: [] };
}
