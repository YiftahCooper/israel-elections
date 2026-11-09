#!/usr/bin/env python3
"""Rebuild election-specific source overlays and coverage from retained reviewed evidence.

Python 3.10+, standard library; no network. Run from repository root:
  python3 -I scripts/research/build-party-links.py           # write the overlays, coverage.json and the doc tables
  python3 -I scripts/research/build-party-links.py --check   # write nothing; exit 1 if any output differs
Reviewed hand corrections live in data/raw/party-links/*.reviewed.json, never in the outputs.
See docs/research/party-links.md for identity rules, limitations and retrieval workflow.
"""
import json
import re
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'data/raw/party-links'
OUT = ROOT / 'data/meta/party-links'
def load(p): return json.loads(p.read_text('utf8'))
CHECK = '--check' in sys.argv
outputs = {}   # path -> text; written (or compared with --check) at the end
def save(p, x): outputs[p] = json.dumps(x, ensure_ascii=False, indent=2) + '\n'
def norm(s): return re.sub(r'[\s\-–—־"״\'׳!(),]', '', s)
# Explicit aliases only: no fuzzy matching, no English Wikipedia or person articles.
aliases = {**load(RAW/'title-aliases.json'), **load(RAW/'more-title-aliases.json')}
profiles = load(RAW/'idi-profiles.json')
profile_aliases = {
 'העבודה':'מפלגת העבודה', 'מפא״י':'מפא"י', 'מפ״ם':'מפ"ם', 'החזית הדתית':'חזית דתית מאוחדת',
 'הפרוגרסיבים':'המפלגה הפרוגרסיבית', 'דמוקרטית נצרת':'רשימה דמוקרטית של נצרת', 'הלוחמים':'רשימת הלוחמים',
 'התימנים':'התאחדות התימנים', 'ספרדים ועדות המזרח':'ספרדים ועדות המזרח', 'ויצו':'ויצ "ו',
 'ישראל בעליה':'ישראל בעלייה', 'רע״ם':'רע"מ', 'מק״י':'מק"י', 'הציונים הכלליים':'ציונים כלליים',
 'מפלגת העבודה הישראלית':'מפלגת העבודה', 'האיחוד הלאומי – תקומה':'הציונות הדתית',
 'חד"ש (המפלגה הקומוניסטית הישראלית)':'חד"ש', 'עוצמה יהודית (חזית יהודית לאומית)':'עוצמה יהודית',
 'הימין החדש (צל"ש)':'הימין החדש', 'נעם (לזוז)':'נעם', 'הסתדרות נשים ציוניות ויצ"ו':'ויצ "ו',
 'מפלגה דמוקרטית ערבית':'מד"ע', 'מפלגת המרכז':'מפלגת המרכז',
}
profile_by_name = {norm(p['name']): p for p in profiles if 'error' not in p}
approved = set(load(RAW/'approved-hewiki-titles.json'))
wiki = {}; pages = {}
checks = load(RAW/'hewiki-title-checks.json')['batches'] + [load(p) for p in sorted(RAW.glob('hewiki-more*.json'))]
for batch in checks:
 q = batch.get('query', {}); redirects = {r['from']:r['to'] for r in q.get('redirects',[])}
 for p in q.get('pages',{}).values():
  if p['title'] in approved and 'missing' not in p:
   pages[p['title']] = p
   wiki[norm(p['title'])] = p
 for a,b in redirects.items():
  seen = set()
  while b in redirects and b not in seen: seen.add(b); b=redirects[b]
  if b in pages: wiki[norm(a)] = pages[b]
