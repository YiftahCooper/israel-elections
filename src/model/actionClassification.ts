import type { Action, Scenario } from './scenario.ts';

/** Explicit and exhaustive: adding an Action requires deciding whether it edits facts.
 * Metadata identifies an authored scenario but is not a counterfactual election input. */
export const ACTION_CLASSIFICATION = {
  familyOperation: 'edit', startPart: 'conditional',
  setIdentityColor: 'metadata', rename: 'metadata', setDescription: 'metadata',
  applyBlocScheme: 'view', setFactionSplit: 'view', setCoalition: 'view',
  setVotes: 'edit', transfer: 'edit', addVoters: 'edit', redistribute: 'edit', scaleAll: 'edit',
  merge: 'edit', split: 'edit', addList: 'edit', removeList: 'edit', setWithdrawn: 'edit',
  setListMeta: 'edit', setAgreement: 'edit', removeAgreement: 'edit', candidates: 'edit',
  setRules: 'edit', setMode: 'edit', setTotals: 'edit', setBlocs: 'edit', setPartyBloc: 'edit',
  setLottery: 'edit', resetList: 'edit', resetVotes: 'edit', resetCandidates: 'edit',
  setTurnout: 'edit', restore: 'conditional',
} as const satisfies Record<Action['type'], 'edit' | 'view' | 'metadata' | 'conditional'>;

export function isFactAction(a: Action): boolean {
  if (a.type === 'restore') return a.what !== 'blocs';
  if (a.type === 'startPart') return a.part !== 'coalitions' && !(a.part === 'blocs' &&
    (a.source === 'preset' || a.source === 'official' || !!a.snapshot?.blocSchemeId));
  return ACTION_CLASSIFICATION[a.type] === 'edit';
}
export const factLog = (s: Pick<Scenario, 'log'>) => s.log.filter(e => isFactAction(e.action));
/** Save checkpoint comparison ignores view steps and timestamps, while preserving author metadata. */
export const saveLog = (s: Pick<Scenario, 'log'>) => s.log.filter(e => ACTION_CLASSIFICATION[e.action.type] === 'metadata' || isFactAction(e.action)).map(e => e.action);
