import json, sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from emit import src, hew, ACC, ROOT, S, odata_faction, ODATA

LISTS = json.load(open(S + 'meta/lists.json'))
NOTES = json.load(open(S + 'meta/list-notes.json'))
K8 = json.load(open(S + 'meta/k8-lists.json'))
DATE = {'k1': '1949-01-25', 'k2': '1951-07-30', 'k3': '1955-07-26', 'k4': '1959-11-03', 'k5': '1961-08-15',
        'k6': '1965-11-02', 'k7': '1969-10-28', 'k8': '1973-12-31', 'k9': '1977-05-17'}
ORD = {1: 'הראשונה', 3: 'השלישית', 7: 'השביעית', 9: 'התשיעית', 10: 'העשירית', 13: 'השלוש עשרה', 15: 'החמש עשרה', 16: 'השש עשרה', 18: 'השמונה עשרה'}

def seated(k):
    if k == 'k8':
        d = json.load(open(ROOT + 'data/raw/k8/national.reviewed.json'))
        return [(l['letters'], l['nameHe'], l['officialSeats']) for l in d['lists'] if l['officialSeats'] > 0]
    d = json.load(open(ROOT + 'public/data/%s.json' % k))
    return [(l['letters'], l['nameHe'], d['officialSeats'][l['id']]) for l in d['lists'] if d['officialSeats'].get(l['id'], 0) > 0]

# minister factions at swearing-in, derived from OData (official data, our tabulation)
MIN = {}
for line in open(S + 'meta/gov-ministers.txt'):
    mm = re.match(r'^(\d+) (\d{4}-\d\d-\d\d) (\{.*\})$', line.strip())
    if mm: MIN[int(mm.group(1))] = (mm.group(2), mm.group(3))
WIKI_GOV = {}
cur = None
for line in open(S + 'meta/gov-wiki.txt'):
    if line.startswith('## '): cur = line[3:].strip(); WIKI_GOV[cur] = []
    elif cur and line.strip().startswith('('):
        t = eval(line.strip()); WIKI_GOV[cur].append(t)

GOV = {
 'k1': (1, ['א', 'ב', 'פ', 'ס', 'יד'], []),
 'k2': (3, ['א', 'ה', 'ב', 'ג', 'ד', 'יד', 'נ', 'ע'], []),
 'k3': (7, ['א', 'ב', 'תו', 'מ', 'פ', 'יד', 'נ', 'ע'], []),
 'k4': (9, ['א', 'ב', 'מ', 'תו', 'פ', 'רא', 'יא', 'ע'], ['Hebrew Wikipedia marks the Torah Religious Front as opposition at formation, part of it joining the coalition later.']),
 'k5': (10, ['א', 'ב', 'תו', 'ד', 'יא', 'רא'], []),
 'k6': (13, ['את', 'ב', 'מ', 'לע', 'ד', 'רא', 'יא'], ['Rafi joined on 1 June 1967 and Gahal on 5 June 1967 (Hebrew Wikipedia, הכנסת השישית); not part of the coalition at formation.']),
 'k7': (15, ['אמת', 'חל', 'ב', 'לע', 'רא', 'יא'], ['National unity government: Gahal was in the coalition at formation (four ministers per Knesset OData).']),
 'k8': (16, ['אמת', 'ב', 'ל', 'רא', 'עא'], ['Hebrew Wikipedia notes that Progress and Development and the Arab List for Bedouin and Villagers joined the Alignment faction before the government was formed (OData: 1974-02-26).']),
 'k9': (18, ['מחל', 'ב', 'ג', 'כנ'], ['The Democratic Movement for Change (יש) joined on 24 October 1977 (its ministers start 1977-10-24 in Knesset OData), so it is not a member at formation.',
                                      'Agudat Yisrael supported the coalition without ministers (Hebrew Wikipedia).',
                                      'Moshe Dayan, elected on the Alignment list (אמת), joined the government as an individual minister; the Alignment list itself was in opposition.']),
}
GOVNAMES = {}

