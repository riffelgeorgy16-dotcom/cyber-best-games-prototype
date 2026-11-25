import { useState } from 'react';
import { CONFIG } from '../core/config';
import { buildPath, parseUrl } from '../core/route';
import { sortGames } from '../core/catalog';
import type { CatalogState, Dictionaries, Game } from '../core/types';
import { blockKeys, blockTitles, media, originalChoices, type AdminState, type BlockKey, type FilterKind, type Pin, type Story } from './model';
import { Choice, Field, GameChoices, Input, Move, PagePicker, Toggle, move } from './fields';

type Change = (state: AdminState) => void;

export function FilterEditor({ draft, change }: { draft: AdminState; change: Change }) {
  const [kind, select] = useState<FilterKind>('platforms');
  const [newId, setId] = useState('');
  const [newLabel, setLabel] = useState('');
  const [error, setError] = useState('');
  const entries = draft.filters[kind] ?? originalChoices(kind);
  const setList = (values: typeof entries) => change({ ...draft, filters: { ...draft.filters, [kind]: values } });
  const update = (index: number, patch: Partial<typeof entries[number]>) =>
    setList(entries.map((row, i) => i === index ? { ...row, ...patch } : row));
  const create = () => {
    const id = newId.trim();
    const label = newLabel.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || /^\d{4}$/.test(id) || !label ||
      (['genres', 'platforms'] as const).some(k => (draft.filters[k] ?? originalChoices(k)).some(v => v.id === id))) {
      setError('Укажите свободный ID из латинских букв, цифр и дефисов и название.');
      return;
    }
    setList([...entries, { id, label, visible: true }]);
    setId(''); setLabel(''); setError('');
  };
  return <div className="adm-form">
    <h2>Фильтры</h2>
    <div className="adm-row"><Choice label="Справочник" value={kind}
      change={v => { select(v as FilterKind); setError(''); }}
      options={[{ id: 'platforms', label: 'Платформы' }, { id: 'genres', label: 'Жанры' },
        { id: 'years', label: 'Годы' }, { id: 'rating', label: 'Оценки' }]} />
      <button onClick={() => {
        const source = originalChoices(kind);
        setList([...source.map(original => entries.find(v => v.id === original.id) ?? original), ...entries.filter(v => !source.some(s => s.id === v.id))]);
      }}>Восстановить исходный порядок</button>
    </div>
    <p className="adm-note">ID определяет адрес. Скрытие значения действует в списке фильтра. Числовые границы баллов фиксированы.</p>
    <div className="adm-table"><table><thead><tr><th>ID</th><th>Название</th><th>Видимость</th><th>Порядок</th></tr></thead>
      <tbody>{entries.map((entry, i) => <tr key={entry.id}><td>{entry.id}</td>
        <td><Input label="Название" value={entry.label} change={label => update(i, { label })} /></td>
        <td><Toggle label="Показывать" checked={entry.visible} change={visible => update(i, { visible })} /></td>
        <td><Move index={i} count={entries.length} change={to => setList(move(entries, i, to))} /></td></tr>)}</tbody></table></div>
    {(kind === 'genres' || kind === 'platforms') && <div className="adm-row"><Input label="Новый ID" value={newId} change={setId} />
      <Input label="Новое название" value={newLabel} change={setLabel} /><button className="adm-extra" onClick={create}>Добавить значение</button></div>}
    {error && <p role="alert" className="adm-error">{error}</p>}
  </div>;
}

