import json,subprocess,os,sys
M='/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/.backup-scratch/meta/'
site={s['KnsID']:s['SiteId'] for s in json.load(open(M+'sitecodes.json'))}
pids=set(int(a) for a in sys.argv[1:]) if len(sys.argv)>1 else set()
if not pids:
    m=json.load(open(M+'matches.json'))
    pids={r['pid'] for k in m for L in m[k] for r in m[k][L] if r['pid']}
for pid in sorted(pids):
    f=M+'bios/%d.json'%pid
    if os.path.exists(f): continue
    sid=site.get(pid)
    if not sid: print('nosite',pid); continue
    res={}
    for ep in ['GetMkPublicActivity','GetMkdetailsHeader']:
        r=subprocess.run(['curl','-s','-m','40','-A','Mozilla/5.0','https://knesset.gov.il/WebSiteApi/knessetapi/MKs/%s?mkId=%d&languageKey=he'%(ep,sid)],capture_output=True,text=True)
        try: res[ep]=json.loads(r.stdout)
        except Exception as e: res[ep]={'error':r.stdout[:200]}
    res['siteId']=sid; res['personId']=pid
    json.dump(res,open(f,'w'),ensure_ascii=False)
print('done')
