#!/usr/bin/env python3
"""Offline collector reconciliation. No network; no automatic factual corrections.
Usage: python3 check.py REPO COLLECTOR OUTPUT
Facts are field-scoped; a successful retrieval never verifies every claim citing it.
"""
from html.parser import HTMLParser
import sys,json,pathlib,re,html,hashlib,collections,urllib.parse,datetime
repo,collector,out=map(pathlib.Path,sys.argv[1:4]);out.mkdir(parents=True,exist_ok=True)
def read(p):return json.loads(p.read_text())
def sha(b):return hashlib.sha256(b).hexdigest()
def text(s):
 s=re.sub(r'<!--.*?-->|<(script|style)\b[^>]*>.*?</\1>','',s,flags=re.S|re.I)
 return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]*>',' ',s))).strip()
class Node:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def txt(self):return ' '.join(c.txt() if isinstance(c,Node) else c for c in self.children)
 def find(self,pred):return ([self] if pred(self) else [])+[n for c in self.children if isinstance(c,Node) for n in c.find(pred)]
class Parser(HTMLParser):
 def __init__(self,s):
  super().__init__();self.root=Node();self.stack=[self.root];self.feed(s)
 def handle_starttag(self,t,a):
  n=Node(t,a);self.stack[-1].children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,d):self.stack[-1].children.append(d)
def cls(s,c):return [re.sub(r'\s+',' ',n.txt()).strip() for n in Parser(s).root.find(lambda n:c in n.attrs.get('class','').split())]
def norm(s):return re.sub(r'[\s\-–—־"״\'׳,.!]+','',s).casefold()
def urlkey(u):
 p=urllib.parse.urlsplit(u);return (p.netloc.lower(),urllib.parse.unquote(p.path).lower().rstrip('/'),tuple(sorted(urllib.parse.parse_qsl(p.query))))
files={};urls=collections.defaultdict(list);leaves=[]
def walk(x,f,p=''):
 if isinstance(x,dict):
  for k,v in x.items():walk(v,f,p+'/'+str(k).replace('~','~0').replace('/','~1'))
 elif isinstance(x,list):
  for i,v in enumerate(x):walk(v,f,p+'/'+str(i))
 else:
  if isinstance(x,str) and x.startswith('https://'):urls[urlkey(x)].append({'file':f,'pointer':p})
  leaves.append((f,p,x))
for d in ['data/meta','data/research','public/data']:
 for p in sorted((repo/d).rglob('*.json')):
  if p.name=='collector-checks.json':continue # avoid recursively indexing this derived audit
  try: files[str(p.relative_to(repo))]=read(p)
  except (ValueError,OSError):continue
  walk(files[str(p.relative_to(repo))],str(p.relative_to(repo)))
gaps=read(repo/'docs/data-gaps.json'); positions=read(repo/'data/raw/bios/knesset-odata-faction-positions.json'); groups=collections.defaultdict(list)
for p in positions:groups[(p['KnessetNum'],p['FactionID'])].append(p)
names=read(repo/'data/meta/knesset-faction-names-en.json')['names']
# Site IDs come from official image paths; compare with retained candidate crosswalks only when unambiguous.
sitepeople=collections.defaultdict(set)
for f,d in files.items():
 if f.startswith('data/meta/bios/'):
  for row in d.get('candidates',{}).values():
   if (row.get('knesset') or {}).get('siteId') and row.get('knessetPersonId'):sitepeople[int(row['knesset']['siteId'])].add(int(row['knessetPersonId']))
ledger=[];jobs=[];artifacts=[]
def claim(job,field,status,observed,stored=None,**kw):
 ledger.append(dict(claimId=job+'/'+field,job=job,field=field,status=status,observed=observed,stored=stored,**kw))
