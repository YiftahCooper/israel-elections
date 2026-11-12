// The steps every built dataset passes through before it is written (scripts/build-datasets.ts), shared
// with the tests that compare a builder's output with the published file.
import type { ElectionDataset, LocalityDataset } from '../../../src/data/schema.ts';
import { applyPartyLinks } from './party-links.ts';
import { applyBios, displayNameEn } from './bios.ts';
import { applyLogos } from './logos.ts';
import { applyMeta } from './meta.ts';
import { applyCandidateNotes } from './notes.ts';
import { seatOrder } from './records.ts';

export const finalizeDataset = (ds: ElectionDataset,localities?:LocalityDataset): ElectionDataset => englishNames(applyPartyLinks(applyBios(applyLogos(applyMeta(applyCandidateNotes({ ...ds, lists: seatOrder(ds.lists) }),localities)))));

/** List and party names in English take one display form (bios.ts displayNameEn), so one list is spelled one way in every
 *  election (audit 12 Nov 2026, c-famous-late-12: Ra’am–Ta’al beside Ra'am–Ta'al). Notes and other prose keep their own. */
const englishNames = (ds: ElectionDataset): ElectionDataset => ({ ...ds, lists: ds.lists.map((l) => ({
  ...l,
  ...(l.shortEn ? { shortEn: displayNameEn(l.shortEn) } : {}),
  ...(l.englishName ? { englishName: { ...l.englishName, label: displayNameEn(l.englishName.label) } } : {}),
  ...(l.parties ? { parties: l.parties.map((p) => p.nameEn ? { ...p, nameEn: displayNameEn(p.nameEn) } : p) } : {}),
})) });
