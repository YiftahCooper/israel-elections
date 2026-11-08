# Collect party-site biography links into data/raw/bios/party-sources.reviewed.json.
# Each SOURCE names one party page family for one list in one election; the method ties each page
# to exactly one candidate of that list (name in the URL slug, page headings, a ranked card list,
# or a full name in a list page with biographies). Ambiguous pages are dropped and reported.
import sys, os, re, json, html, subprocess, urllib.parse, collections, hashlib, time, urllib.request, gzip
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../../..'))  # repository root
S = os.path.join(ROOT, '.backup-scratch', 'bios')
from names import clean, norm_tok as norm, skel
UA = 'Mozilla/5.0 (compatible; IsraelElectionsResearch/1.0)'
sources = json.load(open(os.path.join(HERE, 'party_sources_config.json')))


def run(args):
    out = subprocess.run([sys.executable, '-I'] + [os.path.join(HERE, args[0].split('/')[-1])] + args[1:], capture_output=True, text=True, cwd=S, env=dict(os.environ, CACHE_ONLY='1'))
    if out.returncode:
        print(out.stderr, file=sys.stderr)
    return [json.loads(l) for l in out.stdout.splitlines() if l.strip()]


def fetch(url, ts=None):
    src = f'http://web.archive.org/web/{ts}id_/{url}' if ts else url
    f = os.path.join(S, 'dl/pages', hashlib.sha1(src.encode()).hexdigest() + '.html')
    if os.path.exists(f):
        return 200, open(f, 'rb').read()
    for i in range(3):
        try:
            r = urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(src, safe=':/?=&%#+'), headers={'User-Agent': UA}), timeout=45)
            b = r.read()
            if b[:2] == b'\x1f\x8b':
                b = gzip.decompress(b)
            open(f, 'wb').write(b); time.sleep(1)
            return r.status, b
        except Exception as e:
            print('retry', src, e, file=sys.stderr); time.sleep(10)
    return 0, b''


def page_text(b):
    t = b.decode('utf-8', 'replace')
    t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    t = re.sub('[​-‏‪-‮⁦-⁩]', '', t)
    t = t.replace('׳', "'").replace('״', '"')
    return re.sub(r'\s+', ' ', t)


def lst_of(k, letters):
    ds = json.load(open(f'{ROOT}/public/data/{k}.json'))
    return next(l for l in ds['lists'] if l['letters'] == letters)


def name_in_text(c, T):
    """The candidate's first given name and family name, adjacent in either order."""
    ct = clean(c['nameHe'])
    if len(ct) < 2:
        return False
    T = norm(T)
    for j in range(1, len(ct)):
        fam, giv = ' '.join(map(norm, ct[:j])), norm(ct[j])
        for s in (f'{giv} {fam}', f'{fam} {giv}'):
            if re.search(r'(^|[\s|,;:(])' + re.escape(s) + r'($|[\s|,;:).])', T):
                return True
    return False


links, report, checks = [], [], []
for src in sources:
    k, letters = src['election'], src['letters']
    lst = lst_of(k, letters)
    found = []   # (candidate id, original url, ts or None)
    if src['method'] == 'slug':
        for r in run(['tools/slugmatch.py', k, letters, src['until'], src['regex']] + src['cdx']):
            if len(r['hits']) == 1:
                cid = r['hits'][0][0]
                # A live page that later stopped resolving is linked through its reviewed capture (src['archived']).
                found.append((cid, r['url'], src.get('archived', {}).get(cid) if src.get('live') else r['ts']))
            else:
                report.append(f"{src['id']}: slug {r['slug']} -> {r['hits']}")
    elif src['method'] == 'page':
        for r in run(['tools/pagematch.py', k, letters, src['urls']]):
            if r['status'] == 0:
                report.append(f"{src['id']}: page {r['url']} not retrieved (archive unavailable)")
                continue
            if len(r['hits']) == 1 and r['status'] == 200:
                found.append((r['hits'][0][0], r['url'], r.get('ts')))
            else:
                report.append(f"{src['id']}: page {r['url']} status {r['status']} heads {r['heads'][:1]} -> {r['hits']}")
    elif src['method'] == 'rankcards':
        data = json.load(open(os.path.join(ROOT if src['json'].startswith('data/') else S, src['json'])))
        byrank = {c['rank']: c for c in lst['candidates']}
        for d in data:
            c = byrank.get(d['n'])
            fam_ok = c and any(len(norm(a)) >= 2 and (norm(a) == norm(b) or skel(a) == skel(b)) for a in clean(c['nameHe'])[:2] for b in clean(d['name']))
            if c and d.get('bio') and (name_in_text(c, d['name']) or fam_ok):
                found.append((c['id'], src['url'], None))
            else:
                report.append(f"{src['id']}: card {d['n']} {d['name']} does not match rank {d['n']} {c and c['nameHe']}")
    elif src['method'] == 'listpage':
        status, b = fetch(src['url'], src.get('ts'))
        T = page_text(b)
        for c in lst['candidates']:
            if name_in_text(c, T):
                found.append((c['id'], src['url'], src.get('ts')))
    cnt = collections.Counter(f[0] for f in found)
    seen = set()
    for cid, url, ts in found:
        if cnt[cid] > 1 and src['method'] != 'listpage':
            report.append(f"{src['id']}: {cid} matched by {cnt[cid]} pages; kept the first")
        if cid in seen:
            continue
        seen.add(cid)
        orig = urllib.parse.quote(url.replace(':80/', '/'), safe=':/?=&%#+')
        rec = {'candidateId': cid, 'publisher': src['publisher'], 'confidence': 'high', 'source': src['id']}
        if ts:
            rec.update({'url': f'https://web.archive.org/web/{ts}/{orig}', 'original': orig,
                        'archivedAt': f'{ts[:4]}-{ts[4:6]}-{ts[6:8]}', 'kind': 'archive'})
        else:
            rec.update({'url': orig, 'original': orig, 'archivedAt': None, 'kind': src.get('kind', 'party-site'),
                        'retrieved': src['retrieved']})
        if src.get('note'):
            rec['note'] = src['note']
        if ts and src.get('archivedNote'):
            rec['note'] = src['archivedNote']
        links.append(rec)
    print(src['id'], k, letters, 'links', len(seen), file=sys.stderr)

out = {'reviewedAt': '2026-11-04',
       'method': 'tools in the research note (docs/research/candidate-bios.md): each page is tied to one candidate of the list by the name in its URL, its headings, a ranked card list, or the full name in a list page with biographies.',
       'sources': [{k2: v for k2, v in s.items() if k2 not in ('cdx', 'urls', 'json', 'regex')} | {'pattern': s.get('regex')} for s in sources],
       'links': links,
       'spotChecks': json.load(open(os.path.join(S, 'spotchecks.json'))) if os.path.exists(os.path.join(S, 'spotchecks.json')) else {'knesset': [], 'party': []}}
open(os.path.join(ROOT, 'data/raw/bios/party-sources.reviewed.json'), 'w').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
open(os.path.join(S, 'party_report.txt'), 'w').write('\n'.join(report) + '\n')
print('links', len(links), 'report lines', len(report), file=sys.stderr)
