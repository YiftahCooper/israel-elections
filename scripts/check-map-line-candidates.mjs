// Reproduce the research screening in docs/research/map-lines.md. No network or generated files.
import fs from 'node:fs';
import proj4 from 'proj4';
const read = file => JSON.parse(fs.readFileSync(`data/raw/map-lines/${file}.geojson`, 'utf8'));
const project = p => proj4('EPSG:4326', '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs', p);
const ocha = read('ocha-green');
const ways = read('osm-green').features.map(f => f.geometry.coordinates);
const gazaWays = read('osm-gaza').features.map(f => f.geometry.coordinates);
const segments = lines => lines.flatMap(line => line.slice(1).map((b, i) => [project(line[i]), project(b)]));
function distance(p, [a, b]) {
  const x = b[0] - a[0], y = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * x + (p[1] - a[1]) * y) / (x * x + y * y || 1)));
  return Math.hypot(p[0] - a[0] - t * x, p[1] - a[1] - t * y);
}
// Distance-to-a-set is 1-Lipschitz. Samples <=25m apart bound missed projected maxima by 12.5m.
function directed(a, b) {
  if (!a.length || !b.length) throw new Error('Both candidates must contain geometry');
  let maxMetres = 0, at = null;
  const other = segments(b);
  for (const [p, q] of segments(a)) {
    const count = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 25));
    for (let j = 0; j <= count; j++) {
      const point = [p[0] + (q[0] - p[0]) * j / count, p[1] + (q[1] - p[1]) * j / count];
      const d = Math.min(...other.map(segment => distance(point, segment)));
      if (d > maxMetres) { maxMetres = d; at = point; }
    }
  }
  return { maxMetres, at };
}
for (const area of ['Gaza Strip', 'West Bank']) {
  const a = ocha.features.filter(f => f.properties.nm4 === area
    || area === 'West Bank' && f.properties.nm4 === "No Man's Land").map(f => f.geometry.coordinates);
  const b = area === 'Gaza Strip' ? gazaWays
    : ways.filter(w => w.every(p => p[1] < 32.7 && p[1] > 31.2 && p[0] > 34.7 && p[0] < 36));
  console.log(area, a.length, b.length, JSON.stringify({ ochaToOsm: directed(a, b), osmToOcha: directed(b, a) }));
}
