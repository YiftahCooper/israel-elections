import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const aftermath = read('data/meta/aftermath/k7.json');
const meta = read('data/meta/k7.json');

describe('1969 audit corrections', () => {
  it('binds Gahal’s departure to all six official ministerial records', () => {
    const ids = [2179, 2320, 2442, 2512, 2609, 3257];
    const records = read('data/raw/k7/government-15-positions.json').value;
    const ministers = records.filter((r: { PersonID: number }) => ids.includes(r.PersonID));
    expect(ministers).toHaveLength(6);
    expect(ministers.every((r: { StartDate: string; FinishDate: string }) =>
      r.StartDate === '1969-12-15T00:00:00' && r.FinishDate === '1970-08-06T00:00:00')).toBe(true);
    const departure = aftermath.government.changes[0];
    expect(departure.date).toBe('1970-08-06');
    expect(aftermath.government.coalitionSeats).toBe(102);
    expect(departure.coalition.some((p: { letters: string }) => p.letters === 'חל')).toBe(false);
    expect(departure.coalition.reduce((n: number, p: { seats: number }) => n + p.seats, 0)).toBe(76);
    expect(departure.coalitionSeats).toBe(76);
  });
  it('keeps the supported start and removes the unsupported consultation end', () => {
    expect(aftermath.recommendationRounds[0].date).toBe('1969-11-01');
    expect(aftermath.recommendationRounds[0].endDate).toBeUndefined();
    expect(aftermath.formation.events[0].endDate).toBeUndefined();
    expect(meta.blocSchemes[1].notes.join(' ')).not.toContain('One-day uncertainty');
  });
  it('preserves the official capture while displaying a reviewed whitespace correction', () => {
    const official = read('data/raw/bios/knesset-site-mk-names-en.json').find((x: { siteId: number }) => x.siteId === 679);
    expect(official.nameEn).toBe('Shmuel  Tamir (Katznelson)');
    const ds = read('public/data/k7.json');
    expect(ds.lists.flatMap((l: { candidates: { id: string; nameEn: string }[] }) => l.candidates)
      .find((c: { id: string }) => c.id === '7-ט#1').nameEn).toBe('Shmuel Tamir (Katznelson)');
  });
});