snapshot=read(out/'check-output.json')['jobs'] if '--snapshot' in sys.argv[4:] else None
metaPaths=[collector/j['job']/'meta.json' for j in snapshot] if snapshot else sorted(collector.rglob('meta.json'))
for mp in metaPaths:
 m=read(mp);job=str(mp.parent.relative_to(collector));s=(mp.parent/'page.html').read_text() if (mp.parent/'page.html').exists() else '';t=text(s)
 j=dict(job=job,area=job.split('/')[0],url=m['url'],finalUrl=m.get('finalUrl'),status=m.get('status'),savedAt=m.get('savedAt'),label=m.get('label'),references=urls.get(urlkey(m['url']),[]),downloads=[],limitations=[])
 for a in m.get('files',[]):
  p=mp.parent/a['name']
  if p.is_file():
   b=p.read_bytes();actual=sha(b); rec=dict(job=job,file=a['name'],sha256=actual,bytes=len(b),declaredHashMatches=actual==a.get('sha256'),url=a.get('url',m['url']))
   artifacts.append(rec)
   if p.suffix.lower() in ['.pdf','.doc','.docx']:j['downloads'].append(rec)
 if m.get('status')!=200 or not t:
  claim(job,'capture','not covered',None,reason='HTTP failure or empty viewer shell; inspect downloaded document separately.' if j['downloads'] else 'HTTP failure or empty capture.')
 elif 'faction-english'==j['area'] and 'faction-lobby' in m['url']:
  q=dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(m['url']).query));q={k.lower():v for k,v in q.items()}
  k=int(q.get('knessetid',0));fid=int(q.get('factionid',0));rows=groups[(k,fid)]
  part=s[s.find('<app-main-faction-desktop'):s.find('</app-main-faction-desktop>')]
  n=cls(part,'faction-name');dates=cls(part,'faction-single-dates');members=cls(part,'mk-name')
  selected=cls(part,'selected-knesset')
  j['factionId']=fid;j['knesset']=k
  if not n or not selected or selected[0]!=str(k):
   claim(job,'capture','not covered',n,reason='Selected faction/term payload absent or wrong term.');jobs.append(j);continue
  he=sorted(set(r['FactionName'].strip() for r in rows));translations=sorted(set(names[x] for x in he if x in names))
  claim(job,'officialEnglishName','confirmed',n[0],dict(hebrewNames=he,displayTranslations=translations),scope='Official page label at retrieval; no historical rename date implied.',translationDiffers=bool(translations and all(norm(x)!=norm(n[0]) for x in translations)))
  ds=re.findall(r'\d{2}/\d{2}/\d{4}',dates[0] if dates else '')
  if rows and ds:
   begin=min(r['StartDate'][:10] for r in rows);end=max((r.get('FinishDate') or '9999')[:10] for r in rows)
   for field,ix,old in [('membershipEnvelopeStart',0,begin),('membershipEnvelopeEnd',1,end)]:
    if ix<len(ds):
     val=datetime.datetime.strptime(ds[ix],'%d/%m/%Y').date().isoformat();claim(job,field,'confirmed' if val==old else 'not covered',val,old,reason='Equal envelope confirms boundary only; unequal envelope may reflect stale positions or distinct faction and member lifetimes.')
  ids=[int(x) for x in re.findall(r'/globaldocs/MK/(\d+)/',part)];people=set();unmapped=[]
  for sid in ids:
   if len(sitepeople[sid])==1:people.update(sitepeople[sid])
   else:unmapped.append(sid)
  expected=set(r['PersonID'] for r in rows)
  claim(job,'allTermMemberNames','confirmed' if people==expected and not unmapped else 'not covered',members,sorted(expected),mappedPersonIds=sorted(people),unmappedSiteIds=unmapped,scope='Union across term; not a simultaneous seat count. Crosswalk ambiguity never promotes identity.')
  for i,line in enumerate([n.txt() for n in Parser(part).root.find(lambda n:n.tag=='li' and 'replaced' in n.txt())]):
   v=text(line);match=re.match(r'(\d{2}/\d{2}/\d{4})\s*-\s*(.*?)\s+replaced\s+(.*)',v)
   status='not covered';matched=[]
   if match:
    day=datetime.datetime.strptime(match[1],'%d/%m/%Y').date().isoformat()
    idsByName={norm(name):sitepeople[sid] for name,sid in zip(members,ids)}
    incoming=idsByName.get(norm(match[2]),set());outgoing=idsByName.get(norm(match[3]),set())
    tenureDoc=files.get('data/research/knesset-member-changes/k'+str(k)+'.json',{})
    ins=[r for r in tenureDoc.get('tenures',[]) if r.get('personId') in incoming and r.get('start')==day]
    outs=[r for r in tenureDoc.get('tenures',[]) if r.get('personId') in outgoing and r.get('end')==day]
    if ins and outs and len(incoming)==1 and len(outgoing)==1:status='confirmed';matched=[r['id'] for r in ins+outs]
   claim(job,'replacement-'+str(i),status,v,tenureIds=matched,reason='Dated incoming/outgoing tenure comparison only; legal departure reason not stated.')
  j['limitations'].append('Faction page start/end are not name-validity dates. Name variants are observations, not backdated renames.')
 elif j['area']=='gov-earlier' and 'k17-candidates-archive-' in m.get('label',''):
  letter=m['label'].split('k17-candidates-archive-',1)[1].split()[0]
  old=next((l for l in files['public/data/k17.json']['lists'] if l['letters']==letter),None)
  cells=[re.sub(r'\s+',' ',n.txt()).strip() for n in Parser(s).root.find(lambda n:n.tag=='td')]
  found=[]
  for i,v in enumerate(cells[:-1]):
   if v==str(len(found)+1) and cells[i+1] and not cells[i+1].isdigit():found.append(cells[i+1])
  if old:
   for i,cand in enumerate(old['candidates']):
    value=found[i] if i<len(found) else None
    equal=value is not None and sorted(norm(w) for w in value.split())==sorted(norm(w) for w in cand['nameHe'].split())
    claim(job,'candidate-'+str(i+1),'confirmed' if equal else 'not covered',value,cand['nameHe'],letters=letter,scope='Rank and name tokens; source gives given-name-first, app family-name-first. No separate-person identity asserted.')
  else:claim(job,'candidateRoster','not covered',None,reason='Index rather than a specific list.')
 elif j['area']=='gov-earlier' and 'k19-final-results' in m.get('label',''):
  ds=files['public/data/k19.json']
  for field in ['registered','votesCast','valid','invalid']:
   v=ds['totals'][field];claim(job,'total-'+field,'confirmed' if format(v,',') in t else 'not covered',v,scope='Numeric total matched in official national-results page; no turnout precision assumption.')
  for row in Parser(s).root.find(lambda n:n.tag=='tr'):
   cells=[re.sub(r'\s+',' ',n.txt()).strip() for n in row.children if isinstance(n,Node) and n.tag=='td']
   if len(cells)<3:continue
   try:votes=int(cells[2].replace(',',''))
   except ValueError:continue
   matches=[l for l in ds['lists'] if l['votes']==votes]
   if len(matches)==1:claim(job,'votes-'+matches[0]['letters'],'confirmed',dict(officialEnglishLabel=cells[0],votes=votes),dict(nameHe=matches[0]['nameHe'],votes=matches[0]['votes']),scope='Unique official national vote row; English label is an observation, not a historical name change.')
 elif j['area']=='mk-details':
  sid=int(m['url'].rstrip('/').split('/')[-1]);people=sitepeople[sid]
  # Confirm only IDs whose full given/family name appears on the requested detail page.
  personRows=read(repo/'data/raw/k25/knesset-odata-members.json').get('persons',[])
  for person in personRows:
   if person.get('PersonID') in people:
    tokens=(str(person.get('FirstName',''))+' '+str(person.get('LastName',''))).split()
    ok=bool(tokens) and all(norm(w) in norm(t) for w in tokens)
    claim(job,'person-'+str(person['PersonID']),'confirmed' if ok else 'not covered',dict(siteId=sid,personId=person['PersonID'],nameTokens=tokens),scope='Retained site-ID crosswalk and name presence only; no DOB or personal biography promotion.')
  claim(job,'personalDetails','not covered',None,reason='Personal-detail biography fields are outside stored election facts; parliamentary roles require separate tab capture.')
 elif j['area']=='gov-k26':
  tree=Parser(s).root; heads=tree.find(lambda n:n.tag=='h1');title=heads[0].txt().strip() if heads else ''
  candidates=files['public/data/k26.json']['lists'];match=next((l for l in candidates if norm(l['nameHe'])==norm(title)),None)
  if match:
   claim(job,'listName','confirmed',title,match['nameHe'],file='public/data/k26.json',letters=match['letters'])
   tables=tree.find(lambda n:n.tag=='table');lis=[td for tab in tables for td in tab.find(lambda n:n.tag=='td') if td.txt().strip()]
   observed=[re.sub(r'\s+',' ',li.txt()).strip() for li in lis]
   old=[c['nameHe'] for c in match['candidates']]
   # Some tables include sponsor text with the candidate; use precise prefix before מטעם.
   observed=[re.sub(r'^\d+\.\s*','',re.split('מטעם',v)[0].strip()) for v in observed]
   claim(job,'candidateRoster','confirmed' if len(old)==len(observed) and all(norm(a)==norm(b) for a,b in zip(old,observed)) else 'not covered',observed,old,letters=match['letters'],reason='Exact ordered roster after punctuation/spacing normalisation; mismatch needs manual inspection.')
   withdrew='אינה מתמודדת' in t or 'איננה מתמודדת' in t
   if withdrew:claim(job,'withdrawn','confirmed' if match.get('withdrawn') else 'not covered',True,match.get('withdrawn'),letters=match['letters'])
  else:claim(job,'listName','not covered',title,reason='Index or unmatched heading; no fuzzy list assignment.')
 else:
  # All pages are indexed, never mistake URL citation presence for factual confirmation.
  claim(job,'content','not covered',dict(title=m.get('title'),textLength=len(t)),reason='Requires claim-specific substantive comparison; URL reference matches alone do not verify claims.')
 # Compare existing quoted propositions only, never upgrade an entire record from one quote.
 for ref in j['references']:
  if not ref['file'].startswith('data/meta/aftermath/'):continue
  doc=files[ref['file']];bits=ref['pointer'].split('/')
  if len(bits)==4 and bits[1]=='sources':
   key=bits[2]
   def quotes(x,ptr=''):
    if isinstance(x,dict):
     if x.get('source')==key and x.get('quote'):
      v=x['quote'];claim(job,'quote:'+ref['file']+ptr,'confirmed' if norm(v) in norm(t) else 'not covered',v,file=ref['file'],pointer=ptr,scope='Quoted proposition only; dates/seat allocation/reason are separate claims.')
     for k,v in x.items():quotes(v,ptr+'/'+str(k))
    elif isinstance(x,list):
     for i,v in enumerate(x):quotes(v,ptr+'/'+str(i))
   quotes(doc)
 if j['downloads']:j['limitations'].append('Download bytes and hash checked; text comparison reported separately. Viewer HTML is not document evidence.')
 jobs.append(j)
