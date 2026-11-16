# One outline per CBS locality code, for the Localities map's "Vote mix" view.
# Input: the retained CBS 2022 statistical areas (ESRI JSON, ITM/EPSG:2039, 25 m server generalisation, field
# SEMEL_YISHUV), data/raw/map-outlines/cbs-statistical-areas-2022-25m-{a,b}.json (see data/raw/SOURCES.json).
# Areas are joined per locality code with a 12 m close (buffer +12/-12, mitre) that removes slivers between them,
# simplified by 12.5 m, reprojected to WGS84 at 5 decimals. Not legal municipal borders: CBS says the layer follows
# the Interior Ministry's 2021 continuous boundaries. CBS open-use licence v2.1; the map credits CBS.
# Needs shapely 2.2 and pyproj 3.8:  python3 scripts/build-locality-outlines.py
import json, pathlib
from shapely.geometry import Polygon, LinearRing, mapping
from shapely.ops import unary_union, transform
from shapely import make_valid, set_precision
from pyproj import Transformer

src = pathlib.Path('data/raw/map-outlines')
out = pathlib.Path('public/data/locality-outlines-2022.geojson')
feats = []
for part in 'ab':
    feats += json.load(open(src / f'cbs-statistical-areas-2022-25m-{part}.json'))['content']['features']

def rings_to_poly(rings):
    # ESRI: clockwise = outer, counter-clockwise = hole
    outers, holes = [], []
    for r in rings:
        if len(r) < 4: continue
        (holes if LinearRing(r).is_ccw else outers).append(r)
    polys = [make_valid(Polygon(o)) for o in outers]
    for h in holes:
        hp = Polygon(h)
        for i, p in enumerate(polys):
            if p.contains(hp.representative_point()):
                polys[i] = p.difference(make_valid(hp)); break
    return unary_union([make_valid(p) for p in polys])

by = {}
for f in feats:
    g = f.get('geometry')
    if not g or not g.get('rings'): continue
    by.setdefault(f['attributes']['SEMEL_YISHUV'], []).append(rings_to_poly(g['rings']))
T = Transformer.from_crs(2039, 4326, always_xy=True)
fc = {'type': 'FeatureCollection', 'features': []}
for c, ps in sorted(by.items()):
    u = make_valid(unary_union([p.buffer(12, join_style=2) for p in ps])).buffer(-12, join_style=2)
    area = u.area
    u = u.simplify(12.5, preserve_topology=True)
    w = transform(lambda x, y, z=None: T.transform(x, y), u)
    w = make_valid(set_precision(make_valid(w), 0.00001, mode='pointwise'))
    if w.geom_type == 'GeometryCollection':
        w = unary_union([g for g in w.geoms if g.geom_type in ('Polygon', 'MultiPolygon')])
    if w.is_empty: continue
    fc['features'].append({'type': 'Feature', 'properties': {'code': c, 'km2': round(area / 1e6, 3)}, 'geometry': mapping(w)})
out.write_text(json.dumps(fc, separators=(',', ':')))
print('localities', len(fc['features']), 'bytes', out.stat().st_size)
