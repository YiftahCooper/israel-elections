# Build the retained map geometry. Requires shapely 2.2.0; no network access.
# Run from repository root with the requirements recorded in docs/research/map-lines.md.
import json,sys
from shapely.geometry import shape,mapping
from shapely.ops import polygonize,unary_union
from pathlib import Path
read=lambda f:json.load(open(f))
green=read('data/raw/map-lines/osm-green.geojson')['features']
polys=list(polygonize(unary_union([shape(f['geometry']) for f in green])))
scopus=next(p for p in polys if p.centroid.y>31.78 and p.centroid.x>35.23)
features=[]
def add(id,geom,source,way=None):
 features.append({'type':'Feature','properties':{'layer':id,'source':source,'snapshot':'2026-11-07','osmWay':way},'geometry':geom})
for f in green:
 g=shape(f['geometry'])
 # Extract the closed Mount Scopus loop without copying it into two line layers.
 if g.difference(scopus.boundary).length<1e-10:continue
 add('green-line',f['geometry'],'OSM relation 7304999',f['properties']['way'])
add('scopus',mapping(scopus.boundary),'OSM relation 7304999; UN 1949 armistice maps')
for poly in polys:
 if poly!=scopus:add('no-mans-land',mapping(poly),'Closed paired armistice lines in OSM relation 7304999')
for id,file,source in [('gaza-perimeter','data/raw/map-lines/osm-gaza.geojson','OSM relation 1473938'),('egypt-border','data/raw/map-lines/osm-egypt.geojson','OSM relation 1473946; UN international-boundary cross-check'),('jordan-border','data/raw/map-lines/osm-jordan.geojson','OSM relation 184818; UN international-boundary cross-check'),('blue-line','data/raw/map-lines/osm-blue.geojson','OSM name:UN=UN 2000 Blue Line; UNIFIL March 2026'),('golan-alpha','data/raw/map-lines/osm-golan-a.geojson','OSM alt_name=A-Line; UNDOF March 2024')]:
 for f in read(file)['features']:add(id,f['geometry'],source,f['properties'].get('way',f['properties'].get('id')))
Path('public/data/map-lines.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False,separators=(',',':'))+'\n')
print('features',len(features),'layers',sorted(set(f['properties']['layer'] for f in features)))
