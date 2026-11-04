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

/** Parses a typed or pasted whole number ≥ 0. Accepts thousands separators (comma, space, apostrophe,
 *  underscore), Arabic-Indic and Persian digits, and a k/m shorthand ("10k", "1.2m"). Anything else,
 *  including negatives and fractions of a vote, is rejected (null) so the field can say so. */
export const parseIntInput = (s: string): number | null => {
  let t = s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[,\s_'’٬   ]/g, '').toLowerCase();
  const mult = /^\d+(\.\d+)?[km]$/.test(t) ? (t.endsWith('k') ? 1_000 : 1_000_000) : 1;
  if (mult > 1) t = t.slice(0, -1);
  // a shorthand may carry only as many decimals as it has zeros (1.25k = 1,250; 1.2345k is not a whole vote)
  if (mult === 1 ? !/^\d+$/.test(t) : !new RegExp(`^\\d+(\\.\\d{1,${mult === 1_000 ? 3 : 6}})?$`).test(t)) return null;
  const n = mult === 1 ? Number(t) : Math.round(Number(t) * mult);
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
