// Versioned on-disk format of an election dataset (public/data/<id>.json).
// Historical datasets are immutable inputs: the app never edits them, it derives scenarios.

export const DATASET_SCHEMA_VERSION = 1;

export const ELECTION_IDS = ['k16', 'k17', 'k18', 'k19', 'k20', 'k21', 'k22', 'k23', 'k24', 'k25', 'k26'] as const;
export type ElectionId = (typeof ELECTION_IDS)[number];

/** One row of public/data/elections.json: every election the project knows about, built or not. */
export interface ElectionIndexEntry {
  id: ElectionId;
  knesset: number;
  date: string;
  nameHe: string;
  nameEn: string;
  /** false = sources are downloaded but the dataset is not yet built and verified */
  available: boolean;
  status: { stage: string; noteEn?: string; noteHe?: string };
}

export interface DatasetStatus {
  /** 'official-final' = CEC published final results; 'final-count-pending-publication' = full count
   *  published by the CEC but not yet gazetted in Reshumot (section 84) */
  stage: 'official-final' | 'final-count-pending-publication';
  asOf: string; // ISO date of the data files
  noteHe: string;
  noteEn: string;
}

export interface Candidate {
  /** stable within the dataset: `${listId}#${rank}` as approved */
  id: string;
  rank: number;
  /** name exactly as published (family name first, as in CEC publications) */
  nameHe: string;
  givenHe?: string;
  familyHe?: string;
  /** sponsoring party for this candidate, when the official source states it */
  partyHe?: string;
}

export interface ListRecord {
  id: string; // `${knesset}-${letters}`
  letters: string; // ballot letters (אותיות הרשימה)
  nameHe: string; // full approved list name (כינוי הרשימה)
  shortHe: string;
  shortEn: string | null; // app-assigned common English name; null when none is in common use
  /** sponsoring parties exactly as published */
  sponsorsHe: string;
  /** individual parties, only when the source separates them unambiguously */
  partiesHe: string[] | null;
  votes: number;
  withdrawn: boolean;
  color: string; // app-assigned display colour (not an official party colour)
  bloc: string | null; // app-assigned default grouping, user-editable
  candidates: Candidate[];
  candidatesSource: string; // source id
  candidatesSecondary: boolean;
  /** true when no verifiable roster exists; candidates is then [] */
  candidatesUnavailable?: boolean;
  /** verbatim official notes: resignations, disqualifications, court rulings */
  notesHe: string[];
}

export interface AgreementRecord { id: string; members: [string, string]; sourceId: string }

export interface BlocDef { id: string; nameHe: string; nameEn: string; color: string }

export interface Totals {
  registered: number; // בעלי זכות בחירה
  votesCast: number; // מצביעים
  invalid: number; // פסולים
  valid: number; // כשרים
  ballotBoxes: number;
  localities: number;
  /** votes cast in double envelopes (מעטפות חיצוניות), when the source reports them */
  envelopeVotes?: number;
}

export interface ElectionDataset {
  schemaVersion: number;
  id: ElectionId;
  knesset: number;
  electionDate: string;
  nameHe: string;
  nameEn: string;
  status: DatasetStatus;
  ruleSetId: string;
  totals: Totals;
  lists: ListRecord[];
  agreements: AgreementRecord[];
  blocs: BlocDef[];
  /** officially published seat counts per list id, used to validate the engine; null if none */
  officialSeats: Record<string, number> | null;
  officialSeatsSourceId: string | null;
  sourceIds: string[];
  buildInfo: { builtAt: string; rawSha256: Record<string, string> };
}

/** One locality's results. Older elections lack some identifiers: those fields are null, never invented. */
export interface LocalityRow {
  /** CBS locality code; null when the source has none (2006) */
  code: number | null;
  nameHe: string;
  /** regional election committee number; null when the source has none */
  committee: number | null;
  /** null when the source has no registered-voter count for the locality */
  registered: number | null;
  votesCast: number;
  invalid: number;
  valid: number;
  votes: number[];
  /** double-envelope votes (soldiers, patients, diplomats…), not attributable to a locality. Code 9999 also means this. */
  envelopes?: boolean;
}

/** Locality-level results (public/data/<id>-localities.json), columns aligned to `listIds`. */
export interface LocalityDataset {
  schemaVersion: number;
  id: ElectionId;
  listIds: string[];
  rows: LocalityRow[];
  /** how the rows were obtained, when not an official locality table (e.g. summed from polling stations) */
  noteEn?: string;
  noteHe?: string;
}

export const isEnvelopeRow = (r: LocalityRow) => r.envelopes === true || r.code === 9999;
