import { describe, it, expect } from 'vitest';
import type { Game } from '../src/core/types';
import { catalogEligibleGames, selectReleaseBlocks, type ReleaseEntry } from '../src/core/releases';
const today = '2026-11-25';
const mk = (id: string, overrides: Partial<Game> = {}): Game => ({
  id, name: id, subscribers: 0, releaseDate: '2026-11-20', datePrecision: 'day', year: 2026,
  platforms: ['pc'], genres: ['ekshen-igry'], wikidata: '', sources: {},
  rating: { value: 8.5, source: 'IGN', original: '8.5/10' }, ...overrides
});
const feed = (id: string, overrides: Partial<ReleaseEntry> = {}): ReleaseEntry => ({
  ...mk(id, { rating: undefined, releaseDate: '2026-12-01' }), status: 'upcoming', source: 'test', ...overrides
});
describe('release blocks and catalog eligibility', () => {
  it('excludes unrated, invalid, future and not-yet-ended imprecise dates from catalog', () => {
    expect(catalogEligibleGames([mk('ok'), mk('zero', {rating:{value:0,source:'IGN',original:'0/10'}}),
      mk('no score',{rating:undefined}), mk('future',{releaseDate:'2026-12-01'}),
      mk('year only',{datePrecision:'year',releaseDate:'2026-01-01'}),
      mk('bad',{releaseDate:'2026-02-30'})],today).map(g=>g.id)).toEqual(['ok','zero']);
  });
  it('returns up to five results per block, ordered by date, not current catalog page/sort', () => {
    const games = Array.from({length:7},(_,i)=>mk('r'+i,{releaseDate:'2026-11-1'+i}));
    const upcoming = Array.from({length:7},(_,i)=>feed('u'+i,{releaseDate:'2026-12-1'+i}));
    const result = selectReleaseBlocks(games,upcoming,{page:4,sort:'old'},today);
    expect(result.recent.map(g=>g.id)).toEqual(['r6','r5','r4','r3','r2']);
    expect(result.upcoming.map(g=>g.id)).toEqual(['u0','u1','u2','u3','u4']);
  });
  it('matches genre/platform/year, does not substitute unrelated games, and allows unrated future titles', () => {
    const result = selectReleaseBlocks([mk('r'),mk('old',{releaseDate:'2024-01-01',year:2024})],
      [feed('u'),feed('ps',{platforms:['playstation-5']}),feed('expired',{releaseDate:'2026-11-01'})],
      {page:1,platform:'pc',genre:'ekshen-igry',year:'2026',rating:'8-10'},today);
    expect(result.recent.map(g=>g.id)).toEqual(['r']);
    expect(result.upcoming.map(g=>g.id)).toEqual(['u']);
  });
  it('does not auto-promote a past scheduled release', () => {
    const result = selectReleaseBlocks([mk('same')],[feed('same',{releaseDate:'2026-11-22'})],{page:1},today);
    expect(result.recent).toEqual([]); expect(result.upcoming).toEqual([]);
  });
});
