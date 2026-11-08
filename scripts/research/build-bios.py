#!/usr/bin/env python3
"""Build data/meta/bios/kNN.json: biography links for the candidates of every election.

Usage (from the repository root, Python 3.10+, standard library only):
    python3 -I scripts/research/build-bios.py            # build from retained snapshots
    python3 -I scripts/research/build-bios.py --report   # also print every residual case

Inputs (all retained in the repository):
  public/data/kNN.json                         candidate rosters (ids such as "25-מחל#3")
  scripts/research/elected-ids.ts              the candidates the app shows as elected (run with node)
  data/raw/bios/knesset-odata-*.json           Knesset OData snapshots (persons, MK and faction positions, site codes)
  data/raw/bios/wikidata-*.json                Wikidata snapshots (P9770 Knesset member ID, party members)
  data/raw/bios/identity-decisions.reviewed.json  reviewed decisions for every elected member the name rules cannot settle
  data/raw/bios/party-sources.reviewed.json    reviewed party-site biography links (Wayback Machine captures)

Method and the meaning of each field: data/meta/bios/README.md and docs/research/candidate-bios.md.
English-language Wikipedia is never used (owner rule). Identities are never guessed: a candidate gets a
link only through an official identifier or an unambiguous rule documented below.
"""
import collections
import json
import os
import re
import subprocess
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'data/raw/bios'
OUT = ROOT / 'data/meta/bios'
REPORT = '--report' in sys.argv
KNESSET_URL = 'https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/{}'


def load(name):
    return json.loads((RAW / name).read_text('utf8'))


# ---------------------------------------------------------------- names
TITLE_TOKENS = {'דר', 'הרב', 'הרבנית', 'פרופ', 'פרופסור', 'עוד', 'רוח', 'חכ', 'גב', 'מר', 'אינג', 'תאל', 'אלמ', 'סאל', 'רסן',
                'אלוף', 'ניצב', 'שיח', 'השיח', 'אדר', 'מהנדס'}
FINAL = str.maketrans('ךםןףץ', 'כמנפצ')
FAMILY_STOP = {'בנ', 'אבו', 'אל', 'א', 'אבנ', 'בר', 'דה', 'ונ', 'בית'}
# Short and long forms of the same given name (also used by the 0088 audit).
NICK = {'יוסי': 'יוסף', 'אלי': 'אליהו', 'גבי': 'גבריאל', 'אבי': 'אברהם', 'בני': 'בנימין', 'מוטי': 'מרדכי', 'שמוליק': 'שמואל',
        'צחי': 'יצחק', 'איציק': 'יצחק', 'רפי': 'רפאל', 'מיקי': 'מיכאל', 'דודי': 'דוד', 'קובי': 'יעקב', 'שולי': 'שולמית',
        'ציפי': 'ציפורה', 'טלי': 'רויטל', 'דבי': 'דבורה', 'אתי': 'אסתר', 'חיליק': 'יחיאל', 'ג׳קי': 'יעקב', "ג'קי": 'יעקב',
        'דני': 'דניאל', 'אריק': 'אריאל', 'רובי': 'ראובן', 'שוקי': 'יהושע', 'שייקה': 'ישעיהו', 'אברום': 'אברהם',
        'עוזי': 'עוזיאל', 'יולי': 'יואל'}


def clean(s):
    s = (s or '').replace('״', '"').replace('׳', "'").replace('’', "'").replace('`', "'")
    s = re.sub(r'\([^)]*\)', ' ', s)
    s = re.sub(r'[-־–—_.,/]', ' ', s)
    return [t for t in s.split() if t and norm(t) not in TITLE_TOKENS]


def paren(s):
    return re.findall(r'\(([^)]*)\)', s or '')


def norm(t):
    return t.translate(FINAL).replace('"', '').replace("'", '')


def skel(t):
    """Loose form: vowel letters ו/י/א dropped after the first letter, doubled letters merged."""
    t = norm(t)
    if not t:
        return t
    return re.sub(r'(.)\1+', r'\1', t[0] + re.sub('[ויא]', '', t[1:]))


def given_forms(tokens):
    f = set()
    for t in tokens:
        f.add(skel(t))
        if t in NICK:
            f.add(skel(NICK[t]))
    return f


