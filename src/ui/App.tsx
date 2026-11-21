import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import dictsRaw from '../data/dictionaries.json';
import gamesRaw from '../data/games.json';
import { CONFIG } from '../core/config';
import { parseUrl, buildUrl } from '../core/route';
import { filterGames, paginate, sortGames } from '../core/catalog';
import { catalogEditorial } from '../core/editorial';
import { computeSeo } from '../core/seo';
import { validate } from '../core/validate';
import type { CatalogState, Dictionaries, Game } from '../core/types';
import { currentUrl, go, subscribe, MODE } from './router';
import { applyHead } from './head';
import { Header, AddressBar, Breadcrumbs, Footer } from './Chrome';
import { CatalogMedia } from './CatalogMedia';
import { Filters, Collections } from './Filters';
import { AddGameButton } from './AddGame';
import { SearchBar } from './SearchBar';
import { GameCard } from './GameCard';
import { GameBackdrop } from './GameBackdrop';
import { RatingDialog, readerScore, type ReaderRating } from './ReaderRating';
import { readReaderRatings, READER_RATINGS_KEY, writeReaderRatings } from './readerRatingStorage';
import { Pagination } from './Pagination';
import { CatalogEditorial } from './CatalogEditorial';
import { Inspector, type RouteEvent } from './Inspector';

const D = dictsRaw as unknown as Dictionaries;
const ALL: Game[] = sortGames((gamesRaw as { games: Game[] }).games);
const GAMES_BY_ID = new Map(ALL.map((game) => [game.id, game]));

export const EMPTY_TEXT = 'По вашим фильтрам ничего не найдено. Попробуйте изменить или очистить все фильтры';

