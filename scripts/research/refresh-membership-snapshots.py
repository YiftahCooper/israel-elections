#!/usr/bin/env python3
"""Promote a complete fresh fetch-member-changes.py extraction into differing snapshots.

Checks all retained fields for k1–k25 (k16/k17 retain no faction section),
refreshes official person fields, preserves array order and unchanged snapshots,
and updates the source manifest hash/bytes/time together. Stops on refusal.
Run fetch-member-changes.py first; this command makes additional name requests.
"""
import json, hashlib, time, urllib.request, urllib.parse
from pathlib import Path
from datetime import datetime, timezone
root=Path(__file__).resolve().parents[2]
(root/'.backup-scratch/dr-k25').mkdir(parents=True, exist_ok=True)
raw=root/'.backup-scratch/m2/raw'
manifest=json.loads((raw/'manifest.json').read_text())
assert manifest and all(r['status']==200 and not r.get('retryAfter') for r in manifest)
def records(kind):
 pages=[r for r in manifest if r.get('file','').startswith(kind+'-')]
 result=[]
 for r in pages:
  b=(raw/r['file']).read_bytes();assert hashlib.sha256(b).hexdigest()==r['sha256'];d=json.loads(b);result+=d['value']
 assert not d.get('odata.nextLink')
 return result
positions=records('positions');factions=records('factions');dates=records('dates')
base='https://knesset.gov.il/Odata/ParliamentInfo.svc/'
ua='israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)'
url=base+'KNS_Person?'+urllib.parse.urlencode({'$filter':'PersonID ge 0','$select':'PersonID,LastName,FirstName,GenderDesc','$format':'json'})
persons={}; person_requests=[]
while url:
 time.sleep(1.1)
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':ua}),timeout=40) as r:
  assert not r.headers.get('Retry-After');b=r.read()
 d=json.loads(b);print('persons',len(persons),len(d['value']),flush=True);person_requests.append({'url':url,'sha256':hashlib.sha256(b).hexdigest()})
 persons.update({p['PersonID']:p for p in d['value']})
 link=d.get('odata.nextLink') or d.get('@odata.nextLink');url=urllib.parse.urljoin(base,link) if link else None
 if url and '$format=' not in url:url+='&$format=json'
opening = min(d['PlenumStart'] for d in dates if d['KnessetNum'] == 26)[:10]
final_members = [r for r in positions if r['KnessetNum'] == 25 and r['PositionID'] in (43, 61)
                 and r['FinishDate'] and r['FinishDate'][:10] == opening]
assert len(final_members) == 120 and len({r['PersonID'] for r in final_members}) == 120
assert opening == '2026-11-10', 'Unexpected boundary: review before promoting'
now=datetime.now(timezone.utc).isoformat()
sources=json.loads((root/'data/raw/SOURCES.json').read_text());comparison=[]
for n in range(1,26):
 path=root/f'data/raw/k{n}/knesset-odata-members.json';old=json.loads(path.read_text());new=json.loads(path.read_text());changes=[]
 for key,predicate in [('positions',lambda r:r['PositionID'] in (43,61)),('factionMemberships',lambda r:r['PositionID']==54)]:
  if key not in old:continue
  rows={r['PersonToPositionID']:r for r in positions if r['KnessetNum']==n and predicate(r)}
  previous={r['PersonToPositionID']:r for r in old[key]}
  assert set(rows)==set(previous),(n,key,'IDs differ')
  for rid,prev in previous.items():
   for k,v in prev.items():
    if rows[rid][k]!=v:changes.append({'section':key,'id':rid,'field':k,'before':v,'after':rows[rid][k]})
  new[key]=[{k:rows[r['PersonToPositionID']][k] for k in r} for r in old[key]]
 for p in new['persons']:
  for k,v in list(p.items()):
   if persons[p['PersonID']][k]!=v:changes.append({'section':'persons','id':p['PersonID'],'field':k,'before':v,'after':persons[p['PersonID']][k]});p[k]=persons[p['PersonID']][k]
 comparison.append({'knesset':n,'changes':changes})
 if not changes:continue
 new['retrievedAt']=now
 new['queries']=[manifest[0]['url'],person_requests[0]['url']]
 b=(json.dumps(new,ensure_ascii=False,indent=1)+'\n').encode();path.write_bytes(b)
 src=next(s for s in sources if s['id']==f'k{n}-membership-odata');src.update(retrievedAt=now,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
 print(n,len(changes),'fields changed')
(root/'data/raw/SOURCES.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
(root/'.backup-scratch/dr-k25/comparison.json').write_text(json.dumps(comparison,ensure_ascii=False,indent=2)+'\n')
# Official opening record and faction registry are durable inputs to the offline builders.
boundary={'source':'Knesset OData ParliamentInfo.svc','retrievedAt':now,'termEnd':'2026-11-10','nextKnesset':26,
 'dates':[d for d in dates if d['KnessetNum']>=25], 'factions':[f for f in factions if f['KnessetNum']==25],
 'nextKnessetMembership':{'count':sum(r['KnessetNum']==26 and r['PositionID'] in (43,61) for r in positions),'openingDates':sorted({r['StartDate'] for r in positions if r['KnessetNum']==26 and r['PositionID'] in (43,61)})},
 'queries':{kind:[r for r in manifest if r.get('file','').startswith(kind+'-')] for kind in ('positions','factions','dates')},
 'personQueries':person_requests,
 'eventSources':[]}
for table,query,locator,quote in [
 ('KNS_KnessetDates','KnessetNum eq 26','KnessetDateID 169','KnessetNum: 26; PlenumStart: 2026-11-10T00:00:00; IsCurrent: true'),
 ('KNS_PersonToPosition','KnessetNum eq 25 and (PositionID eq 43 or PositionID eq 61)','All 120 final k25 memberships','FinishDate: 2026-11-10T00:00:00')]:
 boundary['eventSources'].append({'url':base+table+'?'+urllib.parse.urlencode({'$filter':query,'$format':'json'}),'publisher':'Knesset','date':None,'accessed':now[:10],'type':'official','evidenceFamily':'knesset-parliament-info','inspection':'retained-record','locator':locator+'; data/raw/research/k25-term-boundary.json and data/raw/k25/knesset-odata-members.json','supportingNote':quote,'effectiveDate':'2026-11-10'})
(root/'data/raw/research/k25-term-boundary.json').write_text(json.dumps(boundary,ensure_ascii=False,indent=2)+'\n')
print(boundary['nextKnessetMembership'])
