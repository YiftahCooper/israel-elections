// One mark for a list or a party wherever it is named in a picker, chip, row or legend: its logo where the app holds one
// (or its ballot letters, or the generated icon of a list made in the scenario), otherwise its colour dot. Every picker
// that names lists or parties takes its options from listChoice / partyChoice, so they all look the same.
import type { ReactNode } from 'react';
import type { PartyDef } from '../../data/schema.ts';
import type { SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { listSearchNames, partySearchNames } from '../nameSearch.ts';
import type { Lang } from '../i18n.ts';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import type { Choice } from './ChoicePicker.tsx';
import { Slip } from './ui.tsx';
import './list-mark.css';

type MarkList = Pick<SimList, 'id' | 'letters' | 'color' | 'shortHe' | 'shortEn'> & Partial<Pick<SimList, 'logo' | 'synthetic' | 'originIds' | 'parties'>>;

/** A small colour dot (no logo and no ballot letters). */
export function ColourDot({ color }: { color: string }) {
  return <span className="list-mark-dot" style={{ background: color }} aria-hidden />;
}

/** The mark of a list, small enough for a picker row or a chip. */
export function ListMark({ list, lang }: { list: MarkList; lang: Lang }) {
  const name = listLabel(list, lang);
  if (!list.logo && !list.synthetic && !list.letters) return <span className="list-mark"><ColourDot color={list.color} /></span>;
  return <span className="list-mark" aria-hidden><Slip name={name} letters={list.letters} color={list.color} logo={list.logo} synthetic={list.synthetic} size="xs" /></span>;
}

/** The mark of one party of a joint list: its logo, else a dot in its colour on that list. */
export function PartyMark({ party, list }: { party: PartyDef; list?: MarkList }) {
  const color = list ? partyDisplayColor(list as SimList, party.id) : party.color ?? '#888';
  if (!party.logo) return <span className="list-mark"><ColourDot color={color} /></span>;
  return <span className="list-mark" aria-hidden><Slip name={party.nameEn} letters="" color={color} logo={party.logo} size="xs" /></span>;
}

/** A picker option for a list, with its mark. */
export function listChoice(l: MarkList, lang: Lang, extra: Partial<Omit<Choice, 'label' | 'mark'>> = {}): Choice {
  return { value: l.id, label: listLabel(l, lang), mark: <ListMark list={l} lang={lang} />, searchNames: listSearchNames(l), ...extra };
}

/** A picker option for a party of a joint list, with its mark. */
export function partyChoice(p: PartyDef, lang: Lang, list?: MarkList, extra: Partial<Omit<Choice, 'label' | 'mark'>> = {}): Choice {
  return { value: p.id, label: lang === 'he' ? p.nameHe : p.nameEn, mark: <PartyMark party={p} list={list} />, searchNames: [p.nameHe, p.nameEn, ...partySearchNames(p.id)], ...extra };
}

/** A list's name with its mark, inline (rows, chips, legends). */
export function ListName({ list, lang, children }: { list: MarkList; lang: Lang; children?: ReactNode }) {
  // the compact dot replaces the mark inside table cells on phones (list-mark.css), so a table of lists fits the screen
  return <span className="list-name-marked"><ListMark list={list} lang={lang} /><span className="list-mark-compact" aria-hidden><ColourDot color={list.color} /></span><bdi>{children ?? listLabel(list, lang)}</bdi></span>;
}
