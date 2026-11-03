import { verifyHistoricalProgress, buildHistorical, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK9 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k9', options);
export const buildK9 = (options: VerifyOptions = {}) => buildHistorical('k9', options);
