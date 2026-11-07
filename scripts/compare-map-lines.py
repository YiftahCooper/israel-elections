import sys,json
from shapely.geometry import shape,box,LineString
import shapely
from shapely import STRtree
import numpy as np
from shapely.ops import transform,unary_union
from pyproj import Transformer
p=Transformer.from_crs(4326,32636,always_xy=True).transform
read=lambda f:json.load(open(f))['features']
union=lambda fs:unary_union([shape(f['geometry']) for f in fs])
un=read('data/raw/map-lines/un-world-region.geojson');ne=read('data/raw/map-lines/natural-earth-region.geojson')
def hausdorff(a,b):
 def directed(a,b):
  parts=list(b.geoms) if b.geom_type=='MultiLineString' else [b]
  segments=[LineString([c[i],c[i+1]]) for g in parts for c in [list(g.coords)] for i in range(len(c)-1)]
  pts=shapely.points(shapely.get_coordinates(a.segmentize(10)))
  _,dist=STRtree(segments).query_nearest(pts,return_distance=True,all_matches=False)
  return float(np.max(dist))
 return max(directed(a,b),directed(b,a))
records=[]
for name,code in [('egypt','EGY_ISR'),('jordan','ISR_JOR'),('blue','ISR_LBN'),('gaza','ISR_PSE')]:
 a=union(read('data/raw/map-lines/osm-'+name+'.geojson'));b=union([f for f in un if f['properties']['iso3cd']==code])
 if name=='gaza':b=b.intersection(box(34,31,34.7,31.7))
 if name=='blue':clip=box(35,32,35.6,34);a=a.intersection(clip);b=b.intersection(clip)
 aa=transform(p,a);bb=transform(p,b);d=hausdorff(aa,bb);print(name,'UN',d);records.append(dict(layer=name,comparison='UN 1:1m',max_m=d,sampling_m=10,scope='Common western sector, longitude <=35.6' if name=='blue' else 'Israel–Gaza land boundary only' if name=='gaza' else 'Full Israel–Egypt land boundary' if name=='egypt' else 'Matching full frontier; Golan–Jordan excluded'))
 if name in ['egypt','jordan']:
  candidates=[f for f in ne if f['properties']['FEATURECLA']=='International boundary (verify)' and ((name=='egypt' and shape(f['geometry']).bounds[0]<34.5 and shape(f['geometry']).bounds[1]<30) or (name=='jordan' and shape(f['geometry']).bounds[0]>34.9 and shape(f['geometry']).bounds[2]<35.7 and shape(f['geometry']).bounds[3]<32.8))]
  b=union(candidates);d=hausdorff(aa,transform(p,b));print(name,'NE',d);records.append(dict(layer=name,comparison='Natural Earth 1:10m',max_m=d,sampling_m=10,scope='Full source extents; includes coarse endpoints'))
a=union(read('data/raw/map-lines/osm-golan-a.geojson'));b=union([f for f in ne if f['properties']['NAME']=='Ceasefire Lines 1974']);clip=box(35,32.75,36,33.3);d=hausdorff(transform(p,a.intersection(clip)),transform(p,b.intersection(clip)));print('alpha NE',d);records.append(dict(layer='golan-alpha',comparison='Natural Earth 1974 line 1:10m',max_m=d,sampling_m=10,scope='Common latitude 32.75–33.3; differing northern extensions excluded'))
json.dump(records,open('data/raw/map-lines/comparisons.json','w'),indent=2)
