import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Every source record that pins a built dataset by hash must match the file on disk,
// so a rebuild without a fingerprint refresh fails here instead of shipping stale evidence.
const files = ['data/meta/parties.json', 'data/meta/party-lineage.json'];
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

describe('dataset fingerprints', () => {
  for (const file of files) {
    it(`${file} pins current public datasets`, () => {
      const pins: [string, string][] = [];
      const walk = (v: unknown) => {
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === 'object') {
          const o = v as Record<string, unknown>;
          if (typeof o.locator === 'string' && /^public\/data\/k\d+\.json$/.test(o.locator) && typeof o.sha256 === 'string') pins.push([o.locator, o.sha256]);
          Object.values(o).forEach(walk);
        }
      };
      walk(JSON.parse(readFileSync(file, 'utf8')));
      expect(pins.length).toBeGreaterThan(0);
      const stale = pins.filter(([path, hash]) => sha(path) !== hash).map(([path]) => path);
      expect(stale, 'refresh with: python3 -I .backup-scratch/integration/resolve.py refresh').toEqual([]);
    });
  }
});
