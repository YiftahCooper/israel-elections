import sys,json
import numpy as np
from pyproj import Transformer
from PIL import Image
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
# Approximate symbol centres on the retained 1400px UN map; coordinates of the named monuments.
gcps=[['Holy Sepulchre',541,813,35.22958,31.77845],['Dome of the Rock',671,826,35.2354,31.7780],['David tomb',533,998,35.2293,31.7723],['Western Wall',652,861,35.2345,31.7767]]
p=Transformer.from_crs(4326,32636,always_xy=True).transform
xy=np.array([[q[1],q[2],1] for q in gcps]);m=np.array([p(q[3],q[4]) for q in gcps]);coef=np.linalg.lstsq(xy,m,rcond=None)[0];inv=np.linalg.inv(np.vstack([coef.T,[0,0,1]]));res=np.linalg.norm(xy@coef-m,axis=1)
print('Control residual metres',res.tolist())
fig,ax=plt.subplots(figsize=(10,10));ax.imshow(Image.open('data/raw/map-lines/scans/jerusalem-un-1949.jpg'))
for file,color,label in [('data/raw/map-lines/osm-green.geojson','#a000d0','OSM'),('data/raw/map-lines/ocha-green.geojson','#ff7f00','OCHA')]:
 for i,f in enumerate(json.load(open(file))['features']):
  cs=f['geometry']['coordinates'];q=np.array([p(*c) for c in cs]);pixels=np.column_stack([q,np.ones(len(q))])@inv.T;ax.plot(pixels[:,0],pixels[:,1],color=color,lw=1,label=label if i==0 else None)
ax.set(xlim=(360,800),ylim=(1200,250),title='UN map 229 (Nov 1949): approximate monument control registration');ax.legend();fig.tight_layout();fig.savefig('.backup-scratch/v4/jlm-georef.png',dpi=150)
json.dump({'source':'UN map 229, November 1949, retained 1400px image','controls':gcps,'pixelToUtm':coef.tolist(),'residualMetres':res.tolist(),'limitation':'Approximate symbol-centre registration, not surveyed control; no geometry digitized or corrected from this fit.'},open('.backup-scratch/v4/jlm-control.json','w'),indent=2)
