import { useSyncExternalStore } from 'react';
import { validateVoterGroup, type VoterGroupPreset } from '../model/voterGroups.ts';
import { download } from './format.ts';

// Saved voter groups live beside saved scenarios in this browser, under their own key, as the same
// self-describing objects an exported file (or a future shared gallery entry) contains.
const KEY = 'israel-elections:voter-groups';
const listeners = new Set<() => void>();
let groups: VoterGroupPreset[] = (() => {
  try { const raw = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '[]'); return Array.isArray(raw) ? raw.filter((x) => !validateVoterGroup(x).length) : []; }
  catch { return []; }
})();
function commit(next: VoterGroupPreset[]) {
  groups = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* full or disabled storage: kept for this session only */ }
  listeners.forEach((f) => f());
}
const subscribe = (f: () => void) => { listeners.add(f); return () => listeners.delete(f); };
export const useVoterGroups = () => useSyncExternalStore(subscribe, () => groups, () => groups);
/** Adds or replaces by id. */
export function saveVoterGroup(g: VoterGroupPreset) { commit([g, ...groups.filter((x) => x.id !== g.id)]); }
export function deleteVoterGroup(id: string) { commit(groups.filter((x) => x.id !== id)); }
export const newGroupId = () => `vg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export function exportVoterGroup(g: VoterGroupPreset) {
  const slug = g.name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'voter-group';
  download(`voter-group-${slug}.json`, JSON.stringify(g, null, 1), 'application/json');
}
