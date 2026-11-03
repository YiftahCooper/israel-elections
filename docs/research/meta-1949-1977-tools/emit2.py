import json, sys, os, collections
sys.path.insert(0, os.path.dirname(__file__))
from emit import *

p2p = json.load(open(S + 'meta/p2p.json'))
FAC = {f['FactionID']: f for f in json.load(open(S + 'meta/factions.json'))}
PF = {'herut': [115, 153, 193, 221, 253], 'liberal-party': [241, 271], 'mapai': [109, 149, 189, 219, 251],
      'ahdut-haavoda': [163, 203, 231, 261], 'mapam': [105, 147, 185, 213, 243, 279, 999],
      'hapoel-hamizrachi': [173], 'mizrachi': [169], 'agudat-yisrael': [171, 215, 245, 283, 319, 361],
      'poalei-agudat-yisrael': [165, 233, 263, 293, 331, 371], 'rakah': [309, 351, 389], 'wizo': [145],
      'moked': [385], 'free-centre': [307, 349, 1000], 'state-list': [339]}

def faction_ev(pid, partyid, exclude_kn=None):
    out = []
    for x in p2p:
        if x['PersonID'] == pid and x['PositionID'] == 54 and x['FactionID'] in PF.get(partyid, []) and x['KnessetNum'] != exclude_kn:
            f = FAC[x['FactionID']]
            out.append(odata_faction(x['FactionID'], 'PersonID %d: member of faction "%s" (FactionID %d), Knesset %d, %s to %s' % (
                pid, f['Name'], x['FactionID'], x['KnessetNum'], x['StartDate'][:10], (x['FinishDate'] or '')[:10])))
    return out[:2]

def with_factions(k, L, p, rk, kn):
    ex = {}
    for r in rk:
        pid = next(x for x in m[k][L] if x['rank'] == r)['pid']
        e = faction_ev(pid, p, None)
        if e: ex[r] = e
    return ex

def mkparty(k, L, p, sources, conf, kn, mconf=None, mnote=None, extra=None, rk=None):
    rk = rk if rk is not None else ranks(k, L, p)
    ex = with_factions(k, L, p, rk, kn)
    for r, e in (extra or {}).items(): ex.setdefault(r, []).extend(e)
    o = party(p, rk, sources, conf, k, L, ex, mconf, mnote)
    for mm in o['members']:
        if mm['rank'] not in (mconf or {}) and mm['confidence'] == 'medium' and any(e['kind'] == 'official' for e in mm['evidence']):
            mm['confidence'] = 'high'
    return o

IDI6 = idi('7012/כנסת-6-מערך.pdf', 'Scan of YP 1222 (17.10.1965) pp. 113-114, list את; handwritten marks distinguish Ahdut HaAvoda candidates (ranks 3, 6, 11, 17, 21, 26, 31, 36, 41, 46, 51, 56) from the rest')
IDI7 = idi('7003/כנסת-7-מערך.pdf', 'Scan of YP 1563 (1969), list אמת; rank 29 printed as "דינשטיין צבי"; handwritten מפ"ם marks at ranks 26, 33, 40 (ranks 20-41 inspected)')
IDI9 = idi('6978/כנסת-9-הליכוד.pdf', 'Scan of YP 2319 (9.5.1977) p. 1328, list מחל; handwritten marks ח / ל / לע"ם beside each candidate (ranks 1-43 inspected); rank 16 marked "אחדות"; ranks 21 and 24 (both "כהן יגאל") marked ח and לע"ם respectively but joined by a swap arrow and a question mark')

LISTS = collections.defaultdict(list); NOTES = collections.defaultdict(list)

# ---- k1
LISTS['k1'].append(jlist('k1', 'ב', [
    mkparty('k1', 'ב', 'hapoel-hamizrachi', [W['urf']], 'high', 1),
    mkparty('k1', 'ב', 'mizrachi', [W['urf']], 'high', 1, mconf={11: 'medium'}, mnote={11: 'Knesset biography names no party; assignment rests on Hebrew Wikipedia'}),
    mkparty('k1', 'ב', 'poalei-agudat-yisrael', [W['urf']], 'high', 1),
    mkparty('k1', 'ב', 'agudat-yisrael', [W['urf']], 'high', 1),
], notes=['The fifth component, the non-party religious union (האיחוד הדתי הבלתי-מפלגתי), had no elected member per Hebrew Wikipedia.',
          'Rank 16 Moshe Kelmer resigned; his replacement Eliyahu Mazor (Agudat Yisrael) is not on the dataset roster.'],
    extra_parties=[{'id': 'non-party-religious-union', 'nameHe': P['non-party-religious-union'][0], 'nameEn': P['non-party-religious-union'][1], 'candidateRanks': [], 'sources': [W['urf']], 'confidence': 'medium'}]))
