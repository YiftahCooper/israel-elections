import{isEnvelopeRow,type LocalityDataset}from'./schema.ts';
/** Categorical classes that can occur together in a locality map, including national seat losers. */
export function localityLeaderIds(data:Pick<LocalityDataset,'listIds'|'rows'>):Set<string>{
 const ids=new Set<string>();
 for(const row of data.rows){if(isEnvelopeRow(row))continue;const max=Math.max(...row.votes);if(max<=0||row.votes.filter(v=>v===max).length!==1)continue;const id=data.listIds[row.votes.indexOf(max)];if(id)ids.add(id);}
 return ids;
}
