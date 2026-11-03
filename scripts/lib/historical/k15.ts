import { historicalBuildJobs, verifyHistoricalProgress, type VerifyOptions } from './k13-k15-common.ts';
export const verifyK15 = (options: VerifyOptions = {}) => verifyHistoricalProgress('k15', options);
export const buildK15 = (options: VerifyOptions = {}) => historicalBuildJobs('k15', options);
