import { rat } from './rational.ts';
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
/** 2% applied in the elections to Knessets 17–19. */
export const ISRAEL_2004: RuleSet = { ...ISRAEL_2014, id: 'il-2004-bader-ofer-2', threshold: rat(1, 50) };
/** Constituent Assembly ordinance 1948, ss.30–31; no statutory percentage threshold. */
export const ISRAEL_1949: RuleSet = { ...ISRAEL_2014, id: 'il-1949-highest-average-0', threshold: rat(0),
  majorityCap: false, quotaSeatOffset: 1, remainderRequiresInitialSeat: true,
  agreementRequiresInitialSeat: true, quotientRounding: 'floor' };
/** Literal 1951 s.38 / 1955 s.43 / 1959 s.37 / original 1969 s.81.
 * Historical agreement application remains unresolved for k6 (decision 0061); not release evidence. */
export const ISRAEL_1951: RuleSet = { ...ISRAEL_2014, id: 'il-1951-largest-remainder-1', threshold: rat(1,100),
  remainderMethod: 'largest-remainder', majorityCap: false, largestRemainderRepeat: false, tiePolicy: 'unspecified' };
export const RULESETS: Record<string, RuleSet> = Object.fromEntries(
  [ISRAEL_1949, ISRAEL_1951, ISRAEL_1992, ISRAEL_2004, ISRAEL_2014].map((r) => [r.id, r]),
);

/** Lists every way `rules` departs from the historical rule set it is compared against. */
export function ruleDepartures(rules: RuleSet, historical: RuleSet): string[] {
  const out: string[] = [];
  if (rules.seats !== historical.seats) out.push('seats');
  if (rules.threshold.num * historical.threshold.den !== historical.threshold.num * rules.threshold.den) out.push('threshold');
  if (rules.quotaRounding !== historical.quotaRounding) out.push('quotaRounding');
  if (rules.remainderMethod !== historical.remainderMethod) out.push('remainderMethod');
  if (rules.majorityCap !== historical.majorityCap) out.push('majorityCap');
  if (rules.maxAgreementSize !== historical.maxAgreementSize) out.push('maxAgreementSize');
  if (rules.agreementRequiresAllQualify !== historical.agreementRequiresAllQualify) out.push('agreementRequiresAllQualify');
  if ((rules.quotaSeatOffset ?? 0) !== (historical.quotaSeatOffset ?? 0)) out.push('quotaSeatOffset');
  if ((rules.remainderRequiresInitialSeat ?? false) !== (historical.remainderRequiresInitialSeat ?? false)) out.push('remainderRequiresInitialSeat');
  if ((rules.agreementRequiresInitialSeat ?? false) !== (historical.agreementRequiresInitialSeat ?? false)) out.push('agreementRequiresInitialSeat');
  if ((rules.quotientRounding ?? 'exact') !== (historical.quotientRounding ?? 'exact')) out.push('quotientRounding');
  if ((rules.largestRemainderRepeat ?? true) !== (historical.largestRemainderRepeat ?? true)) out.push('largestRemainderRepeat');
  if ((rules.tiePolicy ?? 'lottery') !== (historical.tiePolicy ?? 'lottery')) out.push('tiePolicy');
  return out;
}
