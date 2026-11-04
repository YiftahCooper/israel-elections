# Fetch person pages (live or Wayback) and match each page heading to exactly one candidate of a list.
# usage: python3 -I pagematch.py <kNN> <letters> <urls.jsonl: {"url":..,"ts":..|null}> > out.jsonl
import sys, os, re, json, time, hashlib, html, gzip, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../../..'))  # repository root
from names import clean, norm_tok as norm, skel
NICK = {'יוסי':'יוסף','אלי':'אליהו','גבי':'גבריאל','אבי':'אברהם','בני':'בנימין','מוטי':'מרדכי','צחי':'יצחק','איציק':'יצחק','רפי':'רפאל','מיקי':'מיכאל','דודי':'דוד','קובי':'יעקב','ציפי':'ציפורה','טלי':'רויטל','דבי':'דבורה','אתי':'אסתר','דני':'דניאל','שולי':'שולמית','יולי':'יואל','מירי':'מרים','בועז':'בעז','חיליק':'יחיאל'}
k, letters, urlfile = sys.argv[1:4]
ds = json.load(open(f'{ROOT}/public/data/{k}.json'))
lst = next(l for l in ds['lists'] if l['letters'] == letters)
os.makedirs(f'{ROOT}/.backup-scratch/bios/dl/pages', exist_ok=True)
UA = 'Mozilla/5.0 (compatible; IsraelElectionsResearch/1.0)'
def fetch(url, ts):
    src = f'http://web.archive.org/web/{ts}id_/{url}' if ts else url
    f = f'{ROOT}/.backup-scratch/bios/dl/pages/' + hashlib.sha1(src.encode()).hexdigest() + '.html'
    if os.path.exists(f): return 200, open(f, 'rb').read()
    if os.environ.get('CACHE_ONLY'): return 0, b''
    for i in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(src, safe=':/?=&%#+'), headers={'User-Agent': UA}), timeout=45)
            b = r.read()
            if b[:2] == b'\x1f\x8b': b = gzip.decompress(b)
            open(f, 'wb').write(b); time.sleep(1.5); return r.status, b
        except urllib.error.HTTPError as e:
            if e.code in (404, 410): return e.code, b''
            print('retry', src, e, file=sys.stderr); time.sleep(15)
        except Exception as e:
            print('retry', src, e, file=sys.stderr); time.sleep(15)
    return 0, b''
def heads(t):
    # the page title before the site name ('|'), and the h1 headings
    titles = [seg for x in re.findall(r'<title[^>]*>(.*?)</title>', t, re.S | re.I)[:1] for seg in x.split('|') if 'בראשות' not in seg]
    parts = titles + re.findall(r'<h1[^>]*>(.*?)</h1>', t, re.S | re.I)
    return [re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', p))).strip() for p in parts]
def tok_ok(t, ct):
    return any(norm(c) == t or (t in NICK and norm(NICK[t]) == norm(c)) or (len(skel(t)) >= 3 and skel(t) == skel(c)) for c in ct)
for line in open(urlfile):
    u = json.loads(line)
    status, b = fetch(u['url'], u.get('ts'))
    t = b.decode('utf-8', 'replace')
    hs = [h for h in heads(t) if h]
    hits = set()
    for h in hs:
        ht = [norm(x) for x in clean(h)]
        for c in lst['candidates']:
            ct = clean(c['nameHe'])
            # all candidate name tokens except middle names: family (first token) and at least one given token
            if tok_ok_all := (any(tok_ok(x, [ct[0]]) for x in ht) and any(tok_ok(x, ct[1:]) for x in ht)):
                hits.add((c['id'], c['nameHe']))
    print(json.dumps({'url': u['url'], 'ts': u.get('ts'), 'status': status, 'heads': hs[:3], 'hits': sorted(hits)}, ensure_ascii=False), flush=True)
