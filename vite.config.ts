import { checkRegister } from './scripts/gaps-register.ts';
import { compileFamilyRuntime } from './scripts/family-runtime.ts';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' so the static build works from any path (GitHub Pages project site, file server).
export default defineConfig({
  base: './',
  plugins: [{ name: 'data-gaps-register', apply: 'build', buildStart() { checkRegister(); } }, react(), {
    name: 'family-runtime',
    resolveId(id) { if (id === 'virtual:family-runtime') return '\0family-runtime'; },
    load(id) { if (id === '\0family-runtime') return `export default ${JSON.stringify(compileFamilyRuntime())}`; },
    generateBundle() { this.emitFile({ type:'asset', fileName:'data/families-runtime.json', source:JSON.stringify(compileFamilyRuntime()) }); },
  }],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
