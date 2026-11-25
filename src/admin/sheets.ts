import Papa from 'papaparse';
import { validateGame } from './model';
import type { Dictionaries, Game } from '../core/types';

export const columns = ['id', 'name', 'nameRu', 'aliases', 'url', 'tagId', 'description', 'releaseDate', 'datePrecision',
  'year', 'status', 'genres', 'platforms', 'rating', 'ratingUrl', 'cover', 'coverAlt', 'backdropLeft', 'backdropRight',
  'subscribers', 'priority', 'excluded', 'wikidata', 'origin'] as const;
export type Column = typeof columns[number];
export type Sheet = { headers: string[]; rows: { line: number; cells: string[]; error?: string }[] };

type SheetCell = string | number | boolean | Date | object | null | undefined;
const formatCell = (cell: SheetCell) => {
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  if (cell === null || cell === undefined) return '';
  return typeof cell === 'object' ? '' : String(cell);
};

export async function readSheet(file: File): Promise<Sheet> {
  if (file.size > 12 * 1024 ** 2) throw new Error('Допустимый размер таблицы — до 12 МБ.');
  let records: SheetCell[][];
  if (/\.xlsx$/i.test(file.name)) {
    const Excel = await import('exceljs');
    const workbook = new Excel.default.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('В книге нет листов.');
    if (sheet.rowCount > 10001 || sheet.columnCount > 200) throw new Error('Допустимы до 10 000 строк и 200 колонок.');
    records = Array.from({ length: sheet.rowCount }, (_, r) =>
      Array.from({ length: sheet.columnCount }, (_, c) => sheet.getRow(r + 1).getCell(c + 1).value));
  } else if (/\.csv$/i.test(file.name)) {
    const parsed = Papa.parse<string[]>(await file.text(), { skipEmptyLines: 'greedy' });
    if (parsed.errors.length) throw new Error(parsed.errors.map(e => e.message).join(' '));
    records = parsed.data;
  } else throw new Error('Выберите файл CSV или XLSX.');
  const [first, ...others] = records;
  const headers = first?.map(formatCell).map(val => val.trim()) ?? [];
  if (!headers.some(Boolean) || !others.length || others.length > 10000 || headers.length > 200) throw new Error('Нужны заголовки и от 1 до 10 000 игровых строк.');
  return { headers, rows: others.flatMap((record, index) => {
    if (!record.some(v => v != null && v !== '')) return [];
    return [{ line: index + 2, cells: record.map(formatCell),
      error: record.some(v => v && typeof v === 'object' && !(v instanceof Date)) ? 'Проверьте формулы, ссылки или сложные ячейки. Используйте обычный текст и числа.' :
        record.slice(headers.length).some(v => v != null && v !== '') ? 'Строка содержит ячейки за пределами заголовка.' : undefined }];
  }) };
}

export type SheetMapping = Partial<Record<Column, number>>;

