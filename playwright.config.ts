import { defineConfig } from '@playwright/test';

// PW_PORT lets parallel checkouts run end-to-end tests without reusing another checkout's
// preview server (a server already on the port would serve that checkout's build).
const port = Number(process.env.PW_PORT ?? 4174);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1500, height: 1000 } },
  webServer: { command: `npx vite preview --port ${port} --strictPort`, url: `http://localhost:${port}`, reuseExistingServer: !process.env.CI && !process.env.PW_PORT },
  outputDir: '.backup-scratch/test-results',
});
