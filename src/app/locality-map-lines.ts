import * as Leaflet from 'leaflet';
import type {FeatureCollection} from 'geojson';
import {MAP_LINES} from './locality-map-line-catalogue.ts';
import {LINE_STROKE,lineVisibleAtZoom} from './locality-map-line-policy.ts';
export {MAP_LINES,MAP_LINE_SNAPSHOT,mapLineSourceLabel} from './locality-map-line-catalogue.ts';

/** Each category owns its paths. Scale limits never affect locality dots or names. */
export function drawMapLines(map:Leaflet.Map,data:FeatureCollection,enabled:ReadonlySet<string>,dark:boolean,onHidden?:(count:number)=>void) {
  if(!map.getPane('verified-lines')){const pane=map.createPane('verified-lines');pane.style.zIndex='350';pane.style.pointerEvents='none';}
  const renderer=Leaflet.svg({pane:'verified-lines'}).addTo(map);
  const svg=map.getPane('verified-lines')!.querySelector('svg')!,ns='http://www.w3.org/2000/svg';
  const defs=document.createElementNS(ns,'defs');
  const patterns=new Map<string,string>();
  for(const line of MAP_LINES.filter(x=>x.fill)){
    const pattern=document.createElementNS(ns,'pattern'),path=document.createElementNS(ns,'path');
    const id=`map-hatch-${Leaflet.stamp(renderer)}-${line.id}`,cross=line.fill==='cross',size=cross?14:8;
    pattern.setAttribute('id',id);pattern.setAttribute('patternUnits','userSpaceOnUse');pattern.setAttribute('width',String(size));pattern.setAttribute('height',String(size));
    path.setAttribute('d',cross?'M0 0L14 14 M0 14L14 0':'M-2 2L2-2 M0 8L8 0 M6 10L10 6');
    path.setAttribute('stroke',dark?line.dark:line.color);path.setAttribute('stroke-width',String(LINE_STROKE.hatchWidth));path.setAttribute('stroke-linecap',LINE_STROKE.cap);
    pattern.append(path);defs.append(pattern);patterns.set(line.id,id);
  }
  svg.prepend(defs);
  let layers:Leaflet.GeoJSON[]=[];
  const draw=()=>{
    layers.forEach(layer=>layer.remove());
    const z=map.getZoom();let hidden=0;
    layers=MAP_LINES.filter(x=>enabled.has(x.id)).map(line=>{
      const own=data.features.filter(f=>f.properties?.layer===line.id);
      if(own.some(f=>!lineVisibleAtZoom(f.properties,z)))hidden++;
      const visible:FeatureCollection={type:'FeatureCollection',features:own.filter(f=>lineVisibleAtZoom(f.properties,z))};
      return Leaflet.geoJSON(visible,{
        pane:'verified-lines',interactive:false,
        style:{renderer,pane:'verified-lines',color:dark?line.dark:line.color,weight:line.fill?0:LINE_STROKE.width,
          lineCap:LINE_STROKE.cap,opacity:1,dashArray:line.dash||undefined,fill:!!line.fill,
          fillColor:line.fill?`url(#${patterns.get(line.id)})`:undefined,fillOpacity:1},
      }).addTo(map);
    });
    onHidden?.(hidden);
  };
  draw();map.on('zoomend',draw);
  return ()=>{map.off('zoomend',draw);layers.forEach(layer=>layer.remove());renderer.remove();};
}
