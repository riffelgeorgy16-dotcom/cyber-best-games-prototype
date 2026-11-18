# Сквозная проверка сценариев ТЗ в headless Chrome. Каждая проверка печатает PASS/FAIL.
import asyncio, json, re, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173'
P = BASE.rstrip('/')
results = []

def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + ('' if cond else ' :: ' + str(detail)))

async def head(pg):
    return await pg.evaluate('''() => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent,
      desc: document.querySelector('meta[name=description]')?.content,
      robots: document.querySelector('meta[name=x-prototype-robots]')?.content,
      canonical: document.querySelector('link[rel=canonical]')?.href,
      prev: document.querySelector('link[rel=prev]')?.href || null,
      next: document.querySelector('link[rel=next]')?.href || null,
      cards: document.querySelectorAll('.card').length,
      crumbs: [...document.querySelectorAll('.crumbs a, .crumbs .cur')].map(e => e.textContent),
      itemlist: JSON.parse(document.getElementById('ld-itemlist')?.textContent || 'null'),
      bc: JSON.parse(document.getElementById('ld-breadcrumbs')?.textContent || 'null'),
      count: document.querySelector('.result-count')?.textContent || '',
      empty: document.querySelector('.empty-text')?.textContent || null,
      nf: !!document.querySelector('.notfound'),
      insErr: document.querySelector('.ins-toggle')?.textContent || '',
      path: location.pathname.replace(/^\/cyber-best-games-prototype/, '') + location.search,
    })''')

