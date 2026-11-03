// The steps every built dataset passes through before it is written (scripts/build-datasets.ts), shared
// with the tests that compare a builder's output with the published file.
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { applyMeta } from './meta.ts';
import { applyCandidateNotes } from './notes.ts';
import { seatOrder } from './records.ts';

export const finalizeDataset = (ds: ElectionDataset): ElectionDataset => applyMeta(applyCandidateNotes({ ...ds, lists: seatOrder(ds.lists) }));
