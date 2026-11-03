import { releaseDataset, verifyHistoricalProgress, type VerifyOptions } from './k16-k17-common.ts';
export const verifyK17 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k17', options);

/** Registers the retained-input build; polling scratch is an optional additional check. */
export function buildK17(options: VerifyOptions = {}) {
  return [() => releaseDataset(verifyK17(options))];
}