def gov_scheme(k):
    g, coal, notes = GOV[k]
    st, counts = MIN[g]
    seats = seated(k)
    letters = [s[0] for s in seats]
    assert set(coal) <= set(letters), (k, set(coal) - set(letters))
    opp = [s for s in seats if s[0] not in coal]
    top = max(s[2] for s in opp)
    main = [s[0] for s in opp if s[2] == top]
    wt = ORD[g].replace(' ', '_')
    wrows = WIKI_GOV.get(wt, [])
    wq = 'קואליציה: ' + ', '.join(r[0] for r in wrows if r[3].startswith('קואליציה')) + ' | אופוזיציה: ' + ', '.join(r[0] for r in wrows if r[3].startswith('אופוזיציה'))
    coalseats = sum(s[2] for s in seats if s[0] in coal)
    return {
        'id': 'first-government', 'nameHe': 'הממשלה ה-%d (הממשלה הראשונה של הכנסת)' % g,
        'nameEn': 'Government %d (first government of the Knesset)' % g, 'kind': 'government', 'date': st,
        'governmentNumber': g,
        'blocs': [
            {'id': 'coalition', 'nameHe': 'קואליציה', 'nameEn': 'Coalition', 'color': '#3A6EA5', 'seats': coalseats,
             'members': [{'letters': l} for l in coal]},
            {'id': 'opposition', 'nameHe': 'אופוזיציה', 'nameEn': 'Opposition', 'color': '#8C8C8C', 'seats': 120 - coalseats,
             'members': [{'letters': s[0]} for s in opp], 'mainOpposition': [{'letters': l} for l in main]},
        ],
        'sources': [
            src(ODATA + 'KNS_PersonToPosition?$filter=GovernmentNum%%20eq%%20%d&$format=json' % g, 'Knesset OData (ParliamentInfo)', 'official',
                'Government %d sworn in %s. Ministers at swearing-in by their Knesset faction (project tabulation of the OData records): %s' % (g, st, counts)),
            src(hew('ממשלת ישראל ' + ORD[g]), 'Hebrew Wikipedia', 'secondary', wq[:600]),
        ],
        'notes': ['Coalition = lists that joined or supported the government at its formation. Official records give ministers only; support-only lists (e.g. Mapai-affiliated Arab lists) rest on Hebrew Wikipedia.'] + notes,
        'confidence': 'high',
    }

SAT = {'k1': ['יד'], 'k2': ['יד', 'נ', 'ע'], 'k3': ['יד', 'נ', 'ע'], 'k4': ['רא', 'יא', 'ע'], 'k5': ['יא', 'רא'],
       'k6': ['רא', 'יא'], 'k7': ['רא', 'יא'], 'k8': ['רא', 'עא'], 'k9': ['ים']}
