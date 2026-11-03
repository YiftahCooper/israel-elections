import { verifyHistoricalProgress, type VerifyOptions } from './k16-k17-common.ts';
export const verifyK17 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k17', options);

/** Gated build registration: never creates numeric locality codes, electorate or committee
 * identifiers for fields absent from the official source. See the retained release blockers. */
export function buildK17(options: VerifyOptions = {}): [] {
  verifyK17(options);
  return [];
}
