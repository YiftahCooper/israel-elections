import pymupdf as fitz,sys
# crop.py file page x0 y0 x1 y1 dpi out   (fractions)
f,pg,x0,y0,x1,y1,dpi,out=sys.argv[1:9]
d=fitz.open(f);p=d[int(pg)];r=p.rect
clip=fitz.Rect(r.width*float(x0),r.height*float(y0),r.width*float(x1),r.height*float(y1))
p.get_pixmap(dpi=int(dpi),clip=clip).save(out)
