import registry from '../../data/meta/parties.json';
import lineage from '../../data/meta/party-lineage.json';
const aliases = new Map(registry.parties.flatMap(p=>p.aliases.map(a=>[a.id,p.id] as const)));
export const canonicalParty=(id:string)=>aliases.get(id)??id;
export const parties=registry.parties;
export const appearances=registry.partyAppearances.map(a=>({...a,partyId:canonicalParty(a.partyId)}));
/** pending and leader moves are never succession suggestions or inheritance. */
export const suggestions=lineage.edges.filter(e=>['merged-into','split-from','renamed-to','electoral-partner'].includes(e.relation));
export function partyLabel(id:string,lang:'he'|'en') {const p=parties.find(p=>p.id===canonicalParty(id));return p?(lang==='he'?p.nameHe:p.nameEn??p.nameHe):lang==='he'?'זהות לא זמינה':'Unavailable identity';}
export function linkedAppearances(ids:string[],electionId?:string) {
 const selected=new Set(ids.map(canonicalParty));const groups=new Map<string,typeof appearances>();
 for(const a of appearances)if(a.role!=='alliance'&&(!electionId||a.electionId===electionId))groups.set(a.listId,[...groups.get(a.listId)??[],a]);
 return [...groups].filter(([,entries])=>entries.every(a=>selected.has(a.partyId))).map(([listId])=>listId);
}
