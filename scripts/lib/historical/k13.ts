import { historicalBuildJobs, verifyHistoricalProgress, type VerifyOptions } from './k13-k15-common.ts';
export const verifyK13 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k13', options);
export const buildK13 = (options: VerifyOptions = {}) => historicalBuildJobs('k13', options);
