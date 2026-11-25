import { CatalogEditorial } from './CatalogEditorial';
import { CatalogMediaPanel } from './CatalogMedia';
import { ReleasePanel } from './ReleaseBlocks';
import { catalogEditorial } from '../core/editorial';
import { pageType } from '../core/seo';
import { buildPath } from '../core/route';
import { selectReleaseBlocks } from '../core/releases';
import { copyFor, media, type AdminState, type BlockKey } from '../admin/model';
import type { CatalogState, Dictionaries, Game } from '../core/types';

export function CatalogSections({ config, state, games, dict, catalogOnly = false, hideEditorial = false }: {
  config: AdminState; state: CatalogState; games: Game[]; dict: Dictionaries; catalogOnly?: boolean; hideEditorial?: boolean;
}) {
  const blocks = config.blocks;
  const releases = selectReleaseBlocks(games, [], state, undefined, {
    days: config.settings.recentDays, recent: blocks.recent.limit, upcoming: blocks.upcoming.limit,
    recentPins: blocks.recent.picks, upcomingPins: blocks.upcoming.picks,
  });
  const editorial = catalogEditorial(state, copyFor(config, buildPath(state), pageType(state)), dict);
  const nodes = {
    recent: <ReleasePanel entries={releases.recent} title={blocks.recent.title} upcoming={false} />,
    upcoming: <ReleasePanel entries={releases.upcoming} title={blocks.upcoming.title} upcoming />,
    news: <CatalogMediaPanel kind="news" config={config} />,
    blogs: <CatalogMediaPanel kind="blogs" config={config} />,
    collections: <CatalogMediaPanel kind="collections" config={config} />,
    editorial: !hideEditorial && editorial && <CatalogEditorial {...editorial}
      heading={blocks.editorial.title === 'SEO-текст' ? editorial.heading : blocks.editorial.title}
      paragraphs={editorial.paragraphs.slice(0, blocks.editorial.limit)} limit={blocks.editorial.limit} />,
  };
  const groups: { kind: string; keys: BlockKey[] }[] = [];
  for (const key of config.blockOrder) {
    if (!blocks[key].visible || !nodes[key] || (catalogOnly && (key === 'recent' || key === 'upcoming' || key === 'editorial'))) continue;
    const group = key === 'recent' || key === 'upcoming' ? 'release-blocks'
      : key === 'news' || key === 'blogs' ? 'media-top' : key;
    const previous = groups[groups.length - 1];
    if (previous?.kind === group) previous.keys.push(key);
    else groups.push({ kind: group, keys: [key] });
  }
  const showsSnapshot = config.blockOrder.some(key => (key === 'news' || key === 'blogs') && blocks[key].visible && blocks[key].mode === 'auto');
  return <div className="catalog-sections">{groups.map(({ kind, keys }) =>
    <div key={keys.join(',')} className={kind === 'editorial' ? undefined : kind} data-count={keys.length}
      data-first={keys[0]}>{keys.map(key => <div className="catalog-section-item" key={key}>{nodes[key]}</div>)}</div>)}{showsSnapshot && <p className="media-meta media-snapshot">Снимок лент Кибера на {media.snapshot}.</p>}</div>;
}
