import { z } from 'zod';
import games from '../data/games.json';
import dictionaries from '../data/dictionaries.json';
import releases from '../data/releases.json';
import chips from '../data/collections.json';
import news from '../data/news.json';
import { CONFIG } from '../core/config';
import { buildPath, parseUrl } from '../core/route';
import { filterGames } from '../core/catalog';
import { catalogEligibleGames, releaseUpperBound, todayISO } from '../core/releases';
import type { CatalogState, Dictionaries, Game, PageType } from '../core/types';

export const ADMIN_PATH = '/admin/catalog/';
const sortKeys = CONFIG.sorts.map(s => s.key);
export const statuses = ['released', 'upcoming', 'unconfirmed'] as const;
export const ratingSources = ['Редакция', 'IGN', 'Metacritic', 'OpenCritic', 'GameRankings'] as const;
export const pageTypes = ['genre', 'platform', 'year', 'genre_platform', 'genre_year', 'platform_year', 'genre_platform_year'] as const;
export const blockKeys = ['recent', 'upcoming', 'news', 'blogs', 'collections', 'editorial'] as const;
export const blockTitles = {
  recent: 'Недавно вышли', upcoming: 'Скоро выйдут', news: 'Главные новости',
  blogs: 'Материалы из блогов', collections: 'Подборки', editorial: 'SEO-текст',
};
export const statusLabels = { released: 'Вышла', upcoming: 'Ожидается', unconfirmed: 'Не подтверждена' };

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Используйте строчные латинские буквы, цифры и дефисы');
const name = z.string().trim().min(1, 'Введите название');
const text = z.string();
export const webUrl = (value: string) => {
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
};
const link = text.refine(webUrl, 'Нужен адрес HTTP или HTTPS');
const image = text.refine(v => !v || webUrl(v) || /^data:image\/(png|jpeg|webp|gif|avif);base64,[a-z0-9+/]+={0,2}$/i.test(v), 'Укажите URL или растровое изображение');
const date = text.refine(v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v), 'Некорректная дата');
const integer = z.number().int();
const sources = z.record(text, text);
const rating = z.object({
  value: z.number().min(0).max(10), source: z.enum(ratingSources), original: text,
  url: link.optional(), platform: text.optional(),
});
export const gameSchema = z.object({
  id: slug, name, nameRu: text.optional(), aliases: z.array(text).optional(), url: link.optional(),
  tagId: slug.optional(), description: text.optional(), subscribers: integer.min(0), releaseDate: date,
  datePrecision: z.enum(['day', 'month', 'year']), year: integer.min(0).max(9999),
  status: z.enum(statuses).optional(), excluded: z.boolean().optional(), priority: integer.optional(),
  genres: z.array(slug), platforms: z.array(slug), rating: rating.optional(),
  cover: image.optional(), coverAlt: text.optional(), backdropLeft: image.optional(), backdropRight: image.optional(),
  coverSource: text.optional(), wikidata: z.union([z.literal(''), text.regex(/^Q[1-9]\d*$/)]), sources,
}).refine(g => !g.releaseDate || Number(g.releaseDate.slice(0, 4)) === g.year, 'Год должен совпадать с датой релиза');

const meta = z.object({ h1: text.optional(), title: text.optional(), description: text.optional() });
const editorial = z.object({ heading: text.optional(), body: text.optional(), visible: z.boolean().optional(), columns: integer.min(1).max(3).optional() });
const seo = meta.extend({ copy: editorial.optional() });
const choice = z.object({ id: slug, label: name, visible: z.boolean() });
const story = z.object({ title: name, url: link, label: text.optional(), blog: text.optional(), image: image.optional(),
  date: text.optional(), visible: z.boolean().optional(), start: date.optional(), end: date.optional() })
  .refine(v => !v.start || !v.end || v.start <= v.end, 'Окончание раньше начала');
const pin = z.object({ id: text, gameId: slug, position: integer.min(1).max(200), active: z.boolean(),
  scope: z.enum(['main', 'page', 'all']), path: text, start: date, end: date })
  .refine(v => !v.start || !v.end || v.start <= v.end, 'Окончание раньше начала');
const block = z.object({ title: name, visible: z.boolean(), limit: integer.min(1).max(30),
  mode: z.enum(['auto', 'manual']), picks: z.array(text), stories: z.array(story).optional() });
const settings = z.object({ perPage: integer.min(1).max(100), minIndexable: integer.min(3).max(100),
  recentDays: integer.min(1).max(365), defaultSort: z.enum(sortKeys).default('rating-desc') });

