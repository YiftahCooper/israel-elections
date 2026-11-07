# Continuous >100m line discrepancy audit and cropped figures.
# Dependencies and output-selection step: docs/research/map-lines.md.
import json,sys,os
from shapely.geometry import shape,Point,MultiPoint,LineString
from shapely.ops import unary_union,transform
from pyproj import Transformer
import numpy as np
from pathlib import Path
p=Transformer.from_crs(4326,32636,always_xy=True).transform
inv=Transformer.from_crs(32636,4326,always_xy=True).transform
Path('.backup-scratch/v4').mkdir(parents=True,exist_ok=True)
read=lambda f:json.load(open(f))
a=read('data/raw/map-lines/ocha-green.geojson');b=read('data/raw/map-lines/osm-green.geojson')
for region in ['West Bank','Gaza Strip']:
 aa=[f for f in a['features'] if f['properties']['nm4']==region or region=='West Bank' and f['properties']['nm4']=="No Man's Land"]
 bb=b['features'] if region=='West Bank' else read('data/raw/map-lines/osm-gaza.geojson')['features']
 ag=unary_union([transform(p,shape(f['geometry'])) for f in aa]);bg=unary_union([transform(p,shape(f['geometry'])) for f in bb]);bad=[]
 for direction,fs,other in [('OCHA to OSM',aa,bg),('OSM to OCHA',bb,ag)]:
  exclusion=other.buffer(100,quad_segs=64)
  for f in fs:
   g=transform(p,shape(f['geometry']))
   # Buffer arc sagitta at 100m / 64 quadrants is <0.008m. Include whole clipped intervals.
   outside=g.difference(exclusion)
   parts=list(outside.geoms) if hasattr(outside,'geoms') else [outside]
   for line in parts:
    if line.is_empty or line.length==0:continue
    current=[]
    for x,y in line.segmentize(10).coords:
     pt=Point(x,y);current.append((pt.x,pt.y,pt.distance(other)))
    bad.append((direction,current))
 # Group geographically connected stretches (within 150m; retains exact >100m samples).
 clusters=[]
 for direction,pts in bad:
  geo=LineString([(x,y) for x,y,d in pts]) if len(pts)>1 else Point(pts[0][:2]);matches=[c for c in clusters if c['geo'].distance(geo)<150]
  if matches:
   c=matches[0];c['parts'].append((direction,pts));c['geo']=unary_union([c['geo'],geo])
   for m in matches[1:]:c['parts']+=m['parts'];c['geo']=unary_union([c['geo'],m['geo']]);clusters.remove(m)
  else:clusters.append(dict(geo=geo,parts=[(direction,pts)]))
 result=[]
 for i,c in enumerate(sorted(clusters,key=lambda c:c['geo'].centroid.y,reverse=True)):
  pts=[p for d,ps in c['parts'] for p in ps];worst=max(pts,key=lambda p:p[2]);bounds=transform(inv,c['geo']).bounds
  result.append(dict(id=i+1,bbox=list(bounds),max_m=worst[2],worst=list(inv(*worst[:2])),directions=list(set(d for d,ps in c['parts'])),samples=len(pts),pieces=[dict(direction=d,start=list(inv(*ps[0][:2])),end=list(inv(*ps[-1][:2])),max_m=max(p[2] for p in ps)) for d,ps in c['parts']]))
 Path(f'.backup-scratch/v4/{region}-stretches.json').write_text(json.dumps(result,indent=2))
 print(region,len(result))
 for c in result:print(c)
 # Cropped source comparison plots; retained final selected figures later.
 import matplotlib;matplotlib.use('Agg')
 import matplotlib.pyplot as plt
 for c in (result if os.environ.get('MAP_LINE_PLOTS')!='0' else []):
  x0,y0,x1,y1=c['bbox'];pad=max(.003,(x1-x0)*.12,(y1-y0)*.12);fig,ax=plt.subplots(figsize=(7,6))
  for fs,color,label in [(aa,'#168247','OCHA GreenLine'),(bb,'#8c39b3','OSM candidate')]:
   for j,f in enumerate(fs):
    xy=f['geometry']['coordinates'];ax.plot([p[0] for p in xy],[p[1] for p in xy],color=color,label=label if j==0 else None,linewidth=1.4)
  ax.set(xlim=(x0-pad,x1+pad),ylim=(y0-pad,y1+pad),xlabel='Longitude (WGS84)',ylabel='Latitude (WGS84)',title=f'{"Judea and Samaria" if region=="West Bank" else region} stretch {c["id"]}: max {c["max_m"]:.1f} m')
  ax.set_aspect(1/np.cos(np.radians((y0+y1)/2)));ax.legend();ax.grid(alpha=.2);fig.tight_layout();fig.savefig(f'.backup-scratch/v4/{region}-{c["id"]}.png',dpi=150);plt.close(fig)
