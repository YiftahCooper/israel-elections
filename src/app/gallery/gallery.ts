export interface GalleryScenario { name: string; description: string; electionId: string; year: string; tags: string[]; shareLink: string }
export interface GalleryEntry extends GalleryScenario { issue: number; author: string; date: string; likes: number }
const REPO = 'https://github.com/YiftahCooper/israel-elections';
const API = 'https://api.github.com/repos/YiftahCooper/israel-elections/issues?labels=scenario&state=open&per_page=100';
const TTL = 600_000;
const KEY = 'israel-elections:gallery:v1';
export function validShareLink(value: string, site: string): boolean {
  try {
    const url = new URL(value), base = new URL(site);
    return ['https:', 'http:'].includes(url.protocol) && url.origin === base.origin && url.pathname === base.pathname && !url.search && !url.username && !url.password && /^#s=[A-Za-z0-9_-]+$/.test(url.hash);
  } catch { return false; }
}
export const buildBody = (scenario: GalleryScenario) => `Scenario gallery v1\n\n\`\`\`json\n${JSON.stringify(scenario, null, 2)}\n\`\`\``;
export function parseBody(body: string, site: string): GalleryScenario | null {
  try {
    const match = /^Scenario gallery v1\r?\n\s*```json\r?\n([\s\S]*?)\r?\n```\s*$/.exec(body);
    if (!match) return null;
    const p = JSON.parse(match[1]);
    if (!p || !['name', 'description', 'electionId', 'year', 'shareLink'].every(k => typeof p[k] === 'string') || !p.name.trim() || !/^k([1-9]|1\d|2[0-6])$/.test(p.electionId) || !/^\d{4}$/.test(p.year) || !Array.isArray(p.tags) || !p.tags.every((t: unknown) => typeof t === 'string') || !validShareLink(p.shareLink, site)) return null;
    return { name: p.name, description: p.description, electionId: p.electionId, year: p.year, tags: p.tags, shareLink: p.shareLink };
  } catch { return null; }
}
export function publishUrl(scenario: GalleryScenario) {
  return `${REPO}/issues/new?${new URLSearchParams({ labels: `scenario,${scenario.electionId}`, title: scenario.name, body: buildBody(scenario) })}`;
}
export const issueUrl = (issue: number) => `${REPO}/issues/${issue}`;
export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase().replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim();
export function filterEntries(entries: GalleryEntry[], query: string, year: string, tag: string, sort: string) {
  const terms = normalizeSearch(query).split(' ').filter(Boolean);
  return entries.filter(e => (!year || e.year === year) && (!tag || e.tags.includes(tag)) && terms.every(t => normalizeSearch([e.name, e.description, ...e.tags].join(' ')).includes(t)))
    .sort((a, b) => (sort === 'likes' ? b.likes - a.likes : 0) || b.date.localeCompare(a.date) || b.issue - a.issue);
}
interface Snapshot { entries: GalleryEntry[]; timestamp: number }
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export class GalleryClient {
  private snapshot?: Snapshot;
  private attempted = 0;
  private failure?: Error;
  private pending?: Promise<Snapshot>;
  constructor(private site: string, private fetcher: typeof fetch = fetch, private storage?: StorageLike) {
    try {
      const cached = JSON.parse(storage?.getItem(KEY) ?? 'null');
      if (cached && Number.isFinite(cached.timestamp) && cached.timestamp <= Date.now() && Array.isArray(cached.entries) && cached.entries.every((e: GalleryEntry) => parseBody(buildBody(e), site) && Number.isInteger(e.issue) && e.issue > 0 && typeof e.author === 'string' && typeof e.date === 'string' && Number.isFinite(e.likes))) this.snapshot = cached;
    } catch { /* unavailable/corrupt cache */ }
  }
  cached() { return this.snapshot; }
  load(): Promise<Snapshot> {
    if (this.pending) return this.pending;
    if (Date.now() - this.attempted < TTL && this.failure) return Promise.reject(this.failure);
    if (this.snapshot && Date.now() - this.snapshot.timestamp < TTL) return Promise.resolve(this.snapshot);
    this.attempted = Date.now();
    this.pending = this.fetchAll().finally(() => { this.pending = undefined; });
    return this.pending;
  }
  private async fetchAll(): Promise<Snapshot> {
    try {
      const entries: GalleryEntry[] = [];
      // Bounded to ten pages per refresh so one visit cannot consume an IP's hourly quota.
      for (let page = 1; page <= 10; page++) {
        const response = await this.fetcher(`${API}&page=${page}`, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'rate-limit' : 'network');
        const rows: unknown = await response.json();
        if (!Array.isArray(rows)) throw new Error('network');
        for (const row of rows) {
          if (!row || row.pull_request || typeof row.body !== 'string') continue;
          const scenario = parseBody(row.body, this.site);
          if (scenario && Number.isInteger(row.number) && row.number > 0 && typeof row.user?.login === 'string' && typeof row.created_at === 'string' && Number.isFinite(Date.parse(row.created_at))) entries.push({ ...scenario, issue: row.number, author: row.user.login, date: row.created_at, likes: Math.max(0, Number(row.reactions?.['+1']) || 0) });
        }
        if (rows.length < 100) break;
      }
      this.snapshot = { entries, timestamp: Date.now() };
      this.failure = undefined;
      try { this.storage?.setItem(KEY, JSON.stringify(this.snapshot)); } catch { /* memory cache still works */ }
      return this.snapshot;
    } catch (error) {
      this.failure = new Error(error instanceof Error && error.message === 'rate-limit' ? 'rate-limit' : 'network');
      throw this.failure;
    }
  }
}
