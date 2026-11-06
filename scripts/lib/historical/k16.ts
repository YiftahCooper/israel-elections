import { releaseDataset, verifyHistoricalProgress, type VerifyOptions } from './k16-k17-common.ts';
import { listRecord } from '../build/records.ts';
import { readFileSync } from 'node:fs';
export const verifyK16 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k16', options);

/** Registers the retained-input build; polling scratch is an optional additional check. */
export function buildK16(options: VerifyOptions = {}) {
  return [() => {
    const result = releaseDataset(verifyK16(options));
    // YP 5155 explicitly records withdrawal of every candidate; zero votes alone are not evidence.
    const w = JSON.parse(readFileSync(new URL('../../../data/meta/k16-withdrawn.json', import.meta.url), 'utf8'));
    const list = listRecord(16, result.ds.lists.length, { letters: w.letters, nameHe: w.nameHe,
      withdrawn: w.withdrawn, votes: w.votes, candidatesSource: w.candidatesSource, notesHe: w.notesHe,
      candidates: w.candidates.map((nameHe: string, i: number) => ({ id: `16-${w.letters}#${i + 1}`, rank: i + 1, nameHe })) });
    list.shortHe = w.shortHe; list.shortEn = w.shortEn;
    result.ds.lists.push(list);
    result.ds.officialSeats![list.id] = 0;
    result.loc.listIds.push(list.id);
    result.loc.rows.forEach(r => r.votes.push(0));
    return result;
  }];
}
