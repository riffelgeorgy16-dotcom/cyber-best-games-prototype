import json,time,urllib.request,urllib.parse,os,re
W='/home/claude/work/'
UA={'User-Agent':'CyberBestGamesPrototype/0.1 (https://claude.ai; prototype research)'}
res=json.load(open(W+'resolved.json')); det=json.load(open(W+'wd_details.json'))
titles=sorted({det[r['qid']]['enwiki'] for r in res if r['qid'] in det and det[r['qid']]['enwiki']})
cache=json.load(open(W+'wp_text.json')) if os.path.exists(W+'wp_text.json') else {}
todo=[t for t in titles if t not in cache]; print('todo',len(todo),flush=True)
def raw(t):
    url='https://en.wikipedia.org/w/index.php?'+urllib.parse.urlencode({'title':t,'action':'raw'})
    for a in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=40) as r: return r.read().decode('utf-8','replace')
        except urllib.error.HTTPError as e:
            if e.code==404: return ''
            time.sleep(10*(a+1))
        except Exception: time.sleep(10*(a+1))
    return None
for n,t in enumerate(todo):
    txt=raw(t)
    if txt is None: print('fail',t,flush=True); continue
    m=re.match(r'#REDIRECT\s*\[\[([^\]#|]+)',txt,re.I)
    if m: txt=raw(m.group(1)) or ''
    keep=''
    for key in ('{{Video game reviews','{{video game reviews','{{Video Game Reviews','{{Infobox video game','{{infobox video game','{{Infobox Video Game'):
        j=txt.find(key)
        if j>=0: keep+=txt[j:j+7000]+'\n=====\n'
    cache[t]=keep
    if n%10==0: json.dump(cache,open(W+'wp_text.json','w'),ensure_ascii=False); print(n,flush=True)
    time.sleep(1.2)
json.dump(cache,open(W+'wp_text.json','w'),ensure_ascii=False); print('done',flush=True)
