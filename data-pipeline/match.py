import csv,re,json,sys,collections,unicodedata
W='/home/claude/work/'
ROM={'ii':'2','iii':'3','iv':'4','v':'5','vi':'6','vii':'7','viii':'8','ix':'9','x':'10','xi':'11','xii':'12','xiii':'13','xiv':'14','xv':'15','xvi':'16'}
def norm(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode() if re.search('[a-zA-Z]',s) and not re.search('[а-яА-Я]',s) else s
    s=s.lower().replace('’',"'").replace('&',' and ')
    s=re.sub(r"[™®:\-–—,.!'()\"/]",' ',s)
    toks=[ROM.get(t,t) for t in s.split()]
    toks=[t for t in toks if t not in ('the','tom','clancy','clancys','sid','meier','meiers','marvel','marvels','s')]
    return ' '.join(toks)
lab=collections.defaultdict(set)
for fn in ['lab_oc.csv','lab_mc.csv','lab_ot.csv','alt.csv']:
    for r in csv.DictReader(open(W+fn)):
        lab[r['g'].rsplit('/',1)[1]].add(r['l'])
idx=collections.defaultdict(set)
for q,ls in lab.items():
    for l in ls: idx[norm(l)].add(q)
tags=[l.strip().split('|') for l in open(W+'tags_all.txt') if l.strip()]
res=[];miss=[]
for name,slug,subs in tags:
    cands=set()
    for v in {name, re.sub(r'\s*\(.*?\)\s*','',name)}:
        cands|=idx.get(norm(v),set())
    # year disambiguation e.g. "(2019)"
    m=re.search(r'\((\d{4})\)',name)
    res.append({'name':name,'slug':slug,'subs':int(subs),'qids':sorted(cands),'year_hint':m.group(1) if m else None})
    if not cands: miss.append(name)
json.dump(res,open(W+'match1.json','w'),ensure_ascii=False,indent=0)
print('matched',sum(1 for r in res if r['qids']),'multi',sum(1 for r in res if len(r['qids'])>1),'miss',len(miss))
print(miss)
