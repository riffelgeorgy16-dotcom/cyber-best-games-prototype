import json,re,urllib.request,urllib.parse,csv,io,time
W='/home/claude/work/'
UA={'User-Agent':'CyberBestGamesPrototype/0.1 (https://claude.ai; prototype research)','Accept':'text/csv'}
def sparql(q):
    for i in range(4):
        try:
            req=urllib.request.Request('https://query.wikidata.org/sparql',data=urllib.parse.urlencode({'query':q}).encode(),headers=UA)
            with urllib.request.urlopen(req,timeout=120) as r: return list(csv.DictReader(io.StringIO(r.read().decode())))
        except Exception as e: print('retry',e); time.sleep(10)
tags=[l.strip().split('|') for l in open(W+'tags_all.txt') if l.strip()]
# name variants
def variants(n):
    v={n, re.sub(r'\s*\(.*?\)','',n).strip(), n.replace('’',"'"), n.replace("'",'’')}
    m=re.match(r'^GTA[: ]\s*(.*)$',n)
    if m: v|={'Grand Theft Auto '+m.group(1), 'Grand Theft Auto: '+m.group(1)}
    v|={x.replace(' 2',' II').replace(' 3',' III').replace(' 4',' IV') for x in list(v) if re.search(r' [234]$',x)}
    return {x for x in v if x}
lab2slug={}
for name,slug,subs in tags:
    for v in variants(name): lab2slug.setdefault(v,set()).add(slug)
labels=list(lab2slug)
res=[]
def esc(s): return s.replace('\\','\\\\').replace('"','\\"')
for i in range(0,len(labels),120):
    chunk=labels[i:i+120]
    vals=' '.join(f'"{esc(l)}"@en "{esc(l)}"@ru' for l in chunk)
    q=f'''SELECT ?lab ?g ?enwiki ?isgame WHERE {{
      VALUES ?lab {{ {vals} }}
      {{ ?g rdfs:label ?lab }} UNION {{ ?g skos:altLabel ?lab }}
      ?g wdt:P31 ?t . VALUES ?t {{ wd:Q7889 wd:Q4393107 wd:Q21125433 wd:Q865493 wd:Q1755420 wd:Q110236094 }}
      OPTIONAL {{ ?enwiki schema:about ?g; schema:isPartOf <https://en.wikipedia.org/> }}
    }}'''
    r=sparql(q) or []
    print(i,len(r),flush=True); res+=r
json.dump({'rows':res,'lab2slug':{k:sorted(v) for k,v in lab2slug.items()}},open(W+'wd_match.json','w'),ensure_ascii=False)
