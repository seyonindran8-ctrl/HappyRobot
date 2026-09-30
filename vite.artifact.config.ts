import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Self-contained build for sharing as a hosted page: JS, CSS and fonts are
// inlined; files in public/ (logo marks) are copied alongside and referenced
// relatively.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-artifact',
    assetsInlineLimit: 100_000_000,
  },
});
