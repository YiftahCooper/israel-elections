import { verifyEarlyProgress } from './k1-k7-common.ts';
/** Validates retained progress; deliberately produces no unverified public dataset. */
export function buildK1(): never[] { verifyEarlyProgress(1); return []; }