export function App() {
  const url = useSyncExternalStore(subscribe, currentUrl);
  const [routeEvent, setRouteEvent] = useState<RouteEvent | null>(null);
  const [emptyNotice, setEmptyNotice] = useState<string | null>(null);
  const [demoSignedIn, setDemoSignedIn] = useState(false);
  const [ratingGame, setRatingGame] = useState<Game | null>(null);
  const [ratings, setRatings] = useState(() => readReaderRatings(GAMES_BY_ID) ?? new Map<Game, ReaderRating>());
  const [showRatings, setShowRatings] = useState(false);
  const [hoverGame, setHoverGame] = useState<string | null>(null);
  const [focusGame, setFocusGame] = useState<string | null>(null);
  const [savedRating, setSavedRating] = useState<{ game: Game; score: number } | null>(null);
  const myRatingsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (showRatings) myRatingsHeading.current?.focus();
  }, [showRatings]);

  useEffect(() => {
    function reloadRatings(event: StorageEvent) {
      if (event.key !== READER_RATINGS_KEY && event.key !== null) return;
      const stored = readReaderRatings(GAMES_BY_ID);
      if (stored) setRatings(stored);
    }
    window.addEventListener('storage', reloadRatings);
    return () => window.removeEventListener('storage', reloadRatings);
  }, []);

  const [path, search = ''] = url.split('?');
  const route = useMemo(() => parseUrl(path, search ? '?' + search : '', D), [path, search]);

  // Редиректы на правильный адрес (301 на сервере)
  useEffect(() => {
    if (path === '/' || path === '') { go(CONFIG.base, true); return; }
    if (route.kind === 'redirect') {
      setRouteEvent({ type: '301', from: url, to: route.to, reason: route.reason });
      go(route.to, true);
    }
  }, [route, url, path]);

  // «Показать еще»: страница, с которой начато накопление карточек. Любая другая навигация его сбрасывает.
  const [appendFrom, setAppendFrom] = useState<number | null>(null);
  const appending = useRef(false);

  // Сообщение о пустом результате живет только до следующей навигации
  useEffect(() => {
    setEmptyNotice(null);
    setHoverGame(null);
    setFocusGame(null);
    if (appending.current) appending.current = false;
    else setAppendFrom(null);
  }, [url]);

  const state: CatalogState | null = route.kind === 'ok' ? route.state : null;
  const editorial = state && !showRatings && !emptyNotice ? catalogEditorial(state) : undefined;
  const sorted = useMemo(() => (state ? filterGames(ALL, state) : []), [state]);
  const slice = useMemo(() => paginate(sorted, state?.page ?? 1), [sorted, state]);
  const notFound = route.kind === 'not_found' || (state !== null && slice.outOfRange && slice.total > 0);
  const notFoundReason =
    route.kind === 'not_found' ? route.reason : notFound ? `Страницы ${state?.page} нет: всего страниц ${slice.pages}` : '';

  const seo = useMemo(() => (state && !notFound ? computeSeo(state, slice, D) : null), [state, slice, notFound]);
  const issues = useMemo(
    () => (state && seo ? validate(path, search ? '?' + search : '', state, slice, seo, slice.items.length, D) : []),
    [state, seo, slice, path, search],
  );

  useEffect(() => { applyHead(seo, notFound); }, [seo, notFound]);
  const scrollRef = useRef(true);
  useEffect(() => {
    if (route.kind === 'ok' && scrollRef.current) window.scrollTo({ top: 0 });
    scrollRef.current = true;
  }, [path, search]);

  const showMore = () => {
    if (!state) return;
    if (appendFrom === null) setAppendFrom(state.page);
    appending.current = true;
    scrollRef.current = false;
    setRouteEvent(null);
    go(buildUrl({ ...state, page: state.page + 1 }));
  };
  const start = appendFrom !== null && state && appendFrom < state.page ? appendFrom : null;
  const shown = start !== null && state ? sorted.slice((start - 1) * CONFIG.perPage, state.page * CONFIG.perPage) : slice.items;
  const shownOffset = start !== null ? (start - 1) * CONFIG.perPage : slice.offset;
  const allIssues = start !== null
    ? [...issues, { level: 'info' as const, code: 'more', what: `«Показать еще»: на экране страницы ${start}-${state?.page} (${shown.length} карточек). Метатеги и ItemList - по текущей странице ${state?.page}, как при прямом заходе` }]
    : issues;

  const navigate = (to: string) => {
    setShowRatings(false);
    setSavedRating(null);
    setRouteEvent(null);
    go(to);
  };
  const openRating = (game: Game) => { setSavedRating(null); setRatingGame(game); };
  const openMyRatings = () => { setSavedRating(null); setShowRatings(true); };
  const saveRating = (rating: ReaderRating) => {
    if (!ratingGame) return;
    const updated = new Map(ratings);
    updated.delete(ratingGame);
    updated.set(ratingGame, rating);
    writeReaderRatings(updated);
    setRatings(updated);
    setSavedRating({ game: ratingGame, score: rating.score });
    setRatingGame(null);
  };

  return (
    <div className="page">
      <GameBackdrop gameId={showRatings || ratingGame || emptyNotice || notFound ? null : hoverGame ?? focusGame} />
      <AddressBar url={url} onGo={(u) => navigate(u)} mode={MODE} />
      <Header />
      <main className="container">
        {notFound || !state || !seo ? (
          <NotFound reason={notFoundReason} onHome={() => navigate(CONFIG.base)} />
        ) : (
          <>
            <Breadcrumbs crumbs={seo.breadcrumbs} onNav={navigate} />
            <div className="title-row">
              <h1 className="h1">{seo.h1}</h1>
              <AddGameButton />
            </div>
            {showRatings ? (
              <section aria-labelledby="my-ratings-title">
                <div className="reader-view-bar">
                  <h2 className="h2" id="my-ratings-title" tabIndex={-1} ref={myRatingsHeading}>Мои оценки <span>{ratings.size}</span></h2>
                  <button className="reader-list-button" onClick={() => setShowRatings(false)}>Вернуться в каталог</button>
                </div>
                {ratings.size ? (
                  <div className="grid">
                    {Array.from(ratings).reverse().map(([game, rating], index) => (
                      <GameCard key={game.id} game={game} position={index + 1} dicts={D} onNav={navigate}
                        readerRating={rating} onRate={() => openRating(game)} />
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <p className="empty-text">У тебя пока нет оценок</p>
                    <p className="empty-detail">Выбери игру в каталоге и нажми «Оценить».</p>
                    <button className="btn" onClick={() => setShowRatings(false)}>Перейти в каталог</button>
                  </div>
                )}
              </section>
            ) : <>
              <Collections />
              {state.q && <p className="search-note">Результаты поиска по запросу «{state.q}» с учетом выбранных фильтров</p>}
              <Filters
                games={ALL} dicts={D} state={state} onNav={navigate}
                onEmpty={(label) => setEmptyNotice(label)}
                onReset={() => navigate(CONFIG.base)}
              />
              <SearchBar games={ALL} state={state} onSubmit={(q) => navigate(buildUrl({ ...state, q: q || undefined, page: 1 }))} />
              <div className="reader-view-bar">
                {!emptyNotice && slice.total > 0 && (
                  <div className="result-count">Найдено игр: {slice.total}{slice.pages > 1 && `, страница ${start !== null ? `${start}-${slice.page}` : slice.page} из ${slice.pages}`}</div>
                )}
                <button className="reader-list-button" onClick={openMyRatings}>
                  <span aria-hidden="true">☆</span> Мои оценки{ratings.size > 0 && <span className="reader-count">{ratings.size}</span>}
                </button>
              </div>
              {emptyNotice || slice.total === 0 ? (
                <EmptyState onReset={() => navigate(CONFIG.base)} detail={emptyNotice} />
              ) : (
                <>
                  <Pagination state={state} pages={slice.pages} onNav={navigate} placement="top" />
                  <div className="grid">
                    {shown.map((g, i) => (
                      <GameCard key={g.id} game={g} position={shownOffset + i + 1} dicts={D} onNav={navigate}
                        onHoverGame={setHoverGame} onFocusGame={setFocusGame}
                        readerRating={ratings.get(g)} onRate={() => openRating(g)} />
                    ))}
                  </div>
                  {state.page < slice.pages && (
                    <div className="more-wrap">
                      <button className="btn btn-more" onClick={showMore}>
                        Показать еще {Math.min(CONFIG.perPage, slice.total - state.page * CONFIG.perPage)}
                      </button>
                    </div>
                  )}
                  <Pagination state={state} pages={slice.pages} onNav={navigate} placement="bottom" />
                </>
              )}
            </>}
            <CatalogMedia />
            {editorial && <CatalogEditorial {...editorial} />}
          </>
        )}
      </main>
      <Footer total={ALL.length} />
      <Inspector
        url={url} state={state} seo={seo} slice={slice} issues={allIssues} dicts={D}
        notFound={notFound ? notFoundReason : null} routeEvent={routeEvent}
        emptyNotice={emptyNotice}
      />
      {ratingGame && <RatingDialog game={ratingGame} signedIn={demoSignedIn} saved={ratings.get(ratingGame)}
        onSignIn={() => setDemoSignedIn(true)} onSave={saveRating} onClose={() => setRatingGame(null)} />}
      {savedRating && (
        <aside className="reader-toast" aria-label="Подтверждение сохранения">
          <div role="status">
            <strong>Оценка сохранена</strong>
            <span>{savedRating.game.name} · {readerScore(savedRating.score)} из 10</span>
          </div>
          {!showRatings && <button className="reader-list-button" onClick={openMyRatings}>Мои оценки</button>}
          <button className="rating-close" aria-label="Закрыть уведомление" onClick={() => setSavedRating(null)}>×</button>
        </aside>
      )}
    </div>
  );
}

function EmptyState({ onReset, detail }: { onReset: () => void; detail: string | null }) {
  return (
    <div className="empty">
      <p className="empty-text">{EMPTY_TEXT}</p>
      {detail && <p className="empty-detail">Выбрано: {detail}. Адрес страницы не изменился.</p>}
      <button className="btn" onClick={onReset}>Сбросить все фильтры</button>
    </div>
  );
}

function NotFound({ reason, onHome }: { reason: string; onHome: () => void }) {
  return (
    <div className="notfound">
      <div className="nf-code">404</div>
      <h1 className="h1">Страница не найдена</h1>
      <p>{reason}</p>
      <button className="btn" onClick={onHome}>Перейти в каталог лучших игр</button>
    </div>
  );
}