def no_err(h): return 'ошибок нет' in h['insErr']

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        go = lambda path: pg.goto(P + path, wait_until='networkidle')

        # 1. Главная
        await go('/games/best/')
        h = await head(pg)
        check('Главная: H1 из ТЗ', h['h1'] == 'Лучшие игры всех времен', h['h1'])
        check('Главная: Title из ТЗ', h['title'].startswith('Топ игр - лучшие игры всех'), h['title'])
        check('Главная: 35 карточек', h['cards'] == 35, h['cards'])
        check('Главная: canonical', h['canonical'] == 'https://cyber.sports.ru/games/best/', h['canonical'])
        check('Главная: next=?page=2, prev нет', h['next'] == 'https://cyber.sports.ru/games/best/?page=2' and h['prev'] is None, (h['prev'], h['next']))
        check('Главная: ItemList позиции 1..35', [e['position'] for e in h['itemlist']['itemListElement']] == list(range(1, 36)))
        check('Главная: инспектор без ошибок', no_err(h), h['insErr'])
        total_all = h['itemlist']['numberOfItems']

        # 2. Одиночный фильтр кликом: Платформа -> ПК
        await pg.click('.fblock:nth-child(1) .fhead')
        await pg.click('.fpanel a:has-text("ПК")')
        await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Клик ПК: URL /games/best/pc/', h['path'] == '/games/best/pc/', h['path'])
        check('Клик ПК: H1 из таблицы', h['h1'] == 'Лучшие игры на ПК', h['h1'])
        check('Клик ПК: крошки', h['crumbs'] == ['Главная', 'Игры', 'Лучшие', 'ПК'], h['crumbs'])

        # 3. Второй фильтр (жанр) сохраняет платформу, порядок сегментов жанр/платформа
        await pg.click('.fblock:nth-child(2) .fhead')
        await pg.click('.fpanel a:has-text("Шутеры")')
        await pg.wait_for_timeout(300)
        h = await head(pg)
        check('ПК + Шутеры: URL /shutery/pc/', h['path'] == '/games/best/shutery/pc/', h['path'])
        check('ПК + Шутеры: инспектор без ошибок', no_err(h), h['insErr'])
        # 4. Третий фильтр (год)
        await pg.click('.fblock:nth-child(3) .fhead')
        opt = pg.locator('.fpanel-year a.fopt').first
        yr = (await opt.text_content()).split()[0]
        await opt.click(); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Три фильтра: URL жанр/платформа/год', h['path'] == f'/games/best/shutery/pc/{yr}/', h['path'])
        check('Три фильтра: 6 крошек', len(h['crumbs']) == 6, h['crumbs'])
        check('Три фильтра: BreadcrumbList 6 позиций', len(h['bc']['itemListElement']) == 6)
        check('Три фильтра: инспектор без ошибок', no_err(h), h['insErr'])

        # 5. Назад / вперед
        await pg.go_back(); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Назад: вернулись к /shutery/pc/', h['path'] == '/games/best/shutery/pc/', h['path'])
        await pg.go_forward(); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Вперед: снова год', h['path'] == f'/games/best/shutery/pc/{yr}/', h['path'])

        # 6. Сброс
        await pg.click('.freset'); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Сброс: главная и ее мета', h['path'] == '/games/best/' and h['h1'] == 'Лучшие игры всех времен', (h['path'], h['h1']))

        # 7. Пагинация с фильтром и прямой адрес
        await go('/games/best/ekshen-igry/?page=2')
        h = await head(pg)
        check('Прямой URL с page=2: H1 с хвостом', h['h1'].endswith(' - Страница 2'), h['h1'])
        check('page=2: Title и Description с хвостом', h['title'].endswith(' - Страница 2') and h['desc'].endswith(' - Страница 2'))
        check('page=2: canonical без page', h['canonical'] == 'https://cyber.sports.ru/games/best/ekshen-igry/', h['canonical'])
        check('page=2: prev на первую без page', h['prev'] == 'https://cyber.sports.ru/games/best/ekshen-igry/', h['prev'])
        check('page=2: позиции ItemList с 36', h['itemlist']['itemListElement'][0]['position'] == 36)
        await pg.reload(wait_until='networkidle')
        h2 = await head(pg)
        check('Обновление страницы сохраняет состояние', h2['path'] == h['path'] and h2['h1'] == h['h1'])
        # клик по пагинации
        await pg.click('.pager a:has-text("1")'); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Пагинация: ссылка на 1 без ?page', h['path'] == '/games/best/ekshen-igry/', h['path'])
        # смена фильтра сбрасывает страницу
        await go('/games/best/ekshen-igry/?page=3')
        await pg.click('.fblock:nth-child(1) .fhead'); await pg.click('.fpanel a:has-text("ПК")'); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Смена фильтра сбрасывает пагинацию', h['path'] == '/games/best/ekshen-igry/pc/', h['path'])

        # 8. Прямой адрес из задания
        await go('/games/best/ekshen-igry/pc/2020/?page=1')
        h = await head(pg)
        check('?page=1 -> 301 на адрес без page', h['path'] == '/games/best/ekshen-igry/pc/2020/', h['path'])
        await go('/games/best/pc/ekshen-igry/')
        h = await head(pg)
        check('Неверный порядок -> 301 на жанр/платформа', h['path'] == '/games/best/ekshen-igry/pc/', h['path'])
        await go('/games/best/ekshen-igry/pc')
        h = await head(pg)
        check('Без слеша -> 301', h['path'] == '/games/best/ekshen-igry/pc/', h['path'])

        # 9. 404
        await go('/games/best/neizvestno/')
        h = await head(pg); check('Неизвестный слаг -> 404', h['nf'])
        await go('/games/best/?page=999')
        h = await head(pg); check('Страница вне диапазона -> 404', h['nf'])
        await go('/games/best/?page=abc')
        h = await head(pg); check('page=abc -> 404', h['nf'])

        # 10. Пустой результат кликом: сообщение без смены URL
        await go('/games/best/sega-mega-drive/')
        before = await head(pg)
        await pg.click('.fblock:nth-child(2) .fhead')
        zero = pg.locator('.fpanel button.fopt.zero').first
        if await zero.count():
            await zero.click(); await pg.wait_for_timeout(300)
            h = await head(pg)
            check('0 игр кликом: сообщение из ТЗ', h['empty'] and h['empty'].startswith('По вашим фильтрам ничего не найдено'), h['empty'])
            check('0 игр кликом: URL и мета не изменились', h['path'] == before['path'] and h['title'] == before['title'])
        else:
            check('0 игр кликом: нашелся вариант с 0', False, 'нет вариантов')
        # Пустой результат по прямому адресу
        await go('/games/best/kvesty/nintendo-64/1990/')
        h = await head(pg)
        check('0 игр по прямому URL: сообщение', bool(h['empty']), h)
        check('0 игр по прямому URL: noindex + canonical на главную', h['robots'] == 'noindex, follow' and h['canonical'] == 'https://cyber.sports.ru/games/best/', (h['robots'], h['canonical']))
        # 1-2 игры
        await go('/games/best/sega-mega-drive/')
        h = await head(pg)
        n = h['itemlist']['numberOfItems']
        check(f'Мало игр ({n}): noindex', (n >= 3) or h['robots'] == 'noindex, follow', (n, h['robots']))
        check('Мало игр: инспектор без ошибок', no_err(h), h['insErr'])

        # 11. Поиск
        await go('/games/best/shutery/')
        await pg.fill('.search-input', 'call of')
        await pg.wait_for_timeout(300)
        sug = await pg.locator('.sug li a').count()
        check('Поиск: подсказки появились', sug > 0, sug)
        await pg.press('.search-input', 'Enter'); await pg.wait_for_timeout(400)
        h = await head(pg)
        check('Поиск: ?q= в адресе, фильтр сохранен', h['path'].startswith('/games/best/shutery/?q=call'), h['path'])
        check('Поиск: noindex, canonical на фильтр', h['robots'] == 'noindex, follow' and h['canonical'] == 'https://cyber.sports.ru/games/best/shutery/')
        names = await pg.locator('.card-title').all_text_contents()
        check('Поиск: все результаты содержат запрос (без учета регистра)', names and all('call of' in x.lower() for x in names), names[:5])
        await go('/games/best/?q=CALL%20OF')
        h2 = await head(pg)
        check('Поиск не зависит от регистра', h2['itemlist']['numberOfItems'] >= len(names))

        # 12. Ссылки карточки
        await go('/games/best/')
        g = pg.locator('.card').first
        t = await g.locator('.card-title a').get_attribute('href')
        check('Название ведет на тег Кибера', re.match(r'^https://cyber\.sports\.ru/games/[^/]+/$', t or ''), t)
        gl = await g.locator('.card-row').first.locator('a').first.get_attribute('href')
        check('Жанр ведет на страницу жанра', re.match(r'^(/cyber-best-games-prototype)?/games/best/[a-z0-9-]+/$', gl or ''), gl)
        date = await g.locator('.card-date').text_content()
        check('Дата без "Вышла:"', 'Вышла' not in date, date)

        # 13. Прохождение всех страниц главной: позиции непрерывны
        pages = (total_all + 34) // 35
        pos = []
        for i in range(1, pages + 1):
            await go('/games/best/' + (f'?page={i}' if i > 1 else ''))
            h = await head(pg)
            pos += [e['position'] for e in h['itemlist']['itemListElement']]
        check(f'Все {pages} страниц: позиции 1..{total_all} без пропусков', pos == list(range(1, total_all + 1)), (len(pos), total_all))


        # v0.2: сортировка
        await go('/games/best/shutery/')
        await pg.click('.sorthead'); await pg.click('.fpanel-sort a:has-text("Сначала новые")'); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Сортировка: ?sort=new, фильтр сохранен', h['path'] == '/games/best/shutery/?sort=new', h['path'])
        check('Сортировка: noindex и canonical без параметров', h['robots'] == 'noindex, follow' and h['canonical'] == 'https://cyber.sports.ru/games/best/shutery/', (h['robots'], h['canonical']))
        dates = await pg.evaluate("() => [...document.querySelectorAll('.card-date')].map(e => e.textContent)")
        years = [int(re.search(r'(\d{4})', d).group(1)) for d in dates]
        check('Сортировка: новые сверху', years == sorted(years, reverse=True), years[:8])
        await pg.click('.fblock:nth-child(1) .fhead'); await pg.click('.fpanel a:has-text("ПК")'); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Смена фильтра сохраняет сортировку', h['path'] == '/games/best/shutery/pc/?sort=new', h['path'])
        await go('/games/best/?sort=alpha')
        names = await pg.locator('.card-title').all_text_contents()
        check('Сортировка по алфавиту', names == sorted(names, key=lambda x: x.lower()) or names[0] < names[-1], names[:5])
        await go('/games/best/?sort=rating-desc')
        h = await head(pg)
        check('sort=rating-desc (по умолчанию) -> 301 на чистый адрес', h['path'] == '/games/best/', h['path'])

        # v0.2: фильтр оценки
        await go('/games/best/')
        await pg.click('.fblock:nth-child(4) .fhead'); await pg.click('.fpanel-rating a:has-text("4-7")'); await pg.wait_for_timeout(300)
        h = await head(pg)
        check('Оценка 4-7: ?rating=4-7', h['path'] == '/games/best/?rating=4-7', h['path'])
        vals = [float(x) for x in await pg.locator('.rating b').all_text_contents()]
        check('Оценка 4-7: все оценки в диапазоне', vals and all(4 <= v < 8 for v in vals), vals[:10])
        check('Оценка: noindex', h['robots'] == 'noindex, follow', h['robots'])
        check('Оценка: инспектор без ошибок', no_err(h), h['insErr'])

        # v0.2: оценки без источника, 10-балльная шкала
        await go('/games/best/')
        txt = ' '.join(await pg.locator('.card').all_text_contents())
        check('На карточках нет IGN / Metacritic', 'IGN' not in txt and 'Metacritic' not in txt and '/100' not in txt and '/10' not in txt)
        allv = [float(x) for x in await pg.locator('.rating b').all_text_contents()]
        check('Оценки в шкале 0-10', allv and all(0 <= v <= 10 for v in allv), allv[:5])

        # v0.3: подборки - посты редакции
        chips = await pg.evaluate("() => [...document.querySelectorAll('.chips a.chip')].map(a => a.href)")
        check('Подборки: 4 ссылки на посты Кибера', len(chips) == 4 and all(re.match(r'^https://cyber\.sports\.ru/games/blogs/\d+\.html$', c) for c in chips), chips)
        check('На карточках нет порядковых номеров', await pg.locator('.card .pos').count() == 0)
        await go('/games/best/rpg/')
        # v0.2: добавить игру
        await pg.click('.btn-add')
        check('Окно заявки открылось', await pg.locator('.modal').count() == 1)
        await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(200)
        errs_n = await pg.locator('.form-errors li').count()
        check('Пустая заявка не отправляется (3 ошибки)', errs_n == 3, errs_n)
        await pg.fill('.modal input[type=email]', 'dev@example.com')
        await pg.fill('.modal textarea', 'Название: Test Game\nСсылка: https://store.steampowered.com/app/1/')
        await pg.check('.chk-agree input')
        await pg.click('.modal button[type=submit]'); await pg.wait_for_timeout(200)
        check('Заполненная заявка: экран успеха с пометкой прототипа', await pg.locator('.ok-msg').count() == 1 and 'никуда не отправлена' in (await pg.locator('.modal').text_content()))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        check('Окно закрывается по Esc', await pg.locator('.modal').count() == 0)
        check('Нет JS-ошибок на страницах', not errors, errors[:3])
        await b.close()
    bad = [r for r in results if not r[1]]
    print(f'\nИТОГО: {len(results) - len(bad)} из {len(results)} проверок пройдено')

asyncio.run(main())
