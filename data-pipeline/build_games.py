# Сборка games.json для прототипа.
# Источники: список тегов Кибера (название, URL, подписчики), Wikidata (дата, платформы, жанры, Steam ID),
# английская Википедия (оценки IGN / Metacritic / OpenCritic из шаблона Video game reviews, жанр и режимы из инфобокса).
import json, re, csv, datetime, collections
W = '/home/claude/work/'
TODAY = '2026-11-17'
res = json.load(open(W + 'resolved.json'))
det = json.load(open(W + 'wd_details.json'))
lab = json.load(open(W + 'wd_labels.json'))
wp = json.load(open(W + 'wp_text.json'))
dicts = json.load(open(W + 'dictionaries.json'))
EXTRA_LAB = {'Q5014725': 'PlayStation 4', 'Q13361286': 'Xbox One', 'Q63184502': 'PlayStation 5', 'Q48493': 'iOS', 'Q48263': 'Xbox 360',
             'Q19610114': 'Nintendo Switch', 'Q10680': 'PlayStation 2', 'Q132020': 'Xbox', 'Q122761124': 'Nintendo Switch 2', 'Q10677': 'PlayStation',
             'Q64350339': 'iPadOS', 'Q188642': 'Game Boy Advance', 'Q184198': 'Dreamcast', 'Q100047': 'Amiga', 'Q10676': 'Sega Mega Drive',
             'Q200912': 'Sega Saturn', 'Q47604': 'MS-DOS', 'Q751719': 'Game Gear', 'Q1047516': 'Sega CD', 'Q209868': 'Sega Master System'}
lab.update(EXTRA_LAB)

# --- Платформы: метка Wikidata -> слаг из таблицы
PLAT = [
    (r'^(microsoft windows|ms-dos|dos|windows|personal computer|ibm pc|ibm personal computer)$', ['pc']),
    (r'^(macos|classic mac os|mac operating system|os x)$', ['mac']),
    (r'^(linux|steamos)$', ['linux']),
    (r'^playstation 5$', ['playstation-5']), (r'^playstation 4$', ['playstation-4']), (r'^playstation 3$', ['playstation-3']),
    (r'^playstation 2$', ['playstation-2']), (r'^playstation$', ['playstation-1']),
    (r'^playstation portable$', ['psp']), (r'^playstation vita$', ['ps-vita']),
    (r'^nintendo switch$', ['nintendo-switch']), (r'^nintendo switch 2$', ['nintendo-switch-2']),
    (r'^xbox series x and series s$', ['xbox-series']), (r'^xbox one$', ['xbox-one']), (r'^xbox 360$', ['xbox-360']), (r'^xbox$', ['xbox']),
    (r'^wii$', ['nintendo-wii']), (r'^wii u$', ['nintendo-wii-u']), (r'^nintendo ds$', ['nintendo-ds']), (r'^nintendo 3ds$', ['nintendo-3ds']),
    (r'^nintendo gamecube$', ['nintendo-gamecube']), (r'^nintendo 64$', ['nintendo-64']),
    (r'^game boy( color)?$', ['nintendo-game-boy']), (r'^game boy advance$', ['nintendo-game-boy-advance']),
    (r'^sega mega drive$|^sega genesis$', ['sega-mega-drive', 'sega']), (r'^dreamcast$', ['sega-dreamcast', 'sega']),
    (r'^(sega saturn|sega master system|game gear|sega cd)$', ['sega']),
    (r'^(meta quest 3|oculus quest 3)$', ['oculus-quest-3']),
]
# --- Жанры: ключевые слова в жанрах Wikidata/Википедии -> слаги фильтра
GEN = [
    (r'\baction\b(?!.*role)', 'ekshen-igry'), (r'action-adventure', 'adventure'), (r'action-adventure', 'ekshen-igry'),
    (r'\badventure\b', 'adventure'), (r'graphic adventure|point-and-click', 'point-and-click'), (r'graphic adventure|point-and-click', 'kvesty'),
    (r'role-playing|\brpg\b', 'rpg'), (r'action role-playing', 'ekshen-igry'),
    (r'massively multiplayer online role-playing|mmorpg', 'mmorpg'), (r'massively multiplayer|\bmmo', 'mmo'),
    (r'first-person shooter', 'igry-ot-pervogo-lica'), (r'third-person shooter', 'igry-ot-tretego-lica'), (r'shooter|shoot \'em up|run and gun', 'shutery'),
    (r'survival horror|horror', 'horror-igry'), (r'survival game|\bsurvival\b(?! horror)', 'igry-vyzhivanie'),
    (r'racing|sim racing|kart', 'igry-gonki'), (r'football|soccer|basketball|ice hockey|sports video game|american football|tennis|golf|nba|nhl', 'sportivnye-igry'),
    (r'fighting|platform fighter', 'faitingi'), (r'real-time strategy', 'rts'), (r'strategy|wargame|4x|city-building', 'strategii'),
    (r'tactical role-playing|turn-based tactics|real-time tactics|tactical video game|tactics game', 'taktiki'), (r'multiplayer online battle arena|\bmoba\b', 'moba'), (r'battle royale', 'battle-royale'),
    (r'platform game|platformer', 'platformery'), (r'metroidvania', 'metroidvaniya'), (r'roguelike|roguelite', 'roguelike'), (r'soulslike|souls-like', 'soulslike'),
    (r'simulation|simulator|life sim|management game', 'simulyatory'), (r'puzzle|match-three', 'golovolomki'), (r'stealth', 'stels-igry'),
    (r'hack and slash|character-action', 'sleshery'), (r'beat \'em up|beat-em-up', 'beat-em-up'), (r'interactive (film|drama|movie)', 'interaktivnoe-kino'),
    (r'visual novel', 'vizualnye-novelly'), (r'tower defense', 'tower-defense'), (r'collectible card|card battle|deck-building', 'kki'),
    (r'open world|open-world', 'igry-s-otkrytym-mirom'), (r'casual|incremental', 'kazualnyy'), (r'\barcade\b', 'arkady'),
    (r'cyberpunk', 'kiberpank-igry'), (r'biopunk', 'biopank-igry'), (r'post-apocalyptic', 'igry-postapokalipsis'), (r'zombie', 'zombi-igry'),
    (r'science fiction|space opera|sci-fi', 'igry-nauchnaya-fantastika'), (r'space (trading|combat|opera|simulation)', 'kosmos-igry'),
    (r'fantasy', 'fentezi-igry'), (r'western', 'vestern-igry'), (r'detective|neo-noir|mystery', 'detektivy-igry'),
    (r'retro-style', 'retro-igry'), (r'indie', 'indi-igry'), (r'hidden object', 'igry-poisk-predmetov'), (r'virtual reality', 'vr-igry'),
    (r'twin-stick|top-down|isometric', 'igry-vid-sverhu'), (r'\banime\b', 'anime-igry'),
]
GENRE_PRIORITY = ['ekshen-igry','shutery','rpg','adventure','strategii','rts','taktiki','simulyatory','igry-gonki','sportivnye-igry','faitingi',
  'horror-igry','igry-vyzhivanie','platformery','sleshery','beat-em-up','stels-igry','golovolomki','kvesty','point-and-click','interaktivnoe-kino',
  'vizualnye-novelly','mmorpg','mmo','moba','battle-royale','kki','roguelike','soulslike','metroidvaniya','tower-defense','arkady','kazualnyy',
  'igry-s-otkrytym-mirom','igry-ot-pervogo-lica','igry-ot-tretego-lica','igry-vid-sverhu']
