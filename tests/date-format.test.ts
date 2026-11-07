import { expect, it } from 'vitest';
import { formatDate } from '../src/app/dateFormat.ts';

it('localises full dates in both languages without changing precision or timezone', () => {
  expect(formatDate('2021-04-05', 'he')).toBe('5 באפר׳ 2021');
  expect(formatDate('2021-04-05', 'en')).toBe('5 Apr 2021');
  expect(formatDate('1978-09', 'he')).toBe('ספט׳ 1978');
  expect(formatDate('1978-09', 'en')).toBe('Sept 1978');
  expect(formatDate('1978', 'he')).toBe('1978');
  expect(formatDate('1978', 'en')).toBe('1978');
  expect(formatDate('1949-01-25', 'en')).toBe('25 Jan 1949');
});

it('formats timestamp dates without exposing the timestamp and preserves non-date labels', () => {
  expect(formatDate('2021-04-05T23:45:00Z', 'en')).toBe('5 Apr 2021');
  expect(formatDate('Not recorded', 'en')).toBe('Not recorded');
});
