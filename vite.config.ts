import { validateGovernmentSupport } from './scripts/lib/build/aftermath.ts';
import { readFileSync } from 'node:fs';
import { ELECTION_IDS, type ElectionDataset } from './src/data/schema.ts';
import { validateAftermath, type Aftermath } from './src/data/aftermath-model.ts';
import { compileFamilyRuntime } from './scripts/family-runtime.ts';
import { compileHistoryRuntime } from './scripts/party-history-runtime.ts';
import { compileMkHistory } from './scripts/mk-history-runtime.ts';
import { compileElectionTotals } from './scripts/election-totals-runtime.ts';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { scaleAwareMedia } from './scripts/scale-aware-media.ts';

// base './' so the static build works from any path (GitHub Pages project site, file server).
export default defineConfig({
  base: './',
  // width breakpoints follow the effective width under large text (scripts/scale-aware-media.ts)
  css: { postcss: { plugins: [scaleAwareMedia()] } },
  plugins: [react(), {
    name: 'reviewed-aftermath',
    buildStart() {
      for (const id of ELECTION_IDS) {
        const history = JSON.parse(readFileSync(`data/meta/aftermath/${id}.json`, 'utf8')) as Aftermath;
        if (history.status !== 'reviewed') continue;
        const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
        const errors = validateAftermath(history, ds);
        if (errors.length) this.error(`${id} aftermath: ${errors.join('; ')}`);
        if (history.government) for (const snapshot of [history.government, ...(history.government.changes ?? []).filter(c => c.coalition)]) {
          validateGovernmentSupport(snapshot, history.sources, `${id}/government`);
        }
      }
    },
  }, {
    name: 'family-runtime',
    resolveId(id) { if (id === 'virtual:family-runtime') return '\0family-runtime'; },
    load(id) { if (id === '\0family-runtime') return `export default ${JSON.stringify(compileFamilyRuntime())}`; },
    generateBundle() { this.emitFile({ type:'asset', fileName:'data/families-runtime.json', source:JSON.stringify(compileFamilyRuntime()) }); },
  }, {
    name: 'party-history-runtime',
    resolveId(id) { if (id === 'virtual:party-history') return '\0party-history'; },
    load(id) { if (id === '\0party-history') return `export default ${JSON.stringify(compileHistoryRuntime())}`; },
  }, {
    // each MK's own history: its own chunk, loaded the first time a name or seat could open one
    name: 'mk-history-runtime',
    resolveId(id) { if (id === 'virtual:mk-history') return '\0mk-history'; },
    load(id) { if (id === '\0mk-history') return `export default ${JSON.stringify(compileMkHistory())}`; },
  }, {
    name: 'election-totals',
    resolveId(id) { if (id === 'virtual:election-totals') return '\0election-totals'; },
    load(id) { if (id === '\0election-totals') return `export default ${JSON.stringify(compileElectionTotals())}`; },
  }],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
