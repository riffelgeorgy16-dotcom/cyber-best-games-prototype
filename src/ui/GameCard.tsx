import { useState } from 'react';
import { buildUrl } from '../core/route';
import { formatRating } from '../core/catalog';
import type { Dictionaries, Game } from '../core/types';
import { href } from './router';
import { onLinkClick } from './Chrome';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export function formatDate(g: Game) {
  if (g.datePrecision === 'year') return String(g.year);
  const [y, m, d] = g.releaseDate.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function Cover({ g }: { g: Game }) {
  const [failed, setFailed] = useState(false);
  if (!g.cover || failed)
    return (
      <div className="cover cover-ph" aria-hidden>
        <span>{g.name}</span>
      </div>
    );
  return <img className="cover" src={g.cover} alt={g.name} loading="lazy" onError={() => setFailed(true)} />;
}

function LinkList({ items, max, onNav }: { items: { t: string; u: string }[]; max: number; onNav: (u: string) => void }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, max);
  return (
    <>
      {shown.map((i, n) => (
        <span key={i.u}>
          {n > 0 && ', '}
          <a href={href(i.u)} onClick={(e) => onLinkClick(e, i.u, onNav)}>{i.t}</a>
        </span>
      ))}
      {items.length > max && !all && (
        <button className="more" onClick={() => setAll(true)}>еще {items.length - max}</button>
      )}
    </>
  );
}

export function GameCard({ game: g, position, dicts: d, onNav }: { game: Game; position: number; dicts: Dictionaries; onNav: (u: string) => void }) {
  const genres = g.genres.map((s) => ({ t: d.genres[s].name, u: buildUrl({ genre: s, page: 1 }) }));
  const platforms = g.platforms.map((s) => ({ t: d.platforms[s].var || d.platforms[s].name, u: buildUrl({ platform: s, page: 1 }) }));
  return (
    <article className="card">
      <a className="cover-link" href={g.url} tabIndex={-1} aria-hidden>
        <Cover g={g} />
      </a>
      <div className="card-body">
        <div className="card-top">
          <span className="pos" title="Позиция в общем списке">{position}</span>
          <span className={'rating r' + Math.floor(g.rating.value)} title="Оценка по 10-балльной шкале">
            <b>{formatRating(g.rating.value)}</b>
          </span>
        </div>
        <h3 className="card-title"><a href={g.url}>{g.name}</a></h3>
        <div className="card-row"><span className="lbl">Жанр:</span> <LinkList items={genres} max={3} onNav={onNav} /></div>
        <div className="card-row"><span className="lbl">Платформа:</span> <LinkList items={platforms} max={4} onNav={onNav} /></div>
        <div className="card-date">{formatDate(g)}</div>
      </div>
    </article>
  );
}
