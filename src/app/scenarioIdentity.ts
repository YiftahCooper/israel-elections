import type { Action, Scenario } from '../model/scenario.ts';
export const SCENARIO_PALETTE = ['#65508a', '#486b78', '#77633d', '#80556a', '#526c55'] as const;
export function scenarioColor(s: Pick<Scenario, 'identityColor'>): string {
  return SCENARIO_PALETTE.includes(s.identityColor as typeof SCENARIO_PALETTE[number]) ? s.identityColor! : SCENARIO_PALETTE[0];
}

export function savedColor(log: Action[]): string {
  const a = log.findLast(a => a.type === 'setIdentityColor');
  return scenarioColor({ identityColor: a?.type === 'setIdentityColor' ? a.color : undefined });
}
