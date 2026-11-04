import type { Scenario } from './scenario.ts';
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
export type PartSnapshot = Partial<Pick<Scenario, 'blocs' | 'blocSchemeId' | 'customGroupingName' | 'partyBlocs' | 'candidateBlocs' | 'agreements' | 'rules' | 'mode' | 'coalition'>> & { listBlocs?: Record<string, string | null> };
export function partSnapshot(s: Scenario, part: Part): PartSnapshot {
  switch (part) {
    case 'blocs': return { blocs: s.blocs, blocSchemeId: s.blocSchemeId, customGroupingName: s.customGroupingName, partyBlocs: s.partyBlocs ?? {}, candidateBlocs: s.candidateBlocs ?? {}, listBlocs: Object.fromEntries(s.lists.map(l => [l.id, l.bloc])) };
    case 'agreements': return { agreements: s.agreements };
    case 'rules': return { rules: s.rules, mode: s.mode };
    case 'coalitions': return { coalition: s.coalition ?? { in: [], out: [] } };
    default: throw new Error('This part editor is not available yet.');
  }
}
