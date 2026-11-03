import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the static build works from any path (GitHub Pages project site, file server).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
