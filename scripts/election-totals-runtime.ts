/** Build-only compiler for the Turnout tab's election facts: the official national totals of every election, so the
 *  previous election and the 26-election chart need no dataset downloads. Figures are copied from the datasets as
 *  published; a figure a source does not report (ballot boxes before 2003) stays null, never 0. */
import { readFileSync } from 'node:fs';
import { ELECTION_IDS, type ElectionDataset } from '../src/data/schema.ts';

export interface ElectionTotalsRow {
  id: string; knesset: number; date: string; ruleSetId: string;
  registered: number; votesCast: number; valid: number; invalid: number;
  /** null when the source does not report it */
  ballotBoxes: number | null; envelopeVotes: number | null;
}

export function compileElectionTotals(root = process.cwd()): ElectionTotalsRow[] {
  return ELECTION_IDS.map((id) => {
    const d = JSON.parse(readFileSync(`${root}/public/data/${id}.json`, 'utf8')) as ElectionDataset;
    const t = d.totals;
    return {
      id, knesset: d.knesset, date: d.electionDate, ruleSetId: d.ruleSetId,
      registered: t.registered, votesCast: t.votesCast, valid: t.valid, invalid: t.invalid,
      ballotBoxes: t.ballotBoxes > 0 ? t.ballotBoxes : null, envelopeVotes: t.envelopeVotes ?? null,
    };
  });
}
