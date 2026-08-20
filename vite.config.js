import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// En desarrollo, los intentos de test se persisten en attempts.json (raíz del
// repo) para poder analizarlos después; en producción solo queda localStorage.
function attemptsLogger() {
  const file = resolve(import.meta.dirname, 'attempts.json');
  return {
    name: 'attempts-logger',
    configureServer(server) {
      server.middlewares.use('/__log-attempt', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          try {
            const attempt = JSON.parse(body);
            const all = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
            all.push(attempt);
            writeFileSync(file, JSON.stringify(all, null, 2));
            res.statusCode = 204;
          } catch (e) {
            res.statusCode = 400;
          }
          res.end();
        });
      });
    },
  };
}

// base para GitHub Pages: https://carlows.github.io/dgt-visual-exam/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/dgt-visual-exam/' : '/',
  plugins: [attemptsLogger()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tests: resolve(import.meta.dirname, 'tests.html'),
      },
    },
  },
});
