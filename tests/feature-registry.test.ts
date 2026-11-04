import { expect, it } from 'vitest';
import { FEATURES, PRESETS, TRUTH_LABELS } from '../src/app/features.ts';
import { changeText } from '../src/app/changeValue.tsx';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
it('every feature appears exactly once in every complete preset; truth labels cannot be configured', () => {
  const ids = FEATURES.map(f => f[0]);
  expect(new Set(ids).size).toBe(ids.length);
  for (const preset of Object.values(PRESETS)) {
    expect(Object.keys(preset).sort()).toEqual([...ids].sort());
    expect(Object.values(preset).every(v => ['show','collapsed','hidden'].includes(v))).toBe(true);
    for (const truth of TRUTH_LABELS) expect(preset).not.toHaveProperty(truth);
  }
});
it('change values use names, formatted numbers, labelled rules and translated booleans', () => {
  const s = scenarioFromDataset(loadDataset('k25'));
  expect(changeText(s, ['lists',s.lists[0].id,'votes'], 'en')).toMatch(/,/);
  expect(changeText(s, ['agreements'], 'en')).toContain(' + ');
  expect(changeText(s, ['rules'], 'he')).toContain('מנדטים');
  for (const lang of ['en','he'] as const) {
    const text = changeText(s, ['agreements'],lang) + changeText(s,['rules'],lang);
    expect(text).not.toMatch(/[{}"]/);
    expect(text).not.toContain(s.lists[0].id);
  }
});

it('removed agreement paths retain names, never storage keys; bloc values resolve to names', async () => {
  const { editPathLabel } = await import('../src/app/derive.ts');
  const s = scenarioFromDataset(loadDataset('k25'));
  const a = s.agreements[0];
  const removed = { ...s, agreements: [] };
  const label = editPathLabel(removed, ['agreements',a.id], 'en', s);
  expect(label).toContain(' + ');
  expect(label).not.toContain(a.id);
  const list = s.lists.find(l => l.bloc)!;
  expect(changeText(s, ['lists',list.id,'bloc'],'en')).toBe(s.blocs.find(b => b.id === list.bloc)!.nameEn);
});

it('rule eras distinguish method, threshold and inferred candidate cap in both languages', async () => {
  const { ruleEraLabel } = await import('../src/app/changeValue.tsx');
  const { RULESETS } = await import('../src/engine/rules.ts');
  for (const lang of ['en','he'] as const) for (const r of Object.values(RULESETS)) {
    const text = ruleEraLabel(r,lang);
    expect(text).not.toContain(r.id);
    expect(text).toMatch(/19|20/);
    expect(text).not.toMatch(/[{}"]/);
    if (r.seatsCappedAtCandidates) expect(text).toContain(lang === 'he' ? 'מגבלת מועמדים' : 'Candidate cap');
  }
});

it('history uses the same human rule values and never falls back to stored identifiers', async () => {
  const { describe } = await import('../src/app/actionDescription.ts');
  const s = scenarioFromDataset(loadDataset('k25'));
  expect(describe({type:'setRules',patch:{remainderMethod:'largest-remainder',majorityCap:false}}, s, 'he')).not.toMatch(/remainderMethod|largest-remainder|majorityCap|false/);
  expect(describe({type:'setPartyBloc',partyId:'internal-party',bloc:null},s,'en')).not.toContain('internal-party');
});
