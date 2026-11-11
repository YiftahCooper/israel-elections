import { describe, expect, test } from 'vitest';
import { allLines, shownLines, tickLine, type MapLineChoice } from '../src/app/mapLineChoice.ts';
import { LINKED, SETTINGS, settingDefault, validSettings, withLinked } from '../src/app/settings.ts';
import { MAP_LINES } from '../src/app/locality-map-line-catalogue.ts';

const ids = MAP_LINES.map(x => x.id);
const ALL = { on: true, off: [] as string[] };
describe('the map lines switch (remembered; the same switch in Settings)', () => {
  test('the map opens with every line by default', () => {
    expect(settingDefault('mapLines', 'simple')).toBe(true);
    expect(settingDefault('mapLinesOff', 'expert')).toEqual([]);
    expect(allLines(ids, ALL)).toBe('all');
    expect(shownLines(ids, ALL)).toEqual(ids);
  });
  test('the switch off hides every line; some unticked shows the dash', () => {
    expect(allLines(ids, { on: false, off: [] })).toBe('none');
    expect(shownLines(ids, { on: false, off: [] })).toEqual([]);
    const golan = tickLine(ids, tickLine(ids, ALL, 'golan-alpha', false), 'golan-bravo', false);
    expect(golan).toEqual({ on: true, off: ['golan-alpha', 'golan-bravo'] });
    expect(allLines(ids, golan)).toBe('some');
  });
  test('ticking one line with the switch off shows only that line', () => {
    const one = tickLine(ids, { on: false, off: [] }, 'green-line', true);
    expect(shownLines(ids, one)).toEqual(['green-line']);
    expect(one.on).toBe(true);
  });
  test('unticking the last line turns the switch off, so Settings and the key agree', () => {
    let c: MapLineChoice = { on: true, off: ids.filter(x => x !== 'blue-line') };
    c = tickLine(ids, c, 'blue-line', false);
    expect(c).toEqual({ on: false, off: [] });
  });
  test('the Settings row is one switch under Analysis, tied to the Localities tool; its reset also restores single lines', () => {
    const row = SETTINGS.find(r => r.id === 'mapLines')!;
    expect(row).toMatchObject({ group: 'analysis', control: 'toggle', feature: 'loc' });
    expect(LINKED.mapLines).toEqual(['mapLinesOff']);
    expect(withLinked(['mapLines'])).toEqual(['mapLines', 'mapLinesOff']);
    expect(SETTINGS.some(r => r.id === 'mapLinesOff')).toBe(false);
  });
  test('stored single lines are read back; anything else falls back', () => {
    expect(validSettings({ mapLines: false, mapLinesOff: ['golan-alpha'] })).toEqual({ mapLines: false, mapLinesOff: ['golan-alpha'] });
    expect(validSettings({ mapLinesOff: 'golan-alpha' })).toEqual({});
    expect(validSettings({ mapLinesOff: [1] })).toEqual({});
  });
});
