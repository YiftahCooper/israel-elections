// Versioned by algorithm contract: bump when allocation/search semantics change.
const PREFIX = 'israel-elections:analysis:v1:';
const memory = new Map<string, string>();
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
export function retainAnalysis(input: unknown, result: unknown): void {
  const source = encodeAnalysis(input), key = address(source), raw = encodeAnalysis({ source, result });
  memory.set(key, raw);
  if (memory.size > 120) memory.delete(memory.keys().next().value!);
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    // Bound retained working results; never evict scenario saves or other app settings.
    const keys = Object.keys(storage).filter(k => k.startsWith(PREFIX));
    if (keys.length >= 120 && !storage.getItem(key)) storage.removeItem(keys[0]);
    try { storage.setItem(key, raw); }
    catch {
      for (const old of keys) {
        if (old === key) continue;
        storage.removeItem(old);
        try { storage.setItem(key, raw); return; } catch { /* Try freeing another cached result. */ }
      }
    }
  } catch { /* Quota/storage denial does not prevent live calculation or in-session reuse. */ }
}
export function cachedAnalysis<T>(input: unknown, compute: () => T): T {
  const cached = readAnalysis<T>(input);
  if (cached !== undefined) return cached;
  const result = compute(); retainAnalysis(input, result); return result;
}
