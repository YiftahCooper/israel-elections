#!/usr/bin/env python3
"""Validate the research overlays and committed logo assets (standard library only)."""
import hashlib
import json
from pathlib import Path
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {s['id']: s for s in json.loads((ROOT / 'data/meta/logos/sources.json').read_text())['sources']}
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
        assert isinstance(item['hosted'], bool)
        if not item['hosted']:
            assert item['file'] is None
            assert item['status'] in ('download-unavailable', 'unresolved')
            counts[item['status']] += 1
            continue
        assert item['status'] == 'verified'
        assert item['assetSourceUrl'].startswith('https://')
        if item['rights'] == 'fair-use-identification':
            assert source['sourceType'] in ('official party campaign website', 'official party social publication', 'official CEC publication')
            assert item['inUseDate']
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
