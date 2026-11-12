import { NO_COALITION, type Scenario } from './scenario.ts';
export const PARTS = {
  votes: { en: 'Votes', he: 'קולות', blank: false },
  identity: { en: 'List identity', he: 'זהות הרשימות', blank: false },
  structure: { en: 'Merges, splits and withdrawals', he: 'איחודים, פיצולים ופרישות', blank: false },
  agreements: { en: 'Agreements', he: 'הסכמי עודפים', blank: true },
  blocs: { en: 'Blocs', he: 'גושים', blank: true },
  coalitions: { en: 'Coalitions', he: 'קואליציות', blank: true },
  candidates: { en: 'Candidates', he: 'מועמדים', blank: true },
  rules: { en: 'Rules', he: 'כללים', blank: false },
  totals: { en: 'Turnout and totals', he: 'הצבעה וסיכומים', blank: false },
} as const;
export type Part = keyof typeof PARTS;
export type PartSnapshot = Partial<Pick<Scenario, 'familyDefinition' | 'blocs' | 'blocSchemeId' | 'customGroupingName' | 'partyBlocs' | 'candidateBlocs' | 'agreements' | 'rules' | 'mode' | 'coalition' | 'lists' | 'registered' | 'invalid' | 'factionSplits'>> & { validVotes?: number; listBlocs?: Record<string, string | null> };
export function partSnapshot(s: Scenario, part: Part): PartSnapshot {
  switch (part) {
    case 'blocs': return { familyDefinition:s.familyDefinition, blocs: s.blocs, blocSchemeId: s.blocSchemeId, customGroupingName: s.customGroupingName, partyBlocs: s.partyBlocs ?? {}, candidateBlocs: s.candidateBlocs ?? {}, listBlocs: Object.fromEntries(s.lists.map(l => [l.id, l.bloc])) };
    case 'agreements': return { agreements: s.agreements };
    case 'rules': return { rules: s.rules, mode: s.mode };
    case 'coalitions': return { coalition: s.coalition ?? NO_COALITION };
    case 'votes': case 'identity': return { lists: s.lists };
    // how a joint list's faction is counted belongs with its parties
    case 'candidates': return { lists: s.lists, factionSplits: s.factionSplits ?? [] };
    case 'structure': return { lists: s.lists, agreements: s.agreements, factionSplits: s.factionSplits ?? [] };
    case 'totals': return { registered: s.registered, invalid: s.invalid, validVotes: s.lists.reduce((sum,l) => sum + l.votes, 0) };
  }
}

/** Shared surfaces for a replacement marker when its Start from control is not mounted. */
export const PART_MARKER_SURFACES: Record<Part,string> = {votes:'lists',identity:'lists',structure:'lists',candidates:'lists',blocs:'blocs',agreements:'agreements',rules:'rules',totals:'totals',coalitions:'coalitions'};
