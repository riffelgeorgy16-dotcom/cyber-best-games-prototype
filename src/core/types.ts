// Общие типы прототипа каталога /games/best/

export interface Rating {
  value: number;        // оценка по 10-балльной шкале (Metacritic 94/100 -> 9.4)
  source: 'IGN' | 'Metacritic' | 'OpenCritic' | 'GameRankings' | 'Редакция';
  original: string;     // исходная оценка источника: "9/10", "94/100"
  platform?: string;
  url?: string;
}

export interface Game {
  id: string;           // стабильный идентификатор игры
  name: string;
  url?: string;         // URL тега Кибера, если такой тег есть
  subscribers: number;  // подписчики тега (из списка тегов Кибера)
  releaseDate: string;  // ISO, дата первого выхода
  datePrecision: 'day' | 'month' | 'year';
  year: number;
  platforms: string[];  // слаги платформ из справочника
  genres: string[];     // слаги жанров из справочника
  rating?: Rating;
  cover?: string;       // URL обложки
  coverSource?: string;
  wikidata: string;
  sources: Record<string, string>; // поле -> источник
  status?: 'released' | 'upcoming' | 'unconfirmed';
  excluded?: boolean;
  priority?: number;
  tagId?: string;
  nameRu?: string;
  aliases?: string[];
  description?: string;
  coverAlt?: string;
  backdropLeft?: string;
  backdropRight?: string;
}

export interface MetaTemplate {
  row: number;          // строка в таблице мета
  type: PageType;
  pattern: string[];    // сегменты URL, {P} - платформа, {Y} - год
  title: string;
  description: string;
  h1: string;
}

export type PageType =
  | 'main' | 'genre' | 'platform' | 'year'
  | 'genre_platform' | 'genre_year' | 'platform_year' | 'genre_platform_year';

export interface Platform { slug: string; name: string; var: string; title: string; description: string; h1: string }
export interface Genre { slug: string; name: string; title: string; description: string; h1: string }

export interface Dictionaries {
  main: { title: string; description: string; h1: string };
  platforms: Record<string, Platform>;
  genres: Record<string, Genre>;
  years: Record<string, { year: string; title: string; description: string; h1: string }>;
  templates: MetaTemplate[];
  filter_lists: { platforms: string[]; years: string[]; genres: string[] };
  catalogYears?: string[];
  defaultSort?: SortKey;
  yearLabels?: Record<string, string>;
  ratingChoices?: { id: string; label: string }[];
  ratingLabels?: Record<string, string>;
}

/** Разобранное состояние страницы каталога */
export type SortKey = 'rating-desc' | 'rating-asc' | 'popular' | 'alpha' | 'new' | 'old';
export type RatingBand = '1-3' | '4-7' | '8-10';

export interface CatalogState {
  genre?: string;
  platform?: string;
  year?: string;
  page: number;
  q?: string;
  /** Оценка: GET-параметр, страницы не индексируются */
  rating?: RatingBand;
  /** Сортировка: GET-параметр, по умолчанию rating-desc (в адрес не пишется) */
  sort?: SortKey;
  defaultSort?: SortKey;
}

export type RouteResult =
  | { kind: 'ok'; state: CatalogState }
  | { kind: 'redirect'; to: string; reason: string }
  | { kind: 'not_found'; reason: string };

export type IssueLevel = 'error' | 'warning' | 'limitation' | 'info';
export interface Issue {
  level: IssueLevel;
  code: string;
  what: string;
  expected?: string;
  actual?: string;
}
