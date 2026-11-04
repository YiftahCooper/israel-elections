#!/usr/bin/env python3
"""Recheck retained party-link URLs without changing accepted evidence or overlays.

python3 -I scripts/research/check-party-link-urls.py [--include-archive]
Output: .backup-scratch/party-links/recheck.json. Standard library, Python 3.10+.
Archive requests (including CDX) share a five-second interval, honor Retry-After,
and back off on 429/503. Never use a proxy or bypass an access challenge.
"""
import datetime
import email.utils
import hashlib
import json
from pathlib import Path
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'.backup-scratch/party-links'
OUT.mkdir(parents=True, exist_ok=True)
urls = set()
for file in (ROOT/'data/meta/party-links').glob('k*.json'):
    data = json.loads(file.read_text())
    for table in [data['lists'], data['parties']]:
        urls.update(e['url'] for links in table.values() for e in links)
if '--include-archive' in sys.argv:
    for r in json.loads((ROOT/'data/raw/party-links/archive-checks.json').read_text()):
        urls.add(r['cdxUrl'])
last_archive = 0.0
results = []
for url in sorted(urls):
    archive = urllib.parse.urlparse(url).hostname == 'web.archive.org'
    if archive and '--include-archive' not in sys.argv:
        continue
    if 'en.wikipedia.org' in url or 'en.m.wikipedia.org' in url:
        raise ValueError('English Wikipedia is forbidden')
    row = {'url': url, 'retrievedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    for attempt in range(3):
        if archive:
            time.sleep(max(0, 5 - (time.monotonic() - last_archive)))
            last_archive = time.monotonic()
        try:
            request = urllib.request.Request(urllib.parse.quote(url, safe=':/?=&%#'), headers={'User-Agent':'ElectionResearch/1.0'})
            with urllib.request.urlopen(request, timeout=40) as response:
                content = response.read(5_000_001)
                row.update(status=response.status, resolvedUrl=response.url, bytes=len(content), sha256=hashlib.sha256(content).hexdigest())
            break
        except urllib.error.HTTPError as error:
            row['error'] = str(error)
            if error.code not in [429, 503] or attempt == 2:
                break
            delay = 60 * 2**attempt
            retry = error.headers.get('Retry-After')
            if retry:
                try:
                    delay = max(delay, int(retry))
                except ValueError:
                    delay = max(delay, (email.utils.parsedate_to_datetime(retry) - datetime.datetime.now(datetime.timezone.utc)).total_seconds())
            time.sleep(delay)
        except Exception as error:
            row['error'] = str(error)
            break
    results.append(row)
    (OUT/'recheck.json').write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n')
    print(row.get('status', row.get('error')), url, flush=True)
