import { defineConfig } from 'vite';

// base './' keeps the build working from any sub-path (GitHub Pages, a plain folder).
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
