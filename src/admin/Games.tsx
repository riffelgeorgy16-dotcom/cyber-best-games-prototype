import { useState } from 'react';
import localTagsRaw from '../../data-pipeline/raw/tags_all.txt?raw';
import { matchesName, normalize } from '../core/catalog';
import { catalogEligibleGames } from '../core/releases';
import type { Dictionaries, Game } from '../core/types';
import { gameStatus, statusLabels, statuses, validateGame } from './model';
import { Choice, Field, ImageField, Input, Toggle, dictionaryOptions } from './fields';

export const statusOptions = statuses.map(id => ({ id, label: statusLabels[id] }));
export const missing = (g: Game) => !g.releaseDate || !g.platforms.length || !g.genres.length;
const emptyGame: Game = { id: '', name: '', subscribers: 0, year: 0, releaseDate: '', datePrecision: 'day',
  genres: [], platforms: [], status: 'unconfirmed', wikidata: '', sources: { record: 'Ручной ввод' } };
const tags = localTagsRaw.split(/\r?\n/).flatMap(line => {
  const [name, id, count] = line.split('|');
  return name && id && /^[a-z0-9-]+$/.test(id) ? [{ name, id, subscribers: Number(count) || 0 }] : [];
});

function GameForm({ initial, existing, games, dict, onApply, onCancel }: {
  initial: Game; existing?: string; games: Game[]; dict: Dictionaries; onApply: (game: Game) => void; onCancel: () => void;
}) {
  const [game, set] = useState<Game>({ ...initial, cover: initial.cover || undefined, url: initial.url || undefined,
    status: gameStatus(initial) });
  const [score, setScore] = useState(initial.rating?.value.toString() ?? '');
  const [ratingUrl, setRatingUrl] = useState(initial.rating?.url ?? '');
  const [errors, setErrors] = useState<string[]>([]);
  const update = (patch: Partial<Game>) => set(previous => ({ ...previous, ...patch }));
  const sameName = games.find(g => g.id !== existing && normalize(g.name) === normalize(game.name));
  const submit = () => {
    const value = score.trim() ? Number(score.replace(',', '.')) : undefined;
    const changed = value !== initial.rating?.value;
    const rating = value === undefined ? undefined : changed || !initial.rating
      ? { value, source: 'Редакция' as const, original: value + '/10', url: ratingUrl.trim() && ratingUrl !== initial.rating?.url ? ratingUrl.trim() : undefined }
      : { ...initial.rating, url: ratingUrl.trim() || undefined };
    const sources = { ...game.sources };
    if (changed) {
      if (rating) sources.rating = 'Ручное изменение редакции';
      else delete sources.rating;
    }
    if (game.cover !== initial.cover) {
      if (game.cover) sources.cover = 'Ручное изменение редакции';
      else delete sources.cover;
    }
    const releaseDate = game.releaseDate || (game.datePrecision === 'year' && game.year >= 1000 ? game.year + '-01-01' : '');
    const candidate = { ...game, releaseDate, id: game.id.trim(), name: game.name.trim(), sources, rating,
      tagId: game.tagId || undefined, url: game.url || (game.tagId ? 'https://cyber.sports.ru/games/' + game.tagId + '/' : undefined),
      coverSource: game.cover !== initial.cover ? sources.cover : game.coverSource };
    const result = validateGame(candidate, dict, games, existing);
    setErrors(result.errors);
    if (result.game && !result.errors.length) onApply(result.game);
  };
  return <form onSubmit={e => { e.preventDefault(); submit(); }}>
    <h2>{existing ? 'Редактирование игры' : 'Новая игра'}</h2>
    <div className="adm-game-form">
      <div className="adm-form">
        <Input label="ID игры" value={game.id} readOnly={!!existing} change={id => update({ id })} />
        <Input label="Основное название" value={game.name} change={name => update({ name })} />
        <Input label="Название на русском языке" value={game.nameRu} change={nameRu => update({ nameRu })} />
        <Input label="Синонимы через точку с запятой" value={game.aliases?.join(';')} change={v => update({ aliases: v.split(';') })} />
        <div className="adm-row">
          <Input label="ID тега Кибера" value={game.tagId} change={tagId => update({ tagId })} />
          <Input label="URL тега Кибера" value={game.url} change={url => update({ url })} />
          <Input label="Wikidata ID" value={game.wikidata} change={wikidata => update({ wikidata })} />
        </div>
        <Field label="Описание"><textarea rows={4} value={game.description ?? ''} onChange={e => update({ description: e.target.value })} /></Field>
        <div className="adm-row">
          <Input label="Дата первого релиза" type="date" value={game.releaseDate} change={releaseDate => update({ releaseDate, year: releaseDate ? +releaseDate.slice(0, 4) : game.year })} />
          <Choice label="Точность даты" value={game.datePrecision} change={v => update({ datePrecision: v as Game['datePrecision'] })}
            options={[{ id: 'day', label: 'День' }, { id: 'month', label: 'Месяц' }, { id: 'year', label: 'Год' }]} />
          <Input label="Год выхода" type="number" value={game.year || ''} change={v => update({ year: +v })} />
          <Choice label="Статус релиза" value={game.status ?? 'unconfirmed'} options={statusOptions} change={v => update({ status: v as Game['status'] })} />
        </div>
        <div className="adm-row">
          <Field label="Жанры"><select multiple size={6} value={game.genres} onChange={e => update({ genres: Array.from(e.target.selectedOptions, o => o.value) })}>
            {dictionaryOptions(dict.genres).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select></Field>
          <Field label="Платформы"><select multiple size={6} value={game.platforms} onChange={e => update({ platforms: Array.from(e.target.selectedOptions, o => o.value) })}>
            {dictionaryOptions(dict.platforms).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select></Field>
        </div>
        <div className="adm-row">
          <Input label="Рейтинг от 0 до 10" value={score} change={setScore} />
          <Input label="Источник рейтинга" value={score ? Number(score.replace(',', '.')) === initial.rating?.value ? initial.rating.source : 'Редакция' : ''} readOnly />
          <Input label="Ссылка на источник рейтинга" value={ratingUrl} change={setRatingUrl} />
        </div>
        <div className="adm-row">
          <Input label="Подписчики тега" type="number" value={game.subscribers} change={v => update({ subscribers: +v })} />
          <Input label="Приоритет при равных баллах" type="number" value={game.priority ?? 0} change={v => update({ priority: +v })} />
        </div>
        <Input label="Происхождение данных" value={game.sources.record} change={v => update({ sources: { ...game.sources, record: v } })} />
        <Toggle label="Исключить из каталога" checked={!!game.excluded} change={excluded => update({ excluded })} />
        {sameName && <p className="adm-note">В базе уже есть «{sameName.name}» с ID {sameName.id}. Проверьте издание.</p>}
        {errors.length > 0 && <ul className="adm-error" role="alert">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
        <div className="adm-actions"><button className="adm-primary" type="submit">Применить к черновику</button><button type="button" onClick={onCancel}>К списку игр</button></div>
      </div>
      <aside>
        <ImageField label="Обложка" value={game.cover} change={cover => update({ cover: cover || undefined })} />
        <Input label="Альтернативный текст обложки" value={game.coverAlt} change={coverAlt => update({ coverAlt })} />
        <ImageField label="Левый фон" value={game.backdropLeft} change={backdropLeft => update({ backdropLeft: backdropLeft || undefined })} />
        <ImageField label="Правый фон" value={game.backdropRight} change={backdropRight => update({ backdropRight: backdropRight || undefined })} />
      </aside>
    </div>
  </form>;
}

export function Games({ games, dict, selected, setSelected, apply }: { games: Game[]; dict: Dictionaries;
  selected: Set<string>; setSelected: (ids: Set<string>) => void; apply: (game: Game) => void;
}) {
  const [form, edit] = useState<{ game: Game; existing?: string }>();
  const [q, search] = useState('');
  const [filter, setFilter] = useState({ platform: '', genre: '', status: '', noScore: false, noCover: false, incomplete: false, excluded: false });
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState('');
  const [tagging, startTag] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [message, setMessage] = useState('');
  const set = (patch: Partial<typeof filter>) => { setFilter({ ...filter, ...patch }); setPage(1); };
  if (form) return <GameForm initial={form.game} existing={form.existing} games={games} dict={dict}
    onApply={g => { apply(g); edit(undefined); setMessage('Карточка записана в черновик. Нажмите «Сохранить».'); }} onCancel={() => edit(undefined)} />;
  const query = normalize(q);
  const rows = games.filter(g => (!query || matchesName(g, query) || g.id.includes(q.toLowerCase().trim())) &&
    (!filter.platform || g.platforms.includes(filter.platform)) && (!filter.genre || g.genres.includes(filter.genre)) &&
    (!filter.status || gameStatus(g) === filter.status) && (!filter.noScore || !g.rating) && (!filter.noCover || !g.cover) &&
    (!filter.incomplete || missing(g)) && (!filter.excluded || g.excluded))
    .sort((a, b) => sort === 'score' ? (b.rating?.value ?? -1) - (a.rating?.value ?? -1)
      : sort === 'date' ? b.releaseDate.localeCompare(a.releaseDate) : sort === 'id' ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name, 'ru'));
  const maximum = Math.max(1, Math.ceil(rows.length / 25));
  const current = Math.min(page, maximum);
  const visible = rows.slice((current - 1) * 25, current * 25);
  const toggle = (ids: string[], include: boolean) => {
    const next = new Set(selected);
    ids.forEach(id => { if (include) next.add(id); else next.delete(id); });
    setSelected(next);
  };
  const findTag = () => {
    const source = tags.find(t => t.id === tag);
    if (source) {
      const known = games.find(g => g.id === source.id || g.tagId === source.id || g.url?.replace(/\/$/, '').endsWith('/games/' + source.id));
      if (known) edit({ game: known, existing: known.id });
      else edit({ game: { ...emptyGame, ...source, tagId: source.id, url: 'https://cyber.sports.ru/games/' + source.id + '/',
        sources: { record: 'Локальный список тегов Кибера' } } });
    } else edit({ game: { ...emptyGame, tagId: tag, id: tag, sources: { record: 'Ручной ввод тега' } } });
  };
  return <>
    <h2>Игры</h2>
    <p>Всего {games.length} · в основном каталоге {catalogEligibleGames(games).length} · без оценки {games.filter(g => !g.rating).length} · без обложки {games.filter(g => !g.cover).length} · неполные {games.filter(missing).length}</p>
    <div className="adm-actions"><button className="adm-primary" onClick={() => edit({ game: emptyGame })}>Добавить игру вручную</button>
      <button className="adm-extra" onClick={() => startTag(!tagging)}>Добавить по тегу Кибера</button></div>
    {tagging && <div className="adm-row">
      <Input label="Поиск в локальных тегах" value={tagQuery} change={setTagQuery} />
      <Choice label="Локальный тег" value={tag} change={setTag} empty="Выберите из списка" options={tags.filter(t => !tagQuery || normalize(t.name).includes(normalize(tagQuery)) || t.id.includes(tagQuery)).slice(0, 100).map(t => ({ id: t.id, label: t.name }))} />
      <Input label="Или укажите ID тега вручную" value={tag} change={setTag} /><button onClick={findTag}>Открыть карточку тега</button>
    </div>}
    {message && <p role="status">{message}</p>}
    <div className="adm-row">
      <Input label="Название или ID" value={q} change={v => { search(v); setPage(1); }} />
      <Choice label="Платформа" value={filter.platform} change={v => set({ platform: v })} options={dictionaryOptions(dict.platforms)} empty="Все" />
      <Choice label="Жанр" value={filter.genre} change={v => set({ genre: v })} options={dictionaryOptions(dict.genres)} empty="Все" />
      <Choice label="Статус" value={filter.status} change={v => set({ status: v })} options={statusOptions} empty="Все" />
      <Choice label="Сортировка" value={sort} change={v => { setSort(v); setPage(1); }}
        options={[{ id: 'name', label: 'По названию' }, { id: 'id', label: 'По ID' }, { id: 'score', label: 'По баллу' }, { id: 'date', label: 'По дате' }]} />
    </div>
    <div className="adm-actions">
      <Toggle label="Без оценки" checked={filter.noScore} change={noScore => set({ noScore })} />
      <Toggle label="Без обложки" checked={filter.noCover} change={noCover => set({ noCover })} />
      <Toggle label="Неполные" checked={filter.incomplete} change={incomplete => set({ incomplete })} />
      <Toggle label="Исключённые" checked={filter.excluded} change={excluded => set({ excluded })} />
      <button disabled={!selected.size} onClick={() => setSelected(new Set())}>Снять выделение ({selected.size})</button>
    </div>
    <div className="adm-table"><table>
      <thead><tr><th><input type="checkbox" aria-label="Выбрать страницу" checked={!!visible.length && visible.every(g => selected.has(g.id))} onChange={e => toggle(visible.map(g => g.id), e.target.checked)} /></th>
        <th>Обложка</th><th>Игра</th><th>ID</th><th>Балл</th><th>Дата</th><th>Статус</th><th /></tr></thead>
      <tbody>{visible.map(g => <tr key={g.id}>
        <td><input type="checkbox" aria-label={'Выбрать ' + g.name} checked={selected.has(g.id)} onChange={e => toggle([g.id], e.target.checked)} /></td>
        <td>{g.cover && <img className="adm-thumb" src={g.cover} alt="" loading="lazy" />}</td><td>{g.name}</td><td>{g.id}</td>
        <td>{g.rating?.value ?? '—'}</td><td>{g.releaseDate || '—'}</td><td>{statusLabels[gameStatus(g)]}{g.excluded && ' · исключена'}</td>
        <td><button onClick={() => edit({ game: g, existing: g.id })}>Редактировать</button></td>
      </tr>)}</tbody>
    </table></div>
    <div className="adm-actions"><button disabled={current <= 1} onClick={() => setPage(current - 1)}>Назад</button>
      <span>{current} из {maximum} · найдено {rows.length}</span>
      <button disabled={current >= maximum} onClick={() => setPage(current + 1)}>Дальше</button></div>
  </>;
}
