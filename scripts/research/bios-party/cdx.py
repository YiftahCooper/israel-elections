# CDX helper with caching and polite retries: python3 -I cdx.py <domain> <from YYYYMMDD> <to YYYYMMDD> [regex]
import sys, time, urllib.request, urllib.parse, os, re, hashlib
ROOT_ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..'))
dom, fr, to = sys.argv[1:4]; rx = sys.argv[4] if len(sys.argv) > 4 else ''
cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'cdx', f'{dom}_{fr}_{to}.txt')
if not os.path.exists(cache):
    q = urllib.parse.urlencode({'url': dom, 'matchType': 'domain', 'from': fr, 'to': to, 'filter': ['statuscode:200', 'mimetype:text/html'], 'collapse': 'urlkey', 'fl': 'timestamp,original', 'limit': '200000'}, doseq=True)
    for i in range(6):
        try:
            b = urllib.request.urlopen('http://web.archive.org/cdx/search/cdx?' + q, timeout=180).read().decode('utf8', 'replace')
            if '<html' in b[:200].lower(): raise Exception('archive html error page')
            open(cache, 'w').write(b); break
        except Exception as e:
            print('retry', e, file=sys.stderr); time.sleep(20)
lines = open(cache).read().splitlines() if os.path.exists(cache) else []
print(len(lines), 'captures', file=sys.stderr)
for l in lines:
    u = urllib.parse.unquote(l)
    if not rx or re.search(rx, u, re.I): print(u)
