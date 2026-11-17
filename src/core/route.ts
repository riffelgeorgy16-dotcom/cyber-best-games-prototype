import { CONFIG } from './config';
import type { CatalogState, Dictionaries, RouteResult } from './types';

type SegKind = 'genre' | 'platform' | 'year';

export function classifySegment(seg: string, d: Dictionaries): SegKind | null {
  if (d.genres[seg]) return 'genre';
  if (d.platforms[seg]) return 'platform';
  if (/^\d{4}$/.test(seg) && d.filter_lists.years.includes(seg)) return 'year';
  return null;
}

/** Путь каталога без хоста, всегда со слешем в конце, сегменты в порядке жанр/платформа/год */
export function buildPath(s: Pick<CatalogState, 'genre' | 'platform' | 'year'>): string {
  const segs: string[] = [];
  for (const k of CONFIG.segmentOrder) {
    const v = s[k];
    if (v) segs.push(v);
  }
  return CONFIG.base + (segs.length ? segs.join('/') + '/' : '');
}

export function buildUrl(s: CatalogState, opts: { withPage?: boolean; withQuery?: boolean } = {}): string {
  const { withPage = true, withQuery = true } = opts;
  const params: string[] = [];
  if (withQuery && s.q) params.push('q=' + encodeURIComponent(s.q));
  if (withPage && s.page > 1) params.push('page=' + s.page);
  return buildPath(s) + (params.length ? '?' + params.join('&') : '');
}

export const absolute = (path: string, host = CONFIG.host) => host + path;

/**
 * Разбор адреса /games/best/<seg>/<seg>/<seg>/?page=N&q=...
 * Возвращает состояние, редирект на правильный адрес или 404.
 */
export function parseUrl(pathname: string, search: string, d: Dictionaries): RouteResult {
  if (!pathname.startsWith(CONFIG.base.slice(0, -1))) return { kind: 'not_found', reason: 'Адрес вне каталога /games/best/' };
  let rest = pathname.slice(CONFIG.base.length - 1);
  const needSlash = !pathname.endsWith('/');
  const segs = rest.split('/').filter(Boolean);
  if (segs.length > 3) return { kind: 'not_found', reason: 'Больше трех сегментов фильтра' };

  const state: CatalogState = { page: 1 };
  const seen: SegKind[] = [];
  for (const seg of segs) {
    const k = classifySegment(seg.toLowerCase(), d);
    if (!k) return { kind: 'not_found', reason: `Неизвестный сегмент "${seg}"` };
    if (state[k]) return { kind: 'not_found', reason: `Два значения одного фильтра (${k})` };
    state[k] = seg.toLowerCase();
    seen.push(k);
  }

  const params = new URLSearchParams(search);
  const pageRaw = params.get('page');
  if (pageRaw !== null) {
    if (!/^\d+$/.test(pageRaw) || Number(pageRaw) < 1) return { kind: 'not_found', reason: `Некорректный номер страницы "${pageRaw}"` };
    state.page = Number(pageRaw);
  }
  const q = params.get('q');
  if (q && q.trim()) state.q = q.trim();

  const canonicalOrder = CONFIG.segmentOrder.filter((k) => seen.includes(k));
  const orderOk = canonicalOrder.every((k, i) => seen[i] === k);
  const lower = segs.some((s) => s !== s.toLowerCase());
  if (!orderOk || needSlash || lower || pageRaw === '1') {
    const reasons = [
      !orderOk && 'порядок сегментов не жанр/платформа/год',
      needSlash && 'нет слеша в конце',
      lower && 'заглавные буквы в адресе',
      pageRaw === '1' && 'page=1 дублирует первую страницу',
    ].filter(Boolean).join(', ');
    return { kind: 'redirect', to: buildUrl(state), reason: reasons };
  }
  return { kind: 'ok', state };
}
