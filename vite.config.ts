import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// VITE_ROUTER=hash  -> сборка одним файлом для артефакта Claude
// VITE_BASE=/repo/  -> сборка для GitHub Pages
export default defineConfig(() => {
  const hash = process.env.VITE_ROUTER === 'hash';
  return {
    base: process.env.VITE_BASE || '/',
    plugins: [react(), ...(hash ? [viteSingleFile()] : [])],
    build: { outDir: hash ? 'dist-artifact' : 'dist' },
    test: { environment: 'node' },
  };
});
