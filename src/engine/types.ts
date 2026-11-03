import type { Rational } from './rational.ts';

/** Remainder-seat method. 'bader-ofer' is Israeli law since 1973 (section 81(d)). */
export type RemainderMethod = 'bader-ofer' | 'largest-remainder' | 'sainte-lague';

export interface RuleSet {
  id: string;
  /** true only for rule sets that reproduce Israeli law for a given election */
  historical: boolean;
  seats: number;
  /** fraction of all valid votes a list needs (section 81(a)); exact, e.g. 13/400 for 3.25% */
  threshold: Rational;
  /** 'floor' = section 81(b): the whole number of qualifying votes ÷ seats. 'exact' = no rounding. */
  quotaRounding: 'floor' | 'exact';
  remainderMethod: RemainderMethod;
  /** section 81(d)(4): a list with ≤ half the votes stops receiving remainder seats at half the seats */
  majorityCap: boolean;
  /** maximum lists in one surplus agreement; the law (section 67(a)) allows exactly 2 */
  maxAgreementSize: number;
  /** section 82(a): agreement only takes effect when every partner passed the threshold */
  agreementRequiresAllQualify: boolean;
}

export interface ListInput {
  id: string;
  votes: bigint;
  /** lists that withdrew still appear (with 0 votes); they never take part */
  withdrawn?: boolean;
}

export interface AgreementInput { id: string; members: string[] }

export interface AllocationInput {
  rules: RuleSet;
  lists: ListInput[];
  agreements: AgreementInput[];
  /** forced lottery outcomes, keyed by TieRecord.key (stage, step and the exact tied set) */
  lotteryWinners?: Record<string, string>;
}

export interface Quotient { unitId: string; votes: bigint; seats: number; value: Rational; eligible: boolean; capped?: boolean }

export interface TieRecord {
  key: string; // `${stage}:${step}:${sorted tied ids joined by |}`
  tiedUnitIds: string[];
  chosen: string;
  forced: boolean; // true when the user/data supplied the lottery outcome
}

export interface RemainderStep {
  step: number; // 1-based within the stage
  seatNumber: number; // cumulative seat count after this award (within the stage universe)
  winnerUnitId: string;
  quotients: Quotient[]; // every competitor at the moment of decision, sorted best-first
  tie?: TieRecord;
}

export interface UnitResult {
  id: string;
  memberIds: string[];
  votes: bigint;
  initialSeats: number;
  remainderSeats: number;
  seats: number;
  isAgreement: boolean;
  capped: boolean;
}

export interface InternalDivision {
  unitId: string;
  seats: number;
  totalVotes: bigint;
  quota: Rational;
  initial: Record<string, number>;
  steps: RemainderStep[];
  final: Record<string, number>;
}

export interface ListResult {
  id: string;
  votes: bigint;
  qualified: boolean;
  withdrawn: boolean;
  /** seats from section 81(c), computed for the list on its own */
  initialSeats: number;
  /** final seats after remainder allocation and internal division */
  seats: number;
  unitId: string | null;
  agreementId: string | null;
  agreementActive: boolean;
}

export interface AgreementStatus {
  id: string;
  members: string[];
  active: boolean;
  reason?: 'member-failed-threshold' | 'member-withdrawn' | 'too-many-members' | 'duplicate-membership' | 'unknown-list';
  failedMembers: string[];
}

export type WarningCode =
  | 'lottery-required'
  | 'quota-over-allocation'
  | 'no-qualifying-lists'
  | 'zero-quota'
  | 'seats-unallocatable'
  | 'internal-loss'
  | 'agreement-rule-departure';

export interface EngineWarning { code: WarningCode; message: string; data?: Record<string, unknown> }

export interface AllocationResult {
  rules: RuleSet;
  totalValid: bigint;
  /** smallest whole number of votes that passes the threshold */
  thresholdVotes: bigint;
  thresholdExact: Rational;
  qualifyingVotes: bigint;
  unrepresentedVotes: bigint;
  quota: Rational; // general quota (המודד)
  initialSeatsTotal: number;
  remainderSeatsTotal: number;
  lists: ListResult[];
  units: UnitResult[];
  agreements: AgreementStatus[];
  remainderSteps: RemainderStep[];
  internalDivisions: InternalDivision[];
  warnings: EngineWarning[];
  seatsAllocated: number;
}
