import { it, expect } from 'vitest';
import dictsRaw from '../src/data/dictionaries.json';
import gamesRaw from '../src/data/games.json';
import { filterGames, paginate, sortGames } from '../src/core/catalog';
import { computeSeo } from '../src/core/seo';
import { buildUrl } from '../src/core/route';
import { validate } from '../src/core/validate';
import type { Dictionaries, Game, CatalogState } from '../src/core/types';

const D = dictsRaw as unknown as Dictionaries;
const G = sortGames((gamesRaw as { games: Game[] }).games);

it('все страницы фильтров (одиночные, пары, тройки с играми) без ошибок инспектора', () => {
  const genres = Object.keys(D.genres), plats = Object.keys(D.platforms), years = D.filter_lists.years;
  const states: CatalogState[] = [{ page: 1 }];
  genres.forEach((g) => states.push({ page: 1, genre: g }));
  plats.forEach((p) => states.push({ page: 1, platform: p }));
  years.forEach((y) => states.push({ page: 1, year: y }));
  genres.forEach((g) => plats.forEach((p) => states.push({ page: 1, genre: g, platform: p })));
  genres.forEach((g) => years.forEach((y) => states.push({ page: 1, genre: g, year: y })));
  plats.forEach((p) => years.forEach((y) => states.push({ page: 1, platform: p, year: y })));
  for (const g of G) if (years.includes(String(g.year))) for (const ge of g.genres) for (const p of g.platforms) states.push({ page: 1, genre: ge, platform: p, year: String(g.year) });
  let pagesChecked = 0; const errs: string[] = []; const fallback = new Set<string>(); const stats = { index: 0, few: 0, empty: 0 };
  for (const s0 of states) {
    const list = filterGames(G, s0);
    const pages = Math.max(1, Math.ceil(list.length / 35));
    for (let p = 1; p <= pages; p++) {
      const s = { ...s0, page: p };
      const sl = paginate(list, p);
      const seo = computeSeo(s, sl, D);
      const url = buildUrl(s); const [path, q = ''] = url.split('?');
      const iss = validate(path, q ? '?' + q : '', s, sl, seo, sl.items.length, D);
      iss.filter((i) => i.level === 'error').forEach((i) => errs.push(url + ' :: ' + i.what));
      if (seo.template.source === 'fallback') fallback.add(seo.pageType + ':' + path);
      if (p === 1) stats[sl.total === 0 ? 'empty' : sl.total < 3 ? 'few' : 'index']++;
      pagesChecked++;
    }
  }
  console.log('проверено страниц', pagesChecked, 'по числу игр', stats, 'резервный шаблон', fallback.size, [...fallback].slice(0, 8));
  expect(errs.slice(0, 10)).toEqual([]);
});
