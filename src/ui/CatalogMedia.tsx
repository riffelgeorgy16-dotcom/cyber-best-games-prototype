import media from '../data/news.json';
import { CONFIG } from '../core/config';

type Story = { title: string; url: string; blog: string; image: string };

function SectionLink({ label, path }: { label: string; path: string }) {
  return <a className="media-section-link" href={CONFIG.host + path}>{label} <span aria-hidden="true">→</span></a>;
}

function StoryLink({ story }: { story: Story }) {
  return (
    <a className="media-story" href={story.url}>
      <span className="media-cover">
        <img src={story.image} alt="" loading="lazy" decoding="async"
          onError={(event) => { event.currentTarget.hidden = true; }} />
      </span>
      <span className="media-story-caption">
        <strong>{story.title}</strong>
        <span className="media-meta">{story.blog}</span>
      </span>
    </a>
  );
}

export function CatalogMedia() {
  const [featured, ...otherPosts] = media.blogs;
  return (
    <div className="catalog-media">
      <div className="media-top">
        <section className="media-panel media-news" aria-labelledby="catalog-news-heading">
          <h2 className="h2" id="catalog-news-heading">Главные новости</h2>
          <ul className="media-news-list">
            {media.news.map((entry) => (
              <li key={entry.url}>
                <a href={entry.url}>
                  <span>{entry.title}</span>
                  <span className="media-meta">{entry.date}</span>
                </a>
              </li>
            ))}
          </ul>
          <SectionLink label="Новости игровой индустрии" path="/games/news/" />
        </section>

        <section className="media-panel media-blogs" aria-labelledby="catalog-blogs-heading">
          <div className="media-heading">
            <h2 className="h2" id="catalog-blogs-heading">Материалы из блогов</h2>
            <SectionLink label="Все популярные материалы" path="/games/blogs/" />
          </div>
          <div className="media-blog-layout">
            <div className="media-feature"><StoryLink story={featured} /></div>
            <ul className="media-blog-list">
              {otherPosts.map((story) => <li key={story.url}><StoryLink story={story} /></li>)}
            </ul>
          </div>
        </section>
      </div>

      <section className="media-panel media-collections" aria-labelledby="catalog-collections-heading">
        <div className="media-heading">
          <h2 className="h2" id="catalog-collections-heading">Подборки</h2>
          <SectionLink label="Все подборки" path="/other/podborki/" />
        </div>
        <ul className="media-collection-list">
          {media.collections.map((story) => <li key={story.url}><StoryLink story={story} /></li>)}
        </ul>
      </section>
      <p className="media-meta media-snapshot">Снимок лент Кибера на {media.snapshot}. В рабочей версии блоки заполняются из CMS.</p>
    </div>
  );
}
