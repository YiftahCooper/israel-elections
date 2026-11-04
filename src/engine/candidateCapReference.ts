import type { AllocationInput } from './types.ts';
import { ISRAEL_1977, ruleDepartures } from './rules.ts';

// YP 2326 pp.1494–1496 votes; YP 2319 agreements and sole פש candidate.
// Recognition is based on inputs, never just the rule id or the resulting seat table.
// See decision 0073. Partial rosters are deliberately not candidate capacities.
const votes: Record<string, string> = {"9-מחל": "583968", "9-אמת": "430023", "9-ג": "58652", "9-רצ": "20621", "9-ב": "160787", "9-ו": "80118", "9-יש": "202265", "9-לע": "20384", "9-ים": "24185", "9-ש": "27281", "9-כנ": "33947", "9-פש": "35049", "9-ד": "23571", "9-הם": "1085", "9-זה": "14516", "9-חך": "9505", "9-כה": "1802", "9-כך": "4396", "9-נס": "5674", "9-סם": "5695", "9-פז": "1798", "9-פח": "2498"};
const pairs = [["9-אמת", "9-ים"], ["9-ב", "9-ג"], ["9-יש", "9-לע"], ["9-כנ", "9-מחל"], ["9-נס", "9-ש"], ["9-סם", "9-רצ"]];
export function isOfficialCandidateCapCase(input: AllocationInput, currentVotes: readonly bigint[]): boolean {
  return ruleDepartures(input.rules, ISRAEL_1977).length === 0
    && input.lists.length === Object.keys(votes).length
    && input.lists.every((l, i) => !l.withdrawn && votes[l.id] === String(currentVotes[i])
      && l.candidateCount === (l.id === '9-פש' ? 1 : undefined))
    && JSON.stringify(input.agreements.map(a => [...a.members].sort()).sort()) === JSON.stringify(pairs);
}
