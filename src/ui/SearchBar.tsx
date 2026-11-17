import { useEffect, useState } from 'react';
import { suggest } from '../core/catalog';
import type { CatalogState, Game } from '../core/types';

export function SearchBar({ games, state, onSubmit }: { games: Game[]; state: CatalogState; onSubmit: (q: string) => void }) {
  const [q, setQ] = useState(state.q ?? '');
  const [focus, setFocus] = useState(false);
  const [hi, setHi] = useState(-1);
  useEffect(() => setQ(state.q ?? ''), [state.q]);
  const sug = focus ? suggest(games, q) : [];

  return (
    <form
      className="search" role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (hi >= 0 && sug[hi]) { window.open(sug[hi].url, '_blank', 'noopener'); return; }
        onSubmit(q.trim());
        setFocus(false);
      }}
    >
      <input
        className="search-input" type="search" placeholder="Поиск игры по названию" value={q} aria-label="Поиск игры по названию"
        onChange={(e) => { setQ(e.target.value); setHi(-1); }}
        onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setHi(Math.min(hi + 1, sug.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setHi(Math.max(hi - 1, -1)); }
          if (e.key === 'Escape') setFocus(false);
        }}
      />
      <button className="btn search-btn" type="submit">Найти</button>
      {state.q && <button type="button" className="search-clear" onClick={() => onSubmit('')}>Очистить поиск</button>}
      {sug.length > 0 && (
        <ul className="sug" role="listbox">
          {sug.map((g, i) => (
            <li key={g.id} className={i === hi ? 'hi' : ''} role="option" aria-selected={i === hi}>
              <a href={g.url} target="_blank" rel="noopener">
                <span>{g.name}</span><span className="muted">{g.year}</span>
              </a>
            </li>
          ))}
          <li className="sug-all"><button type="submit">Показать все результаты по «{q}»</button></li>
        </ul>
      )}
    </form>
  );
}
