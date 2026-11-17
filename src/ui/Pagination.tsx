import { buildUrl } from '../core/route';
import type { CatalogState } from '../core/types';
import { href } from './router';
import { onLinkClick } from './Chrome';

export function pageList(cur: number, total: number): (number | '…')[] {
  const set = new Set([1, total, cur - 1, cur, cur + 1].filter((p) => p >= 1 && p <= total));
  const arr = [...set].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  arr.forEach((p, i) => { if (i && p - arr[i - 1] > 1) out.push('…'); out.push(p); });
  return out;
}

export function Pagination({ state, pages, onNav }: { state: CatalogState; pages: number; onNav: (u: string) => void }) {
  if (pages <= 1) return null;
  const to = (p: number) => buildUrl({ ...state, page: p });
  const L = (p: number, text: string, cls = '', rel?: string) => (
    <a className={'pg ' + cls} href={href(to(p))} rel={rel} onClick={(e) => onLinkClick(e, to(p), onNav)}>{text}</a>
  );
  return (
    <nav className="pager" aria-label="Страницы">
      {state.page > 1 ? L(state.page - 1, '← Предыдущая', 'pg-nav', 'prev') : <span className="pg pg-nav off">← Предыдущая</span>}
      {pageList(state.page, pages).map((p, i) =>
        p === '…' ? <span key={'e' + i} className="pg dots">…</span> : p === state.page ? (
          <span key={p} className="pg on" aria-current="page">{p}</span>
        ) : (
          <span key={p}>{L(p, String(p))}</span>
        ),
      )}
      {state.page < pages ? L(state.page + 1, 'Следующая →', 'pg-nav', 'next') : <span className="pg pg-nav off">Следующая →</span>}
    </nav>
  );
}