def given_compatible(gt, F):
    if given_forms(gt) & given_forms(F):
        return True
    return any(len(x) >= 3 and len(y) >= 3 and (x.startswith(y) or y.startswith(x))
               for x in map(norm, gt) for y in map(norm, F))


def family_compatible(ft, L):
    a, b = skel(''.join(ft)), skel(''.join(L))
    if a and a == b:
        return True
    sa = {skel(t) for t in ft if len(norm(t)) >= 2 and norm(t) not in FAMILY_STOP}
    sb = {skel(t) for t in L if len(norm(t)) >= 2 and norm(t) not in FAMILY_STOP}
    return bool(sa & sb)


def full_exact(name, p):
    return sorted(map(norm, clean(name))) == sorted(map(norm, clean(p['LastName']) + clean(p['FirstName'])))


def name_score(name, p):
    """3 identical tokens; 2.5 identical surname + compatible given name; 2 same loose surname +
    compatible given name; 1 a shared surname token (or a parenthesised earlier name) + compatible given name."""
    if full_exact(name, p):
        return 3
    T, L, F = clean(name), clean(p['LastName']), clean(p['FirstName'])
    best = 0
    for j in range(1, len(T)):
        ft, gt = T[:j], T[j:]
        if not given_compatible(gt, F):
            continue
        if [norm(x) for x in ft] == [norm(x) for x in L] or norm(''.join(ft)) == norm(''.join(L)):
            best = max(best, 2.5)
        elif skel(''.join(ft)) == skel(''.join(L)):
            best = max(best, 2)
        elif any(family_compatible(f, l) for f in [ft] + [clean(x) for x in paren(name)]
                 for l in [L] + [clean(x) for x in paren(p['LastName'])]):
            best = max(best, 1)
    return best


def name_key(name):
    return ' '.join(sorted(map(norm, clean(name))))


# ---------------------------------------------------------------- inputs
index = json.loads((ROOT / 'public/data/elections.json').read_text('utf8'))
ELECTIONS = [e['id'] for e in index if e.get('available')]
datasets = {k: json.loads((ROOT / f'public/data/{k}.json').read_text('utf8')) for k in ELECTIONS}
elected = json.loads(subprocess.run(['node', 'scripts/research/elected-ids.ts'], cwd=ROOT, check=True,
                                    capture_output=True).stdout)
persons = {p['PersonID']: p for p in load('knesset-odata-persons.json')}
site = {r['KnsID']: r['SiteId'] for r in load('knesset-odata-mk-site-codes.json')}
members = collections.defaultdict(dict)    # Knesset -> PersonID -> first StartDate as MK
for r in load('knesset-odata-mk-positions.json'):
    if r['KnessetNum'] is not None:
        d = r['StartDate'] or ''
        if r['PersonID'] not in members[r['KnessetNum']] or d < members[r['KnessetNum']][r['PersonID']]:
            members[r['KnessetNum']][r['PersonID']] = d
factions = collections.defaultdict(lambda: collections.defaultdict(list))  # Knesset -> PersonID -> rows
for r in load('knesset-odata-faction-positions.json'):
    if r['KnessetNum'] is not None:
        factions[r['KnessetNum']][r['PersonID']].append((r['StartDate'] or '', r['FactionID'], (r['FactionName'] or '').strip()))
# The 26th Knesset has no MK positions before its opening (10 Nov 2026); its faction rows are the
# provisional membership retained in data/raw/k26/knesset-odata-members.json (decision 0088).
k26 = json.loads((ROOT / 'data/raw/k26/knesset-odata-members.json').read_text('utf8'))
if 26 not in members:
    for r in k26['factionMemberships']:
        members[26][r['PersonID']] = r['StartDate']
served = collections.defaultdict(set)
for n, m in members.items():
    for pid in m:
        served[pid].add(n)
wd_by_site = {r['knessetSiteId']: r for r in load('wikidata-knesset-member-ids.json')}
wd_party_members = load('wikidata-israeli-party-members.json')
wd_parties = collections.defaultdict(set)
for r in load('wikidata-israeli-parties.json'):
    if r['labelHe']:
        wd_parties[r['qid']].add(r['labelHe'])
decisions = {d['candidateId']: d for d in load('identity-decisions.reviewed.json')['decisions']}

