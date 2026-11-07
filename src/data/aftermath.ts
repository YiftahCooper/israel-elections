import type { Certainty } from './evidence.ts';
/** Research overlay only; never infer coalition membership from a confidence vote. */
export const GOVERNMENT_SUPPORT_ROLES = ['member-with-ministries', 'member-without-ministries', 'outside-support', 'confidence-vote-only', 'abstained-by-arrangement', 'other'] as const;
export type GovernmentSupportRole = typeof GOVERNMENT_SUPPORT_ROLES[number];
export interface SupportCitation { source: string; quote: string; locator?: string; note?: string }
export interface GovernmentParticipant {
  letters?: string;
  /** Actual participating seats, not necessarily the whole elected list. */
  seats: number | null;
  electionListSeats?: number;
  factionNameHe?: string;
  role: GovernmentSupportRole;
  /** docs/source-policy.md; never above the ceiling its cites support (src/data/evidence.ts). */
  certainty: Certainty;
  cites: SupportCitation[];
  note?: string;
}
export interface GovernmentIndividual extends Omit<GovernmentParticipant, 'letters' | 'seats'> {
  id: string;
  nameEn: string;
  nameHe: string;
  fromLetters: string;
  /** true: exception within a faction's seats; false: an additional crossing MK. */
  countedInFactionSeats: boolean;
  vote: 'for' | 'against' | 'abstain' | 'absent' | 'unknown';
}
export interface GovernmentSupport {
  coalition: GovernmentParticipant[];
  individuals?: GovernmentIndividual[];
  /** null when unresolved roles or incomplete coverage prevent a total. */
  coalitionSeats: number | null;
  supportSeats: number | null;
  confidenceVote: { for: number; against: number; abstain?: number } | null;
  confidenceVoteCites?: SupportCitation[];
  membershipCoverage: 'complete' | 'partial';
  reconciliation: {
    status: 'exact' | 'explained' | 'unresolved' | 'vote-unavailable';
    note: string;
    /** Only supplied when every difference from membership is established. */
    expectedFor?: number;
  };
}