export const adminSchema = z.object({
  version: z.literal(1), games: z.record(slug, gameSchema),
  pages: z.record(text, seo), templates: z.partialRecord(z.enum(pageTypes), seo),
  filters: z.partialRecord(z.enum(['platforms', 'genres', 'years', 'rating']), z.array(choice)),
  pins: z.array(pin), upper: z.array(story), lower: z.array(story),
  blockOrder: z.array(z.enum(blockKeys)).length(blockKeys.length).refine(v => new Set(v).size === blockKeys.length),
  blocks: z.record(z.enum(blockKeys), block), settings,
});

export type AdminState = z.infer<typeof adminSchema>;
export type Story = z.infer<typeof story>;
export type FilterKind = keyof AdminState['filters'];
export type BlockKey = typeof blockKeys[number];
export type Block = AdminState['blocks'][BlockKey];
export type SeoEntry = z.infer<typeof seo>;
export type Pin = z.infer<typeof pin>;

export const baseDictionaries = dictionaries as unknown as Dictionaries;
const rawGames = games.games as unknown as Game[];
export const defaultGames: Game[] = [...rawGames, ...releases.releases
  .filter(r => !rawGames.some(g => g.id === r.id))
  .map(({ source, datePrecision, status, ...r }): Game => ({ ...r, datePrecision: datePrecision as Game['datePrecision'], status: status as Game['status'], subscribers: 0,
    wikidata: '', sources: { releaseDate: source, cover: source } }))];
export const media = news;

export const defaultAdmin: AdminState = {
  version: 1, games: {}, pages: {}, templates: {}, filters: {}, pins: [],
  upper: chips.items, lower: news.collections, blockOrder: [...blockKeys],
  blocks: Object.fromEntries(blockKeys.map(key => [key, {
    title: blockTitles[key], visible: true, limit: key === 'editorial' ? 30 : key === 'collections' ? news.collections.length : 5,
    mode: 'auto', picks: [] as string[],
  }])) as AdminState['blocks'],
  settings: { perPage: CONFIG.perPage, minIndexable: CONFIG.minIndexable, recentDays: 90, defaultSort: 'rating-desc' },
};

export function gameStatus(game: Game, today = todayISO()): NonNullable<Game['status']> {
  if (game.status) return game.status;
  const latest = releaseUpperBound(game);
  return latest && latest <= today ? 'released' : 'unconfirmed';
}

export function effectiveGames(state: AdminState) {
  const records = new Map(defaultGames.map(g => [g.id, g]));
  for (const game of Object.values(state.games)) records.set(game.id, game);
  return [...records.values()];
}

export function originalChoices(kind: FilterKind) {
  if (kind === 'rating') return CONFIG.ratingBands.map(b => ({ id: b.key, label: b.label, visible: true }));
  if (kind === 'years') return baseDictionaries.filter_lists.years.map(year => ({ id: year, label: year, visible: true }));
  const values = Object.values(baseDictionaries[kind]);
  const order = baseDictionaries.filter_lists[kind].flatMap(value => {
    const match = values.find(item => item.slug === value || item.name.toLowerCase() === value.toLowerCase());
    return match ? [match.slug] : [];
  });
  return [...new Set([...order, ...values.map(v => v.slug)])].map(id => ({
    id, label: baseDictionaries[kind][id].name, visible: order.includes(id),
  }));
}

export function effectiveDictionaries(state: AdminState): Dictionaries {
  const source = baseDictionaries;
  const result: Dictionaries = { ...source, platforms: { ...source.platforms }, genres: { ...source.genres },
    filter_lists: { ...source.filter_lists }, defaultSort: state.settings.defaultSort };
  for (const kind of ['platforms', 'genres'] as const) {
    const list = state.filters[kind] ?? originalChoices(kind);
    for (const { id, label } of list) {
      const old = result[kind][id];
      const initial = { ...(old ?? { slug: id, title: '', description: '', h1: '' }), name: label };
      if (kind === 'platforms') result.platforms[id] = { ...initial, var: old && old.name === label && 'var' in old ? old.var : label };
      else result.genres[id] = initial;
    }
    result.filter_lists[kind] = list.filter(c => c.visible).map(c => c.id);
  }
  const years = state.filters.years ?? originalChoices('years');
  result.filter_lists.years = years.filter(c => c.visible).map(c => c.id);
  result.catalogYears = years.map(c => c.id);
  result.yearLabels = Object.fromEntries(years.map(c => [c.id, c.label]));
  result.ratingChoices = (state.filters.rating ?? originalChoices('rating')).filter(c => c.visible);
  result.ratingLabels = Object.fromEntries((state.filters.rating ?? originalChoices('rating')).map(c => [c.id, c.label]));
  return result;
}

