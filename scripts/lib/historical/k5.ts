import { buildEarlyDataset } from './k1-k7-common.ts';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, verifySources } from '../build/sources.ts';
import { checker } from '../build/validate.ts';
/** Election-specific gazette corrections; stable list/candidate IDs are retained. */
export const buildK5 = () => buildEarlyDataset(5).map(build => () => {
  const result = build(), ds = result.ds;
  const corrections = JSON.parse(readFileSync(join(ROOT,'data/meta/k5-corrections.json'),'utf8')) as {
    withdrawalSourceId:string; withdrawnCandidates:{rank:number;nameHe:string}[]; withdrawalNoteHe:string; liberalDeathNoteHe:string;
  };
  ds.sourceIds.push(corrections.withdrawalSourceId);
  Object.assign(ds.buildInfo.rawSha256,verifySources([corrections.withdrawalSourceId],checker('k5 withdrawals')));
  const withdrawn = ds.lists.find(l=>l.letters==='שו')!;
  withdrawn.candidates=corrections.withdrawnCandidates.map(c=>({...c,id:`${withdrawn.id}#${c.rank}`}));
  delete withdrawn.candidatesUnavailable;
  withdrawn.candidatesTruncated=false;
  withdrawn.notesHe=[corrections.withdrawalNoteHe];
  ds.lists.find(l=>l.letters==='ל')!.notesHe=[corrections.liberalDeathNoteHe];
  return result;
});
