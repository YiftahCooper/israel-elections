import { verifyHistoricalProgress, buildHistorical, type VerifyOptions } from './k8-k12-common.ts';
export const verifyK10 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k10', options);
export const buildK10 = (options: VerifyOptions = {}) => buildHistorical('k10', options);