# Hebrew Wikipedia sentences that mention a Knesset election, per article (fetched with --fetch-hewiki;
# used only to confirm candidacies that no official identifier ties to the person).
EVIDENCE_FILE = RAW / 'hewiki-evidence.json'
evidence_store = json.loads(EVIDENCE_FILE.read_text('utf8')) if EVIDENCE_FILE.exists() else {}
ORD = ['', 'הראשונה', 'השנייה', 'השלישית', 'הרביעית', 'החמישית', 'השישית', 'השביעית', 'השמינית', 'התשיעית', 'העשירית',
       'האחת עשרה', 'השתים עשרה', 'השלוש עשרה', 'הארבע עשרה', 'החמש עשרה', 'השש עשרה', 'השבע עשרה', 'השמונה עשרה',
       'התשע עשרה', 'העשרים', 'העשרים ואחת', 'העשרים ושתיים', 'העשרים ושלוש', 'העשרים וארבע', 'העשרים וחמש', 'העשרים ושש']
CANDIDACY_WORDS = ('רשימ', 'מקום', 'התמודד', 'מועמד', 'הוצב', 'נבחר', 'שוריין', 'ברשימת')
needed_titles = set()


def election_sentences(title, k):
    """Sentences of the article that place the person in this election (Knesset number, or year and 'בחירות')."""
    n, year = knesset_num(k), datasets[k]['electionDate'][:4]
    pats = [f'כנסת ה-{n}', f'כנסת ה־{n}', f'כנסת ה{n}', f'כנסת {ORD[n]}']
    out = []
    for sent in evidence_store.get(title, {}).get('sentences', []):
        hit = any(p in sent for p in pats)
        if n == 20:   # "הכנסת העשרים" is also the prefix of 21–26
            hit = any(p in sent for p in pats[:3]) or re.search(r'כנסת העשרים(?! ו)', sent)
        if not hit and year in sent and 'בחירות' in sent:
            hit = True
        if hit and any(w in sent for w in CANDIDACY_WORDS):
            out.append(sent)
    return out


def needs_evidence(title, k):
    """True when the article does not (or not yet) confirm the candidacy; records the title for --fetch-hewiki."""
    if title not in evidence_store:
        needed_titles.add(title)
        return True
    return not election_sentences(title, k)

party_sources = load('party-sources.reviewed.json')


def knesset_num(k):
    return int(k[1:])


def faction_ids(n, pid):
    return {f for _, f, _ in factions[n].get(pid, [])}


def first_faction(n, pid):
    rows = sorted(factions[n].get(pid, []))
    return rows[0][1] if rows else None


def faction_names(n, pid):
    return {name for _, _, name in factions[n].get(pid, [])}


# ---------------------------------------------------------------- party-name compatibility
GENERIC = {'רשימת', 'רשימה', 'מפלגת', 'מפלגה', 'תנועת', 'תנועה', 'בראשות', 'בהנהגת', 'לראשות', 'הממשלה', 'של', 'עם', 'ו', 'ה', 'ל',
           'ישראל', 'הישראלית', 'הישראלי', 'ישראלית', 'ארץ', 'הרשימה', 'המפלגה', 'התנועה', 'לישראל', 'החדשה', 'חדשה', 'החדש', 'חדש',
           'הלאומית', 'לאומית', 'המאוחדת', 'מאוחדת', 'ליברלית', 'הליברלית', 'דמוקרטית', 'הדמוקרטית', 'בלתי', 'מפלגתיים', 'ובלתי',
           'יהודית', 'היהודית', 'הערבית', 'ערבית', 'העולמית', 'אחת', 'עבור', 'למען', 'הסיעה', 'סיעת', 'סיעה', 'כנס', 'בחירות'}


def party_tokens(texts):
    out = set()
    for t in texts:
        for w in re.split(r'[\s,;:()\-–־"״\'׳.!]+', t or ''):
            w = norm(w)
            if len(w) >= 3 and w not in GENERIC:
                out.add(w)
                if w.startswith('ה') and len(w) >= 4 and w[1:] not in GENERIC:
                    out.add(w[1:])
    return out


meta = {}
for k in ELECTIONS:
    f = ROOT / f'data/meta/{k}.json'
    meta[k] = json.loads(f.read_text('utf8')) if f.exists() else {}


