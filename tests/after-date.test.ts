import { expect, it } from 'vitest';
import { formatAfterDate } from '../src/app/afterDate.ts';

it('localises full dates in both languages without changing precision or timezone', () => {
  expect(formatAfterDate('2021-04-05', 'he')).toBe('5 באפר׳ 2021');
  expect(formatAfterDate('2021-04-05', 'en')).toBe('5 Apr 2021');
  expect(formatAfterDate('1978-09', 'he')).toBe('ספט׳ 1978');
  expect(formatAfterDate('1978-09', 'en')).toBe('Sept 1978');
  expect(formatAfterDate('1978', 'he')).toBe('1978');
  expect(formatAfterDate('1978', 'en')).toBe('1978');
  expect(formatAfterDate('1949-01-25', 'en')).toBe('25 Jan 1949');
});
