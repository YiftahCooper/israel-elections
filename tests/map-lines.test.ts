import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { FeatureCollection, Position } from 'geojson';
const data = JSON.parse(readFileSync('public/data/map-lines.geojson','utf8')) as FeatureCollection;
it('ships the ten separately identified cartographic layers with dated provenance', () => {
  expect([...new Set(data.features.map(f=>f.properties?.layer))].sort()).toEqual(['blue-line','egypt-border','gaza-perimeter','golan-alpha','govt-house-zone','green-line','jordan-1967-admin','jordan-border','no-mans-land','scopus']);
  for (const f of data.features) { expect(f.properties?.snapshot).toBe('2026-11-07'); expect(f.properties?.source).toBeTruthy(); }
});
it('keeps Mount Scopus separate from the two historical no-man’s-land polygons', () => {
  const areas = data.features.filter(f=>f.properties?.layer==='no-mans-land');
  expect(areas).toHaveLength(2);
  for (const f of areas) {
    expect(f.geometry.type).toBe('Polygon');
    if(f.geometry.type==='Polygon') { const ring = f.geometry.coordinates[0]; expect(ring[0]).toEqual(ring.at(-1)); }
  }
  const scopus=data.features.filter(f=>f.properties?.layer==='scopus');expect(scopus).toHaveLength(1);
  expect(scopus[0].geometry.type).toBe('LineString');
});
it('contains finite regional coordinates and does not invent a Bravo line or a security barrier', () => {
  const check = (v: unknown): void => {
    if(Array.isArray(v) && typeof v[0]==='number') { const [lon,lat]=v as Position; expect(lon).toBeGreaterThan(34); expect(lon).toBeLessThan(36); expect(lat).toBeGreaterThan(29); expect(lat).toBeLessThan(34); }
    else if(Array.isArray(v)) v.forEach(check);
  };
  for(const f of data.features) if('coordinates' in f.geometry) check(f.geometry.coordinates);
  expect(data.features.some(f=>/bravo|barrier/.test(f.properties?.layer))).toBe(false);
});
