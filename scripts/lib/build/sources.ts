// Paths, the provenance manifest (data/raw/SOURCES.json), hashing and source verification
// shared by every election builder. Nothing here interprets election data.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';
import type { Check } from './validate.ts';

export const ROOT = join(import.meta.dirname, '../../..');
export const RAW = join(ROOT, 'data/raw');
export const OUT = join(ROOT, 'public/data');

export const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');

/** SHA-256 of a file's bytes, memoised per path, size and mtime: several elections hash the same
 *  law and manifest files, and the early verifiers run more than once per build. */
const fileHashes = new Map<string, string>();
export function fileSha256(path: string): string {
  const st = statSync(path);
  const key = `${path}\0${st.size}\0${st.mtimeMs}`;
  let h = fileHashes.get(key);
  if (!h) { h = sha256(readFileSync(path)); fileHashes.set(key, h); }
  return h;
}

export const readJson = <T = any>(path: string): T => JSON.parse(readFileSync(path, 'utf8'));
export const rawJson = <T = any>(file: string): T => readJson<T>(join(RAW, file));

export interface SourceRecord { id: string; file: string; sha256?: string; bytes?: number; retrievedAt?: string }
let manifestCache: { key: string; records: SourceRecord[] } | undefined;
/** The manifest, parsed once per process (re-read if the file changes). Treat as read-only. */
export function manifest(): readonly SourceRecord[] {
  const path = join(RAW, 'SOURCES.json');
  const st = statSync(path);
  const key = `${st.size}\0${st.mtimeMs}`;
  if (manifestCache?.key !== key) manifestCache = { key, records: readJson(path) };
  return manifestCache.records;
}
export const sourceRecord = (id: string) => manifest().find(s => s.id === id);

export interface VerifyOptions {
  /** Polling-station copies live in ignored scratch: when the file is absent, record the manifest
   *  hash without re-hashing (the reconciliation evidence covers it). */
  allowMissingFile?: boolean;
  /** Also compare the manifest's byte count (k13–k15). */
  checkBytes?: boolean;
}
/** Every listed source must have a manifest record with a SHA-256 that matches its retained file.
 *  Returns id → manifest SHA-256 in first-seen order (duplicates collapse). */
export function verifySources(ids: readonly string[], check: Check, opts: VerifyOptions = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of ids) {
    if (id in out) continue;
    const s = sourceRecord(id);
    check(s?.file && s.sha256, `${id}: missing manifest record or hash`);
    const path = join(RAW, s.file);
    if (!(opts.allowMissingFile && !existsSync(path))) {
      check(fileSha256(path) === s.sha256, `${id}: source SHA-256 differs from manifest`);
      if (opts.checkBytes) check(statSync(path).size === s.bytes, `${id}: source byte count differs from manifest`);
    }
    out[id] = s.sha256;
  }
  return out;
}
/** Manifest hashes for ids that have one, skipping the rest (laws or notes without retained files). */
export const manifestHashes = (ids: readonly string[]): Record<string, string> =>
  Object.fromEntries(ids.flatMap(id => { const s = sourceRecord(id); return s?.sha256 ? [[id, s.sha256]] : []; }));

/** The hand-maintained election index (public/data/elections.json); the builder never writes it. */
export interface IndexEntry { id: string; date: string; nameHe: string; nameEn: string; available: boolean; status: Omit<ElectionDataset['status'], 'asOf'> & { asOf?: string } }
export const electionIndex = (): IndexEntry[] => readJson(join(OUT, 'elections.json'));
export const indexEntry = (id: string) => electionIndex().find(e => e.id === id);
