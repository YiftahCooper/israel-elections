import json,subprocess,sys
def get(path):
    url="https://knesset.gov.il/Odata/ParliamentInfo.svc/"+path
    out=[]
    while url:
        r=subprocess.run(["curl","-s","-m","90","-H","Accept: application/json",url],capture_output=True,text=True)
        d=json.loads(r.stdout)
        out+=d['value']; url=d.get('odata.nextLink')
        if url and not url.startswith('http'): url="https://knesset.gov.il/Odata/ParliamentInfo.svc/"+url
    return out
if __name__=="__main__":
    data=get(sys.argv[1]); json.dump(data,open(sys.argv[2],'w'),ensure_ascii=False); print(len(data))
