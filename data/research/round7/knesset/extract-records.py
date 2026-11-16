import pathlib,zipfile,json,xml.etree.ElementTree as E,struct
import pymupdf,olefile
# Run from the repository root. Keep reproducible extraction output in scratch.
import sys
R=pathlib.Path(sys.argv[1])
O=pathlib.Path(sys.argv[2]);O.mkdir(parents=True,exist_ok=True)
for p in sorted(R.iterdir()):
 if p.suffix.lower() not in ['.pdf','.doc','.docx']:continue
 out=O/(p.stem+'-units.json')
 if out.exists():continue
 try:
  if p.read_bytes().startswith(b'%PDF'):
   doc=pymupdf.open(p);units=[{'pdf_page':i+1,'text':pg.get_text()} for i,pg in enumerate(doc)];kind='pdf_page'
  elif zipfile.is_zipfile(p):
   with zipfile.ZipFile(p) as z:xml=E.fromstring(z.read('word/document.xml'))
   ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
   units=[{'paragraph':i,'text':''.join(t.text or '' for t in el.findall('.//w:t',ns))} for i,el in enumerate(xml.findall('.//w:body/w:p',ns),1)];kind='paragraph'
  elif olefile.isOleFile(p):
   with olefile.OleFileIO(p) as ole:
    w=ole.openstream('WordDocument').read();flags=struct.unpack_from('<H',w,10)[0];table=ole.openstream('1Table' if flags&0x200 else '0Table').read();off=32;csw=struct.unpack_from('<H',w,off)[0];off+=2+csw*2;cslw=struct.unpack_from('<H',w,off)[0];off+=2+cslw*4;count=struct.unpack_from('<H',w,off)[0];vals=struct.unpack_from('<'+'I'*(count*2),w,off+2);fc,lcb=vals[66:68];clx=table[fc:fc+lcb];pos=0
    while pos<len(clx) and clx[pos]==1:pos+=3+struct.unpack_from('<H',clx,pos+1)[0]
    if clx[pos]!=2:raise ValueError('no piece table')
    plen=struct.unpack_from('<I',clx,pos+1)[0];plc=clx[pos+5:pos+5+plen];n=(plen-4)//12;cp=struct.unpack_from('<'+'I'*(n+1),plc,0);text=[]
    for j in range(n):
     loc=struct.unpack_from('<I',plc,4*(n+1)+j*8+2)[0];size=cp[j+1]-cp[j];compressed=bool(loc&0x40000000);loc&=0x3fffffff
     if compressed:loc//=2
     text.append(w[loc:loc+size*(1 if compressed else 2)].decode('cp1255' if compressed else 'utf-16le',errors='replace'))
    units=[{'legacy_paragraph':i,'text':t} for i,t in enumerate(''.join(text).split('\r'),1)];kind='legacy_paragraph'
  else:print('UNKNOWN',p.name);continue
  out.write_text(json.dumps(units,ensure_ascii=False,indent=2));(O/(p.stem+'.txt')).write_text('\n'.join(f'[{kind} {i+1}] '+u['text'] for i,u in enumerate(units)))
  print(p.name,len(units),sum(len(u['text']) for u in units),flush=True)
 except Exception as ex:print('ERROR',p.name,repr(ex),flush=True)
