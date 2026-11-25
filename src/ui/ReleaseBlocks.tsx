import feedRaw from '../data/releases.json';
import { selectReleaseBlocks, validScore, type ReleaseEntry } from '../core/releases';
import { formatRating } from '../core/catalog';
import type { CatalogState, Game } from '../core/types';

const FEED = feedRaw.releases as ReleaseEntry[];
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
function ReleaseRow({ entry, upcoming }: { entry: ReleaseEntry; upcoming: boolean }) {
  return <li className="release-row">
    <span className="release-cover" aria-hidden="true">
      <span>{entry.name.slice(0, 2)}</span>
      {entry.cover && <img src={entry.cover} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.hidden = true; }} />}
    </span>
    <div className="release-name">{entry.url ? <a href={entry.url}>{entry.name}</a> : <span>{entry.name}</span>}</div>
    <div className="release-info">
      {!upcoming && validScore(entry.rating) && <span className={'release-score ' + (entry.rating!.value >= 8 ? 'high' : entry.rating!.value >= 7 ? 'mid' : 'low')}>{formatRating(entry.rating!.value)}</span>}
      <time dateTime={entry.releaseDate}>{dateFormat.format(new Date(entry.releaseDate + 'T00:00:00Z')).replace(/ г\.$/, '')}</time>
    </div>
  </li>;
}
function ReleasePanel({ entries, upcoming }: { entries: ReleaseEntry[]; upcoming: boolean }) {
  const id = upcoming ? 'upcoming-releases-heading' : 'recent-releases-heading';
  return <section className="media-panel release-panel" aria-labelledby={id}>
    <h2 className="h2" id={id}>{upcoming ? 'Скоро выйдут' : 'Недавно вышли'}</h2>
    {entries.length > 0 ? <ul className="release-list">{entries.map(entry => <ReleaseRow key={entry.id} entry={entry} upcoming={upcoming} />)}</ul> :
      <p className="release-empty">{upcoming ? 'Нет подтвержденных ближайших релизов по выбранным фильтрам.' : 'Нет недавних релизов по выбранным фильтрам.'}</p>}
  </section>;
}
export function ReleaseBlocks({ games, state }: { games: Game[]; state: CatalogState }) {
  const { recent, upcoming } = selectReleaseBlocks(games, FEED, state);
  return <div className="release-blocks">
    <ReleasePanel entries={recent} upcoming={false} />
    <ReleasePanel entries={upcoming} upcoming />
  </div>;
}