LISTS['k1'].append(jlist('k1', 'נ', [
    party('wizo', [1], [W['wizo']], 'high', 'k1', 'נ', {1: [odata_faction(145, 'Knesset 1 faction "ויצ"ו" (FactionID 145), 1949-02-14 to 1951-08-20; sole member PersonID 2400 רחל כהן-כגן')]}),
], extra_parties=[{'id': 'womens-equal-rights-association', 'nameHe': P['womens-equal-rights-association'][0], 'nameEn': P['womens-equal-rights-association'][1], 'candidateRanks': [], 'sources': [], 'confidence': 'high',
                   'note': 'Co-sponsor named in the list title as published in the dataset; no elected member.'}],
    notes=['Joint list of two women\'s organisations rather than political parties; included because the list title names both.']))
# ---- k3
LISTS['k3'].append(jlist('k3', 'ב', [
    mkparty('k3', 'ב', 'hapoel-hamizrachi', [W['hm3']], 'high', 3, mconf={8: 'medium'}),
    mkparty('k3', 'ב', 'mizrachi', [W['miz3']], 'high', 3, mconf={10: 'medium'}, mnote={10: 'Knesset biography names no party; Mizrachi per Hebrew Wikipedia and his Knesset 2 Mizrachi faction'}),
], notes=['The Knesset 3 faction was renamed "הפועל המזרחי - המזרחי" on 1955-10-31 and became the merged National Religious Party (מפלגה דתית לאומית) on 1957-01-22 (Knesset OData factions 982, 981).']))
LISTS['k3'].append(jlist('k3', 'גד', [
    mkparty('k3', 'גד', 'agudat-yisrael', [W['trf3']], 'high', 3),
    mkparty('k3', 'גד', 'poalei-agudat-yisrael', [W['trf3']], 'high', 3),
], notes=['Dataset rank 4 "כהן קלמן" is Kalman Kahana (Knesset PersonID 2404) and rank 5 "ינקלביץ זלמן" is Zalman Ben-Ya\'akov (PersonID 2199); matched through the Knesset 3 faction membership.']))
# ---- k4
TRF4 = odata_faction(215, 'After the Torah Religious Front faction split on 1960-08-09: faction 215 "אגודת ישראל" = לוין, לורינץ, פרוש (+ גרוס from 1961-05-30); faction 233 "פועלי אגודת ישראל" = מינץ, כהנא, כ"ץ')
LISTS['k4'].append(jlist('k4', 'גד', [
    mkparty('k4', 'גד', 'agudat-yisrael', [TRF4, W['trf4']], 'high', 4),
    mkparty('k4', 'גד', 'poalei-agudat-yisrael', [TRF4, W['trf4']], 'high', 4),
]))
NOTES['k4'].append('List ב (חזית דתית לאומית) is not split: Mizrachi and Hapoel HaMizrachi merged into the National Religious Party in 1956-57 (OData faction 981; Hebrew Wikipedia). The same applies to ב in 1961-1977.')
# ---- k6
LISTS['k6'].append(jlist('k6', 'את', [
    mkparty('k6', 'את', 'mapai', [W['al1']], 'high', 6),
    mkparty('k6', 'את', 'ahdut-haavoda', [W['al1'], IDI6], 'high', 6, extra={r: [IDI6] for r in [3, 6, 11, 17, 21, 26, 31, 36, 41]}),
], notes=['Conflict: Hebrew Wikipedia\'s article on Ahdut HaAvoda lists its slots as 3, 6, 11, 17, 26, 31, 36, 41, ... (omitting 21), but its Alignment article and the annotated gazette scan both place Ruth Haktin (rank 21) in Ahdut HaAvoda. Assigned to Ahdut HaAvoda.']))
LISTS['k6'].append(jlist('k6', 'חל', [
    mkparty('k6', 'חל', 'herut', [W['gahal6']], 'high', 6),
    mkparty('k6', 'חל', 'liberal-party', [W['gahal6']], 'high', 6),
]))
# ---- k7
LISTS['k7'].append(jlist('k7', 'אמת', [
    mkparty('k7', 'אמת', 'israeli-labor-party', [W['al7']], 'high', 7,
            mconf={29: 'medium'}, mnote={29: 'Dataset name "רייזר-ששון צבי" does not match the gazette: the IDI scan of YP 1563 prints "דינשטיין צבי" at rank 29, and Zvi Dinstein (PersonID 2282) is the only opening Alignment member missing from the roster. Assignment applies to the person at rank 29; the dataset name should be corrected.'},
            extra={29: [IDI7]}),
    mkparty('k7', 'אמת', 'mapam', [W['al7'], IDI7], 'high', 7, extra={r: [IDI7] for r in (26, 33, 40)}),
], notes=['The Israeli Labor Party (1968) was itself a merger of Mapai, Ahdut HaAvoda and Rafi; their former factions are not split out here.']))
LISTS['k7'].append(jlist('k7', 'חל', [
    mkparty('k7', 'חל', 'herut', [W['gahal7']], 'high', 7),
    mkparty('k7', 'חל', 'liberal-party', [W['gahal7']], 'high', 7),
], notes=['Dataset rank 23 "קצנלבוגן בן-ציון" is Ben-Zion Keshet (PersonID 5955), matched by Knesset 7 Gahal membership.']))
# ---- k9
lib9 = [r for r in ranks('k9', 'מחל', 'liberal-party') if r != 16]
SEIDEL = src(bio_url(2337), 'Knesset website, member biography (public activity)', 'official', 'פרש מהמפלגה הליברלית העצמאית והקים את סיעת אחדות, שהצטרפה לליכוד, פברואר 1977')
LISTS['k9'].append(jlist('k9', 'מחל', [
    mkparty('k9', 'מחל', 'herut', [W['likud9'], IDI9], 'high', 9, mconf={24: 'medium'},
            mnote={24: 'Two candidates are printed "כהן יגאל" (ranks 21, 24). Yigal Cohen-Orgad (Herut, PersonID 2399) is placed at 24 by Hebrew Wikipedia citing Maariv 1977; the annotated scan agrees only after its swap arrow.'},
            extra={24: [W['cohen-orgad']]}),
    mkparty('k9', 'מחל', 'liberal-party', [W['likud9'], IDI9], 'high', 9, rk=lib9),
    mkparty('k9', 'מחל', 'laam', [W['likud9'], W['laam-1976'], IDI9], 'high', 9, mconf={21: 'medium'},
            mnote={21: 'Yigal Cohen (La\'am, PersonID 2394) by elimination against the rank-24 statement; see rank 24.'}, extra={21: [W['cohen-orgad']]}),
    party('ahdut-seidel-1977', [16], [SEIDEL, IDI9], 'medium', 'k9', 'מחל', {16: [IDI9]}, {16: 'medium'},
          {16: 'Conflict: Hebrew Wikipedia lists Hillel Seidel under the Liberal Party; his Knesset biography says he founded the Ahdut faction that joined the Likud in February 1977, and the annotated scan appears to mark him "אחדות".'}),
], notes=['La\'am (1976) merged the Independent Centre, State List and Movement for Greater Israel; it is treated as one party here.']))
LISTS['k9'].append(jlist('k9', 'אמת', [
    mkparty('k9', 'אמת', 'israeli-labor-party', [W['al9']], 'high', 9),
    mkparty('k9', 'אמת', 'mapam', [W['al9']], 'high', 9),
]))
LISTS['k9'].append(jlist('k9', 'ו', [
    party('rakah', [1, 2, 4], [W['hadash']], 'high', 'k9', 'ו', {4: [W['zayad']] + faction_ev(2334, 'rakah')}),
    party('black-panthers', [3], [W['hadash']], 'high', 'k9', 'ו'),
], notes=['Rank 5 Hanna Mwais: no source states a constituent party (Hebrew Wikipedia gives only Hadash); Hadash also included Arab local office-holders and other groups.']))
LISTS['k9'].append(jlist('k9', 'ש', [
    party('independent-socialists', [1], [W['sheli']], 'high', 'k9', 'ש'),
    party('moked', [2], [W['sheli']], 'high', 'k9', 'ש'),
], extra_parties=[{'id': 'meri', 'nameHe': P['meri'][0], 'nameEn': P['meri'][1], 'candidateRanks': [], 'sources': [W['sheli']], 'confidence': 'high'},
                  {'id': 'black-panthers', 'nameHe': P['black-panthers'][0], 'nameEn': P['black-panthers'][1], 'candidateRanks': [], 'sources': [W['sheli']], 'confidence': 'medium', 'note': 'Only a group of Black Panthers activists (Saadia Marciano) joined Sheli.'}]))