ANCHOR = {'k1': 'א', 'k2': 'א', 'k3': 'א', 'k4': 'א', 'k5': 'א', 'k6': 'את', 'k7': 'אמת', 'k8': 'אמת', 'k9': 'אמת'}
SATSRC = {
 'יד': [src(hew('הרשימה הדמוקרטית של נצרת'), 'Hebrew Wikipedia', 'secondary', 'בדומה לשאר המפלגות הערביות בזמנה שימשה המפלגה מפלגת לוויין של מפא"י'),
        src(hew('רשימה דמוקרטית לערביי ישראל'), 'Hebrew Wikipedia', 'secondary', 'הייתה מפלגת מיעוטים ששימשה כמפלגת לווין של מפא"י')],
 'נ': [src(hew('קידמה ועבודה'), 'Hebrew Wikipedia', 'secondary', 'הייתה מפלגת מיעוטים ששימשה, בדומה לשאר המפלגות הערביות בזמנה, מפלגת לווין של מפא"י')],
 'ע': [src(hew('חקלאות ופיתוח'), 'Hebrew Wikipedia', 'secondary', 'הייתה מפלגת מיעוטים שהיוותה, כמו כלל המפלגות הערביות בשנות המדינה הראשונות, מפלגת לוויין של מפא"י')],
 'רא': [src(hew('קידמה ופיתוח'), 'Hebrew Wikipedia', 'secondary', 'הייתה מפלגת מיעוטים ששימשה כמפלגת לוויין של מפא"י והמערך')],
 'יא': [src(hew('שיתוף ואחווה'), 'Hebrew Wikipedia', 'secondary', 'הייתה מפלגת מיעוטים שהייתה קשורה למפא"י ומפלגת העבודה, והיוותה ... מפלגת לוויין')],
 'עא': [src(hew('רשימה ערבית לבדואים וכפריים'), 'Hebrew Wikipedia (citing Maariv, 3.8.1973)', 'secondary', 'שתפעל כמפלגת לווין של המערך')],
 'ים': [src(hew('הכנסת התשיעית'), 'Hebrew Wikipedia', 'secondary', 'הרשימה הערבית המאוחדת, שאיחדה את סיעות הלוויין של המערך, הסתפקה אף היא במושב אחד')],
}
def sat_scheme(k):
    sats = SAT[k]; seats = {s[0]: s[2] for s in seated(k)}
    assert all(s in seats for s in sats), k
    srcs = []
    for s in sats:
        for x in SATSRC[s]:
            if x not in srcs: srcs.append(x)
    return {'id': 'labour-affiliated-arab-lists', 'nameHe': 'מפא"י/המערך והרשימות הערביות המסונפות אליה (רשימות לוויין)',
            'nameEn': 'Mapai/Alignment and its affiliated Arab (satellite) lists', 'kind': 'parliamentary', 'date': DATE[k],
            'blocs': [{'id': 'labour-and-affiliates', 'nameHe': ('מפא"י' if k <= 'k5' and len(k) == 2 else 'המערך') + ' ורשימות הלוויין',
                       'nameEn': ('Mapai' if k in ('k1', 'k2', 'k3', 'k4', 'k5') else 'Alignment') + ' and affiliated Arab lists', 'color': '#AD0101',
                       'members': [{'letters': ANCHOR[k]}] + [{'letters': s} for s in sats], 'affiliatedLists': [{'letters': s} for s in sats]}],
            'sources': srcs,
            'notes': ['Widely described affiliation, not a joint list or formal bloc agreement; satellites ran separately and sat as separate factions.' +
                      (' In 1977 the United Arab List sat in opposition.' if k == 'k9' else '')],
            'confidence': 'medium'}

# ---------------------------------------------------------------- colours (Hebrew Wikipedia convention only)
HEWIKI_ELEC = {'k1': 'הבחירות לאספה המכוננת', 'k2': 'הבחירות לכנסת השנייה', 'k3': 'הבחירות לכנסת השלישית', 'k4': 'הבחירות לכנסת הרביעית',
               'k5': 'הבחירות לכנסת החמישית', 'k6': 'הבחירות לכנסת השישית', 'k7': 'הבחירות לכנסת השביעית', 'k8': 'הבחירות לכנסת השמינית', 'k9': 'הבחירות לכנסת התשיעית'}