url_checks = load(RAW/'url-checks.json') + load(RAW/'more-url-checks.json') + load(RAW/'small-list-url-checks.json')
ok_urls = {c['url']:c for c in url_checks if c.get('status') == 200}
platform_checks = {c['url']:c for c in load(RAW/'idi-platform-checks.json') if 'error' not in c and c.get('bytes',0)>100}
# Reviewed corrections of the IDI index: a platform whose own text places it in another election or list
# is attached there (never also to the indexed row); see docs/research/party-links.md.
reassigned = {r['url']:r for r in load(RAW/'platform-reassignments.reviewed.json')}
# Reviewed corrections from the election audits (aliases scoped to one election, per-identity links/gaps,
# re-review dates); each item carries its reason and source.
corrections = load(RAW/'overlay-corrections.reviewed.json')
scoped_aliases = {(a['election'], a['name']): a['title'] for a in corrections['aliases']}
cec = {}
for s in load(ROOT/'data/raw/SOURCES.json'):
 if re.match(r'k\d+-(national-html|results-gazette)$',s['id']) and s['url'] in ok_urls:
  cec[s['id'].split('-')[0]] = s['url']
# Platform rows are scoped by their published election-year label, never a current party's successor.
def platform_year(row, knesset):
 year = re.search(r'\b(19\d\d|20\d\d)\b',row)
 if not year:return False
 if year[1]=='2019':return (knesset==21 and 'אפריל' in row) or (knesset==22 and 'ספטמבר' in row)
 return int(year[1]) == YEARS[knesset]
YEARS={i:int(load(ROOT/f'public/data/k{i}.json')['electionDate'][:4]) for i in range(1,27)}
def profile_of(name): return profile_by_name.get(norm(profile_aliases.get(name,name)))
def wiki_of(name,k):
 name=name.replace('״','"').replace('׳',"'")
 # The 1919 party, the post-1965 Maki, and generic dictionary titles must not match older lists.
 if name=='מק"י' and k<=7:return None
 if name=='הרשימה הערבית המאוחדת' and k<14:return None
 if name=='יחד' and k<20:return None
 if norm(name)=='ישר' and k<26:return None
 # Later namesakes: the 1999 One Israel alliance, the 2020 Derekh Eretz party (the 1988 list is unrelated) and
 # the 2026 joint list that the New Economic Party title now redirects to.
 if norm(name)==norm('ישראל אחת') and k!=15:return None
 if norm(name)==norm('דרך ארץ') and k<24:return None
 if norm(name)==norm('הכלכלית החדשה') and k<26:return None
 return wiki.get(norm(scoped_aliases.get((f'k{k}',name)) or aliases.get(name,name)))
def neutral(name,k):
 p=wiki_of(name,k)
 if p:return [{'kind':'neutral','url':p['fullurl'],'titleHe':p['title'],'titleEn':'Hebrew Wikipedia (secondary)','publisher':'ויקיפדיה העברית (מקור משני)','sourceType':'hewiki','confidence':'high'}]
 p=profile_of(name)
 if p:return [{'kind':'neutral','url':p['url'],'titleHe':p['name'],'publisher':'המכון הישראלי לדמוקרטיה','sourceType':'academic','confidence':'high'}]
 return []
def platforms(name,k):
 p=profile_of(name)
 if not p:return []
 result=[]
 for e in p.get('platforms',[]):
  if platform_year(e['row'],k) and e['url'] in platform_checks and e['url'] not in reassigned:
   result.append({'kind':'partisan','url':e['url'],'titleHe':f"{p['name']} — מצע {YEARS[k]}",'publisher':f"{p['name']} (עותק באירוח המכון הישראלי לדמוקרטיה)",'sourceType':'platform','confidence':'medium'})
 return result
live = {
 'מחל':('https://www.likud.org.il/','הליכוד'), 'ב':('https://www.ozma-yeudit.co.il/','עוצמה יהודית'),
 'דרך':('https://yasharwitheisenkot.com/','ישר!'), 'אמת':('https://democrats.org.il/','הדמוקרטים'),
 'רק':('https://be-yahad.org.il/','ביחד'), 'ל':('https://beytenu.org.il/','ישראל ביתנו'),
 'ודם':('https://jointlist.org.il/','הרשימה המשותפת'),
 'בקר':('https://orothashachar.org.il/website-regulations/','אורות השחר'),
 'צף':('https://www.piratim.org/flag/','מפלגת הפיראטים'),
}
party_live={
 'likud':live['מחל'], 'otzma-yehudit':live['ב'], 'yashar':live['דרך'], 'democrats':live['אמת'],
 'together-bennett':live['רק'],'new-hope':('https://www.newhope.org.il/','תקווה חדשה'),
 'tkuma':('https://zionutdatit.org.il/','הציונות הדתית'), 'zehut':('https://zehut.org.il/','זהות'),
 'yesh-atid':('https://yeshatid.org.il/','יש עתיד'), 'noam':('https://www.noamlisrael.org.il/','נעם'),
 'hadash':('https://hadash.org.il/','חד"ש')}
