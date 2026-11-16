/** The reasons seats changed hands, for the build-time compilers of the term timeline and MK history. The Knesset's
 *  membership records give no reason ("unknown" on every replacement); the research lane's replacement events carry one
 *  (data/research/knesset-events/kN.json `replacement.reason`, pointing at the records through `memberChangesRefs`).
 *  Words for each code: src/history/reasons.ts. */
import { existsSync, readFileSync } from 'node:fs';

type Ref = { path: string; pointer: string };
type ReasonEvent = { marker?: string | null; replacement?: { reason?: string; memberChangesRefs?: Ref[] } };
type Rec = { reason?: string };

/** Fills each replacement record's missing reason from the research events of the same Knesset (in place). */
export function applyEventReasons(root: string, k: number, replacements: Rec[]): void {
  const path = `data/research/knesset-events/k${k}.json`;
  if (!existsSync(`${root}/${path}`)) return;
  const events = (JSON.parse(readFileSync(`${root}/${path}`, 'utf8')) as { events: ReasonEvent[] }).events;
  for (const e of events) {
    const r = e.marker === 'replacement' ? e.replacement : undefined;
    if (!r?.reason) continue;
    for (const m of r.memberChangesRefs ?? []) {
      const i = /^\/replacements\/(\d+)$/.exec(m.pointer)?.[1];
      const rec = m.path.endsWith(`/k${k}.json`) && i != null ? replacements[Number(i)] : undefined;
      if (rec && (!rec.reason || rec.reason === 'unknown')) rec.reason = r.reason;
    }
  }
}

/** A recorded reason, or null for none ("unknown", empty). */
export const knownReason = (reason: string | null | undefined): string | null => reason && reason !== 'unknown' ? reason : null;
