import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import type {FeatureCollection} from 'geojson';
import {lineVisibleAtZoom,LINE_STROKE} from '../src/app/locality-map-line-policy';
import {MAP_LINES,mapLineSourceLabel} from '../src/app/locality-map-line-catalogue';
import treaty from '../data/raw/map-lines/official-treaty-excerpts.json';
const fs=(JSON.parse(readFileSync('public/data/map-lines.geojson','utf8')) as FeatureCollection).features;
it('withholds features above the source precision rather than magnifying uncertainty past 20 pixels',()=>{
 for(const f of fs){
  const p=f.properties!;expect(lineVisibleAtZoom(p,p.maxZoom)).toBe(true);expect(lineVisibleAtZoom(p,p.maxZoom+.1)).toBe(false);
  if(typeof p.uncertaintyM==='number')expect(p.uncertaintyM/(156543.03392*Math.cos(34*Math.PI/180)/2**p.maxZoom)).toBeLessThanOrEqual(20);
  else expect(p.maxZoom).toBeLessThanOrEqual(10);
 }
 expect(lineVisibleAtZoom(null,8)).toBe(false);expect(lineVisibleAtZoom({},8)).toBe(false);
 expect(LINE_STROKE.cap).toBe('butt');
});
it('presents the treaty administrative sector distinctly with the published bilingual text and official source locators',()=>{
 const border=MAP_LINES.find(x=>x.id==='jordan-border')!,admin=MAP_LINES.find(x=>x.id==='jordan-1967-admin')!;
 expect(admin.dash).not.toBe(border.dash);expect(border.quotes?.[0].en).toBe(treaty.jordanArticle3_2.en);expect(admin.quotes?.[0].he).toBe(treaty.jordanAnnex1a2A7.he);
 expect(admin.quotes?.[0].en).toContain('Any treatment of this line shall be without prejudice to the status of the territory.');
 expect(admin.sources.some(([,u])=>u===treaty.sources.mfaAnnexEnglish)).toBe(true);
 expect(MAP_LINES.every(x=>x.detailHe&&x.uncertaintyHe&&x.uncertaintyEn)).toBe(true);
 expect(mapLineSourceLabel('OSM · Israel relation','he')).toBe('OSM · יחס ישראל');
});
it('draws only the Blue Line ways checked against the actual 2000 withdrawal map',()=>{
 const check=JSON.parse(readFileSync('data/raw/map-lines/blue-line-check.json','utf8'));
 const ways=fs.filter(f=>f.properties?.layer==='blue-line').map(f=>f.properties?.osmWay).sort();
 expect(ways).toEqual([...check.acceptedWays].sort());expect(ways).toHaveLength(49);
 expect(check.excludedWays).toContain(1188316285);expect(check.accepted_max_m).toBeLessThan(200);
});
