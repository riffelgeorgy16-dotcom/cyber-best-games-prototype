import json,time,urllib.request,urllib.parse,os,sys,re
W='/home/claude/work/'
UA={'User-Agent':'CyberBestGamesPrototype/0.1 (https://claude.ai; prototype research)'}
def get(host,params,tries=6):
    url=f'https://{host}/w/api.php?'+urllib.parse.urlencode({**params,'format':'json','formatversion':2})
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30) as r: return json.load(r)
        except Exception as e:
            time.sleep(3*(i+1))
    return None
cache=json.load(open(W+'wp_search.json')) if os.path.exists(W+'wp_search.json') else {}
tags=[l.strip().split('|') for l in open(W+'tags_all.txt') if l.strip()]
for n,(name,slug,subs) in enumerate(tags):
    if slug in cache: continue
    ru=bool(re.search('[а-яА-Я]',name))
    out={'name':name}
    if ru:
        d=get('ru.wikipedia.org',{'action':'query','list':'search','srsearch':name+' игра','srlimit':3})
        hits=[h['title'] for h in (d or {}).get('query',{}).get('search',[])]
        out['ru_hits']=hits
        if hits:
            d2=get('ru.wikipedia.org',{'action':'query','titles':hits[0],'prop':'langlinks','lllang':'en'})
            ll=(d2 or {}).get('query',{}).get('pages',[{}])[0].get('langlinks',[])
            out['hits']=[ll[0]['title']] if ll else []
        else: out['hits']=[]
    else:
        q=re.sub(r'\s*\((\d{4})\)',r' \1',name)
        d=get('en.wikipedia.org',{'action':'query','list':'search','srsearch':q+' video game','srlimit':5})
        out['hits']=[h['title'] for h in (d or {}).get('query',{}).get('search',[])]
    cache[slug]=out
    if n%20==0: json.dump(cache,open(W+'wp_search.json','w'),ensure_ascii=False); print(n,flush=True)
    time.sleep(0.4)
json.dump(cache,open(W+'wp_search.json','w'),ensure_ascii=False); print('done')
