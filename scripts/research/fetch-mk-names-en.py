#!/usr/bin/env python3
"""Fetch the official English name of every Knesset member the candidate bios link to.

Source: the Knesset website's English member header (official), one request per member site id:
  https://knesset.gov.il/WebSiteApi/knessetapi/MKs/GetMkDetailsHeader?mkId={siteId}&languageKey=en
Only the id and the "Name" field are retained, in data/raw/bios/knesset-site-mk-names-en.json
(sorted by id). The name is the member's current English name on the Knesset site, which can differ
from the name on an old ballot (the Hebrew registered name is always shown beside it).
Usage: python3 scripts/research/fetch-mk-names-en.py   (serial, ~3 requests a second)
"""
import glob, json, os, time, urllib.request

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'data/raw/bios/knesset-site-mk-names-en.json')
URL = 'https://knesset.gov.il/WebSiteApi/knessetapi/MKs/GetMkDetailsHeader?mkId={}&languageKey=en'

ids = set()
for f in glob.glob(os.path.join(ROOT, 'data/meta/bios/k*.json')):
    for e in json.load(open(f, encoding='utf8'))['candidates'].values():
        if e.get('knesset') and e['knesset'].get('siteId'):
            ids.add(int(e['knesset']['siteId']))
def save(rows):
    # written as it goes, so an interrupted run resumes where it stopped; unanswered ids (null) are retried next run
    with open(OUT, 'w', encoding='utf8') as f:
        f.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in sorted(rows, key=lambda r: r['siteId'])) + '\n]\n')
have = {r['siteId']: r for r in json.load(open(OUT, encoding='utf8'))} if os.path.exists(OUT) else {}
rows = []
for sid in sorted(ids):
    if sid in have and have[sid]['nameEn']:
        rows.append(have[sid]); continue
    req = urllib.request.Request(URL.format(sid), headers={'User-Agent': 'israel-elections-explorer research script', 'Accept': 'application/json'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
            break
        except Exception as ex:  # transient network error: retry, then record nothing
            d = None; time.sleep(2 + attempt * 3)
    name = (d or {}).get('Name')
    rows.append({'siteId': sid, 'nameEn': name.strip() if isinstance(name, str) and name.strip() else None})
    if len(rows) % 25 == 0: save(rows + [have[i] for i in sorted(have) if i not in {r['siteId'] for r in rows}])
    time.sleep(0.3)
save(rows)
print(len(rows), 'members,', sum(1 for r in rows if r['nameEn']), 'with an English name')
