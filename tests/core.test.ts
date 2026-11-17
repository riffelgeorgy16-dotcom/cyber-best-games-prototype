import { describe, it, expect } from 'vitest';
import dictsRaw from '../src/data/dictionaries.json';
import { parseUrl, buildUrl, buildPath } from '../src/core/route';
import { filterGames, paginate, sortGames, optionCounts } from '../src/core/catalog';
import { computeSeo, findTemplate } from '../src/core/seo';
import { validate } from '../src/core/validate';
import type { Dictionaries, Game, CatalogState } from '../src/core/types';

const D = dictsRaw as unknown as Dictionaries;
const mk = (i: number, over: Partial<Game> = {}): Game => ({
  id: 'g' + i, name: 'Game ' + i, url: `https://cyber.sports.ru/games/g${i}/`, subscribers: 0,
  releaseDate: '2024-05-0' + ((i % 9) + 1), datePrecision: 'day', year: 2024,
  platforms: ['pc'], genres: ['ekshen-igry'], rating: { value: 100 - (i % 50), display: '', source: 'IGN' },
  wikidata: 'Q' + i, sources: {}, ...over,
});
// 80 экшенов на ПК 2024, 2 хоррора на PS5 2020
const GAMES = sortGames([
  ...Array.from({ length: 80 }, (_, i) => mk(i)),
  mk(100, { genres: ['horror-igry'], platforms: ['playstation-5'], year: 2020 }),
  mk(101, { genres: ['horror-igry'], platforms: ['playstation-5'], year: 2020 }),
]);

function page(url: string) {
  const [p, s = ''] = url.split('?');
  const r = parseUrl(p, s ? '?' + s : '', D);
  if (r.kind !== 'ok') return { r };
  const sl = paginate(filterGames(GAMES, r.state), r.state.page);
  const seo = computeSeo(r.state, sl, D);
  const issues = validate(p, s ? '?' + s : '', r.state, sl, seo, sl.items.length, D);
  return { r, sl, seo, issues, errors: issues.filter((x) => x.level === 'error') };
}

describe('маршрутизация', () => {
  it('разбирает прямой адрес с тремя фильтрами и страницей', () => {
    const r = parseUrl('/games/best/ekshen-igry/pc/2024/', '?page=2', D);
    expect(r).toEqual({ kind: 'ok', state: { genre: 'ekshen-igry', platform: 'pc', year: '2024', page: 2 } });
  });
  it('порядок сегментов не зависит от порядка выбора', () => {
    expect(buildPath({ year: '2024', platform: 'pc', genre: 'ekshen-igry' })).toBe('/games/best/ekshen-igry/pc/2024/');
    const r = parseUrl('/games/best/pc/ekshen-igry/', '', D);
    expect(r.kind).toBe('redirect');
    if (r.kind === 'redirect') expect(r.to).toBe('/games/best/ekshen-igry/pc/');
  });
  it('page=1 и адрес без слеша перенаправляются', () => {
    expect(parseUrl('/games/best/pc/', '?page=1', D)).toMatchObject({ kind: 'redirect', to: '/games/best/pc/' });
    expect(parseUrl('/games/best/pc', '', D)).toMatchObject({ kind: 'redirect', to: '/games/best/pc/' });
  });
  it('неизвестный слаг и мусор в page дают 404', () => {
    expect(parseUrl('/games/best/abc/', '', D).kind).toBe('not_found');
    expect(parseUrl('/games/best/', '?page=x', D).kind).toBe('not_found');
    expect(parseUrl('/games/best/pc/xbox-one/', '', D).kind).toBe('not_found');
  });
});

describe('каталог', () => {
  it('35 карточек на странице и корректные хвосты', () => {
    const p1 = page('/games/best/');
    expect(p1.sl!.items.length).toBe(35);
    expect(p1.sl!.pages).toBe(3);
    const p3 = page('/games/best/?page=3');
    expect(p3.sl!.items.length).toBe(82 - 70);
  });
  it('страница вне диапазона', () => {
    expect(page('/games/best/?page=9').sl!.outOfRange).toBe(true);
  });
  it('сортировка по оценке', () => {
    const vals = GAMES.map((g) => g.rating.value);
    expect([...vals].sort((a, b) => b - a)).toEqual(vals);
  });
  it('счетчики фильтров учитывают остальные выбранные параметры', () => {
    const c = optionCounts(GAMES, { page: 1, genre: 'horror-igry' }, 'platform', ['pc', 'playstation-5']);
    expect(c).toEqual({ pc: 0, 'playstation-5': 2 });
  });
});

