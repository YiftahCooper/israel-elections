#!/usr/bin/env python3
"""Bounded public OData extraction. Run from repository root; no dependencies.

python3 scripts/research/fetch-member-changes.py
Raw responses and request manifest go only to .backup-scratch/m2/raw/.
Stops on refusal, challenge, Retry-After or any error; no automatic retries.
"""
import hashlib
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = 'https://knesset.gov.il/Odata/ParliamentInfo.svc/'
UA = 'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)'
OUT = Path(__file__).resolve().parents[2] / '.backup-scratch/m2/raw'


def fetch():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    jobs = {
        'positions': ('KNS_PersonToPosition', {
            '$filter': 'KnessetNum ge 1 and KnessetNum le 26 and (PositionID eq 43 or PositionID eq 61 or PositionID eq 54)',
            '$orderby': 'PersonToPositionID',
            '$select': 'PersonToPositionID,PersonID,PositionID,KnessetNum,StartDate,FinishDate,FactionID,FactionName',
        }),
        'factions': ('KNS_Faction', {'$filter': 'KnessetNum ge 1 and KnessetNum le 26', '$orderby': 'FactionID'}),
        'dates': ('KNS_KnessetDates', {'$filter': 'KnessetNum ge 1 and KnessetNum le 26', '$orderby': 'KnessetDateID'}),
    }
    try:
        for name, (table, query) in jobs.items():
            url = BASE + table + '?' + urllib.parse.urlencode({**query, '$format': 'json'})
            seen = set()
            for page in range(1, 151):
                if url in seen:
                    raise RuntimeError('Repeated continuation URL')
                seen.add(url)
                time.sleep(1.1)
                rec = {'url': url, 'accessedAt': datetime.now(timezone.utc).isoformat(), 'publisher': 'Knesset'}
                manifest.append(rec)
                try:
                    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as response:
                        body = response.read()
                        rec.update(status=response.status, retryAfter=response.headers.get('Retry-After'))
                except urllib.error.HTTPError as exc:
                    rec.update(status=exc.code, retryAfter=exc.headers.get('Retry-After'), error=str(exc))
                    raise
                rec['sha256'] = hashlib.sha256(body).hexdigest()
                if rec['retryAfter'] or any(s in body.lower() for s in [b'checking your browser', b'cf-mitigated', b'challenge-platform']):
                    raise RuntimeError('Retry-After or browser challenge; stopped')
                payload = json.loads(body)
                rows = payload.get('value', payload.get('d', {}).get('results', []))
                rec.update(file=f'{name}-{page:03}.json', rows=len(rows))
                (OUT / rec['file']).write_bytes(body)
                print(name, page, len(rows), flush=True)
                link = payload.get('odata.nextLink') or payload.get('@odata.nextLink') or payload.get('d', {}).get('__next')
                if not link:
                    break
                url = urllib.parse.urljoin(BASE, link)
                if not url.startswith(BASE):
                    raise RuntimeError('Unexpected continuation host/path')
                if '$format=' not in url:
                    url += '&$format=json'
            else:
                raise RuntimeError('Page bound reached')
    finally:
        (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    fetch()
