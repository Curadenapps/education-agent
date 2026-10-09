import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds to one self-contained HTML file (dist/index.html): open it by
// double-click, attach it to an email, or publish it as a link. No server needed.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  server: { fs: { allow: ['..', '../..'] } }, // logos live in /assets at the repo root
});
