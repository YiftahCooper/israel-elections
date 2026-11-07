import json,sys,shutil
from pathlib import Path
s=Path('.backup-scratch/v4');out=Path('docs/research/map-line-checks')
rows=[]
for pattern in ['js-*.png','gaza-*.png']:
 for old in out.glob(pattern):old.unlink()
for region in ['West Bank','Gaza Strip']:
 records=json.load(open(s/(region+'-stretches.json')))
 for r in records:
  x,y=r['worst'];r['region']=region
  if region=='Gaza Strip':
   explanation='Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.'
  elif 35.235<x<35.26 and 31.78<y<31.81:
   explanation='Mount Scopus enclave loop is present in OSM and missing from this OCHA line extract. The large nearest-line distance measures an omitted feature, not the loop being 2 km out of place. Keep the enclave separately; do not hatch it as no-man’s-land.'
  elif 34.95<x<35.11 and 31.80<y<32.00:
   explanation='Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The national signed annex supplies coarse historical context; this is not a survey-level rectification.'
  elif 35.17<x<35.26 and 31.70<y<31.83:
   explanation='Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Retain OSM paired-line topology and separate hatching. Do not attribute the residual to a particular later agreement without its map.'
  else:
   explanation='Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The signed 1:500,000 annex is a coarse shape check, not metre-level validation.'
  r['decision']=explanation
  dst=f'{"js" if region=="West Bank" else "gaza"}-{r["id"]:03}.png';shutil.copyfile(s/f'{region}-{r["id"]}.png',out/dst);r['figure']=dst;rows.append(r)
Path('data/raw/map-lines/discrepancy-stretches.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
text=['# OCHA / OSM disagreement atlas','', '7 November 2026. All continuous source-line portions outside a 100 m buffer of the opposite dataset are included, grouped when within 150 m. Buffer discretization is below 0.008 m; maxima are sampled at intervals no greater than 10 m. WGS84 coordinates are longitude/latitude. Maximum values are 10 m sampled distances, not cadastral errors. Each figure is a cropped comparison of the retained source vectors; green is OCHA, purple is OSM. No map background or settlement label is invented.','', 'The historical interpretation is separated from the numerical observation. For ordinary stretches, a particular adjustment is **not** inferred merely from an offset. See [the source and decision report](map-lines.md).','']
for r in rows:
 text += [f'## {"Judea and Samaria" if r["region"]=="West Bank" else r["region"]} · {r["id"]}', '',f'- Bounding coordinates: `{r["bbox"]}`.',f'- Maximum sampled deviation: **{r["max_m"]:.1f} m** at `{r["worst"]}`.',f'- Directions: {", ".join(r["directions"])}.', *[f'  - Continuous portion {i+1}, {p["direction"]}: `{p["start"]}` → `{p["end"]}`; max {p["max_m"]:.1f} m.' for i,p in enumerate(r.get('pieces',[]))],f'- Interpretation / depiction decision: {r["decision"]}', '',f'![Source comparison: {r["region"]} stretch {r["id"]}](map-line-checks/{r["figure"]})','']
Path('docs/research/map-line-stretches.md').write_text('\n'.join(text))
print('Retained',len(rows),'comparison crops')
