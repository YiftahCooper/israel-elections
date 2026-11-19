import { describe, expect, it } from 'vitest';
import { aftermathRecords } from '../src/data/aftermath-runtime.ts';

// V2 fault A3 (19 Nov 2026): the project's own working terms reached visitors: "The selection window ends on election
// day." (1961, with its Hebrew twin) and "the formation-list coalition total" (1970). No text shown on the page may use
// the research process's words.
const INTERNAL = /selection window|formation-list|qualifying chronolog|evidence family|this record’s|חלון האירועים|חלון הבחירה/i;

describe('After the election speaks to visitors', () => {
  it('no displayed text, in either language, uses the research process’s words', () => {
    let texts = 0;
    const walk = (x: unknown, path: string) => {
      if (Array.isArray(x)) x.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) {
        if (k === 'candidatesPending' || k === 'sources' || k === 'cites') continue; // research records, never displayed
        if (typeof v === 'string' && /^text(En|He)$/.test(k)) { texts++; expect(v, `${path}.${k}`).not.toMatch(INTERNAL); }
        else walk(v, `${path}.${k}`);
      }
    };
    for (const r of Object.values(aftermathRecords)) walk(r, r!.electionId);
    expect(texts).toBeGreaterThan(300);
  });
});
