import { expect, it } from 'vitest';
import { loadDataset } from './helpers.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { describe } from '../src/app/actionDescription.ts';
import { parseIntInput } from '../src/app/format.ts';
import { deltaAction } from '../src/app/voteEdit.ts';

it('vote entry accepts separators, other digit sets and k/m shorthand, and rejects what is not a whole vote count', () => {
  expect(parseIntInput('1,234,567')).toBe(1234567);
  expect(parseIntInput(' 1 234 567 ')).toBe(1234567);
  expect(parseIntInput("1'234'567")).toBe(1234567);
  expect(parseIntInput('1 234 567')).toBe(1234567);
  expect(parseIntInput('١٢٣٤٥٦٧')).toBe(1234567);
  expect(parseIntInput('۱۲۳۴۵۶۷')).toBe(1234567);
  expect(parseIntInput('10k')).toBe(10000);
  expect(parseIntInput('1.15k')).toBe(1150);
  expect(parseIntInput('1.2M')).toBe(1200000);
  expect(parseIntInput('0')).toBe(0);
  for (const bad of ['', '-5', '1.5', '1.2345k', 'abc', '1e6', '99999999999999999999', '12 votes'])
    expect(parseIntInput(bad), bad).toBeNull();
});

it('undo labels for a proportional vote edit name the list that was moved', () => {
  const s = scenarioFromDataset(loadDataset('k25'));
  const likud = s.lists.find((l) => l.shortEn === 'Likud')!;
  const up = deltaAction(s, likud, 10000, { kind: 'proportional' })!;
  const down = deltaAction(s, likud, -10000, { kind: 'proportional' })!;
  expect(describe(up, s, 'en')).toMatch(/^Likud: .*\+10,000.* votes from the other lists$/);
  expect(describe(down, s, 'en')).toMatch(/^Likud: .*−10,000.* votes to the other lists$/);
  expect(describe(up, s, 'he')).toMatch(/^הליכוד: .*\+10,000.* קולות משאר הרשימות$/);
});
