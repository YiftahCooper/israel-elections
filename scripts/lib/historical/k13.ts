import { verifyHistoricalProgress, type VerifyOptions } from './k13-k15-common.ts';
export const verifyK13 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k13', options);

/** No public jobs until all winning rosters and sourced seat reproduction pass. */
export function buildK13(options: VerifyOptions = {}): [] {
  verifyK13(options);
  return [];
}
