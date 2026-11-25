import type { CatalogState, Game, Rating } from './types';
import { inBand, normalize } from './catalog';

export type ReleaseEntry = Pick<Game, 'id' | 'name' | 'url' | 'cover' | 'releaseDate' | 'datePrecision' | 'year' | 'platforms' | 'genres' | 'rating'> & {
  status: 'released' | 'upcoming';
  source: string;
};
export const RELEASE_LIMIT = 5;
export const RECENT_DAYS = 90;
export const todayISO = () => new Date().toISOString().slice(0, 10);

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
    return !!end && end <= today && validScore(g.rating);
  });
}

export function selectReleaseBlocks(games: Game[], feed: ReleaseEntry[], state: CatalogState, today = todayISO()) {
  const cutoff = new Date(Date.parse(today + 'T00:00:00Z') - RECENT_DAYS * 86400000).toISOString().slice(0, 10);
  const matches = (g: ReleaseEntry) =>
    (!state.genre || g.genres.includes(state.genre)) &&
    (!state.platform || g.platforms.includes(state.platform)) &&
    (!state.year || String(g.year) === state.year) &&
    (!state.q || normalize(g.name).includes(normalize(state.q)));
  const byName = new Map(games.map(g => [normalize(g.name), g]));
  const merged = new Map<string, ReleaseEntry>();
  // Existing catalog records may contribute released games, including unrated ones.
  for (const g of games) {
    if (g.datePrecision !== 'day' || !validDate(g.releaseDate) || g.releaseDate > today) continue;
    merged.set(normalize(g.name), { ...g, status: 'released', source: g.sources.releaseDate || 'catalog snapshot' });
  }
  // Explicit release feed status/date wins over an older catalog snapshot.
  for (const g of feed) {
    const key = normalize(g.name);
    const known = byName.get(key);
    const sameDate = known?.releaseDate === g.releaseDate;
    merged.set(key, { ...g, url: g.url || known?.url, cover: g.cover || known?.cover,
      rating: g.status === 'released' && sameDate ? g.rating || known?.rating : g.rating });
  }
  const rows = [...merged.values()].filter(g => g.datePrecision === 'day' && validDate(g.releaseDate) && matches(g));
  const order = (a: ReleaseEntry, b: ReleaseEntry) => a.releaseDate.localeCompare(b.releaseDate) || a.name.localeCompare(b.name);
  const recent = rows.filter(g => g.status === 'released' && g.releaseDate >= cutoff && g.releaseDate <= today &&
    (!state.rating || (validScore(g.rating) && inBand(g as Game, state.rating))))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.name.localeCompare(b.name)).slice(0, RELEASE_LIMIT);
  // A scheduled date passing is not proof of release. Refresh status from a trusted source.
  // Rating filter intentionally does not apply to unreleased titles.
  const upcoming = rows.filter(g => g.status === 'upcoming' && g.releaseDate >= today)
    .sort(order).slice(0, RELEASE_LIMIT);
  return { recent, upcoming };
}
