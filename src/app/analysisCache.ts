// Analysis results kept in memory and in this browser's storage, so a screen opened again does not search again.
// The version is derived from the build: a hash of the engine and analysis sources (scripts/analysis-version.ts, through
// vite.config.ts), so results worked out by other code are never read again (audit 12 Nov 2026, c-analysis-code-07).
// The cache is disposable and bounded (count and characters, oldest out first), and the user's own work always wins
// over it: when storage is full, saving work clears it (dropAnalysisCache, called by the store) and tries again
// (c-analysis-code-04).
declare const __ANALYSIS_VERSION__: string;
export const ANALYSIS_VERSION = __ANALYSIS_VERSION__;
const FAMILY = 'israel-elections:analysis:', PREFIX = `${FAMILY}${ANALYSIS_VERSION}:`, INDEX = `${PREFIX}index`;
/** at most this many results kept in storage, together at most this many characters (a list panel's results take
 *  70,000 to 215,000); a result larger than the whole budget is kept in memory only */
export const STORED_ENTRIES = 40, STORED_CHARS = 1_500_000;
const MEMORY_ENTRIES = 120, MEMORY_CHARS = 8_000_000;
const memory = new Map<string, string>();
let memoryChars = 0;
export const encodeAnalysis = (value: unknown) => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? { $bigint: String(v) } : v);
const decode = (value: string) => JSON.parse(value, (_, v) => v && typeof v === 'object' && Object.keys(v).length === 1 && typeof v.$bigint === 'string' ? BigInt(v.$bigint) : v);
// Full input is also checked on read, so a hash collision can never return another calculation.
function address(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
  return PREFIX + (hash >>> 0).toString(16);
}
export function readAnalysis<T>(input: unknown): T | undefined {
  const source = encodeAnalysis(input), key = address(source);
  try {
    const raw = memory.get(key) ?? globalThis.localStorage?.getItem(key);
    if (!raw) return undefined;
    const entry = decode(raw);
    if (entry.source === source) return entry.result as T;
  } catch { /* Private browsing, unavailable storage, or an old/corrupt entry: compute normally. */ }
  return undefined;
}
/** The stored results, oldest first, with their sizes. */
function readIndex(storage: Storage): [string, number][] {
  try {
    const x: unknown = JSON.parse(storage.getItem(INDEX) ?? '[]');
    return Array.isArray(x) ? x.filter((e): e is [string, number] => Array.isArray(e) && typeof e[0] === 'string' && e[0].startsWith(PREFIX) && typeof e[1] === 'number') : [];
  } catch { return []; }
}
export function retainAnalysis(input: unknown, result: unknown): void {
  const source = encodeAnalysis(input), key = address(source), raw = encodeAnalysis({ source, result });
  memoryChars += raw.length - (memory.get(key)?.length ?? 0);
  memory.delete(key); memory.set(key, raw);
  while (memory.size > 1 && (memory.size > MEMORY_ENTRIES || memoryChars > MEMORY_CHARS)) {
    const [old, value] = memory.entries().next().value!;
    memory.delete(old); memoryChars -= value.length;
  }
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    // results kept by other code are never read again; they only take space
    for (const old of Object.keys(storage)) if (old.startsWith(FAMILY) && !old.startsWith(PREFIX)) storage.removeItem(old);
    const index = readIndex(storage).filter(([k]) => k !== key);
    if (raw.length > STORED_CHARS) return;
    // oldest out first, until this one fits the budget
    let chars = index.reduce((n, [, c]) => n + c, 0);
    while (index.length && (index.length + 1 > STORED_ENTRIES || chars + raw.length > STORED_CHARS)) { const [old, c] = index.shift()!; storage.removeItem(old); chars -= c; }
    // never at the cost of other storage: when the browser refuses, older results go first, never anything else
    for (;;) {
      try { storage.setItem(key, raw); break; }
      catch { if (!index.length) { storage.setItem(INDEX, JSON.stringify(index)); return; } storage.removeItem(index.shift()![0]); }
    }
    index.push([key, raw.length]);
    storage.setItem(INDEX, JSON.stringify(index));
  } catch { /* Quota/storage denial does not prevent live calculation or in-session reuse. */ }
}
/** Removes every analysis result kept in this browser's storage (they can always be worked out again); true when any
 *  was removed. Results already in memory are kept for this visit. */
export function dropAnalysisCache(): boolean {
  let dropped = false;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    for (const k of Object.keys(storage)) if (k.startsWith(FAMILY)) { storage.removeItem(k); dropped = true; }
  } catch { /* storage unavailable: nothing to drop */ }
  return dropped;
}
export function cachedAnalysis<T>(input: unknown, compute: () => T): T {
  const cached = readAnalysis<T>(input);
  if (cached !== undefined) return cached;
  const result = compute(); retainAnalysis(input, result); return result;
}
