#!/usr/bin/env python3
"""Report whole-list and joint-list constituent logo gaps; no network or mutation.

k26's officialSeats is null. Use the application's historical allocation of
the retained CEC final count (k26-localities-csv, 3 November 2026), not a bloc
membership assumption. Count displayed list.logo fields in the built datasets.
"""
import json
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def coverage(n):
    data = json.loads((ROOT / f'public/data/k{n}.json').read_text())
    meta = json.loads((ROOT / f'data/meta/k{n}.json').read_text())
    entries = json.loads((ROOT / f'data/meta/logos/k{n}.json').read_text())['logos']
    if n == 26:
        ids = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', '''
import {readFileSync} from 'node:fs';
import {baselineOf, allocationOf} from './src/app/derive.ts';
const d = JSON.parse(readFileSync('public/data/k26.json'));
console.log(JSON.stringify(allocationOf(baselineOf(d)).lists.filter(l => l.seats > 0).map(l => l.id)));
'''], cwd=ROOT, text=True))
        winners = {l['letters'] for l in data['lists'] if l['id'] in ids}
    else:
        winners = {l['letters'] for l in data['lists'] if data['officialSeats'].get(l['id'], 0) > 0}
    hosted = {l['letters'] for l in data['lists'] if l.get('logo')}
    constituents = {p['id'] for l in data['lists'] if l['letters'] in winners for p in l.get('parties', [])}
    party_hosted = {e.get('party') for e in entries if e['hosted'] and e['status'] == 'verified'}
    return dict(election=f'k{n}', winners=len(winners), hosted=len(winners & hosted),
                constituents=len(constituents), constituentHosted=len(constituents & party_hosted),
                missingLists=sorted(winners-hosted), missingConstituents=sorted(constituents-party_hosted))

if __name__ == '__main__':
    print(json.dumps([coverage(n) for n in range(1, 27)], ensure_ascii=False, indent=2))