def list_texts(k, lst):
    texts = [lst.get('nameHe'), lst.get('shortHe'), lst.get('sponsorsHe')] + list(lst.get('partiesHe') or [])
    for ml in meta[k].get('lists', []):
        if ml.get('letters') == lst['letters']:
            texts += [p.get('nameHe') for p in ml.get('parties', [])]
    return [t for t in texts if t]


# ---------------------------------------------------------------- elected members -> PersonID
def best_hits(name, pool):
    scores = {pid: name_score(name, persons[pid]) for pid in pool}
    top = max(scores.values(), default=0)
    return ([pid for pid, v in scores.items() if v == top] if top > 0 else []), top


result = {k: {} for k in ELECTIONS}          # election -> candidate id -> entry
residual = []                                 # report lines
list_factions = {}                            # (election, list id) -> faction ids at opening
for k in ELECTIONS:
    n = knesset_num(k)
    ds = datasets[k]
    cands = {c['id']: (c, l) for l in ds['lists'] for c in l['candidates']}
    pool = members[n]
    opening = min(pool.values())
    by_list = collections.defaultdict(list)
    for cid in elected[k]:
        by_list[cands[cid][1]['id']].append(cid)
    # 1. learn each list's factions from unconstrained unique name matches
    first = {}
    for cid in elected[k]:
        hits, _ = best_hits(cands[cid][0]['nameHe'], pool)
        if len(hits) > 1:
            hits = [h for h in hits if pool[h] == opening] or hits
        if len(hits) == 1:
            first[cid] = hits[0]
    for lid, cids in by_list.items():
        cnt = collections.Counter(first_faction(n, first[c]) for c in cids if c in first)
        total = sum(cnt.values())
        list_factions[(k, lid)] = {f for f, x in cnt.items() if f is not None and (x >= 2 or x == total)}
    # 2. match again within the list's factions; residuals need a reviewed decision
    matched = {}
    for lid, cids in by_list.items():
        lf = list_factions[(k, lid)]
        fpool = {pid: d for pid, d in pool.items() if faction_ids(n, pid) & lf} if lf else pool
        for cid in cids:
            if cid in decisions:
                continue
            hits, top = best_hits(cands[cid][0]['nameHe'], fpool)
            if len(hits) > 1:
                hits = [h for h in hits if fpool[h] == opening] or hits
            if len(hits) == 1:
                matched[cid] = (hits[0], top)
            else:
                residual.append(f'UNDECIDED {cid} {cands[cid][0]["nameHe"]} hits={[(h, persons[h]["LastName"], persons[h]["FirstName"]) for h in hits]}')
    used = collections.Counter(p for p, _ in matched.values())
    for cid, (pid, top) in matched.items():
        if used[pid] > 1:
            residual.append(f'DUPLICATE {cid} -> {pid}')
            continue
        result[k][cid] = {'knessetPersonId': pid, 'confidence': 'high',
                          'basis': f'elected; Knesset {n} member, name {"identical" if top == 3 else "matches"} ({top})'}
    for cid in elected[k]:
        d = decisions.get(cid)
        if d is None:
            continue
        if d.get('personId'):
            result[k][cid] = {'knessetPersonId': d['personId'], 'confidence': d['confidence'], 'basis': 'elected; reviewed decision: ' + d['reason']}
        else:
            residual.append(f'LEFT OUT {cid} {cands[cid][0]["nameHe"]}: {d["reason"]}')

# ---------------------------------------------------------------- other candidates -> PersonID
# Lineage: a faction id in Knesset m belongs to the list (election m) whose elected members sat in it.
faction_letters = collections.defaultdict(set)   # (Knesset, faction id) -> ballot letters
for (k, lid), fs in list_factions.items():
    letters = lid.split('-', 1)[1]
    for f in fs:
        faction_letters[(knesset_num(k), f)].add(letters)

name_index = collections.defaultdict(list)       # exact name key -> PersonIDs who ever served
for pid in served:
    p = persons.get(pid)
    if p:
        name_index[' '.join(sorted(map(norm, clean(p['LastName']) + clean(p['FirstName']))))].append(pid)

