import { CONFIG } from '../core/config';
import { activeStories, media, type AdminState, type Story } from '../admin/model';

function SectionLink({ label, path }: { label: string; path: string }) {
  return <a className="media-section-link" href={CONFIG.host + path}>{label} <span aria-hidden="true">→</span></a>;
}

function StoryLink({ story }: { story: Story }) {
  return <a className="media-story" href={story.url}>
    <span className="media-cover">{story.image && <img src={story.image} alt="" loading="lazy" decoding="async"
      onError={event => { event.currentTarget.hidden = true; }} />}</span>
    <span className="media-story-caption"><strong>{story.title}</strong><span className="media-meta">{story.blog}</span></span>
  </a>;
}

export function CatalogMediaPanel({ kind, config }: { kind: 'news' | 'blogs' | 'collections'; config: AdminState }) {
  const block = config.blocks[kind];
  const source: Story[] = kind === 'collections' ? config.lower : block.mode === 'manual' ? block.stories ?? [] : media[kind];
  const active = activeStories(source);
  const byUrl = new Map(active.map(item => [item.url, item]));
  const pinned = [...new Set(block.picks)].flatMap(url => byUrl.has(url) ? [byUrl.get(url)!] : []);
  const rows = [...pinned, ...active.filter(item => !block.picks.includes(item.url))].slice(0, block.limit);
  const id = 'catalog-' + kind + '-heading';
  const heading = <h2 className="h2" id={id}>{block.title}</h2>;

  if (kind === 'news') return <section className="media-panel media-news" aria-labelledby={id}>
    {heading}
    {rows.length ? <ul className="media-news-list">{rows.map(entry => <li key={entry.url}>
      <a href={entry.url}><span>{entry.title}</span><span className="media-meta">{entry.date}</span></a>
    </li>)}</ul> : <p>Нет опубликованных новостей.</p>}
    <SectionLink label="Новости игровой индустрии" path="/games/news/" />
  </section>;

  if (kind === 'collections') return <section className="media-panel media-collections" aria-labelledby={id}>
    <div className="media-heading">{heading}<SectionLink label="Все подборки" path="/other/podborki/" /></div>
    {rows.length ? <ul className="media-collection-list">{rows.map(story => <li key={story.url}><StoryLink story={story} /></li>)}</ul>
      : <p>Нет опубликованных подборок.</p>}
  </section>;

  const [featured, ...rest] = rows;
  return <section className="media-panel media-blogs" aria-labelledby={id}>
    <div className="media-heading">{heading}<SectionLink label="Все популярные материалы" path="/games/blogs/" /></div>
    {featured ? <div className="media-blog-layout"><div className="media-feature"><StoryLink story={featured} /></div>
      {rest.length > 0 && <ul className="media-blog-list">{rest.map(story => <li key={story.url}><StoryLink story={story} /></li>)}</ul>}
    </div> : <p>Нет опубликованных материалов.</p>}
  </section>;
}
