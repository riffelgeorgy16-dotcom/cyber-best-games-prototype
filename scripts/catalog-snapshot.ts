import { readFileSync } from 'node:fs';
import { parseAdmin } from '../src/admin/model';

export function readCatalogSnapshot(path = process.env.CATALOG_ADMIN_STATE) {
  return path ? parseAdmin(JSON.parse(readFileSync(path, 'utf8'))) : null;
}
