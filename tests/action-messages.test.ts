// What the engine says when it refuses a change (audit 12 Nov 2026, c-english-04 and c-english-01): every refusal has a
// plain English and a plain Hebrew form, names lists in the reader's language, and reaches the screen in that language.
import { readFileSync, readdirSync } from 'node:fs';
import { expect, test, vi } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { applyAction } from '../src/model/actions.ts';
import { ActionError, M, type Msg } from '../src/model/messages.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';

vi.stubGlobal('localStorage', { getItem: () => null, setItem() {}, removeItem() {} });
const HEBREW = /[֐-׿]/;
const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8')) as ElectionDataset;
const base = scenarioFromDataset(ds);
const likud = base.lists.find((l) => l.shortEn === 'Likud')!;

// sample arguments for the messages that name a list or a number; a new parameterised message must be added here
const SAMPLES: Record<string, unknown[]> = { withdrawn: [likud], notEnoughVotes: [likud, 1234], poolTooSmall: [1234], splitOver: [2000, 1000], groupInvalid: [2] };
const messages = Object.entries(M).map(([k, m]) => {
  if (typeof m !== 'function') return [k, m] as const;
  expect(SAMPLES[k], `sample arguments for M.${k}`).toBeDefined();
  return [k, (m as (...a: unknown[]) => Msg)(...SAMPLES[k])] as const;
});

test('every message has plain English with no Hebrew letters and a Hebrew form', () => {
  for (const [k, m] of messages) {
    expect(m.en.trim(), k).not.toBe('');
    expect(m.en, k).not.toMatch(HEBREW);
    expect(m.he, k).toMatch(HEBREW);
    // short: what is wrong and what to do, never developer words
    expect(m.en.length, k).toBeLessThan(160);
    expect(m.en, k).not.toMatch(/safe integer|stale|\bid\b|ids\b|preview|editor|inputs are required|≥/i);
  }
});

test('every refusal in the engine uses one of these messages (walks each ActionError site)', () => {
  const files = readdirSync('src/model').filter((f) => f.endsWith('.ts')).map((f) => `src/model/${f}`);
  let sites = 0;
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    // the message argument of need(cond, code, msg), fail(msg) and new ActionError(code, msg)
    for (const m of src.matchAll(/\b(need|fail|new ActionError)\(/g)) {
      if (/const (need|fail) = /.test(src.slice(Math.max(0, m.index! - 12), m.index! + 10))) continue;
      let depth = 0, i = m.index! + m[0].length - 1, end = i;
      for (; end < src.length; end++) { if ('([{'.includes(src[end])) depth++; else if (')]}'.includes(src[end]) && --depth === 0) break; }
      const call = src.slice(i + 1, end);
      if (/^code, msg$/.test(call.trim())) continue; // the helpers themselves
      // split on the top-level commas
      const args: string[] = []; let d = 0, from = 0;
      for (let j = 0; j < call.length; j++) { const c = call[j]; if ('([{'.includes(c)) d++; else if (')]}'.includes(c)) d--; else if (c === ',' && d === 0) { args.push(call.slice(from, j)); from = j + 1; } }
      args.push(call.slice(from));
      const msg = args.at(-1)!.trim();
      sites++;
      expect(msg, `${file}: ${m[1]}(${call.slice(0, 80)}`).toMatch(/^(M\.\w+(\(.*\))?|\w+ \? M\.\w+(\(.*\))? : M\.\w+(\(.*\))?|msg)$/s);
    }
    // nothing in the model throws a refusal some other way
    if (file !== 'src/model/scenario.ts') expect(src, file).not.toMatch(/throw new Error\(/);
  }
  expect(sites).toBeGreaterThan(90);
});

test('a refused change names the list in the reader\'s language', () => {
  const out = applyAction(base, { type: 'setWithdrawn', listId: likud.id, withdrawn: true });
  try { applyAction(out, { type: 'setVotes', listId: likud.id, votes: 5 }); throw new Error('not refused'); } catch (e) {
    expect(e).toBeInstanceOf(ActionError);
    expect((e as ActionError).message).toBe('Likud has withdrawn. Restore it first to change its votes.');
    expect((e as ActionError).he).toContain(likud.shortHe);
  }
  try { applyAction(base, { type: 'transfer', from: likud.id, to: base.lists[1].id, votes: likud.votes + 1 }); throw new Error('not refused'); } catch (e) {
    expect((e as ActionError).message).toMatch(/^Likud has only [\d,]+ votes\. Move fewer votes\.$/);
    expect((e as ActionError).he).toContain(`לרשימה ${likud.shortHe} יש רק`);
  }
});

test('the screen shows the refusal in its own language', async () => {
  const store = await import('../src/app/store.ts');
  for (const lang of ['en', 'he'] as const) {
    store.setState({ lang, datasets: { k26: ds }, electionId: 'k26', scenario: base, past: [], future: [] });
    expect(store.dispatch({ type: 'setRules', patch: { thresholdPct: '2' } })).toBe(false);
    expect(store.getState().toast?.text).toBe(lang === 'he' ? M.rulesByLaw.he : M.rulesByLaw.en);
    // an unreadable file is one plain sentence too
    try { store.importScenarioJson('{"not":"a scenario"}'); throw new Error('accepted'); } catch (e) {
      expect(e).toBeInstanceOf(ActionError);
      expect((e as ActionError).message).not.toMatch(HEBREW);
    }
  }
});

test('Compare\'s refusals name lists in English in English text', async () => {
  const copy = await import('../src/app/compare/copy.ts');
  const withdrawn = applyAction(base, { type: 'setWithdrawn', listId: likud.id, withdrawn: true });
  const from = { sc: withdrawn, start: base, name: 'Edited', official: false };
  const target = base.lists.find((l) => l.id !== likud.id && l.votes > 0)!;
  const small = [...base.lists].filter((l) => l.votes > 0).sort((a, b) => a.votes - b.votes)[0];
  const big = [...base.lists].sort((a, b) => b.votes - a.votes)[0];
  const plans = [
    copy.planVotes({ from, to: base, units: [{ src: [likud.id], dst: [target.id] }], mode: 'count', policy: { kind: 'proportional' } }),
    copy.planWholeList({ from, to: base, srcId: likud.id, dstId: target.id, opts: { votes: true, candidates: true, identity: false, appearance: false, mode: 'count', policy: { kind: 'proportional' } } }),
    // balanced from one list too small to give the votes
    copy.planVotes({ from: { sc: { ...base, lists: base.lists.map((l) => l.id === big.id ? { ...l, votes: l.votes * 3 } : l) }, start: base, name: 'x', official: false }, to: base, units: [{ src: [big.id], dst: [big.id] }], mode: 'count', policy: { kind: 'transfer', listId: small.id } }),
  ];
  for (const p of plans) {
    expect(p.ok).toBe(false);
    if (!p.ok) { expect(p.reason.en).not.toMatch(HEBREW); expect(p.reason.he).toMatch(HEBREW); }
  }
});
