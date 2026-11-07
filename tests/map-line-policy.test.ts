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
 expect(mapLineSourceLabel('OpenStreetMap · Israel relation','he')).toBe('OpenStreetMap · יחס ישראל');
});
it('uses the complete native UN withdrawal line, including Har Dov and Margaliot',()=>{
 const blue=fs.filter(f=>f.properties?.layer==='blue-line');expect(blue).toHaveLength(1);
 const check=JSON.parse(readFileSync('data/raw/map-lines/blue-line-check.json','utf8'));
 expect(blue[0].properties?.source).toContain('path 133');expect(blue[0].properties?.sourceDate).toBe('2000-07');
 if(blue[0].geometry.type==='LineString'){
  expect(blue[0].geometry.coordinates).toHaveLength(check.points_utm.length);
  expect(Math.max(...blue[0].geometry.coordinates.map(c=>c[0]))).toBeGreaterThan(35.81);
 }
});
it('pins the official Hebrew Annex wording against the retained government scan, PDF index 17',()=>{
 expect(treaty.jordanAnnex1a2A7.he).toBe('מפות האורתופוטו ומפות ההדמאה המראות את הקו המפריד בין ירדן לבין הגדה המערבית יכללו את הקו המצויין בצורה גרפית שונה, והמקרא יכלול את ההערה המסייגת הבאה: ״קו זה הוא הגבול המינהלי בין ירדן לבין השטח שבא לשליטת הממשל הצבאי הישראלי ב-1967 כל טיפול בקו זה יהיה בלא קביעה מוקדמת באשר למעמד שטח זה״.');
});
it('keeps the Quneitra Alpha–Alpha-1 strip outside the A-to-B separation area',()=>{
 const area=fs.find(f=>f.properties?.layer==='golan-separation')!;
 expect(area.geometry.type).toBe('Polygon');expect(area.properties?.source).toContain('A/A-1 strip excluded');
 // Interior of the separately printed Quneitra A/A-1 strip, from UN2916.
 if(area.geometry.type==='Polygon'){
  const [x,y]=[35.81182016,33.11959077],ring=area.geometry.coordinates[0];let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
   const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  expect(inside).toBe(false);
 }

 const record=JSON.parse(readFileSync('data/raw/map-lines/undof-area-check.json','utf8'));
 expect(record.sourceFillAreaPt2-record.separationAreaPt2).toBeGreaterThan(132);
 expect(record.sourceFillAreaPt2-record.separationAreaPt2).toBeLessThan(133);
 expect(fs.filter(f=>f.properties?.layer==='golan-bravo')).toHaveLength(6);
});