for k in ELECTIONS:
    n = knesset_num(k)
    ds = datasets[k]
    taken = {e['knessetPersonId'] for e in result[k].values()}
    keys = collections.Counter(name_key(c['nameHe']) for l in ds['lists'] for c in l['candidates'])
    for lst in ds['lists']:
        lf = list_factions.get((k, lst['id']), set())
        ltok = party_tokens(list_texts(k, lst))
        for c in lst['candidates']:
            cid = c['id']
            if cid in result[k] or cid in decisions or cid in elected[k]:
                continue
            # (a) a replacement: served in this Knesset in one of the list's factions
            if lf:
                rpool = {pid: d for pid, d in members[n].items() if faction_ids(n, pid) & lf and pid not in taken}
                hits, top = best_hits(c['nameHe'], rpool)
                if len(hits) == 1 and top >= 2:
                    result[k][cid] = {'knessetPersonId': hits[0], 'confidence': 'high',
                                      'basis': f'not elected at the election; entered Knesset {n} in the list\'s faction (name score {top})'}
                    taken.add(hits[0])
                    continue
            # (b) identical name, unique among everyone who ever served, served within three Knessets,
            #     and the same party lineage (same ballot letters or a shared party-name word)
            if keys[name_key(c['nameHe'])] > 1:
                continue
            pids = name_index.get(name_key(c['nameHe']), [])
            if len(pids) != 1 or pids[0] in taken:
                continue
            pid = pids[0]
            near = sorted(m for m in served[pid] if m != n and abs(m - n) <= 3)
            if not near:
                continue
            evidence = []
            for m in near:
                for f in faction_ids(m, pid):
                    if lst['letters'] in faction_letters.get((m, f), set()):
                        evidence.append((abs(m - n), f'Knesset {m} faction of list {lst["letters"]}'))
                shared = party_tokens(faction_names(m, pid)) & ltok
                if shared:
                    evidence.append((abs(m - n), f'Knesset {m} faction "{sorted(faction_names(m, pid))[0]}" shares "{sorted(shared)[0]}"'))
            if not evidence:
                continue
            evidence.sort()
            dist, why = evidence[0]
            if dist > 1:
                # two or three Knessets away: the surname must be unique among MKs, or the Hebrew
                # Wikipedia article must place the person in this election
                sur = norm(clean(persons[pid]['LastName'])[0]) if clean(persons[pid]['LastName']) else ''
                unique_surname = sum(1 for q in served if q in persons and clean(persons[q]['LastName'])
                                     and norm(clean(persons[q]['LastName'])[0]) == sur) == 1
                w = wd_by_site.get(site.get(pid))
                title = urllib.parse.unquote(w['hewiki'].rsplit('/wiki/', 1)[1]).replace('_', ' ') if w and w.get('hewiki') else None
                if not unique_surname and not (title and not needs_evidence(title, k)):
                    residual.append(f'SKIPPED far match {cid} {c["nameHe"]} -> {pid} ({why})')
                    continue
                why += '; surname unique among MKs' if unique_surname else '; Hebrew Wikipedia places the person in this election'
            result[k][cid] = {'knessetPersonId': pid, 'confidence': 'medium',
                              'basis': 'not elected; identical name, the only person with it who served as MK; ' + why}
            taken.add(pid)

# ---------------------------------------------------------------- Hebrew Wikipedia
def hewiki_entry(url, qid):
    title = urllib.parse.unquote(url.rsplit('/wiki/', 1)[1]).replace('_', ' ')
    return {'title': title, 'url': url, 'via': f'wikidata {qid}'}


for k in ELECTIONS:
    for cid, e in result[k].items():
        sid = site.get(e['knessetPersonId'])
        w = wd_by_site.get(sid)
        if w and w.get('hewiki'):
            e['hewiki'] = hewiki_entry(w['hewiki'], w['qid'])

# Non-MK candidates: a Wikidata human whose Hebrew label is exactly the candidate's name, who is
# recorded as a member of a party of the list (P102), was an adult at the election, and is the
# only such item; the name must also be unique in the election.
wd_people = collections.defaultdict(lambda: {'parties': set()})
for r in wd_party_members:
    if r.get('knessetSiteId'):
        continue
    p = wd_people[r['qid']]
    p.update({k2: r[k2] for k2 in ('labelHe', 'hewiki', 'birth')})
    p['parties'] |= wd_parties.get(r['party'], set())
wd_by_name = collections.defaultdict(list)
for qid, p in wd_people.items():
    if p.get('labelHe'):
        wd_by_name[name_key(p['labelHe'])].append(qid)
