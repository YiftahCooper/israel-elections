import type { Action, Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import { listLabel } from './derive.ts';
import { fmtInt } from './format.ts';
export function describe(a: Action, s: Scenario, lang: Lang): string {
  const n = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const he = lang === 'he';
  switch (a.type) {
    case 'setVotes': return he ? `${n(a.listId)}: ${fmtInt(a.votes)} קולות` : `${n(a.listId)}: set to ${fmtInt(a.votes)} votes`;
    case 'transfer': return he ? `העברת ${fmtInt(a.votes)} קולות מ${n(a.from)} ל${n(a.to)}` : `Moved ${fmtInt(a.votes)} votes from ${n(a.from)} to ${n(a.to)}`;
    case 'addVoters': return he ? `נוספו ${fmtInt(a.allocations.reduce((t, x) => t + x.votes, 0) + a.invalid)} מצביעים${a.label ? ` (${a.label})` : ''}` : `Added ${fmtInt(a.allocations.reduce((t, x) => t + x.votes, 0) + a.invalid)} voters${a.label ? ` (${a.label})` : ''}`;
    case 'redistribute': return he ? `חלוקה מחדש של ${fmtInt(a.votes)} קולות` : `Redistributed ${fmtInt(a.votes)} votes`;
    case 'scaleAll': return he ? `שינוי כל הקולות ל-${a.factorPct}%` : `Scaled all votes to ${a.factorPct}%`;
    case 'merge': return he ? `איחוד: ${a.nameHe} (${a.ids.length} רשימות, שימור ${a.retentionPct}%)` : `Merged ${a.ids.length} lists into ${a.nameHe} (${a.retentionPct}% retained)`;
    case 'split': return he ? `פיצול ל-${a.parts.map((p) => p.nameHe).join(' / ')}` : `Split into ${a.parts.map((p) => p.nameHe).join(' / ')}`;
    case 'addList': return he ? `רשימה חדשה: ${a.nameHe}` : `New list: ${a.nameHe}`;
    case 'removeList': return he ? `הוסרה רשימה` : `Removed a list`;
    case 'setWithdrawn': return `${n(a.listId)}: ${a.withdrawn ? (he ? 'פרשה' : 'withdrawn') : (he ? 'הוחזרה' : 'reinstated')}`;
    case 'setListMeta': return he ? `${n(a.listId)}: עריכת פרטים` : `${n(a.listId)}: edited details`;
    case 'setAgreement': return `${a.agreement.members.map(n).join(' ⇄ ')}: ${a.agreement.enabled ? (he ? 'הסכם פעיל' : 'agreement on') : (he ? 'הסכם כבוי' : 'agreement off')}`;
    case 'removeAgreement': return he ? 'הוסר הסכם עודפים' : 'Removed an agreement';
    case 'candidates': return he ? `${n(a.listId)}: עריכת מועמדים (${a.note})` : `${n(a.listId)}: candidates (${a.note})`;
    case 'setRules': return he ? `כללים: ${Object.entries(a.patch).map(([k, v]) => `${k}=${v}`).join(', ')}` : `Rules: ${Object.entries(a.patch).map(([k, v]) => `${k}=${v}`).join(', ')}`;
    case 'setMode': return a.mode === 'historical' ? (he ? 'מצב תקף היסטורית' : 'Historically valid mode') : (he ? 'מצב ניסיוני' : 'Experimental mode');
    case 'setTotals': return he ? 'עדכון בעלי זכות / פסולים' : 'Electorate / invalid ballots changed';
    case 'setBlocs': return he ? 'עריכת גושים' : 'Edited blocs';
    case 'applyBlocScheme': { const sc = s.blocSchemes?.find((x) => x.id === a.schemeId); return he ? `חלוקה לגושים: ${sc?.nameHe ?? a.schemeId}` : `Bloc grouping: ${sc?.nameEn ?? a.schemeId}`; }
    case 'setFactionSplit': return a.split
      ? (he ? `${n(a.listId)}: הסיעה התפצלה למפלגותיה` : `${n(a.listId)}: faction split into its parties`)
      : (he ? `${n(a.listId)}: הסיעה אוחדה מחדש` : `${n(a.listId)}: faction rejoined`);
    case 'setPartyBloc': { const p = s.lists.flatMap((l) => l.parties ?? []).find((x) => x.id === a.partyId); const b = s.blocs.find((x) => x.id === a.bloc);
      return he ? `${p?.nameHe ?? a.partyId} ← ${b?.nameHe ?? 'ללא גוש'}` : `${p?.nameEn ?? a.partyId} → ${b?.nameEn ?? 'no bloc'}`; }
    case 'setLottery': return he ? 'נבחרה תוצאת הגרלה' : 'Chose a lottery outcome';
    case 'resetList': return he ? `${n(a.listId)}: אופסה` : `${n(a.listId)}: reset`;
    case 'rename': return he ? `שם התרחיש: ${a.name}` : `Renamed to ${a.name}`;
    case 'resetVotes': return he ? `${n(a.listId)}: הקולות אופסו` : `${n(a.listId)}: votes reset`;
    case 'resetCandidates': return he ? `${n(a.listId)}: רשימת המועמדים שוחזרה` : `${n(a.listId)}: candidate list restored`;
    case 'setTurnout': return he ? `שיעור ההצבעה נקבע ל-${a.pct}%` : `Turnout set to ${a.pct}%`;
    case 'restore': return he ? ({ agreements: 'שוחזרו הסכמי העודפים', totals: 'שוחזרו בעלי זכות הבחירה והפסולים', blocs: 'שוחזרו הגושים', lottery: 'בוטלו תוצאות ההגרלה' } as const)[a.what] : ({ agreements: 'Restored the historical agreements', totals: 'Restored electorate and invalid ballots', blocs: 'Restored the default blocs', lottery: 'Cleared lottery outcomes' } as const)[a.what];
  }
}