def live_link(pair):
 u,p=pair
 if u not in ok_urls:return []
 return [{'kind':'partisan','url':u,'titleHe':p+' — אתר רשמי','titleEn':'Official site (retrieved 2026-11-04)','publisher':p,'sourceType':'party-site','confidence':'high'}]
archive = {r['site']:r for r in load(RAW/'archive-checks.json') if r.get('capture') and not r.get('replayError')}
def archive_link(site,publisher):
 r=archive.get(site)
 if not r:return []
 stamp=r['capture'].split('/web/')[1][:14]
 date=f'{stamp[:4]}-{stamp[4:6]}-{stamp[6:8]}T{stamp[8:10]}:{stamp[10:12]}:{stamp[12:14]}Z'
 return [{'kind':'partisan','url':r['capture'],'titleHe':publisher+' — אתר הבחירות בארכיון','publisher':publisher,'sourceType':'party-site','archivedAt':date,'confidence':'high'}]
report=[]
for k in range(26,0,-1):
 ds=load(ROOT/f'public/data/k{k}.json'); lists={};parties={};gaps={}
 for l in ds['lists']:
  links=platforms(l['shortHe'],k)+neutral(l['shortHe'],k)
  if k==26 and l['letters'] in live:links=live_link(live[l['letters']])+[e for e in links if e['kind']=='neutral']
  if k==25 and l['letters']=='פה':links=archive_link('yeshatid.org.il/','יש עתיד')+[e for e in links if e['kind']=='neutral']
  # Whole-election official record names this list. Never count it as a party's own voice.
  if not any(e['kind']=='neutral' and e['sourceType']=='hewiki' for e in links) and ds['id'] in cec:
   links=[e for e in links if e['kind']!='neutral']
   # From 2019 the official record is the CEC results web page, not a gazetted results notice (audits k21–k23).
   webpage=re.match(r'https://votes\d+\.bechirot\.gov\.il/',cec[ds['id']])
   links.append({'kind':'neutral','url':cec[ds['id']],'titleHe':f"{l['shortHe']} — "+(f'תוצאות ועדת הבחירות לכנסת {k}' if webpage else f'הודעת התוצאות לכנסת {k}'),'titleEn':'Official election results record (whole-election document)','publisher':f'ועדת הבחירות המרכזית לכנסת ה-{k}'+(' (עותק באירוח אתר אוסף חוק ומשפט)' if k==7 else ''),'sourceType':'cec','confidence':'high'})
  lists[l['id']]=links
  for p in l.get('parties',[]):
   name=p['nameHe'];links=platforms(name,k)+neutral(name,k)
   if k==26 and p['id'] in party_live:links=live_link(party_live[p['id']])+[e for e in links if e['kind']=='neutral']
   if k==25 and p['id']=='hadash':links=archive_link('hadash.org.il/','חד"ש')+[e for e in links if e['kind']=='neutral']
   parties[p['id']]=links
 for r in reassigned.values():
  if r['assignTo']['election']==ds['id']:
   assert r['url'] in platform_checks and r['assignTo']['list'] in lists, r['url']
   lists[r['assignTo']['list']].insert(0,{'kind':'partisan','url':r['url'],'titleHe':r['titleHe'],'publisher':r['publisher'],'sourceType':'platform','confidence':'medium'})
 tables={'lists':lists,'parties':parties}; reviewed_gaps={}
 for c in corrections['entries']:
  if c['election']!=ds['id']:continue
  table=tables[c['table']]
  assert c['id'] in table, f"overlay correction: unknown {c['table']} id {c['id']} in {ds['id']}"
  if 'links' in c:
   assert c['links']!=table[c['id']], f"overlay correction {c['id']}: the rules already produce these links; remove the entry"
   table[c['id']]=c['links']
  if 'gaps' in c:reviewed_gaps[c['id']]=c['gaps']
 for table in [lists,parties]:
  for id,links in table.items():
   missing={}
   for kind in ['partisan','neutral']:
    if not any(e['kind']==kind for e in links):
     missing[kind]=('No verified campaign-period party source acquired in this pass. IDI row matching and reviewed live/archive sources did not supply this identity; NLI ephemera/newspaper research remains open.' if kind=='partisan' else 'No verified identity-specific neutral article acquired; generic dictionary articles and joint-list sources were excluded. CEC k26 retrieval was blocked/timed out.' if k==26 else 'No verified identity-specific neutral article acquired; dictionary articles and joint-list sources excluded; further research required.')
   if id in reviewed_gaps:
    assert set(reviewed_gaps[id])==set(missing), f"overlay correction {id}: gaps must name exactly the missing kinds {sorted(missing)}"
    assert reviewed_gaps[id]!=missing, f"overlay correction {id}: the rules already produce these gaps; remove them"
    missing=reviewed_gaps[id]
   if missing:gaps[id]=missing
 reviewed=corrections['overlayReviewedAt'].get(ds['id'],{}).get('date','2026-11-04')
 save(OUT/f'k{k}.json',{'electionId':ds['id'],'reviewedAt':reviewed,'lists':lists,'parties':parties,'gaps':gaps})
 report.append({'election':ds['id'],'year':YEARS[k], 'lists':{kind:sum(any(e['kind']==kind for e in a) for a in lists.values()) for kind in ['partisan','neutral']},'listTotal':len(lists),'parties':{kind:sum(any(e['kind']==kind for e in a) for a in parties.values()) for kind in ['partisan','neutral']},'partyTotal':len(parties)})
