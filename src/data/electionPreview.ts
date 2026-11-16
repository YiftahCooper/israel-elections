import { allocate } from '../engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../model/scenario.ts';
import type { ElectionDataset } from './schema.ts';

/** An election's official result strip: each list that won seats, as [colour, seats], in list order. Shipped in the
 *  election index (scripts/election-previews.ts), so the election picker draws every strip without loading the data. */
export function electionPreview(ds: ElectionDataset): [string, number][] {
  const s = scenarioFromDataset(ds);
  const r = allocate(toEngineInput(s));
  return r.lists.filter((l) => l.seats > 0).map((l) => [s.lists.find((x) => x.id === l.id)!.color, l.seats]);
}
