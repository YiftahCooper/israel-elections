import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// A slash between a Latin word and a Hebrew word ("OpenStreetMap/אוצ׳ה") reorders under the
// bidi algorithm and renders garbled in Hebrew; write "בין X לבין Y" instead.
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
});
const MIXED_SLASH = /[A-Za-z0-9)][/][א-ת]|[א-ת][/][A-Za-z]/;

describe('Hebrew copy', () => {
  it('never joins Latin and Hebrew words with a slash', () => {
    // only quoted text: a regular expression such as /[^a-z]+/g, 'x').replace(/יי/ is code, not copy
    const QUOTED = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
    const hits = files('src').flatMap((f) => readFileSync(f, 'utf8').split('\n')
      .map((line, i) => ((line.match(QUOTED) ?? []).some((q) => MIXED_SLASH.test(q)) ? `${f}:${i + 1}` : ''))
      .filter(Boolean));
    expect(hits).toEqual([]);
  });
});
