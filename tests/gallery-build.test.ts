import { expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildBody, validSnapshot } from '../src/app/gallery/gallery.ts';
it('builds a valid static index from issue pages while omitting unsafe links and PRs', () => {
  const root = resolve('.backup-scratch/gallery-generator-test'); mkdirSync(root, { recursive: true });
  const dir = mkdtempSync(`${root}/case-`);
  try {
    const site = 'https://yiftahcooper.github.io/israel-elections/';
    const scenario = { name: 'Scenario', description: 'Test', electionId: 'k25', year: '2022', tags: [], shareLink: `${site}#s=abc` };
    const issue = { number: 1, body: buildBody(scenario), user: { login: 'example' }, created_at: '2026-01-01', reactions: { '+1': 2 } };
    const input = `${dir}/issues.json`, output = `${dir}/index.json`;
    writeFileSync(input, JSON.stringify([[issue, { ...issue, number: 2, pull_request: {} }, { ...issue, number: 3, body: buildBody({ ...scenario, shareLink: 'https://evil.example/#s=abc' }) }]]));
    execFileSync(process.execPath, ['scripts/build-gallery.ts', input, output]);
    const index = JSON.parse(readFileSync(output, 'utf8'));
    expect(validSnapshot(index, site)).toBe(true);
    expect(index.entries).toEqual([{ ...scenario, issue: 1, author: 'example', date: '2026-01-01', likes: 2 }]);
  } finally { rmSync(dir, { recursive: true }); }
});
