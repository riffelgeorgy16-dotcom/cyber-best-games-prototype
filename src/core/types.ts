// Общие типы прототипа каталога /games/best/

export interface Rating {
  value: number;        // нормализованная оценка 0-100, по ней идет сортировка
  display: string;      // как показывать: "9/10", "92/100"
  source: 'IGN' | 'Metacritic' | 'OpenCritic' | 'GameRankings';
}

export interface Game {
  id: string;           // слаг тега Кибера
  name: string;         // название как в теге Кибера
  url: string;          // URL тега на Кибере
  subscribers: number;  // подписчики тега (из списка тегов Кибера)
  releaseDate: string;  // ISO, дата первого выхода
  datePrecision: 'day' | 'year';
  year: number;
  platforms: string[];  // слаги платформ из справочника
  genres: string[];     // слаги жанров из справочника
  rating: Rating;
  cover?: string;       // URL обложки
  coverSource?: string;
  wikidata: string;
  sources: Record<string, string>; // поле -> источник
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
}

/** Разобранное состояние страницы каталога */
export interface CatalogState {
  genre?: string;
  platform?: string;
  year?: string;
  page: number;
  q?: string;
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
