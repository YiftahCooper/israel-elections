/** English names for locality result rows, resolved from retained CBS locality lists (build time only). */
export interface CbsNameRecord { code: number; year: number; nameHe: string; nameEn: string }
export type LocalityNameSource = 'cbs' | 'project';
/** Index-aligned with the election's locality rows; '' for envelope rows. `project` lists rows whose English name
 * is not in any retained CBS list and was written by this project (labelled in the interface). */
export interface LocalityNames { names: string[]; project: number[]; hebrew?: HebrewLocalityName[] }

/** Spelling-insensitive Hebrew key: drops niqqud, CBS footnote asterisks, punctuation, spaces, and the
 * doubled yod/vav of full spelling (CBS writes הרצלייה where results write הרצליה). */
export function hebrewNameKey(value: string): string {
  // collapse within words first, so "צוקי ים" never becomes "צוקים"
  return value.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/יי/g, 'י').replace(/וו/g, 'ו').replace(/ /g, '');
}

const isCaps = (s: string) => /[A-Z]/.test(s) && s === s.toUpperCase();
/** Whitespace, hyphen and bracket spacing tidied; older CBS files are all capitals, so title-case those. */
export function tidyCbsEnglish(value: string): string {
  let s = value.replace(/\*/g, '').replace(/\s+/g, ' ').replace(/\s*-\s*/g, '-').replace(/(\S)\(/g, '$1 (').trim();
  if (isCaps(s)) s = s.toLowerCase().replace(/(^|[\s\-(])(\p{L})/gu, (_, p: string, c: string) => p + c.toUpperCase());
  return s;
}

function pick(records: CbsNameRecord[], year: number): string {
  const [best] = [...records].sort((a, b) => Number(isCaps(a.nameEn)) - Number(isCaps(b.nameEn)) || Math.abs(a.year - year) - Math.abs(b.year - year) || a.year - b.year);
  return tidyCbsEnglish(best.nameEn);
}

/**
 * CBS code first (preferring a record with the row's own Hebrew name, so a merged or renamed locality keeps its
 * name of that era); rows without a code (2006) join by exact spelling-insensitive Hebrew name, or by a unique
 * prefix when the results file truncated the name. Only a single CBS code may match. Returns null otherwise.
 */
export function resolveLocalityEnglish(row: { code: number | null; nameHe: string }, year: number, records: CbsNameRecord[]): string | null {
  const named = records.filter(r => r.nameEn.trim());
  const key = hebrewNameKey(row.nameHe);
  if (row.code !== null && row.code > 0) {
    const forCode = named.filter(r => r.code === row.code);
    if (forCode.length) {
      const sameName = forCode.filter(r => hebrewNameKey(r.nameHe) === key);
      return pick(sameName.length ? sameName : forCode, year);
    }
  }
  // one CBS code, or several codes that CBS spells identically in English (e.g. two "Sansana" codes)
  const unique = (rs: CbsNameRecord[]) => rs.length && (new Set(rs.map(r => r.code)).size === 1 || new Set(rs.map(r => tidyCbsEnglish(r.nameEn).toLowerCase())).size === 1) ? rs : null;
  const exact = unique(named.filter(r => hebrewNameKey(r.nameHe) === key));
  if (exact) return pick(exact, year);
  // the 2006 file cuts names at 17 characters ("מודיעין-מכבים-רעו"); require a long enough stem
  const prefix = key.length >= 8 ? unique(named.filter(r => hebrewNameKey(r.nameHe).startsWith(key))) : null;
  return prefix ? pick(prefix, year) : null;
}

/** A location requires one code, never merely one English spelling. An ambiguous exact name must not fall
 * through to prefix matching. Uses the same normalization and minimum truncated stem as English labels. */
export function resolveLocalityCode(nameHe: string, records: CbsNameRecord[]): number | null {
  const key = hebrewNameKey(nameHe);
  if (!key) return null;
  const exact = records.filter(r => hebrewNameKey(r.nameHe) === key);
  const candidates = exact.length ? exact : key.length >= 8 ? records.filter(r => hebrewNameKey(r.nameHe).startsWith(key)) : [];
  const codes = new Set(candidates.map(r => r.code));
  return codes.size === 1 ? [...codes][0] : null;
}

export type HebrewNameReason = 'formatting' | 'truncation' | 'spelling' | 'rename-merger' | 'other' | 'no-cbs';
export interface HebrewLocalityName {
  name: string;
  source: 'cbs' | 'cec';
  year?: number;
  conflict?: string;
  reason?: HebrewNameReason;
  parenthesesRepaired?: boolean;
  /** Unclosed source qualifier remains after a rejected substitution; disclose CBS separately. */
  truncated?: boolean;
}

/** Repair reversed pairs first, then unmatched closing brackets left by fixed-width truncation.
 * Do not complete a cut-off word or invent its closing bracket. */
export function repairCecParentheses(value: string): string {
  const paired = value.replace(/\)([^()]*[\p{L}\p{N}][^()]*)\(/gu, '($1)');
  let depth = 0;
  return [...paired].map(c => {
    if (c === '(') { depth++; return c; }
    if (c === ')') { if (depth) { depth--; return c; } depth++; return '('; }
    return c;
  }).join('');
}
export function tidyCecHebrew(value: string): string {
  return repairCecParentheses(value).replace(/(\S)\(/g, '$1 (').replace(/\s+/g, ' ').trim();
}
const hebrewFormattingKey = (value: string) => value.replace(/[\s\p{P}]+/gu, '');
const spellingKey = (value: string) => hebrewNameKey(value.replace(/\(שבט\)\s*$/, '').replace(/חירות/g, 'חרות'));

/** Historical transitions visible in the retained same-code CEC/CBS records. These must precede
 * prefix recovery: a merger can extend an otherwise complete historical name. This registry only
 * blocks replacement; it never supplies a display name. Both directions stay historical. */
const HISTORICAL_NAMES: Record<number, [string, string][]> = {
  195: [['קדימה', 'צורן-קדימה']],
  494: [['דאלית אל-כרמל', 'דאלית אל-כרמל-עספיא'], ['עיר כרמל', 'דאלית אל-כרמל']],
  516: [["מג'ד אל-כרום", 'שגור']],
  609: [['ספסופה', 'כפר חושן']],
  917: [['שגב', 'עצמון שגב']],
  1061: [['נצרת עילית', 'נוף הגליל']],
  3573: [['חלמיש', 'נווה צוף']],
  1200: [['מודיעין', 'מודיעין-מכבים-רעות']],
  1224: [['כוכב יאיר-צור יגאל', 'כוכב יאיר']],
  3652: [['בית אריה', 'בית אריה-עופרים']],
  3796: [['מנורה', 'כפר האורנים']],
  6000: [['באקה אל-גרביה', "באקה-ג'ת"]],
  9400: [['יהוד', 'יהוד-נווה אפרים'], ['יהוד-מונוסון', 'יהוד']],
  9800: [['בנימינה', 'בנימינה-גבעת עדה']],
};
function isHistoricalName(code: number | null, cec: string, cbs: string): boolean {
  return (HISTORICAL_NAMES[code ?? 0] ?? []).some(pair => {
    const [a, b] = pair.map(spellingKey), x = spellingKey(cec), y = spellingKey(cbs);
    return (a === x && b === y) || (a === y && b === x);
  });
}

/** Same code, nearest retained CBS year (earlier on ties). Recover export truncation and explicit
 * spelling equivalences only; preserve historical transitions and all remaining letter differences. */
export function resolveLocalityHebrew(row: { code: number | null; nameHe: string }, year: number, records: CbsNameRecord[]): HebrewLocalityName {
  const name = tidyCecHebrew(row.nameHe);
  const repaired = repairCecParentheses(row.nameHe) !== row.nameHe;
  const extra = repaired ? { parenthesesRepaired: true as const } : {};
  const candidates = row.code !== null && row.code > 0 ? records.filter(r => r.code === row.code && r.nameHe.trim()) : [];
  const best = [...candidates].sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year) || a.year - b.year)[0];
  if (!best) return { name, source: 'cec', reason: 'no-cbs', ...extra };
  const cbs = tidyCecHebrew(best.nameHe.replace(/\*/g, ''));
  const key = hebrewFormattingKey(name), target = hebrewFormattingKey(cbs);
  const accept = (reason: HebrewNameReason): HebrewLocalityName => ({ name: cbs, source: 'cbs', year: best.year, reason, ...extra });
  const reject = (reason: HebrewNameReason): HebrewLocalityName => ({ name, source: 'cec', year: best.year, conflict: cbs, reason, ...extra,
    ...((name.match(/\(/g)?.length ?? 0) > (name.match(/\)/g)?.length ?? 0) ? { truncated: true } : {}) });
  if (key === target) return accept('formatting');
  if (isHistoricalName(row.code, name, cbs)) return reject('rename-merger');
  // Strip a complete tribal qualifier only for spelling comparison, not for truncation recovery.
  if (key && spellingKey(name) === spellingKey(cbs)) return accept('spelling');
  if (key && target.startsWith(key)) return accept('truncation');
  return reject('other');
}

/** Shared runtime Hebrew display name, also safe while the sidecar is loading. */
export function localityHebrewName(names: LocalityNames, row: { nameHe: string }, index: number): string {
  return names.hebrew?.[index]?.name ?? tidyCecHebrew(row.nameHe);
}
