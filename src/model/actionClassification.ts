import type { Action, Scenario } from './scenario.ts';

/** Explicit and exhaustive: adding an Action requires deciding whether it is a change.
 * Changes ('edit') are counted, listed in History and marked: result edits and grouping/coalition
 * edits alike (owner, 7 November 2026). Only appearance (colours) and view choices never count.
 * Metadata identifies an authored scenario but is not a counterfactual election input. */
export const ACTION_CLASSIFICATION = {
  setBlocAppearance: 'appearance', setPartyColor: 'appearance', resetColors: 'appearance',
  familyOperation: 'edit', startPart: 'conditional',
  setIdentityColor: 'metadata', rename: 'metadata', setDescription: 'metadata',
  applyBlocScheme: 'view', setFactionSplit: 'view', setCoalition: 'edit',
  setVotes: 'edit', transfer: 'edit', addVoters: 'edit', redistribute: 'edit', scaleAll: 'edit',
  merge: 'edit', split: 'edit', addList: 'edit', removeList: 'edit', setWithdrawn: 'edit',
  setListMeta: 'conditional', setAgreement: 'edit', removeAgreement: 'edit', candidates: 'edit',
  setRules: 'edit', setMode: 'edit', setTotals: 'edit', setBlocs: 'edit', setPartyBloc: 'edit',
  setLottery: 'edit', resetList: 'edit', resetVotes: 'edit', resetCandidates: 'edit',
  setTurnout: 'edit', restore: 'conditional', copyFrom: 'conditional',
} as const satisfies Record<Action['type'], 'edit' | 'view' | 'metadata' | 'conditional' | 'appearance'>;

/** A Compare copy is classified by what it does: its inner steps. */
const inner = (a: Action): Action[] => a.type === 'copyFrom' ? a.actions : [a];
export function isFactAction(a: Action): boolean {
  if (a.type === 'copyFrom') return a.actions.some(isFactAction);
  if (a.type === 'setListMeta') return Object.keys(a.patch).some(k => k !== 'color');
  // choosing a sourced grouping (or restoring the official one) is a view, like applyBlocScheme
  if (a.type === 'restore') return a.what !== 'blocs';
  if (a.type === 'startPart') return !(a.part === 'blocs' && (a.source === 'preset' || a.source === 'official' || !!a.snapshot?.blocSchemeId));
  return ACTION_CLASSIFICATION[a.type] === 'edit';
}
export const factLog = (s: Pick<Scenario, 'log'>) => s.log.filter(e => isFactAction(e.action));
/** Save checkpoint comparison ignores view steps and timestamps, while preserving author metadata. */
export const saveLog = (s: Pick<Scenario, 'log'>) => s.log.filter(e => ACTION_CLASSIFICATION[e.action.type] === 'metadata' || isAppearanceAction(e.action) || isFactAction(e.action)).map(e => e.action);
const isAppearanceAction = (a: Action): boolean => inner(a).some(x => ACTION_CLASSIFICATION[x.type] === 'appearance' || x.type === 'setListMeta' && 'color' in x.patch);

/** Portable field inventory: A=result, B=grouping/coalition (counted changes that leave votes and
 * seats as they were) or view choices, C=appearance/document envelope. Nested mixed objects are
 * classified separately below; colour fields are C wherever they are nested. */
export const SCENARIO_FIELDS = {
  schema:'C',version:'C',id:'C',name:'C',description:'C',identityColor:'C',baseBuiltAt:'C',log:'C',
  electionId:'A',mode:'A',rules:'A',registered:'A',invalid:'A',lists:'A',agreements:'A',lotteryWinners:'A',
  blocs:'B',blocSchemes:'B',blocSchemeId:'B',customGroupingName:'B',familyDefinition:'B',partyBlocs:'B',candidateBlocs:'B',
  factionSplits:'B',factionSplitBaseline:'B',coalition:'B',
} as const satisfies Record<keyof Scenario,'A'|'B'|'C'>;
export const LIST_FIELDS = {
 id:'A',originIds:'A',letters:'A',nameHe:'A',shortHe:'A',shortEn:'A',color:'C',bloc:'B',votes:'A',withdrawn:'A',heldVotes:'A',
 candidates:'A',sponsorsHe:'A',rosterUnavailable:'A',rosterTruncated:'A',parties:'A',logo:'C',synthetic:'C',links:'C',
} as const satisfies Record<keyof import('./scenario.ts').SimList,'A'|'B'|'C'>;
export const hasAppearance = (s:Pick<Scenario,'log'>) => s.log.some(e=>isAppearanceAction(e.action));

/** Store containers inherit their contents; the UI choices themselves never edit results. */
export const STORE_FIELDS = {
 familyView:'B',datasets:'A',elections:'A',electionId:'B',scenario:'A',preview:'A',reference:'A',past:'A',future:'A',saved:'A',sessions:'A',scenarioDrafts:'A',compare:'A',
 markOfficial:'B',selectedListId:'C',blocPanel:'C',tool:'C',comparing:'B',lang:'C',theme:'C',level:'C',customFeatures:'C',settings:'B',
 toast:'C',loadError:'C',notice:'C',voteSource:'B',preferences:'B',settingsOpen:'C',settingsFocus:'C',preferenceAsk:'C',preferenceFor:'B',
} as const satisfies Record<keyof import('../app/store.ts').State,'A'|'B'|'C'>;
