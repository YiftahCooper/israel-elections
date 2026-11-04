import { defineConfig } from '@playwright/test';

// PW_PORT lets parallel checkouts run end-to-end tests without reusing another checkout's
// preview server (a server already on the port would serve that checkout's build).
const port = Number(process.env.PW_PORT ?? 4174);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  // Tests answer "where do the votes come from" once, as a remembered setting, so vote edits apply at once;
  // tests of the question itself start without it (tests/e2e/list-controls.spec.ts).
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1500, height: 1000 },
    storageState: { cookies: [], origins: [{ origin: `http://localhost:${port}`, localStorage: [{ name: 'israel-elections:vote-source', value: 'proportional' }] }] } },
  webServer: { command: `npx vite preview --port ${port} --strictPort`, url: `http://localhost:${port}`, reuseExistingServer: !process.env.CI && !process.env.PW_PORT },
  outputDir: '.backup-scratch/test-results',
});
