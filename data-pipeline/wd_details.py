import json,urllib.request,urllib.parse,csv,io,time,collections
W='/home/claude/work/'
UA={'User-Agent':'CyberBestGamesPrototype/0.1 (https://claude.ai; prototype research)','Accept':'text/csv'}
def sparql(q):
    for i in range(5):
        try:
            req=urllib.request.Request('https://query.wikidata.org/sparql',data=urllib.parse.urlencode({'query':q}).encode(),headers=UA)
            with urllib.request.urlopen(req,timeout=120) as r: return list(csv.DictReader(io.StringIO(r.read().decode())))
        except Exception as e: print('retry',e,flush=True); time.sleep(15)
m=json.load(open(W+'wd_match.json'))
qids=sorted({r['g'].rsplit('/',1)[1] for r in m['rows']})
print(len(qids))
det=collections.defaultdict(lambda:{'dates':set(),'platforms':set(),'genres':set(),'steam':set(),'en':'','ru':'','enwiki':'','types':set(),'series':set()})
for i in range(0,len(qids),80):
    vals=' '.join('wd:'+q for q in qids[i:i+80])
    for prop,key in [('P577','dates'),('P400','platforms'),('P136','genres'),('P1733','steam'),('P31','types')]:
        rows=sparql(f'SELECT ?g ?v WHERE {{ VALUES ?g {{ {vals} }} ?g wdt:{prop} ?v }}') or []
        for r in rows: det[r['g'].rsplit('/',1)[1]][key].add(r['v'].rsplit('/',1)[-1] if r['v'].startswith('http://www.wikidata.org/entity/') else r['v'])
        time.sleep(1)
    rows=sparql(f'''SELECT ?g ?en ?ru ?w WHERE {{ VALUES ?g {{ {vals} }} OPTIONAL{{?g rdfs:label ?en FILTER(lang(?en)="en")}} OPTIONAL{{?g rdfs:label ?ru FILTER(lang(?ru)="ru")}} OPTIONAL{{?w schema:about ?g; schema:isPartOf <https://en.wikipedia.org/>}} }}''') or []
    for r in rows:
        d=det[r['g'].rsplit('/',1)[1]]; d['en']=r['en'] or d['en']; d['ru']=r['ru'] or d['ru']; d['enwiki']=urllib.parse.unquote(r['w'].rsplit('/',1)[1]).replace('_',' ') if r['w'] else d['enwiki']
    print(i,flush=True)
json.dump({k:{kk:(sorted(vv) if isinstance(vv,set) else vv) for kk,vv in v.items()} for k,v in det.items()},open(W+'wd_details.json','w'),ensure_ascii=False)
# labels for platforms & genres
ids=sorted({x for v in det.values() for x in v['platforms']|v['genres']})
lab={}
for i in range(0,len(ids),150):
    vals=' '.join('wd:'+q for q in ids[i:i+150])
    for r in sparql(f'SELECT ?g ?l WHERE {{ VALUES ?g {{ {vals} }} ?g rdfs:label ?l FILTER(lang(?l)="en") }}') or []:
        lab[r['g'].rsplit('/',1)[1]]=r['l']
json.dump(lab,open(W+'wd_labels.json','w'),ensure_ascii=False)
print('labels',len(lab))
