"""Reproduce the V4R point-to-segment checks using retained UN PDFs (no network).
Plots are diagnostics in scratch. JSON is evidence, not a legal accuracy certificate.
"""
import json
from pathlib import Path
import numpy as np
import pymupdf
import shapely
from shapely.geometry import shape, LineString, box
from shapely.ops import transform, unary_union
from pyproj import Transformer
ROOT=Path('data/raw/map-lines'); OUT=Path('.backup-scratch/v4-fixes'); OUT.mkdir(parents=True,exist_ok=True)
read=lambda name:json.loads((ROOT/name).read_text())
write=lambda name,obj:(ROOT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
utm=Transformer.from_crs(4326,32636,always_xy=True).transform
inv=Transformer.from_crs(32636,4326,always_xy=True).transform
grid=Transformer.from_crs(28191,32636,always_xy=True).transform

def vertices(path):
    assert all(i[0]=='l' for i in path['items'])
    assert all(np.linalg.norm(np.array(a[2])-np.array(b[1]))<.001 for a,b in zip(path['items'],path['items'][1:]))
    return [tuple(path['items'][0][1])]+[tuple(i[2]) for i in path['items']]

def directed(a,b):
    pts=shapely.points(shapely.get_coordinates(a.segmentize(10)))
    # Tree of segments avoids quadratic whole-polyline comparisons.
    parts=list(b.geoms) if hasattr(b,'geoms') else [b]
    segs=[LineString([x,y]) for part in parts for x,y in zip(part.coords,list(part.coords)[1:])]
    indices,d=shapely.STRtree(segs).query_nearest(pts,return_distance=True,all_matches=False)
    i=int(np.argmax(d));point_index=int(indices[0,i])
    return float(d[i]),list(inv(*pts[point_index].coords[0])),len(pts)

def check_ways(file,line):
    rows=[]
    for f in read(file)['features']:
        way=f['properties'].get('way',f['properties'].get('id'))
        d,xy,n=directed(transform(utm,shape(f['geometry'])),line)
        rows.append(dict(way=way,max_m=d,worst=xy,samples=n))
    return rows

# UN 4143 Rev.1: native graticule intersections, UTM36N/WGS84 explicitly printed.
blue_pdf='scans/withdrawal-line-4143-r1-jul00.pdf'
bp=pymupdf.open(ROOT/blue_pdf)[0];path=bp.get_drawings()[133]
assert np.allclose(path['color'],[0,.4484,.7079],atol=.002)
controls=[[143.8784,115.8597,700000,3700000],[232.7430,115.8597,710000,3700000],[143.8784,204.7312,700000,3690000]]
blue_xy=lambda x,y:(700000+(x-143.8784)*10000/88.8646,3700000-(y-115.8597)*10000/88.8715)
blue=LineString([blue_xy(*p) for p in vertices(path)])
rows=check_ways('osm-blue.geojson',blue);accepted=[r['way'] for r in rows if r['max_m']<=200]
accepted_geometry=unary_union([transform(utm,shape(f['geometry'])) for f in read('osm-blue.geojson')['features'] if f['properties']['id'] in accepted])
reverse=directed(blue,accepted_geometry)
write('blue-line-check.json',dict(source='UN 4143 Rev.1 July 2000, native blue withdrawal-line path 133',pdf=str(ROOT/blue_pdf),pdf_controls=controls,points_utm=list(blue.coords),sampling_m=10,sampling_gap_bound_m=5,tolerance_m=200,perWay=rows,acceptedWays=accepted,excludedWays=[r['way'] for r in rows if r['way'] not in accepted],accepted_max_m=max(r['max_m'] for r in rows if r['way'] in accepted),unmatched_un_to_accepted_osm_max_m=reverse[0],limitations='Directed per-way compatibility at published map scale, not barrel identification. The reverse maximum includes intentionally omitted local sections and unequal eastern extents; the published line is partial. Pre-2000 CIA source tags do not establish Blue Line identity.'))

# UNDOF 2916 Rev.143: printed Palestine Belt Grid. Read the actual grey grid
# strokes at 3 px/pt, not nearby number-label centres (which are offset).
alpha_pdf='scans/undof-2916-r143-sep26.pdf';ap=pymupdf.open(ROOT/alpha_pdf)[0]
a=np.array(ap.get_pixmap(matrix=pymupdf.Matrix(3,3)).pil_image())[:,:,:3]
gray=(a.max(2)-a.min(2)<2)&(a[:,:,0]>150)&(a[:,:,0]<200)
def peaks(axis,guesses):
    v=gray[240:2190,130:1700].sum(axis=axis);offset=130 if axis==0 else 240
    return np.array([g-8+int(np.argmax(v[g-offset-8:g-offset+9])) for g in guesses])/3
x=peaks(0,[283,539,795,1051,1308,1564]);y=peaks(1,[387,644,900,1157,1413,1669,1926,2182])
e=np.arange(220000,280000,10000);n=np.arange(310000,230000,-10000)
cx=np.polyfit(x,e,1);cy=np.polyfit(y,n,1)
alpha_xy=lambda x,y:grid(np.polyval(cx,x),np.polyval(cy,y))
alpha_path=ap.get_drawings()[1742]
assert np.allclose(alpha_path['color'],[.365,.596,.788],atol=.002)
alpha=LineString([alpha_xy(*p) for p in vertices(alpha_path)])
alpha_rows=check_ways('osm-golan-a.geojson',alpha)
alpha_osm=unary_union([transform(utm,shape(f['geometry'])) for f in read('osm-golan-a.geojson')['features']])
rev=directed(alpha,alpha_osm)
write('alpha-line-check.json',dict(source='UNDOF map 2916 Rev.143, September 2026; native Alpha path 1742 (not Bravo or A-1)',pdf=str(ROOT/alpha_pdf),grid='Palestine Belt Grid EPSG:28191',gridControlsX=list(zip(x.tolist(),e.tolist())),gridControlsY=list(zip(y.tolist(),n.tolist())),xFit=cx.tolist(),yFit=cy.tolist(),gridFitResidualM=max(float(max(abs(np.polyval(cx,x)-e))),float(max(abs(np.polyval(cy,y)-n)))),sampling_m=10,sampling_gap_bound_m=5,perWay=alpha_rows,osm_to_un_max_m=max(r['max_m'] for r in alpha_rows),un_to_osm_max_m=rev[0],un_to_osm_worst=rev[1],limitations='Grid stroke registration residual about 49m; native UN stroke about157m wide. Source differences are not surveyed uncertainty. Native Alpha is visually identified as the west separation-area edge; Bravo/A-1 are separate paths. No current deployment claim.'))

# Dead Sea: compare the existing modern cartographic endpoint, without moving it
# to Article V(1)(d)'s point, which defines the separate southern sector.
clip=box(35.3,31.47,35.6,31.53)
def clipped(name,predicate=lambda f:True):return transform(utm,unary_union([shape(f['geometry']).intersection(clip) for f in read(name)['features'] if predicate(f)]))
dead=clipped('osm-green.geojson');ocha=clipped('ocha-green.geojson');un=clipped('un-world-region.geojson',lambda f:f['properties']['iso3cd']=='ISR_PSE')
endpoint=[35.476012,31.49312];p=shapely.Point(utm(*endpoint))
write('dead-sea-check.json',dict(scope='WGS84 box 35.3–35.6E,31.47–31.53N; modern cartography only',endpoint=endpoint,endpoint_to_un_m=p.distance(un),endpoint_to_ocha_m=p.distance(ocha),osm_ocha_max_m=max(directed(dead,ocha)[0],directed(ocha,dead)[0]),osm_un_max_m=max(directed(dead,un)[0],directed(un,dead)[0]),sampling_m=10,sampling_gap_bound_m=5,primary_text='1949 Jordan agreement V(1)(c) assigns the Hebron–Dead Sea sector to Annex I Map1 section B. V(1)(d) MR1925-0958 concerns the separate Dead Sea-to-southernmost-Palestine sector.',historical_validation='Signed Map1 north/south sheets are retained in scans/armistice-signed-1949.jpg (UNISPAL S/1302/Rev.1). Grid-registered crossing agrees within about 0.5 km: shore MR1877-1005 vs modern MR1879-0999; turn MR1951-1000 vs modern MR1952-1003. The older UNTS PDF alone is incomplete; that does not mean the signed sheet is unavailable.'))

# Source overlays for a human to inspect; never retained in docs.
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
for name,page,line_to_pixel,file in [
 ('blue',bp,lambda x,y:((x-700000)*88.8646/10000+143.8784,(3700000-y)*88.8715/10000+115.8597),'osm-blue.geojson'),
 ('alpha',ap,lambda x,y:((x-cx[1])/cx[0],(y-cy[1])/cy[0]),'osm-golan-a.geojson')]:
    fig,ax=plt.subplots(figsize=(12,12));ax.imshow(page.get_pixmap().pil_image())
    for f in read(file)['features']:
        if name=='alpha':tr=Transformer.from_crs(4326,28191,always_xy=True).transform
        else:tr=utm
        ps=np.array([line_to_pixel(*tr(*p[:2])) for p in f['geometry']['coordinates']]);way=f['properties'].get('id',f['properties'].get('way'))
        ax.plot(ps[:,0],ps[:,1],color='#d1009d' if name=='alpha' or way in accepted else '#ee5500',lw=.9)
    ax.set_title('OSM comparison over UN source; magenta retained, orange omitted');fig.tight_layout();fig.savefig(OUT/(name+'-source-overlay.png'),dpi=150);plt.close(fig)
print(json.dumps(dict(blueAccepted=len(accepted),blueExcluded=len(rows)-len(accepted),alphaMax=max(r['max_m'] for r in alpha_rows),alphaReverse=rev[0])))