export function GameOrder({ draft, games, dict, change, apply }: {
  draft: AdminState; games: Game[]; dict: Dictionaries; change: Change; apply: (game: Game) => void;
}) {
  const [selected, select] = useState('');
  const [pin, setPin] = useState<Pin>({ id: '', gameId: '', position: 1, scope: 'main', path: CONFIG.base, active: true, start: '', end: '' });
  const game = games.find(g => g.id === selected);
  const pinRoute = parseUrl(pin.path, '', dict);
  const route: CatalogState = pinRoute.kind === 'ok' ? pinRoute.state : { page: 1 };
  const same = game?.rating ? sortGames(games.filter(g => g.rating?.value === game.rating?.value)) : [];
  const update = (patch: Partial<Pin>) => setPin({ ...pin, ...patch });
  return <div className="adm-form">
    <h2>Приоритет при одинаковой оценке</h2>
    <GameChoices games={games} value={selected} change={select} searchLabel="Поиск игры для приоритета" />
    {game && <>
      <Input label="Приоритет" type="number" value={game.priority ?? 0} change={v => apply({ ...game, priority: +v })} />
      <p>{same.length} игр с такой оценкой. Текущая позиция в группе: {same.findIndex(g => g.id === game.id) + 1 || '—'}.</p>
      <div className="adm-actions">
        <button disabled={!same.length || same[0] === game} onClick={() => apply({ ...game, priority: Math.max(...same.map(g => g.priority ?? 0)) + 1 })}>В начало группы</button>
        <button disabled={!same.length || same[same.length - 1] === game} onClick={() => apply({ ...game, priority: Math.min(...same.map(g => g.priority ?? 0)) - 1 })}>В конец группы</button>
      </div>
    </>}
    <h2>Временные закрепления</h2>
    <p className="adm-note">Закрепление применяется при сортировке «Высокая оценка», если игра соответствует фильтрам и допуску в каталог.</p>
    <div className="adm-table"><table><thead><tr><th>Игра</th><th>Позиция</th><th>Область</th><th>Период</th><th>Активно</th><th /></tr></thead>
      <tbody>{draft.pins.map(p => <tr key={p.id}><td>{games.find(g => g.id === p.gameId)?.name ?? p.gameId}</td><td>{p.position}</td>
        <td>{p.scope === 'all' ? 'Все подходящие' : p.scope === 'main' ? 'Главная' : p.path}</td>
        <td>{p.start || '—'} → {p.end || '—'}</td><td>{p.active ? 'Да' : 'Нет'}</td><td className="adm-actions">
          <button onClick={() => setPin(p)}>Редактировать</button>
          <button className="adm-danger" onClick={() => { if (confirm('Удалить закрепление?')) change({ ...draft, pins: draft.pins.filter(v => v.id !== p.id) }); }}>Удалить</button>
        </td></tr>)}</tbody></table></div>
    <GameChoices games={games} value={pin.gameId} change={gameId => update({ gameId })} searchLabel="Поиск игры для закрепления" />
    <div className="adm-row">
      <Input label="Позиция" type="number" value={pin.position} change={v => update({ position: +v })} />
      <Input label="Начало" type="date" value={pin.start} change={start => update({ start })} />
      <Input label="Окончание" type="date" value={pin.end} change={end => update({ end })} />
      <Choice label="Область закрепления" value={pin.scope} change={v => update({ scope: v as Pin['scope'] })}
        options={[{ id: 'main', label: 'Главная' }, { id: 'page', label: 'Конкретная страница' }, { id: 'all', label: 'Все подходящие' }]} />
      <Toggle label="Активно" checked={pin.active} change={active => update({ active })} />
    </div>
    {pin.scope === 'page' && <PagePicker page={route} dict={dict} change={v => update({ path: buildPath(v) })} />}
    <button className="adm-extra" disabled={!pin.gameId || !Number.isInteger(pin.position) || pin.position < 1 || pin.position > 200 || !!(pin.start && pin.end && pin.start > pin.end)}
      onClick={() => {
        const next = { ...pin, id: pin.id || crypto.randomUUID() };
        change({ ...draft, pins: pin.id ? draft.pins.map(p => p.id === pin.id ? next : p) : [...draft.pins, next] });
        setPin({ ...pin, id: '', gameId: '' });
      }}>{pin.id ? 'Применить закрепление' : 'Добавить закрепление'}</button>
  </div>;
}

export function StoryList({ items, change, kind }: { items: Story[]; change: (v: Story[]) => void; kind: 'upper' | 'lower' | 'news' }) {
  const update = (index: number, patch: Partial<Story>) => change(items.map((item, i) => i === index ? { ...item, ...patch } : item));
  return <>
    {items.map((item, i) => <details className="adm-story" key={i}>
      <summary>{item.title || 'Новый материал'}</summary>
      <Input label="Заголовок материала" value={item.title} change={title => update(i, { title })} />
      <Input label="Ссылка" type="url" value={item.url} change={url => update(i, { url })} />
      {kind === 'upper' && <Input label="Название плашки" value={item.label} change={label => update(i, { label })} />}
      {kind === 'lower' && <><Input label="Название блога" value={item.blog} change={blog => update(i, { blog })} />
        <Input label="URL обложки материала" value={item.image} change={image => update(i, { image })} /></>}
      {kind === 'news' && <Input label="Подпись даты" value={item.date} change={date => update(i, { date })} />}
      <div className="adm-row"><Input label="Начало публикации" type="date" value={item.start} change={start => update(i, { start })} />
        <Input label="Окончание публикации" type="date" value={item.end} change={end => update(i, { end })} />
        <Toggle label="Показывать" checked={item.visible !== false} change={visible => update(i, { visible })} />
      </div>
      <div className="adm-actions"><Move index={i} count={items.length} change={to => change(move(items, i, to))} />
        <button className="adm-danger" onClick={() => { if (confirm('Удалить материал из списка?')) change(items.filter((_, n) => i !== n)); }}>Удалить</button></div>
    </details>)}
    <button className="adm-extra" onClick={() => change([...items, { title: '', url: '', visible: true }])}>Добавить материал</button>
  </>;
}

