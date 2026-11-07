import { readFileSync } from 'node:fs';
import { ELECTION_IDS, type ElectionDataset } from './src/data/schema.ts';
import { validateAftermath, type Aftermath } from './src/data/aftermath-model.ts';
import { compileFamilyRuntime } from './scripts/family-runtime.ts';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' so the static build works from any path (GitHub Pages project site, file server).
export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'reviewed-aftermath',
    buildStart() {
      for (const id of ELECTION_IDS) {
        const history = JSON.parse(readFileSync(`data/meta/aftermath/${id}.json`, 'utf8')) as Aftermath;
        if (history.status !== 'reviewed') continue;
        const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
        const errors = validateAftermath(history, ds);
        if (errors.length) this.error(`${id} aftermath: ${errors.join('; ')}`);
      }
    },
  }, {
    name: 'family-runtime',
    resolveId(id) { if (id === 'virtual:family-runtime') return '\0family-runtime'; },
    load(id) { if (id === '\0family-runtime') return `export default ${JSON.stringify(compileFamilyRuntime())}`; },
    generateBundle() { this.emitFile({ type:'asset', fileName:'data/families-runtime.json', source:JSON.stringify(compileFamilyRuntime()) }); },
  }],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
