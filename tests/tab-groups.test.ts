import { describe, expect, test } from 'vitest';
import { TOOL_FEATURES } from '../src/app/features.ts';
import { TAB_GROUP, TAB_GROUPS, groupTabs } from '../src/app/tabGroups.ts';

describe('the three headings over the tab row', () => {
  test('every tool sits under one heading', () => {
    for (const [id] of TOOL_FEATURES) expect(TAB_GROUPS.map(g => g.id), id).toContain(TAB_GROUP[id]);
  });
  test('headings are bilingual', () => {
    for (const g of TAB_GROUPS) { expect(g.label[0]).toMatch(/\w/); expect(g.label[1]).toMatch(/[א-ת]/); }
  });
  test('keeps the given order and leaves out empty headings', () => {
    const groups = groupTabs([{ id: 'sources' }, { id: 'board' }, { id: 'after' }]);
    expect(groups.map(g => [g.id, g.tabs.map(t => t.id)])).toEqual([['scenario', ['board']], ['happened', ['sources', 'after']]]);
  });
  test('tolerates a tool that is missing or not listed', () => {
    const withoutCompare = TOOL_FEATURES.map(([id]) => ({ id })).filter(t => (t.id as string) !== 'compare');
    expect(groupTabs(withoutCompare).flatMap(g => g.tabs).length).toBe(withoutCompare.length);
    expect(groupTabs([{ id: 'glossary' }])[0]).toMatchObject({ id: 'scenario', tabs: [{ id: 'glossary' }] });
  });
});
