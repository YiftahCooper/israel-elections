import json,re,sys
M='/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/.backup-scratch/meta/'
KW=r'(מפא"י|מפא”י|מפא״י|פועלי ארץ|אחדות העבודה|רפ"י|רפ”י|רפ״י|מפלגת העבודה|מפ"ם|מפ”ם|מפ״ם|הפועלים המאוחדת|חרות|חירות|ליברל|הציונים הכלליים|ציונים כלליים|מזרחי|אגודת|אגודה|לע"ם|לע”ם|לע״ם|המרכז החופשי|מרכז חופשי|הממלכתית|ארץ ישראל השלמה|ארץ-ישראל השלמה|רק"ח|רק”ח|פנתרים|מוקד|תכלת|מק"י|מק”י|קומוניסט|שינוי|דמוקרטית|העולם הזה|סוציאליסט|של"י|של”י|פרוגרסיב|ויצ"ו|ויצו|שוויון|מפלג|סיעת|סיעה)'
def bio(pid):
    try: d=json.load(open(M+'bios/%d.json'%pid))
    except: return None,[]
    acts=[x['Name'].strip() for x in (d.get('GetMkPublicActivity') or {}).get('mkPublic') or []]
    return d,acts
if __name__=='__main__':
    m=json.load(open(M+'matches.json'))
    k,L=sys.argv[1],sys.argv[2]
    for r in m[k][L]:
        d,acts=bio(r['pid'])
        hits=[a for a in acts if re.search(KW,a)]
        print('#%d %s [%s]'%(r['rank'],r['nameHe'],r['pid']), ' || '.join(h[:220] for h in hits) if hits else ('NOBIO' if not acts else 'NOHIT(%d)'%len(acts)))
