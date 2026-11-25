import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { build } from 'vite';

process.env.VITE_BASE = '/cyber-best-games-prototype/';
process.env.VITE_FORCE_NOINDEX = '1';
await build();
await import('./prerender');
copyFileSync('dist/index.html', 'dist/404.html');
mkdirSync('dist/admin/catalog', { recursive: true });
const admin = readFileSync('dist/index.html', 'utf8').replace(/<title>.*?<\/title>/, '<title>Управление каталогом — Кибер</title>');
writeFileSync('dist/admin/catalog/index.html', admin);
