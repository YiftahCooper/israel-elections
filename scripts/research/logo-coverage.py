#!/usr/bin/env python3
"""Report whole-list and joint-list constituent logo gaps; no network or mutation.

k26's officialSeats is null. Use the application's historical allocation of
the retained CEC final count (k26-localities-csv, 3 November 2026), not a bloc
membership assumption. Count only refs matching this election’s verified catalogue.
"""
import json
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def coverage(n):
    data = json.loads((ROOT / f'public/data/k{n}.json').read_text())
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
    def same_election(item, key):
        logo = item.get('logo') or {}
        return bool(logo) and not logo.get('year') and any(
            e.get(key) == item.get('letters' if key == 'letters' else 'id')
            and e.get('hosted') and e.get('status') == 'verified'
            and e.get('file') == logo.get('file') for e in entries)
    hosted = {l['letters'] for l in data['lists'] if same_election(l, 'letters')}
    constituents = {p['id'] for l in data['lists'] if l['letters'] in winners for p in l.get('parties', [])}
    party_hosted = {p['id'] for l in data['lists'] for p in l.get('parties', []) if same_election(p, 'party')}
    all_parties = [p for l in data['lists'] for p in l.get('parties', [])]
    return dict(election=f'k{n}', allLists=len(data['lists']),
                englishLabels=sum(bool(l['shortEn']) for l in data['lists']),
                unofficialTransliterations=sum(l.get('englishName', {}).get('kind') == 'transliteration' for l in data['lists']),
                allListLogos=len(hosted), nearestPeriodListLogos=sum(bool(l.get('logo', {}).get('year')) for l in data['lists']),
                allConstituents=len(all_parties), allConstituentLogos=sum(same_election(p, 'party') for p in all_parties),
                nearestPeriodConstituentLogos=sum(bool(p.get('logo', {}).get('year')) for p in all_parties),
                missingAllLists=[l['id'] for l in data['lists'] if not same_election(l, 'letters')],
                missingAllConstituents=[p['id'] for p in all_parties if not same_election(p, 'party')],
                winners=len(winners), hosted=len(winners & hosted),
                constituents=len(constituents), constituentHosted=len(constituents & party_hosted),
                missingLists=sorted(winners-hosted), missingConstituents=sorted(constituents-party_hosted))

if __name__ == '__main__':
    print(json.dumps([coverage(n) for n in range(1, 27)], ensure_ascii=False, indent=2))
