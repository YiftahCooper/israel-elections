import json,re,sys
M='/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/.backup-scratch/meta/'
W='/home/wsl/.t3/worktrees/israel-elections/t3-dc522a8d/.backup-scratch/wiki/'
persons={p['PersonID']:p for p in json.load(open(M+'persons.json'))}
m=json.load(open(M+'matches.json'))
def links(s):
    out=[]
    for a in re.findall(r'\[\[([^\]]+)\]\]',s):
        a=a.split('|')[-1]; a=re.sub(r"''|<s>|</s>",'',a).strip(); out.append(a)
    return out
def nm(s): return re.sub(r'[\s\-־"״\'׳]','',s)
def pid_rank(k,L):
    return {r['pid']:r['rank'] for r in m[k][L]}
def resolve(k,L,names,extra={}):
    pr=pid_rank(k,L); res=[];miss=[]
    for n in names:
        if n in extra: 
            if extra[n] is not None: res.append(extra[n])
            continue
        hit=[pid for pid in pr if nm(persons[pid]['FirstName']+persons[pid]['LastName'])==nm(n) or nm(persons[pid]['LastName'])==nm(n.split()[-1]) and nm(persons[pid]['FirstName']).startswith(nm(n.split()[0]))]
        if len(hit)==1: res.append(pr[hit[0]])
        else: miss.append((n,len(hit)))
    return sorted(res),miss
