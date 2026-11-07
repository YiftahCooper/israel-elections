#!/usr/bin/env python3
"""Normalize bounded official extraction; research only, never writes app data.

First run fetch-member-changes.py. Then run this file from any directory.
No network calls. Outputs retain reported dates, including anomalous intervals.
Citation source IDs resolve through each file's sources map; record IDs identify
atomic OData records. No replacement reason or formal split is inferred.
"""
import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / '.backup-scratch/m2/raw'
OUT = ROOT / 'data/research/knesset-member-changes'
BASE = 'https://knesset.gov.il/Odata/ParliamentInfo.svc/'
ASOF = '2026-11-07'
REVISION = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip()


def load(path):
    return json.loads(path.read_text())


def records(prefix):
    return [r for p in sorted(RAW.glob(prefix + '-[0-9]*.json')) for r in load(p)['value']]


def day(value):
    return value[:10] if value else None


def cite(r):
    return {'source': 'positions', 'recordId': r['PersonToPositionID']}


def source(table, query, **extra):
    return {'url': BASE + table + '?' + urlencode({'$filter': query, '$format': 'json'}),
            'publisher': 'Knesset', 'accessed': ASOF, 'kind': 'official',
            'evidenceFamily': 'knesset-parliament-info', **extra}


def main():
    manifest = load(RAW / 'manifest.json')
    # A partial download must never silently become a complete extraction.
    for prefix in ['positions', 'factions', 'dates']:
        pages = [r for r in manifest if r.get('file', '').startswith(prefix + '-')]
        assert pages and all(r['status'] == 200 for r in pages)
        last = load(RAW / pages[-1]['file'])
        assert not (last.get('odata.nextLink') or last.get('@odata.nextLink')), prefix
        for r in pages:
            assert hashlib.sha256((RAW / r['file']).read_bytes()).hexdigest() == r['sha256']
    positions, factions = records('positions'), records('factions')
    assert len({r['PersonToPositionID'] for r in positions}) == len(positions)
    names = {p['PersonID']: p for p in load(ROOT / 'data/raw/bios/knesset-odata-persons.json')}
    for n in range(1, 26):
        names.update({p['PersonID']: p for p in load(ROOT / f'data/raw/k{n}/knesset-odata-members.json')['persons']})
    OUT.mkdir(parents=True, exist_ok=True)
    summaries = []
    for n in range(1, 27):
        rows = [r for r in positions if r['KnessetNum'] == n]
        mk = sorted([r for r in rows if r['PositionID'] in (43, 61)], key=lambda r: (r['StartDate'], r['PersonID']))
        fr = [r for r in rows if r['PositionID'] == 54]
        opening = min((day(r['StartDate']) for r in mk), default=None)
        term_end = max((day(r['FinishDate']) for r in mk if r['FinishDate']), default=None) if mk and all(r['FinishDate'] for r in mk) else None
        source_map = {'positions': source('KNS_PersonToPosition', f'KnessetNum eq {n} and (PositionID eq 43 or PositionID eq 61 or PositionID eq 54)'),
                      'factions': source('KNS_Faction', f'KnessetNum eq {n}'),
                      'persons': source('KNS_Person', 'PersonID ge 0', accessed='2026-11-04', retainedArtifact=f'data/raw/k{n}/knesset-odata-members.json', note='Retained official name crosswalk, not refreshed; membership IDs take precedence.')}
        doc = {'knesset': n, 'asOf': ASOF, 'coverage': 'partial', 'sources': source_map,
               'certaintyScope': 'confirmed means an official database field or directly observed transition, not independent verification of legal effect or completeness',
               'tenures': [], 'replacements': [], 'factionChanges': [], 'investitureVotes': [],
               'factionRegistry': [], 'scheduledFactionMemberships': [],
               'gaps': ['Replacement reasons and candidate-declination chains not verified.', 'Formal House Committee split/merger/rename/defector decisions not exhaustively retrieved.', 'Investiture roll calls not retrieved: v4 vote query returned HTTP 473; stopped.']}
        for r in mk:
            start, end = day(r['StartDate']), day(r['FinishDate'])
            person = names.get(r['PersonID'])
            segments = []
            for f in sorted(fr, key=lambda x: x['StartDate']):
                if f['PersonID'] != r['PersonID']:
                    continue
                fs, fe = day(f['StartDate']), day(f['FinishDate'])
                # Keep full source dates; link only intersecting positive-length intervals.
                if (not end or fs < end) and (not fe or fe > start):
                    segments.append({'factionId': f['FactionID'], 'nameHe': f['FactionName'], 'start': fs, 'end': fe, 'certainty': 'confirmed', 'cites': [cite(f)]})
            doc['tenures'].append({'id': r['PersonToPositionID'], 'personId': r['PersonID'],
                                   'nameHe': f"{person['FirstName']} {person['LastName']}" if person else None,
                                   'nameCites': [{'source': 'persons', 'recordId': r['PersonID']}],
                                   'start': start, 'end': end, 'factions': segments,
                                   'certainty': 'confirmed', 'cites': [cite(r)]})
        # Candidate ranks are retained repository hints, not freshly checked gazette evidence.
        ranks = defaultdict(list)
        bp = ROOT / f'data/meta/bios/k{n}.json'
        pp = ROOT / f'public/data/k{n}.json'
        if bp.exists() and pp.exists():
            bios = load(bp)['candidates']
            for li in load(pp)['lists']:
                for c in li.get('candidates', []):
                    bio = bios.get(c['id'], {})
                    if bio.get('knessetPersonId') is not None:
                        ranks[bio['knessetPersonId']].append({'listId': li['id'], 'letters': li['letters'], 'rank': c['rank'], 'candidateId': c['id'], 'certainty': 'provisional', 'cites': [{'source': 'candidateCrosswalk'}]})
            source_map['candidateCrosswalk'] = {'url': f'https://github.com/YiftahCooper/israel-elections/blob/{REVISION}/data/meta/bios/k{n}.json', 'publisher': 'israel-elections repository', 'accessed': ASOF, 'kind': 'repository-derived', 'artifacts': [str(bp.relative_to(ROOT)), str(pp.relative_to(ROOT))], 'note': 'Identity crosswalk only; rank must be rechecked against original list and eligibility chain.'}
        def faction_at(pid, date, departing=False):
            return {f['FactionID'] for f in fr if f['PersonID'] == pid and day(f['StartDate']) <= date and (not f['FinishDate'] or (day(f['FinishDate']) >= date if departing else day(f['FinishDate']) > date))}
        paired = set()
        for r in mk:
            date = day(r['StartDate'])
            if date == opening:
                continue
            exits = [e for e in mk if e['PersonID'] != r['PersonID'] and day(e['FinishDate']) == date]
            compatible = [e for e in exits if faction_at(e['PersonID'], date, True) & faction_at(r['PersonID'], date)]
            # A unique coincidence is a hypothesis, not an official replacement notice.
            matched = compatible[0] if len(compatible) == 1 else None
            if matched:
                competing = [e for e in mk if day(e['StartDate']) == date and e['PersonID'] != matched['PersonID'] and faction_at(matched['PersonID'], date, True) & faction_at(e['PersonID'], date)]
                if len(competing) != 1:
                    matched = None
            if matched:
                paired.add(matched['PersonToPositionID'])
            doc['replacements'].append({'kind': 'entryEpisode', 'date': date, 'enteringPersonId': r['PersonID'], 'enteringTenureId': r['PersonToPositionID'], 'leavingPersonId': matched['PersonID'] if matched else None, 'leavingTenureId': matched['PersonToPositionID'] if matched else None, 'sameDateExitCandidates': [e['PersonToPositionID'] for e in exits], 'pairingBasis': 'unique same-date shared-faction candidate; unverified' if matched else 'unresolved', 'reason': 'unknown', 'returningMember': any(e['PersonID'] == r['PersonID'] and e['StartDate'] < r['StartDate'] for e in mk), 'candidatePositionHints': ranks[r['PersonID']], 'nextEligibleCandidateCheck': 'unknown', 'certainty': 'probable' if matched else 'provisional', 'cites': [cite(r)] + ([cite(matched)] if matched else [])})
        for r in mk:
            if r['FinishDate'] and day(r['FinishDate']) != term_end and r['PersonToPositionID'] not in paired:
                doc['replacements'].append({'kind': 'unpairedDeparture', 'date': day(r['FinishDate']), 'leavingPersonId': r['PersonID'], 'leavingTenureId': r['PersonToPositionID'], 'enteringPersonId': None, 'reason': 'unknown', 'certainty': 'provisional', 'cites': [cite(r)]})
        grouped = defaultdict(list)
        for pid in sorted({f['PersonID'] for f in fr}):
            pr = sorted([f for f in fr if f['PersonID'] == pid], key=lambda f: (f['StartDate'], f['PersonToPositionID']))
            for old, new in zip(pr, pr[1:]):
                if old['FactionID'] != new['FactionID'] and old['FinishDate'] == new['StartDate']:
                    grouped[(day(new['StartDate']), old['FactionID'], new['FactionID'])].append((old, new))
        for (date, old, new), pairs in sorted(grouped.items()):
            doc['factionChanges'].append({'kind': 'observedMembershipTransition', 'date': date, 'fromFactionId': old, 'toFactionId': new, 'personIds': [b['PersonID'] for a, b in pairs], 'formalDecisionType': 'unknown', 'certainty': 'confirmed', 'cites': [cite(r) for pair in pairs for r in pair]})
        for f in factions:
            if f['KnessetNum'] == n:
                doc['factionRegistry'].append({'id': f['FactionID'], 'nameHe': f['Name'], 'start': day(f['StartDate']), 'end': day(f['FinishDate']), 'certainty': 'confirmed', 'cites': [{'source': 'factions', 'recordId': f['FactionID']}]})
        for f in fr:
            if day(f['StartDate']) > ASOF:
                doc['scheduledFactionMemberships'].append({'personId': f['PersonID'], 'factionId': f['FactionID'], 'nameHe': f['FactionName'], 'start': day(f['StartDate']), 'end': day(f['FinishDate']), 'certainty': 'provisional', 'cites': [cite(f)]})
        boundaries = sorted({day(r[k]) for r in mk for k in ['StartDate', 'FinishDate'] if r[k] and day(r[k]) <= ASOF})
        anomalies = []
        for date in boundaries:
            if date == term_end:
                continue
            active = {r['PersonID'] for r in mk if day(r['StartDate']) <= date and (not r['FinishDate'] or day(r['FinishDate']) > date)}
            if len(active) != 120:
                anomalies.append({'date': date, 'members': len(active), 'differenceFrom120': len(active)-120})
        faction_anomalies = []
        for date in sorted(set(boundaries) | {day(f[k]) for f in fr for k in ['StartDate', 'FinishDate'] if f[k] and day(f[k]) <= ASOF}):
            if not opening or date < opening or (term_end and date >= term_end):
                continue
            active = {r['PersonID'] for r in mk if day(r['StartDate']) <= date and (not r['FinishDate'] or day(r['FinishDate']) > date)}
            assigned = {pid: faction_at(pid, date) for pid in active}
            missing = sorted(pid for pid, fids in assigned.items() if not fids)
            multiple = sorted(pid for pid, fids in assigned.items() if len(fids) > 1)
            if missing or multiple:
                faction_anomalies.append({'date': date, 'missingFactionPersonIds': missing, 'multipleFactionPersonIds': multiple})
        opening_count = len({r['PersonID'] for r in mk if day(r['StartDate']) == opening})
        doc['checks'] = {'openingDateReported': opening, 'openingMembers': opening_count, 'opening120': opening_count == 120 if mk else None, 'dateConvention': 'diagnostic half-open [start,end); no assertion of legal endpoint semantics', 'seatCountAnomalies': anomalies, 'factionSizeReconciliation': 'source membership assignments checked at every date boundary; formal decisions not independently verified', 'factionAssignmentAnomalies': faction_anomalies, 'tenuresWithoutIntersectingFaction': [t['id'] for t in doc['tenures'] if not t['factions']], 'zeroOrNegativeTenures': [t['id'] for t in doc['tenures'] if t['end'] and t['end'] <= t['start']]}
        if not mk:
            doc['gaps'].append('No MK-position rows returned; future faction-position rows do not establish service. Opening is scheduled after as-of date.')
        # One array item per line keeps normalized evidence compact and reviewable.
        encode = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':'))
        lines = []
        for key, value in doc.items():
            if isinstance(value, list) and value:
                rendered = '[\n' + ',\n'.join('  ' + encode(item) for item in value) + '\n ]'
            else:
                rendered = encode(value)
            lines.append(' ' + encode(key) + ':' + rendered)
        (OUT / f'k{n}.json').write_text('{\n' + ',\n'.join(lines) + '\n}\n')
        summary = {'knesset': n, 'tenures': len(mk), 'people': len({r['PersonID'] for r in mk}), 'factionRows': len(fr), 'opening': opening_count, 'entryEpisodes': sum(r['kind'] == 'entryEpisode' for r in doc['replacements']), 'probablePairs': sum(r['certainty'] == 'probable' for r in doc['replacements']), 'unpairedDepartures': sum(r['kind'] == 'unpairedDeparture' for r in doc['replacements']), 'factionTransitions': len(grouped), 'affectedMemberTransitions': sum(len(p) for p in grouped.values()), 'seatAnomalyBoundaries': len(anomalies)}
        summaries.append(summary)
    (RAW.parent / 'summary.json').write_text(json.dumps(summaries, indent=2) + '\n')
    print(json.dumps(summaries, indent=2))


if __name__ == '__main__':
    main()
