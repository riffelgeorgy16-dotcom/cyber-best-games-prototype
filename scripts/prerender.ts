// Статическая генерация HTML для индексируемых страниц фильтров (первые страницы).
// Имитирует серверный рендеринг: title, description, robots, canonical, prev/next и JSON-LD
// видны в исходном коде страницы (Ctrl+U), а не только после работы скрипта.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultAdmin, effectiveDictionaries, effectiveGames, orderedGames } from '../src/admin/model';
import { readCatalogSnapshot } from './catalog-snapshot';
import { paginate, formatRating } from '../src/core/catalog';
import { catalogEligibleGames } from '../src/core/releases';
import { computeSeo, pageType } from '../src/core/seo';
import { buildPath } from '../src/core/route';
import type { CatalogState } from '../src/core/types';
import { CatalogSections } from '../src/ui/CatalogSections';

const config = readCatalogSnapshot() ?? defaultAdmin;
const D = effectiveDictionaries(config);
const RAW = effectiveGames(config);
const G = catalogEligibleGames(RAW);
const OUT = process.argv[2] || 'dist';
const FORCE_NOINDEX = process.env.VITE_FORCE_NOINDEX === '1';
const tpl = readFileSync(join(OUT, 'index.html'), 'utf8');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeJSON = (value: object) => JSON.stringify(value).replace(/</g, '\\u003c');
const states: CatalogState[] = [{ page: 1 }];
const genres = Object.keys(D.genres), plats = Object.keys(D.platforms), years = D.catalogYears ?? D.filter_lists.years;
genres.forEach((g) => states.push({ page: 1, genre: g }));
plats.forEach((p) => states.push({ page: 1, platform: p }));
years.forEach((y) => states.push({ page: 1, year: y }));
genres.forEach((g) => plats.forEach((p) => states.push({ page: 1, genre: g, platform: p })));
genres.forEach((g) => years.forEach((y) => states.push({ page: 1, genre: g, year: y })));
plats.forEach((p) => years.forEach((y) => states.push({ page: 1, platform: p, year: y })));
genres.forEach((g) => plats.forEach((p) => years.forEach((y) => states.push({ page: 1, genre: g, platform: p, year: y }))));

let n = 0;
for (const entry of states) {
  const s = { ...entry, defaultSort: config.settings.defaultSort };
  const list = orderedGames(G, s, config);
  if (list.length < config.settings.minIndexable) continue; // только индексируемые страницы
  const slice = paginate(list, 1, config.settings.perPage);
  const seo = computeSeo(s, slice, D, { minIndexable: config.settings.minIndexable, page: config.pages[buildPath(s)], template: config.templates[pageType(s) as keyof typeof config.templates] });
  const head = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="robots" content="${FORCE_NOINDEX ? 'noindex, nofollow' : seo.robots}" />`,
    `<meta name="x-prototype-robots" content="${seo.robots}" />`,
    `<link rel="canonical" href="${seo.canonical}" />`,
    seo.next ? `<link rel="next" href="${seo.next}" />` : '',
    `<script type="application/ld+json" id="ld-itemlist">${safeJSON(seo.itemList)}</script>`,
    `<script type="application/ld+json" id="ld-breadcrumbs">${safeJSON(seo.breadcrumbList)}</script>`,
  ].filter(Boolean).join('\n  ');
  const sections = renderToStaticMarkup(createElement(CatalogSections, { config, state: s, games: RAW, dict: D }));
  const body =
    `<div id="root"><h1>${esc(seo.h1)}</h1><ol>` +
    slice.items.map((g) => {
      const name = esc(g.name);
      const title = g.url ? `<a href="${esc(g.url)}">${name}</a>` : name;
      const score = g.rating ? ` ${formatRating(g.rating.value)}` : '';
      return `<li>${title}${score}</li>`;
    }).join('') +
    `</ol>${sections}</div>`;
  const html = tpl
    .replace(/<title>.*?<\/title>/s, () => head)
    .replace(/<meta name="robots"[^>]*>\s*/, '')
    .replace('<div id="root"></div>', () => body);
  const file = join(OUT, buildPath(s), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  n++;
}
console.log(`prerender: ${n} страниц в ${OUT}`);
