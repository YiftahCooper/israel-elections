import { verifyHistoricalProgress, buildHistorical, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK8 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k8', options);
export const buildK8 = (options: VerifyOptions = {}) => buildHistorical('k8', options);
