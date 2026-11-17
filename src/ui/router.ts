// Адаптер адресной строки.
// history - настоящие пути (GitHub Pages, локальный запуск): <prefix>/games/best/...
// hash    - артефакт Claude: разрешен только якорь вида #best--ekshen-igry--pc--2024--p2
import { CONFIG } from '../core/config';

export type RouterMode = 'history' | 'hash';
export const MODE: RouterMode = (import.meta.env.VITE_ROUTER as RouterMode) || 'history';
const PREFIX = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

let memoryQuery = ''; // в hash-режиме поисковый запрос хранится только в памяти страницы

export function encodeHash(url: string): string {
  const [path, search = ''] = url.split('?');
  const segs = path.slice(CONFIG.base.length).split('/').filter(Boolean);
  const p = new URLSearchParams(search);
  const page = p.get('page');
  return 'best' + segs.map((s) => '--' + s).join('') + (page ? '--p' + page : '');
}

export function decodeHash(hash: string): string {
  const h = hash.replace(/^#/, '');
  if (!h || !h.startsWith('best')) return CONFIG.base;
  const parts = h.split('--').slice(1);
  let page = '';
  if (parts.length && /^p\d+$/.test(parts[parts.length - 1])) page = parts.pop()!.slice(1);
  const params: string[] = [];
  if (memoryQuery) params.push('q=' + encodeURIComponent(memoryQuery));
  if (page) params.push('page=' + page);
  return CONFIG.base + parts.map((s) => s + '/').join('') + (params.length ? '?' + params.join('&') : '');
}

/** Текущий адрес каталога: путь от /games/best/ и query */
export function currentUrl(): string {
  if (MODE === 'hash') return decodeHash(location.hash);
  const path = location.pathname.startsWith(PREFIX) ? location.pathname.slice(PREFIX.length) || '/' : location.pathname;
  return path + location.search;
}

export function go(url: string, replace = false) {
  if (MODE === 'hash') {
    memoryQuery = new URLSearchParams(url.split('?')[1] ?? '').get('q') ?? '';
    const h = '#' + encodeHash(url);
    if (replace) history.replaceState(null, '', h);
    else if (location.hash !== h) location.hash = h;
    else window.dispatchEvent(new HashChangeEvent('hashchange'));
    if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  const full = PREFIX + url;
  if (replace) history.replaceState(null, '', full);
  else history.pushState(null, '', full);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function subscribe(cb: () => void) {
  const ev = MODE === 'hash' ? 'hashchange' : 'popstate';
  window.addEventListener(ev, cb);
  return () => window.removeEventListener(ev, cb);
}

/** href для ссылок: настоящий путь, чтобы ссылку можно было открыть в новой вкладке */
export function href(url: string): string {
  return MODE === 'hash' ? '#' + encodeHash(url) : PREFIX + url;
}
