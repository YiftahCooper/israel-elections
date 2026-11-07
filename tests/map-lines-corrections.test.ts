import {lineVisibleAtZoom} from '../src/app/locality-map-line-policy';
import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import type {Feature,FeatureCollection,Position} from 'geojson';
const features=(JSON.parse(readFileSync('public/data/map-lines.geojson','utf8')) as FeatureCollection).features;
const layer=(id:string)=>features.filter(f=>f.properties?.layer===id);
const inside=(point:Position,feature:Feature)=>{
  if(feature.geometry.type!=='Polygon')return false;
  const ring=feature.geometry.coordinates[0];let yes=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const [x,y]=ring[i],[px,py]=ring[j];
    if((y>point[1])!==(py>point[1])&&point[0]<(px-x)*(point[1]-y)/(py-y)+x)yes=!yes;
  }return yes;
};
const crossings=(id:string,lat:number)=>layer(id).flatMap(f=>{
  if(f.geometry.type!=='LineString')return [];
  const c=f.geometry.coordinates;return c.slice(1).flatMap((b,i)=>{
    const a=c[i];if((a[1]>lat)===(b[1]>lat))return [];
    return [a[0]+(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])];
  });
});
it('identifies Government House separately from no-man’s-land with Palestine-grid 128/130 limits',()=>{
  const point=[35.2368,31.7544];expect(layer('govt-house-zone').some(f=>inside(point,f))).toBe(true);
  expect(layer('no-mans-land').some(f=>inside(point,f))).toBe(false);
  const fs=layer('govt-house-zone');expect(fs).toHaveLength(1);
  if(fs[0].geometry.type==='Polygon'){
    const lats=fs[0].geometry.coordinates[0].map(c=>c[1]);
    expect(Math.min(...lats)).toBeGreaterThan(31.7443);expect(Math.min(...lats)).toBeLessThan(31.7449);
    expect(Math.max(...lats)).toBeGreaterThan(31.7624);expect(Math.max(...lats)).toBeLessThan(31.7630);
  }
});
it('preserves the UN229 Abu Tor gap and north Jerusalem pairing through raster coverage',()=>{
  const x=crossings('green-line',31.7694).filter(lon=>lon>35.228&&lon<35.238).sort((a,b)=>a-b);
  expect(x).toHaveLength(2);const metres=(x[1]-x[0])*111320*Math.cos(31.7694*Math.PI/180);
  expect(metres).toBeGreaterThan(240);expect(metres).toBeLessThan(310);
  const north=crossings('green-line',31.7994).filter(lon=>lon>35.22&&lon<35.23).sort((a,b)=>a-b);
  expect(north).toHaveLength(2);expect(layer('no-mans-land').some(f=>inside([(north[0]+north[1])/2,31.7994],f))).toBe(true);
});
it('distinguishes the 1967 administrative sector and excludes Hamat Gader east of the 1949 Syrian junction',()=>{
  expect(crossings('jordan-1967-admin',31.8)).toHaveLength(1);
  expect(crossings('jordan-border',31.8)).toHaveLength(0);
  for(const f of layer('jordan-border')) if(f.geometry.type==='LineString')for(const c of f.geometry.coordinates)if(c[1]>32.67)expect(c[0]).toBeLessThanOrEqual(35.6315);
});
it('does not enclose Augusta Victoria in the Israeli Scopus fragment or invent an internal division',()=>{
  const fs=layer('scopus');expect(fs).toHaveLength(1);
  expect(fs[0].properties?.outlineStatus).toBe('partial; internal division not drawn');
  if(fs[0].geometry.type==='LineString'){
    expect(fs[0].geometry.coordinates.every(c=>c[1]>31.7893)).toBe(true);
    expect(fs[0].geometry.coordinates[0]).not.toEqual(fs[0].geometry.coordinates.at(-1));
  }
});

it('keeps both Government House armistice edges throughout every permitted zoom, independently of the fill',()=>{
  for(let zoom=3;zoom<=15;zoom++){
    const edges=layer('green-line').filter(f=>[288825225,1042593026].includes(f.properties?.osmWay));
    expect(edges).toHaveLength(2);
    for(const f of edges){
      expect(f.properties?.maxZoom).toBe(11);
      // Every latitude in the former 2km hole crosses a retained source edge.
      if(f.geometry.type==='LineString')for(let lat=31.745;lat<31.761;lat+=.0005){
        const c=f.geometry.coordinates;
        expect(c.some((p,i)=>i>0&&(p[1]>lat)!==(c[i-1][1]>lat))).toBe(true);
      }
      expect(lineVisibleAtZoom(f.properties,zoom)).toBe(zoom<=11);
    }
  }
});

it('joins the Ramadin replacement exactly to both retained source ways at every allowed zoom',()=>{
 const replacement=layer('green-line').filter(f=>f.properties?.source.startsWith('OCHA;'));
 expect(replacement).toHaveLength(1);
 const f=replacement[0];expect(f.geometry.type).toBe('LineString');
 if(f.geometry.type!=='LineString')return;
 const ends=[f.geometry.coordinates[0],f.geometry.coordinates.at(-1)!];
 expect(ends).toEqual([[34.909792,31.3563778],[34.9503931,31.3480643]]);
 for(let zoom=3;zoom<=15;zoom++){
  const visible=lineVisibleAtZoom(f.properties,zoom);expect(visible).toBe(zoom<=11);
  for(const end of ends){
   const neighbours=layer('green-line').filter(other=>other!==f&&other.geometry.type==='LineString'&&[other.geometry.coordinates[0],other.geometry.coordinates.at(-1)!].some(c=>c[0]===end[0]&&c[1]===end[1]));
   expect(neighbours).toHaveLength(1);
   expect(lineVisibleAtZoom(neighbours[0].properties,zoom)).toBe(visible);
  }
 }
 expect(layer('green-line').some(f=>[95258528,95258529].includes(f.properties?.osmWay))).toBe(false);
});
