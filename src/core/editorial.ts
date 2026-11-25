import copy from '../data/editorial.json';
import { CONFIG } from './config';
import { buildPath } from './route';
import type { CatalogState, Dictionaries } from './types';
import { fillMeta } from './seo';

const paragraphsByPath: Readonly<Record<string, readonly string[]>> = copy;

export function catalogEditorial(state: CatalogState, override?: { heading?: string; body?: string; visible?: boolean; columns?: number }, dict?: Dictionaries) {
  if (state.page !== 1 || state.q || state.rating || state.sort) return undefined;

  if (override?.visible === false) return undefined;
  const path = buildPath(state);
  const paragraphs = paragraphsByPath[path];
  if (!paragraphs && !override?.body) return undefined;
  const resolve = (value: string) => dict ? fillMeta(value, state, dict) : value;

  return { heading: override?.heading ? resolve(override.heading) : path === CONFIG.base ? 'О каталоге' : 'О подборке', paragraphs: paragraphs ?? [], markdown: override?.body ? resolve(override.body) : undefined, columns: override?.columns ?? 3 };
}
