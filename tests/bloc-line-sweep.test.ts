// Every election k1–k26 × every bloc grouping it ships with, in both layouts: the bloc line keeps every seat on its own
// side, runs in the middle between the blocs' seats wherever it can, turns smoothly, and is the same for the same input. With BLOC_LINE_SWEEP=<file.html> it also writes
// one picture per case, for looking at (see .backup-scratch/sc-1112 in the main checkout).
import { expect, test } from 'vitest';
import { writeFileSync } from 'node:fs';
import { seatOrder } from '../src/app/components/Hemicycle.tsx';
import { blocDisplayOrder } from '../src/app/blocOrder.ts';
import { arcLayout } from '../src/app/layout.ts';
import { arcBlocRegions, arcSeatSlots, trayBlocRegions, trayCell, TRAY, directionChanges} from '../src/app/blocLine.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf } from '../src/app/derive.ts';
import { dataset } from './graphics-cases.ts';
import { centring, regionErrors, sharpest, trayRegionErrors } from './bloc-line-check.ts';

const pictures: string[] = [];
// a turn of about 6° or more is one the eye sees; smaller ones are the curve following a seat's round edge
const SEEN = 0.1;
const svgArc = (title: string, seats: { color: string }[], bands: number[], colours: string[]) => {
  const arc = arcLayout(seats.length), slots = arcSeatSlots(arc.seats, bands, arc.r), placed = slots.map((k) => arc.seats[k]);
  const { regions, lines } = arcBlocRegions(placed, bands, arc.r);
  const body = regions.map((g) => `<path d="${g.fill}" fill="${colours[g.band]}" fill-opacity=".18" stroke="#3a3a3c" stroke-width="1.25" vector-effect="non-scaling-stroke"/>`).join('')
    + seats.map((st, i) => `<circle cx="${500 + placed[i].x * 400}" cy="${470 + placed[i].y * 400}" r="${arc.r * 400}" fill="${st.color}" stroke="#555" stroke-width="1"/>`).join('');
  return `<figure><figcaption>${title} · bends ${lines.map((l) => directionChanges(l.points, SEEN)).join('/')} · clearance ${lines.map((l) => l.clearance.toFixed(1)).join('/')}</figcaption><svg viewBox="40 30 920 470" width="900">${body}</svg></figure>`;
};
const svgTray = (title: string, seats: { color: string }[], bands: number[], colours: string[]) => {
  const { regions } = trayBlocRegions(bands);
  const body = regions.map((g) => `<path d="${g.fill}" fill="${colours[g.band]}" fill-opacity=".18" stroke="#3a3a3c" stroke-width="1.25" vector-effect="non-scaling-stroke"/>`).join('')
    + seats.map((st, i) => { const [x, y] = trayCell(i); return `<rect x="${x}" y="${y}" width="${TRAY.cell}" height="${TRAY.cell}" rx="4" fill="${st.color}" stroke="#555"/>`; }).join('');
  return `<figure><figcaption>${title}</figcaption><svg viewBox="0 0 1000 320" width="900">${body}</svg></figure>`;
};

const cases = Array.from({ length: 26 }, (_, i) => i + 1).flatMap((n) => {
  const base = scenarioFromDataset(dataset(n));
  const schemes = base.blocSchemes ?? [];
  return [{ name: `k${n} (default)`, s: base }, ...schemes.map((g) => ({ name: `k${n} ${g.id}`, s: applyAction(base, { type: 'applyBlocScheme', schemeId: g.id }) }))];
});

test('every election and grouping: seats on their own side, few bends, deterministic', () => {
  const problems: string[] = [], bends: number[] = [], offs: number[] = [], sharp: number[] = [];
  for (const { name, s } of cases) {
    const r = allocationOf(s), seats = seatOrder(s, r, 'list');
    const order = blocDisplayOrder(s), bands = seats.map((st) => order.indexOf(st.bloc));
    const colours = order.map((b) => s.blocs.find((x) => x.id === b)?.color ?? '#8e8e93');
    const arc = arcLayout(seats.length), slots = arcSeatSlots(arc.seats, bands, arc.r), placed = slots.map((k) => arc.seats[k]);
    if (new Set(slots).size !== seats.length) problems.push(`${name}: two seats share a place`);
    const first = arcBlocRegions(placed, bands, arc.r);
    problems.push(...regionErrors(placed, bands, arc.r).map((e) => `${name} arc: ${e}`), ...trayRegionErrors(bands).map((e) => `${name} blocks: ${e}`));
    for (const line of first.lines) { bends.push(directionChanges(line.points, SEEN)); sharp.push(sharpest(line.points)); }
    const co = centring(placed, bands, arc.r, first.lines); offs.push(...co);
    if (process.env.BLOC_DEBUG) console.log('CASE', name, 'centring', co.map((v) => v.toFixed(2)).join(' '), 'sharp', first.lines.map((l) => sharpest(l.points).toFixed(2)).join(' '));
    if (JSON.stringify(arcBlocRegions(placed, bands, arc.r)) !== JSON.stringify(first) || JSON.stringify(arcSeatSlots(arc.seats, bands, arc.r)) !== JSON.stringify(slots)) problems.push(`${name}: not deterministic`);
    if (process.env.BLOC_LINE_SWEEP && new Set(bands).size > 1) pictures.push(`<section><h3>${name}</h3>${svgArc(name, seats, bands, colours)}${svgTray(name, seats, bands, colours)}</section>`);
  }
  if (process.env.BLOC_LINE_SWEEP) writeFileSync(process.env.BLOC_LINE_SWEEP, `<!doctype html><meta charset="utf-8"><style>body{font:13px sans-serif}section{border-top:1px solid #ccc;width:940px}figure{margin:4px}</style>${pictures.join('')}`);
  expect(problems).toEqual([]);
  const histogram = bends.reduce<Record<number, number>>((h, b) => ({ ...h, [b]: (h[b] ?? 0) + 1 }), {});
  console.log('direction changes per line:', JSON.stringify(histogram));
  const q = (xs: number[], f: number) => [...xs].sort((a, b) => a - b)[Math.floor(f * (xs.length - 1))].toFixed(3);
  console.log('centring', offs.length, 'median', q(offs, 0.5), 'p90', q(offs, 0.9), 'p99', q(offs, 0.99), 'max', q(offs, 1), '; sharpest', 'median', q(sharp, 0.5), 'p90', q(sharp, 0.9), 'max', q(sharp, 1));
  const at = (xs: number[], f: number) => [...xs].sort((a, b) => a - b)[Math.floor(f * (xs.length - 1))];
  // in the middle: half of all row crossings within 5% of the gap's middle, nine in ten within 60% of the way to a seat
  expect(at(offs, 0.5)).toBeLessThan(0.05);
  expect(at(offs, 0.9)).toBeLessThan(0.6);
  // smooth: most lines straight or one or two gentle turns, no sharp corner anywhere
  expect(bends.filter((b) => b <= 2).length / bends.length).toBeGreaterThanOrEqual(0.75);
  expect(Math.max(...bends)).toBeLessThanOrEqual(12);
  // 0.9, not 0.7, since 1949's government grouping has its 2-seat "Voted confidence only" pocket between the halves
  // (as 1977's outside support): its two lines turn at 1.40, which moves the 90th line from 0.66 to the 0.87 group
  expect(at(sharp, 0.9)).toBeLessThan(0.9);
  expect(Math.max(...sharp)).toBeLessThan(1.7);
}, 120000);

