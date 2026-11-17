import { CONFIG } from './config';
import type { CatalogState, Game } from './types';

/** Сортировка: оценка по убыванию; при равенстве - подписчики тега, затем название */
export function sortGames(games: Game[]): Game[] {
  return [...games].sort(
    (a, b) => b.rating.value - a.rating.value || b.subscribers - a.subscribers || a.name.localeCompare(b.name, 'ru'),
  );
}

export const normalize = (s: string) =>
  s.toLowerCase().replace(/ё/g, 'е').replace(/[’'`:\-–—.,!?()]/g, ' ').replace(/\s+/g, ' ').trim();

/** Фильтрация по точному совпадению характеристик */
export function filterGames(games: Game[], s: Pick<CatalogState, 'genre' | 'platform' | 'year' | 'q'>): Game[] {
  const q = s.q ? normalize(s.q) : '';
  return games.filter(
    (g) =>
      (!s.genre || g.genres.includes(s.genre)) &&
      (!s.platform || g.platforms.includes(s.platform)) &&
      (!s.year || String(g.year) === s.year) &&
      (!q || normalize(g.name).includes(q)),
  );
}

export interface PageSlice {
  total: number;
  pages: number;
  page: number;
  items: Game[];
  offset: number; // позиция первого элемента в общем списке (0-based)
  outOfRange: boolean;
}

export function paginate(sorted: Game[], page: number): PageSlice {
  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / CONFIG.perPage));
  const outOfRange = page > pages;
  const offset = (page - 1) * CONFIG.perPage;
  return { total, pages, page, offset, outOfRange, items: outOfRange ? [] : sorted.slice(offset, offset + CONFIG.perPage) };
}

/** Сколько игр даст каждый вариант фильтра при сохранении остальных выбранных параметров */
export function optionCounts(games: Game[], s: CatalogState, kind: 'genre' | 'platform' | 'year', values: string[]) {
  const others = { ...s, q: undefined, [kind]: undefined } as CatalogState;
  const base = filterGames(games, others);
  const res: Record<string, number> = {};
  for (const v of values) {
    res[v] = base.filter((g) =>
      kind === 'genre' ? g.genres.includes(v) : kind === 'platform' ? g.platforms.includes(v) : String(g.year) === v,
    ).length;
  }
  return res;
}

/** Подсказки поиска по всему каталогу: сначала совпадения с начала названия */
export function suggest(games: Game[], query: string, limit = 8): Game[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const hits = games.filter((g) => normalize(g.name).includes(q));
  return hits
    .sort((a, b) => Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q)) || b.rating.value - a.rating.value)
    .slice(0, limit);
}
