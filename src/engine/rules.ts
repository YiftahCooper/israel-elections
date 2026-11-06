import { cmp, rat } from './rational.ts';
import type { RuleSet } from './types.ts';

/** Knesset Elections Law as applied to the 20th–26th Knessets (Amendment 62, 2014: 3.25%). */
export const ISRAEL_2014: RuleSet = {
  id: 'il-2014-bader-ofer-3.25',
  historical: true,
  seats: 120,
  threshold: rat(13, 400),
  quotaRounding: 'floor',
  remainderMethod: 'bader-ofer',
  majorityCap: true,
  maxAgreementSize: 2,
  agreementRequiresAllQualify: true,
};

/** 1.5% applied in the elections to Knessets 13–16 (before the May 2004 amendment). */
export const ISRAEL_1992: RuleSet = { ...ISRAEL_2014, id: 'il-1992-bader-ofer-1.5', threshold: rat(3, 200) };
/** Amendment 4 (SH 692, p.108): Bader–Ofer with 1%, Knessets 8–12. See decision 0070. */
export const ISRAEL_1973: RuleSet = { ...ISRAEL_2014, id: 'il-1973-bader-ofer-1', threshold: rat(1, 100) };
/** 2% applied in the elections to Knessets 17–19. */
export const ISRAEL_2004: RuleSet = { ...ISRAEL_2014, id: 'il-2004-bader-ofer-2', threshold: rat(1, 50) };
/** Constituent Assembly ordinance 1948, ss.30–31; no statutory percentage threshold. */
export const ISRAEL_1949: RuleSet = { ...ISRAEL_2014, id: 'il-1949-highest-average-0', threshold: rat(0),
  majorityCap: false, quotaSeatOffset: 1, remainderRequiresInitialSeat: true,
  agreementRequiresInitialSeat: true, quotientRounding: 'floor' };
/** Literal 1951 s.38 / 1955 s.43 / 1959 s.37 / original 1969 s.81.
 * K2–K7 reproduce with primary connections; K6's transcription correction is recorded in 0069a. */
export const ISRAEL_1951: RuleSet = { ...ISRAEL_2014, id: 'il-1951-largest-remainder-1', threshold: rat(1,100),
  remainderMethod: 'largest-remainder', majorityCap: false, largestRemainderRepeat: false, tiePolicy: 'unspecified' };
/** K9 candidate cap documented in the Knesset appeal determination, 1 Nov 1977 p.237; see k09-resolution. */
export const ISRAEL_1977: RuleSet = { ...ISRAEL_1973, id: 'il-1977-bader-ofer-1-candidate-cap', seatsCappedAtCandidates: true };
export const RULESETS: Record<string, RuleSet> = Object.fromEntries(
  [ISRAEL_1949, ISRAEL_1951, ISRAEL_1973, ISRAEL_1977, ISRAEL_1992, ISRAEL_2004, ISRAEL_2014].map((r) => [r.id, r]),
);

/** Optional semantics and the value an absent field means (the modern law). */
export const RULE_DEFAULTS = {
  quotaSeatOffset: 0,
  remainderRequiresInitialSeat: false,
  agreementRequiresInitialSeat: false,
  quotientRounding: 'exact',
  largestRemainderRepeat: true,
  tiePolicy: 'lottery',
} as const satisfies Partial<RuleSet>;
export type OptionalRule = keyof typeof RULE_DEFAULTS;
export const OPTIONAL_RULES = Object.keys(RULE_DEFAULTS) as OptionalRule[];

/** The fields every rule set states explicitly, compared as given. */
const REQUIRED_RULES = ['quotaRounding', 'remainderMethod', 'majorityCap', 'maxAgreementSize', 'agreementRequiresAllQualify'] as const;

/** Lists every way `rules` departs from the historical rule set it is compared against. */
export function ruleDepartures(rules: RuleSet, historical: RuleSet): string[] {
  const out: string[] = [];
  if (rules.seats !== historical.seats) out.push('seats');
  if (cmp(rules.threshold, historical.threshold) !== 0) out.push('threshold');
  for (const k of REQUIRED_RULES) if (rules[k] !== historical[k]) out.push(k);
  for (const k of OPTIONAL_RULES) if ((rules[k] ?? RULE_DEFAULTS[k]) !== (historical[k] ?? RULE_DEFAULTS[k])) out.push(k);
  // off unless set: the 1977 candidate-cap inference applies to K9 only (decision 0073)
  if (Boolean(rules.seatsCappedAtCandidates) !== Boolean(historical.seatsCappedAtCandidates)) out.push('seatsCappedAtCandidates');
  return out;
}
