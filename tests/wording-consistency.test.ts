import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Wording and consistency rules for on-screen strings (19 Nov 2026 audit). Each block scans the source or data that
// reaches the screen and fails on any instance of the family, so a later edit cannot bring one back.
const files = (dir: string, re = /\.(ts|tsx)$/): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p, re) : re.test(f) ? [p] : [];
});
const QUOTED = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
/** Every quoted string in src/, with file:line, comments skipped. */
const srcStrings = (): { at: string; s: string }[] => files('src').flatMap((f) => readFileSync(f, 'utf8').split('\n')
  .flatMap((line, i) => /^\s*(\/\/|\*|\/\*)/.test(line) ? [] : (line.match(QUOTED) ?? []).map((s) => ({ at: `${f}:${i + 1}`, s }))));

describe('complexity, not "level", in Hebrew', () => {
  // Simple, Standard and Expert are complexities (owner, 19 Nov 2026). רמה alone is "level"; the only Hebrew level
  // word allowed is רמת מורכבות. Other meanings stay: date precision (ברמת שנה), a turnout level (לרמת 2015), and
  // the Settings search synonyms, which must keep the words people type.
  const ALLOWED = [/ברמת שנה/, /לרמת 2015/, /synonyms|מצב רמה פירוט/];
  it('says רמת מורכבות wherever a level word is used', () => {
    const hits = srcStrings().filter(({ s }) => /(^|[^א-ת])[בלמוה]?(רמה|רמת|רמות|הרמה)(?![א-ת])/.test(s.replace(/רמת המורכבות|רמת מורכבות/g, ''))
      && !ALLOWED.some((a) => a.test(s))).map(({ at, s }) => `${at} ${s.slice(0, 80)}`);
    expect(hits).toEqual([]);
  });
  it('calls Simple פשוט, never בסיסי', () => {
    expect(srcStrings().filter(({ s }) => /בסיסי/.test(s)).map(({ at }) => at)).toEqual([]);
  });
});