NOTES['k9'].append('List יש (Democratic Movement for Change) is not split: Hebrew Wikipedia describes it as a merger (התמזגו למפלגה חדשה) of Yadin\'s Democratic Movement and Shinui. List ים (United Arab List) is not split either: no source found describing it as an alliance of parties that kept separate identities.')

# ---- k8 (no dataset roster): members by name only
k8m = json.load(open(S + 'meta/k8-members.json'))
def k8party(pid_, names, sources, conf, note=None):
    he, en = P[pid_]
    o = {'id': pid_, 'nameHe': he, 'nameEn': en, 'candidateRanks': [], 'sources': sources, 'confidence': conf,
         'membersByName': [{'nameHe': persons[p]['FirstName'] + ' ' + persons[p]['LastName'], 'knessetPersonId': p} for n, p in names]}
    if note: o['note'] = note
    return o
pp = {p['PersonID']: p for p in json.load(open(S + 'meta/persons.json'))}
def byid(*ids): return [(None, i) for i in ids]
k8 = {'electionId': 'k8', 'datasetAvailable': False, 'lists': [
 {'letters': 'חל טעם', 'nameHe': 'הליכוד – גח״ל, הרשימה הממלכתית, המרכז החפשי, פעילי א״י השלמה', 'parties': [
   k8party('herut', k8m['likud']['תנועת החרות'], [W['likud8']], 'high'),
   k8party('liberal-party', k8m['likud']['המפלגה הליברלית'], [W['likud8']], 'high'),
   k8party('state-list', k8m['likud']['הרשימה הממלכתית'], [W['likud8']], 'high'),
   k8party('free-centre', k8m['likud']['המרכז החופשי'] + byid(2627), [W['likud8'], src(bio_url(2627), 'Knesset website, member biography (public activity)', 'official', 'בשנת 1967 פרש מחרות ונמנה עם מקימי המרכז החופשי ... עם הפילוג במרכז החופשי, בפברואר 1975, נבחר ליושב-ראש המרכז העצמאי')], 'high',
           'Eliezer Shostak (PersonID 2627) added from his Knesset biography; Hebrew Wikipedia\'s member table omits him.'),
   k8party('greater-israel-movement', k8m['likud']['התנועה למען א"י השלמה'], [W['likud8']], 'medium')],
  'notes': ['39 opening members (OData faction 355, 1974-01-21) all assigned.']},
 {'letters': 'אמת', 'nameHe': 'המערך – מפלגת העבודה הישראלית, מפלגת הפועלים המאוחדת ובלתי מפלגתיים', 'parties': [
   k8party('israeli-labor-party', k8m['alignment']['labor'] + byid(2357, 2150), [W['al8']], 'high'),
   k8party('mapam', k8m['alignment']['mapam'] + byid(2160, 2332), [W['al8'], odata_faction(999, 'Faction 999 "מפלגת פועלים מאוחדת", Knesset 8, 1977-04-10 to 1977-04-12: אפרת, גרוסמן, דרניצקי, זכין, רונן, תלמי')], 'high')],
  'notes': ['51 opening members (OData faction 375).']},
 {'letters': 'גד', 'nameHe': 'חזית דתית תורתית – אגודת ישראל, פועלי אגודת ישראל ודתיים בלתי מפלגתיים', 'parties': [
   k8party('agudat-yisrael', [x for x in k8m['trf']['agudat']], [W['trf8'], odata_faction(361, 'After the split of 1977-03-15: faction 361 (אגודת ישראל) = אברמוביץ, גרוס, לורינץ; faction 371 (פועלי אגודת ישראל) = ורדיגר, כהנא')], 'high'),
   k8party('poalei-agudat-yisrael', k8m['trf']['pai'], [W['trf8'], odata_faction(371, 'Faction 371 "המחנה התורתי – פועלי אגודת ישראל", 1977-03-15 to 1977-06-13: ורדיגר, כהנא')], 'high')]},
 {'letters': 'קנ', 'nameHe': 'מוקד – מק״י ותכלת אדום', 'parties': [
   k8party('blue-red-movement', byid(2547), [W['moked'], src(bio_url(2547), 'Knesset website, member biography (public activity)', 'official', 'ממייסדי תנועת תכלת-אדום (1973). | עמד בראש מפלגת מוקד (1973).')], 'high'),
   {'id': 'maki', 'nameHe': P['maki'][0], 'nameEn': P['maki'][1], 'candidateRanks': [], 'sources': [W['moked']], 'confidence': 'high', 'note': 'No elected member.'}]},
], 'notes': ['k8 has no released dataset roster, so candidateRanks are empty; members are given by Knesset PersonID (opening membership 1974-01-21). Join to ranks once the k8 roster is transcribed.']}
for l in k8['lists']:
    for p in l['parties']:
        for mm in p.get('membersByName', []):
            mm['nameHe'] = pp[mm['knessetPersonId']]['FirstName'] + ' ' + pp[mm['knessetPersonId']]['LastName']
json.dump(k8, open(S + 'meta/k8-lists.json', 'w'), ensure_ascii=False, indent=1)
json.dump({k: v for k, v in LISTS.items()}, open(S + 'meta/lists.json', 'w'), ensure_ascii=False, indent=1)
json.dump(NOTES, open(S + 'meta/list-notes.json', 'w'), ensure_ascii=False, indent=1)
print({k: [(l['letters'], [(p['id'], len(p['candidateRanks'])) for p in l['parties']], l['unassignedRanks']) for l in v] for k, v in LISTS.items()})
print({l['letters']: [(p['id'], len(p['membersByName']) if 'membersByName' in p else 0) for p in l['parties']] for l in k8['lists']})
