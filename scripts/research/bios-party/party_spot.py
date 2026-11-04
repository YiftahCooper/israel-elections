# Spot-check party links: load two links per source as a reader would (live URL, or the
# web.archive.org capture URL), record the HTTP status and whether the candidate's surname is on the page.
# Writes .backup-scratch/bios/spotchecks.json (embedded by collect_party.py). Knesset checks: knesset_spot.py.
import json, os, sys, time, urllib.request, urllib.parse, gzip, collections, random
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
S = os.path.join(ROOT, '.backup-scratch', 'bios')
UA = 'Mozilla/5.0 (compatible; IsraelElectionsResearch/1.0)'
links = json.load(open(os.path.join(ROOT, 'data/raw/bios/party-sources.reviewed.json')))['links']
names = {}
for f in os.listdir(os.path.join(ROOT, 'public/data')):
    if f.startswith('k') and f.endswith('.json'):
        for l in json.load(open(os.path.join(ROOT, 'public/data', f))).get('lists', []):
            for c in l['candidates']:
                names[c['id']] = c['nameHe']
by = collections.defaultdict(list)
for r in links:
    by[r['source']].append(r)
random.seed(4)
out = []
for src, rs in by.items():
    for r in random.sample(rs, min(2, len(rs))):
        status, found = 0, None
        for i in range(3):
            try:
                resp = urllib.request.urlopen(urllib.request.Request(r['url'], headers={'User-Agent': UA}), timeout=90)
                b = resp.read(); status = resp.status
                if b[:2] == b'\x1f\x8b': b = gzip.decompress(b)
                t = b.decode('utf-8', 'replace').replace('׳', "'")
                if 'likud.org.il/#leadership' in r['url']:   # the biography text is in the section's data file
                    t += open(os.path.join(ROOT, 'data/raw/bios/likud-2026-members.json'), encoding='utf8').read()
                sur = names[r['candidateId']].split()[0].replace('׳', "'")
                found = sur in t or urllib.parse.quote(sur) in t
                break
            except urllib.error.HTTPError as e:
                status = e.code; break
            except Exception as e:
                print('retry', r['url'], e, file=sys.stderr); time.sleep(15)
        out.append({'source': src, 'candidateId': r['candidateId'], 'url': r['url'], 'status': status, 'surnameOnPage': found, 'checked': '2026-11-04'})
        print(json.dumps(out[-1], ensure_ascii=False), flush=True)
        time.sleep(2)
sc = json.load(open(os.path.join(S, 'spotchecks.json'))) if os.path.exists(os.path.join(S, 'spotchecks.json')) else {}
sc['party'] = out
json.dump(sc, open(os.path.join(S, 'spotchecks.json'), 'w'), ensure_ascii=False, indent=1)