# letters -> (colour, key, confidence, note)
LC = {
 'k1': {'א': ('#AD0101', 'mapai'), 'מ': ('#96342E', 'mapam'), 'ב': ('#172D81', 'united-religious-front'), 'ח': ('#0078BA', 'herut'),
        'צ': ('#00ADCC', 'general-zionists'), 'פ': ('#FECA0A', 'progressive-party'), 'ס': ('#EB4112', 'sephardim'), 'ק': ('#FF0000', 'maki'),
        'יד': ('#297C32', 'satellite', 'low'), 'טו': ('#0038B8', 'fighters-list', 'low'), 'נ': ('#EF158D', 'wizo', 'low'), 'ל': ('#89C5C6', 'yemenite-association')},
 'k2': {'א': ('#AD0101', 'mapai'), 'צ': ('#00ADCC', 'general-zionists'), 'מ': ('#96342E', 'mapam'), 'ה': ('#007B8E', 'hapoel-hamizrachi'), 'ח': ('#0078BA', 'herut'),
        'ק': ('#FF0000', 'maki'), 'פ': ('#FECA0A', 'progressive-party'), 'יד': ('#006818', 'satellite', 'low'), 'ג': ('#C5AE6D', 'agudat-yisrael'),
        'סצ': ('#EB4112', 'sephardim'), 'ב': ('#0F1D35', 'mizrachi'), 'ד': ('#DF561D', 'poalei-agudat-yisrael'), 'נ': ('#AF0000', 'satellite', 'low'),
        'ל': ('#89C5C6', 'yemenite-association'), 'ע': ('#FF5252', 'satellite', 'low')},
 'k3': {'א': ('#AD0101', 'mapai'), 'ח': ('#0078BA', 'herut'), 'צ': ('#00ADCC', 'general-zionists'), 'ב': ('#4D1552', 'national-religious'),
        'תו': ('#CE2029', 'ahdut-haavoda'), 'מ': ('#96342E', 'mapam'), 'גד': ('#172D81', 'religious-torah-front', 'low', 'Same colour Hebrew Wikipedia uses for the 1949 United Religious Front.'),
        'ק': ('#FF0000', 'maki'), 'פ': ('#FECA0A', 'progressive-party'), 'יד': ('#006818', 'satellite', 'low'), 'נ': ('#AF0000', 'satellite', 'low'), 'ע': ('#FF5252', 'satellite', 'low')},
 'k4': {'א': ('#AD0101', 'mapai'), 'ח': ('#0078BA', 'herut'), 'ב': ('#4D1552', 'national-religious'), 'מ': ('#96342E', 'mapam'), 'צ': ('#00ADCC', 'general-zionists'),
        'תו': ('#CE2029', 'ahdut-haavoda'), 'גד': ('#172D81', 'religious-torah-front', 'low'), 'פ': ('#FECA0A', 'progressive-party'), 'ק': ('#FF0000', 'maki'),
        'רא': ('#AF0000', 'satellite', 'low'), 'יא': ('#AF2F2F', 'satellite', 'low'), 'ע': ('#FF5252', 'satellite', 'low')},
 'k5': {'א': ('#AD0101', 'mapai'), 'ח': ('#0078BA', 'herut'), 'ל': ('#FECA0A', 'liberal-party', 'medium', 'Same yellow Hebrew Wikipedia uses for the Progressive Party (a predecessor) and later the Independent Liberals.'),
        'ב': ('#4D1552', 'national-religious'), 'מ': ('#96342E', 'mapam'), 'תו': ('#CE2029', 'ahdut-haavoda'), 'ק': ('#FF0000', 'maki'),
        'ג': ('#C5AE6D', 'agudat-yisrael'), 'ד': ('#DF561D', 'poalei-agudat-yisrael'), 'יא': ('#AF2F2F', 'satellite', 'low'), 'רא': ('#AF0000', 'satellite', 'low')},
 'k6': {'את': ('#CE2029', 'alignment', 'medium', 'Hebrew Wikipedia uses #CE2029 in the 1965 results table but #EE161F for the same faction in its 6th Knesset article.'),
        'חל': ('#143997', 'gahal'), 'ב': ('#4D1552', 'national-religious'), 'כא': ('#3333CC', 'rafi', 'low'), 'מ': ('#96342E', 'mapam'),
        'לע': ('#FECA0A', 'independent-liberals', 'low', 'Same yellow as the Liberal Party in Hebrew Wikipedia.'), 'ג': ('#C5AE6D', 'agudat-yisrael'),
        'ו': ('#AB0E1A', 'rakah'), 'ד': ('#DF561D', 'poalei-agudat-yisrael'), 'רא': ('#AF0000', 'satellite', 'low'), 'יא': ('#AF2F2F', 'satellite', 'low'),
        'ש': ('#D02D0A', 'haolam-hazeh', 'low'), 'ק': ('#FF0000', 'maki')},
 'k7': {'אמת': ('#EE1C25', 'alignment'), 'חל': ('#143997', 'gahal'), 'ב': ('#4D1552', 'national-religious'), 'ג': ('#C5AE6D', 'agudat-yisrael'),
        'לע': ('#FECA0A', 'independent-liberals', 'low'), 'עמ': ('#45964A', 'state-list'), 'ו': ('#AB0E1A', 'rakah'), 'רא': ('#AF0000', 'satellite', 'low'),
        'ד': ('#DF561D', 'poalei-agudat-yisrael'), 'יא': ('#AF2F2F', 'satellite', 'low'), 'ש': ('#D02D0A', 'haolam-hazeh', 'low'), 'ט': ('#0058D5', 'free-centre'), 'ק': ('#FF0000', 'maki')},
 'k8': {'אמת': ('#EE1C25', 'alignment'), 'חל טעם': ('#1F5AA5', 'likud', 'medium', 'Convention only: per Haaretz (cited by Hebrew Wikipedia) the Likud logo became blue only in 1981.'),
        'ב': ('#4D1552', 'national-religious'), 'גד': ('#172D81', 'religious-torah-front', 'low'), 'ל': ('#FECA0A', 'independent-liberals', 'low'),
        'ו': ('#AB0E1A', 'rakah'), 'רצ': ('#002A0C', 'ratz', 'low'), 'רא': ('#AF0000', 'satellite', 'low'), 'קנ': ('#FF2A24', 'moked', 'low'), 'עא': ('#D92C11', 'satellite', 'low')},
 'k9': {'מחל': ('#1F5AA5', 'likud', 'medium', 'Convention only: per Haaretz (cited by Hebrew Wikipedia) the Likud logo became blue only in 1981.'),
        'אמת': ('#EE1C25', 'alignment'), 'יש': ('#336EB2', 'dash', 'low'), 'ב': ('#4D1552', 'national-religious'), 'ו': ('#EA1F25', 'hadash', 'low'),
        'ג': ('#C5AE6D', 'agudat-yisrael'), 'פש': ('#404042', 'flatto-sharon', 'low'), 'כנ': ('#0D316C', 'shlomtzion', 'low'),
        'ש': ('#AB0E1A', 'sheli', 'low', 'Same colour Hebrew Wikipedia uses for Rakah.'), 'ים': ('#297C32', 'satellite', 'low'), 'ד': ('#DF561D', 'poalei-agudat-yisrael'),
        'רצ': ('#002A0C', 'ratz', 'low'), 'לע': ('#FECA0A', 'independent-liberals', 'low')},
}
NOTE_CONSISTENT = 'Hebrew Wikipedia uses the same colour for this party in every results table of 1949-1977 where it appears.'
EXTRA_NOTE = {'agudat-yisrael': 'Hebrew Wikipedia results tables use #C5AE6D; its 6th Knesset article legend uses #122D70.',
              'national-religious': 'Results tables use #4D1552; the NRP article infobox uses #623963.'}
