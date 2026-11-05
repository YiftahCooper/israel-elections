import type { ElectionDataset } from '../data/schema.ts';
import { scenarioFromDataset, type Scenario } from '../model/scenario.ts';

let enabled = false;
export const setFactionDefault = (value: boolean) => { enabled = value; };
export const factionDefault = () => enabled;
const caches = [new WeakMap<ElectionDataset, Scenario>(), new WeakMap<ElectionDataset, Scenario>()];
export function baselineOf(ds: ElectionDataset): Scenario {
  const cache = caches[Number(enabled)];
  let s = cache.get(ds);
  if (!s) { s = scenarioFromDataset(ds, 'historical', enabled); cache.set(ds, s); }
  return s;
}
export const freshScenario = (ds: ElectionDataset, name = '') => scenarioFromDataset(ds, name, enabled);

