import { verifyHistoricalProgress, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK8 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k8', options);

/** Evidence preflight only. No public dataset is registered while release gates fail. */
export function buildK8(options: VerifyOptions = {}): [] {
  verifyK8(options);
  return [];
}
