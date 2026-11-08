import { defineConfig } from '@playwright/test';

// PW_PORT lets parallel checkouts run end-to-end tests without reusing another checkout's
// preview server (a server already on the port would serve that checkout's build).
const port = Number(process.env.PW_PORT ?? 4174);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  // Shared machine: at most 2 browser workers unless PW_WORKERS says otherwise (Playwright's default is half the CPUs).
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 2,
  // Older tests' figures were drawn at two decimal places, so they keep Max decimal places at 2 (their own seeds too).
  // Ordinary tests pre-answer action-time questions (joint lists stay whole, as their baselines were drawn); preference tests clear these answers.
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1500, height: 1000 },
    storageState: { cookies: [], origins: [{ origin: `http://localhost:${port}`, localStorage: [{ name: 'israel-elections:preferences', value: '{"voteSource":"proportional","comparison":"reference","jointSeats":"off"}' }, { name: 'israel-elections:settings', value: '{"v":2,"values":{"decimals":2}}' }] }] } },
  webServer: { command: `npx vite preview --port ${port} --strictPort`, url: `http://localhost:${port}`, reuseExistingServer: !process.env.CI && !process.env.PW_PORT },
  outputDir: '.backup-scratch/test-results',
});