type ImportRow = { line: number; id: string; name: string; errors: string[]; action: 'new' | 'update'; game?: Game; warning?: string };
export function previewSheet(sheet: Sheet, map: SheetMapping, games: Game[], dict: Dictionaries, clear: boolean): ImportRow[] {
  const original = new Map(games.map(g => [g.id, g]));
  const working = new Map(original);
  const seen = new Set<string>();
  return sheet.rows.map(({ cells, line, error }) => {
    const id = map.id === undefined ? '' : cells[map.id]?.trim() ?? '';
    const old = original.get(id);
    const name = map.name === undefined ? old?.name ?? '' : cells[map.name]?.trim() || old?.name || '';
    const fail = (errors: string[]) => ({ line, id, name, errors, action: old ? 'update' as const : 'new' as const });
    if (error) return fail([error]);
    if (!id || seen.has(id)) return fail([id ? 'Повтор ID в таблице.' : 'Нужен ID игры.']);
    seen.add(id);
    const candidate: Record<string, unknown> = { id, name, subscribers: 0, year: 0, releaseDate: '', wikidata: '',
      datePrecision: 'day', genres: [], platforms: [], status: 'unconfirmed', ...old,
      sources: { ...old?.sources, record: 'Табличный импорт' } };
    const supplied = (column: Column) => {
      const index = map[column];
      return index === undefined ? undefined : cells[index]?.trim() || (clear ? '' : undefined);
    };
    for (const column of columns) {
      if (['id', 'rating', 'ratingUrl', 'origin'].includes(column)) continue;
      const value = supplied(column);
      if (value === undefined) continue;
      if (['genres', 'platforms', 'aliases'].includes(column)) candidate[column] = [...new Set(value.split(/[;|]/).map(v => v.trim()).filter(Boolean))];
      else if (['subscribers', 'year', 'priority'].includes(column)) candidate[column] = value ? Number(value) : 0;
      else if (column === 'excluded') {
        const normalized = value.toLowerCase();
        if (!['', 'true', 'false', '1', '0', 'да', 'нет'].includes(normalized)) return fail(['Поле excluded принимает да/нет или true/false.']);
        candidate.excluded = ['true', '1', 'да'].includes(normalized);
      } else if (['url', 'tagId'].includes(column)) candidate[column] = value || undefined;
      else if (column === 'status') candidate[column] = value || 'unconfirmed';
      else if (column === 'datePrecision') candidate[column] = value || 'day';
      else candidate[column] = value;
    }
    if (!candidate.cover) candidate.cover = undefined;
    if (!candidate.url) candidate.url = undefined;
    if (!candidate.releaseDate && candidate.datePrecision === 'year' && Number(candidate.year) >= 1000) {
      candidate.releaseDate = candidate.year + '-01-01';
    }
    const date = candidate.releaseDate as string;
    if (supplied('year') === undefined && date) candidate.year = Number(date.slice(0, 4));
    if (supplied('year') === '' && date) candidate.year = Number(date.slice(0, 4));
    if (!candidate.url && candidate.tagId) candidate.url = 'https://cyber.sports.ru/games/' + candidate.tagId + '/';
    const score = supplied('rating');
    const ratingUrl = supplied('ratingUrl');
    const source = candidate.sources as Record<string, string>;
    if (score !== undefined) {
      if (score) {
        const numeric = Number(score.replace(',', '.'));
        if (numeric === old?.rating?.value && old.rating) {
          candidate.rating = { ...old.rating, url: ratingUrl === undefined ? old.rating.url : ratingUrl || undefined };
        } else {
          candidate.rating = { value: numeric, source: 'Редакция', original: numeric + '/10', url: ratingUrl || undefined };
          source.rating = 'Табличный импорт редакции';
        }
      } else {
        candidate.rating = undefined;
        delete source.rating;
      }
    } else if (old?.rating && ratingUrl !== undefined) candidate.rating = { ...old.rating, url: ratingUrl || undefined };
    if (supplied('origin') !== undefined) source.record = supplied('origin') || 'Табличный импорт';
    const matched = validateGame(candidate, dict, [...working.values()], old?.id);
    if (matched.game && !matched.errors.length) working.set(id, matched.game);
    const possibleName = !old && games.find(g => g.name.toLowerCase() === name.toLowerCase());
    return { ...fail(matched.errors), game: matched.game, warning: possibleName ? 'Совпадает название с ' + possibleName.id : undefined };
  });
}

export function exportRows(games: Game[]) {
  return games.map(g => columns.map(column => {
    if (column === 'rating') return g.rating?.value ?? '';
    if (column === 'ratingUrl') return g.rating?.url ?? '';
    if (column === 'origin') return g.sources.record ?? '';
    const result = g[column] ?? '';
    return Array.isArray(result) ? result.join(';') : result;
  }));
}

export function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSheet(games: Game[], type: 'csv' | 'xlsx', template = false) {
  const rows = template ? [columns.map(c => c === 'id' ? 'example' : c === 'name' ? 'Название игры' : '')] : exportRows(games);
  const data = [[...columns], ...rows];
  const filename = template ? 'catalog-template' : 'catalog-games';
  if (type === 'csv') {
    download(filename + '.csv', '\uFEFF' + Papa.unparse(data, { escapeFormulae: /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/ }), 'text/csv;charset=utf-8');
    return;
  }
  const Excel = await import('exceljs');
  const workbook = new Excel.default.Workbook();
  const sheet = workbook.addWorksheet('Игры');
  sheet.addRows(data.map(row => row.map(value => typeof value === 'string' && value.length > 32767 ? '' : value)));
  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  download(filename + '.xlsx', new Uint8Array(buffer), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
