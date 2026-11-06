// One-click counterfactuals for the What if… tool. Each preset is a list of ordinary scenario actions
// replayed on the historical result, so it is reproducible, undoable and shareable like any manual
// edit. Every number shown is computed here from the engine, never written by hand; the assumptions
// each question makes are stated in its text, including those that depend on the election's data
// (which surplus agreements a merger ends).
import type { ElectionDataset } from '../data/schema.ts';
import { allocate } from '../engine/allocate.ts';
import { goals, minimalChange } from '../engine/analysis.ts';
import type { AllocationResult } from '../engine/types.ts';
import { applyAction } from '../model/actions.ts';
import { scenarioFromDataset, toEngineInput, type Action, type Scenario } from '../model/scenario.ts';
import { listLabel } from './derive.ts';
import type { Lang } from './i18n.ts';
import { fmtInt } from './format.ts';
import { toVoteSource } from './voteEdit.ts';

type Text = (s: Scenario, lang: Lang) => string;
export interface WhatIfPreset { id: string; titleEn: string; titleHe: string; experimental?: boolean; body: Text; actions: (s: Scenario) => Action[] | null }

const t = (lang: Lang, en: string, he: string) => (lang === 'he' ? he : en);
const fixed = (en: string, he: string): Text => (_s, lang) => t(lang, en, he);
const has = (s: Scenario, ...ids: string[]) => ids.every((id) => s.lists.some((l) => l.id === id));
const agreementWith = (s: Scenario, id: string) => s.agreements.find((a) => a.members.includes(id));
const nameOf = (s: Scenario, id: string, lang: Lang) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : (lang === 'he' ? 'רשימה לא ידועה' : 'Unknown list'); };
const joinNames = (names: string[], lang: Lang) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} ${t(lang, 'and', 'ו')}${lang === 'en' ? ' ' : ''}${names[names.length - 1]}`;

/** minimal transfer/new votes for `id` to pass the threshold, as an action */
function toPass(s: Scenario, id: string, from?: string): Action[] | null {
  const src = toVoteSource(from ? { kind: 'transfer', listId: from } : { kind: 'new' }, s);
  const m = minimalChange(toEngineInput(s), id, src, goals.qualify(id));
  if (!m.found || m.votes === null) return null;
  const k = Number(m.votes);
  return [from ? { type: 'transfer', from, to: id, votes: k } : { type: 'setVotes', listId: id, votes: s.lists.find((l) => l.id === id)!.votes + k }];
}

const mergeId = (ids: string[]) => `sim-${ids.join('+')}`;
/** A merger named like one made in Merge & split: the parts' labels joined by "–", with the letters and
 *  colour of the largest part. `named` gives a list name that union really used (sourced by its dataset). */
const merge = (s: Scenario, ids: string[], named?: { he: string; en: string; letters: string }): Action[] | null => {
  if (!has(s, ...ids)) return null;
  const parts = ids.map((id) => s.lists.find((l) => l.id === id)!);
  const biggest = parts.reduce((b, l) => (l.votes > b.votes ? l : b));
  return [{ type: 'merge', ids, newId: mergeId(ids), nameHe: named?.he ?? parts.map((l) => l.shortHe).join('–'), letters: named?.letters ?? biggest.letters, color: biggest.color, retentionPct: 100, candidateOrder: 'interleave', nonRetained: 'abstain' },
    { type: 'setListMeta', listId: mergeId(ids), patch: { shortEn: named?.en ?? parts.map((l) => listLabel(l, 'en')).join('–') } }];
};

/** What a merger assumes, from the data: votes kept, alternating candidates, and the fate of the
 *  merged lists' surplus agreements (shared with each other, or ended with their partners). */
const mergeBody = (ids: string[]): Text => (s, lang) => {
  const parts = joinNames(ids.map((id) => nameOf(s, id, lang)), lang);
  const lines = [t(lang, `${parts} run as one list, keeping every vote; candidates alternate between them.`, `${parts} רצות כרשימה אחת ששומרת על כל הקולות; המועמדים לסירוגין.`)];
  const own = s.agreements.filter((a) => a.members.some((m) => ids.includes(m)));
  const internal = own.filter((a) => a.members.every((m) => ids.includes(m)));
  const ended = own.filter((a) => !internal.includes(a)).map((a) => { const inside = a.members.find((m) => ids.includes(m))!; const partner = a.members.find((m) => !ids.includes(m))!; return t(lang, `${nameOf(s, inside, lang)} with ${nameOf(s, partner, lang)}`, `${nameOf(s, inside, lang)} עם ${nameOf(s, partner, lang)}`); });
  if (internal.length) lines.push(t(lang, 'They already shared surplus votes in an agreement.', 'הן כבר חלקו עודפים בהסכם.'));
  if (ended.length) lines.push(t(lang, `Their surplus agreements end: ${ended.join('; ')}.`, `הסכמי העודפים שלהן מתבטלים: ${ended.join('; ')}.`));
  return lines.join(' ');
};
const newVotersBody = (id: string): Text => (s, lang) => t(lang, `The smallest number of new voters for ${nameOf(s, id, lang)} that gets it in. Nobody else changes their vote.`, `המספר הקטן ביותר של מצביעים חדשים עבור ${nameOf(s, id, lang)} שמכניס אותה. איש אחר אינו משנה את הצבעתו.`);
const removeAgreementBody = (id: string): Text => (s, lang) => {
  const a = agreementWith(s, id); const partner = a?.members.find((m) => m !== id);
  return t(lang, `Only the surplus agreement between ${nameOf(s, id, lang)} and ${partner ? nameOf(s, partner, lang) : '—'} is removed; every vote stays as cast.`, `רק הסכם העודפים בין ${nameOf(s, id, lang)} ובין ${partner ? nameOf(s, partner, lang) : '—'} מוסר; כל הקולות נשארים כפי שהוצבעו.`);
};

const COMMON: WhatIfPreset[] = [
  { id: 'no-agreements', titleEn: 'No surplus agreements at all', titleHe: 'בלי הסכמי עודפים בכלל', body: fixed('Every list competes alone for the remainder seats; every vote stays as cast.', 'כל רשימה מתחרה לבדה על המנדטים העודפים; כל הקולות נשארים כפי שהוצבעו.'), actions: (s) => s.agreements.map((a) => ({ type: 'removeAgreement', id: a.id })) },
  // offered only where 2% is not already the law (2006–2013)
  { id: 'threshold-2', experimental: true, titleEn: 'A 2% threshold', titleHe: 'אחוז חסימה של 2%', body: fixed('Only the threshold changes, to 2%: the law in 2006–2013. Experimental rules, not a legally possible result for this election.', 'רק אחוז החסימה משתנה, ל-2%: החוק ב-2006–2013. כללים ניסיוניים, לא תוצאה אפשרית על פי החוק בבחירות אלה.'), actions: (s) => Number(s.rules.thresholdPct) === 2 ? null : [{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { thresholdPct: '2' } }] },
  { id: 'pure-pr', experimental: true, titleEn: 'Pure proportional representation', titleHe: 'ייצוג יחסי טהור', body: fixed('No threshold, Sainte-Laguë for all 120 seats, no agreements; every vote stays as cast. Experimental rules.', 'ללא אחוז חסימה, סנט-לגה לכל 120 המושבים, ללא הסכמים; כל הקולות נשארים כפי שהוצבעו. כללים ניסיוניים.'), // 1949's "only lists with a whole quota" rule has no meaning without a quota stage and would leave every seat empty
    actions: (s) => [{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { thresholdPct: '0', remainderMethod: 'sainte-lague', ...(s.rules.remainderRequiresInitialSeat || s.rules.agreementRequiresInitialSeat ? { remainderRequiresInitialSeat: false, agreementRequiresInitialSeat: false } : {}) } }, ...s.agreements.map((a) => ({ type: 'removeAgreement', id: a.id }) as Action)] },
];

const K25: WhatIfPreset[] = [
  { id: 'meretz-in', titleEn: 'Meretz passes the threshold', titleHe: 'מרצ עוברת את אחוז החסימה', body: fixed('The smallest number of Labor voters switching to Meretz that gets it in. Nobody else changes their vote.', 'המספר הקטן ביותר של מצביעי העבודה שעוברים למרצ ומכניסים אותה. איש אחר אינו משנה את הצבעתו.'), actions: (s) => (has(s, '25-מרצ', '25-אמת') ? toPass(s, '25-מרצ', '25-אמת') : null) },
  { id: 'labor-meretz', titleEn: 'Labor and Meretz on one list', titleHe: 'העבודה ומרצ ברשימה אחת', body: mergeBody(['25-אמת', '25-מרצ']), actions: (s) => merge(s, ['25-אמת', '25-מרצ']) },
  { id: 'balad-in', titleEn: 'Balad passes the threshold', titleHe: 'בל״ד עוברת את אחוז החסימה', body: newVotersBody('25-ד'), actions: (s) => (has(s, '25-ד') ? toPass(s, '25-ד') : null) },
  // these parties ran together as the Joint List in 2015–2020 (the k20, k22 and k23 datasets), under that name and letters
  { id: 'arab-joint', titleEn: 'Ra\'am, Hadash–Ta\'al and Balad on one list', titleHe: 'רע״ם, חד״ש–תע״ל ובל״ד ברשימה אחת', body: (s, lang) => `${t(lang, 'As the Joint List in 2015–2020.', 'כמו הרשימה המשותפת ב-2015–2020.')} ${mergeBody(['25-עם', '25-ום', '25-ד'])(s, lang)}`, actions: (s) => merge(s, ['25-עם', '25-ום', '25-ד'], { he: 'הרשימה המשותפת', en: 'Joint List', letters: 'ודעם' }) },
  { id: 'no-likud-rz', titleEn: 'No Likud–Religious Zionism agreement', titleHe: 'בלי הסכם הליכוד–הציונות הדתית', body: removeAgreementBody('25-מחל'), actions: (s) => { const a = agreementWith(s, '25-מחל'); return a ? [{ type: 'removeAgreement', id: a.id }] : null; } },
  { id: 'jewish-home-in', titleEn: 'The Jewish Home passes', titleHe: 'הבית היהודי עובר', body: newVotersBody('25-ב'), actions: (s) => (has(s, '25-ב') ? toPass(s, '25-ב') : null) },
];

const K26: WhatIfPreset[] = [
  { id: 'no-likud-rz', titleEn: 'No Likud–Religious Zionism agreement', titleHe: 'בלי הסכם הליכוד–הציונות הדתית', body: removeAgreementBody('26-מחל'), actions: (s) => { const a = agreementWith(s, '26-מחל'); return a ? [{ type: 'removeAgreement', id: a.id }] : null; } },
  { id: 'reservists-in', titleEn: 'Reservists & New Economic passes', titleHe: 'המילואימניקים והכלכלית עוברת', body: newVotersBody('26-די'), actions: (s) => (has(s, '26-די') ? toPass(s, '26-די') : null) },
  // as in 2022, when Otzma Yehudit ran on the Religious Zionism list headed by Smotrich (the 2022 dataset's list name and order)
  { id: 'otzma-rz', titleEn: 'Religious Zionism–Zehut and Otzma Yehudit on one list', titleHe: 'הציונות הדתית–זהות ועוצמה יהודית ברשימה אחת', body: (s, lang) => `${t(lang, 'As in 2022.', 'כמו ב-2022.')} ${mergeBody(['26-ט', '26-ב'])(s, lang)}`, actions: (s) => merge(s, ['26-ט', '26-ב']) },
  { id: 'bennett-yashar', titleEn: 'Together (Bennett) and Yashar! on one list', titleHe: 'ביחד וישר! ברשימה אחת', body: mergeBody(['26-רק', '26-דרך']), actions: (s) => merge(s, ['26-רק', '26-דרך']) },
  { id: 'arab-joint', titleEn: 'Ra\'am and Joint List on one list', titleHe: 'רע״ם והרשימה המשותפת ברשימה אחת', body: mergeBody(['26-עם', '26-ודם']), actions: (s) => merge(s, ['26-עם', '26-ודם']) },
  { id: 'amcha-in', titleEn: 'Amcha Yisrael passes', titleHe: 'עמך ישראל עוברת', body: newVotersBody('26-ך'), actions: (s) => (has(s, '26-ך') ? toPass(s, '26-ך') : null) },
];

export const presetsFor = (dsId: string): WhatIfPreset[] => [...(dsId === 'k25' ? K25 : dsId === 'k26' ? K26 : []), ...COMMON];

export type WhatIfChange = { label: string; before: number; after: number; color: string };
/** what else moves, shown where it explains the answer (always when no seat changes) */
export type WhatIfFact =
  | { kind: 'joint'; label: string; color: string; seats: number; parts: { label: string; seats: number }[] }
  /** a threshold change that crosses no list: no list's share lies between the two thresholds */
  | { kind: 'band'; from: string; to: string }
  /** surplus agreements removed without moving a seat */
  | { kind: 'agreements'; count: number }
  | { kind: 'threshold'; before: bigint; after: bigint }
  | { kind: 'quota'; before: number; after: number }
  | { kind: 'seatless'; before: bigint; after: bigint };
/** `facts` lead with the one that best explains an unchanged result: the answer row shows facts[0] when no seat moves */
export type WhatIfResult = { p: WhatIfPreset; actions: Action[] | null; title: string; body: string; votes: string; changes: WhatIfChange[]; facts: WhatIfFact[] };

const quotaOf = (r: AllocationResult) => (r.quota.num > 0n ? Math.round(Number(r.quota.num) / Number(r.quota.den)) : 0);

export function computeWhatIf(ds: ElectionDataset, lang: Lang): WhatIfResult[] {
  const base = scenarioFromDataset(ds);
  const r0 = allocate(toEngineInput(base));
  return presetsFor(ds.id).map((p) => {
    const title = lang === 'he' ? p.titleHe : p.titleEn, body = p.body(base, lang);
    const none = { p, actions: null, title, body, votes: '', changes: [], facts: [] };
    const actions = p.actions(base);
    if (!actions || !actions.length) return none;
    let s = base;
    try { for (const a of actions) s = applyAction(s, a); } catch { return none; }
    const r = allocate(toEngineInput(s));
    const seatsIn = (res: AllocationResult, id: string) => res.lists.find((x) => x.id === id)?.seats ?? 0;
    // compare by origin so merged lists line up with their parts
    const groups = new Map<string, WhatIfChange>();
    for (const l of s.lists) {
      const key = l.originIds.length ? [...l.originIds].sort().join('+') : l.id;
      const g = groups.get(key) ?? { before: l.originIds.reduce((tt, o) => tt + seatsIn(r0, o), 0), after: 0, label: listLabel(l, lang), color: l.color };
      g.after += seatsIn(r, l.id);
      groups.set(key, g);
    }
    const changes = [...groups.values()].filter((g) => g.before !== g.after).sort((a, b) => (b.after - b.before) - (a.after - a.before));
    const facts: WhatIfFact[] = [];
    for (const l of s.lists) if (l.originIds.length > 1) facts.push({ kind: 'joint', label: listLabel(l, lang), color: l.color, seats: seatsIn(r, l.id), parts: l.originIds.map((o) => ({ label: nameOf(base, o, lang), seats: seatsIn(r0, o) })) });
    const qualified = (res: AllocationResult) => res.lists.filter((x) => x.qualified).map((x) => x.id).sort().join();
    const [t0, t1] = [base.rules.thresholdPct, s.rules.thresholdPct];
    if (Number(t0) !== Number(t1) && Number(t0) > 0 && Number(t1) > 0 && !changes.length && qualified(r0) === qualified(r)) facts.push({ kind: 'band', from: Number(t0) < Number(t1) ? t0 : t1, to: Number(t0) < Number(t1) ? t1 : t0 });
    const removed = actions.filter((a) => a.type === 'removeAgreement').length;
    if (removed && !changes.length && !actions.some((a) => a.type === 'setRules')) facts.push({ kind: 'agreements', count: removed });
    const seatless: WhatIfFact | null = r0.unrepresentedVotes !== r.unrepresentedVotes ? { kind: 'seatless', before: r0.unrepresentedVotes, after: r.unrepresentedVotes } : null;
    // with no threshold left, the votes that no longer go unrepresented say more than "threshold: none"
    if (seatless && r.unrepresentedVotes === 0n) facts.push(seatless);
    if (r0.thresholdVotes !== r.thresholdVotes) facts.push({ kind: 'threshold', before: r0.thresholdVotes, after: r.thresholdVotes });
    const q0 = quotaOf(r0), q1 = quotaOf(r);
    if (q0 && q1 && q0 !== q1) facts.push({ kind: 'quota', before: q0, after: q1 });
    if (seatless && r.unrepresentedVotes !== 0n) facts.push(seatless);
    const moved = actions.find((a) => a.type === 'transfer' || a.type === 'setVotes');
    const added = (listId: string, v: number) => v - base.lists.find((x) => x.id === listId)!.votes;
    const votes = moved?.type === 'transfer' ? t(lang, `${fmtInt(moved.votes)} voters switch from ${nameOf(base, moved.from, lang)}`, `${fmtInt(moved.votes)} מצביעים עוברים מ${nameOf(base, moved.from, lang)}`)
      : moved?.type === 'setVotes' ? t(lang, `${fmtInt(added(moved.listId, moved.votes))} additional voters`, `${fmtInt(added(moved.listId, moved.votes))} מצביעים נוספים`)
      : '';
    return { p, actions, title, body, votes, changes, facts };
  });
}
