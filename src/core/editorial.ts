import copy from '../data/editorial.json';
import { CONFIG } from './config';
import { buildPath } from './route';
import type { CatalogState } from './types';

const paragraphsByPath: Readonly<Record<string, readonly string[]>> = copy;

export function catalogEditorial(state: CatalogState) {
  if (state.page !== 1 || state.q || state.rating || state.sort) return undefined;

  const path = buildPath(state);
  const paragraphs = paragraphsByPath[path];
  if (!paragraphs) return undefined;

  return { heading: path === CONFIG.base ? 'О каталоге' : 'О подборке', paragraphs };
}
