import type { Game } from '../core/types';
import type { ReaderRating } from './ReaderRating';

export const READER_RATINGS_KEY = 'cyber-best-games.reader-ratings.v1';

function isReaderRating(value: unknown): value is ReaderRating {
  if (!value || typeof value !== 'object') return false;
  const { score, mode, criteria } = value as Record<string, unknown>;
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 1 || score > 10) return false;
  if (mode === 'quick') return Number.isInteger(score);
  return mode === 'detailed'
    && !!criteria && typeof criteria === 'object' && !Array.isArray(criteria)
    && Object.values(criteria).every((mark) => Number.isInteger(mark) && mark >= 1 && mark <= 10);
}

export function readReaderRatings(gamesById: ReadonlyMap<string, Game>) {
  try {
    const entries: unknown = JSON.parse(window.localStorage.getItem(READER_RATINGS_KEY) ?? '[]');
    const ratings = new Map<Game, ReaderRating>();
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (!Array.isArray(entry) || typeof entry[0] !== 'string' || !isReaderRating(entry[1])) continue;
        const game = gamesById.get(entry[0]);
        if (game) ratings.set(game, entry[1]);
      }
    }
    return ratings;
  } catch {
    return undefined;
  }
}

export function writeReaderRatings(ratings: ReadonlyMap<Game, ReaderRating>) {
  try {
    const entries = Array.from(ratings, ([game, rating]) => [game.id, rating]);
    window.localStorage.setItem(READER_RATINGS_KEY, JSON.stringify(entries));
  } catch {
    // Keep the current tab usable when the browser blocks local storage.
  }
}
