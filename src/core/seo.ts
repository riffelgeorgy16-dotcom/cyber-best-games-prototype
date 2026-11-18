import { CONFIG } from './config';
import { absolute, buildPath, buildUrl } from './route';
import type { CatalogState, Dictionaries, Game, MetaTemplate, PageType } from './types';
import type { PageSlice } from './catalog';

export interface Crumb { name: string; jsonName: string; path: string }

export interface PageSeo {
  pageType: PageType;
  template: { source: 'exact' | 'pattern' | 'fallback'; row?: number };
  title: string;
  description: string;
  h1: string;
  h1Base: string;
  canonical: string;
  robots: string;
  prev?: string;
  next?: string;
  alternateMobile: string;
  mobileCanonical: string;
  indexStatus: 'index' | 'noindex-few' | 'noindex-search' | 'noindex-params' | 'noindex-empty';
  breadcrumbs: Crumb[];
  itemList: object;
  breadcrumbList: object;
  url: string;
}

export function pageType(s: CatalogState): PageType {
  const k = [s.genre && 'genre', s.platform && 'platform', s.year && 'year'].filter(Boolean).join('_');
  return (k || 'main') as PageType;
}

/** Порядок выбора шаблона: индивидуальная строка таблицы -> шаблон с переменными -> резервный */
export function findTemplate(s: CatalogState, d: Dictionaries): { tpl?: MetaTemplate; source: 'exact' | 'pattern' | 'fallback' } {
  const type = pageType(s);
  const segs = [s.genre, s.platform, s.year].filter(Boolean) as string[];
  const cands = d.templates.filter((t) => t.type === type && t.pattern.length === segs.length);
  const exact = cands.find((t) => t.pattern.every((p, i) => p === segs[i]));
  if (exact) return { tpl: exact, source: 'exact' };
  const pat = cands.find((t) =>
    t.pattern.every((p, i) => p === segs[i] || (p === '{P}' && s.platform === segs[i]) || (p === '{Y}' && s.year === segs[i])),
  );
  if (pat) return { tpl: pat, source: 'pattern' };
  return { source: 'fallback' };
}

function fill(text: string, s: CatalogState, d: Dictionaries) {
  const p = s.platform ? d.platforms[s.platform] : undefined;
  return text
    .split('[[платформа]]').join(p ? p.var || p.name : '')
    .split('[[год]]').join(s.year ?? '');
}

function fallbackMeta(s: CatalogState, d: Dictionaries) {
  const g = s.genre ? d.genres[s.genre] : undefined;
  const p = s.platform ? d.platforms[s.platform] : undefined;
  const parts = ['Лучшие игры'];
  if (g) parts.push(`в жанре ${g.name}`);
  if (p) parts.push(`на ${p.var || p.name}`);
  if (s.year) parts.push(`${s.year} года`);
  const h1 = parts.join(' ');
  return {
    title: `${h1} - топ игр, во что поиграть`,
    description: `🔥 ${h1}. ⭐ Самый свежий рейтинг хитов - во что поиграть. 🎮 Обзоры, геймплей, оценки.`,
    h1,
  };
}

export function crumbs(s: CatalogState, d: Dictionaries): Crumb[] {
  const list: Crumb[] = [
    { name: 'Главная', jsonName: 'Главная', path: '/' },
    { name: 'Игры', jsonName: 'Игры', path: '/games/' },
    { name: 'Лучшие', jsonName: 'Лучшие игры всех времен', path: CONFIG.base },
  ];
  const acc: Partial<CatalogState> = {};
  for (const k of CONFIG.segmentOrder) {
    const v = s[k];
    if (!v) continue;
    acc[k] = v;
    const name = k === 'genre' ? d.genres[v].name : k === 'platform' ? d.platforms[v].var || d.platforms[v].name : v;
    list.push({ name, jsonName: name, path: buildPath(acc as CatalogState) });
  }
  return list;
}

export function computeSeo(s: CatalogState, slice: PageSlice, d: Dictionaries): PageSeo {
  const type = pageType(s);
  const found = findTemplate(s, d);
  let base: { title: string; description: string; h1: string };
  if (type === 'main') base = d.main;
  else if (found.tpl) base = { title: fill(found.tpl.title, s, d), description: fill(found.tpl.description, s, d), h1: fill(found.tpl.h1, s, d) };
  else base = fallbackMeta(s, d);

  let { title, description, h1 } = base;
  if (s.page > 1) {
    const tail = ` - Страница ${s.page}`;
    if (type === 'main') {
      // ТЗ: для главной на страницах 2+ заданы отдельные значения
      title = 'Топ игр: во что поиграть, лучшие игры, самые популярные' + tail;
      h1 = 'Лучшие игры' + tail;
    } else {
      title += tail;
      h1 += tail;
    }
    description += tail;
  }

  const total = slice.total;
  let indexStatus: PageSeo['indexStatus'] = 'index';
  if (total === 0) indexStatus = 'noindex-empty';
  else if (s.q) indexStatus = 'noindex-search';
  else if (s.sort || s.rating) indexStatus = 'noindex-params';
  else if (total < CONFIG.minIndexable) indexStatus = 'noindex-few';

  const filterBase = absolute(buildPath(s));
  let canonical =
    CONFIG.canonicalMode === 'filter-base' ? filterBase : absolute(buildUrl({ ...s, q: undefined, sort: undefined, rating: undefined }));
  if (indexStatus === 'noindex-empty') canonical = absolute(CONFIG.base); // ТЗ: пустой результат -> canonical на главную каталога
  const robots = indexStatus === 'index' ? 'index, follow' : 'noindex, follow';

  const prev = s.page > 1 && !slice.outOfRange ? absolute(buildUrl({ ...s, page: s.page - 1 })) : undefined;
  const next = s.page < slice.pages ? absolute(buildUrl({ ...s, page: s.page + 1 })) : undefined;

  const bc = crumbs(s, d);
  const url = absolute(buildUrl(s));
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: base.h1,
    url,
    description,
    numberOfItems: total,
    itemListOrder: ['rating-asc', 'alpha', 'old'].includes(s.sort ?? '') ? 'https://schema.org/ItemListOrderAscending' : 'https://schema.org/ItemListOrderDescending',
    itemListElement: slice.items.map((g: Game, i) => ({
      '@type': 'ListItem',
      position: slice.offset + i + 1,
      name: g.name,
      url: g.url,
    })),
  };
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: bc.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.jsonName, item: absolute(c.path) })),
  };

  return {
    pageType: type,
    template: { source: type === 'main' ? 'exact' : found.source, row: found.tpl?.row },
    title, description, h1, h1Base: base.h1,
    canonical, robots, prev, next,
    alternateMobile: absolute(buildPath(s), CONFIG.mobileHost),
    mobileCanonical: filterBase,
    indexStatus, breadcrumbs: bc, itemList, breadcrumbList, url,
  };
}
