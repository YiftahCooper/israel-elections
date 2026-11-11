/** Three headings over the tab row (owner's provisional choice, 12 Nov 2026: "4a"). One mapping, tab → heading; a tab
 *  that is not listed (or no longer exists) is tolerated: missing tabs are skipped, and an unlisted one joins the
 *  first heading. To undo the headings, render the tabs without `groupTabs`. */
export type TabGroupId = 'scenario' | 'happened' | 'works';
export const TAB_GROUPS: readonly { id: TabGroupId; label: readonly [string, string] }[] = [
  { id: 'scenario', label: ['Your scenario', 'התרחיש שלכם'] },
  { id: 'happened', label: ['What happened', 'מה קרה'] },
  { id: 'works', label: ['How it works', 'איך זה עובד'] },
];
/** Keyed by plain strings, so removing a tool never breaks this table. */
export const TAB_GROUP: Readonly<Record<string, TabGroupId>> = {
  board: 'scenario', scenarios: 'scenario', whatif: 'scenario', coal: 'scenario', structure: 'scenario', compare: 'scenario',
  security: 'scenario', charts: 'scenario', turnout: 'scenario', sens: 'scenario',
  after: 'happened', families: 'happened', loc: 'happened', sources: 'happened',
  walk: 'works', rules: 'works',
};
/** The tabs under each heading, in the order given; headings with no tabs are left out. */
export function groupTabs<T extends { id: string }>(tabs: readonly T[]): { id: TabGroupId; label: readonly [string, string]; tabs: T[] }[] {
  return TAB_GROUPS.map(g => ({ ...g, tabs: tabs.filter(t => (TAB_GROUP[t.id] ?? TAB_GROUPS[0].id) === g.id) })).filter(g => g.tabs.length > 0);
}
