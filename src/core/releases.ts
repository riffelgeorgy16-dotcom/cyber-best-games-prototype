import type { CatalogState, Game, Rating } from './types';
import { inBand, matchesName, normalize } from './catalog';

export type ReleaseEntry = Pick<Game, 'id' | 'name' | 'nameRu' | 'aliases' | 'url' | 'cover' | 'releaseDate' | 'datePrecision' | 'year' | 'platforms' | 'genres' | 'rating'> & {
  status: 'released' | 'upcoming';
  source: string;
};
export const RELEASE_LIMIT = 5;
export const RECENT_DAYS = 90;
export const todayISO = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date());

function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const ms = Date.parse(date + 'T00:00:00Z');
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === date;
}
export function validScore(r?: Rating): boolean {
  return !!r && Number.isFinite(r.value) && r.value >= 0 && r.value <= 10;
}
/** For month/year precision, use the end of the known period, not an invented day. */
export function releaseUpperBound(g: Pick<Game, 'releaseDate' | 'datePrecision'>): string | undefined {
  if (!validDate(g.releaseDate)) return;
  if (g.datePrecision === 'day') return g.releaseDate;
  if (g.datePrecision === 'year') return g.releaseDate.slice(0, 4) + '-12-31';
  const [y, m] = g.releaseDate.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}
/** Same eligibility boundary for SPA, search, filter counts and static SEO generation. */
export function catalogEligibleGames(games: Game[], today = todayISO()): Game[] {
  return games.filter(g => {
    const end = releaseUpperBound(g);
    return !g.excluded && (!g.status || g.status === 'released') && !!end && end <= today && validScore(g.rating);
  });
}

export function selectReleaseBlocks(games: Game[], feed: ReleaseEntry[], state: CatalogState, today = todayISO(),
  options: { days?: number; recent?: number; upcoming?: number; recentPins?: string[]; upcomingPins?: string[] } = {}) {
  const cutoff = new Date(Date.parse(today + 'T00:00:00Z') - (options.days ?? RECENT_DAYS) * 86400000).toISOString().slice(0, 10);
  const matches = (g: ReleaseEntry) =>
    (!state.genre || g.genres.includes(state.genre)) &&
    (!state.platform || g.platforms.includes(state.platform)) &&
    (!state.year || String(g.year) === state.year) &&
    (!state.q || matchesName(g, normalize(state.q)));
  const byId = new Map(games.map(g => [g.id, g]));
  const merged = new Map<string, ReleaseEntry>();
  // Existing catalog records may contribute released games, including unrated ones.
  for (const g of games) {
    if (g.excluded || g.status === 'unconfirmed' || g.datePrecision !== 'day' || !validDate(g.releaseDate)) continue;
    if (!g.status && g.releaseDate > today) continue;
    merged.set(g.id, { ...g, status: g.status ?? 'released', source: g.sources.releaseDate || 'catalog snapshot' });
  }
  // Explicit release feed status/date wins over an older catalog snapshot.
  for (const g of feed) {
    const key = g.id;
    const known = byId.get(key);
    if (known?.excluded) continue;
    const sameDate = known?.releaseDate === g.releaseDate;
    merged.set(key, { ...g, url: g.url || known?.url, cover: g.cover || known?.cover,
      rating: g.status === 'released' && sameDate ? g.rating || known?.rating : g.rating });
  }
  const rows = [...merged.values()].filter(g => g.datePrecision === 'day' && validDate(g.releaseDate) && matches(g));
  const order = (a: ReleaseEntry, b: ReleaseEntry) => a.releaseDate.localeCompare(b.releaseDate) || a.name.localeCompare(b.name);
  const recent = rows.filter(g => g.status === 'released' && g.releaseDate >= cutoff && g.releaseDate <= today &&
    (!state.rating || (validScore(g.rating) && inBand(g, state.rating))))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.name.localeCompare(b.name));
  // A scheduled date passing is not proof of release. Refresh status from a trusted source.
  // Rating filter intentionally does not apply to unreleased titles.
  const upcoming = rows.filter(g => g.status === 'upcoming' && g.releaseDate >= today)
    .sort(order);
  const choose = (rows: ReleaseEntry[], pins: string[] = [], limit = RELEASE_LIMIT) => {
    const byId = new Map(rows.map(row => [row.id, row]));
    const fixed = [...new Set(pins)].flatMap(id => byId.has(id) ? [byId.get(id)!] : []);
    return [...fixed, ...rows.filter(row => !pins.includes(row.id))].slice(0, limit);
  };
  return { recent: choose(recent, options.recentPins, options.recent), upcoming: choose(upcoming, options.upcomingPins, options.upcoming) };
}
