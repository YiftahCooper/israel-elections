import { compileFamilyRuntime } from './scripts/family-runtime.ts';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { scaleAwareMedia } from './scripts/scale-aware-media.ts';

// base './' so the static build works from any path (GitHub Pages project site, file server).
export default defineConfig({
  base: './',
  // width breakpoints follow the effective width under large text (scripts/scale-aware-media.ts)
  css: { postcss: { plugins: [scaleAwareMedia()] } },
  plugins: [react(), {
    name: 'family-runtime',
    resolveId(id) { if (id === 'virtual:family-runtime') return '\0family-runtime'; },
    load(id) { if (id === '\0family-runtime') return `export default ${JSON.stringify(compileFamilyRuntime())}`; },
    generateBundle() { this.emitFile({ type:'asset', fileName:'data/families-runtime.json', source:JSON.stringify(compileFamilyRuntime()) }); },
  }],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
