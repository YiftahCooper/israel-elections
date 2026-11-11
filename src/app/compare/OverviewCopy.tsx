// The Copy votes box on the Overview while comparing: from the reference into your work. A copy is one step with the
// top bar's Undo and is marked like any edit ("From 2022"). Its own chunk: list pairing needs the party registry.
import { useEffect, useMemo } from 'react';
import { allocationOf, listLabel, resultChanges } from '../derive.ts';
import { baselineOf } from '../factionDefaults.ts';
import { useL, useLang } from '../i18n.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { dispatch, toast, useStore } from '../store.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { scenarioColor } from '../scenarioIdentity.ts';
import { askCopy, type CopyAsk } from './copyAsk.ts';
import { copyUnit, type MatchRow } from './match.ts';
import { pairedRows } from './listRows.ts';
import { useReference, yearOf, type Reference } from './mode.ts';
import { CopyVotesBox, type CopyChoice } from './CopyVotesBox.tsx';
import type { SideModel } from './model.ts';
import type { Scenario } from '../../model/scenario.ts';
import type { CopyUnit } from './copy.ts';

const noop = () => {};
/** Every copy the reference offers into your work, one per row (a split's group once). */
export function copyChoices(work: Scenario, ref: Reference, workDate: string, overrides: Parameters<typeof pairedRows>[2], lang: 'he' | 'en'): { unitOf: (id: string) => CopyUnit | null; choices: CopyChoice[] } {
  const rows: MatchRow[] = pairedRows(work, ref.sc, overrides, ref.ds.electionDate < workDate);
  const name = (ids: string[]) => ids.map((id) => { const l = work.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; }).join(' + ');
  const seen = new Set<string>(), choices: CopyChoice[] = [];
  const r = allocationOf(work);
  const seats = (ids: string[]) => ids.reduce((t, id) => t + (r.lists.find((l) => l.id === id)?.seats ?? 0), 0);
  for (const row of rows) {
    const u = copyUnit(row, rows, 'toRight');
    if (!u) continue;
    const key = u.dst.join('+');
    if (seen.has(key)) continue;
    seen.add(key); choices.push({ key, name: name(u.dst), unit: u });
  }
  choices.sort((a, b) => seats(b.unit.dst) - seats(a.unit.dst));
  const unitOf = (id: string) => choices.find((c) => c.unit.dst.includes(id))?.unit ?? null;
  return { unitOf, choices };
}

export function OverviewCopy({ ask }: { ask: CopyAsk }) {
  const L = useL(), lang = useLang();
  const s = useStore((st) => st.scenario)!;
  const ds = useStore((st) => st.datasets[s.electionId])!;
  const elections = useStore((st) => st.elections);
  const overrides = useStore((st) => st.compare.overrides);
  const { markerReference } = useActiveReference();
  const state = useReference(s);
  const ref = state.status === 'ready' ? state.ref : null;
  const offer = useMemo(() => ref ? copyChoices(s, ref, ds.electionDate, overrides[[s.electionId, ref.sc.electionId].sort().join('|')] ?? [], lang) : null, [s, ref?.sc, ds, overrides, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const nothing = !!ref && !!offer && !!ask.lists && !offer.unitOf(ask.lists[0]);
  useEffect(() => {
    if (!nothing || !ref) return;
    // a list with nothing in the reference to copy from: said plainly, nothing changes
    const l = s.lists.find((x) => x.id === ask.lists![0]), where = ref.same ? ref.name : ref.year, name = l ? listLabel(l, lang) : '';
    toast('info', L(`Nothing to copy: ${name} had no list of its own in ${where}.`, `אין מה להעתיק: ${hebrewPrefix('ל', name)} לא הייתה רשימה משלה ${hebrewPrefix('ב', where)}.`));
    askCopy(null);
  }, [nothing]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ref || !offer || nothing) return null;
  const base = baselineOf(ds);
  const start = markerReference ?? base;
  const edited = resultChanges(s, base).length > 0;
  const workYear = yearOf(elections, s.electionId, lang);
  const to: SideModel = { role: 'main', key: 'main', sc: s, r: allocationOf(s), start, ds, year: workYear, name: L('your work', 'העבודה שלכם'),
    official: !edited, edited, frame: edited ? scenarioColor(s) : 'var(--rule)', canUndo: false, canRedo: false, undo: noop, redo: noop, startOver: noop, apply: () => false };
  const from: SideModel = { role: 'other', key: ref.id, sc: ref.sc, r: allocationOf(ref.sc), start: ref.start, ds: ref.ds, year: ref.year, name: ref.name,
    official: ref.official, edited: !ref.official, frame: 'var(--rule)', canUndo: false, canRedo: false, undo: noop, redo: noop, startOver: noop, apply: () => false };
  const where = ref.same ? ref.name : ref.year;
  const unit = ask.lists ? offer.unitOf(ask.lists[0]) : null;
  const close = () => askCopy(null);
  const names = unit ? unit.dst.map((id) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; }).join(' + ') : '';
  const title = unit ? L(`Copy votes from ${where}: ${names}`, `העתקת קולות ${hebrewPrefix('מ', where)}: ${names}`) : L(`Copy votes from ${where}`, `העתקת קולות ${hebrewPrefix('מ', where)}`);
  return <CopyVotesBox req={{ from, to, units: unit ? [unit] : [], title, cross: !ref.same, ...(unit ? {} : { choices: offer.choices }) }} onClose={close}
    onDone={(plan) => {
      dispatch(plan.action);
      const after = allocationOf(plan.result);
      const ids = plan.targets.map((t) => t.listId);
      const one = ids.length === 1 ? plan.result.lists.find((l) => l.id === ids[0]) : undefined;
      toast('info', one ? L(`Votes copied from ${where}. ${listLabel(one, lang)} ${after.lists.find((x) => x.id === one.id)?.seats ?? 0} seats.`, `הקולות הועתקו ${hebrewPrefix('מ', where)}. ${listLabel(one, lang)} ${after.lists.find((x) => x.id === one.id)?.seats ?? 0} מנדטים.`)
        : L(`Votes copied from ${where} for ${ids.length} lists.`, `הקולות הועתקו ${hebrewPrefix('מ', where)} עבור ${ids.length} רשימות.`));
      close();
    }} />;
}
export default OverviewCopy;
