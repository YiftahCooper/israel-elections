# Spot-check the Knesset member-page id: load an archived old-site page mk.asp?mk_individual_id_t=<SiteId>
# and confirm the member's surname appears; also record whether the new-site URL has captures.
import json, sys, os, re, time, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../..'))  # repository root
persons = {p['PersonID']: p for p in json.load(open(f'{ROOT}/data/raw/bios/knesset-odata-persons.json'))}
site = {r['KnsID']: r['SiteId'] for r in json.load(open(f'{ROOT}/data/raw/bios/knesset-odata-mk-site-codes.json'))}
pids = [int(x) for x in sys.argv[1:]]
def get(u, t=60):
    for i in range(4):
        try:
            return urllib.request.urlopen(u, timeout=t).read()
        except Exception as e:
            print('retry', u, e, file=sys.stderr); time.sleep(10)
    return b''
out = []
for pid in pids:
    sid = site[pid]; p = persons[pid]
    old = f'www.knesset.gov.il/mk/heb/mk.asp?mk_individual_id_t={sid}'
    cdx = get('http://web.archive.org/cdx/search/cdx?' + urllib.parse.urlencode({'url': old, 'filter': 'statuscode:200', 'limit': '1', 'fl': 'timestamp,original'})).decode('utf8', 'replace').split()
    rec = {'personId': pid, 'siteId': sid, 'name': f"{p['FirstName']} {p['LastName']}"}
    if len(cdx) == 2:
        ts, orig = cdx
        b = get(f'http://web.archive.org/web/{ts}id_/{orig}')
        t = b.decode('windows-1255', 'replace')
        sur = p['LastName'].split('-')[0].split(' ')[0]
        rec.update({'archived': f'https://web.archive.org/web/{ts}/{orig}', 'status': 200 if b else 0, 'surnameFound': sur in t})
        time.sleep(2)
    new = f'main.knesset.gov.il/mk/apps/mk/mk-personal-details/{sid}'
    c2 = get('http://web.archive.org/cdx/search/cdx?' + urllib.parse.urlencode({'url': new, 'limit': '1', 'fl': 'timestamp,statuscode'})).decode('utf8', 'replace').split()
    rec['newPageCapture'] = c2[:2]
    print(json.dumps(rec, ensure_ascii=False), flush=True)
    time.sleep(2)
