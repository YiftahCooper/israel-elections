import type { Scenario } from '../model/scenario.ts';

/** Replay timestamps and transient ids do not constitute a document edit. */
export function scenarioDirty(s: Scenario, reference: Scenario): boolean {
  const content = ({ id: _id, version: _version, log: _log, ...document }: Scenario) => document;
  return JSON.stringify(content(s)) !== JSON.stringify(content(reference));
}

export function nextCopyName(name: string, names: readonly string[]): string {
  const base = name.replace(/ \(\d+\)$/, '');
  let n = 1;
  while (names.includes(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}
