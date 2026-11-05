/** Build the public gallery once for all visitors. Run on the trusted default branch only. */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseBody, retryAfterMs, type GalleryEntry } from '../src/app/gallery/gallery.ts';
const site = 'https://yiftahcooper.github.io/israel-elections/';
const api = 'https://api.github.com/repos/YiftahCooper/israel-elections/issues?labels=scenario&state=open&per_page=100';
const entries: GalleryEntry[] = [];
const input = process.argv[2];
const pages = input ? JSON.parse(readFileSync(input, 'utf8')) as unknown[][] : null;
for (let page = 1; ; page++) {
  let rows;
  if (pages) { rows = pages[page - 1] ?? []; }
  else {
    if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN required for index generation');
    let response: Response;
    // A 429, or a 403 with the quota spent, is retried after the time GitHub asks for (at most twice, a minute
    // each); a longer wait fails the run rather than deploying an empty index.
    for (let attempt = 0; ; attempt++) {
      response = await fetch(`${api}&page=${page}`, { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }, signal: AbortSignal.timeout(30000) });
      const limited = response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0');
      const reset = Number(response.headers.get('x-ratelimit-reset'));
      const wait = retryAfterMs(response.headers.get('retry-after')) ?? (Number.isFinite(reset) && reset > 0 ? reset * 1000 - Date.now() : 60_000);
      if (!limited || attempt >= 2 || wait > 60_000) break;
      await new Promise(done => setTimeout(done, Math.max(1000, wait)));
    }
    if (!response.ok) throw new Error(`Gallery API returned ${response.status}`);
    rows = await response.json();
  }
  if (!Array.isArray(rows)) throw new Error('Invalid issue response');
  for (const row of rows) {
    if (!row || row.pull_request || typeof row.body !== 'string') continue;
    const scenario = parseBody(row.body, site);
    if (scenario && Number.isInteger(row.number) && row.number > 0 && typeof row.user?.login === 'string' && typeof row.created_at === 'string' && Number.isFinite(Date.parse(row.created_at)))
      entries.push({ ...scenario, issue: row.number, author: row.user.login, date: row.created_at, likes: Math.max(0, Number(row.reactions?.['+1']) || 0) });
  }
  if (rows.length < 100) break;
}
writeFileSync(process.argv[3] ?? 'public/data/scenarios.json', JSON.stringify({ timestamp: Date.now(), entries }, null, 2) + '\n');
console.log(`Indexed ${entries.length} community scenarios`);
