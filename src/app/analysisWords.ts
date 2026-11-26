// Words for what an analysis figure means, said the same way wherever one is shown (Seat safety, a list's panel, a
// bloc's votes, Sensitivity).
import type { RuleSet } from '../engine/types.ts';
import { fmtInt } from './format.ts';
import { hebrewPrefixName } from './hebrewPrefix.ts';

/** Every "votes to gain / lose a seat" figure is the first count at which the change is certain (audit 12 Nov 2026,
 *  c-results-engine-02). Where fewer votes already reach an exact tie for that seat, this says so; from 1951 to 1969
 *  the law set no rule for such a tie, so it is not called a lottery there. */
export const tieNote = (from: number, policy: RuleSet['tiePolicy'], he: boolean, more = false) => {
  const n = he ? `${fmtInt(from)} קולות${more ? ' נוספים' : ''}` : `${fmtInt(from)}${more ? ' more' : ''} votes`;
  return policy === 'unspecified'
    ? he ? `כבר עם ${n} יש שוויון עם רשימה אחרת על המנדט, והחוק של אז לא קבע מה עושים בשוויון.` : `From ${n} it already ties with another list for the seat, and the law of the time set no rule for a tie.`
    : he ? `כבר עם ${n} יש שוויון עם רשימה אחרת על המנדט, שמוכרע בהגרלה.` : `From ${n} it already ties with another list for the seat, decided by lot.`;
};

/** Under the 1977 candidate cap a list with as many seats as candidates can win no more (c-analysis-code-03). */
export const cappedText = (he: boolean) => he ? 'אין עוד מנדט לזכות בו: כל המועמדים ברשימה כבר נבחרו.' : 'No more seats to win: every candidate on the list already has one.';

/** One list's change in seats. */
export type SeatMove = { id: string; d: number };

const joinNames = (names: string[], he: boolean) => names.length < 2 ? names.join('')
  : he ? `${names.slice(0, -1).join(', ')} ${hebrewPrefixName('ו', names[names.length - 1])}` : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/** "With 24,629 more votes, Otzma Yehudit wins 1 more seat, taken from Ra'am." The change in seats a vote edit makes,
 *  as one sentence that says what changed, by how many votes and at whose expense (owner, 26 Nov 2026: no bare
 *  arrows and deltas). `subject` is the list or group whose votes change, `votes` the change in its votes. */
export function seatChangeSentence(moves: SeatMove[], name: (id: string) => string, he: boolean,
  { subject, votes, crossing = false }: { subject?: { ids: string[]; name: string }; votes?: number; crossing?: boolean } = {}): string {
  const mine = (m: SeatMove) => !!subject?.ids.includes(m.id);
  const subjectMoves = moves.some(mine);
  const n = Math.abs(Math.round(votes ?? 0));
  const more = (votes ?? 0) > 0;
  const count = he ? `${n === 1 ? 'קול אחד' : `${fmtInt(n)} קולות`} ${more ? (n === 1 ? 'נוסף' : 'נוספים') : 'פחות'}`
    : `${fmtInt(n)} ${more ? 'more' : 'fewer'} ${n === 1 ? 'vote' : 'votes'}`;
  // "for Otzma Yehudit" only where the seats that move are other lists' (with no seats moving, the context says whose)
  const forWhom = subject && !subjectMoves && moves.length ? (he ? ` ${hebrewPrefixName('ל', subject.name)}` : ` for ${subject.name}`) : '';
  const prefix = !n ? '' : he ? `עם ${count}${forWhom}, ` : `With ${count}${forWhom}, `;
  if (!moves.length) return prefix ? `${prefix}${he ? 'אף מנדט לא עובר.' : 'no seats change.'}` : he ? 'אף מנדט לא עובר.' : 'No seats change.';
  const order = (a: SeatMove, b: SeatMove) => Number(mine(b)) - Number(mine(a)) || Math.abs(b.d) - Math.abs(a.d);
  const gainers = moves.filter(m => m.d > 0).sort(order), losers = moves.filter(m => m.d < 0).sort(order);
  const seats = (k: number, more: boolean) => he ? (k === 1 ? (more ? 'במנדט נוסף' : 'מנדט אחד') : more ? `ב־${k} מנדטים נוספים` : `${k} מנדטים`)
    : `${k} ${more ? 'more ' : ''}${k === 1 ? 'seat' : 'seats'}`;
  // the other side, named with counts only where they differ from one each
  const others = (side: SeatMove[]) => joinNames(side.map(m => side.length > 1 && side.some(x => Math.abs(x.d) > 1) ? `${name(m.id)} (${Math.abs(m.d)})` : name(m.id)), he);
  const lossFrame = losers.some(mine);
  if (lossFrame) {
    const lose = losers.map(m => he ? `${name(m.id)} מאבדת ${seats(-m.d, false)}` : `${name(m.id)} loses ${seats(-m.d, false)}`);
    const tail = gainers.length ? (he ? `, לטובת ${others(gainers)}` : `, to ${others(gainers)}`) : '';
    return `${prefix}${joinNames(lose, he)}${tail}.`;
  }
  const win = gainers.map((m, i) => he
    ? `${name(m.id)} ${crossing && i === 0 && mine(m) ? 'עוברת את אחוז החסימה וזוכה' : 'זוכה'} ${crossing && i === 0 && mine(m) ? (m.d === 1 ? 'במנדט אחד' : `ב־${m.d} מנדטים`) : seats(m.d, true)}`
    : `${name(m.id)} ${crossing && i === 0 && mine(m) ? `passes the threshold and wins ${seats(m.d, false)}` : `wins ${seats(m.d, true)}`}`);
  const tail = losers.length ? (he ? `, על חשבון ${others(losers)}` : `, taken from ${others(losers)}`) : '';
  return `${prefix}${joinNames(win, he)}${tail}.`;
}