MODES = [(r'multiplayer', 'multipleer-igry'), (r'co-?op', 'kooperativnyie-igry')]

def clean(s):
    s = re.sub(r'<ref[^>]*/>|<ref[^>]*>.*?</ref>', ' ', s, flags=re.S)
    s = re.sub(r'\{\{(?:nowrap|nobr)\|([^{}]*)\}\}', r'\1', s)
    s = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', s)
    return s

def field(block, name):
    m = re.search(r'\|\s*' + name + r'\s*=\s*(.*?)(?=\n\s*\||\n\}\})', block, re.S | re.I)
    return clean(m.group(1)).strip() if m else ''

def first_score(v, scale):
    v = re.sub(r'\{\{[^{}]*\}\}', ' ', v)
    nums = re.findall(r'(\d+(?:\.\d+)?)\s*/\s*' + str(scale), v)
    if not nums:
        if scale == 100: nums = re.findall(r'(?<![\d.])(\d{2})(?![\d.%/])', v)
        if not nums: return None
    vals = [float(x) for x in nums if float(x) <= scale]
    return max(vals) if vals else None

def ratings(title, q):
    t = wp.get(title, '')
    j = t.lower().find('{{video game reviews')
    out = {}
    if j >= 0:
        blk = t[j:j + 6000]
        ign = first_score(field(blk, 'IGN'), 10)
        mc = first_score(field(blk, 'MC'), 100)
        oc = first_score(field(blk, 'OC'), 100)
        if ign is not None: out['IGN'] = ign
        if mc is not None: out['Metacritic'] = mc
        if oc is not None: out['OpenCritic'] = oc
    return out

def wd_scores(q):
    return {}

