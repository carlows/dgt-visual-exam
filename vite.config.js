import { defineConfig } from 'vite';

// base para GitHub Pages: https://carlows.github.io/dgt-visual-exam/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/dgt-visual-exam/' : '/',
});
