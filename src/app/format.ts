import { pct, rat, toDecimal, type Rational } from '../engine/rational.ts';

// One shared formatter: x.toLocaleString('en-US') is defined as new Intl.NumberFormat('en-US').format(x),
// but building that formatter on every call is ~25x slower in Chromium (it dominates large tables).
const EN = new Intl.NumberFormat('en-US');
export const fmtInt = (n: number | bigint) => (typeof n === 'bigint' ? EN.format(n) : EN.format(Math.round(n)));
export const fmtSigned = (n: number | bigint) => (Number(n) > 0 ? '+' : Number(n) < 0 ? '−' : '±') + fmtInt(typeof n === 'bigint' ? (n < 0n ? -n : n) : Math.abs(n));
export const fmtPct = (part: number | bigint, whole: number | bigint, digits = 2) => `${pct(BigInt(part), BigInt(whole), digits)}%`;
export const fmtRat = (r: Rational, digits = 2) => toDecimal(r, digits).replace(/^(-?)(\d+)/, (_, sg: string, d: string) => sg + EN.format(BigInt(d)));
export const fmtFrac = (r: Rational) => `${fmtInt(r.num)} / ${fmtInt(r.den)}`;
export const ratOf = (a: bigint | number, b: bigint | number) => rat(BigInt(a), BigInt(b));

/** Parses user number input: digits with optional thousands separators. */
export const parseIntInput = (s: string): number | null => {
  const t = s.replace(/[,\s_]/g, '');
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : null;
};

export const download = (name: string, content: string | Blob, type = 'text/plain') => {
  const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export const csvEscape = (v: unknown) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Wraps text containing Hebrew in a right-to-left isolate, so it reads correctly inside a
 *  left-to-right SVG while text-anchor keeps its left-to-right meaning. */
export const isolate = (t: string) => (/[\u0590-\u05FF]/.test(t) ? `\u2067${t}\u2069` : t);

/** A signed whole number isolated left-to-right ("+3", "−2"), so the sign stays put in Hebrew text. */
export const signed = (d: number | bigint) => {
  const n = Number(d);
  return `\u2066${n > 0 ? '+' : n < 0 ? '−' : '±'}${EN.format(Math.abs(n))}\u2069`;
};