export function CollectionsEditor({ draft, change }: { draft: AdminState; change: Change }) {
  const [kind, set] = useState<'upper' | 'lower'>('upper');
  return <div className="adm-form"><h2>Подборки</h2>
    <Choice label="Тип подборок" value={kind} change={v => set(v as typeof kind)}
      options={[{ id: 'upper', label: 'Верхние плашки' }, { id: 'lower', label: 'Нижние материалы' }]} />
    <StoryList key={kind} items={draft[kind]} change={v => change({ ...draft, [kind]: v })} kind={kind} />
  </div>;
}

export function Blocks({ draft, games, change }: { draft: AdminState; games: Game[]; change: Change }) {
  const [key, select] = useState<BlockKey>('recent');
  const [pick, setPick] = useState('');
  const block = draft.blocks[key];
  const update = (patch: Partial<typeof block>) => change({ ...draft, blocks: { ...draft.blocks, [key]: { ...block, ...patch } } });
  const index = draft.blockOrder.indexOf(key);
  const isRelease = key === 'recent' || key === 'upcoming';
  const isMedia = key === 'news' || key === 'blogs';
  const options = isMedia ? (block.mode === 'manual' ? block.stories ?? [] : media[key]).filter(v => v.url).map(v => ({ id: v.url, label: v.title })) :
    games.map(g => ({ id: g.id, label: g.name })).sort((a, b) => a.label.localeCompare(b.label));
  return <div className="adm-form">
    <h2>Блоки страницы</h2>
    <ol>{draft.blockOrder.map(id => <li key={id}>{draft.blocks[id].title}{!draft.blocks[id].visible && ' (скрыт)'}</li>)}</ol>
    <div className="adm-row"><Choice label="Блок" value={key} change={v => { select(v as BlockKey); setPick(''); }}
      options={blockKeys.map(id => ({ id, label: blockTitles[id] }))} />
      <Move index={index} count={blockKeys.length} change={to => change({ ...draft, blockOrder: move(draft.blockOrder, index, to) })} /></div>
    <div className="adm-row">
      <Input label="Заголовок блока" value={block.title} change={title => update({ title })} />
      <Input label="Количество элементов" type="number" value={block.limit} change={v => update({ limit: +v })} />
      <Toggle label="Показывать блок" checked={block.visible} change={visible => update({ visible })} />
    </div>
    {key === 'recent' && <Input label="Период недавних релизов, дней" type="number" value={draft.settings.recentDays}
      change={v => change({ ...draft, settings: { ...draft.settings, recentDays: +v } })} />}
    {isMedia && <>
      <Choice label="Режим наполнения" value={block.mode} change={v => update({ mode: v as typeof block.mode })}
        options={[{ id: 'auto', label: 'Из локального снимка ленты' }, { id: 'manual', label: 'Ручной' }]} />
      {block.mode === 'manual' && <><button className="adm-extra" onClick={() => update({ stories: [...(block.stories ?? []), ...media[key].filter(v => !block.stories?.some(s => s.url === v.url))] })}>Добавить материалы из снимка</button>
        <StoryList items={block.stories ?? []} change={stories => update({ stories })} kind={key === 'news' ? 'news' : 'lower'} /></>}
    </>}
    {(isMedia || isRelease) && <>
      <h3>{key === 'blogs' ? 'Главный материал (первый) и дополнительные' : 'Закреплённые записи'}</h3>
      {isRelease && <p className="adm-note">Лента заполняется автоматически. В закреплении отображаются игры, подходящие по дате, статусу и фильтрам.</p>}
      <div className="adm-row"><Choice label="Запись для закрепления" value={pick} empty="Выберите запись" options={options} change={setPick} />
        <button disabled={!pick || block.picks.includes(pick)} onClick={() => { update({ picks: [...block.picks, pick] }); setPick(''); }}>Закрепить в блоке</button></div>
      <ol>{block.picks.map((id, i) => <li key={id}>{options.find(o => o.id === id)?.label ?? id}{' '}
        <Move index={i} count={block.picks.length} change={to => update({ picks: move(block.picks, i, to) })} />
        <button className="adm-danger" onClick={() => update({ picks: block.picks.filter(v => v !== id) })}>Убрать закрепление</button></li>)}</ol>
    </>}
    {key === 'editorial' && <Field label="Редактирование"><span>Содержание и колонки настраиваются во вкладке «SEO-тексты».</span></Field>}
  </div>;
}
