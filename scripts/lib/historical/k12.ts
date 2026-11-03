import { verifyHistoricalProgress, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK12 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k12', options);

/** Evidence preflight only. No public dataset is registered while release gates fail. */
export function buildK12(options: VerifyOptions = {}): [] {
  verifyK12(options);
  return [];
}
