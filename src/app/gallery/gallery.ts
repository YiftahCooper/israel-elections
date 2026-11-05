export interface GalleryScenario { identityColor?: string; name: string; description: string; electionId: string; year: string; tags: string[]; shareLink: string }
export interface GalleryEntry extends GalleryScenario { issue: number; author: string; date: string; likes: number }
const REPO = 'https://github.com/YiftahCooper/israel-elections';
const TTL = 600_000;
const KEY = 'israel-elections:gallery:v1';
const RETRY_KEY = 'israel-elections:gallery:retry:v1';
const DAY = 86_400_000;
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
    return { ...(typeof p.identityColor === 'string' ? { identityColor: p.identityColor } : {}), name: p.name, description: p.description, electionId: p.electionId, year: p.year, tags: p.tags, shareLink: p.shareLink };
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
export interface Snapshot { entries: GalleryEntry[]; timestamp: number; fetchedAt?: number }
/** Shared validation for disk index and browser cache; never trust public issue content. */
export function validSnapshot(value: unknown, site: string): value is Snapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Snapshot;
  return (v.fetchedAt === undefined || (Number.isFinite(v.fetchedAt) && v.fetchedAt > 0 && v.fetchedAt <= Date.now())) && Number.isFinite(v.timestamp) && v.timestamp > 0 && v.timestamp <= Date.now() && Array.isArray(v.entries) && v.entries.every(e =>
    e && parseBody(buildBody(e), site) && Number.isInteger(e.issue) && e.issue > 0 && typeof e.author === 'string' &&
    typeof e.date === 'string' && Number.isFinite(Date.parse(e.date)) && Number.isFinite(e.likes) && e.likes >= 0);
}
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export type GalleryFailure = 'rate-limit' | 'network';
/** A failed load: its kind and when the next attempt is allowed. */
export class GalleryError extends Error {
  retryAt: number;
  constructor(kind: GalleryFailure, retryAt: number) { super(kind); this.retryAt = retryAt; }
}
/** Milliseconds a Retry-After header asks for (delta-seconds or an HTTP date), or null. */
export function retryAfterMs(header: string | null, now = Date.now()): number | null {
  if (!header?.trim()) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds >= 0 ? seconds * 1000 : null;
  const date = Date.parse(header);
  return Number.isFinite(date) ? Math.max(0, date - now) : null;
}
/** Reads the community index that the Pages workflow builds once for everyone (scripts/build-gallery.ts).
 *  Visitors' browsers never call the GitHub API, so no visit can use up anyone's GitHub quota. The index is
 *  cached for ten minutes; a failure waits at least ten minutes, or longer when a 429/503 says Retry-After,
 *  and that wait is kept in storage so reloading the page does not retry early. Stale entries stay visible. */
export class GalleryClient {
  private snapshot?: Snapshot;
  private backoff?: { kind: GalleryFailure; until: number };
  private pending?: Promise<Snapshot>;
  private site: string;
  private fetcher: typeof fetch;
  private storage?: StorageLike;
  constructor(site: string, fetcher: typeof fetch = (input, init) => fetch(input, init), storage?: StorageLike) {
    this.site = site; this.fetcher = fetcher; this.storage = storage;
    try {
      const cached = JSON.parse(storage?.getItem(KEY) ?? 'null');
      if (validSnapshot(cached, site)) this.snapshot = cached;
    } catch { /* unavailable/corrupt cache */ }
    try {
      const b = JSON.parse(storage?.getItem(RETRY_KEY) ?? 'null');
      if (b && (b.kind === 'rate-limit' || b.kind === 'network') && Number.isFinite(b.until) && b.until > Date.now() && b.until <= Date.now() + DAY) this.backoff = b;
    } catch { /* unavailable/corrupt */ }
  }
  cached() { return this.snapshot; }
  load(): Promise<Snapshot> {
    if (this.pending) return this.pending;
    if (this.backoff && Date.now() < this.backoff.until) return Promise.reject(new GalleryError(this.backoff.kind, this.backoff.until));
    if (this.snapshot && Date.now() - (this.snapshot.fetchedAt ?? this.snapshot.timestamp) < TTL) return Promise.resolve(this.snapshot);
    this.pending = this.fetchIndex().finally(() => { this.pending = undefined; });
    return this.pending;
  }
  private remember(snapshot: Snapshot) {
    this.snapshot = snapshot;
    this.backoff = undefined;
    try { this.storage?.setItem(KEY, JSON.stringify(snapshot)); this.storage?.setItem(RETRY_KEY, 'null'); } catch { /* memory cache still works */ }
    return snapshot;
  }
  private fail(kind: GalleryFailure, wait: number) {
    this.backoff = { kind, until: Date.now() + Math.min(DAY, Math.max(TTL, wait)) };
    try { this.storage?.setItem(RETRY_KEY, JSON.stringify(this.backoff)); } catch { /* memory backoff still works */ }
    return new GalleryError(kind, this.backoff.until);
  }
  private async fetchIndex(): Promise<Snapshot> {
    let response: Response;
    try { response = await this.fetcher(new URL('./data/scenarios.json', this.site).href, { signal: AbortSignal.timeout(15000) }); }
    catch { throw this.fail('network', TTL); }
    if (response.status === 429 || response.status === 503)
      throw this.fail(response.status === 429 ? 'rate-limit' : 'network', retryAfterMs(response.headers.get('Retry-After')) ?? TTL);
    if (!response.ok) throw this.fail('network', TTL);
    let index: unknown;
    try { index = await response.json(); } catch { throw this.fail('network', TTL); }
    // the published index is validated exactly like issue bodies before exposing any links
    if (!validSnapshot(index, this.site)) throw this.fail('network', TTL);
    return this.remember({ entries: index.entries, timestamp: index.timestamp, fetchedAt: Date.now() });
  }
}
