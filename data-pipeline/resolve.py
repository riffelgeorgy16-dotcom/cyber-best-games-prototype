import json,re,collections
W='/home/claude/work/'
m=json.load(open(W+'wd_match.json')); det=json.load(open(W+'wd_details.json'))
tags=[l.strip().split('|') for l in open(W+'tags_all.txt') if l.strip()]
slugc=collections.defaultdict(set)
for r in m['rows']:
    for s in m['lab2slug'].get(r['lab'],[]): slugc[s].add(r['g'].rsplit('/',1)[1])
out=[];amb=[]
for name,slug,subs in tags:
    c=[q for q in slugc.get(slug,[]) if q in det]
    hint=re.search(r'\((\d{4})\)',name)
    def score(q):
        d=det[q]; y=min((x[:4] for x in d['dates']),default='9999')
        s=0
        if d['enwiki']: s+=4
        if 'Q7889' in d['types']: s+=2
        if d['en'].lower()==re.sub(r'\s*\(.*?\)','',name).lower(): s+=2
        if hint and y==hint.group(1): s+=5
        if d['dates']: s+=1
        if d['steam']: s+=0.5
        # prefer original over remake unless name says remake
        if 'remake' not in name.lower() and 'remaster' not in name.lower(): s-= (int(y) if y.isdigit() else 3000)/10000
        return s
    c.sort(key=score,reverse=True)
    if len(c)>1: amb.append((name,[(q,det[q]['en'],min((x[:4] for x in det[q]['dates']),default='')) for q in c[:3]]))
    out.append({'name':name,'slug':slug,'subs':int(subs),'qid':c[0] if c else None})
json.dump(out,open(W+'resolved.json','w'),ensure_ascii=False,indent=0)
print('resolved',sum(1 for o in out if o['qid']),'of',len(out))
for a in amb: print(a)
