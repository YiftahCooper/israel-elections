import { verifyHistoricalProgress, type VerifyOptions } from './k13-k15-common.ts';
export const verifyK15 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k15', options);

/** No public jobs until all winning rosters and sourced seat reproduction pass. */
export function buildK15(options: VerifyOptions = {}): [] {
  verifyK15(options);
  return [];
}