PARTYC = [  # constituent parties of joint lists (from the member legends of Hebrew Wikipedia list articles)
 ('hapoel-hamizrachi', '#007B8E', 'medium', 'החזית הדתית המאוחדת legend; also the 1951 results table'),
 ('mizrachi', '#0F1D35', 'medium', 'החזית הדתית המאוחדת legend; also the 1951 results table'),
 ('agudat-yisrael', '#C5AE6D', 'medium', 'החזית הדתית המאוחדת legend; results tables 1951-1977'),
 ('poalei-agudat-yisrael', '#DF561D', 'medium', 'החזית הדתית המאוחדת legend; results tables 1951-1977'),
 ('herut', '#0078BA', 'medium', 'הליכוד member legend; results tables 1949-1961'),
 ('liberal-party', '#FECA0A', 'medium', 'הליכוד member legend; 1961 results table. Shared with the Independent Liberals and Progressives.'),
 ('laam', '#3B916A', 'low', 'הליכוד member legend only'),
 ('state-list', '#45964A', 'medium', 'הליכוד member legend; 1969 results table'),
 ('free-centre', '#0058D5', 'medium', 'הליכוד member legend (#0058d4); 1969 results table'),
 ('greater-israel-movement', '#213864', 'low', 'הליכוד member legend only'),
 ('mapai', '#AD0101', 'medium', 'results tables 1949-1961'),
 ('ahdut-haavoda', '#CE2029', 'medium', 'results tables 1955-1961'),
 ('israeli-labor-party', '#EE1C25', 'medium', 'used for the Alignment 1969-1977 and for Labor in the 6th Knesset article (#EE161F)'),
 ('mapam', '#96342E', 'medium', 'results tables 1949-1965'),
 ('rakah', '#AB0E1A', 'medium', 'results tables 1965-1973'),
 ('maki', '#FF0000', 'medium', 'results tables 1949-1969'),
 ('moked', '#FF2A24', 'low', '1973 results table only'),
 ('wizo', '#EF158D', 'low', '1949 results table only'),
]

