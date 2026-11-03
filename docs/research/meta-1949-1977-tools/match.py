import json,re,sys,collections
R='/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/'
M=R+'.backup-scratch/meta/'
persons={p['PersonID']:p for p in json.load(open(M+'persons.json'))}
p2p=json.load(open(M+'p2p.json'))
site={s['KnsID']:s['SiteId'] for s in json.load(open(M+'sitecodes.json'))}
want={'k1':['ב','נ'],'k3':['ב','גד'],'k4':['ב','גד'],'k6':['את','חל'],'k7':['אמת','חל'],'k9':['מחל','אמת','ו','ש','ים','יש']}
def norm(s):
    s=s.replace('״','"').replace('׳',"'").replace('`',"'")
    s=re.sub(r'(הרב|ד"ר|פרופ\'|ד"ר)','',s)
    s=re.sub(r'[()\-–,]',' ',s)
    return [t for t in s.split() if t]
out={}
OVR={('k1','ב',1):2460,('k1','ב',7):2422,('k1','ב',15):2619,('k3','ב',5):2203,('k4','ב',5):2203,('k3','גד',3):2431,('k3','גד',4):2404,('k3','גד',5):2199,('k3','גד',6):2411,('k4','גד',4):2404,('k4','גד',6):2411,('k6','את',19):2212,('k6','את',25):2370,('k6','את',44):2129,('k7','חל',23):5955,('k9','מחל',20):2409,('k9','מחל',26):2573,('k9','מחל',35):2285,('k9','מחל',42):2577,('k9','אמת',31):2152,('k9','ו',5):2452,('k9','ים',1):2144,('k9','יש',6):2326,('k9','יש',13):2523,('k7','אמת',29):2282,('k9','מחל',21):2394,('k9','מחל',24):2399,('k3','ב',1):2661,('k4','ב',1):2661,('k3','ב',8):2330,('k6','את',5):2639}
for k,lets in want.items():
    kn=int(k[1:])
    mks={}
    for x in p2p:
        if x['KnessetNum']==kn and x['PositionID'] in (43,61):
            mks.setdefault(x['PersonID'],[]).append(x['StartDate'][:10])
    fac=collections.defaultdict(set)
    for x in p2p:
        if x['KnessetNum']==kn and x['PositionID']==54: fac[x['PersonID']].add(x['FactionName'])
    d=json.load(open(R+'public/data/%s.json'%k))
    for L in lets:
        l=next(a for a in d['lists'] if a['letters']==L)
        for c in l['candidates']:
            toks=set(norm(c['nameHe']))
            best=[]
            for pid in mks:
                p=persons[pid]
                lt=set(norm(p['LastName'])); ft=set(norm(p['FirstName']))
                sc=len(lt&toks)*2+len(ft&toks)
                if lt&toks: best.append((sc,pid))
            best.sort(reverse=True)
            cand=[(s,pid,persons[pid]['LastName']+' '+persons[pid]['FirstName']) for s,pid in best[:3]]
            pid=best[0][1] if best else None
            amb = len(best)>1 and best[0][0]==best[1][0]
            if (k,L,c['rank']) in OVR: pid=OVR[(k,L,c['rank'])]; amb=False; best=[(9,pid)]
            out.setdefault(k,{}).setdefault(L,[]).append({'rank':c['rank'],'nameHe':c['nameHe'],'pid':pid,'siteId':site.get(pid),'amb':amb,'cands':cand,'mkStart':mks.get(pid),'factions':sorted(fac.get(pid,[]))})
json.dump(out,open(M+'matches.json','w'),ensure_ascii=False,indent=0)
for k in out:
    for L in out[k]:
        for r in out[k][L]:
            if r['amb'] or not r['pid'] or (r['cands'] and r['cands'][0][0]<3):
                print(k,L,r['rank'],r['nameHe'],r['cands'])
