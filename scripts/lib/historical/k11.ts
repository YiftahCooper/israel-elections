import { verifyHistoricalProgress, buildHistorical, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK11 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k11', options);
export const buildK11 = (options: VerifyOptions = {}) => buildHistorical('k11', options);
