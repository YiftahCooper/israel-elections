import { verifyHistoricalProgress, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK9 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k9', options);

/** Evidence preflight only. No public dataset is registered while release gates fail. */
export function buildK9(options: VerifyOptions = {}): [] {
  verifyK9(options);
  return [];
}
