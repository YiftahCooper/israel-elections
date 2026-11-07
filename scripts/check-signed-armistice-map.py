"""Offline signed-map comparison. Crops are disposable; decisions are retained.

The 1:250,000 source's grid is about 51 m/pixel. A visual tie-break at a
worst-point crop does not certify an entire (sometimes very long) cluster.
"""
import json
from pathlib import Path
from PIL import Image,ImageDraw
from pyproj import Transformer
from shapely.geometry import shape
R=Path('data/raw/map-lines');O=Path('.backup-scratch/v4-r2/signed-map');O.mkdir(parents=True,exist_ok=True)
read=lambda n:json.loads((R/n).read_text())
grid=Transformer.from_crs(4326,28191,always_xy=True)
def pixel(lon,lat):
 e,n=grid.transform(lon,lat);return (180+(e/1000-80)*19.70,3707-(n/1000-120)*19.607)
im=Image.open(R/'scans/armistice-signed-1949.jpg')
osm=[shape(f['geometry']) for f in read('osm-green.geojson')['features']]
ocha=[shape(f['geometry']) for f in read('ocha-green.geojson')['features']]
rows=[]
for row in read('discrepancy-stretches.json'):
 if row['region']!='West Bank' or row['max_m']<=300:continue
 x,y=pixel(*row['worst']);rect=(int(x)-90,int(y)-75,int(x)+90,int(y)+75);crop=im.crop(rect).convert('RGB');draw=ImageDraw.Draw(crop)
 for geometries,color in [(osm,'magenta'),(ocha,'cyan')]:
  for geom in geometries:draw.line([(a-rect[0],b-rect[1]) for a,b in (pixel(*c[:2]) for c in geom.coords)],fill=color,width=1)
 draw.ellipse((88,73,92,77),outline='yellow');crop.save(O/f'{row["id"]}.png')
 decision='Unresolved: signed ink width, source registration and/or differing historical establishment prevent a whole-cluster positional tie-break. Retain the qualified OSM cartography, not a claim of historical survey accuracy.'
 if row['id'] in [2,4,5,9,10,17,28,30,32,33,40,44,46]:decision='Unresolved: the signed line and modern products do not uniquely coincide at this scale. VI(3) staged establishment / VI(11) rectifications are possible explanations, not verified local adjustments.'
 if row['id'] in [71,74]:decision='Paired Latrun truce lines agree in configuration; the eastern closure remains non-agreed. No change to detailed vertices justified by the coarse signed sheet.'
 if row['id']==75:decision='Unresolved north Jerusalem continuation: this worst point is north of UN229 coverage. Retain qualified OSM; do not imply the central registered pair verifies this stretch.'
 if row['id']==77:decision='Scopus outline absent from OCHA, not a two-source positional error. Retain only the separately checked northern Israeli-enclave arc; no unsourced internal division.'
 if row['id']==78:decision='Central Jerusalem uses the separately registered UN229 pair, not either modern product. The coarse signed sheet cannot refine the registered trace.'
 if row['id']==80:decision='Government House has its own separate OSM zone and retained armistice edges. The mismatch with UN229 at N130 is disclosed; the coarse signed sheet cannot refine its outline.'
 if row['id']==82:decision='Unresolved southern Jerusalem continuation: this worst point is south of UN229 coverage and west of the Government House overlay. Retain qualified OSM; neither detailed overlay verifies this stretch.'
 if row['id']==56:decision='OSM supported near Rantis/Qibya at the worst point; OCHA departs from the signed ink. Retain OSM. This does not certify every vertex across the whole cluster.'
 if row['id']==104:decision='OCHA supported at Arab er-Ramadin; OSM is about 0.8 km south of the signed ink. Substitute OCHA in the retained local box, with short cartographic transitions to the recorded exact OpenStreetMap nodes (authorised third-review correction); these joins are not surveyed treaty coordinates. The rest of this long cluster remains unresolved.'
 rows.append(dict(id=row['id'],worst=row['worst'],max_m=row['max_m'],bbox=row['bbox'],decision=decision,crop=f'.backup-scratch/v4-r2/signed-map/{row["id"]}.png'))
# The crossing is on the combined signed source too; retain a reproducible
# native-pixel diagnostic rather than relying only on a modern UN comparison.
x,y=pixel(35.43,31.49312);rect=(int(x)-100,int(y)-80,int(x)+100,int(y)+80)
crop=im.crop(rect).convert('RGB');draw=ImageDraw.Draw(crop)
for geometries,color in [(osm,'magenta'),(ocha,'cyan')]:
 for geom in geometries:draw.line([(a-rect[0],b-rect[1]) for a,b in (pixel(*c[:2]) for c in geom.coords)],fill=color,width=1)
crop.save(O/'dead-sea.png')
record=dict(source='S/1302/Rev.1 signed Map1 north/south sheets',url='https://www.un.org/unispal/document/auto-insert-181069/',image='scans/armistice-signed-1949.jpg',imageSize=list(im.size),grid='Palestine Belt EPSG:28191',pixelFormula=dict(x='180+(E/1000-80)*19.70',y='3707-(N/1000-120)*19.607'),fittedGridAnchors=[[80,120,180,3707],[220,120,2938,3707],[80,270,180,765.95]],registrationProvenance='Reviewer printed-grid fit, independently visually read back against N110/120/130 at both map borders; about 1–4 source pixels discrepancy, not survey control.',limitations='North-sheet grid fit; south-sheet offset about four pixels in reviewer check. Town symbols differ about 150–300m; ink about 100–200m wide. About 0.5km discrimination, not a survey. All 38 >300m JS cluster worst-point crops inspected; most cannot resolve a whole cluster.',ramadinReplacementBox=[34.91,31.33,34.95,31.365],ramadinSplice=dict(westWay=95258495,westAnchor=[34.909792,31.3563778],eastWay=87237529,eastAnchor=[34.9503931,31.3480643],removedWays=[95258528,95258529],method='Retain the OCHA stroke; connect its ends to these existing OpenStreetMap vertices. Retain westWay only north of westAnchor and remove the replaced source ways, including box-cut stubs. Short cartographic transitions, not surveyed treaty coordinates; source precision and zoom limit unchanged.'),clusters=rows)
(R/'signed-map-check.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
# Remove the superseded missing-sheet assertion from the old discrepancy notes.
p=R/'discrepancy-stretches.json';old=read(p.name)
for row in old:
 if row['region']=='West Bank':row['decision']=next((r['decision'] for r in rows if r['id']==row['id']),'Source difference below 300m. Retain qualified OSM; see signed-map-check.json for the coarse map limitations.')
p.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n')
print('signed-map clusters',len(rows))