def platforms_of(q, info):
    labels = [lab.get(p, p).lower() for p in det[q]['platforms']]
    src = 'Wikidata'
    if not labels and info:
        labels = [x.strip().lower() for x in re.split(r',|<br\s*/?>|\n|\*', field(info, 'platforms')) if x.strip()]
        src = 'Википедия'
    out = []
    for l in labels:
        for rx, slugs in PLAT:
            if re.search(rx, l): out += slugs
    order = list(dicts['platforms'])
    return sorted(set(out), key=order.index), src

def genres_of(q, info):
    txt = ' | '.join(lab.get(g, g) for g in det[q]['genres'] + det[q]['types']).lower()
    if info: txt += ' | ' + field(info, 'genre').lower()
    out = [slug for rx, slug in GEN if re.search(rx, txt)]
    if info:
        modes = field(info, 'modes').lower()
        out += [slug for rx, slug in MODES if re.search(rx, modes)]
    return sorted(set(out), key=lambda g: GENRE_PRIORITY.index(g) if g in GENRE_PRIORITY else 100 + list(dicts['genres']).index(g))

games, diag = [], []
seen_q = set()
for r in res:
    q = r['qid']
    reason = None
    if not q or q not in det: diag.append({**r, 'reason': 'не найдено в Wikidata'}); continue
    if q in seen_q: diag.append({**r, 'reason': 'дубль тега'}); continue
    d = det[q]
    title = d['enwiki']
    t = wp.get(title, '')
    jj = t.lower().find('{{infobox video game')
    info = t[jj:jj + 7000] if jj >= 0 else ''
    dates = sorted(x for x in d['dates'] if x[:4].isdigit())
    if not dates: diag.append({**r, 'qid': q, 'reason': 'нет даты выхода'}); continue
    first = dates[0][:10]
    if first > TODAY: diag.append({**r, 'qid': q, 'reason': 'не вышла'}); continue
    plats, psrc = platforms_of(q, info)
    gens = genres_of(q, info)
    rt = ratings(title, q)
    src_r = next((s for s in ('IGN', 'Metacritic', 'OpenCritic') if s in rt), None)
    missing = [n for n, v in (('платформа', plats), ('жанр', gens), ('оценка', src_r)) if not v]
    if missing:
        diag.append({**r, 'qid': q, 'enwiki': title, 'reason': 'нет: ' + ', '.join(missing)}); continue
    v = rt[src_r]
    rating = {'value': round(v * 10 if src_r == 'IGN' else v, 1), 'display': (f'{v:g}/10' if src_r == 'IGN' else f'{v:g}/100'), 'source': src_r}
    year = int(first[:4])
    prec = 'year' if first.endswith('-01-01') and len([x for x in dates if x[:4] == first[:4]]) == 1 else 'day'
    steam = d['steam'][0] if d['steam'] else None
    seen_q.add(q)
    games.append({
        'id': r['slug'], 'name': r['name'], 'url': f'https://cyber.sports.ru/games/{r["slug"]}/', 'subscribers': r['subs'],
        'releaseDate': first, 'datePrecision': prec, 'year': year, 'platforms': plats, 'genres': gens, 'rating': rating,
        'cover': f'https://cdn.cloudflare.steamstatic.com/steam/apps/{steam}/header.jpg' if steam else None,
        'coverSource': 'Steam (по Steam ID из Wikidata)' if steam else None,
        'wikidata': q,
        'sources': {'name': 'Кибер, список тегов', 'url': 'Кибер, список тегов', 'subscribers': 'Кибер, список тегов',
                    'releaseDate': 'Wikidata P577 (первая дата выхода)', 'platforms': psrc + ' (сопоставление с таблицей)',
                    'genres': 'Wikidata P136 + Википедия (сопоставление с таблицей)', 'rating': f'{src_r} через Википедию: {title}'},
    })
json.dump({'snapshot': TODAY, 'count': len(games), 'games': games}, open('/home/claude/proto/src/data/games.json', 'w'), ensure_ascii=False, indent=1)
json.dump(diag, open(W + 'diagnostics.json', 'w'), ensure_ascii=False, indent=1)
c = collections.Counter(x['reason'].split(':')[0] if x['reason'].startswith('нет:') else x['reason'] for x in diag)
print('games', len(games), 'excluded', len(diag), dict(c))
print('rating sources', collections.Counter(g['rating']['source'] for g in games))
print('covers', sum(1 for g in games if g['cover']))
pc = collections.Counter(p for g in games for p in g['platforms']); gc = collections.Counter(x for g in games for x in g['genres'])
print('platforms', pc.most_common()); print('genres', gc.most_common())
print('years', sorted(collections.Counter(g['year'] for g in games).items()))
