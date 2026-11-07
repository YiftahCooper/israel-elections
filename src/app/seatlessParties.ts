import type { Scenario } from '../model/scenario.ts';

/** Settings → Parties with no seats. A party on a joint list that has no one elected is left out of seat breakdowns
 *  when the setting is off; one the user gave its own bloc stays, because it is an edit (mark every edit). Parties
 *  with seats and unknown affiliations are never hidden by this rule. */
export const hiddenSeatlessParty = (s: Pick<Scenario, 'partyBlocs'>, partyId: string, seats: number) =>
  seats === 0 && !(s.partyBlocs && partyId in s.partyBlocs);
