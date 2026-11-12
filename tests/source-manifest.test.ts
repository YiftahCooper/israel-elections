// The provenance manifest (data/raw/SOURCES.json) must describe the bytes actually retained, for every record that names a
// file, not only those a builder cites (audit 12 Nov, ax-screens-d-02 and -03).
import { describe, expect, it } from 'vitest';
import { checker } from '../scripts/lib/build/validate.ts';
import { manifest, verifyManifest } from '../scripts/lib/build/sources.ts';

const check = checker('manifest');
const rec = (id: string) => ({ ...manifest().find((s) => s.id === id)! });

describe('source manifest integrity', () => {
  it('every retained file matches its recorded SHA-256 and byte count', () => {
    expect(() => verifyManifest(check)).not.toThrow();
  });
  it('covers records no builder cites: the biography inputs and the 1992/1999 agreement searches', () => {
    for (const id of ['bios-knesset-site-names-en', 'bios-identity-decisions', 'bios-party-sources', 'k13-agreement-search-yp4014', 'k15-agreement-search-yp4756']) {
      expect(() => verifyManifest(check, [{ ...rec(id), sha256: '0'.repeat(64) }]), id).toThrow(/SHA-256 differs/);
      expect(() => verifyManifest(check, [{ ...rec(id), bytes: rec(id).bytes! + 1 }]), id).toThrow(/byte count differs/);
    }
  });
  it('refuses a retained file that is missing or stored outside data/raw', () => {
    expect(() => verifyManifest(check, [{ ...rec('k13-agreement-search-yp4014'), file: 'k13/missing.pdf' }])).toThrow(/retained file missing/);
    expect(() => verifyManifest(check, [{ ...rec('k13-agreement-search-yp4014'), file: '../../.backup-scratch/k13-k15/yp4014.pdf' }])).toThrow(/outside data\/raw/);
    // a polling-station working copy may be absent: scripts/fetch-sources.ts recovers it
    expect(() => verifyManifest(check, [{ ...rec('k16-ballots-datagov'), file: '../../.backup-scratch/raw/k16/absent.json' }])).not.toThrow();
  });
});
