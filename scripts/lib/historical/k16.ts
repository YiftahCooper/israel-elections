import { releaseDataset, verifyHistoricalProgress, type VerifyOptions } from './k16-k17-common.ts';
export const verifyK16 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k16', options);

/** Registers the retained-input build; polling scratch is an optional additional check. */
export function buildK16(options: VerifyOptions = {}) {
  return [() => releaseDataset(verifyK16(options))];
}
