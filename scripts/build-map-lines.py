"""Build the versioned cartographic overlays from retained source inputs; no network.

Jerusalem is corrected from UN229 with a similarity registration. Blue/Golan use native UN PDF paths; other coordinates remain OSM. Grid cuts/coverage limits do not create treaty boundaries.
"""
import json, math
from pathlib import Path
from pyproj import Transformer
from shapely.geometry import shape, mapping, LineString, Polygon, box, Point
from shapely.ops import polygonize, unary_union, transform

ROOT = Path('data/raw/map-lines')
read = lambda f: json.loads(Path(f).read_text())
project = Transformer.from_crs(4326, 32636, always_xy=True).transform
unproject = Transformer.from_crs(32636, 4326, always_xy=True).transform
to_grid = Transformer.from_crs(4326, 28191, always_xy=True).transform
from_grid = Transformer.from_crs(28191, 4326, always_xy=True).transform
registration = read(ROOT/'jerusalem-registration.json')
a,b,tx,ty = registration['similarity']
pixel = lambda xy: unproject(a*xy[0]+b*xy[1]+tx, b*xy[0]-a*xy[1]+ty)
traces = read(ROOT/'jerusalem-un229-traces.json')
israeli = LineString([pixel(p) for p in traces['israeli']])
jordanian = LineString([pixel(p) for p in traces['jordanian']])
coverage = Polygon([pixel(p) for p in [(93,229),(970,229),(970,1267),(93,1267)]])
# A horizontal source-image edge closes a fill only; it is never drawn as an agreed front line.
jerusalem_gap = Polygon(list(israeli.coords)+list(jordanian.coords)[::-1])
assert jerusalem_gap.is_valid
north_of_130 = transform(from_grid, box(140000,130000,200000,200000).segmentize(500))
band_128_130 = transform(from_grid, box(140000,128000,200000,130000).segmentize(500))

green = read(ROOT/'osm-green.geojson')['features']
polys = list(polygonize(unary_union([shape(f['geometry']) for f in green])))
scopus = next(p for p in polys if p.centroid.y>31.78 and p.centroid.x>35.23)
jerusalem = next(p for p in polys if p!=scopus and p.centroid.x>35.17)
latrun = next(p for p in polys if p!=scopus and p!=jerusalem)
govt = jerusalem.intersection(band_128_130)
features = []
ramadin_check=read(ROOT/'signed-map-check.json')
splice=ramadin_check['ramadinSplice']
west_anchor=tuple(splice['westAnchor']);east_anchor=tuple(splice['eastAnchor'])

def add(layer, geom, source, way=None, uncertainty=922, max_zoom=None, **extra):
    if geom.is_empty: return
    if geom.geom_type.startswith('Multi') or geom.geom_type=='GeometryCollection':
        for g in geom.geoms: add(layer,g,source,way,uncertainty,max_zoom,**extra)
        return
    if geom.geom_type not in ['LineString','Polygon']: return
    if max_zoom is None:
        max_zoom = math.floor(math.log2(156543.03392*math.cos(math.radians(34))*20/uncertainty))
    features.append(dict(type='Feature',properties=dict(layer=layer,source=source,snapshot='2026-11-07',osmWay=way,
        uncertaintyM=uncertainty,maxZoom=max_zoom,**extra),geometry=mapping(geom)))

for f in green:
    g = shape(f['geometry'])
    if g.difference(scopus.boundary).length<1e-10: continue
    # Remove the unverified central OSM pair; keep the independent zone overlay separate.
    way=f['properties']['way']
    if way in splice['removedWays']: continue
    if way==splice['westWay']:
        cs=list(g.coords);assert west_anchor in cs
        g=LineString(cs[cs.index(west_anchor):])
    g = g.difference(coverage)
    # Discard a one-metre extraction stub, never erase the zone’s armistice edges.
    if transform(project,g).length<2: continue
    add('green-line',g,'OSM relation 7304999; UN229 covers central Jerusalem only',f['properties']['way'])
