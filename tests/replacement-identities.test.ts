// The MKs who entered a Knesset mid-term from further down their list are linked to their list place, so their MK history
// and the candidate list show the same person (review V3 F9, 19 Nov 2026: Orna Starkmann, Akram Hasson, Roni Malkai and
// others had a Knesset term but no list place). Each link is a reviewed identity decision with its evidence in
// data/raw/bios/identity-decisions.reviewed.json; nothing here is matched by name at run time.
import { describe, expect, it } from 'vitest';
import { compileMkHistory, type MkReview } from '../scripts/mk-history-runtime.ts';

const LINKED: [person: number, knesset: number, list: string, rank: number][] = [
  [12835, 17, '17-ג', 8], // Yehoshua Menachem Pollack, United Torah Judaism
  [10555, 18, '18-אמת', 16], // Shakib Shanan, Labor
  [11235, 19, '19-מחל', 34], // Leon Litinetsky, Likud Yisrael Beiteinu
  [30762, 23, '23-פה', 36], // Michal Wunsh, Blue and White
  [30763, 23, '23-פה', 37], // Einav Kabla
  [30764, 23, '23-פה', 38], // Tehila Friedman
  [30766, 23, '23-פה', 39], // Hila Shay Vazan
  [30779, 23, '23-פה', 44], // Anat Knafo
  [30794, 24, '24-ב', 14], // Orna Starkmann, Yamina
  [22151, 25, '25-כן', 16], // Akram Hasson, National Unity
  [30874, 25, '25-ט', 16], // Zvi Sukkot, Religious Zionism
  [30923, 25, '25-פה', 31], // Roni Malkai, Yesh Atid
];

describe('replacement MKs are linked to their list place', () => {
  const rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview);
  it.each(LINKED)('person %i in Knesset %i: %s No. %i, entered later', (person, k, list, rank) => {
    const run = rt.people[person]?.runs.find((r) => r[0] === k);
    expect(run?.slice(0, 4)).toEqual([k, list, rank, 'later']);
  });
});
