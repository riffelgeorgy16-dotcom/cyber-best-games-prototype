import { CONFIG } from './config';
import { absolute, buildPath, buildUrl, classifySegment } from './route';
import type { CatalogState, Dictionaries, Issue } from './types';
import type { PageSlice } from './catalog';
import type { PageSeo } from './seo';

/**
 * Независимая проверка сформированной страницы по правилам ТЗ.
 * error - нарушение правил ТЗ, warning - спорное место или пробел ТЗ, limitation - ограничение прототипа.
 */
export function validate(
  currentPath: string,
  currentSearch: string,
  s: CatalogState,
  slice: PageSlice,
  seo: PageSeo,
  renderedCount: number,
  d: Dictionaries,
  settings: { perPage: number; minIndexable: number } = CONFIG,
): Issue[] {
  const out: Issue[] = [];
  const err = (code: string, what: string, expected?: string, actual?: string) => out.push({ level: 'error', code, what, expected, actual });
  const warn = (code: string, what: string, expected?: string, actual?: string) => out.push({ level: 'warning', code, what, expected, actual });

  // 1. URL соответствует выбранным фильтрам
  const expectedUrl = buildUrl(s);
  const actualUrl = currentPath + (currentSearch && currentSearch !== '?' ? currentSearch : '');
  if (expectedUrl !== actualUrl) err('url-mismatch', 'URL не соответствует выбранным фильтрам', expectedUrl, actualUrl);

  // 2. Порядок сегментов
  const kinds = currentPath.slice(CONFIG.base.length).split('/').filter(Boolean).map((x) => classifySegment(x, d));
  const order = CONFIG.segmentOrder as readonly string[];
  const idx = kinds.map((k) => order.indexOf(k ?? ''));
  if (idx.some((v, i) => i > 0 && v <= idx[i - 1])) err('segment-order', 'Неправильный порядок сегментов URL', 'жанр / платформа / год', kinds.join(' / '));

  // 3. Незаполненные переменные шаблона
  for (const [k, v] of [['Title', seo.title], ['Description', seo.description], ['H1', seo.h1]] as const) {
    if (/\[\[|\]\]/.test(v)) err('tpl-var', `${k}: осталась незамененная переменная шаблона`, 'значение без [[...]]', v);
    if (/\s{2,}|\s$/.test(v.replace(/\n/g, ''))) warn('tpl-space', `${k}: двойной пробел или пробел в конце`, undefined, JSON.stringify(v));
  }
  // 4. Хвост пагинации
  if (s.page > 1) {
    const tail = ` - Страница ${s.page}`;
    for (const [k, v] of [['Title', seo.title], ['Description', seo.description], ['H1', seo.h1]] as const)
      if (!v.endsWith(tail)) err('page-tail', `${k}: нет хвоста с номером страницы`, `...${tail}`, v);
  }
  // 5. Шаблон
  if (seo.template.source === 'fallback')
    warn('tpl-missing', 'В таблице мета нет шаблона для этой комбинации, использован резервный текст прототипа', 'строка в таблице мета', 'резервный шаблон');
  if (s.year && !d.years[s.year] && seo.pageType === 'year')
    warn('year-missing', `Года ${s.year} нет в таблице мета (есть в списке фильтров)`, 'строка в таблице мета', 'резервный шаблон');
  if (/—/.test(seo.title + seo.description))
    warn('em-dash', 'В тексте из таблицы мета есть длинное тире, по редполитике Кибера нужен дефис', '-', '—');

  // 6. Canonical
  const filterBase = absolute(buildPath(s));
  const expCanon =
    seo.indexStatus === 'noindex-empty'
      ? absolute(CONFIG.base)
      : CONFIG.canonicalMode === 'filter-base'
        ? filterBase
        : absolute(buildUrl({ ...s, q: undefined, sort: undefined, rating: undefined }));
  if (seo.canonical !== expCanon) err('canonical', 'Ошибка canonical', expCanon, seo.canonical);
  if (CONFIG.canonicalMode === 'filter-base' && /[?&]page=/.test(seo.canonical)) err('canonical-page', 'Canonical содержит page', 'без ?page', seo.canonical);

  // 7. Robots по правилу существования страницы
  const expRobots = slice.total >= settings.minIndexable && !s.q && !s.sort && !s.rating ? 'index, follow' : 'noindex, follow';
  if (seo.robots !== expRobots)
    err('robots', 'Нарушено правило индексации (минимум 3 игры; поиск, сортировка и фильтр оценки не индексируются)', expRobots, seo.robots);
  if (/[?&](sort|rating|q)=/.test(seo.canonical)) err('canonical-params', 'Canonical содержит параметры сортировки, оценки или поиска', 'без GET-параметров', seo.canonical);

  // 8. Prev / Next
  const expPrev = s.page > 1 ? absolute(buildUrl({ ...s, page: s.page - 1 })) : undefined;
  const expNext = s.page < slice.pages ? absolute(buildUrl({ ...s, page: s.page + 1 })) : undefined;
  if (seo.prev !== expPrev) err('prev', 'Ошибка rel="prev"', expPrev ?? 'нет', seo.prev ?? 'нет');
  if (seo.next !== expNext) err('next', 'Ошибка rel="next"', expNext ?? 'нет', seo.next ?? 'нет');
  for (const l of [seo.prev, seo.next].filter(Boolean) as string[])
    if (!l.startsWith(filterBase)) err('page-filters-lost', 'Потеря фильтров при пагинации', filterBase + '...', l);

  // 9. Количество игр
  const expCount = Math.max(0, Math.min(settings.perPage, slice.total - slice.offset));
  if (renderedCount !== expCount) err('count', 'Ошибка количества карточек на странице', String(expCount), String(renderedCount));
  const il = seo.itemList as { numberOfItems: number; itemListElement: { position: number; name: string; url?: string }[]; url: string; description: string };
  if (il.numberOfItems !== slice.total) err('itemlist-total', 'ItemList.numberOfItems должен равняться числу игр в категории', String(slice.total), String(il.numberOfItems));
  if (il.itemListElement.length !== renderedCount) err('itemlist-count', 'В ItemList не те игры, что показаны на странице', String(renderedCount), String(il.itemListElement.length));
  il.itemListElement.forEach((e, i) => {
    const exp = slice.offset + i + 1;
    if (e.position !== exp) err('itemlist-pos', `Неверная позиция ListItem #${i + 1}`, String(exp), String(e.position));
    const g = slice.items[i];
    if (g && (e.name !== g.name || e.url !== g.url)) err('itemlist-item', `ListItem #${i + 1} не совпадает с карточкой`, g.name, e.name);
  });
  if (il.description !== seo.description) err('itemlist-desc', 'ItemList.description не совпадает с description страницы', seo.description, il.description);

  // 10. Хлебные крошки
  const bl = seo.breadcrumbList as { itemListElement: { position: number; name: string; item: string }[] };
  const segs = currentPath.slice(CONFIG.base.length).split('/').filter(Boolean);
  if (bl.itemListElement.length !== 3 + segs.length) err('bc-count', 'Число позиций в хлебных крошках не равно 3 + число сегментов URL', String(3 + segs.length), String(bl.itemListElement.length));
  bl.itemListElement.forEach((e, i) => {
    if (e.position !== i + 1) err('bc-pos', 'Неверная позиция в BreadcrumbList', String(i + 1), String(e.position));
    if (i >= 3) {
      const exp = absolute(CONFIG.base + segs.slice(0, i - 2).join('/') + '/');
      if (e.item !== exp) err('bc-url', `Крошка ${i + 1}: URL не соответствует структуре адреса`, exp, e.item);
    }
  });

  // 11. JSON-LD синтаксис
  for (const [k, v] of [['ItemList', seo.itemList], ['BreadcrumbList', seo.breadcrumbList]] as const) {
    try { JSON.parse(JSON.stringify(v)); } catch { err('jsonld', `${k}: некорректный JSON`); }
  }

  // Ограничения прототипа
  out.push({ level: 'limitation', code: 'csr', what: 'Метатеги и JSON-LD меняются в браузере. Поисковик увидит их только при серверной генерации HTML (требование ТЗ к серверу)' });
  out.push({ level: 'limitation', code: 'status', what: 'HTTP-коды (200, 301, 404) только имитируются: статический хостинг отдает их иначе' });
  if (seo.indexStatus === 'noindex-few')
    out.push({ level: 'info', code: 'few', what: `Найдено ${slice.total} игр (меньше ${settings.minIndexable}): страница показывается, но закрыта noindex (решение п.4)` });
  return out;
}
