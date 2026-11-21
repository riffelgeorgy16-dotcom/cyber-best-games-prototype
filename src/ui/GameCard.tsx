import { useState } from 'react';
import { buildUrl } from '../core/route';
import { formatRating } from '../core/catalog';
import type { Dictionaries, Game } from '../core/types';
import { href } from './router';
import { onLinkClick } from './Chrome';
import { readerScore, type ReaderRating } from './ReaderRating';

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

/** Короткие подписи бейджей платформ и семейство (для цвета). Логотипы брендов не используются. */
const BADGE: Record<string, [string, string]> = {
  pc: ['ПК', 'pc'], 'playstation-5': ['PS5', 'ps'], 'playstation-4': ['PS4', 'ps'], 'playstation-3': ['PS3', 'ps'],
  'playstation-2': ['PS2', 'ps'], 'playstation-1': ['PS1', 'ps'], psp: ['PSP', 'ps'], 'ps-vita': ['Vita', 'ps'],
  'xbox-series': ['Xbox X|S', 'xb'], 'xbox-one': ['Xbox One', 'xb'], 'xbox-360': ['X360', 'xb'], xbox: ['Xbox', 'xb'],
  'nintendo-switch': ['Switch', 'nn'], 'nintendo-switch-2': ['Switch 2', 'nn'], 'nintendo-wii': ['Wii', 'nn'], 'nintendo-wii-u': ['Wii U', 'nn'],
  'nintendo-ds': ['DS', 'nn'], 'nintendo-3ds': ['3DS', 'nn'], 'nintendo-gamecube': ['GameCube', 'nn'], 'nintendo-64': ['N64', 'nn'],
  'nintendo-game-boy': ['Game Boy', 'nn'], 'nintendo-game-boy-advance': ['GBA', 'nn'],
  sega: ['SEGA', 'sg'], 'sega-mega-drive': ['Mega Drive', 'sg'], 'sega-mega-drive-2': ['Mega Drive 2', 'sg'], 'sega-dreamcast': ['Dreamcast', 'sg'],
  mac: ['Mac', 'pc'], linux: ['Linux', 'pc'], 'oculus-quest-3': ['Quest 3', 'vr'], 'steam-vr': ['SteamVR', 'vr'],
};

function PlatformBadges({ slugs, d, onNav }: { slugs: string[]; d: Dictionaries; onNav: (u: string) => void }) {
  return (
    <div className="badges">
      {slugs.map((s) => {
        const u = buildUrl({ platform: s, page: 1 });
        const [t, fam] = BADGE[s] ?? [d.platforms[s].name, 'pc'];
        const full = d.platforms[s].var || d.platforms[s].name;
        return (
          <a key={s} className={'badge b-' + fam} href={href(u)} title={`Лучшие игры на ${full}`} onClick={(e) => onLinkClick(e, u, onNav)}>{t}</a>
        );
      })}
    </div>
  );
}

type GameCardProps = {
  game: Game;
  position: number;
  dicts: Dictionaries;
  onNav: (url: string) => void;
  readerRating?: ReaderRating;
  onRate: () => void;
};

export function GameCard({ game: g, position, dicts: d, onNav, readerRating, onRate }: GameCardProps) {
  const genres = g.genres.map((s) => ({ t: d.genres[s].name, u: buildUrl({ genre: s, page: 1 }) }));
  return (
    <article className="card">
      <a className="cover-link" href={g.url} tabIndex={-1} aria-hidden>
        <Cover g={g} />
      </a>
      <div className="card-body">
        <div className="card-top reader-card-top" data-position={position}>
          <button type="button" className={readerRating ? 'reader-rate is-rated' : 'reader-rate'}
            aria-label={readerRating ? `Изменить оценку: ${g.name}, ${readerScore(readerRating.score)} из 10` : `Оценить: ${g.name}`}
            onClick={onRate}>
            <span aria-hidden="true">{readerRating ? '★' : '☆'}</span>
            {readerRating ? `Моя оценка ${readerScore(readerRating.score)}` : 'Оценить'}
          </button>
          <span className={'rating r' + Math.floor(g.rating.value)} title="Оценка по 10-балльной шкале">
            <b>{formatRating(g.rating.value)}</b>
          </span>
        </div>
        <h3 className="card-title"><a href={g.url}>{g.name}</a></h3>
        <div className="card-row"><span className="lbl">Жанр:</span> <LinkList items={genres} max={2} onNav={onNav} /></div>
        <PlatformBadges slugs={g.platforms} d={d} onNav={onNav} />
        <div className="card-date">{formatDate(g)}</div>
      </div>
    </article>
  );
}
