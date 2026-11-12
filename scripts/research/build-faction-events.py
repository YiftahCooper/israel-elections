#!/usr/bin/env python3
"""Project retained Knesset membership transitions into dated research events.

Run from the repository root. No network. Does not classify a membership change as
a legal split, merger, rename or party foundation. Retains the source's partial
coverage and unknown formal decision type. Existing researched events win.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'data/research/knesset-events'


def ordinal(n):
    return str(n) + ('th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th'))


def build(check=False):
    # Reuse the app's reviewed English display names; never publish raw faction IDs
    # or guess translations from a faction's elected list.
    faction_names = json.loads(subprocess.check_output([
        'node', '--input-type=module', '-e',
        "import {compileMkHistory} from './scripts/mk-history-runtime.ts'; "
        "process.stdout.write(JSON.stringify(compileMkHistory().factions));"
    ], cwd=ROOT, text=True))
    curated = json.loads((ROOT / 'data/meta/knesset-faction-names-en.json').read_text())['names']
    norm = lambda s: s.replace('\"', '״').replace("'", '׳')
    curated = {norm(k): v for k, v in curated.items()}
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
        for fid, he in names.items():
            faction_names[str(fid)][1] = curated.get(norm(he), faction_names[str(fid)][1])
        before = json.dumps(doc, ensure_ascii=False)
        boundary_path = ROOT / f'data/raw/research/k{n}-term-boundary.json'
        if boundary_path.exists():
            boundary = json.loads(boundary_path.read_text())
            date = boundary['termEnd']
            event = {
                'id': f'k{n}-term-end', 'date': date, 'kind': 'term-end', 'who': {},
                'summary': {'en': f'{ordinal(n)} Knesset membership ends when the {ordinal(n+1)} Knesset begins.',
                            'he': f'כהונת הכנסת ה־{n} הסתיימה עם תחילת כהונת הכנסת ה־{n+1}.'},
                'classification': 'counts',
                'reason': 'The membership boundary is the new Knesset’s start, not election day or the snapshot date.',
                'seatsAfter': None, 'sources': boundary['eventSources'],
                'certainty': 'confirmed', 'evidenceClass': 'Official',
                'classificationBasis': 'Official membership endpoints and next Knesset opening record agree.',
                'marker': None, 'importance': 'simple',
                'importanceReason': 'This establishes a parliamentary term boundary or changes who holds the premiership.'}
            doc['events'] = [e for e in doc['events'] if e['id'] != event['id']] + [event]
            doc['events'].sort(key=lambda e: e['date'])
            doc['asOf'] = boundary['retrievedAt'][:10]
        def english(fid):
            value = faction_names[str(fid)][1]
            if not value:
                raise ValueError(f'Missing English faction name: {fid}')
            return value

        count = 0
        for event in doc['events']:
            if event['kind'] in ('term-start', 'term-end'):
                event['summary']['en'] = re.sub(r'^\d+(?:st|nd|rd|th) Knesset', ordinal(n) + ' Knesset', event['summary']['en'])
            if event['kind'] == 'faction-membership-change':
                event['summary']['he'] = event['summary']['he'].replace('(1 ח״כים)', '(ח״כ אחד)')
                if re.fullmatch(r'\d+ MKs recorded moving between factions \d+ and \d+\.', event['summary']['en']):
                    old, new = event['who']['factionIds']
                    size = len(event['who']['personIds'])
                    old_en, new_en = english(old), english(new)
                    event['summary']['en'] = f"{size} {'MK' if size == 1 else 'MKs'} recorded moving from {old_en} to {new_en}."
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
                    'en': f"{len(change['personIds'])} {'MK' if len(change['personIds']) == 1 else 'MKs'} recorded moving from {english(old)} to {english(new)}.",
                    'he': f"רישום החברות עבר מסיעת {names.get(old, str(old))} לסיעת {names.get(new, str(new))} ({'ח״כ אחד' if len(change['personIds']) == 1 else str(len(change['personIds'])) + ' ח״כים'})."},
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
        if count:
            doc['events'].sort(key=lambda e: (e['date'], e['id']))
            doc['asOf'] = '2026-11-09'
        if json.dumps(doc, ensure_ascii=False) != before:
            if check:
                raise AssertionError(f'{target} needs rebuilding')
            target.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
        counts[n] = count
    return counts


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    print(json.dumps(build(parser.parse_args().check)))
