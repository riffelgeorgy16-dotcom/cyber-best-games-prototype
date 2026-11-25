import { useState } from 'react';
import { paginate } from '../core/catalog';
import { CONFIG } from '../core/config';
import { buildPath } from '../core/route';
import { catalogEditorial } from '../core/editorial';
import { computeSeo, pageType } from '../core/seo';
import type { CatalogState, Dictionaries } from '../core/types';
import { CatalogEditorial } from '../ui/CatalogEditorial';
import { availableGames, copyFor, orderedGames, pageTypes, type AdminState, type SeoEntry } from './model';
import { Choice, Field, Input, PagePicker, Toggle } from './fields';

export const pageNames = { genre: 'Жанр', platform: 'Платформа', year: 'Год', genre_platform: 'Жанр и платформа',
  genre_year: 'Жанр и год', platform_year: 'Платформа и год', genre_platform_year: 'Жанр, платформа и год' };

export function Editorial({ draft, dict, change, onlyText = false }: {
  draft: AdminState; dict: Dictionaries; change: (next: AdminState) => void; onlyText?: boolean;
}) {
  const [mode, select] = useState('main');
  const [page, choose] = useState<CatalogState>({ page: 1 });
  const [type, setType] = useState<typeof pageTypes[number]>('genre');
  const address: CatalogState = mode === 'main' ? { page: 1 } : mode === 'page' ? page : {
    page: 1, genre: type.includes('genre') ? Object.keys(dict.genres)[0] : undefined,
    platform: type.includes('platform') ? Object.keys(dict.platforms)[0] : undefined,
    year: type.includes('year') ? (dict.catalogYears ?? dict.filter_lists.years)[0] : undefined,
  };
  const example = { ...address, defaultSort: draft.settings.defaultSort };
  const path = buildPath(example);
  const entry = (mode === 'template' ? draft.templates[type] : draft.pages[path]) ?? {};
  const set = (next: SeoEntry) => {
    if (mode === 'template') change({ ...draft, templates: { ...draft.templates, [type]: next } });
    else change({ ...draft, pages: { ...draft.pages, [path]: next } });
  };
  const template = draft.templates[pageType(example) as typeof type];
  const slice = paginate(orderedGames(availableGames(draft), example, draft), 1, draft.settings.perPage);
  const preview = computeSeo(example, slice, dict, { minIndexable: draft.settings.minIndexable, page: draft.pages[path], template });
  const effective = copyFor(draft, path, pageType(example));
  const copy = catalogEditorial(example, effective, dict);
  const changeCopy = (patch: Partial<NonNullable<SeoEntry['copy']>>) =>
    set({ ...entry, copy: { ...entry.copy, ...patch } });
  return <div className="adm-form">
    <h2>{onlyText ? 'SEO-тексты' : 'SEO'}</h2>
    <div className="adm-row">
      <Choice label="Уровень SEO" value={mode} change={select}
        options={[{ id: 'main', label: 'Главная каталога' }, { id: 'page', label: 'Конкретная страница' },
          ...(!onlyText ? [{ id: 'template', label: 'Шаблон страниц' }] : [])]} />
      {mode === 'template' && <Choice label="Тип шаблона" value={type} change={v => setType(v as typeof type)}
        options={pageTypes.map(id => ({ id, label: pageNames[id] }))} />}
    </div>
    {mode === 'page' && <PagePicker dict={dict} page={page} change={choose} />}
    {mode === 'template' && <p className="adm-note">Переменные: [[жанр]], [[платформа]], [[год]]. Для предпросмотра выбрана страница {path}.</p>}
    {!onlyText && <>
      {(['h1', 'title', 'description'] as const).map(field => <div key={field}>
        <Field label={field === 'h1' ? 'H1' : field === 'title' ? 'Title' : 'Description'}>
          <textarea rows={field === 'description' ? 3 : 1} value={entry[field] ?? ''} placeholder={preview[field]}
            onChange={e => set({ ...entry, [field]: e.target.value || undefined })} />
        </Field>
        {field !== 'h1' && <small>{(entry[field] ?? preview[field]).length} симв.</small>}
        <button type="button" disabled={entry[field] === undefined} onClick={() => set({ ...entry, [field]: undefined })}>Сбросить {field}</button>
      </div>)}
      <dl className="adm-preview">
        <dt>Итоговый URL</dt><dd>{preview.url}</dd>
        <dt>Canonical</dt><dd>{preview.canonical}</dd><dt>Robots</dt><dd>{preview.robots}</dd>
        <dt>H1</dt><dd>{preview.h1}</dd><dt>Title</dt><dd>{preview.title}</dd><dt>Description</dt><dd>{preview.description}</dd>
      </dl>
    </>}
    <Input label="Заголовок SEO-текста" value={entry.copy?.heading} change={heading => changeCopy({ heading: heading || undefined })} />
    <Field label="SEO-текст"><textarea rows={9} value={entry.copy?.body ?? ''}
      placeholder={copy?.paragraphs.join('\n\n')} onChange={e => changeCopy({ body: e.target.value || undefined })} /></Field>
    <small>Пустая строка отделяет абзацы. ## Подзаголовок, **жирный**, *курсив*, [ссылка](https://…), - элемент списка.</small>
    <div className="adm-actions">
      <Toggle label="Показывать SEO-текст" checked={entry.copy?.visible ?? effective?.visible ?? true} change={visible => changeCopy({ visible })} />
      <Choice label="Количество колонок" value={String(entry.copy?.columns ?? effective?.columns ?? 3)}
        change={v => changeCopy({ columns: +v })} options={[1, 2, 3].map(n => ({ id: String(n), label: String(n) }))} />
      <button type="button" disabled={!entry.copy} onClick={() => set({ ...entry, copy: undefined })}>Сбросить SEO-текст</button>
    </div>
    {copy && <CatalogEditorial {...copy} />}
    {path !== CONFIG.base && <small>{path}</small>}
  </div>;
}
