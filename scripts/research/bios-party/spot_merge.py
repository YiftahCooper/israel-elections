import json, os
S = os.path.join(os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..')), '.backup-scratch', 'bios')
sc = json.load(open(f'{S}/spotchecks.json')) if os.path.exists(f'{S}/spotchecks.json') else {}
k = []
for l in open(f'{S}/knesset_spot.jsonl'):
    r = json.loads(l)
    if r.get('status') == 200 and r.get('surnameFound'):
        ts = r['archived'].split('/web/')[1][:8]
        r['verified'] = f'archive {ts[:4]}-{ts[4:6]}-{ts[6:8]}'
        r['note'] = 'archived official page mk.asp?mk_individual_id_t={siteId} shows the member; same id as the current URL'
    k.append(r)
sc['knesset'] = k
json.dump(sc, open(f'{S}/spotchecks.json', 'w'), ensure_ascii=False, indent=1)
print(len(k), sum(1 for r in k if r.get('verified')), len(sc.get('party', [])))
