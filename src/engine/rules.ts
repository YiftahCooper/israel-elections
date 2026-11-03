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

export const RULESETS: Record<string, RuleSet> = { [ISRAEL_2014.id]: ISRAEL_2014 };

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
  return out;
}
