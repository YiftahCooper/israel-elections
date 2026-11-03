"""Build data/meta/k1..k9.json for the 1949-1977 era from scratch evidence.
Inputs live in .backup-scratch (OData/Knesset API pulls, Hebrew Wikipedia raw text, IDI scans).
No English Wikipedia is used anywhere (owner rule, 4 Nov 2026)."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from cfg import final, m, persons
from kw import bio

ROOT = '/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/'
S = ROOT + '.backup-scratch/'
ACC = '2026-11-04'
site = {s['KnsID']: s['SiteId'] for s in json.load(open(S + 'meta/sitecodes.json'))}

def hew(title):
    return 'https://he.wikipedia.org/wiki/' + title.replace(' ', '_')

def src(url, publisher, kind, quote, condensed=False):
    o = {'url': url, 'publisher': publisher, 'kind': kind, 'quote': quote, 'accessed': ACC}
    if condensed: o['quoteNote'] = 'Condensed transcription of a member list in the source; "/" separates its party headings, "..." marks omitted names and [ ] marks editorial notes.'
    return o

ODATA = 'https://knesset.gov.il/Odata/ParliamentInfo.svc/'
def odata_faction(fid, quote):
    return src(ODATA + 'KNS_PersonToPosition?$filter=FactionID%20eq%20' + str(fid) + '&$format=json',
               'Knesset OData (ParliamentInfo)', 'official', quote)
def idi(path, quote):
    return src('https://www.idi.org.il/media/' + path, 'Israel Democracy Institute (scan of the official candidates gazette, with handwritten party marks of unknown authorship)', 'secondary', quote)
def bio_url(pid):
    return 'https://knesset.gov.il/WebSiteApi/knessetapi/MKs/GetMkPublicActivity?mkId=%d&languageKey=he' % site[pid]

# ---------------------------------------------------------------- party catalogue
P = {
 'mapai': ('מפא"י – מפלגת פועלי ארץ ישראל', 'Mapai'),
 'ahdut-haavoda': ('אחדות העבודה – פועלי ציון', 'Ahdut HaAvoda–Poalei Zion'),
 'israeli-labor-party': ('מפלגת העבודה הישראלית', 'Israeli Labor Party'),
 'mapam': ('מפ"ם – מפלגת הפועלים המאוחדת', 'Mapam'),
 'herut': ('תנועת החרות', 'Herut'),
 'liberal-party': ('המפלגה הליברלית', 'Liberal Party'),
 'laam': ('לע"ם', "La'am"),
 'state-list': ('הרשימה הממלכתית', 'State List'),
 'free-centre': ('המרכז החופשי', 'Free Centre'),
 'greater-israel-movement': ('התנועה למען ארץ ישראל השלמה', 'Movement for Greater Israel'),
 'ahdut-seidel-1977': ('סיעת "אחדות" (הלל זיידל)', 'Ahdut faction (Hillel Seidel)'),
 'mizrachi': ('המזרחי', 'Mizrachi'),
 'hapoel-hamizrachi': ('הפועל המזרחי', 'Hapoel HaMizrachi'),
 'agudat-yisrael': ('אגודת ישראל', 'Agudat Yisrael'),
 'poalei-agudat-yisrael': ('פועלי אגודת ישראל', 'Poalei Agudat Yisrael'),
 'non-party-religious-union': ('האיחוד הדתי הבלתי-מפלגתי', 'Non-party religious union'),
 'wizo': ('הסתדרות נשים ציוניות ויצ"ו', 'WIZO'),
 'womens-equal-rights-association': ('התאחדות נשים לשווי זכויות בישראל', "Women's Equal Rights Association"),
 'rakah': ('רק"ח – הרשימה הקומוניסטית החדשה', 'Rakah'),
 'black-panthers': ('הפנתרים השחורים', 'Black Panthers'),
 'maki': ('מק"י – המפלגה הקומוניסטית הישראלית', 'Maki'),
 'blue-red-movement': ('תנועת תכלת-אדום', 'Blue-Red Movement'),
 'moked': ('מוקד', 'Moked'),
 'independent-socialists': ('הסיעה הסוציאליסטית העצמאית (הסיעה הסוציאל-דמוקרטית)', 'Independent Socialist (Social-Democratic) Faction'),
 'meri': ('מר"י – מחנה רדיקלי ישראלי', 'Meri (Israeli Radical Camp)'),
}

# ---------------------------------------------------------------- Hebrew Wikipedia sources (secondary)
W = {
 'urf': src(hew('החזית הדתית המאוחדת'), 'Hebrew Wikipedia', 'secondary',
            'הפועל המזרחי: חיים משה שפירא, משה אונא, זרח ורהפטיג, אליהו-משה גנחובסקי, יוסף בורג, אהרן-יעקב גרינברג, משה קלמר / המזרחי: יהודה לייב פישמן מימון, דוד צבי פנקס, מרדכי נורוק, אברהם-חיים שאג / פועלי אגודת ישראל: בנימין מינץ, קלמן כהנא, אברהם יהודה גולדראט / אגודת ישראל: יצחק מאיר לוין, מאיר דוד לוונשטיין, אליהו מזור', condensed=True),
 'hm3': src(hew('הפועל המזרחי'), 'Hebrew Wikipedia', 'secondary',
            'הכנסת השלישית (1955) במסגרת החזית הדתית לאומית – 9 מנדטים (מתוך 11 לרשימה כולה): משה שפירא, יוסף בורג, יצחק רפאל, זרח ורהפטיג, משה אונא, אהרן-יעקב גרינברג, פריג\'א זוארץ, משה קלמר, מיכאל חזני', condensed=True),
 'miz3': src(hew('תנועת המזרחי'), 'Hebrew Wikipedia', 'secondary',
             'הכנסת השלישית (1955) במסגרת החזית הדתית לאומית – 2 מנדטים (מתוך 11 לרשימה כולה): שלמה ישראל בן-מאיר, מרדכי נורוק', condensed=True),
 'nrp-merge': src(hew('הפועל המזרחי'), 'Hebrew Wikipedia', 'secondary',
                  'בשנת 1956, במהלך כהונת הכנסת התאחדו המפלגות סופית והקימו את המפד"ל'),
 'trf3': src(hew('חזית דתית תורתית'), 'Hebrew Wikipedia', 'secondary',
             'הכנסת השלישית (1955): אגודת ישראל: יצחק מאיר לוין, שלמה לורינץ, זלמן בן-יעקב / פועלי אגודת ישראל: בנימין מינץ, קלמן כהנא, יעקב כ"ץ', condensed=True),
 'trf4': src(hew('חזית דתית תורתית'), 'Hebrew Wikipedia', 'secondary',
             'הכנסת הרביעית (1959): אגודת ישראל: יצחק מאיר לוין, שלמה לורינץ, מנחם פרוש, [שלמה יעקב גרוס – מחליף] / פועלי אגודת ישראל: בנימין מינץ, קלמן כהנא, יעקב כ"ץ', condensed=True),
 'trf8': src(hew('חזית דתית תורתית'), 'Hebrew Wikipedia', 'secondary',
             'הכנסת השמינית (1973): אגודת ישראל: שלמה לורינץ, יהודה מאיר אברמוביץ, מנחם פרוש, [שלמה יעקב גרוס – מחליף] / פועלי אגודת ישראל: קלמן כהנא, אברהם ורדיגר', condensed=True),
 'al1': src(hew('המערך לאחדות פועלי ארץ ישראל'), 'Hebrew Wikipedia', 'secondary',
            'אחדות העבודה – פועלי ציון: ישראל גלילי, יגאל אלון, משה כרמל, מרדכי ביבי, רות הקטין, זאב צור, משה ארם, גבריאל כהן, אברהם ביטון, [שושנה ארבלי-אלמוזלינו – מחליפה] / מפא"י: לוי אשכול, קדיש לוז, גולדה מאיר, בכור-שלום שטרית, זלמן ארן, פנחס ספיר, אבא אבן, ... (36 נבחרים ומחליפים)', condensed=True),
 'ahdut-slots': src(hew('אחדות העבודה - פועלי ציון'), 'Hebrew Wikipedia', 'secondary',
                    'חברי המפלגה שובצו במקומות: 3, 6, 11, 17, 26, 31, 36, 41, 46, 51, 56 ברשימה המשותפת'),
 'gahal6': src(hew('גח"ל'), 'Hebrew Wikipedia', 'secondary',
               'הכנסת השישית (1965), 26 מנדטים: חרות: מנחם בגין, יוחנן בדר, אריה בן-אליעזר, יעקב מרידור, חיים לנדאו, יוסף שופמן, שמואל תמיר, אליעזר שוסטק, בנימין אבניאל, אסתר רזיאל-נאור, אברהם טיאר, יוסף קרמרמן, אליהו מרידור, חיים כהן-מגורי, מנחם ידיד / המפלגה הליברלית: יוסף ספיר, אלימלך-שמעון רימלט, יוסף סרלין, מרדכי-חיים שטרן, יצחק-הנס קלינגהופר, צבי צימרמן, שניאור זלמן אברמוב, ברוך עוזיאל, שלמה פרלשטיין, אהרן גולדשטיין, יוסף תמיר', condensed=True),
 'gahal7': src(hew('גח"ל'), 'Hebrew Wikipedia', 'secondary',
               'הכנסת השביעית (1969), 26 מנדטים: חרות: מנחם בגין, יוחנן בדר, בנימין הלוי, אריה בן-אליעזר, חיים לנדאו, אסתר רזיאל-נאור, יוסף קרמרמן, מנחם ידיד, אברהם שכטרמן, יורם ארידור, חיים קורפו, בן-ציון קשת, דוד לוי, דב מילמן, יעקב נחושתן / המפלגה הליברלית: יוסף ספיר, אלימלך-שמעון רימלט, יוסף סרלין, יצחק-הנס קלינגהופר, צבי צימרמן, שמחה ארליך, אהרן גולדשטיין, יוסף תמיר, שניאור זלמן אברמוב, אברהם כץ, משה נסים', condensed=True),
 'al7': src(hew('המערך'), 'Hebrew Wikipedia', 'secondary',
            'הכנסת השביעית (1969): מפ"ם: מאיר יערי, יעקב חזן, ראובן ארזי, דב זכין, שלמה רוזן, חייקה גרוסמן, עבד אל-עזיז א-זועבי / העבודה: גולדה מאיר, יגאל אלון, ... צבי דינשטיין, ... [שאר הנבחרים]', condensed=True),
 'al8': src(hew('המערך'), 'Hebrew Wikipedia', 'secondary',
            'הכנסת השמינית (1973): מפ"ם: מאיר תלמי, דב זכין, חייקה גרוסמן, אהרן אפרת, עבד אל-עזיז א-זועבי, יהודה דרניצקי, אליעזר רונן / העבודה: [שאר הנבחרים]', condensed=True),
 'al9': src(hew('המערך'), 'Hebrew Wikipedia', 'secondary',
            'הכנסת התשיעית (1977): מפ"ם: מאיר תלמי, נפתלי פדר, חייקה גרוסמן, משה עמאר, [אמרי רון – מחליף] / העבודה: [שאר הנבחרים]', condensed=True),
 'likud8': src(hew('הליכוד'), 'Hebrew Wikipedia', 'secondary',
               'הכנסת השמינית: תנועת החרות (17), המפלגה הליברלית (13), הרשימה הממלכתית: יגאל הורביץ, זלמן שובל, אמנון לין, יצחק פרץ; המרכז החופשי: שמואל תמיר, עקיבא נוף, אהוד אולמרט / התנועה למען א"י השלמה: אברהם יפה / "אהוד אולמרט ואליעזר שוסטק פרשו מהמרכז החופשי ב-1974"', condensed=True),
 'likud9': src(hew('הליכוד'), 'Hebrew Wikipedia', 'secondary',
               'הכנסת התשיעית: תנועת החרות: מנחם בגין, עזר ויצמן, יצחק שמיר, ... / המפלגה הליברלית: שמחה ארליך, משה נסים, ..., הלל זיידל, ... / לע"ם: יגאל הורביץ, אליעזר שוסטק, משה שמיר, יגאל כהן, אמנון לין, אהוד אולמרט, זלמן שובל, יצחק פרץ', condensed=True),
 'likud-founding': src(hew('הליכוד'), 'Hebrew Wikipedia', 'secondary',
                       'מפלגת הליכוד הוקמה ב-13 בספטמבר 1973 ... כרשימה משותפת למספר מפלגות ותנועות: גח"ל (רשימה משותפת למפלגות תנועת החרות והמפלגה הליברלית), הרשימה הממלכתית, המרכז החופשי, התנועה למען ארץ ישראל השלמה. תנועות אלו שמרו על מוסדותיהן המפלגתיים'),
 'laam-1976': src(hew('הליכוד'), 'Hebrew Wikipedia', 'secondary',
                  'ב-1976 התאחדו המפלגות המרכז העצמאי, הרשימה הממלכתית, והתנועה למען ארץ ישראל השלמה, והקימו את מפלגת לע"ם, שנשארה חברה בסיעת הליכוד'),
 'cohen-orgad': src(hew('יגאל כהן-אורגד'), 'Hebrew Wikipedia (citing Maariv, 31.3.1977 and 1.4.1977)', 'secondary',
                    'היה בין הפנים החדשות שהשתבצו במקום גבוה ברשימה של תנועת החרות, והוא שובץ במקום ה-24 ברשימת הליכוד. עוד לפני הבחירות, כדי למנוע בלבול בינו ובין חבר הכנסת יגאל כהן, הוסיף לשם'),
 'hadash': src(hew('החזית הדמוקרטית לשלום ולשוויון'), 'Hebrew Wikipedia', 'secondary',
               'הארגונים והקבוצות המייסדות שחברו לחזית כללו: המפלגה הקומוניסטית הישראלית (רק"ח); הפנתרים השחורים מסיעתו של צ\'רלי ביטון; נבחרי ציבור מהרשויות המקומיות ביישובים הערביים; שמאל סוציאליסטי ישראלי (שס"י) ...'),
 'zayad': src(hew('תאופיק זיאד'), 'Hebrew Wikipedia', 'secondary', 'מפלגה = המפלגה הקומוניסטית הישראלית, החזית הדמוקרטית לשלום ולשוויון | סיעה = רק"ח, חד"ש'),
 'sheli': src(hew('מחנה של"י'), 'Hebrew Wikipedia', 'secondary',
              'המפלגה הוקמה לקראת הבחירות לכנסת התשיעית (1977) כאיחוד של תנועות שמאל שונות – "מוקד" של מאיר פעיל, "מר"י" של אורי אבנרי, "הסיעה הסוציאל-דמוקרטית" (אריה לובה אליאב), כמה חברים בולטים מ"הפנתרים השחורים" בהובלת סעדיה מרציאנו ...'),
 'moked': src(hew('מפלגת מוקד'), 'Hebrew Wikipedia', 'secondary',
              'נוצרה מתוך = מק"י, תנועת תכלת-אדום ... היא החליטה לקראת הבחירות לכנסת השמינית ב-1973 להתאחד עם כוחות שמאל נוספים. בראש אותם כוחות עמדה תנועת תכלת-אדום'),
 'dash': src(hew('התנועה הדמוקרטית לשינוי'), 'Hebrew Wikipedia', 'secondary',
             'תנועה זו ותנועת "שינוי" ... התמזגו למפלגה חדשה'),
 'wizo': src(hew('רחל כהן-כגן'), 'Hebrew Wikipedia', 'secondary', 'רחל כהן-כגן (לוברסקי) (19 בפברואר 1888 – 15 באוקטובר 1982) הייתה חברת הכנסת ויו"ר ויצו ישראל | סיעה=ויצו, ליברלים עצמאיים'),
}

# ---------------------------------------------------------------- per-party bio regexes (own party evidence)
BRX = {'herut': r'חרות|חירות', 'liberal-party': r'ליברל|הציונים הכלליים|ציונים כלליים|פרוגרסיב',
       'mapai': r'מפא.י', 'ahdut-haavoda': r'אחדות העבודה', 'israeli-labor-party': r'מפלגת העבודה|מפא.י|אחדות העבודה|רפ.י',
       'mapam': r'מפ.ם|הפועלים המאוחדת|השומר הצעיר', 'laam': r'לע.ם|הממלכתית|המרכז החופשי|המרכז העצמאי|השלמה',
       'hapoel-hamizrachi': r'הפועל.המזרחי', 'mizrachi': r'המזרחי|מזרחי', 'agudat-yisrael': r'אגודת.ישראל',
       'poalei-agudat-yisrael': r'פועלי אגודת', 'rakah': r'רק.ח|קומוניסט', 'black-panthers': r'פנתרים',
       'moked': r'מוקד|תכלת', 'independent-socialists': r'סוציאל', 'wizo': r'ויצ.ו', 'ahdut-seidel-1977': r'אחדות'}

def member(k, L, rank, party, extra=None, conf=None, note=None):
    r = next(x for x in m[k][L] if x['rank'] == rank)
    pid = r['pid']; d, acts = bio(pid)
    rx = BRX.get(party)
    if party == 'mizrachi':  # exclude Hapoel HaMizrachi mentions when looking for Mizrachi
        hit = [a for a in acts if re.search(r'(?<!הפועל )(?<!הפועל ה)המזרחי|מזרחי', a) and not re.fullmatch(r'.*הפועל.המזרחי.*', a)]
    else:
        hit = [a for a in acts if rx and re.search(rx, a)]
    ev = []
    if hit:
        ev.append(src(bio_url(pid), 'Knesset website, member biography (public activity)', 'official', hit[0].strip()[:300]))
    if extra: ev += extra
    out = {'rank': rank, 'nameHe': r['nameHe'], 'knessetPersonId': pid,
           'knessetBioMentionsParty': bool(hit), 'evidence': ev}
    out['confidence'] = conf or ('high' if hit else 'medium')
    if note: out['note'] = note
    return out

RES = final()
def ranks(k, L, p): return RES[(k, L)][p][0]

def party(pid_, rk, sources, conf, k, L, member_extra=None, member_conf=None, member_note=None):
    he, en = P[pid_]
    mem = [member(k, L, r, pid_, (member_extra or {}).get(r), (member_conf or {}).get(r), (member_note or {}).get(r)) for r in rk] if k else []
    o = {'id': pid_, 'nameHe': he, 'nameEn': en, 'candidateRanks': sorted(rk), 'sources': sources, 'confidence': conf}
    if mem: o['members'] = mem
    return o

def roster_ranks(k, L):
    d = json.load(open(ROOT + 'public/data/%s.json' % k))
    l = next(x for x in d['lists'] if x['letters'] == L)
    return l['nameHe'], [c['rank'] for c in l['candidates']]

def jlist(k, L, parties, notes=None, extra_parties=None):
    nameHe, allr = roster_ranks(k, L)
    used = [r for p in parties for r in p['candidateRanks']]
    assert len(used) == len(set(used)), (k, L, 'duplicate rank')
    assert set(used) <= set(allr), (k, L, set(used) - set(allr))
    o = {'letters': L, 'nameHe': nameHe, 'parties': parties + (extra_parties or []),
         'unassignedRanks': sorted(set(allr) - set(used))}
    if notes: o['notes'] = notes
    return o