# Exact topology at published OpenStreetMap vertices. Keep the accepted OCHA
# stroke and document the short cartographic transitions; never call them surveys.
ramadin=box(*ramadin_check['ramadinReplacementBox'])
for f in read(ROOT/'ocha-green.geojson')['features']:
    g=shape(f['geometry']).intersection(ramadin)
    if g.is_empty: continue
    assert g.geom_type=='LineString'
    cs=list(g.coords)
    if cs[0][0]>cs[-1][0]: cs.reverse()
    joins=[Point(project(*west_anchor)).distance(Point(project(*cs[0]))),Point(project(*east_anchor)).distance(Point(project(*cs[-1])))]
    assert max(joins)<400
    add('green-line',LineString([west_anchor,*cs,east_anchor]),'OCHA; signed 1949 Map1 Ramadin tie-break; exact OpenStreetMap-node cartographic splice',uncertainty=922,sourceDate='2026-11-07',ramadinJoinsM=joins,joinStatus='cartographic source splice, not surveyed treaty coordinates')
for side,line in [('Israeli',israeli),('Jordanian',jordanian)]:
    add('green-line',line,'UN map 229 (Nov 1949), seven-control similarity digitization',uncertainty=60,side=side)
add('no-mans-land',latrun,'OSM paired lines; undocumented eastern cartographic closure',uncertainty=740,closure='OSM cartographic closure, not an agreed eastern boundary')
add('no-mans-land',jerusalem_gap.intersection(north_of_130),'UN229 paired line centres; fill ends at source coverage and grid 130',uncertainty=60,closure='source coverage edge, not an agreed boundary')
add('govt-house-zone',govt,'OSM outlines clipped at Palestine-grid northings 128000/130000; Frid pp.470–473',uncertainty=None,max_zoom=10,gridSouth=128000,gridNorth=130000)
# Preserve only the northern OSM arc. No unsourced internal division or closing chord.
cs=list(scopus.exterior.coords)
add('scopus',LineString(cs[12:]),'OSM northern outline; Israel State Archives / MFA status; southern Augusta Victoria portion omitted',uncertainty=None,max_zoom=10,outlineStatus='partial; internal division not drawn')

for layer,file,u in [('gaza-perimeter','osm-gaza.geojson',922),('egypt-border','osm-egypt.geojson',360)]:
    for f in read(ROOT/file)['features']:
        add(layer,shape(f['geometry']),'OSM '+file+'; retained UN comparison',f['properties'].get('way',f['properties'].get('id')),u)

# The treaty asks for a distinct presentation of the line with the 1967 territory.
# Source country tags identify the sector; short untagged river joins are within it.
for f in read(ROOT/'osm-jordan.geojson')['features']:
    way=f['properties']['way'];g=shape(f['geometry']);tags=f['properties']['tags']
    if way in [1193372980,996965114]: continue  # East of the 1949 Syria/Yarmouk junction.
    if way==733999333: g=g.intersection(box(34,29,35.63141,34))
    admin=('Palestin' in str(tags) or 'فلسطين' in str(tags) or way==41850129)
    add('jordan-1967-admin' if admin else 'jordan-border',g,'OSM relation 184818; 1994 treaty Article 3 / Annex I(a)',way,763)

# Explicitly identified UN PDF paths, with their source dates and scale bounds.
for f in read(ROOT/'un-native-lines.geojson')['features']:
    p=f['properties']
    add(p['layer'],shape(f['geometry']),p['source'],uncertainty=p['uncertaintyM'],max_zoom=11 if p['layer'].startswith('golan-') else None,sourceDate=p['sourceDate'])
Path('public/data/map-lines.geojson').write_text(json.dumps(dict(type='FeatureCollection',features=features),ensure_ascii=False,separators=(',',':'))+'\n')
print('features',len(features),'layers',sorted(set(f['properties']['layer'] for f in features)))
