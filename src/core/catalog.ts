import { CONFIG } from './config';
import type { CatalogState, Game, RatingBand, SortKey } from './types';

const byName = (a: Game, b: Game) => a.name.localeCompare(b.name, 'ru');
const descendingScore = (a: Game, b: Game) =>
  (b.rating?.value ?? -1) - (a.rating?.value ?? -1);
const ascendingScore = (a: Game, b: Game) =>
  (a.rating?.value ?? 11) - (b.rating?.value ?? 11);
/**
 * Сортировки. По умолчанию - оценка по убыванию.
 * При равенстве: подписчики тега Кибера, затем название.
 */
export function sortGames(games: Game[], key: SortKey = 'rating-desc'): Game[] {
  const cmp: Record<SortKey, (a: Game, b: Game) => number> = {
    'rating-desc': (a, b) => descendingScore(a, b) || b.subscribers - a.subscribers || byName(a, b),
    'rating-asc': (a, b) => ascendingScore(a, b) || b.subscribers - a.subscribers || byName(a, b),
    popular: (a, b) => b.subscribers - a.subscribers || descendingScore(a, b) || byName(a, b),
    alpha: byName,
    new: (a, b) => b.releaseDate.localeCompare(a.releaseDate) || descendingScore(a, b) || byName(a, b),
    old: (a, b) => a.releaseDate.localeCompare(b.releaseDate) || descendingScore(a, b) || byName(a, b),
  };
  return [...games].sort(cmp[key]);
}

export function inBand(g: Game, band: RatingBand) {
  const b = CONFIG.ratingBands.find((x) => x.key === band)!;
  const score = g.rating?.value;
  return score !== undefined && score >= b.min && score < b.max;
}

/** Показ оценки: 10-балльная шкала, один знак после запятой (10 без дробной части) */
export const formatRating = (v: number) => (v >= 10 ? '10' : v.toFixed(1));

export const normalize = (s: string) =>
  s.toLowerCase().replace(/ё/g, 'е').replace(/[’'`:\-–—.,!?()]/g, ' ').replace(/\s+/g, ' ').trim();

/** Фильтрация по точному совпадению характеристик */
export function filterGames(games: Game[], s: Pick<CatalogState, 'genre' | 'platform' | 'year' | 'q' | 'rating' | 'sort'>): Game[] {
  const q = s.q ? normalize(s.q) : '';
  const list = games.filter(
    (g) =>
      (!s.genre || g.genres.includes(s.genre)) &&
      (!s.platform || g.platforms.includes(s.platform)) &&
      (!s.year || String(g.year) === s.year) &&
      (!s.rating || inBand(g, s.rating)) &&
      (!q || normalize(g.name).includes(q)),
  );
  return sortGames(list, s.sort);
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
export function optionCounts(games: Game[], s: CatalogState, kind: 'genre' | 'platform' | 'year' | 'rating', values: string[]) {
  const others = { ...s, q: undefined, [kind]: undefined } as CatalogState;
  const base = filterGames(games, others);
  const res: Record<string, number> = {};
  for (const v of values) {
    res[v] = base.filter((g) =>
      kind === 'genre' ? g.genres.includes(v) : kind === 'platform' ? g.platforms.includes(v)
        : kind === 'rating' ? inBand(g, v as RatingBand) : String(g.year) === v,
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
    .sort((a, b) => Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q)) || descendingScore(a, b))
    .slice(0, limit);
}
