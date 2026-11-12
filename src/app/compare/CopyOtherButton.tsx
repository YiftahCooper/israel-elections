// The small "Copy 2022's …" beside a key number while comparing (Turnout, eligible voters, invalid ballots, the
// threshold, the rules, the agreements). The copy itself loads on first use (copyOther.ts).
import type { ReactNode } from 'react';
import { useL, useLang } from '../i18n.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import type { OtherCopy } from './copyOther.ts';
import type { Reference } from './mode.ts';

/** text: the visible words when several sit together ("The threshold, 3.25%"); otherwise "Copy 2022's" */
export function CopyOtherButton({ refr, what, what_en, what_he, text }: { refr: Reference; what: OtherCopy; what_en: string; what_he: string; text?: ReactNode }): ReactNode {
  const L = useL(), lang = useLang();
  const where = refr.same ? refr.name : refr.year;
  const label = L(refr.same ? `Copy the ${what_en} from ${where}` : `Copy ${where}'s ${what_en}`, `העתקת ${what_he} ${hebrewPrefix('מ', where)}`);
  return <button type="button" className="btn small cmpm-copy-other" data-copy={what} aria-label={label}
    onClick={() => { void import('./copyOther.ts').then((m) => m.copyOther(refr, what, lang)); }}>
    {text ?? L(refr.same ? `Copy from ${where}` : `Copy ${where}'s`, `העתקה ${hebrewPrefix('מ', where)}`)}
  </button>;
}
