import sys;sys.path.insert(0,'/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/.backup-scratch/scripts')
from assign import *
def L(f,i): return open(W+f).read().splitlines()[i-1]
def seg(line,label):
    # take the part of a wiki line after a label up to next {{ש}} / <br> / ----
    i=line.find(label); s=line[i+len(label):]
    s=re.split(r"\{\{ש\}\}|<br>|----|\{\{מקרא2",s)[0]; return links(s)
CFG={}
urf='he-urf.txt'
CFG[('k1','ב')]={'hapoel-hamizrachi':links(L(urf,43)),'mizrachi':links(L(urf,45)),'poalei-agudat-yisrael':links(L(urf,47))+['@14'],'agudat-yisrael':links(L(urf,49))}
CFG[('k3','ב')]={'hapoel-hamizrachi':links(L('he-הפועל_המזרחי.txt',132)),'mizrachi':links(L('he-תנועת_המזרחי.txt',100).split('{{ש}}')[1])}
t='he-חזית_דתית_תורתית.txt'
CFG[('k3','גד')]={'agudat-yisrael':seg(L(t,25),'אגודת ישראל:'),'poalei-agudat-yisrael':seg(L(t,26),'פועלי אגודת ישראל:')}
CFG[('k4','גד')]={'agudat-yisrael':seg(L(t,30),'אגודת ישראל:'),'poalei-agudat-yisrael':seg(L(t,31),'פועלי אגודת ישראל:')}
a='he-המערך_לאחדות_פועלי_ארץ_ישראל.txt'
CFG[('k6','את')]={'mapai':links(L(a,37))[1:],'ahdut-haavoda':links(L(a,38))[1:]}
g='he-גח_ל.txt'
CFG[('k6','חל')]={'herut':seg(L(g,46),'חרות:')+links(L(g,46).split('<br>')[1]) ,'liberal-party':seg(L(g,47),'המפלגה הליברלית:')}
CFG[('k7','חל')]={'herut':seg(L(g,52),'חרות:'),'liberal-party':seg(L(g,53),'המפלגה הליברלית:')}
e='he-המערך.txt'
CFG[('k7','אמת')]={'israeli-labor-party':seg(L(e,69),'העבודה:'),'mapam':seg(L(e,70),'מפ"ם:')}
CFG[('k9','אמת')]={'israeli-labor-party':seg(L(e,99),'העבודה:'),'mapam':seg(L(e,100),'מפ"ם:')}
lk=[l for l in open(W+'he-הליכוד.txt').read().splitlines() if l.startswith("|'''{{מקרא2|#0078BA|תנועת החרות:}}''' [[מנחם בגין]], [[עזר ויצמן]]")][0]
CFG[('k9','מחל')]={'herut':seg(lk,"תנועת החרות:}}'''"),'liberal-party':seg(lk,"המפלגה הליברלית:}}'''"),'laam':seg(lk,'לע"ם:}}'+"'''")}
ALIAS={('k3','ב'):{'משה שפירא':1,"פריג'א זוארץ":8},('k6','את'):{'בכור-שלום שטרית':5},('k7','אמת'):{'יוסף-אהרן אלמוגי':14,'עבד אל-עזיז א-זועבי':46},('k9','אמת'):{'מיכה חריש':32},('k9','מחל'):{'מרדכי ציפורי':26},('k1','ב'):{'אברהם יהודה גולדראט':14}}
def final():
    RES={}
    for (k,Lt),parties in CFG.items():
        RES[(k,Lt)]={}
        for p,names in parties.items():
            extra=dict(ALIAS.get((k,Lt),{}))
            names=[n for n in names if not n.startswith('@')]
            r,miss=resolve(k,Lt,names,extra)
            RES[(k,Lt)][p]=(r,miss,names)
    return RES