for j in jobs:
 refFiles={r['file'] for r in j['references']}
 j['gapReferences']=[dict(registerArray=level,index=i,area=g.get('area'),file=g.get('file')) for level in ['high','medium','low'] for i,g in enumerate(gaps.get(level,[])) if g.get('file') in refFiles]
# Saved page/PDF comparisons use distinct provenance and do not count twice as independent sources.
pdfFile=out/'pdf-texts.json'
if pdfFile.exists():
 for pdf in read(pdfFile):
  j=next((j for j in jobs if j['job']==pdf['job']),None)
  if not j or pdf.get('error'):continue
  for ref in j['references']:
   doc=files[ref['file']];bits=ref['pointer'].split('/')
   if not ref['file'].startswith('data/meta/aftermath/') or len(bits)!=4 or bits[1]!='sources':continue
   key=bits[2]
   def pq(x,ptr=''):
    if isinstance(x,dict):
     if x.get('source')==key and x.get('quote'):
      hits=[i+1 for i,t in enumerate(pdf['pages']) if norm(x['quote']) in norm(t)]
      if hits:claim(j['job'],'pdf-quote:'+ref['file']+ptr,'confirmed',x['quote'],file=ref['file'],pointer=ptr,pdfPages=hits,sourceSha256=pdf['sha256'])
     for k,v in x.items():pq(v,ptr+'/'+str(k))
    elif isinstance(x,list):
     for i,v in enumerate(x):pq(v,ptr+'/'+str(i))
   pq(doc)
