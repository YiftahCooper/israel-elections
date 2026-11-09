#!/usr/bin/env python3
"""Project retained Knesset membership transitions into dated research events.

Run from the repository root. No network. Does not classify a membership change as
a legal split, merger, rename or party foundation. Retains the source's partial
coverage and unknown formal decision type. Existing researched events win.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'data/research/knesset-events'


def build():
    counts = {}
    for n in range(1, 26):
        retained = f'data/research/knesset-member-changes/k{n}.json'
        source = json.loads((ROOT / retained).read_text())
        target = OUT / f'k{n}.json'
        doc = json.loads(target.read_text()) if target.exists() else {
            'schemaVersion': 1, 'knesset': n, 'asOf': '2026-11-09', 'coverage': 'partial',
            'scope': 'Observed dated faction membership transitions, not a complete register of House Committee decisions.',
            'seatsAfterDefinition': 'Null means no government-support assignment is established by these records.',
            'events': []}
        names = {f['id']: f['nameHe'] for f in source['factionRegistry']}
        count = 0
        for i, change in enumerate(source['factionChanges']):
            old, new = change['fromFactionId'], change['toFactionId']
            # Respect earlier manually researched records instead of duplicating them.
            existing = next((e for e in doc['events'] if e['kind'] == 'faction-membership-change'
                             and e['date'] == change['date']
                             and e.get('who', {}).get('factionIds') == [old, new]
                             and set(e.get('who', {}).get('personIds', [])) == set(change['personIds'])), None)
            if existing:
                continue
            locator = f"{retained} factionChanges[{i}], KNS_PersonToPosition records " + ', '.join(str(c['recordId']) for c in change['cites'])
            doc['events'].append({
                'id': f'k{n}-observed-faction-{i}', 'date': change['date'],
                'kind': 'faction-membership-change',
                'who': {'personIds': change['personIds'], 'factionIds': [old, new]},
                'summary': {
                    'en': f"{len(change['personIds'])} MKs recorded moving between factions {old} and {new}.",
                    'he': f"רישום החברות עבר מסיעת {names.get(old, str(old))} לסיעת {names.get(new, str(new))} ({len(change['personIds'])} ח״כים)."},
                'classification': 'counts',
                'reason': 'Official dated membership transition. Formal split, merger or rename requires a separate decision record.',
                'seatsAfter': None,
                'sources': [{**{k: v for k, v in source['sources']['positions'].items() if k in ['url', 'publisher', 'accessed', 'evidenceFamily']},
                             'date': None, 'type': 'official', 'inspection': 'retained-record',
                             'locator': locator, 'supportingNote': 'The cited official membership fields establish the date, faction IDs and people only.',
                             'effectiveDate': change['date']}],
                'certainty': 'confirmed', 'evidenceClass': 'Official',
                'classificationBasis': source['certaintyScope'],
                'formalDecisionType': 'unknown',
            })
            count += 1
        doc['events'].sort(key=lambda e: (e['date'], e['id']))
        if count:
            doc['asOf'] = '2026-11-09'
            target.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
        counts[n] = count
    return counts


if __name__ == '__main__':
    print(json.dumps(build()))