def wd_match(name, k, lst):
    """The only Wikidata party member with exactly this Hebrew name, in a party of the list, adult at the election."""
    qids = wd_by_name.get(name_key(name), [])
    if len(qids) != 1:
        return None
    p = wd_people[qids[0]]
    shared = party_tokens(p['parties']) & party_tokens(list_texts(k, lst))
    born = int(p['birth'][:4]) if p.get('birth') else None
    year = int(datasets[k]['electionDate'][:4])
    if not shared or born is None or not (year - 95 <= born <= year - 21):
        return None
    title = urllib.parse.unquote(p['hewiki'].rsplit('/wiki/', 1)[1]).replace('_', ' ')
    if needs_evidence(title, k):
        return None
    return qids[0], p, born, sorted(shared)[0]


for k in ELECTIONS:
    ds = datasets[k]
    keys = collections.Counter(name_key(c['nameHe']) for l in ds['lists'] for c in l['candidates'])
    for lst in ds['lists']:
        for c in lst['candidates']:
            if c['id'] in decisions or keys[name_key(c['nameHe'])] > 1:
                continue
            e = result[k].get(c['id'])
            if e and e.get('hewiki'):
                continue
            m = wd_match(c['nameHe'], k, lst)
            if e and not m and e.get('knessetPersonId') in persons:
                p = persons[e['knessetPersonId']]
                m = wd_match(p['LastName'] + ' ' + p['FirstName'], k, lst)
            if not m:
                continue
            qid, p, born, shared = m
            basis = (f'Wikidata {qid}: identical Hebrew label, party "{sorted(p["parties"])[0]}" (shares "{shared}"), born {born}; '
                     'the article places the person in this election')
            if e:   # an MK without a Wikidata Knesset ID (P9770)
                e['hewiki'] = hewiki_entry(p['hewiki'], qid)
                e['confidence'] = 'medium'
                e['basis'] += '; Hebrew Wikipedia via ' + basis
            else:
                result[k][c['id']] = {'knessetPersonId': None, 'confidence': 'medium', 'basis': 'not an MK; ' + basis,
                                      'hewiki': hewiki_entry(p['hewiki'], qid)}

# ---------------------------------------------------------------- --fetch-hewiki
if '--fetch-hewiki' in sys.argv and needed_titles:
    import time
    import urllib.request
    UA = 'IsraelElectionsResearch/1.0 (https://github.com/YiftahCooper/israel-elections; candidate biography research)'
    todo = sorted(needed_titles)
    print(f'fetching {len(todo)} Hebrew Wikipedia articles', file=sys.stderr)
    for i, title in enumerate(todo):
        q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'formatversion': '2', 'prop': 'extracts|revisions',
                                    'explaintext': '1', 'rvprop': 'ids', 'redirects': '1', 'titles': title})
        for attempt in range(6):
            try:
                req = urllib.request.Request('https://he.wikipedia.org/w/api.php?' + q, headers={'User-Agent': UA})
                page = json.loads(urllib.request.urlopen(req, timeout=60).read())['query']['pages'][0]
                break
            except Exception as ex:
                print('retry', title, ex, file=sys.stderr)
                time.sleep(20 * (attempt + 1))
        else:
            continue
        text = page.get('extract', '') or ''
        sents = [x.strip() for x in re.split(r'(?<=[.!?])\s+|\n+', text) if ('כנסת' in x or 'בחירות' in x) and len(x) < 700]
        evidence_store[title] = {'revid': (page.get('revisions') or [{}])[0].get('revid'), 'fetched': '2026-11-04', 'sentences': sents}
        if i % 25 == 0:
            EVIDENCE_FILE.write_text(json.dumps(evidence_store, ensure_ascii=False, indent=0, sort_keys=True) + '\n', 'utf8')
        time.sleep(3)
    EVIDENCE_FILE.write_text(json.dumps(evidence_store, ensure_ascii=False, indent=0, sort_keys=True) + '\n', 'utf8')
    os.execv(sys.executable, [sys.executable, '-I', __file__] + [a for a in sys.argv[1:] if a != '--fetch-hewiki'])

# ---------------------------------------------------------------- Knesset page
for k in ELECTIONS:
    for e in result[k].values():
        pid = e['knessetPersonId']
        sid = site.get(pid) if pid else None
        e['knesset'] = {'url': KNESSET_URL.format(sid), 'siteId': sid, 'verified': 'pattern'} if sid else None
        if pid and not sid:
            residual.append(f'NO SITE ID {k} PersonID {pid} {persons[pid]["FirstName"]} {persons[pid]["LastName"]}')
