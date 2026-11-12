// "Copy 2022's …" beyond the Lists panel (Turnout and Rules screens while comparing): k25 official → k26 official.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { votesCast } from '../src/model/scenario.ts';
import { baselineOf } from '../src/app/derive.ts';
import { planOther, type OtherCopy } from '../src/app/compare/copyOther.ts';
import type { Reference } from '../src/app/compare/mode.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const d25 = load('k25'), d26 = load('k26'), d1 = load('k1'), d2 = load('k2');
const k25 = baselineOf(d25), k26 = baselineOf(d26);
const refOf = (ds: ElectionDataset): Reference => { const sc = baselineOf(ds); return { key: 'prev', id: sc.electionId, sc, initial: sc, start: sc, ds, year: ds.electionDate.slice(0, 4), name: 'Official result', official: true, same: false }; };
const plan = (what: OtherCopy, ref = refOf(d25), work = k26, ds = d26) => planOther(ref, work, what, { base: work, workDate: ds.electionDate });

describe('copies from the compared result', () => {
  it('eligible voters: the number itself, marked as copied', () => {
    const p = plan('registered');
    if (!p.ok) throw new Error(p.reason.en);
    expect(p.result.registered).toBe(k25.registered);
    expect((p.action as { provenance?: { field: string } }).provenance).toMatchObject({ field: 'registered' });
  });
  it('turnout: the same percentage of your eligible voters, to the nearest vote', () => {
    const p = plan('turnout');
    if (!p.ok) throw new Error(p.reason.en);
    const want = Math.round(k26.registered * votesCast(k25) / k25.registered);
    expect(Math.abs(votesCast(p.result) - want)).toBeLessThanOrEqual(1);
  });
  it('invalid ballots: the count', () => {
    const p = plan('invalid');
    if (!p.ok) throw new Error(p.reason.en);
    expect(p.result.invalid).toBe(k25.invalid);
  });
  it('the same value says so instead of making an empty step', () => {
    const p = plan('threshold');
    expect(p.ok).toBe(false); // 3.25% in both
    if (!p.ok) expect(p.reason.en).toBe('Already the same.');
  });
  it('a threshold from another law switches to experimental rules in the same step', () => {
    const p = plan('threshold', refOf(d1), baselineOf(d2), d2);
    if (!p.ok) throw new Error(p.reason.en);
    expect(p.result.rules.thresholdPct).toBe(baselineOf(d1).rules.thresholdPct);
    expect(p.result.mode).toBe('experimental');
  });
  it('surplus agreements come across between the lists that pair; the rest are named as skipped', () => {
    const p = plan('agreements');
    if (!p.ok) throw new Error(p.reason.en);
    expect(p.result.agreements).toHaveLength(1); // Shas with United Torah Judaism, the one 2022 pair with counterparts
    expect((p as { skipped?: unknown[] }).skipped?.length).toBeGreaterThan(0);
  });
});
