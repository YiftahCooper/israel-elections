import type { Action, Scenario } from './scenario.ts';

/** Explicit and exhaustive: adding an Action requires deciding whether it edits facts.
 * Metadata identifies an authored scenario but is not a counterfactual election input. */
export const ACTION_CLASSIFICATION = {
  setBlocAppearance: 'appearance', setPartyColor: 'appearance', resetColors: 'appearance',
  familyOperation: 'conditional', startPart: 'conditional',
  setIdentityColor: 'metadata', rename: 'metadata', setDescription: 'metadata',
  applyBlocScheme: 'view', setFactionSplit: 'view', setCoalition: 'analysis',
  setVotes: 'edit', transfer: 'edit', addVoters: 'edit', redistribute: 'edit', scaleAll: 'edit',
  merge: 'edit', split: 'edit', addList: 'edit', removeList: 'edit', setWithdrawn: 'edit',
  setListMeta: 'conditional', setAgreement: 'edit', removeAgreement: 'edit', candidates: 'edit',
  setRules: 'edit', setMode: 'edit', setTotals: 'edit', setBlocs: 'analysis', setPartyBloc: 'analysis',
  setLottery: 'edit', resetList: 'edit', resetVotes: 'edit', resetCandidates: 'edit',
  setTurnout: 'edit', restore: 'conditional',
} as const satisfies Record<Action['type'], 'edit' | 'view' | 'metadata' | 'conditional' | 'appearance' | 'analysis'>;

export function isFactAction(a: Action): boolean {
  if (a.type === 'setListMeta') return Object.keys(a.patch).some(k => k !== 'color' && k !== 'bloc');
  if (a.type === 'familyOperation') return a.operation==='scale';
  if (a.type === 'restore') return a.what !== 'blocs';
  if (a.type === 'startPart') return a.part !== 'coalitions' && a.part !== 'blocs';
  return ACTION_CLASSIFICATION[a.type] === 'edit';
}
export const factLog = (s: Pick<Scenario, 'log'>) => s.log.filter(e => isFactAction(e.action));
/** Save checkpoint comparison ignores view steps and timestamps, while preserving author metadata. */
export const saveLog = (s: Pick<Scenario, 'log'>) => s.log.filter(e => ACTION_CLASSIFICATION[e.action.type] === 'metadata' || ACTION_CLASSIFICATION[e.action.type] === 'appearance' || e.action.type==='setListMeta'&&'color' in e.action.patch || isAnalysisAction(e.action) || isFactAction(e.action)).map(e => e.action);

/** Portable field inventory: A=result, B=analysis/view, C=appearance/document envelope.
 * Nested mixed objects are classified separately below. The owner's 6 November rule
 * classifies grouping membership as B; only vote scaling makes family operations A. */
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
export const hasAppearance = (s:Pick<Scenario,'log'>) => s.log.some(e=>ACTION_CLASSIFICATION[e.action.type]==='appearance'||e.action.type==='setListMeta'&&'color' in e.action.patch);

/** Store containers inherit their contents; the UI choices themselves never edit results. */
export const STORE_FIELDS = {
 familyView:'B',datasets:'A',elections:'A',electionId:'B',scenario:'A',preview:'A',reference:'A',past:'A',future:'A',saved:'A',sessions:'A',scenarioDrafts:'A',
 markOfficial:'B',selectedListId:'C',blocPanel:'C',tool:'C',compareWith:'B',lang:'C',theme:'C',level:'C',customFeatures:'C',hintDismissed:'C',digits:'C',layout:'C',showComponentSeats:'B',colorBy:'C',
 toast:'C',loadError:'C',notice:'C',voteSource:'B',preferences:'B',settingsOpen:'C',preferenceAsk:'C',preferenceFor:'B',
} as const satisfies Record<keyof import('../app/store.ts').State,'A'|'B'|'C'>;

export function isAnalysisAction(a:Action):boolean {
 return ACTION_CLASSIFICATION[a.type]==='analysis'||a.type==='setListMeta'&&'bloc' in a.patch||a.type==='familyOperation'&&a.operation==='group'||a.type==='startPart'&&(a.part==='blocs'||a.part==='coalitions')||a.type==='setBlocAppearance'&&a.name!==undefined;
}
export const hasAnalysis=(s:Pick<Scenario,'log'>)=>s.log.some(e=>isAnalysisAction(e.action));