def colours(k):
    out = []
    u = hew(HEWIKI_ELEC[k])
    for L, v in LC[k].items():
        col, key = v[0], v[1]; conf = v[2] if len(v) > 2 else 'medium'; note = v[3] if len(v) > 3 else None
        basis = 'Conventional colour in the Hebrew Wikipedia results table for this election. No official, ballot or campaign colour source was found for 1949-1977 (ballots were letter-coded).'
        if conf == 'medium' and not note: basis += ' ' + NOTE_CONSISTENT
        if key in EXTRA_NOTE: note = EXTRA_NOTE[key]
        if key == 'satellite': note = 'Hebrew Wikipedia gives the Mapai-affiliated Arab lists similar reds that change between elections; not distinctive.'
        e = {'letters': L, 'colorKey': key, 'color': col, 'basis': basis,
             'sources': [src(u, 'Hebrew Wikipedia', 'secondary', 'results-table row background %s' % col)], 'confidence': conf}
        if note: e['note'] = note
        out.append(e)
    used = {p['id'] for l in (LISTS.get(k, []) if k != 'k8' else K8['lists']) for p in l['parties']}
    for pid, col, conf, where in PARTYC:
        if pid in used:
            out.append({'party': pid, 'color': col, 'basis': 'Hebrew Wikipedia convention (%s). No official colour source found.' % where,
                        'sources': [src(hew('החזית הדתית המאוחדת' if pid in ('hapoel-hamizrachi', 'mizrachi', 'agudat-yisrael', 'poalei-agudat-yisrael') else ('הליכוד' if pid in ('herut', 'liberal-party', 'laam', 'state-list', 'free-centre', 'greater-israel-movement') else HEWIKI_ELEC[k])),
                                        'Hebrew Wikipedia', 'secondary', 'colour %s' % col)], 'confidence': conf})
    return out

os.makedirs(ROOT + 'data/meta', exist_ok=True)
for k in ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9']:
    seats = seated(k)
    lc = set(LC[k]); sl = {s[0] for s in seats}
    assert sl <= lc, (k, sl - lc)
    if k == 'k8':
        lists = K8['lists']
    else:
        lists = LISTS.get(k, [])
    doc = {'electionId': k, 'electionDate': DATE[k], 'era': '1949-1977', 'generated': ACC,
           'lists': lists, 'blocSchemes': [gov_scheme(k), sat_scheme(k)], 'colours': colours(k)}
    if k == 'k8':
        doc['datasetAvailable'] = False
        doc['notes'] = K8['notes']
    notes = NOTES.get(k, [])
    if k in ('k2', 'k5'):
        notes = notes + ['No list in this election was an alliance of separate parties (Mizrachi, Hapoel HaMizrachi, Agudat Yisrael and Poalei Agudat Yisrael ran separately in 1951 and 1961; the 1961 Liberal Party and the NRP were already merged parties).']
    if notes: doc['notes'] = doc.get('notes', []) + notes
    json.dump(doc, open(ROOT + 'data/meta/%s.json' % k, 'w'), ensure_ascii=False, indent=2)
    print(k, 'lists', len(lists), 'colours', len(doc['colours']), 'coalition', doc['blocSchemes'][0]['blocs'][0]['seats'])
