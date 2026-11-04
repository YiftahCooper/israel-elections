#!/usr/bin/env python3
"""Report whole-list and joint-list constituent logo gaps; no network or mutation.

k26's officialSeats is null and meta.lists only contains joint lists. The
pre-election bloc members in data/meta/k26.json enumerate all eleven reported
winners (including the three single-party lists absent from meta.lists).
"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def coverage(n):
    data = json.loads((ROOT / f'public/data/k{n}.json').read_text())
    meta = json.loads((ROOT / f'data/meta/k{n}.json').read_text())
    entries = json.loads((ROOT / f'data/meta/logos/k{n}.json').read_text())['logos']
    if n == 26:
        scheme = next(s for s in meta['blocSchemes'] if s['id'] == 'pre-election-blocs')
        winners = {m['letters'] for b in scheme['blocs'] for m in b['members']}
        assert len(winners) == 11
        assert {l['letters'] for l in meta['lists'] if l.get('seats', 0) > 0} <= winners
    else:
        winners = {l['letters'] for l in data['lists'] if data['officialSeats'].get(l['id'], 0) > 0}
    hosted = {e.get('letters') for e in entries if e['hosted'] and e['status'] == 'verified'}
    constituents = {p['id'] for l in data['lists'] if l['letters'] in winners for p in l.get('parties', [])}
    party_hosted = {e.get('party') for e in entries if e['hosted'] and e['status'] == 'verified'}
    return dict(election=f'k{n}', winners=len(winners), hosted=len(winners & hosted),
                constituents=len(constituents), constituentHosted=len(constituents & party_hosted),
                missingLists=sorted(winners-hosted), missingConstituents=sorted(constituents-party_hosted))

if __name__ == '__main__':
    print(json.dumps([coverage(n) for n in range(26, 20, -1)], ensure_ascii=False, indent=2))
