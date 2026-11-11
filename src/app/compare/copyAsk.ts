// Asking for the Copy votes box from the Overview while comparing (the list's row, the list's panel, the top of the
// Lists panel). Session-only, like the box itself; the box is loaded on first use (OverviewCopy.tsx).
import { useSyncExternalStore } from 'react';

/** lists: your lists to copy into (one list, or its joined/split group); null: every list that has one to copy from */
export interface CopyAsk { lists: string[] | null }
let current: CopyAsk | null = null;
const subs = new Set<() => void>();
export function askCopy(a: CopyAsk | null) { current = a; subs.forEach((f) => f()); }
export const useCopyAsk = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => current);
