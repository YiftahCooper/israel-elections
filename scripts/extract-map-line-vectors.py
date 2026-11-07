"""Extract identified native UN paths without tracing or interpolated joins.
Reproduce checks first with check-map-line-sources.py; source precision is retained.
"""
import json
from pathlib import Path
import numpy as np,pymupdf
from pyproj import Transformer
from shapely.geometry import LineString,Polygon,mapping
from shapely.ops import split
R=Path('data/raw/map-lines');read=lambda f:json.load(open(R/f))
inv=Transformer.from_crs(32636,4326,always_xy=True).transform;g=Transformer.from_crs(28191,4326,always_xy=True).transform
def vertices(path):
 assert all(i[0]=='l' for i in path['items'])
 assert all(np.linalg.norm(np.array(a[2])-np.array(b[1]))<.001 for a,b in zip(path['items'],path['items'][1:]))
 return [tuple(path['items'][0][1])]+[tuple(i[2]) for i in path['items']]
b=pymupdf.open(R/'scans/withdrawal-line-4143-r1-jul00.pdf')[0].get_drawings()[133]
assert np.allclose(b['color'],[0,.4484,.7079],atol=.002)
blue=[inv(700000+(x-143.8784)*10000/88.8646,3700000-(y-115.8597)*10000/88.8715) for x,y in vertices(b)]
a=read('alpha-line-check.json');cx=a['xFit'];cy=a['yFit'];ds=pymupdf.open(R/'scans/undof-2916-r143-sep26.pdf')[0].get_drawings()
xy=lambda p:g(np.polyval(cx,p[0]),np.polyval(cy,p[1]))
assert np.allclose(ds[900]['fill'],[1,1,1])
assert all(np.allclose(ds[i]['color'],[.365,.596,.788],atol=.002) for i in range(1742,1749))
alpha=LineString(vertices(ds[1742]));area=Polygon(vertices(ds[900]));assert area.is_valid
# The source Alpha enters the source fill at both ends; split identifies the
# Quneitra A/A-1 sliver separately from the main Alpha-to-Bravo area.
parts=split(area,alpha)
separation=max(parts.geoms,key=lambda p:p.area)
# B(3) of the 1974 agreement is A-to-B. The white source fill also includes
# the A/A-1 no-military strip (paragraph C). Exact source-path intersections
# remove that 1.8 km² strip. No new connecting stroke is introduced.
assert 16980<separation.area<16985
assert separation.is_valid and not separation.interiors

features=[dict(type='Feature',properties=dict(layer='blue-line',source='UN 4143 Rev.1 July 2000, native withdrawal-line path 133',sourceDate='2000-07',uncertaintyM=200),geometry=mapping(LineString(blue)))]
for i,layer in [(1742,'golan-alpha')]+[(i,'golan-bravo') for i in range(1743,1749)]:
 features.append(dict(type='Feature',properties=dict(layer=layer,source=f'UNDOF 2916 Rev.143 September 2026, native path {i}',sourceDate='2026-09',uncertaintyM=210),geometry=mapping(LineString([xy(p) for p in vertices(ds[i])]))))
features.append(dict(type='Feature',properties=dict(layer='golan-separation',source='UNDOF 2916 Rev.143 native fill 900 split by Alpha 1742; A/A-1 strip excluded under agreement B(3)/C',sourceDate='2026-09',uncertaintyM=210),geometry=mapping(Polygon([xy(p) for p in separation.exterior.coords]))))
record=dict(sourceFillPath=900,alphaPath=1742,bravoPaths=list(range(1743,1749)),operation='Exact planar source-path split; largest resulting polygon, excluding the Quneitra A/A-1 strip and subpixel stroke slivers',sourceFillAreaPt2=area.area,separationAreaPt2=separation.area,discardedAreaPt2=area.area-separation.area,uncertaintyM=210,registration='alpha-line-check.json',agreement='S/11302/Add.1 Annex A B(3), C',joins='Native Bravo pieces retained separately; no interpolated connectors')
(R/'undof-area-check.json').write_text(json.dumps(record,indent=2)+'\n')
(R/'un-native-lines.geojson').write_text(json.dumps(dict(type='FeatureCollection',features=features),separators=(',',':'))+'\n')
