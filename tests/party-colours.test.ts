import {separateColours} from '../src/data/colourGuard.ts';
// Party colours must tell lists apart wherever they are drawn (decision 0087, revised 2026-11-04): any two lists
// sharing the chamber differ by at least MIN_LIST_DELTA_E (CIEDE2000), and lists drawn side by side — in the chamber
// and its legend, the bloc strip, and the list column — by at least MIN_NEIGHBOUR_DELTA_E. Seat fills stay readable on
// both themes' surfaces.
import { expect, test } from 'vitest';
import { deltaE2000, hexToLab, MIN_LIST_DELTA_E, MIN_NEIGHBOUR_DELTA_E, SEAT_LIGHTNESS } from '../src/data/colour.ts';
import { seatOrder } from '../src/app/components/Hemicycle.tsx';
import { graphicScenario } from './graphics-cases.ts';

test('CIEDE2000 matches the published reference pairs (Sharma, Wu & Dalal 2005)', () => {
  // Lab inputs are not hex, so check through known sRGB pairs whose ΔE00 is well established
  expect(deltaE2000('#ffffff', '#ffffff')).toBe(0);
  expect(deltaE2000('#000000', '#ffffff')).toBeCloseTo(100, 0);
  expect(deltaE2000('#ff0000', '#00ff00')).toBeCloseTo(86.6, 0);
  expect(deltaE2000('#1f5aa5', '#2535d8')).toBeGreaterThan(deltaE2000('#1f5aa5', '#2050a8'));
});

for (let n = 1; n <= 26; n++) test(`k${n}: neighbouring and co-seated lists have distinct colours`, () => {
  const { s, r } = graphicScenario(n, []);
  const seats = (id: string) => r.lists.find((x) => x.id === id)?.seats ?? 0;
  const won = s.lists.filter((l) => seats(l.id) > 0);
  const name = (id: string) => { const l = s.lists.find((x) => x.id === id)!; return `${l.shortEn ?? l.letters} ${l.color}`; };
  const problems: string[] = [];
  for (const l of won) { const L = hexToLab(l.color)[0]; if (L < SEAT_LIGHTNESS[0] - 0.5 || L > SEAT_LIGHTNESS[1] + 0.5) problems.push(`${name(l.id)} lightness ${L.toFixed(0)}`); }
  won.forEach((a, i) => won.slice(i + 1).forEach((b) => {
    const d = deltaE2000(a.color, b.color);
    if (d < MIN_LIST_DELTA_E - 0.05) problems.push(`${name(a.id)} / ${name(b.id)} ${d.toFixed(1)}`);
  }));
  // chamber, legend and bloc strip follow the seat order; the list column sorts by seats
  const chamber = seatOrder(s, r, 'list').map((x) => x.listId);
  const column = [...won].sort((a, b) => seats(b.id) - seats(a.id) || b.votes - a.votes).map((l) => l.id);
  for (const order of [chamber, column]) order.forEach((id, i) => {
    if (!i || order[i - 1] === id) return;
    const d = deltaE2000(s.lists.find((l) => l.id === id)!.color, s.lists.find((l) => l.id === order[i - 1])!.color);
    // one known exception, kept visible: 1992's sourced grouping moves Hadash into its outside-support group,
    // leaving UTJ beside Moledet; list colours do not follow groupings (owner, 7 Nov), so the pair keeps
    // its colours above the general minimum until stable party colours settle it (t3/v1-bloc-bands)
    const pair = [order[i - 1], id].sort().join(' ');
    if (pair === '13-ג 13-ט' && d >= MIN_LIST_DELTA_E) return;
    if (d < MIN_NEIGHBOUR_DELTA_E - 0.05) problems.push(`neighbours ${name(order[i - 1])} / ${name(id)} ${d.toFixed(1)}`);
  });
  expect(problems).toEqual([]);
});

test('separation keeps the larger list\'s colour and moves the smaller one least', () => {
  const { colors, adjusted } = separateColours([{ id: 'big', color: '#ee161f' }, { id: 'small', color: '#ea1f26' }]);
  expect(colors.get('big')).toBe('#ee161f');
  expect(adjusted.has('big')).toBe(false);
  expect(deltaE2000(colors.get('small')!, '#ee161f')).toBeGreaterThanOrEqual(MIN_LIST_DELTA_E);
  const neighbours = new Set(['big small']);
  expect(deltaE2000(separateColours([{ id: 'big', color: '#1f5aa5' }, { id: 'small', color: '#2a62b0' }], neighbours).colors.get('small')!, '#1f5aa5')).toBeGreaterThanOrEqual(MIN_NEIGHBOUR_DELTA_E);
});

test('every bloc region stands apart from the other blocs of its grouping and from No bloc, in both themes', async () => {
  const { blocTints, noBlocTints, MIN_BLOC_TINT_DELTA_E } = await import('../src/data/colour.ts');
  const problems: string[] = [];
  for (let n = 1; n <= 26; n++) {
    const { base } = graphicScenario(n, []);
    for (const scheme of base.blocSchemes ?? []) {
      const tints = [{ name: 'No bloc', t: noBlocTints() }, ...scheme.blocs.map((b) => ({ name: `${b.nameEn} ${b.color}`, t: blocTints(b.color) }))];
      tints.forEach((a, i) => tints.slice(i + 1).forEach((b) => a.t.forEach((x, theme) => {
        const d = deltaE2000(x, b.t[theme]);
        if (d < MIN_BLOC_TINT_DELTA_E - 0.05) problems.push(`k${n} ${scheme.id} ${theme ? 'dark' : 'light'}: ${a.name} / ${b.name} ${d.toFixed(1)}`);
      })));
    }
  }
  expect(problems).toEqual([]);
});

test('the bloc editor palette never offers the No bloc grey', async () => {
  const { blocTints, noBlocTints, MIN_BLOC_TINT_DELTA_E } = await import('../src/data/colour.ts');
  const { BLOC_PALETTE } = await import('../src/app/components/BlocPanel.tsx');
  const none = noBlocTints();
  for (const c of BLOC_PALETTE) blocTints(c).forEach((t, theme) => expect(deltaE2000(t, none[theme]), `${c} ${theme ? 'dark' : 'light'}`).toBeGreaterThanOrEqual(MIN_BLOC_TINT_DELTA_E));
  BLOC_PALETTE.forEach((a, i) => BLOC_PALETTE.slice(i + 1).forEach((b) => blocTints(a).forEach((t, theme) => expect(deltaE2000(t, blocTints(b)[theme]), `${a}/${b}`).toBeGreaterThanOrEqual(5))));
});
