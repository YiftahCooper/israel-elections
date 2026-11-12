import { useSyncExternalStore } from 'react';
import { validateVoterGroup, type VoterGroupPreset } from '../model/voterGroups.ts';
import { download } from './format.ts';

// Saved voter groups live beside saved scenarios in this browser, under their own key, as the same
// self-describing objects an exported file (or a future shared gallery entry) contains.
const KEY = 'israel-elections:voter-groups';
const listeners = new Set<() => void>();
const read = (): VoterGroupPreset[] | null => {
  try { const raw = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '[]'); return Array.isArray(raw) ? raw.filter((x) => !validateVoterGroup(x).length) : []; }
  catch { return null; }
};
let groups: VoterGroupPreset[] = read() ?? [];
/** A change is made to what is stored now, not to this tab's copy, so a group saved in another open tab is never
 *  written over (audit 12 Nov 2026, c-robustness-07); that tab's change is shown here as it happens. */
function commit(change: (list: VoterGroupPreset[]) => VoterGroupPreset[]) {
  groups = change(read() ?? groups);
  try { localStorage.setItem(KEY, JSON.stringify(groups)); } catch { /* full or disabled storage: kept for this session only */ }
  listeners.forEach((f) => f());
}
globalThis.addEventListener?.('storage', (e: StorageEvent) => { if (e.key !== KEY && e.key !== null) return; groups = read() ?? groups; listeners.forEach((f) => f()); });
const subscribe = (f: () => void) => { listeners.add(f); return () => listeners.delete(f); };
export const useVoterGroups = () => useSyncExternalStore(subscribe, () => groups, () => groups);
/** Adds or replaces by id. */
export function saveVoterGroup(g: VoterGroupPreset) { commit((list) => [g, ...list.filter((x) => x.id !== g.id)]); }
export function deleteVoterGroup(id: string) { commit((list) => list.filter((x) => x.id !== id)); }
export const newGroupId = () => `vg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export function exportVoterGroup(g: VoterGroupPreset) {
  const slug = g.name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'voter-group';
  download(`voter-group-${slug}.json`, JSON.stringify(g, null, 1), 'application/json');
}
