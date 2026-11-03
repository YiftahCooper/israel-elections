// Checks that seat-winning lists next to each other in the chamber have clearly different colours
// (CIE Lab distance above 20). Usage: node scripts/check-colours.ts k20 k21 …  (no ids = every available election)

import { readFileSync } from 'node:fs';
const lab = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const [x, y, z] = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]].map((r, i) => (r[0] * c[0] + r[1] * c[1] + r[2] * c[2]) / [0.95047, 1, 1.08883][i]);
  const f = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
const d = (a: string, b: string) => { const [p, q] = [lab(a), lab(b)]; return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[]).filter((e) => e.available).map((e) => e.id);
let failed = false;
for (const id of ids) {
  const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
  const thr = Number(ds.ruleSetId.split('-').pop()) / 100; const won = ds.lists.filter((l: any) => ds.officialSeats ? ds.officialSeats[l.id] > 0 : l.votes >= thr * ds.totals.valid); // seat order
  const bad: string[] = [];
  const top = won.slice(0, 16);
  for (let i = 1; i < top.length; i++) { const dd = d(top[i - 1].color, top[i].color); if (dd < 20) bad.push(`${top[i - 1].shortEn}/${top[i].shortEn} ${dd.toFixed(1)}`); }
  if (bad.length) failed = true;
  console.log(id, bad.length ? 'CLOSE: ' + bad.join('; ') : 'ok');
}
if (failed) process.exitCode = 1;
