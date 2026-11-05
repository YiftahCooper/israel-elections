#!/usr/bin/env python3
"""Validate the research overlays and committed logo assets (standard library only)."""
from logo_dates import valid_campaign_date
import hashlib
import json
from pathlib import Path
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {s['id']: s for s in json.loads((ROOT / 'data/meta/logos/sources.json').read_text())['sources']}
RAW_SOURCES = {s['id']: s for s in json.loads((ROOT / 'data/raw/SOURCES.json').read_text())}
ELECTIONS = json.loads((ROOT / 'public/data/elections.json').read_text())
seen_files = set()
counts = {'hosted': 0, 'download-unavailable': 0, 'unresolved': 0}
for n in range(1, 27):
    data = json.loads((ROOT / f'public/data/k{n}.json').read_text())
    meta = json.loads((ROOT / f'data/meta/k{n}.json').read_text())
    overlay = json.loads((ROOT / f'data/meta/logos/k{n}.json').read_text())
    assert overlay['electionId'] == f'k{n}'
    letters = {item['letters'] for item in data['lists']}
    parties = {p['id'] for item in meta['lists'] for p in item.get('parties', [])}
    identities = set()
    for item in overlay['logos']:
        assert ('letters' in item) != ('party' in item), item
        kind = 'letters' if 'letters' in item else 'party'
        identity = (kind, item[kind])
        assert identity not in identities, identity
        identities.add(identity)
        assert item[kind] in (letters if kind == 'letters' else parties), item
        assert item['confidence'] in ('high', 'medium')
        assert item['inUseEvidence'] and item['attribution'] and item['licence']
        assert item['rights'] in ('free-licence', 'fair-use-identification')
        source = SOURCES[item['evidenceId']]
        assert item['sourceUrl'] == source['sourceUrl']
        if 'rawEvidence' in item:
            evidence = item['rawEvidence']
            assert evidence == source['rawEvidence'], item
            assert 'page' in evidence and set(evidence) <= {'page', 'asset'}, item
            for kind, source_id in evidence.items():
                record = RAW_SOURCES[source_id]
                relative = Path(record['file'])
                assert relative.parts == ('logos', f'k{n}', relative.name), record
                content = (ROOT / 'data/raw' / relative).read_bytes()
                assert len(content) == record['bytes'], record
                assert hashlib.sha256(content).hexdigest() == record['sha256'], record
                assert record['url'].startswith('https://') and record['archiveUsed'] and record['retrievedAt'], record
                if kind == 'page':
                    assert record['captureTimestamp'] == item['archiveTimestamp'], record
                else:
                    assert record['sha256'] == item['originalSha256'], record
                    assert record['captureTimestamp'] == item.get('assetArchiveTimestamp'), record
        assert isinstance(item['hosted'], bool)
        if not item['hosted']:
            assert item['file'] is None
            assert item['status'] in ('download-unavailable', 'unresolved')
            counts[item['status']] += 1
            continue
        assert item['status'] == 'verified'
        assert item['assetSourceUrl'].startswith('https://')
        if item['rights'] == 'fair-use-identification':
            assert source['sourceType'] in ('official party campaign website', 'official party social publication', 'official CEC publication', 'official party campaign publication')
            if source['sourceType'] == 'official party campaign publication':
                evidence = item['publicationEvidence']
                assert evidence == source['publicationEvidence'], item
                for kind in ('page', 'asset'):
                    record = RAW_SOURCES[evidence[kind]]
                    relative = Path(record['file'])
                    assert relative.parts == ('logos', f'k{n}', relative.name), record
                    original = (ROOT / 'data/raw' / relative).read_bytes()
                    assert len(original) == record['bytes'], record
                    assert hashlib.sha256(original).hexdigest() == record['sha256'], record
                    assert record['url'].startswith(('https://', 'http://')) and record['retrievedAt'], record
                    if kind == 'asset':
                        assert record['sha256'] == item['originalSha256'], record
                        assert record['url'] == item.get('retrievedAssetUrl', item['assetSourceUrl']), record
                assert evidence['publicationDate'] == item['inUseDate'], item
                x0, y0, x1, y1 = evidence['cropBox']
                width, height = evidence['originalDimensions']
                assert all(type(v) is int for v in (x0, y0, x1, y1, width, height)), item
                assert 0 <= x0 < x1 <= width and 0 <= y0 < y1 <= height, item
            assert valid_campaign_date(item, data['electionDate'], ELECTIONS), item
            if item.get('dateBasis') == 'year-single-election':
                assert source['sourceType'] == 'official party campaign publication', item
                assert item['dateBasis'] == source.get('dateBasis') and item['dateEvidence'] == source.get('dateEvidence'), item
            if item.get('archiveUrl') or item.get('archiveTimestamp'):
                assert item['archiveUrl'] and item['archiveTimestamp']
                assert item['archiveTimestamp'][:8] == item['inUseDate'].replace('-', '')
            assert item['inUseDate'] <= data['electionDate']
        else:
            assert source['licence'] in ('Public domain', 'CC0', 'CC BY-SA 3.0', 'CC BY-SA 4.0')
        relative = Path(item['file'])
        assert relative.parts[0] == 'logos' and len(relative.parts) == 2
        assert data['electionDate'][:4] in relative.stem
        asset = ROOT / 'public' / relative
        content = asset.read_bytes()
        assert len(content) == item['bytes'], asset
        assert len(content) < 60_000, asset
        assert hashlib.sha256(content).hexdigest() == item['sha256'], asset
        assert len(item['originalSha256']) == 64
        if asset.suffix == '.png':
            assert content[:8] == b'\x89PNG\r\n\x1a\n'
            width, height = struct.unpack('>II', content[16:24])
            assert 0 < max(width, height) <= 256, asset
        else:
            assert asset.suffix == '.svg'
            assert b'<!ENTITY' not in content.upper(), asset
            svg = ET.fromstring(content)
            assert svg.tag == '{http://www.w3.org/2000/svg}svg', asset
            for element in svg.iter():
                assert element.tag.split('}')[-1] not in ('script', 'foreignObject'), asset
                for name, value in element.attrib.items():
                    assert not name.lower().startswith('on'), asset
                    if name.split('}')[-1] == 'href':
                        assert value.startswith('#'), (asset, value)
        seen_files.add(asset.resolve())
        counts['hosted'] += 1
for asset in (ROOT / 'public/logos').iterdir():
    assert asset.resolve() in seen_files, f'Unreferenced asset: {asset}'
for folder in ('data/meta/logos',):
    for path in (ROOT / folder).glob('*'):
        if path.suffix in ('.md', '.json'):
            assert 'en.wikipedia.org' not in path.read_text(), path
print(f'Validated 26 overlays, {len(SOURCES)} source records, {len(seen_files)} assets: {counts}')
report = ROOT / 'docs/research/party-logos.md'
if report.exists():
    assert 'en.wikipedia.org' not in report.read_text()
