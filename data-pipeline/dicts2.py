import csv,json,re,collections
W='/home/claude/work/'
d=json.load(open(W+'dictionaries.json'))
rows=[r+['']*20 for r in csv.reader(open(W+'meta.csv'))][1:]
TYPES={'Платформа':'platform','Год':'year','Жанр':'genre','Платформа + Год':'platform_year','Жанр + Платформа':'genre_platform','Жанр + Год':'genre_year','Жанр + Платформа + Год':'genre_platform_year','Лучшие игры (главная)':'main'}
tpls=[]
def fix(s): return s.replace('[[year]]','[[год]]').strip()
for i,r in enumerate(rows):
    if not r[0]: continue
    t=TYPES[r[0]]
    url=r[7] or r[6]
    path=url.split('/games/best')[1].strip('/')
    segs=[s for s in path.split('/') if s]
    pat=['{P}' if s=='[[платформа]]' else '{Y}' if s in('[[год]]','[[year]]') else s for s in segs]
    # a combo row without URL template whose example has a concrete year/platform: treat example values as variable only when the type requires
    if t in('platform_year','genre_year','genre_platform_year','genre_platform') and not r[7]:
        pass  # exact (e.g. VR combos) - keep concrete platform; year still variable if type has year
    if t.endswith('year') and pat and re.fullmatch(r'\d{4}',pat[-1]) and t!='year': pat[-1]='{Y}'
    tpls.append({'row':i+2,'type':t,'pattern':pat,'title':fix(r[2]),'description':fix(r[3]),'h1':fix(r[5] or r[4]),'h1_example':r[4]})
d['templates']=tpls
for k in ('combos',): d.pop(k,None)
json.dump(d,open(W+'dictionaries.json','w'),ensure_ascii=False,indent=1)
c=collections.Counter(t['type'] for t in tpls); print(c)
for t in tpls:
    if t['type']=='genre_platform' and '{P}' not in t['pattern']: print(t['pattern'],t['h1'])
    if '{P}' in t['pattern'] and '[[платформа]]' not in t['h1']: print('H1 без [[платформа]]:',t['row'],t['h1'])
    if '{Y}' in t['pattern'] and '[[год]]' not in t['h1']: print('H1 без [[год]]:',t['row'],t['h1'])
    if '{Y}' in t['pattern'] and '[[год]]' not in t['title']: print('Title без [[год]]:',t['row'],t['title'])
    if '{P}' in t['pattern'] and '[[платформа]]' not in t['title']: print('Title без [[платформа]]:',t['row'],t['title'])
