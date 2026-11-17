// docs/source-policy.md, "Outlets not used": no data record may cite an excluded outlet, by address or by publisher.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { excludedOutlet } from '../../../src/data/evidence.ts';

const ROOT = resolve(import.meta.dirname, '../../..');
/** Where source records live: the curated records, the research records the build reads, the source manifest. */
export const SOURCE_RECORDS = ['data/meta', 'data/research', 'data/raw/SOURCES.json'];
const PUBLISHER = /^(?:publisher(?:En|He)?|outlet|credit)$/i;

const jsonFiles = (path: string): string[] => !existsSync(path) ? [] : statSync(path).isDirectory()
  ? readdirSync(path).sort().flatMap(n => jsonFiles(join(path, n))) : path.endsWith('.json') ? [path] : [];

/** Every place in a JSON value that names an excluded outlet: any web address on its host, or a publisher field. */
export function excludedOutletHits(value: unknown, label: string): string[] {
  const hits: string[] = [];
  const visit = (v: unknown, path: string, key = '') => {
    if (typeof v === 'string') {
      const outlet = /^https?:\/\//i.test(v) ? excludedOutlet(v) : PUBLISHER.test(key) ? excludedOutlet('', v) : undefined;
      if (outlet) hits.push(`${label} ${path}: ${outlet}`);
    } else if (Array.isArray(v)) v.forEach((x, i) => visit(x, `${path}[${i}]`, key));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) visit(x, `${path}.${k}`, k);
  };
  visit(value, '$');
  return hits;
}

/** Scans the given files or folders (default: SOURCE_RECORDS) and returns every hit. */
export function scanExcludedOutlets(paths: readonly string[] = SOURCE_RECORDS, root = ROOT): string[] {
  return paths.flatMap(p => jsonFiles(resolve(root, p))).flatMap(f => excludedOutletHits(JSON.parse(readFileSync(f, 'utf8')), relative(root, f)));
}