export function orderedGames(games: Game[], route: CatalogState, state: AdminState, today = todayISO()) {
  const sorted = filterGames(games, { ...route, defaultSort: route.defaultSort ?? state.settings.defaultSort });
  if ((route.sort ?? route.defaultSort ?? state.settings.defaultSort) !== 'rating-desc' || !state.pins.length) return sorted;
  const path = buildPath(route);
  const eligible = new Map(sorted.map(g => [g.id, g]));
  const applicable = state.pins.filter(p => p.active && (!p.start || p.start <= today) && (!p.end || p.end >= today) &&
    (p.scope === 'all' || (p.scope === 'main' && path === CONFIG.base) || (p.scope === 'page' && p.path === path)));
  const ordered = [...sorted];
  const placed = new Set<string>();
  let nextPosition = 0;
  for (const pin of applicable.sort((a, b) => a.position - b.position)) {
    const game = eligible.get(pin.gameId);
    if (!game || placed.has(game.id)) continue;
    ordered.splice(ordered.indexOf(game), 1);
    const position = Math.max(nextPosition, pin.position - 1);
    ordered.splice(position, 0, game);
    nextPosition = position + 1;
    placed.add(game.id);
  }
  return ordered;
}

export function availableGames(state: AdminState, today = todayISO()) {
  return catalogEligibleGames(effectiveGames(state), today);
}

export function activeStories(stories: Story[], today = todayISO()) {
  return stories.filter(v => v.visible !== false && (!v.start || v.start <= today) && (!v.end || v.end >= today));
}

const normalizedUrl = (value?: string) => {
  if (!value || !webUrl(value)) return '';
  const url = new URL(value);
  return url.hostname + url.pathname.replace(/\/$/, '');
};

export function validateGame(candidate: unknown, dict: Dictionaries, other: Game[], editing?: string) {
  const result = gameSchema.safeParse(candidate);
  if (!result.success) return { errors: result.error.issues.map(e => (e.path.join('.') || 'Игра') + ': ' + e.message) };
  const game = result.data;
  const errors = [];
  if (game.genres.some(v => !Object.prototype.hasOwnProperty.call(dict.genres, v))) errors.push('Неизвестный жанр.');
  if (game.platforms.some(v => !Object.prototype.hasOwnProperty.call(dict.platforms, v))) errors.push('Неизвестная платформа.');
  const duplicate = other.find(g => g.id !== editing && (g.id === game.id ||
    (game.wikidata && g.wikidata === game.wikidata) ||
    (game.tagId && g.tagId === game.tagId) ||
    (game.url && normalizedUrl(g.url) === normalizedUrl(game.url))));
  if (duplicate) errors.push('Совпадение идентификатора или тега с «' + duplicate.name + '».');
  return { game, errors };
}

export function parseAdmin(candidate: unknown) {
  const state = adminSchema.parse(candidate);
  const dict = effectiveDictionaries(state);
  const all = effectiveGames(state);
  for (const [id, game] of Object.entries(state.games)) {
    if (id !== game.id) throw new Error('Ключ игры не совпадает с ID.');
    const errors = validateGame(game, dict, all, id).errors;
    if (errors.length) throw new Error(game.name + ': ' + errors.join(' '));
  }
  for (const key of ['platforms', 'genres', 'years', 'rating'] as const) {
    const values = state.filters[key];
    if (!values) continue;
    if (new Set(values.map(v => v.id)).size !== values.length) throw new Error('Повторяющиеся значения фильтра.');
    const originals = originalChoices(key);
    if (originals.some(v => !values.some(c => c.id === v.id))) throw new Error('Исходные значения фильтра можно скрыть.');
    if (key === 'rating' && values.length !== originals.length) throw new Error('Границы рейтинга фиксированы.');
    if (key === 'years' && values.some(v => !/^\d{4}$/.test(v.id))) throw new Error('Некорректный год.');
    if (key === 'platforms' || key === 'genres') {
      const other = key === 'genres' ? dict.platforms : dict.genres;
      if (values.some(v => Object.prototype.hasOwnProperty.call(other, v.id) || /^\d{4}$/.test(v.id))) throw new Error('ID фильтра занят или является годом.');
    }
  }
  const validPage = (path: string) => {
    const route = parseUrl(path, '', dict);
    return route.kind === 'ok' && buildPath(route.state) === path;
  };
  if (Object.keys(state.pages).some(path => !validPage(path))) throw new Error('Неизвестный адрес SEO-страницы.');
  if (state.pins.some(p => !all.some(g => g.id === p.gameId) || (p.scope === 'page' && !validPage(p.path)))) {
    throw new Error('Закреплению нужна существующая игра и допустимый адрес.');
  }
  return state;
}

export function copyFor(state: AdminState, path: string, type: PageType) {
  const copy = type === 'main' ? undefined : state.templates[type]?.copy;
  const page = state.pages[path]?.copy;
  return copy || page ? { heading: page?.heading ?? copy?.heading, body: page?.body ?? copy?.body,
    visible: page?.visible ?? copy?.visible, columns: page?.columns ?? copy?.columns } : undefined;
}
