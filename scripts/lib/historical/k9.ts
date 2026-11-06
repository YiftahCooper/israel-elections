// K9 runs the shared K8–K12 gate with one documented exception: Ratz's single elected member is
// cross-checked against the Knesset's official OData membership record instead of the results
// gazette. Every other list, and every other election, keeps the gazette-only contract.
import { releasedDataset, verifyHistoricalProgress, type Audit, type EvidenceExtension, type VerifyOptions } from './k8-k12-common.ts';
import { META } from '../list-meta.ts';
import { rawJson } from '../build/sources.ts';
import type { Check } from '../build/validate.ts';

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`k9 evidence: ${message}`);
}
interface MembershipResponse {
  'odata.nextLink'?: string;
  value: { PersonToPositionID: number; PersonID: number; PositionID: number; KnessetNum: number;
    StartDate: string; FinishDate: string | null; FactionID: number | null; FactionName: string | null;
    KNS_Person: { PersonID: number; LastName: string; FirstName: string } }[];
}
/** Check the retained official response, including identity, opening date and faction.
 * No modern name substitutes for a registered candidate; the caller compares rank 1. */
export function verifyRatzMembership(evidence: MembershipResponse): string {
  assert(!evidence['odata.nextLink'] && evidence.value.length === 2, 'incomplete Ratz OData response');
  const opening = '1977-06-13T00:00:00';
  assert(evidence.value.every(r => r.PersonID === 2143 && r.KNS_Person.PersonID === r.PersonID &&
    r.KnessetNum === 9 && r.StartDate === opening && (r.FinishDate === null || r.FinishDate > opening) &&
    r.KNS_Person.LastName === 'אלוני' && r.KNS_Person.FirstName === 'שולמית'), 'Ratz identity or opening service dates differ');
  assert(evidence.value.some(r => r.PersonToPositionID === 997 && r.PositionID === 61), 'missing opening Knesset membership');
  assert(evidence.value.some(r => r.PersonToPositionID === 27111 && r.PositionID === 54 && r.FactionID === 405 && r.FactionName === 'ר"ץ'), 'missing opening Ratz faction membership');
  return 'אלוני שולמית';
}

const RATZ: EvidenceExtension = {
  label: 'k9 evidence',
  acceptsElectedSource: (c, e) => c.letters === 'רצ' && e.sourceId === 'k9-ratz-odata' && e.pages.length === 0,
  verify: (r, rosters, check: Check) => {
    const ratz = rosters.find(c => c.letters === 'רצ');
    check(r.sourceIds.includes('k9-ratz-odata') && r.sourceIds.includes('k9-odata-positions'), 'missing official Ratz evidence');
    const definitions = rawJson('k9/odata-positions.json').value as { PositionID: number; Description: string }[];
    check(definitions.find(p => p.PositionID === 61)?.Description === 'חברת הכנסת' && definitions.find(p => p.PositionID === 54)?.Description === 'חבר/ת סיעה', 'unexpected OData position definitions');
    const ratzName = verifyRatzMembership(rawJson('k9/ratz-odata.json'));
    check(ratz?.candidates[0]?.nameHe === ratzName && ratz.electedCrossCheck?.sourceId === 'k9-ratz-odata' && ratz.electedCrossCheck.namesHe?.[0] === ratzName, 'Ratz rank 1 does not match the official opening membership');
  },
};

export const verifyK9 = (opts: VerifyOptions = {}): Audit => verifyHistoricalProgress('k9', opts, RATZ);

export function buildK9(options: VerifyOptions = {}) {
  const audit = verifyK9(options);
  return audit.releaseReady ? [() => {
    const ds = releasedDataset(audit);
    // Stale-letter IDs stay opaque stable keys; display uses corrected letters/names.
    const stable = Object.fromEntries((rawJson('k9/national.reviewed.json') as { lists: { letters: string; legacyId?: string }[] }).lists.filter(l => l.legacyId).map(l => [l.letters, l.legacyId!]));
    ds.lists.forEach(l => {
      if (stable[l.letters]) {
        const old = META[l.id];
        if (old) { l.shortEn = old.en ?? null; l.color = old.color; l.bloc = old.bloc ?? null; }
        l.shortHe = ['הפ', 'זך', 'פ', 'פז'].includes(l.letters) ? l.nameHe : (old?.he ?? l.nameHe);
      }
      if (l.letters === 'זה') l.shortHe = l.nameHe;
      if (l.candidatesUnavailable) l.notesHe = ['רשימת המועמדים פורסמה בילקוט הפרסומים 2319, אך טרם תומללה באפליקציה.'];
    });
    // Darken this k9-only brown so its adjacent Poalei Agudat Yisrael seat
    // stays distinguishable; keep shared metadata and other elections unchanged.
    ds.lists.find(l => l.letters === 'פש')!.color = '#79502e';
    return { ds, loc: null };
  }] : [];
}
