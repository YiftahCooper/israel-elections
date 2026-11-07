import { hebrewPrefix } from './hebrewPrefix.ts';
import { groupingName } from './groupingName.ts';
import {englishLabel} from '../data/names.ts';
import {familyLabel} from '../families/labels.ts';
import { RULESETS } from '../engine/rules.ts';
import { ruleEraLabel, changeText } from './changeValue.tsx';
import { PARTS } from '../model/parts.ts';
import type { Action, Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import { listLabel, editPathLabel } from './derive.ts';
import { fmtInt, signed } from './format.ts';
export function describe(a: Action, s: Scenario, lang: Lang): string {
  const n = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : (lang === 'he' ? 'רשימה שהוסרה' : 'Removed list'); };
  const he = lang === 'he';
  switch (a.type) {
    case 'familyOperation': return (a.operation === 'group' ? (he ? 'קיבוץ לפי משפחה: ' : 'Family grouping: ') : (he ? 'שינוי קולות המשפחה: ' : 'Scaled family votes: ')) + familyLabel(a.definition,lang);
    case 'resetColors': return he ? 'הצבעים אופסו' : 'Colours reset';
    case 'setBlocAppearance': return he ? 'תצוגת הגושים השתנתה' : 'Bloc appearance changed';
    case 'setPartyColor': return he ? 'צבע המפלגה השתנה' : 'Party colour changed';
    case 'setIdentityColor': return he ? 'צבע התרחיש השתנה' : 'Scenario colour changed';
    case 'setCoalition': return he ? 'בחירת הקואליציה השתנתה' : 'Coalition selection changed';
    case 'startPart': return `${PARTS[a.part][lang]}: ${a.name ?? (a.source === 'official' ? (he ? 'התוצאה הרשמית' : 'official result') : a.source === 'blank' ? (he ? 'ריק' : 'blank') : (a.source === 'preset' ? (a.part === 'rules' ? (a.presetId && RULESETS[a.presetId] ? ruleEraLabel(RULESETS[a.presetId], lang) : (he ? 'כללים ממקור מתועד' : 'Sourced rules')) : ((g) => g ? groupingName(g, lang) : undefined)(s.blocSchemes?.find(g => g.id === a.presetId)) ?? (he ? 'חלוקה ממקור מתועד' : 'Sourced grouping')) : (he ? 'תרחיש שמור' : 'saved scenario')))}`;
    case 'setVotes': return he ? `${n(a.listId)}: ${fmtInt(a.votes)} קולות` : `${n(a.listId)}: set to ${fmtInt(a.votes)} votes`;
    case 'transfer': return he ? `העברת ${fmtInt(a.votes)} קולות ${hebrewPrefix('מ', n(a.from))} ${hebrewPrefix('ל', n(a.to))}` : `Moved ${fmtInt(a.votes)} votes from ${n(a.from)} to ${n(a.to)}`;
    case 'addVoters': { const n = a.allocations.reduce((t, x) => t + x.votes, 0) + a.invalid, k = fmtInt(Math.abs(n)), why = a.label && !a.label.startsWith('[') ? ` (${a.label})` : '';
      return n < 0 ? (he ? `הוסרו ${k} מצביעים${why}` : `Removed ${k} voters${why}`) : he ? `נוספו ${k} מצביעים${why}` : `Added ${k} voters${why}`; }
    // name the list the user moved: the one that gains (from all others) or loses (to all others)
    case 'redistribute': {
      if (a.to.length === 1 && a.from.length !== 1) return he ? `${n(a.to[0].listId)}: ${signed(a.votes)} קולות משאר הרשימות` : `${n(a.to[0].listId)}: ${signed(a.votes)} votes from the other lists`;
      if (a.from.length === 1 && a.to.length !== 1) return he ? `${n(a.from[0])}: ${signed(-a.votes)} קולות לשאר הרשימות` : `${n(a.from[0])}: ${signed(-a.votes)} votes to the other lists`;
      if (a.from.length === 1 && a.to.length === 1) return he ? `העברת ${fmtInt(a.votes)} קולות ${hebrewPrefix('מ', n(a.from[0]))} ${hebrewPrefix('ל', n(a.to[0].listId))}` : `Moved ${fmtInt(a.votes)} votes from ${n(a.from[0])} to ${n(a.to[0].listId)}`;
      return he ? `חלוקה מחדש של ${fmtInt(a.votes)} קולות` : `Redistributed ${fmtInt(a.votes)} votes`;
    }
    case 'scaleAll': return he ? `שינוי כל הקולות ל-${a.factorPct}%` : `Scaled all votes to ${a.factorPct}%`;
    case 'merge': return he ? `איחוד: ${a.nameHe} (${a.ids.length} רשימות, שימור ${a.retentionPct}%)` : `Merged ${a.ids.length} lists into ${n(a.newId) === 'Removed list' ? englishLabel(null,a.nameHe) : n(a.newId)} (${a.retentionPct}% retained)`;
    case 'split': return he ? `פיצול ${hebrewPrefix('ל', a.parts.map((p) => p.nameHe).join(' / '))}` : `Split into ${a.parts.map((p) => s.lists.some(l => l.id === p.newId) ? n(p.newId) : englishLabel(null,p.nameHe)).join(' / ')}`;
    case 'addList': return he ? `רשימה חדשה: ${a.nameHe}` : `New list: ${s.lists.some(l => l.id === a.newId) ? n(a.newId) : englishLabel(null,a.nameHe)}`;
    case 'removeList': return he ? `הוסרה רשימה` : `Removed a list`;
    case 'setWithdrawn': return `${n(a.listId)}: ${a.withdrawn ? (he ? 'פרשה' : 'withdrawn') : (he ? 'הוחזרה' : 'reinstated')}`;
    case 'setListMeta': return he ? `${n(a.listId)}: עריכת פרטים` : `${n(a.listId)}: edited details`;
    case 'setAgreement': return `${a.agreement.members.map(n).join(' ⇄ ')}: ${a.agreement.enabled ? (he ? 'הסכם פעיל' : 'agreement on') : (he ? 'הסכם כבוי' : 'agreement off')}`;
    case 'removeAgreement': return he ? 'הוסר הסכם עודפים' : 'Removed an agreement';
    case 'candidates': return he ? `${n(a.listId)}: עריכת מועמדים` : `${n(a.listId)}: candidates edited`;
    case 'setRules': {
      const next = { ...s, rules: { ...s.rules, ...a.patch } };
      return Object.keys(a.patch).map(k => editPathLabel(next, ['rules',k], lang) + ': ' + changeText(next,['rules',k],lang)).join(' · ');
    }
    case 'setMode': return a.mode === 'historical' ? (he ? 'מצב תקף היסטורית' : 'Historically valid mode') : (he ? 'מצב ניסיוני' : 'Experimental mode');
    case 'setTotals': return he ? 'עדכון בעלי זכות / פסולים' : 'Electorate / invalid ballots changed';
    case 'setBlocs': return he ? 'עריכת גושים' : 'Edited blocs';
    case 'applyBlocScheme': { const sc = s.blocSchemes?.find((x) => x.id === a.schemeId); return he ? `חלוקה לגושים: ${sc ? groupingName(sc, lang) : 'חלוקה שהוסרה'}` : `Bloc grouping: ${sc ? groupingName(sc, lang) : 'Removed grouping'}`; }
    case 'setFactionSplit': return a.split
      ? (he ? `${n(a.listId)}: הסיעה התפצלה למפלגותיה` : `${n(a.listId)}: faction split into its parties`)
      : (he ? `${n(a.listId)}: הסיעה אוחדה מחדש` : `${n(a.listId)}: faction rejoined`);
    case 'setPartyBloc': { const p = s.lists.flatMap((l) => l.parties ?? []).find((x) => x.id === a.partyId); const b = s.blocs.find((x) => x.id === a.bloc);
      return he ? `${p?.nameHe ?? 'מפלגה שהוסרה'} ← ${b ? groupingName(b, lang) : 'ללא גוש'}` : `${p?.nameEn ?? 'Removed party'} → ${b ? groupingName(b, lang) : 'no bloc'}`; }
    case 'setLottery': return he ? 'נבחרה תוצאת הגרלה' : 'Chose a lottery outcome';
    case 'resetList': return he ? `${n(a.listId)}: אופסה` : `${n(a.listId)}: reset`;
    case 'setDescription': return he ? 'תיאור התרחיש השתנה' : 'Scenario description changed';
    case 'rename': return he ? `שם התרחיש: ${a.name}` : `Renamed to ${a.name}`;
    case 'resetVotes': return he ? `${n(a.listId)}: הקולות אופסו` : `${n(a.listId)}: votes reset`;
    case 'resetCandidates': return he ? `${n(a.listId)}: רשימת המועמדים שוחזרה` : `${n(a.listId)}: candidate list restored`;
    case 'setTurnout': return he ? `שיעור ההצבעה נקבע ל-${a.pct.toFixed(2)}%` : `Turnout set to ${a.pct.toFixed(2)}%`;
    case 'restore': return he ? ({ agreements: 'שוחזרו הסכמי העודפים', totals: 'שוחזרו בעלי זכות הבחירה והפסולים', blocs: 'שוחזרו הגושים', lottery: 'בוטלו תוצאות ההגרלה' } as const)[a.what] : ({ agreements: 'Restored the historical agreements', totals: 'Restored electorate and invalid ballots', blocs: 'Restored the default blocs', lottery: 'Cleared lottery outcomes' } as const)[a.what];
  }
}