# Link each claim to original bytes, not the derived text hash.
byjob=collections.defaultdict(list)
for a in artifacts:byjob[a['job']].append(a)
for c in ledger:c['artifacts']=byjob[c['job']]
counts={}
for area in sorted(set(j['area'] for j in jobs)):
 cs=[c for c in ledger if c['job'].startswith(area+'/')];counts[area]={'jobs':sum(j['area']==area for j in jobs),**dict(collections.Counter(c['status'] for c in cs))}
result=dict(schemaVersion=1,scope='Offline bounded capture inventory and field-scoped comparisons; not a complete historical validation.',inputGapSha256=sha((repo/'docs/data-gaps.json').read_bytes()),counts=counts,jobs=jobs,claims=ledger,artifacts=artifacts)
(out/'check-output.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(out/'page-texts.json').write_text(json.dumps({str(p.parent.relative_to(collector)):text((p.parent/'page.html').read_text()) for p in metaPaths if (p.parent/'page.html').exists()},ensure_ascii=False,indent=2)+'\n')
(out/'gap-snapshot.json').write_bytes((repo/'docs/data-gaps.json').read_bytes())
print(json.dumps(counts,ensure_ascii=False,indent=2));print('artifacts',len(artifacts),'hash failures',sum(not a['declaredHashMatches'] for a in artifacts))
