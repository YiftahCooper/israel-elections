// Exact rational arithmetic on bigint. Every comparison in the engine goes through here, so no
// floating-point rounding can ever decide a seat.

export interface Rational { readonly num: bigint; readonly den: bigint } // den > 0

export const rat = (num: bigint | number, den: bigint | number = 1n): Rational => {
  let n = BigInt(num); let d = BigInt(den);
  if (d === 0n) throw new RangeError('zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  return { num: n, den: d };
};

/** a/b compared with c/d: -1, 0, 1 */
export const cmp = (a: Rational, b: Rational): -1 | 0 | 1 => {
  const l = a.num * b.den; const r = b.num * a.den;
  return l < r ? -1 : l > r ? 1 : 0;
};

export const floorDiv = (a: bigint, b: bigint): bigint => {
  if (b <= 0n) throw new RangeError('floorDiv requires positive divisor');
  const q = a / b;
  return a % b !== 0n && a < 0n ? q - 1n : q;
};

export const ceilDiv = (a: bigint, b: bigint): bigint => -floorDiv(-a, b);

export const floorRat = (r: Rational): bigint => floorDiv(r.num, r.den);

/** Parses a decimal percentage string such as "3.25" into the exact fraction 13/400. */
export const percentToRational = (pct: string | number): Rational => {
  const s = String(pct).trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new RangeError(`invalid percentage: ${s}`);
  const [whole, frac = ''] = s.split('.');
  const den = 100n * 10n ** BigInt(frac.length);
  return reduce(rat(BigInt(whole + frac), den));
};

/** The exact percentage of a fraction with a terminating decimal, e.g. 13/400 → "3.25" (inverse of
 *  percentToRational). */
export const toPercentString = (r: Rational): string => {
  const x = reduce(rat(r.num * 100n, r.den));
  if (x.num < 0n) throw new RangeError('negative percentage');
  let rem = x.num % x.den; let frac = '';
  while (rem !== 0n) {
    if (frac.length >= 40) throw new RangeError('percentage has no short exact decimal');
    rem *= 10n; frac += String(rem / x.den); rem %= x.den;
  }
  return `${x.num / x.den}${frac ? `.${frac}` : ''}`;
};

const gcd = (a: bigint, b: bigint): bigint => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };

export const reduce = (r: Rational): Rational => { const g = gcd(r.num, r.den) || 1n; return { num: r.num / g, den: r.den / g }; };

/** Decimal string with exactly `digits` fractional digits, rounded half-up (display only). */
export const toDecimal = (r: Rational, digits = 2): string => {
  const neg = r.num < 0n; const n = neg ? -r.num : r.num;
  const scale = 10n ** BigInt(digits);
  const scaled = (n * scale * 2n + r.den) / (2n * r.den);
  const int = scaled / scale; const frac = scaled % scale;
  return (neg && scaled !== 0n ? '-' : '') + int.toString() + (digits > 0 ? '.' + frac.toString().padStart(digits, '0') : '');
};

/** Percentage of part in whole, as decimal string (display only; exact rounding). */
export const pct = (part: bigint | number, whole: bigint | number, digits = 2): string =>
  BigInt(whole) === 0n ? '—' : toDecimal(rat(BigInt(part) * 100n, BigInt(whole)), digits);

export const toNumber = (r: Rational): number => Number(r.num) / Number(r.den);
