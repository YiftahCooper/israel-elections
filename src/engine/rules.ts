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
/** Amendment 4 (SH 692, p.108): Bader–Ofer with 1%, Knessets 8–12. See decision 0070. */
export const ISRAEL_1973: RuleSet = { ...ISRAEL_2014, id: 'il-1973-bader-ofer-1', threshold: rat(1, 100) };
/** 2% applied in the elections to Knessets 17–19. */
export const ISRAEL_2004: RuleSet = { ...ISRAEL_2014, id: 'il-2004-bader-ofer-2', threshold: rat(1, 50) };
/** K9 candidate-cap procedure inferred from the published result; see decision 0073. */
export const ISRAEL_1977: RuleSet = { ...ISRAEL_1973, id: 'il-1977-bader-ofer-1-candidate-cap', seatsCappedAtCandidates: true };
export const RULESETS: Record<string, RuleSet> = Object.fromEntries(
  [ISRAEL_1973, ISRAEL_1977, ISRAEL_1992, ISRAEL_2004, ISRAEL_2014].map((r) => [r.id, r]),
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
  if (Boolean(rules.seatsCappedAtCandidates) !== Boolean(historical.seatsCappedAtCandidates)) out.push('seatsCappedAtCandidates');
  return out;
}
