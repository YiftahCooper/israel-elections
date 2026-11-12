// Words for what an analysis figure means, said the same way wherever one is shown (Seat safety, a list's seat target).
import type { RuleSet } from '../engine/types.ts';
import { fmtInt } from './format.ts';

/** Every "votes to gain / lose a seat" figure is the first count at which the change is certain (audit 12 Nov 2026,
 *  c-results-engine-02). Where fewer votes already reach an exact tie for that seat, this says so; from 1951 to 1969
 *  the law set no rule for such a tie, so it is not called a lottery there. */
export const tieNote = (from: number, policy: RuleSet['tiePolicy'], he: boolean) => policy === 'unspecified'
  ? he ? `שוויון מדויק, שהחוק של אז לא קבע לו כלל, אפשרי החל מ־${fmtInt(from)} קולות` : `An exact tie, for which the law of the time set no rule, is possible from ${fmtInt(from)} votes`
  : he ? `שוויון שמוכרע בהגרלה אפשרי החל מ־${fmtInt(from)} קולות` : `A tie decided by lot is possible from ${fmtInt(from)} votes`;

/** Under the 1977 candidate cap a list with as many seats as candidates can win no more (c-analysis-code-03). */
export const cappedText = (he: boolean) => he ? 'לא אפשרי: כל המועמדים ברשימה כבר קיבלו מנדט' : 'Not possible: every candidate on the list already has a seat';
