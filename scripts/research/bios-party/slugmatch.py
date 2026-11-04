# Match party person-page URLs to one candidate of a list from the Hebrew name in the URL path.
# usage: python3 -I slugmatch.py <kNN> <letters> <until YYYYMMDD> <url-regex-with-(?P<slug>...)> <cdx-cache>...
import sys, os, re, json, urllib.parse, collections
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../../..'))  # repository root
from names import clean, norm_tok as norm, skel
NICK = {'יוסי':'יוסף','אלי':'אליהו','גבי':'גבריאל','אבי':'אברהם','בני':'בנימין','מוטי':'מרדכי','צחי':'יצחק','איציק':'יצחק','רפי':'רפאל','מיקי':'מיכאל','דודי':'דוד','קובי':'יעקב','ציפי':'ציפורה','טלי':'רויטל','דבי':'דבורה','אתי':'אסתר','דני':'דניאל','שולי':'שולמית','יולי':'יואל','מירי':'מרים','בועז':'בעז','חיליק':'יחיאל'}
k, letters, until, rx = sys.argv[1:5]
ds = json.load(open(f'{ROOT}/public/data/{k}.json'))
lst = next(l for l in ds['lists'] if l['letters'] == letters)
latest = {}
for c in sys.argv[5:]:
    for line in open(c):
        ts, url = line.split(' ', 1); url = urllib.parse.unquote(url.strip())
        m = re.search(rx, url)
        if ts[:8] > until or not m: continue
        slug = m.group('slug')
        if slug not in latest or ts > latest[slug][0]: latest[slug] = (ts, url)
IGNORE = {'חכ', 'השר', 'דר', 'פרופ', 'הרב', 'עוד', 'בוגי', 'mk', 'חבר', 'חברת', 'כנסת', 'הכנסת'}
def tok_ok(t, ct):
    for c in ct:
        if norm(c) == t or (t in NICK and norm(NICK[t]) == norm(c)) or (len(skel(t)) >= 3 and skel(t) == skel(c)):
            return True
    return False
def tok_ok_family(st, fam):
    return any(tok_ok(t, [fam]) for t in st)
res = []
for slug, (ts, url) in sorted(latest.items()):
    st = [norm(t.replace('׳', "'")) for t in re.split(r'[-_ ]+', slug) if t and not t.isdigit() and len(t) > 1 and norm(t.replace('׳', "'")) not in IGNORE]
    hits = []
    for c in lst['candidates']:
        ct = clean(c['nameHe'])
        C = {skel(t) for t in ct} | {skel(NICK[t]) for t in ct if t in NICK}
        bad = [t for t in st if not tok_ok(t, ct)]
        if len(st) >= 2 and len(st) - len(bad) >= 2 and len(bad) <= (1 if len(st) >= 3 else 0) and tok_ok_family(st, ct[0]) and any(tok_ok(t, ct[1:]) and not tok_ok(t, [ct[0]]) for t in st):
            hits.append((len(bad), c))
    if hits:
        m = min(b for b, _ in hits); hits = [c for b, c in hits if b == m]
    print(json.dumps({'slug': slug, 'ts': ts, 'url': url, 'hits': [(c['id'], c['nameHe']) for c in hits]}, ensure_ascii=False))
