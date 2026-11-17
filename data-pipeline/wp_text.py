import json,time,urllib.request,urllib.parse,os
W='/home/claude/work/'
UA={'User-Agent':'CyberBestGamesPrototype/0.1 (https://claude.ai; prototype research)'}
res=json.load(open(W+'resolved.json')); det=json.load(open(W+'wd_details.json'))
ov=json.load(open(W+'scripts/overrides.json'))
for r in res:
    if r['slug'] in ov: r['qid']=ov[r['slug']]
json.dump(res,open(W+'resolved.json','w'),ensure_ascii=False,indent=0)
need_q=[r['qid'] for r in res if r['qid'] and r['qid'] not in det]
print('need details for',need_q)
titles=sorted({det[r['qid']]['enwiki'] for r in res if r['qid'] in det and det[r['qid']]['enwiki']})
cache=json.load(open(W+'wp_text.json')) if os.path.exists(W+'wp_text.json') else {}
todo=[t for t in titles if t not in cache]
print(len(titles),'todo',len(todo),flush=True)
B=20
for i in range(0,len(todo),B):
    chunk=todo[i:i+B]
    url='https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','prop':'revisions','rvprop':'content','rvslots':'main','titles':'|'.join(chunk),'format':'json','formatversion':2,'redirects':1})
    for a in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=60) as r: d=json.load(r); break
        except Exception as e:
            print('wait',a,e,flush=True); time.sleep(20*(a+1))
    else: continue
    redir={x['from']:x['to'] for x in d['query'].get('redirects',[])}
    pages={p['title']:p for p in d['query']['pages']}
    for t in chunk:
        p=pages.get(redir.get(t,t),{})
        txt=p.get('revisions',[{}])[0].get('slots',{}).get('main',{}).get('content','') if p.get('revisions') else ''
        # keep only relevant parts to save space
        import re
        keep=''
        for key in ('{{Video game reviews','{{video game reviews','{{Infobox video game','{{infobox video game'):
            j=txt.find(key)
            if j>=0: keep+=txt[j:j+6000]+'\n=====\n'
        cache[t]=keep
    json.dump(cache,open(W+'wp_text.json','w'),ensure_ascii=False)
    print(i,flush=True); time.sleep(12)
print('done')
