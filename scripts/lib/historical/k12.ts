import { verifyHistoricalProgress, buildHistorical, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK12 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k12', options);
export const buildK12 = (options: VerifyOptions = {}) => buildHistorical('k12', options);