save(RAW/'coverage.json',report)
if not CHECK:
 for r in report:print(r)
# Keep the durable report aligned with overlays; no timestamps or network access.
doc = ROOT/'docs/research/party-links.md'
if doc.exists():
 text=doc.read_text('utf8')
 rows=['| Election | Lists partisan | Lists neutral | Lists total | Constituents partisan | Constituents neutral | Constituents total |', '|---|---:|---:|---:|---:|---:|---:|']
 for r in report: rows.append(f"| {r['election']} {r['year']} | {r['lists']['partisan']} | {r['lists']['neutral']} | {r['listTotal']} | {r['parties']['partisan']} | {r['parties']['neutral']} | {r['partyTotal']} |")
 text=re.sub(r'<!-- coverage:start -->.*?<!-- coverage:end -->','<!-- coverage:start -->\n'+'\n'.join(rows)+'\n<!-- coverage:end -->',text,flags=re.S)
 rows=[]
 for r in report:
  meta=json.loads(outputs[OUT/f"{r['election']}.json"])
  rows.append(f"### {r['election']} {r['year']}\n")
  for table,label in [('lists','Lists'),('parties','Constituents')]:
   for kind in ['partisan','neutral']:
    ids=[id for id in meta[table] if kind in meta['gaps'].get(id,{})]
    rows.append(f"- {label} missing {kind}: "+(', '.join(f'`{id}`' for id in ids) if ids else 'none')+'.')
  rows.append('')
 text=re.sub(r'<!-- gaps:start -->.*?<!-- gaps:end -->','<!-- gaps:start -->\n'+'\n'.join(rows)+'\n<!-- gaps:end -->',text,flags=re.S)
 outputs[doc]=text
stale=[p for p,text in outputs.items() if not p.exists() or p.read_text('utf8')!=text]
if CHECK:
 for p in stale:print('differs from a rebuild:',p.relative_to(ROOT))
 sys.exit(1 if stale else 0)
for p in stale:p.write_text(outputs[p],'utf8')
