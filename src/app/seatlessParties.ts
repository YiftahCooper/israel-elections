import type { Scenario } from '../model/scenario.ts';
import type { SettingValues } from './settings.ts';

/** A party the user gave its own bloc is an edit, so it is never hidden (mark every edit). */
const ownBloc = (s: Pick<Scenario, 'partyBlocs'>, partyId: string) => !!s.partyBlocs && partyId in s.partyBlocs;

/** Settings → Parties under joint lists: the one rule for every place that lists a joint list's parties under it
 *  (the list column, the bloc panel). Lists only (Simple's default): none. With seats (Standard's): parties that had
 *  someone elected, on a list that won seats. All (Expert's): every party, also on a list with no seats. */
export const partyListed = (mode: SettingValues['jointListParties'], s: Pick<Scenario, 'partyBlocs'>, partyId: string, partySeats: number, listSeats: number) =>
  ownBloc(s, partyId) || mode === 'all' || (mode === 'seated' && listSeats > 0 && partySeats > 0);

/** The list's own page always shows its parties with seats; a party with no seats folds behind one line there unless
 *  the setting is All (or it has its own bloc), so it stays one press away. */
export const hiddenSeatlessParty = (s: Pick<Scenario, 'partyBlocs'>, partyId: string, seats: number) =>
  seats === 0 && !ownBloc(s, partyId);
