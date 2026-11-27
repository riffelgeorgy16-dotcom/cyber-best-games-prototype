import { useMemo, useState } from 'react';
import type { Dictionaries, Game } from '../core/types';
import type { AdminState } from './model';
import { Choice, Field, Toggle, dictionaryOptions } from './fields';
import { statusOptions } from './Games';
import { columns, exportSheet, previewSheet, readSheet, type Sheet, type SheetMapping } from './sheets';

export function Transfer({ draft, dict, games, selected, change }: {
  draft: AdminState; dict: Dictionaries; games: Game[]; selected: Set<string>; change: (next: AdminState) => void;
}) {
  const [sheet, setSheet] = useState<Sheet>();
  const [mapping, map] = useState<SheetMapping>({});
  const [clear, blind] = useState(false);
  const [message, report] = useState('');
  const [error, fail] = useState('');
  const [operation, setOperation] = useState('exclude');
  const [value, setValue] = useState('');
  const chosen = games.filter(g => selected.has(g.id));
  const results = useMemo(() => sheet ? previewSheet(sheet, mapping, games, dict, clear) : [], [sheet, mapping, games, dict, clear]);
  const valid = results.flatMap(row => row.game && !row.errors.length ? [row.game] : []);
  const stage = (rows: Game[]) => change({ ...draft, games: { ...draft.games, ...Object.fromEntries(rows.map(g => [g.id, g])) } });
  const handle = async (action: () => Promise<void>) => {
    fail('');
    try { await action(); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
  };
  const bulk = () => {
    const changeList = (values: string[], add: boolean) => add ? [...new Set([...values, value])] : values.filter(v => v !== value);
    const rows = chosen.map(g => {
      const game = { ...g, url: g.url || undefined, cover: g.cover || undefined };
      switch (operation) {
        case 'exclude': return { ...game, excluded: true };
        case 'include': return { ...game, excluded: false };
        case 'status': return { ...game, status: value as Game['status'] };
        case 'priority': return { ...game, priority: +value };
        case 'genre-add': return { ...game, genres: changeList(g.genres, true) };
        case 'genre-remove': return { ...game, genres: changeList(g.genres, false) };
        case 'platform-add': return { ...game, platforms: changeList(g.platforms, true) };
        case 'platform-remove': return { ...game, platforms: changeList(g.platforms, false) };
        default: return game;
      }
    });
    if (!confirm('Изменить выбранные записи (' + rows.length + ')?')) return;
    stage(rows); report('Массовое изменение: ' + rows.length + ' игр в черновике.');
  };
  return <div className="adm-form">
    <h2>Импорт и экспорт</h2>
    <h3>Массовое редактирование</h3>
    <p>Выбрано во вкладке «Игры»: {chosen.length}</p>
    <div className="adm-row">
      <Choice label="Операция" value={operation} change={v => { setOperation(v); setValue(''); }} options={[
        ['exclude', 'Исключить'], ['include', 'Включить'], ['status', 'Изменить статус'], ['priority', 'Изменить приоритет'],
        ['genre-add', 'Добавить жанр'], ['genre-remove', 'Удалить жанр'], ['platform-add', 'Добавить платформу'], ['platform-remove', 'Удалить платформу'],
      ].map(([id, label]) => ({ id, label }))} />
      {operation === 'priority' && <Field label="Значение"><input type="number" value={value} onChange={e => setValue(e.target.value)} /></Field>}
      {operation !== 'priority' && !['include','exclude'].includes(operation) && <Choice label="Значение" value={value} change={setValue} empty="Выберите"
        options={operation === 'status' ? statusOptions : dictionaryOptions(operation.startsWith('genre') ? dict.genres : dict.platforms)} />}
      <button className="adm-extra" disabled={!chosen.length || (!value && !['include', 'exclude'].includes(operation)) ||
        (operation === 'priority' && !Number.isInteger(Number(value)))} onClick={bulk}>Применить к выбранным</button>
    </div>
    <h3>Импорт игр</h3>
    <Field label="Таблица CSV или XLSX"><input type="file" accept=".csv,.xlsx" onChange={e => {
      const input = e.target;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;
      setSheet(undefined);
      void handle(async () => {
        const parsed = await readSheet(file);
        map(Object.fromEntries(columns.flatMap(column => {
          const index = parsed.headers.findIndex(h => h.toLowerCase() === column.toLowerCase());
          return index >= 0 ? [[column, index]] : [];
        })));
        setSheet(parsed);
      });
    }} /></Field>
    {sheet && <>
      <div className="adm-mapping">{columns.map(column => <Choice key={column} label={column}
        value={mapping[column]?.toString() ?? ''} empty="Не импортировать"
        options={sheet.headers.map((header, i) => ({ id: String(i), label: (i + 1) + '. ' + header }))}
        change={v => map({ ...mapping, [column]: v === '' ? undefined : +v })} />)}</div>
      <Toggle label="Очищать сопоставленные поля пустыми ячейками" checked={clear} change={blind} />
      <p>Новых {results.filter(r => r.action === 'new' && !r.errors.length).length} · обновлений {results.filter(r => r.action === 'update' && !r.errors.length).length}
        {' · с ошибками '}{results.length - valid.length}</p>
      <div className="adm-table"><table><thead><tr><th>Строка</th><th>Игра</th><th>ID</th><th>Операция</th><th>Проверка</th></tr></thead>
        <tbody>{results.map(row => <tr key={row.line}><td>{row.line}</td><td>{row.game?.name ?? row.name}</td><td>{row.id}</td>
          <td>{row.action === 'new' ? 'Добавление' : 'Обновление'}</td><td>{row.errors.join(' ') || ('warning' in row && row.warning) || 'Готово'}</td></tr>)}</tbody></table></div>
      <button className="adm-primary" disabled={!valid.length} onClick={() => {
        if (!confirm('Внести в черновик строки без ошибок (' + valid.length + ')?')) return;
        stage(valid); report('Импортировано ' + valid.length + ' игр в черновик, пропущено ' + (results.length - valid.length) + '.');
        setSheet(undefined);
      }}>Подтвердить импорт ({valid.length})</button>
    </>}
    <h3>Экспорт</h3>
    <p>В таблицах XLSX длинные встроенные изображения пропускаются.</p>
    <div className="adm-actions">
      <button onClick={() => void handle(() => exportSheet(games, 'csv'))}>Все игры CSV</button>
      <button onClick={() => void handle(() => exportSheet(games, 'xlsx'))}>Все игры XLSX</button>
    </div>
    {error && <p className="adm-error" role="alert">{error}</p>}
    {message && <p role="status">{message} Нажмите «Сохранить» для применения.</p>}
  </div>;
}
