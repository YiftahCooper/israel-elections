import sys,json
import numpy as np
from pyproj import Transformer
from PIL import Image
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
p=Transformer.from_crs(4326,32636,always_xy=True).transform

def draw(file,controls,candidates,out,xlim,ylim):
 xy=np.array([[x,y,1] for x,y,lon,lat in controls]);m=np.array([p(lon,lat) for x,y,lon,lat in controls]);coef=np.linalg.lstsq(xy,m,rcond=None)[0];inv=np.linalg.inv(np.vstack([coef.T,[0,0,1]]));fig,ax=plt.subplots(figsize=(10,12));ax.imshow(Image.open(file))
 for fs,color,label in candidates:
  first=True
  for f in fs:
   cs=f['geometry']['coordinates'];lines=[cs] if f['geometry']['type']=='LineString' else cs
   for line in lines:
    q=np.array([p(*c[:2]) for c in line]);pixels=np.column_stack([q,np.ones(len(q))])@inv.T;ax.plot(pixels[:,0],pixels[:,1],color=color,lw=1.4,label=label if first else None);first=False
 ax.set(xlim=xlim,ylim=ylim);ax.legend();fig.tight_layout();fig.savefig('.backup-scratch/v4/'+out+'.png',dpi=130)
 json.dump(dict(controls=controls,pixelToUtm=coef.tolist()),open('.backup-scratch/v4/'+out+'-control.json','w'),indent=2)
ne=json.load(open('data/raw/map-lines/natural-earth-region.geojson'))['features'];osm=json.load(open('data/raw/map-lines/osm-golan-a.geojson'))['features']
draw('data/raw/map-lines/scans/undof-2024.jpg',[(354,396,35+50/60,33+20/60),(565,396,36,33+20/60),(354,1074,35+50/60,32+55/60),(565,1074,36,32+55/60)],[(osm,'#af00ee','OSM Alpha'),([f for f in ne if f['properties']['NAME']=='Ceasefire Lines 1974'],'#ff5500','NE 1974'),([f for f in ne if f['properties']['NAME']=='UNDOF'],'#00bb00','NE UNDOF overlay limit')],'golan-georef',(270,510),(1300,240))
