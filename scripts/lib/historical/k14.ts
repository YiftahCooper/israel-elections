import { verifyHistoricalProgress, type VerifyOptions } from './k13-k15-common.ts';
export const verifyK14 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k14', options);

/** No public jobs until all winning rosters and sourced seat reproduction pass. */
export function buildK14(options: VerifyOptions = {}): [] {
  verifyK14(options);
  return [];
}
