import { expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import type { StyleSpecification } from 'maplibre-gl';
import { basemapStyleUrl, localityBasemapStyle } from '../src/app/locality-basemap-style.ts';
import { localityLocationKey } from '../src/data/locality-location-key.ts';
import { isEnvelopeRow, type LocalityRow } from '../src/data/schema.ts';

it('removes every provider label, POI and boundary, preserving geography without mutating the input', () => {
  const original: StyleSpecification = { version: 8, sources: {}, layers: [
    {id:'land', type:'background'}, {id:'road',type:'line',source:'osm','source-layer':'transportation'},
    {id:'place',type:'symbol',source:'osm','source-layer':'place'},
    {id:'future-poi',type:'symbol',source:'osm'},
    {id:'boundary_2',type:'line',source:'osm','source-layer':'boundary'},
    {id:'new',type:'line',source:'osm','source-layer':'boundary'},
  ] };
  expect(localityBasemapStyle(original).layers.map(l=>l.id)).toEqual(['land','road']);
  expect(original.layers).toHaveLength(6);
  expect(basemapStyleUrl(false)).toMatch(/\/positron$/);
  expect(basemapStyleUrl(true)).toMatch(/\/dark$/);
});

it('every placed result row uses the retained locality-name index, including the k17 name join', () => {
  const json = (file: string) => JSON.parse(readFileSync(`public/data/${file}`, 'utf8'));
  for (const file of readdirSync('public/data').filter(f => /^k\d+-locations\.json$/.test(f))) {
    const id = file.replace('-locations.json','');
    const locations = json(file), names = json(`${id}-locality-names.json`);
    const data = json(`${id}-localities.json`);
    data.rows.forEach((row: LocalityRow, index: number) => {
      if (!isEnvelopeRow(row) && locations[localityLocationKey(row,index)]) {
        expect(names.names[index], `${id} row ${index}`).toBeTruthy();
        expect(names.names[index]).not.toMatch(/[\u0590-\u05ff\u0600-\u06ff]/);
        expect(names.project, `${id} row ${index} must have a CBS name`).not.toContain(index);
      }
    });
  }
});
