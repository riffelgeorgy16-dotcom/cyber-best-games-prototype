import { useEffect, useRef, useState } from 'react';
import { optionCounts } from '../core/catalog';
import { buildUrl } from '../core/route';
import type { CatalogState, Dictionaries, Game } from '../core/types';
import { href } from './router';
import { onLinkClick } from './Chrome';

type Kind = 'platform' | 'genre' | 'year';
const TITLES: Record<Kind, string> = { platform: 'Платформа', genre: 'Жанр', year: 'Год' };

export function Filters(props: {
  games: Game[]; dicts: Dictionaries; state: CatalogState;
  onNav: (u: string) => void; onEmpty: (label: string) => void; onReset: () => void;
}) {
  const { dicts: d, state, games } = props;
  const [open, setOpen] = useState<Kind | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, []);

  // Значения в порядке листа "Список значений в фильтрах"
  const platformSlugs = d.filter_lists.platforms
    .map((n) => Object.values(d.platforms).find((p) => p.name.toLowerCase() === n.toLowerCase())?.slug)
    .filter(Boolean) as string[];
  const genreSlugs = d.filter_lists.genres
    .map((n) => Object.values(d.genres).find((g) => g.name.toLowerCase() === n.toLowerCase())?.slug)
    .filter(Boolean) as string[];
  const lists: Record<Kind, string[]> = { platform: platformSlugs, genre: genreSlugs, year: d.filter_lists.years };
  const label = (k: Kind, v: string) => (k === 'genre' ? d.genres[v].name : k === 'platform' ? d.platforms[v].name : v);
  const any = state.genre || state.platform || state.year;

  return (
    <div className="filters" ref={ref}>
      {(['platform', 'genre', 'year'] as Kind[]).map((k) => {
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
                href={href(buildUrl({ ...state, [k]: undefined, page: 1, q: undefined }))}
                onClick={(e) => onLinkClick(e, buildUrl({ ...state, [k]: undefined, page: 1, q: undefined }), props.onNav)}>×</a>
            )}
            {open === k && (
              <div className={'fpanel fpanel-' + k} role="menu">
                {lists[k].map((v) => {
                  const to = buildUrl({ ...state, [k]: v, page: 1, q: undefined });
                  const n = counts[v];
                  const active = sel === v;
                  if (n === 0 && !active)
                    return (
                      <button key={v} className="fopt zero" role="menuitem"
                        onClick={() => { setOpen(null); props.onEmpty(`${TITLES[k]}: ${label(k, v)}`); }}>
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
    </div>
  );
}
