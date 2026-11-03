// K9 keeps its supplementary OData release gate here: the shared K8–K12
// verifier deliberately requires every cross-check to come from the results gazette.
// The other elections and that stricter gazette-only contract are unchanged.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { researchDataset, releasedDataset, type Audit, type Review, type ReviewedRoster, type VerifyOptions } from './k8-k12-common.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';

const ROOT = join(import.meta.dirname, '../../..');
const RAW = join(ROOT, 'data/raw');
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const hash = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const whole = (n: number) => Number.isSafeInteger(n) && n >= 0;
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

export function verifyK9(opts: VerifyOptions = {}): Audit {
  const id = 'k9';
  const r: Review = readJson(join(RAW, id, 'national.reviewed.json'));
  const manifest = readJson(join(RAW, 'SOURCES.json')) as { id: string; file: string; sha256: string }[];
  assert(r.id === id, `${id}: wrong review id`);
  for (const sourceId of [...r.sourceIds, `${id}-national-reviewed`]) {
    const s = manifest.find(s => s.id === sourceId);
    assert(s?.file && s.sha256, `${id}: missing source ${sourceId}`);
    assert(hash(readFileSync(join(RAW, s.file))) === s.sha256, `${sourceId}: source hash changed`);
  }
  assert(new Set(r.lists.map(l => l.letters)).size === r.lists.length, `${id}: duplicate ballot letters`);
  assert(r.lists.every(l => l.letters && l.nameHe && whole(l.gazetteVotes) && whole(l.officialSeats)), `${id}: invalid national row`);
  assert(r.lists.reduce((s, l) => s + l.gazetteVotes, 0) === r.gazetteTotals.valid, `${id}: list votes do not sum to valid`);
  assert(r.lists.reduce((s, l) => s + l.officialSeats, 0) === 120, `${id}: gazetted seats do not sum to 120`);
  const t = r.supplementalTotals;
  assert(whole(t.registered) && whole(t.votesCast) && t.registered >= t.votesCast, `${id}: invalid CBS totals`);
  assert(r.gazetteTotals.valid + r.gazetteTotals.invalid === t.votesCast, `${id}: cast ≠ valid + invalid`);
  const members = r.agreements.pairs.flat();
  assert(r.agreements.pairs.every(p => p.length === 2) && new Set(members).size === members.length && members.every(m => r.lists.some(l => l.letters === m)), `${id}: invalid agreement membership`);
  assert(!r.agreements.complete || r.agreements.page !== null, `${id}: complete notice needs a page citation`);

  const rosterFile = join(RAW, id, 'candidates.reviewed.json');
  const rosters: ReviewedRoster[] = existsSync(rosterFile) ? readJson(rosterFile).lists : [];
  assert(!rosters.length || r.sourceIds.includes(`${id}-candidates-reviewed`), `${id}: reviewed roster must be hashed in sourceIds`);
  assert(new Set(rosters.map(c => c.letters)).size === rosters.length, `${id}: duplicate roster`);
  for (const c of rosters) {
    assert(r.lists.some(l => l.letters === c.letters), `${id}: unknown roster letters`);
    assert(c.publishedCount > 0 && c.candidates.length <= c.publishedCount && c.complete === (c.candidates.length === c.publishedCount), `${id}: incorrect roster coverage`);
    assert(c.candidates.every((v, i) => v.rank === i + 1 && v.nameHe.trim() && c.pages.includes(v.page)), `${id}: rank/name/page missing`);
    const e = c.electedCrossCheck;
    if (e) {
      const seats = r.lists.find(l => l.letters === c.letters)!.officialSeats;
      assert(((e.sourceId === r.resultsSourceId && e.pages.length > 0) || (c.letters === 'רצ' && e.sourceId === 'k9-ratz-odata' && e.pages.length === 0)) && e.ranks.length === seats && e.ranks.every((rank, i) => rank === i + 1), `${id}: invalid elected-rank cross-check`);
      assert(e.namesHe?.length === seats, `${id}: missing elected-name transcription`);
      for (const [i, name] of e.namesHe.entries()) {
        const candidate = c.candidates[i]?.nameHe;
        assert(candidate && (candidate === name || e.spellingVariants?.some(v => v.rank === i + 1 && v.candidateNameHe === candidate && v.electedNameHe === name && v.note)), `${id}: unchecked elected-name difference ${c.letters} #${i + 1}`);
      }
    }
  }
  const ratz = rosters.find(c => c.letters === 'רצ');
  assert(r.sourceIds.includes('k9-ratz-odata') && r.sourceIds.includes('k9-odata-positions'), 'missing official Ratz evidence');
  const definitions = readJson(join(RAW, 'k9/odata-positions.json')).value as { PositionID: number; Description: string }[];
  assert(definitions.find(p => p.PositionID === 61)?.Description === 'חברת הכנסת' && definitions.find(p => p.PositionID === 54)?.Description === 'חבר/ת סיעה', 'unexpected OData position definitions');
  const ratzName = verifyRatzMembership(readJson(join(RAW, 'k9/ratz-odata.json')));
  assert(ratz?.candidates[0]?.nameHe === ratzName && ratz.electedCrossCheck?.sourceId === 'k9-ratz-odata' && ratz.electedCrossCheck.namesHe?.[0] === ratzName, 'Ratz rank 1 does not match the official opening membership');
  const coverage = r.lists.filter(l => l.officialSeats > 0).every(l => {
    const c = rosters.find(c => c.letters === l.letters);
    return c && c.candidates.length >= l.officialSeats && c.electedCrossCheck?.namesHe?.length === l.officialSeats;
  });
  const releaseReady = coverage && r.agreements.complete && r.allocationCheck.exact && r.releaseBlockers.length === 0;
  assert(r.candidateChecks.completeWinningRostersVerified === coverage, `${id}: incorrect winning-roster coverage claim`);
  const audit: Audit = { review: r, rosters, releaseReady };
  const allocation = allocate(toEngineInput(scenarioFromDataset(researchDataset(audit))));
  assert(allocation.seatsAllocated === 120 && allocation.warnings.length === 0, `${id}: incomplete/ambiguous allocation`);
  const differences = r.lists.flatMap(l => {
    const computed = allocation.lists.find(x => x.id === `${id.slice(1)}-${l.letters}`)!.seats;
    return computed === l.officialSeats ? [] : [{ letters: l.letters, computed, official: l.officialSeats }];
  });
  assert(JSON.stringify(differences) === JSON.stringify(r.allocationCheck.differences), `${id}: allocation diagnostic changed`);
  assert(r.allocationCheck.exact === (differences.length === 0), `${id}: incorrect exact-reproduction claim`);
  const entry = (readJson(join(ROOT, 'public/data/elections.json')) as { id: string; available: boolean }[]).find(e => e.id === id);
  assert(entry && (!(opts.available ?? entry.available) || releaseReady), `${id}: release blocked: ${r.releaseBlockers.join(' ')}`);
  if (!releaseReady) assert(!existsSync(join(ROOT, 'public/data', `${id}.json`)) && !existsSync(join(ROOT, 'public/data', `${id}-localities.json`)), `${id}: blocked research fixture must not be published`);
  if (opts.log !== false) console.log(`${id}: ${r.allocationCheck.exact ? 'all gazetted seats reproduced' : 'allocation NOT reproduced'}; ${releaseReady ? 'RELEASE READY' : 'UNAVAILABLE — ' + r.releaseBlockers.join(' ')}`);
  return audit;
}

export function buildK9(options: VerifyOptions = {}) {
  const audit = verifyK9(options);
  return audit.releaseReady ? [() => {
    const ds = releasedDataset(audit);
    // Darken this k9-only brown so its adjacent Poalei Agudat Yisrael seat
    // stays distinguishable; keep shared metadata and other elections unchanged.
    ds.lists.find(l => l.letters === 'פש')!.color = '#79502e';
    return { ds, loc: null };
  }] : [];
}
