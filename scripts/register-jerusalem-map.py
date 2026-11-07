"""Seven-control similarity registration and corrected-line diagnostic; outputs in scratch."""
import json
from pathlib import Path
import numpy as np
from pyproj import Transformer
from PIL import Image
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path('data/raw/map-lines');out=Path('.backup-scratch/v4/map-line-checks');out.mkdir(parents=True,exist_ok=True)
r=json.loads((root/'jerusalem-registration.json').read_text());gcps=r['controls']
p=Transformer.from_crs(4326,32636,always_xy=True).transform
# X=a*x+b*y+tx; Y=b*x-a*y+ty. One common scale; no affine shear.
A=[];B=[]
for _,x,y,lon,lat in gcps:A.extend([[x,y,1,0],[-y,x,0,1]]);B.extend(p(lon,lat))
a,b,tx,ty=np.linalg.lstsq(A,B,rcond=None)[0]
assert np.allclose([a,b,tx,ty],r['similarity'],atol=.001)
inv=np.linalg.inv(np.array([[a,b,tx],[b,-a,ty],[0,0,1]]))
fs=json.loads(Path('public/data/map-lines.geojson').read_text())['features']
for name,bounds in [('jlm-georef',((330,980),(1267,229))),('jlm-abutor',((450,760),(1267,950))),('jlm-north',((330,650),(600,229)))]:
 fig,ax=plt.subplots(figsize=(10,10));ax.imshow(Image.open(root/'scans/jerusalem-un-1949.jpg'))
 for f in fs:
  if f['properties']['layer']!='green-line':continue
  q=np.array([p(*c[:2]) for c in f['geometry']['coordinates']]);xy=np.column_stack([q,np.ones(len(q))])@inv.T;ax.plot(xy[:,0],xy[:,1],color='#c1009d',lw=1)
 ax.set(xlim=bounds[0],ylim=bounds[1],title='UN229 / corrected production lines; seven-control similarity');fig.tight_layout();fig.savefig(out/(name+'.png'),dpi=150);plt.close(fig)
Path('docs/research/map-line-checks/jlm-control.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print('Seven-control scale',np.hypot(a,b),'m/px; no affine shear')
