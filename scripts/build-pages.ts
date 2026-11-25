import { copyFileSync } from 'node:fs';
import { build } from 'vite';

process.env.VITE_BASE = '/cyber-best-games-prototype/';
process.env.VITE_FORCE_NOINDEX = '1';
await build();
await import('./prerender');
copyFileSync('dist/index.html', 'dist/404.html');
