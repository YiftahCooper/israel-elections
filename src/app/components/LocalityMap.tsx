import { useEffect, useMemo, useRef, useState } from 'react';
import * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './locality-map.css';
import { isEnvelopeRow, type LocalityDataset, type LocalityRow } from '../../data/schema.ts';
import type { LocalityLocations } from '../../data/locality-coordinates.ts';
import type { Scenario } from '../../model/scenario.ts';
import { allocationOf, listLabel, seatBlocsOf } from '../derive.ts';
import { localityWinner, matchesLocality, nearestLocality } from '../locality-map-model.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';

export function useLocalityLocations(id: string, available = true) {
  const [locations, setLocations] = useState<LocalityLocations>({});
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true; setLocations({}); setError(false);
    if (!available) return;
    fetch(`${import.meta.env.BASE_URL}data/${id}-locations.json`).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(d => { if (live) setLocations(d); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [id, available]);
  return { locations, error };
}

const photonCache = new Map<string, PhotonFeature[]>();
let lastRequest = 0;
interface PhotonFeature { geometry: { coordinates: [number, number] }; properties: Record<string, string> }

export function LocalityMap({ s, data, locations, locationError }: { s: Scenario; data: LocalityDataset; locations: LocalityLocations; locationError: boolean }) {
  const L = useL(), lang = useLang();
  const container = useRef<HTMLDivElement>(null), map = useRef<Leaflet.Map | null>(null);
  const [mode, setMode] = useState<'bloc' | 'list'>('bloc');
  const [q, setQ] = useState(''), [selected, setSelected] = useState<LocalityRow | null>(null);
  const [address, setAddress] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const placed = useMemo(() => data.rows.flatMap(row => {
    const p = row.code === null ? null : locations[String(row.code)];
    return !isEnvelopeRow(row) && p ? [{ ...p, row }] : [];
  }), [data, locations]);
  const matches = useMemo(() => data.rows.filter(r => matchesLocality(q, { ...locations[String(r.code)], nameHe:r.nameHe, code:r.code })), [data, locations, q]);
  const winners = useMemo(() => placed.map(p => localityWinner(s, data.listIds, p.row.votes, mode)), [placed,s,data.listIds,mode]);
  const fittedFor = useRef<unknown>(null);
  useEffect(() => {
    if (!container.current) return;
    const m = Leaflet.map(container.current, { preferCanvas:true, scrollWheelZoom:false }).setView([31.7,35],7);
    map.current = m;
    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>', referrerPolicy:'strict-origin-when-cross-origin' }).addTo(m);
    const observer = new ResizeObserver(() => m.invalidateSize()); observer.observe(container.current);
    return () => { observer.disconnect(); m.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const group = Leaflet.layerGroup().addTo(m);
    placed.forEach((p,i) => {
      const title = document.createElement('span'); title.dir = 'auto'; title.textContent = lang === 'en' ? p.nameEn || p.row.nameHe : p.row.nameHe;
      Leaflet.circleMarker([p.lat,p.lon], {radius:5, color:'#182638',weight:1.5,fillColor:winners[i].color,fillOpacity:0.9}).bindTooltip(title).on('click',()=>setSelected(p.row)).addTo(group);
    });
    // open fitted to this election's localities (once per election, so a user's own zoom is kept while editing)
    if (placed.length && fittedFor.current !== data) {
      m.fitBounds(Leaflet.latLngBounds(placed.map((p) => [p.lat, p.lon] as [number, number])), { padding: [12, 12] });
      fittedFor.current = data;
    }
    return () => { group.remove(); };
  }, [placed,winners,lang,data]);
  const choose = (row: LocalityRow) => {
    setSelected(row);
    const p = locations[String(row.code)]; if (p && !isEnvelopeRow(row)) map.current?.setView([p.lat,p.lon],12);
  };
  async function searchAddress() {
    if (busy || !address.trim()) return;
    const query = address.trim(); setBusy(true); setMessage(''); setSuggestions([]);
    try {
      let features = photonCache.get(query);
      if (!features) {
        if (Date.now()-lastRequest < 1100) { setMessage(L('Please wait a second before searching again.', 'נא להמתין שנייה לפני חיפוש נוסף.')); return; }
        lastRequest = Date.now();
        // Explicit submit only. Photon accepts reasonable low-volume use; never autocomplete or batch.
        const url = new URL('https://photon.komoot.io/api/'); url.searchParams.set('q',query); url.searchParams.set('limit','5'); url.searchParams.set('bbox','34.1,29.4,35.95,33.4');
        const response = await fetch(url, {referrerPolicy:'strict-origin-when-cross-origin',signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw new Error(String(response.status));
        const result = await response.json();
        features = (result.features ?? []).filter((f: PhotonFeature) => f.geometry?.coordinates?.length === 2 && f.geometry.coordinates.every(Number.isFinite)) as PhotonFeature[];
        photonCache.set(query,features);
      }
      if (mounted.current) { setSuggestions(features); if (!features.length) setMessage(L('No address found. Try adding a city.', 'לא נמצאה כתובת. נסו להוסיף עיר.')); }
    } catch { if (mounted.current) setMessage(L('Address search is unavailable. Locality search still works.', 'חיפוש הכתובת אינו זמין. אפשר לחפש לפי שם יישוב.')); }
    finally { if (mounted.current) setBusy(false); }
  }
  const allocation = allocationOf(s);
  const split = s.lists.some(l => new Set(seatBlocsOf(s,l,allocation.lists.find(x=>x.id===l.id)?.seats ?? 0)).size > 1);
  const selectedWinner = selected ? localityWinner(s,data.listIds,selected.votes,mode) : null;
  const winnerName = selectedWinner?.tied ? L('Tie','שוויון') : selectedWinner?.key ? mode === 'bloc' ? (()=>{const b=s.blocs.find(x=>x.id===selectedWinner.key);return lang==='he'?b?.nameHe:b?.nameEn;})() : (()=>{const l=s.lists.find(x=>x.id===selectedWinner.key);return l?listLabel(l,lang):'';})() : L('Unassigned / no votes','ללא שיוך / ללא קולות');
  return <div className="locality-map-tool">
    <p className="small ink2">{L('Historical local votes; colours follow your current scenario grouping. National vote edits are not distributed geographically. Split lists use national vote proportions; split blocs use elected-seat proportions, an estimate rather than measured party votes.', 'קולות היסטוריים ביישובים; הצבעים לפי חלוקת הגושים הנוכחית. שינויי קולות ארציים אינם מחולקים גאוגרפית. רשימות שפוצלו מחולקות לפי יחס הקולות הארצי; גושים בתוך רשימה לפי יחס המושבים הנבחרים — אומדן ולא קולות מפלגתיים שנמדדו.')}</p>
    {(data.noteEn || data.noteHe) && <p className="small callout">{lang === 'he' ? data.noteHe ?? data.noteEn : data.noteEn ?? data.noteHe}</p>}
    {split && mode === 'bloc' && <p className="callout small">{L('A list spans several blocs: its locality votes are apportioned by its current elected members’ blocs.', 'רשימה משויכת לכמה גושים: קולותיה ביישוב מחולקים לפי שיוך חבריה הנבחרים כיום.')}</p>}
    <div className="row">
      <label>{L('Colour by ', 'צביעה לפי ')}<select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="bloc">{L('Winning bloc','הגוש המוביל')}</option><option value="list">{L('Winning list','הרשימה המובילה')}</option></select></label>
      <label>{L('Find a locality ', 'חיפוש יישוב ')}<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={L('Hebrew, English or code','עברית, אנגלית או סמל')} /></label>
    </div>
    {q && <div className="locality-map-matches" aria-label={L('Matching localities','יישובים תואמים')}>
      {matches.slice(0,30).map((r,i)=><button className="btn small" key={i} onClick={()=>choose(r)} dir="auto">{lang==='en'?locations[String(r.code)]?.nameEn || r.nameHe:r.nameHe} ({r.code ?? '—'})</button>)}
      <p className="small" role="status">{L(`${matches.length} matches; up to 30 shown.`,`${matches.length} התאמות; מוצגות עד 30.`)}</p>
    </div>}
    <form className="locality-map-address" onSubmit={e=>{e.preventDefault();void searchAddress();}}>
      <label>{L('Nearest locality to an address ', 'היישוב הקרוב לכתובת ')}<input value={address} onChange={e=>setAddress(e.target.value)} /></label>
      <button className="btn" disabled={busy || !address.trim()}>{busy?L('Searching…','מחפש…'):L('Find address','חיפוש כתובת')}</button>
      <small>{L('Submitting sends the address to ', 'שליחה מעבירה את הכתובת ל־')}<a href="https://photon.komoot.io/">Photon</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a></small>
    </form>
    <p className="small" role="status">{message}</p>
    {suggestions.length>0 && <div className="locality-map-matches">{suggestions.map((f,i)=><button className="btn small" key={i} onClick={()=>{
      const [lon,lat]=f.geometry.coordinates; const near=nearestLocality(placed,{lat,lon});
      if (near) {choose(near.item.row);setMessage(L(`Nearest mapped locality: ${near.item.nameEn || near.item.row.nameHe}, ${near.km.toFixed(1)} km (straight line).`, `היישוב הממופה הקרוב: ${near.item.row.nameHe}, ${near.km.toFixed(1)} ק״מ בקו אווירי.`));}
    }}>{[f.properties.name,f.properties.street,f.properties.housenumber,f.properties.city,f.properties.country].filter(Boolean).join(', ')}</button>)}</div>}
    {data.id === 'k17' && <p className="callout">{L('The 2006 locality results lack CBS locality codes, so no map locations can be joined reliably. Use the Table view for the retained results.', 'בתוצאות היישובים מ־2006 חסרים סמלי יישובים של הלמ״ס, ולכן אין אפשרות לשייך מיקומים באופן אמין. הנתונים זמינים בתצוגת טבלה.')}</p>}
    <div ref={container} className="locality-map-canvas" role="region" aria-label={L('Locality results map; use search or table for keyboard selection','מפת תוצאות ביישובים; לבחירה במקלדת השתמשו בחיפוש או בטבלה')} />
    <div className="locality-map-legend">{(mode==='bloc'?s.blocs.map(b=>({id:b.id,color:b.color,label:lang==='he'?b.nameHe:b.nameEn})):s.lists.filter(l=>winners.some(w=>w.key===l.id)).map(l=>({id:l.id,color:l.color,label:listLabel(l,lang)}))).map(x=><span key={x.id}><i style={{background:x.color}} />{x.label}</span>)}<span><i style={{background:'#78838c'}}/>{L('Tie / unassigned / no votes','שוויון / ללא שיוך / ללא קולות')}</span></div>
    {locationError && <p className="bad">{L('Coordinates could not be loaded. The table is still available.', 'לא ניתן לטעון מיקומים. הטבלה עדיין זמינה.')}</p>}
    <p className="small ink2">{L(`${placed.length} of ${data.rows.filter(r=>!isEnvelopeRow(r)).length} localities placed. Envelope votes have no geographic location.`,`${placed.length} מתוך ${data.rows.filter(r=>!isEnvelopeRow(r)).length} יישובים ממופים. למעטפות החיצוניות אין מיקום גאוגרפי.`)}</p>
    <details><summary>{L('Rows without a mapped location','שורות ללא מיקום במפה')}</summary><ul>{data.rows.filter(r=>isEnvelopeRow(r)||r.code===null||!locations[String(r.code)]).map((r,i)=><li key={i}><button className="btn small" onClick={()=>choose(r)}>{r.nameHe} ({r.code ?? '—'})</button></li>)}</ul></details>
    {selected && <section className="locality-map-results" aria-live="polite" aria-label={L('Selected locality results','תוצאות היישוב הנבחר')}>
      <h3 dir="auto">{lang==='en'?locations[String(selected.code)]?.nameEn || selected.nameHe:selected.nameHe}</h3>
      <p>{L('Leader: ','מוביל: ')}{winnerName}</p>
      <p>{L('Registered: ', 'בעלי זכות בחירה: ')}{selected.registered === null ? '—' : fmtInt(selected.registered)} · {L('Invalid votes: ', 'קולות פסולים: ')}{fmtInt(selected.invalid)}</p>
      <p>{L('Valid votes: ','קולות כשרים: ')}{fmtInt(selected.valid)} · {L('Votes cast: ','מצביעים: ')}{fmtInt(selected.votesCast)} · {L('Turnout: ','הצבעה: ')}{selected.registered?fmtPct(selected.votesCast,selected.registered,1):L('Unavailable','לא זמין')}</p>
      <p className="small ink2">{L('Turnout excludes double-envelope votes. Coordinates are CBS locality reference points, not polling stations.', 'ההצבעה אינה כוללת מעטפות חיצוניות. המיקום הוא נקודת ייחוס של הלמ״ס ליישוב ולא מיקום קלפי.')}</p>
      <div className="tablewrap"><table className="tbl"><thead><tr><th>{L('List','רשימה')}</th><th>{L('Votes','קולות')}</th><th>{L('Share','שיעור')}</th></tr></thead><tbody>{selected.votes.map((v,k)=>({v,k})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v).map(({v,k})=>{
        const l=s.lists.find(x=>x.id===data.listIds[k]);return <tr key={k}><td>{l?listLabel(l,lang):data.listIds[k]}</td><td>{fmtInt(v)}</td><td>{fmtPct(v,selected.valid,1)}</td></tr>;
      })}</tbody></table></div>
    </section>}
  </div>;
}
