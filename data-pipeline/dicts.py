import csv,json,re,collections
W='/home/claude/work/'
rows=[r+['']*20 for r in csv.reader(open(W+'meta.csv'))][1:]
filt=list(csv.reader(open(W+'filters.csv')))[1:]
F_PL=[r[0] for r in filt if r[0]]; F_Y=[r[1] for r in filt if r[1]]; F_G=[r[2] for r in filt if len(r)>2 and r[2] and r[2]!='Все']
def slug_of(url): return url.rstrip('/').split('/games/best/')[1].split('/')[0] if '/games/best/' in url else ''
plat={};gen={};year={};issues=[]
plat_tpl_name={}
for r in rows:
    if r[10]=='[[платформа]]' and r[11]: pass
by=collections.defaultdict(list)
for r in rows:
    if r[0]: by[r[0]].append(r)
for i,r in enumerate(by['Платформа']):
    s=slug_of(r[6]); plat[s]={'slug':s,'name':r[1],'title':r[2],'description':r[3],'h1':r[4],'var':''}
# platform var names: column L in the same row order as platform rows (rows 0..)
for i,r in enumerate(rows):
    if r[10]=='[[платформа]]' and i < len(by['Платформа']):
        pr=by['Платформа'][i]; plat[slug_of(pr[6])]['var']=r[11]
for r in by['Год']:
    year[r[1]]={'year':r[1],'title':r[2],'description':r[3],'h1':r[4]}
for r in by['Жанр']:
    s=slug_of(r[6]); gen[s]={'slug':s,'name':r[1],'title':r[2],'description':r[3],'h1':r[4]}
combo={'genre_platform':{},'genre_year':{},'genre_platform_year':{},'platform_year':{}}
key={'Жанр + Платформа':'genre_platform','Жанр + Год':'genre_year','Жанр + Платформа + Год':'genre_platform_year','Платформа + Год':'platform_year'}
for t,k in key.items():
    for r in by[t]:
        s=slug_of(r[7] or r[6])
        if s in combo[k]: issues.append(f'{t}: дубль строки для {s} ({r[1]})')
        combo[k][s]={'page':r[1],'title':r[2],'description':r[3],'h1':r[5] or r[4],'url_tpl':r[7],'h1_example':r[4]}
main=by['Лучшие игры (главная)'][0]
out={'main':{'title':main[2],'description':main[3],'h1':main[4]},'platforms':plat,'genres':gen,'years':year,'combos':combo,
 'filter_lists':{'platforms':F_PL,'years':F_Y,'genres':F_G}}
# checks
for k,v in combo.items():
    base=gen if k.startswith('genre') else plat
    for s in base:
        if s not in v: issues.append(f'{k}: нет шаблона для {s}')
    for s in v:
        if s not in base: issues.append(f'{k}: шаблон для неизвестного слага {s} ({v[s]["page"]})')
gnames={g['name'].lower():s for s,g in gen.items()}
for g in F_G:
    if g.lower() not in gnames: issues.append(f'Фильтр жанров: "{g}" нет в таблице мета')
pnames={p['name'].lower():s for s,p in plat.items()}
for p in F_PL:
    if p.lower() not in pnames: issues.append(f'Фильтр платформ: "{p}" нет в таблице мета')
for y in F_Y:
    if y not in year: issues.append(f'Фильтр годов: {y} нет в таблице мета')
for s,p in plat.items():
    if not p['var']: issues.append(f'Платформа {s}: не задано значение [[платформа]]')
json.dump(out,open(W+'dictionaries.json','w'),ensure_ascii=False,indent=1)
print(len(plat),len(gen),len(year)); print('\n'.join(issues))
print([ (s,g['name']) for s,g in gen.items()])
print([ (s,p['name'],p['var']) for s,p in plat.items()])
