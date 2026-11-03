import { historicalBuildJobs, verifyHistoricalProgress, type VerifyOptions } from './k13-k15-common.ts';
export const verifyK14 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k14', options);
export const buildK14 = (options: VerifyOptions = {}) => historicalBuildJobs('k14', options);
