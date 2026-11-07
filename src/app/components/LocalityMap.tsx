import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { Info } from './ui.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './locality-map.css';
import { isEnvelopeRow, type LocalityDataset, type LocalityRow } from '../../data/schema.ts';
import type { LocalityLocations } from '../../data/locality-coordinates.ts';
import { localityLocationKey } from '../../data/locality-location-key.ts';
import type { LocalityNames } from '../../data/locality-names.ts';
import type { SimList, Scenario } from '../../model/scenario.ts';
import { allocationOf, listLabel, seatBlocsOf } from '../derive.ts';
import { localityTotals, localityWinner, matchesLocality, nearestLocality, normalizeLocalityName } from '../locality-map-model.ts';
import { useL, useLang } from '../i18n.ts';
import { useStore } from '../store.ts';
import { basemapAttribution } from '../locality-basemap-style.ts';
import { fmtInt, fmtPct } from '../format.ts';

function useJson<T>(url: string | null, empty: T) {
  const [value, setValue] = useState<T>(empty);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true; setValue(empty); setError(false);
    if (!url) return;
    fetch(url).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(d => { if (live) setValue(d); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [url]);
  return { value, error };
}
const NO_LOCATIONS: LocalityLocations = {};
const NO_NAMES: LocalityNames = { names: [], project: [] };
export function useLocalityLocations(id: string, available = true) {
  const { value: locations, error } = useJson(available ? `${import.meta.env.BASE_URL}data/${id}-locations.json` : null, NO_LOCATIONS);
  return { locations, error };
}
/** English names index-aligned with the election's locality rows (CBS lists; a few labelled project transliterations). */
export function useLocalityNames(id: string, available = true) {
  return useJson(available ? `${import.meta.env.BASE_URL}data/${id}-locality-names.json` : null, NO_NAMES).value;
}
/** A row's name in the interface language; envelope batches get a translated label, never the Hebrew file text. */
export function localityName(names: LocalityNames, row: LocalityRow, index: number, lang: 'he' | 'en'): string {
  if (lang === 'he') return row.nameHe;
  if (isEnvelopeRow(row)) return 'Double envelopes';
  return names.names[index] || (row.code ? `Locality ${row.code}` : 'Locality');
}
/** The name, marked when its English is the project's own transliteration rather than a CBS name. */
export function LocalityName({ names, row, index }: { names: LocalityNames; row: LocalityRow; index: number }) {
  const lang = useLang();
  const text = localityName(names, row, index, lang);
  if (lang === 'en' && names.project.includes(index)) return <abbr className="locality-translit" title="Transliteration by this project; not in CBS locality lists">{text}</abbr>;
  return <span dir="auto">{text}</span>;
}

/** Shared by the map and table: the source omits codes; this does not establish absence in every official edition. */
export function Locality2006Note() {
  const L = useL();
  return <p className="small">{L('2006 locations', 'מיקומי 2006')} <Info title={L('2006 location matching', 'התאמת מיקומים ב־2006')}>
      <p>{L('2006 locations are matched by Hebrew name to a single CBS locality code. Ambiguous or unmatched rows remain unplaced.', 'מיקומי 2006 הותאמו לפי השם העברי לסמל יישוב יחיד של הלמ״ס. שורות ללא התאמה או עם התאמה עמומה אינן ממוקמות.')}</p>
      <p>{L('Rows are summed from the retained official polling-station export, which omits locality codes. Missing metadata is unknown. National totals follow the gazette; the polling-station cast total is nine lower, with no known authoritative explanation.', 'השורות סוכמו מקובץ הקלפיות הרשמי השמור, שאינו כולל סמלי יישובים. נתונים חסרים מוצגים כלא ידועים. הסיכומים הארציים לפי הרשומות; סך המצביעים בקלפיות נמוך בתשעה, ללא הסבר מוסמך ידוע.')}</p>
    </Info></p>;
}

// Leaflet's zoom buttons refocus the map with a plain focus(), which scrolls a partly visible map into view: the
// page jumped by up to 54px on each zoom click. Same control, refocusing without scrolling.
const ZoomInPlace = Leaflet.Control.Zoom.extend({
  _refocusOnMap(this: Leaflet.Control & { _map?: Leaflet.Map }, e?: MouseEvent) {
    if (this._map && e && e.screenX > 0 && e.screenY > 0) this._map.getContainer().focus({ preventScroll: true });
  },
});

const photonCache = new Map<string, PhotonFeature[]>();
let lastRequest = 0;
interface PhotonFeature { geometry: { coordinates: [number, number] }; properties: Record<string, string> }
const GREY = '#78838c';
const share = (v: number, whole: number) => whole > 0 ? `${(v / whole * 100).toFixed(1)}%` : '—';
let measure: CanvasRenderingContext2D | null = null;
const textWidth = (text: string) => {
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return text.length * 7;
  measure.font = '600 12px "IBM Plex Sans Hebrew", "Segoe UI", sans-serif';
  return measure.measureText(text).width;
};

export function LocalityMap({ s, data, historicalLists, locations, names, locationError }: { s: Scenario; data: LocalityDataset; historicalLists: (SimList | null)[]; locations: LocalityLocations; names: LocalityNames; locationError: boolean }) {
  const L = useL(), lang = useLang();
  const dark = useStore(st => st.theme === 'dark');
  const container = useRef<HTMLDivElement>(null), map = useRef<Leaflet.Map | null>(null);
  const [mode, setMode] = useState<'bloc' | 'list'>('bloc');
  const [q, setQ] = useState(''), [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [address, setAddress] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [tilesFailed, setTilesFailed] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const nameOf = (i: number) => localityName(names, data.rows[i], i, lang);
  const placed = useMemo(() => data.rows.flatMap((row, index) => {
    const p = locations[localityLocationKey(row, index)];
    return !isEnvelopeRow(row) && p ? [{ ...p, row, index }] : [];
  }), [data, locations]);
  const searchNames = (r: LocalityRow, i: number) => ({ ...locations[localityLocationKey(r, i)], nameHe: r.nameHe, code: r.code, aliases: [...(locations[localityLocationKey(r, i)]?.aliases ?? []), names.names[i] ?? ''] });
  const matches = useMemo(() => data.rows.flatMap((r, i) => matchesLocality(q, searchNames(r, i)) ? [i] : []), [data, locations, names, q]);
  const winners = useMemo(() => placed.map(p => localityWinner(s, data.listIds, p.row.votes, mode)), [placed,s,data.listIds,mode]);
  const groupName = (key: string | null) => key === null ? (mode === 'bloc' ? L('No bloc', 'ללא גוש') : L('Unassigned', 'ללא שיוך')) : mode === 'bloc'
    ? (() => { const b = s.blocs.find(x => x.id === key); return b ? groupingName(b, lang) : key; })()
    : (() => { const l = s.lists.find(x => x.id === key); return l ? listLabel(l, lang) : key; })();
  const groupColor = (key: string | null) => key === null ? GREY : (mode === 'bloc' ? s.blocs.find(b => b.id === key)?.color : s.lists.find(l => l.id === key)?.color) ?? GREY;
  const fittedFor = useRef<unknown>(null);
  useEffect(() => {
    if (!container.current) return;
    // Tool tabs unmount immediately; Leaflet's delayed zoom completion can outlive the map pane.
    const m = Leaflet.map(container.current, { preferCanvas:true, scrollWheelZoom:false, zoomAnimation:false, zoomControl:false, minZoom:2, maxZoom:19, maxBounds:[[-85,-180],[85,180]] }).setView([31.7,35],7);
    new ZoomInPlace().addTo(m);
    map.current = m;
    // Leaflet's keyboard handler focuses the map on mousedown without preventScroll (it restores only the window's
    // scroll). Focus first, without scrolling; Leaflet then skips its own.
    const el = container.current;
    const focusInPlace = () => { if (document.activeElement !== el) el.focus({ preventScroll: true }); };
    el.addEventListener('mousedown', focusInPlace, true);
    m.attributionControl.addAttribution(basemapAttribution);
    const observer = new ResizeObserver(() => m.invalidateSize()); observer.observe(container.current);
    return () => { el.removeEventListener('mousedown', focusInPlace, true); observer.disconnect(); m.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const controller = new AbortController();
    setTilesFailed(false);
    import('../locality-basemap.ts').then(({ addLocalityBasemap }) => {
      if (!controller.signal.aborted) return addLocalityBasemap(m, dark, controller.signal, setTilesFailed);
    }).catch(() => { if (!controller.signal.aborted) setTilesFailed(true); });
    return () => controller.abort();
  }, [dark]);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const group = Leaflet.layerGroup().addTo(m);
    placed.forEach((p,i) => {
      const w = winners[i];
      // the tooltip says why the dot has its colour: who leads and by how much
      const tip = document.createElement('span'); tip.className = 'locality-map-tip';
      const title = document.createElement('strong'); title.dir = 'auto'; title.textContent = localityName(names, p.row, p.index, lang);
      const why = document.createElement('span'); why.dir = 'auto';
      why.textContent = w.tied ? L('Tie', 'שוויון') : w.key === null ? L('Unassigned / no votes', 'ללא שיוך / ללא קולות')
        : `${groupName(w.key)} \u2066+${(w.margin / Math.max(1, p.row.valid) * 100).toFixed(1)}\u2069${L(' pp', ' נק׳')}`;
      tip.append(title, why);
      // a thin white outline separates neighbouring dots; a dark ring would darken every colour alike
      Leaflet.circleMarker([p.lat,p.lon], {radius:5, color:'#ffffff',weight:1,fillColor:w.color,fillOpacity:0.95}).bindTooltip(tip).on('click',()=>setSelectedIndex(p.index)).addTo(group);
    });
    // open fitted to this election's localities (once per election, so a user's own zoom is kept while editing)
    if (placed.length && fittedFor.current !== data) {
      m.fitBounds(Leaflet.latLngBounds(placed.map((p) => [p.lat, p.lon] as [number, number])), { padding: [12, 12] });
      fittedFor.current = data;
    }
    return () => { group.remove(); };
  }, [placed,winners,lang,data,names]);
  // Same CBS/result keys as the table, both languages at every zoom. Larger localities first; no overlapping labels.
  useEffect(() => {
    const m = map.current, rtl = lang === 'he'; if (!m || (!rtl && !names.names.length)) return;
    const layer = Leaflet.layerGroup().addTo(m);
    const ranked = placed.map(p => ({ p, name: rtl ? p.row.nameHe : names.names[p.index], weight: p.row.registered ?? p.row.votesCast })).filter(x => x.name).sort((a, b) => b.weight - a.weight);
    const draw = () => {
      layer.clearLayers();
      const z = m.getZoom();
      const min = z <= 7 ? 150_000 : z === 8 ? 50_000 : z === 9 ? 15_000 : z === 10 ? 4_000 : z === 11 ? 1_000 : 0;
      const view = m.getBounds().pad(0.05), size = m.getSize(), taken: number[][] = [];
      for (const { p, name, weight } of ranked) {
        if (weight < min || taken.length >= 90) break;
        if (!view.contains([p.lat, p.lon])) continue;
        const pt = m.latLngToContainerPoint([p.lat, p.lon]), w = Math.ceil(textWidth(name)) + 4, h = 16;
        // the label reads away from its dot: to the right in English, to the left in Hebrew
        const box = rtl ? [pt.x - 6 - w, pt.y - h / 2, pt.x - 6, pt.y + h / 2] : [pt.x + 6, pt.y - h / 2, pt.x + 6 + w, pt.y + h / 2];
        if (box[0] < 0 || box[2] > size.x - 4 || box[1] < 0 || box[3] > size.y) continue; // never cut off at the frame
        if (taken.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
        taken.push(box);
        const icon = Leaflet.divIcon({ className: rtl ? 'locality-map-label rtl' : 'locality-map-label', html: '', iconSize: [w, h], iconAnchor: rtl ? [w + 6, h / 2] : [-6, h / 2] });
        const marker = Leaflet.marker([p.lat, p.lon], { icon, interactive: false, keyboard: false }).addTo(layer);
        const el = marker.getElement(); if (el) el.textContent = name;
      }
    };
    draw(); m.on('zoomend moveend', draw);
    return () => { m.off('zoomend moveend', draw); layer.remove(); };
  }, [placed, names, lang]);
  const selected = selectedIndex === null ? null : data.rows[selectedIndex] ?? null;
  // ring the selected locality so the map and the results below it visibly refer to the same place
  useEffect(() => {
    const m = map.current, p = selectedIndex === null ? null : placed.find(x => x.index === selectedIndex);
    if (!m || !p) return;
    const ring = Leaflet.layerGroup([
      Leaflet.circleMarker([p.lat, p.lon], { radius: 9, color: '#ffffff', weight: 5, fill: false, interactive: false }),
      Leaflet.circleMarker([p.lat, p.lon], { radius: 9, color: '#111418', weight: 2, fill: false, interactive: false }),
    ]).addTo(m);
    return () => { ring.remove(); };
  }, [selectedIndex, placed]);
  const choose = (index: number) => {
    setSelectedIndex(index);
    const row = data.rows[index], p = locations[localityLocationKey(row, index)];
    if (p && !isEnvelopeRow(row)) map.current?.setView([p.lat,p.lon],12);
  };
  async function searchAddress() {
    if (busy || !address.trim()) return;
    const query = address.trim(); setBusy(true); setMessage(''); setSuggestions([]);
    try {
      const cacheKey = `${lang}:${query}`;
      let features = photonCache.get(cacheKey);
      if (!features) {
        if (Date.now()-lastRequest < 1100) { setMessage(L('Please wait a second before searching again.', 'נא להמתין שנייה לפני חיפוש נוסף.')); return; }
        lastRequest = Date.now();
        // Explicit submit only. Photon accepts reasonable low-volume use; never autocomplete or batch.
        const url = new URL('https://photon.komoot.io/api/'); url.searchParams.set('q',query); url.searchParams.set('limit','5'); url.searchParams.set('bbox','34.1,29.4,35.95,33.4');
        // Photon has English but no Hebrew output; without `lang` it answers in the local script
        if (lang === 'en') url.searchParams.set('lang', 'en');
        const response = await fetch(url, {referrerPolicy:'strict-origin-when-cross-origin',signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw new Error(String(response.status));
        const result = await response.json();
        features = (result.features ?? []).filter((f: PhotonFeature) => f.geometry?.coordinates?.length === 2 && f.geometry.coordinates.every(Number.isFinite)) as PhotonFeature[];
        photonCache.set(cacheKey,features);
      }
      if (mounted.current) { setSuggestions(features); if (!features.length) setMessage(L('No address found. Try adding a city.', 'לא נמצאה כתובת. נסו להוסיף עיר.')); }
    } catch { if (mounted.current) setMessage(L('Address search is unavailable. Locality search still works.', 'חיפוש הכתובת אינו זמין. אפשר לחפש לפי שם יישוב.')); }
    finally { if (mounted.current) setBusy(false); }
  }
  const allocation = allocationOf(s);
  const split = s.lists.some(l => new Set(seatBlocsOf(s,l,allocation.lists.find(x=>x.id===l.id)?.seats ?? 0)).size > 1);
  const groups = selected ? localityTotals(s, data.listIds, selected.votes, mode).filter(g => g.votes > 0) : [];
  const selectedWinner = selected ? localityWinner(s, data.listIds, selected.votes, mode) : null;
  const localities = data.rows.filter(r => !isEnvelopeRow(r)).length;
  const unplaced = data.rows.flatMap((r, i) => !isEnvelopeRow(r) && !locations[localityLocationKey(r, i)] ? [i] : []);
  const legend = mode === 'bloc' ? s.blocs.map(b => ({ id: b.id, color: b.color, label: groupingName(b, lang), title: b.appDefined ? appGroupingExplanation(lang) : undefined }))
    : s.lists.filter(l => winners.some(w => w.key === l.id)).map(l => ({ id: l.id, color: l.color, label: listLabel(l, lang), title: undefined }));
  const shareBar = (v: number, top: number, color: string) => <span className="locality-share"><span><i style={{ width: `${v / (top || 1) * 100}%`, background: color }} /></span><span className="tabnum">{share(v, selected!.valid)}</span></span>;
  return <div className="locality-map-tool">
    <p className="small ink2">{L('Historical votes · current grouping', 'קולות היסטוריים · חלוקה נוכחית')} <Info title={L('Map assumptions', 'הנחות המפה')}>{L('Historical local votes; colours follow your current scenario grouping. National vote edits are not distributed geographically. Split lists use national vote proportions; split blocs use elected-seat proportions, an estimate rather than measured party votes. English place names are CBS locality names; a few localities missing from CBS lists have this project’s transliteration (dotted underline).', 'קולות היסטוריים ביישובים; הצבעים לפי חלוקת הגושים הנוכחית. שינויי קולות ארציים אינם מחולקים גאוגרפית. רשימות שפוצלו מחולקות לפי יחס הקולות הארצי; גושים בתוך רשימה לפי יחס המושבים הנבחרים — אומדן ולא קולות מפלגתיים שנמדדו.')}</Info></p>
    {data.id !== 'k17' && (data.noteEn || data.noteHe) && <p className="small callout">{lang === 'he' ? data.noteHe ?? data.noteEn : data.noteEn ?? data.noteHe}</p>}
    {split && mode === 'bloc' && <p className="callout small">{L('A list spans several blocs: its locality votes are apportioned by its current elected members’ blocs.', 'רשימה משויכת לכמה גושים: קולותיה ביישוב מחולקים לפי שיוך חבריה הנבחרים כיום.')}</p>}
    <div className="row">
      <ChoicePicker label={L('Colour by', 'צביעה לפי')} value={mode} options={[{ value: 'bloc', label: L('Winning bloc', 'הגוש המוביל'), preview: <ResultPreview s={s} /> }, { value: 'list', label: L('Winning list', 'הרשימה המובילה'), preview: <ResultPreview s={s} blocs={false} /> }]} onChange={v => setMode(v as typeof mode)} />
      <label className="field">{L('Find a locality ', 'חיפוש יישוב ')}<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={L('Hebrew, English or code','עברית, אנגלית או סמל')} /></label>
    </div>
    {normalizeLocalityName(q) && <div className="locality-map-matches" aria-label={L('Matching localities','יישובים תואמים')}>
      {matches.slice(0,30).map(i=><button className="btn small" key={i} onClick={()=>choose(i)} dir="auto">{nameOf(i)} ({data.rows[i].code ?? '—'})</button>)}
      <p className="small" role="status">{L(`${matches.length} matches; up to 30 shown.`,`${matches.length} התאמות; מוצגות עד 30.`)}</p>
    </div>}
    <form className="locality-map-address" onSubmit={e=>{e.preventDefault();void searchAddress();}}>
      <label className="field">{L('Nearest locality to an address ', 'היישוב הקרוב לכתובת ')}<input type="text" value={address} onChange={e=>setAddress(e.target.value)} /></label>
      <button className="btn" disabled={busy || !address.trim()} title={busy ? L('Search in progress', 'החיפוש מתבצע') : !address.trim() ? L('Enter an address first', 'תחילה הזינו כתובת') : undefined}>{busy?L('Searching…','מחפש…'):L('Find address','חיפוש כתובת')}</button>
      <small>{L('Submitting sends the address to ', 'שליחה מעבירה את הכתובת ל־')}<a href="https://photon.komoot.io/">Photon</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a></small>
    </form>
    <p className="small locality-map-status" role="status">{message}</p>
    {suggestions.length>0 && <div className="locality-map-matches">{suggestions.map((f,i)=><button className="btn small" key={i} dir="auto" onClick={()=>{
      const [lon,lat]=f.geometry.coordinates; const near=nearestLocality(placed,{lat,lon});
      if (near) {choose(near.item.index);setMessage(L(`Nearest mapped locality: ${nameOf(near.item.index)}, ${near.km.toFixed(1)} km (straight line).`, `היישוב הממופה הקרוב: ${near.item.row.nameHe}, ${near.km.toFixed(1)} ק״מ בקו אווירי.`));}
    }}>{[f.properties.name,f.properties.street,f.properties.housenumber,f.properties.city,f.properties.country].filter(Boolean).join(', ')}</button>)}</div>}
    {data.id === 'k17' && <Locality2006Note />}
    <div className="locality-map-legend">{legend.map(x=><span key={x.id} title={x.title}><i style={{background:x.color}} />{x.label}</span>)}<span><i style={{background:GREY}}/>{L('Tie / unassigned / no votes','שוויון / ללא שיוך / ללא קולות')}</span></div>
    <p className="small locality-map-line-notice"><span>{L('Boundary lines unavailable', 'קווי גבול אינם זמינים')}</span> <Info title={L('Boundary verification', 'אימות קווי הגבול')}>{L('Provider boundaries are hidden. Armistice lines, international borders and UN separation lines await independent geometry verification; their absence does not indicate a territorial claim.', 'קווי הגבול של ספק המפה מוסתרים. קווי שביתת הנשק, הגבולות הבין־לאומיים וקווי ההפרדה של האו״ם ממתינים לאימות גאומטרי עצמאי; היעדרם אינו מבטא עמדה טריטוריאלית.')}</Info></p>
    <div ref={container} className="locality-map-canvas" role="region" aria-label={L('Locality results map; use search or table for keyboard selection','מפת תוצאות ביישובים; לבחירה במקלדת השתמשו בחיפוש או בטבלה')} />
    {tilesFailed && <p className="small bad">{L('The background map could not load; the locality dots still work.', 'מפת הרקע לא נטענה; נקודות היישובים עדיין פעילות.')}</p>}
    {selected && <section className="locality-map-results" aria-live="polite" aria-label={L('Selected locality results','תוצאות היישוב הנבחר')}>
      <h3><LocalityName names={names} row={selected} index={selectedIndex!} /></h3>
      {/* why the dot has its colour: the leader, and its lead over the runner-up in this locality */}
      <p className="locality-verdict">{selectedWinner!.tied ? L('Tie', 'שוויון') : selectedWinner!.key === null || !groups.length ? L('No assigned votes', 'אין קולות משויכים') : <>
        <span className="swatch" style={{ background: groupColor(selectedWinner!.key) }} /><strong dir="auto">{groupName(selectedWinner!.key)}</strong>
        {groups.length > 1 && <span className="ink2"> · {L('ahead of ', 'ביתרון של ')}{lang === 'en' && <span dir="auto">{groupName(groups[1].key)} {L('by ', '')}</span>}<bdi dir="ltr">{(selectedWinner!.margin / Math.max(1, selected.valid) * 100).toFixed(1)}{L(' pp', ' נק׳')}</bdi> ({fmtInt(selectedWinner!.margin)} {L('votes', 'קולות')}){lang === 'he' && <span dir="auto"> על {groupName(groups[1].key)}</span>}</span>}
      </>}</p>
      {mode === 'bloc' && groups.length > 0 && <div className="tablewrap"><table className="tbl"><thead><tr><th>{L('Bloc','גוש')}</th><th className="n">{L('Votes','קולות')}</th><th>{L('Share','שיעור')}</th></tr></thead><tbody>
        {groups.map(g => <tr key={g.key ?? 'none'} className={g.key === selectedWinner!.key ? 'sel' : undefined}><td><span className="row" style={{gap:6,flexWrap:'nowrap'}}><span className="swatch" style={{background:groupColor(g.key)}} />{groupName(g.key)}</span></td><td className="n">{fmtInt(g.votes)}</td><td>{shareBar(g.votes, groups[0].votes, groupColor(g.key))}</td></tr>)}
      </tbody></table></div>}
      <p className="small ink2 locality-map-facts">
        <span>{L('Turnout ', 'הצבעה ')}<b className="tabnum">{selected.registered ? fmtPct(selected.votesCast, selected.registered, 1) : '—'}</b></span>
        <span>{L('Valid ', 'כשרים ')}<b className="tabnum">{fmtInt(selected.valid)}</b></span>
        <span>{L('Registered ', 'בעלי זכות ')}<b className="tabnum">{selected.registered === null ? '—' : fmtInt(selected.registered)}</b></span>
        <span>{L('Invalid ', 'פסולים ')}<b className="tabnum">{fmtInt(selected.invalid)}</b></span>
        <Info title={L('Location and turnout', 'מיקום והצבעה')}>{L('Turnout excludes double-envelope votes. Coordinates are CBS locality reference points, not polling stations.', 'ההצבעה אינה כוללת מעטפות חיצוניות. המיקום הוא נקודת ייחוס של הלמ״ס ליישוב ולא מיקום קלפי.')}</Info>
      </p>
      {/* each list's share drawn as a bar in its colour, scaled to the leader */}
      <div className="tablewrap"><table className="tbl"><thead><tr><th>{L('List','רשימה')}</th><th className="n">{L('Votes','קולות')}</th><th>{L('Share','שיעור')}</th></tr></thead><tbody>{(()=>{const rows=selected.votes.map((v,k)=>({v,k})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);const top=rows[0]?.v||1;return rows.map(({v,k})=>{
        const l=historicalLists[k];return <tr key={k}><td><span className="row" style={{gap:6,flexWrap:'nowrap'}}><span className="swatch" style={{background:l?.color ?? 'var(--muted)'}} />{l?listLabel(l,lang):data.listIds[k]}</span></td><td className="n">{fmtInt(v)}</td><td>{shareBar(v, top, l?.color ?? 'var(--muted)')}</td></tr>;
      });})()}</tbody></table></div>
    </section>}
    {locationError && <p className="bad">{L('Coordinates could not be loaded. The table is still available.', 'לא ניתן לטעון מיקומים. הטבלה עדיין זמינה.')}</p>}
    <p className="small ink2">{L(`${placed.length} of ${localities} localities placed. Envelope votes have no geographic location.`,`${placed.length} מתוך ${localities} יישובים ממופים. למעטפות החיצוניות אין מיקום גאוגרפי.`)}</p>
    <details><summary>{L('Rows without a mapped location','שורות ללא מיקום במפה')}</summary><ul>{unplaced.map(i=><li key={i}><button className="btn small" onClick={()=>choose(i)}><LocalityName names={names} row={data.rows[i]} index={i} /> ({data.rows[i].code ?? '—'})</button></li>)}</ul></details>
  </div>;
}
