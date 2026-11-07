#!/usr/bin/env python3
"""Discover investiture vote titles in official v4; raw output only in scratch.

Run discovery, inspect vote-discovery-*.json, then pass verified vote IDs:
python3 scripts/research/fetch-member-change-votes.py 12345 67890
No retries or alternate hosts; each request is at least 1.1 seconds apart.
"""
import sys
import json
import time
import urllib.parse
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
import importlib.util

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('member_fetch', Path(__file__).with_name('fetch-member-changes.py'))
common = importlib.util.module_from_spec(spec)
spec.loader.exec_module(common)
BASE = 'https://knesset.gov.il/ODATAV4/ParliamentInfo/'


def main():
    common.OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    jobs = [('vote-' + x, 'KNS_PlenumVoteResult', {'$filter': 'VoteID eq ' + str(int(x)), '$orderby': 'Id'}) for x in sys.argv[1:]]
    if not jobs:
        jobs = [('vote-discovery', 'KNS_PlenumVote', {'$filter': "contains(VoteTitle,'כינון') or contains(VoteSubject,'כינון') or contains(VoteTitle,'כינונה') or contains(VoteSubject,'כינונה')", '$orderby': 'Id'})]
    try:
        for name, table, params in jobs:
            url = BASE + table + '?' + urllib.parse.urlencode({**params, '$format': 'json'})
            seen = set()
            for page in range(1, 101):
                if url in seen or not url.startswith(BASE):
                    raise RuntimeError('Unsafe or repeated continuation')
                seen.add(url)
                time.sleep(1.1)
                rec = {'url': url, 'publisher': 'Knesset', 'accessedAt': datetime.now(timezone.utc).isoformat()}
                manifest.append(rec)
                try:
                    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': common.UA}), timeout=40) as response:
                        body = response.read()
                        rec.update(status=response.status, retryAfter=response.headers.get('Retry-After'))
                except urllib.error.HTTPError as exc:
                    rec.update(status=exc.code, retryAfter=exc.headers.get('Retry-After'), error=str(exc))
                    raise
                if rec['retryAfter'] or any(s in body.lower() for s in [b'checking your browser', b'cf-mitigated', b'challenge-platform']):
                    raise RuntimeError('Challenge or Retry-After; stopped')
                payload = json.loads(body)
                rec.update(file=f'{name}-{page:03}.json', rows=len(payload['value']), sha256=common.hashlib.sha256(body).hexdigest())
                (common.OUT / rec['file']).write_bytes(body)
                print(name, page, rec['rows'], flush=True)
                link = payload.get('@odata.nextLink') or payload.get('odata.nextLink')
                if not link:
                    break
                url = urllib.parse.urljoin(BASE, link)
                if '$format=' not in url:
                    url += '&$format=json'
            else:
                raise RuntimeError('Page bound reached')
    finally:
        name = 'vote-results-manifest.json' if sys.argv[1:] else 'vote-discovery-manifest.json'
        (common.OUT / name).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
