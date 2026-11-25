import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CatalogSections } from '../src/ui/CatalogSections';
import { CatalogEditorial } from '../src/ui/CatalogEditorial';
import { catalogEligibleGames, selectReleaseBlocks } from '../src/core/releases';
import { paginate } from '../src/core/catalog';
import { computeSeo } from '../src/core/seo';
import { buildUrl, classifySegment, parseUrl } from '../src/core/route';
import { defaultAdmin, effectiveDictionaries, orderedGames, originalChoices, parseAdmin } from '../src/admin/model';
import { previewSheet } from '../src/admin/sheets';
import type { Game } from '../src/core/types';

const sample = (id: string, score = 8, mutation: Partial<Game> = {}): Game => ({
  id, name: id, platforms: ['pc'], genres: ['ekshen-igry'], subscribers: 0,
  releaseDate: '2026-11-20', datePrecision: 'day', year: 2026, wikidata: '', sources: {},
  rating: { source: 'IGN', original: score + '/10', value: score }, ...mutation,
});
const today = '2026-11-25';

describe('администрирование каталога', () => {
  it('применяет приоритет только после оценки и закрепляет только допустимые игры', () => {
    const a = sample('a', 9), b = sample('b', 8), c = sample('c', 9, { priority: 5 });
    const blocked = sample('blocked', 10, { status: 'upcoming' });
    const untallied = sample('unrated', 7, { rating: undefined });
    const pin = { id: 'p', gameId: 'b', position: 1, active: true, scope: 'page' as const,
      path: '/games/best/pc/', start: '', end: '2026-11-26' };
    const state = { ...defaultAdmin, pins: [pin, { ...pin, id: 'blocked', gameId: 'blocked' }] };
    const source = [a, b, c, blocked, untallied, sample('excluded', 8, { excluded: true })];
    const games = catalogEligibleGames(source, today);
    expect(games.map(g => g.id)).toEqual(['a', 'b', 'c']);
    expect(orderedGames(games, { page: 1, platform: 'pc' }, state, today).map(g => g.id)).toEqual(['b', 'c', 'a']);
    expect(orderedGames(games, { page: 1, platform: 'pc' }, state, '2026-11-27').map(g => g.id)).toEqual(['c', 'a', 'b']);
    expect(orderedGames(games, { page: 1, platform: 'pc', sort: 'alpha' }, state, today).map(g => g.id)).toEqual(['a', 'b', 'c']);
    expect(orderedGames(games, { page: 1 }, state, today).map(g => g.id)).toEqual(['c', 'a', 'b']);
  });

  it('берёт редакционные статусы и учитывает закрепление только среди подходящих релизов', () => {
    const a = sample('a', 8, { status: 'released', rating: undefined });
    const b = sample('b', 8, { status: 'upcoming', releaseDate: '2026-12-02' });
    const c = sample('c', 8, { status: 'unconfirmed' });
    const hidden = sample('hidden', 8, { status: 'released', excluded: true });
    const games = [a, b, c, hidden];
    const blocks = selectReleaseBlocks(games, [], { page: 3, platform: 'pc', sort: 'old' }, today,
      { recentPins: ['hidden', 'a'], upcomingPins: ['a', 'b'], days: 30 });
    expect(blocks.recent.map(g => g.id)).toEqual(['a']);
    expect(blocks.upcoming.map(g => g.id)).toEqual(['b']);
    expect(selectReleaseBlocks(games, [], { page: 1, rating: '8-10' }, today).recent).toEqual([]);
  });

  it('скрывает фильтр в списке без потери URL и защищает правила индексации', () => {
    const state = parseAdmin({ ...defaultAdmin,
      filters: { years: originalChoices('years').map(v => v.id === '2026' ? { ...v, visible: false } : v) },
      settings: { ...defaultAdmin.settings, perPage: 2, minIndexable: 4 },
    });
    const dict = effectiveDictionaries(state);
    expect(dict.filter_lists.years).not.toContain('2026');
    expect(classifySegment('2026', dict)).toBe('year');
    const slice = paginate([sample('a'), sample('b'), sample('c')], 2, state.settings.perPage);
    const seo = computeSeo({ page: 2, platform: 'pc' }, slice, dict, { minIndexable: 4,
      page: { title: 'Индивидуальный' }, template: { title: 'Шаблон', h1: 'Игры на [[платформа]]' } });
    expect(seo).toMatchObject({ title: 'Индивидуальный - Страница 2', robots: 'noindex, follow', indexStatus: 'noindex-few' });
    expect(seo.itemList).toMatchObject({ numberOfItems: 3, itemListElement: [{ position: 3, name: 'c' }] });
    expect(() => parseAdmin({ ...state, settings: { ...state.settings, minIndexable: 1 } })).toThrow();
  });

  it('применяет изменённую сортировку по умолчанию, сохраняя явный выбор в URL', () => {
    const config = { ...defaultAdmin, settings: { ...defaultAdmin.settings, defaultSort: 'alpha' as const } };
    const dict = effectiveDictionaries(config);
    const route = parseUrl('/games/best/', '?sort=rating-desc', dict);
    expect(route.kind).toBe('ok');
    if (route.kind !== 'ok') return;
    expect(buildUrl(route.state)).toBe('/games/best/?sort=rating-desc');
    const games = [sample('z', 9), sample('a', 8)];
    expect(orderedGames(games, { page: 1 }, config).map(g => g.id)).toEqual(['a', 'z']);
    expect(orderedGames(games, route.state, config).map(g => g.id)).toEqual(['z', 'a']);
  });

  it('проверяет предпросмотр импорта, сохраняет поля при пустых ячейках и замечает дубли', () => {
    const original = sample('original', 7, { description: 'сохранить', wikidata: 'Q7' });
    const data = { headers: ['id', 'name', 'description', 'rating', 'wikidata'],
      rows: [{ line: 2, cells: ['original', '', '', '9', ''] }, { line: 3, cells: ['copy', 'Клон', '', '8', 'Q7'] },
        { line: 4, cells: ['original', 'Повтор', '', '12', ''] }] };
    const mapping = { id: 0, name: 1, description: 2, rating: 3, wikidata: 4 };
    const dict = effectiveDictionaries(defaultAdmin);
    const rows = previewSheet(data, mapping, [original], dict, false);
    expect(rows[0]).toMatchObject({ action: 'update', errors: [], game: { description: 'сохранить', rating: { value: 9, source: 'Редакция' } } });
    expect(rows[1].errors).not.toHaveLength(0);
    expect(rows[2].errors).not.toHaveLength(0);
    expect(original.rating?.value).toBe(7);
    const clearing = previewSheet(data, { id: 0, description: 2 }, [original], dict, true);
    expect(clearing[0].game?.description).toBe('');
  });

  it('применяет ручной состав, ограничения и порядок блоков при рендеринге', () => {
    const config = { ...defaultAdmin,
      blockOrder: [...defaultAdmin.blockOrder].reverse(),
      blocks: { ...defaultAdmin.blocks,
        recent: { ...defaultAdmin.blocks.recent, visible: false },
        news: { ...defaultAdmin.blocks.news, title: 'Ручная лента', mode: 'manual' as const, limit: 1,
          picks: ['https://example.org/b'], stories: [{ title: 'Обычная новость', url: 'https://example.org/a' },
            { title: 'Закреплённая новость', url: 'https://example.org/b' }] },
      },
    };
    const markup = renderToStaticMarkup(createElement(CatalogSections, { config, dict: effectiveDictionaries(config), state: { page: 1 }, games: [] }));
    expect(markup).toContain('Закреплённая новость');
    expect(markup).not.toContain('Обычная новость');
    expect(markup).not.toContain('Недавно вышли');
    expect(markup.indexOf('О каталоге')).toBeLessThan(markup.indexOf('Ручная лента'));
  });

  it('экранирует HTML и сохраняет безопасное форматирование SEO-текста', () => {
    const page = renderToStaticMarkup(createElement(CatalogEditorial, { heading: 'Текст', paragraphs: [],
      markdown: '**Важно** [безопасная](https://example.org/) [опасная](javascript:doStuff) <script>bad()</script>' }));
    expect(page).toContain('<strong>Важно</strong>');
    expect(page).toContain('href="https://example.org/"');
    expect(page).toContain('&lt;script&gt;');
    expect(page).not.toContain('href="javascript:');
  });
});
