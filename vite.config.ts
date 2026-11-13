import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` makes the built site work from any sub-path,
// e.g. https://<user>.github.io/<repo>/ on GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
});
