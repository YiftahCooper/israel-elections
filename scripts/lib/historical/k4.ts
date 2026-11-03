import { buildEarlyDataset } from './k1-k7-common.ts';
/** Emit only a verified national dataset; k6 remains evidence-only. */
export function buildK4(): never[] { return buildEarlyDataset(4); }