for s in party_sources.get('spotChecks', {}).get('knesset', []):
    for k in ELECTIONS:
        for e in result[k].values():
            if e['knesset'] and e['knesset']['siteId'] == s['siteId']:
                e['knesset']['verified'] = s['verified']

# ---------------------------------------------------------------- party sites
WAYBACK = re.compile(r'https://web\.archive\.org/web/(\d{14})/(.+)$')
archived_by_source = {s['id']: s.get('archived', {}) for s in party_sources['sources']}


def check_party_link(src):
    """A party link is the live page itself, or an exact Wayback capture of the page the party published.

    A live page that later stops resolving (for example a redirect to the party homepage) is replaced in the
    retained input by its reviewed capture, listed in the source's `archived` map; the build refuses any
    other shape, so a rebuild cannot silently reintroduce the dead live URL.
    """
    cid, ts = src['candidateId'], archived_by_source.get(src['source'], {}).get(src['candidateId'])
    if src['kind'] == 'archive':
        m = WAYBACK.match(src['url'])
        if not m or m[2] != src['original'] or src.get('archivedAt') != f'{m[1][:4]}-{m[1][4:6]}-{m[1][6:8]}':
            sys.exit(f'party link {cid}: an archive url must be web.archive.org/web/<timestamp>/<original>, dated by archivedAt')
        if ts and ts != m[1]:
            sys.exit(f'party link {cid}: capture {m[1]} differs from the reviewed capture {ts}')
    elif ts or src['url'] != src['original'] or src.get('archivedAt') is not None:
        sys.exit(f'party link {cid}: a live link must be its original url, with no capture date or reviewed capture')


for src in party_sources['links']:
    check_party_link(src)
    k = 'k' + src['candidateId'].split('-', 1)[0]
    e = result[k].setdefault(src['candidateId'], {'knessetPersonId': None, 'knesset': None, 'confidence': src['confidence'],
                                                  'basis': 'party site only: the page is the party\'s own page of this candidate'})
    e['party'] = {kk: src[kk] for kk in ('url', 'original', 'archivedAt', 'publisher', 'kind') if kk in src}
    for kk in ('retrieved', 'note'):
        if src.get(kk):
            e['party'][kk] = src[kk]
    if src['confidence'] == 'medium':
        e['confidence'] = 'medium'

# ---------------------------------------------------------------- write
FIELDS = ('knessetPersonId', 'knesset', 'hewiki', 'party', 'confidence', 'basis')
summary = {}
for k in ELECTIONS:
    order = {c['id']: i for i, c in enumerate(c for l in datasets[k]['lists'] for c in l['candidates'])}
    entries = {cid: {f: e.get(f) for f in FIELDS} for cid, e in sorted(result[k].items(), key=lambda x: order[x[0]])
               if e.get('knesset') or e.get('hewiki') or e.get('party')}
    doc = {'electionId': k, 'generatedBy': 'scripts/research/build-bios.py', 'format': 'data/meta/bios/README.md',
           'candidates': entries}
    (OUT / f'{k}.json').write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', 'utf8')
    el = set(elected[k])
    summary[k] = {
        'candidates': sum(len(l['candidates']) for l in datasets[k]['lists']),
        'withLink': len(entries),
        'elected': len(el),
        'electedKnesset': sum(1 for c in el if entries.get(c, {}).get('knesset')),
        'electedPersonId': sum(1 for c in el if entries.get(c, {}).get('knessetPersonId') or (result[k].get(c, {}).get('knessetPersonId'))),
        'otherKnesset': sum(1 for c, e in entries.items() if c not in el and e['knesset']),
        'hewiki': sum(1 for e in entries.values() if e['hewiki']),
        'hewikiNonMk': sum(1 for e in entries.values() if e['hewiki'] and not e['knessetPersonId']),
        'party': sum(1 for e in entries.values() if e['party']),
        'medium': sum(1 for e in entries.values() if e['confidence'] == 'medium'),
    }
(OUT / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=1) + '\n', 'utf8')
for k, s in summary.items():
    print(k, s)
if REPORT:
    print('\n'.join(residual))
else:
    print(len(residual), 'residual lines (use --report)')
