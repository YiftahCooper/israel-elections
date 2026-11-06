/** English names for locality result rows, resolved from retained CBS locality lists (build time only). */
export interface CbsNameRecord { code: number; year: number; nameHe: string; nameEn: string }
export type LocalityNameSource = 'cbs' | 'project';
/** Index-aligned with the election's locality rows; '' for envelope rows. `project` lists rows whose English name
 * is not in any retained CBS list and was written by this project (labelled in the interface). */
export interface LocalityNames { names: string[]; project: number[] }

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
