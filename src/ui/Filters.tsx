import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../core/config';
import { optionCounts } from '../core/catalog';
import { buildUrl, DEFAULT_SORT } from '../core/route';
import type { CatalogState, Dictionaries, Game } from '../core/types';
import { href } from './router';
import { onLinkClick } from './Chrome';
import type { Story } from '../admin/model';

type Kind = 'platform' | 'genre' | 'year' | 'rating';
const TITLES: Record<Kind, string> = { platform: 'Платформа', genre: 'Жанр', year: 'Год', rating: 'Оценка' };

/** Закрытие выпадающих панелей по клику снаружи и Esc */
function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [close]);
  return ref;
}

export function Filters(props: {
  games: Game[]; dicts: Dictionaries; state: CatalogState;
  onNav: (u: string) => void; onEmpty: (label: string, attempted: CatalogState) => void; onReset: () => void;
}) {
  const { dicts: d, state, games } = props;
  const [open, setOpen] = useState<Kind | 'sort' | null>(null);
  const ref = useOutside(() => setOpen(null));

  // Значения в порядке листа "Список значений в фильтрах"
  const platformSlugs = d.filter_lists.platforms
    .map((n) => Object.values(d.platforms).find((p) => p.slug === n || p.name.toLowerCase() === n.toLowerCase())?.slug)
    .filter(Boolean) as string[];
  const genreSlugs = d.filter_lists.genres
    .map((n) => Object.values(d.genres).find((g) => g.slug === n || g.name.toLowerCase() === n.toLowerCase())?.slug)
    .filter(Boolean) as string[];
  const lists: Record<Kind, string[]> = {
    platform: platformSlugs, genre: genreSlugs, year: d.filter_lists.years,
    rating: d.ratingChoices?.map(b => b.id) ?? CONFIG.ratingBands.map((b) => b.key),
  };
  const label = (k: Kind, v: string) => (k === 'genre' ? d.genres[v].name : k === 'platform' ? d.platforms[v].name : k === 'rating' ? d.ratingLabels?.[v] ?? v : d.yearLabels?.[v] ?? v);
  const any = state.genre || state.platform || state.year || state.rating || state.sort;
  // При смене фильтра: страница 1, поиск сбрасывается, сортировка и оценка сохраняются
  const urlWith = (patch: Partial<CatalogState>) => buildUrl({ ...state, ...patch, page: 1, q: undefined });
  const sortLabel = CONFIG.sorts.find((s) => s.key === (state.sort ?? state.defaultSort ?? DEFAULT_SORT))!.label;

  return (
    <div className="filters" ref={ref}>
      {(['platform', 'genre', 'year', 'rating'] as Kind[]).map((k) => {
        const counts = optionCounts(games, state, k, lists[k]);
        const sel = state[k];
        return (
          <div key={k} className={'fblock' + (open === k ? ' open' : '') + (sel ? ' has' : '')}>
            <button className="fhead" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
              <span>{TITLES[k]}{sel ? ':' : ''}</span>{sel && <b>{label(k, sel)}</b>}
              <span className="chev" aria-hidden>▾</span>
            </button>
            {sel && (
              <a className="fclear" title={`Убрать фильтр "${TITLES[k]}"`} aria-label={`Убрать фильтр ${TITLES[k]}`}
                href={href(urlWith({ [k]: undefined }))}
                onClick={(e) => onLinkClick(e, urlWith({ [k]: undefined }), props.onNav)}>×</a>
            )}
            {open === k && (
              <div className={'fpanel fpanel-' + k} role="menu">
                {lists[k].map((v) => {
                  const to = urlWith({ [k]: v });
                  const n = counts[v];
                  const active = sel === v;
                  if (n === 0 && !active)
                    return (
                      <button key={v} className="fopt zero" role="menuitem"
                        onClick={() => { setOpen(null); props.onEmpty(`${TITLES[k]}: ${label(k, v)}`, { ...state, [k]: v, page: 1, q: undefined }); }}>
                        {label(k, v)} <span className="cnt">0</span>
                      </button>
                    );
                  return (
                    <a key={v} role="menuitem" className={'fopt' + (active ? ' on' : '')} href={href(to)}
                      onClick={(e) => { setOpen(null); onLinkClick(e, to, props.onNav); }}>
                      {label(k, v)} <span className="cnt">{n}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <button className="freset" disabled={!any && !state.q} onClick={props.onReset}>Сбросить все фильтры</button>
      <div className={'sortbox' + (open === 'sort' ? ' open' : '')}>
        <button className="sorthead" aria-expanded={open === 'sort'} onClick={() => setOpen(open === 'sort' ? null : 'sort')}>
          {sortLabel} <span className="chev" aria-hidden>▾</span>
        </button>
        {open === 'sort' && (
          <div className="fpanel fpanel-sort" role="menu">
            {CONFIG.sorts.map((s) => {
              // сортировка сохраняет фильтры и поиск, сбрасывает страницу
              const to = buildUrl({ ...state, sort: s.key, page: 1 });
              const active = (state.sort ?? state.defaultSort ?? DEFAULT_SORT) === s.key;
              return (
                <a key={s.key} role="menuitem" className={'fopt' + (active ? ' on' : '')} href={href(to)}
                  onClick={(e) => { setOpen(null); onLinkClick(e, to, props.onNav); }}>{s.label}</a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Плашки подборок: редакционные посты Кибера из src/data/collections.json */
export function Collections({ items }: { items: Story[] }) {
  return (
    <nav className="chips" aria-label="Подборки">
      {items.map((c) => (
        <a key={c.url} href={c.url} className="chip" title={c.title}>{c.label || c.title}</a>
      ))}
    </nav>
  );
}
