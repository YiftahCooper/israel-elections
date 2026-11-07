// Versioned on-disk format of an election dataset (public/data/<id>.json).
// Historical datasets are immutable inputs: the app never edits them, it derives scenarios.

export const DATASET_SCHEMA_VERSION = 1;

export const ELECTION_IDS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13', 'k14', 'k15', 'k16', 'k17', 'k18', 'k19', 'k20', 'k21', 'k22', 'k23', 'k24', 'k25', 'k26'] as const;
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
  /** on the registered roster but not among those the official results notice names as elected
   * (withdrew or resigned before the members were named); seats pass to the next candidates */
  notSeated?: boolean;
  /** the name to show when the candidate notice misprints it (from data/meta/candidate-notes.json) */
  displayNameHe?: string;
  /** the member's official English name on the Knesset website (a current name; data/raw/bios/knesset-site-mk-names-en.json),
   *  attached only to a candidate whose Knesset identity is certain (official OData match or a high reviewed decision) */
  nameEn?: string;
  /** curated bilingual notes, e.g. a replacement before the Knesset's first sitting (decision 0088) */
  notes?: { en: string; he: string }[];
  /** the constituent party (ListRecord.parties) the candidate represented on a joint list, when sourced */
  partyId?: string;
  /** biography links (data/meta/bios): official Knesset page, Hebrew Wikipedia, the party's own page */
  bio?: CandidateBio;
}

export interface ListRecord {
  id: string; // Opaque stable key; ballot-letter corrections must not rename it.
  letters: string; // ballot letters (אותיות הרשימה)
  nameHe: string; // full approved list name (כינוי הרשימה)
  shortHe: string;
  shortEn: string | null; // app-assigned common English name; null when none is in common use
  /** sponsoring parties exactly as published */
  englishName?: { label: string; kind: 'official' | 'transliteration'; sourceId: string; note: string };
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
  /** constituent parties, for a list that was an alliance of separate parties (decision 0087) */
  parties?: PartyDef[];
  /** the list's logo at this election, when a verified copy is held (data/meta/logos) */
  logo?: LogoRef;
  /** Election-specific partisan and non-partisan reading (decision 0093). */
  links?: PartyLink[];
  /** true when candidates holds only the first ranks of the registered roster (at least everyone elected); later ranks were not transcribed */
  candidatesTruncated?: boolean;
  /** verbatim official notes: resignations, disqualifications, court rulings */
  notesHe: string[];
}

export interface AgreementRecord { id: string; members: [string, string]; sourceId: string }

export interface BlocDef { id: string; nameHe: string; nameEn: string; color: string; appDefined?: boolean }

/** A sourced or app-defined grouping of an election (decision 0087): the first government, or a recognised bloc.
 *  Members are whole lists, constituent parties of joint lists, or individual candidates. */
export interface BlocScheme {
  id: string;
  /** App-defined comparison, not an official or contemporaneous grouping. */
  appDefined?: boolean;
  kind: 'government' | 'parliamentary' | 'pre-election';
  nameHe: string;
  nameEn: string;
  date?: string;
  blocs: (BlocDef & { lists: string[]; parties: string[]; candidates: string[] })[];
}

/** Where to read about a candidate. `probable`: matched by name under the stated rules, not by an official id. */
export interface CandidateBio {
  knesset?: string;
  hewiki?: { title: string; url: string };
  party?: { url: string; publisher?: string; archivedAt?: string };
  probable?: boolean;
}

/** A verified source about a list or constituent, scoped to this election. */
export interface PartyLink {
  kind: 'partisan' | 'neutral';
  url: string;
  titleHe?: string;
  titleEn?: string;
  publisher: string;
  sourceType: 'party-site' | 'platform' | 'ephemera' | 'party-newspaper' | 'repo-scan' | 'knesset' | 'hewiki' | 'cec' | 'academic';
  archivedAt?: string;
  confidence: 'high' | 'medium';
}

/** A party logo as used at that election: a locally hosted file with its rights basis and credit. */
export type LogoRights = 'free-licence' | 'fair-use-identification';
export interface LogoRef { rights: LogoRights; file: string; licence: string; attribution: string; sourceUrl: string; background?: string }

/** A constituent party of a joint list (decision 0087). */
export interface PartyDef { id: string; nameHe: string; nameEn: string; color?: string; customColor?: boolean; logo?: LogoRef; links?: PartyLink[] }

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
  /** sourced bloc schemes (data/meta), and the one shown first */
  blocSchemes?: BlocScheme[];
  defaultBlocScheme?: string;
  /** officially published seat counts per list id, used to validate the engine; null if none */
  officialSeats: Record<string, number> | null;
  officialSeatsSourceId: string | null;
  sourceIds: string[];
  /** false when no locality-level results exist for this election (no <id>-localities.json) */
  hasLocalities?: boolean;
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
  groups?: LocalityGroup[];
  demographicNoteEn?: string;
  demographicNoteHe?: string;
  schemaVersion: number;
  id: ElectionId;
  listIds: string[];
  rows: LocalityRow[];
  /** how the rows were obtained, when not an official locality table (e.g. summed from polling stations) */
  noteEn?: string;
  noteHe?: string;
}

/** Double-envelope rows: flagged, or code 9999 (2015 on), or named "מעטפות…" (2009 uses code 0, 2013 code 875). */
export const isEnvelopeRow = (r: LocalityRow) => r.envelopes === true || r.code === 9999 || r.nameHe.startsWith('מעטפות');

/** Geographic reference classification, never an inference about individual voters. */
export interface LocalityGroup {
  id: string; nameHe: string; nameEn: string;
  sourceIds: string[]; classificationYear: number;
  definitionHe: string; definitionEn: string;
  codes: number[];
  coverage: { localities: number; registered: number | null; valid: number; nationalValidShare: number };
}
