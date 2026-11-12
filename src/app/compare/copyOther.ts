// "Copy 2022's …" on screens other than the Lists panel while comparing (Turnout and eligible voters, the threshold, the
// whole rule set): one step with the top bar's Undo, marked like any edit ("From 2022"). Loaded on first use, with copy.ts.
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { baseContext, dispatch, getState, toast } from '../store.ts';
import type { Scenario } from '../../model/scenario.ts';
import { planAgreements, planRules, planTotals, type Plan } from './copy.ts';
import { pairedRows } from './listRows.ts';
import type { Reference } from './mode.ts';

export type OtherCopy = 'registered' | 'turnout' | 'invalid' | 'threshold' | 'rules' | 'agreements';

export function planOther(ref: Reference, work: Scenario, what: OtherCopy, o: { base?: Scenario; overrides?: Parameters<typeof pairedRows>[2]; workDate: string }): Plan {
  const { base } = o;
  const from = { sc: ref.sc, start: ref.start, name: ref.name, official: ref.official };
  if (what === 'threshold' || what === 'rules') return planRules({ from, to: work, ctx: { base }, what });
  if (what === 'agreements') {
    // the reference's agreements between lists that have a list in your work, paired the way the Lists panel pairs them
    const rows = pairedRows(work, ref.sc, o.overrides ?? [], ref.ds.electionDate < o.workDate);
    return planAgreements({ from, to: work, ctx: { base }, rows, direction: 'toRight' });
  }
  return planTotals({ from, to: work, ctx: { base }, field: what });
}

/** Copies one value from the reference into your work and says so; a copy that cannot be made says why. */
export function copyOther(ref: Reference, what: OtherCopy, lang: 'he' | 'en') {
  const st = getState();
  const work = st.scenario, ds = work && st.datasets[work.electionId];
  if (!work || !ds) return;
  // resets resolve as the copy will commit (dispatch's context), never against the marker reference
  const plan = planOther(ref, work, what, { base: baseContext(ds, work.factionSplitBaseline ?? false).base, overrides: st.compare.overrides[[work.electionId, ref.sc.electionId].sort().join('|')] ?? [], workDate: ds.electionDate });
  const where = ref.same ? ref.name : ref.year;
  if (!plan.ok) { toast('info', plan.reason[lang]); return; }
  dispatch(plan.action);
  const en: Record<OtherCopy, string> = { registered: 'Eligible voters', turnout: 'Turnout', invalid: 'Invalid ballots', threshold: 'Threshold', rules: 'Rules', agreements: 'Surplus agreements' };
  const he: Record<OtherCopy, string> = { registered: 'מספר בעלי זכות הבחירה', turnout: 'שיעור ההצבעה', invalid: 'מספר הקולות הפסולים', threshold: 'אחוז החסימה', rules: 'כללי החלוקה', agreements: 'הסכמי העודפים' };
  const verb = what === 'rules' || what === 'agreements' ? 'הועתקו' : 'הועתק';
  // agreements between lists with no one-to-one counterpart are left out, and said so
  const skipped = (plan as { skipped?: unknown[] }).skipped?.length ?? 0;
  const left = skipped ? (lang === 'he' ? ` ${skipped} לא הועתקו: אין להן מקבילה.` : ` ${skipped} not copied: no counterpart.`) : '';
  toast('info', (lang === 'he' ? `${he[what]} ${verb} ${hebrewPrefix('מ', where)}.` : `${en[what]} copied from ${where}.`) + left);
}