describe('SEO', () => {
  it('главная страница: мета из ТЗ', () => {
    const { seo, errors } = page('/games/best/');
    expect(seo!.h1).toBe('Лучшие игры всех времен');
    expect(seo!.canonical).toBe('https://cyber.sports.ru/games/best/');
    expect(seo!.robots).toBe('index, follow');
    expect(errors).toEqual([]);
  });
  it('главная, страница 2: значения из ТЗ', () => {
    const { seo, errors } = page('/games/best/?page=2');
    expect(seo!.title).toBe('Топ игр: во что поиграть, лучшие игры, самые популярные - Страница 2');
    expect(seo!.h1).toBe('Лучшие игры - Страница 2');
    expect(seo!.prev).toBe('https://cyber.sports.ru/games/best/');
    expect(seo!.next).toBe('https://cyber.sports.ru/games/best/?page=3');
    expect(seo!.canonical).toBe('https://cyber.sports.ru/games/best/');
    expect(errors).toEqual([]);
  });
  it('жанр + платформа + год: шаблон с переменными и крошки', () => {
    const { seo, errors } = page('/games/best/ekshen-igry/pc/2024/?page=2');
    expect(seo!.h1).not.toMatch(/\[\[/);
    expect(seo!.h1.endsWith(' - Страница 2')).toBe(true);
    expect(seo!.canonical).toBe('https://cyber.sports.ru/games/best/ekshen-igry/pc/2024/');
    expect(seo!.breadcrumbs.map((c) => c.name)).toEqual(['Главная', 'Игры', 'Лучшие', 'Экшен', 'ПК', '2024']);
    const bl = seo!.breadcrumbList as { itemListElement: { position: number; item: string }[] };
    expect(bl.itemListElement[4].item).toBe('https://cyber.sports.ru/games/best/ekshen-igry/pc/');
    const il = seo!.itemList as { numberOfItems: number; itemListElement: { position: number }[] };
    expect(il.numberOfItems).toBe(80);
    expect(il.itemListElement[0].position).toBe(36);
    expect(errors).toEqual([]);
  });
  it('индивидуальный шаблон важнее общего (VR + Oculus Quest 3)', () => {
    const t = findTemplate({ page: 1, genre: 'vr-igry', platform: 'oculus-quest-3' }, D);
    expect(t.source).toBe('exact');
    const t2 = findTemplate({ page: 1, genre: 'rpg', platform: 'pc' }, D);
    expect(t2.source).toBe('pattern');
  });
  it('меньше 3 игр: noindex, без ошибок', () => {
    const { seo, errors } = page('/games/best/horror-igry/playstation-5/2020/');
    expect(seo!.robots).toBe('noindex, follow');
    expect(errors).toEqual([]);
  });
  it('0 игр по прямому адресу: canonical на главную каталога', () => {
    const { seo, errors } = page('/games/best/horror-igry/pc/');
    expect(seo!.canonical).toBe('https://cyber.sports.ru/games/best/');
    expect(seo!.robots).toBe('noindex, follow');
    expect(errors).toEqual([]);
  });
  it('поиск: noindex, canonical на страницу фильтра, фильтры сохраняются', () => {
    const { seo, r } = page('/games/best/ekshen-igry/?q=game%201');
    expect((r as { state: CatalogState }).state.genre).toBe('ekshen-igry');
    expect(seo!.robots).toBe('noindex, follow');
    expect(seo!.canonical).toBe('https://cyber.sports.ru/games/best/ekshen-igry/');
    expect(buildUrl({ genre: 'ekshen-igry', q: 'game', page: 2 })).toBe('/games/best/ekshen-igry/?q=game&page=2');
  });
  it('все комбинации шаблонов таблицы дают текст без переменных', () => {
    for (const t of D.templates) {
      const st: CatalogState = { page: 1 };
      t.pattern.forEach((p) => {
        if (p === '{P}') st.platform = 'pc';
        else if (p === '{Y}') st.year = '2024';
        else if (D.genres[p]) st.genre = p;
        else if (D.platforms[p]) st.platform = p;
        else if (/^\d{4}$/.test(p)) st.year = p;
      });
      const seo = computeSeo(st, paginate(filterGames(GAMES, st), 1), D);
      expect(seo.title + seo.h1 + seo.description, `строка ${t.row}`).not.toMatch(/\[\[|\]\]/);
    }
  });
});
