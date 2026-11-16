import { percent, points } from './Percentage.tsx';
import {MAP_UNASSIGNED_COLOUR} from '../locality-map-model.ts';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import {MapLineText} from './MapLineText.tsx';
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
import { localityHebrewName, type LocalityNames } from '../../data/locality-names.ts';
import type { SimList, Scenario } from '../../model/scenario.ts';
import { allocationOf, listLabel, seatBlocsOf } from '../derive.ts';
import { findLocalities, localityTotals, localityWinner, nearestLocality, normalizeLocalityName } from '../locality-map-model.ts';
import { useL, useLang } from '../i18n.ts';
import { setMapLineChoice, setMapLines, useSetting, useStore } from '../store.ts';
import { allLines, shownLines, tickLine } from '../mapLineChoice.ts';
import type { FeatureCollection } from 'geojson';
import { MAP_LINES, MAP_LINE_SNAPSHOT, drawMapLines, mapLineSourceLabel } from '../locality-map-lines.ts';
import { basemapAttribution } from '../locality-basemap-style.ts';
import { countOf, fmtInt, fmtPoints, PP } from '../format.ts';
import { useDigits } from '../store.ts';
import { manualPoint } from '../../data/locality-manual-points.ts';
import { AreasLayer, type AreaPlace, type Island, type MapView, type Part } from './mapAreas.ts';

function useJson<T>(url: string | null, empty: T) {
  const [value, setValue] = useState<T>(empty);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true; setValue(empty); setError(false);
    if (!url) return;
    fetch(url).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(d => { if (live) setValue(d); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [url, attempt]);
  return { value, error, retry: () => setAttempt(n => n + 1) };
}
const NO_LOCATIONS: LocalityLocations = {};
const NO_LINES: FeatureCollection = { type:'FeatureCollection', features:[] };
const NO_NAMES: LocalityNames = { names: [], project: [] };
const LINE_IDS = MAP_LINES.map(x => x.id);
type Outlines = { type: 'FeatureCollection'; features: { properties: { code: number }; geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] } }[] };
const NO_OUTLINES: Outlines = { type: 'FeatureCollection', features: [] };
// the map's view ("Winner" dots or "Vote mix"), remembered on this device; it opens on the dots
const VIEW_KEY = 'israel-elections:map-view';
const readView = (): MapView => { try { return localStorage.getItem(VIEW_KEY) === 'mix' ? 'mix' : 'winner'; } catch { return 'winner'; } };
const saveView = (v: MapView) => { try { localStorage.setItem(VIEW_KEY, v); } catch { /* not remembered; the switch still works */ } };
// Review only: `?map-order=biggest` puts each town's biggest list first, for the owner to compare with the fixed order.
const biggestFirst = () => { try { return new URLSearchParams(location.search).get('map-order') === 'biggest'; } catch { return false; } };
export function useLocalityLocations(id: string, available = true) {
  const { value: locations, error, retry } = useJson(available ? `${import.meta.env.BASE_URL}data/${id}-locations.json` : null, NO_LOCATIONS);
  return { locations, error, retry };
}
/** Display names index-aligned with the election's locality rows (CBS lists; a few labelled project transliterations). */
export function useLocalityNames(id: string, available = true) {
  return useJson(available ? `${import.meta.env.BASE_URL}data/${id}-locality-names.json` : null, NO_NAMES).value;
}
/** A row's name in the interface language; envelope batches get a translated label, never the Hebrew file text. */
export function localityName(names: LocalityNames, row: LocalityRow, index: number, lang: 'he' | 'en'): string {
  if (lang === 'he') return localityHebrewName(names, row, index);
  if (isEnvelopeRow(row)) return 'Double envelopes';
  return names.names[index] || (row.code ? `Locality ${row.code}` : 'Locality');
}
/** Provenance always includes the unmodified CEC name, including unresolved CBS conflicts. */
export function localityNameSource(names: LocalityNames, row: LocalityRow, index: number, lang: 'he' | 'en'): string {
  const he = names.hebrew?.[index];
  const cec = `${lang === 'he' ? 'ועדת הבחירות (מקור)' : 'CEC (original)'}: ${row.nameHe}`;
  if (!he?.year) return cec;
  const cbs = `${lang === 'he' ? 'למ״ס' : 'CBS'} ${he.year}: ${he.conflict ?? he.name}`;
  return `${cec} · ${cbs}${he.truncated && he.conflict ? ` · (CBS: ${he.conflict})` : ''}${he.conflict ? (lang === 'he' ? ' — הבדל בשם; נשמר שם ועדת הבחירות' : ' — name differs; CEC retained') : ''}`;
}
/** The name, marked when its English is the project's own transliteration rather than a CBS name. */
export function LocalityName({ names, row, index, showCbs = false }: { names: LocalityNames; row: LocalityRow; index: number; showCbs?: boolean }) {
  const lang = useLang();
  const text = localityName(names, row, index, lang);
  if (lang === 'en' && names.project.includes(index)) return <abbr className="locality-translit" title={`Transliteration by this project; not in CBS locality lists · ${localityNameSource(names, row, index, lang)}`}>{text}</abbr>;
  return <span dir="auto" title={localityNameSource(names, row, index, lang)}>{text}{showCbs && names.hebrew?.[index]?.truncated && <small className="muted"> <bdi>(CBS: {names.hebrew[index].conflict})</bdi></small>}</span>;
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

// Leaflet 1.9.4 can lose a queued frame ID when _updatePaths redraws synchronously.
// Its onRemove cancels only the last ID, so an older callback can outlive the context.
// Keep the guard on our renderer; do not change Leaflet's global prototype.
type CanvasLifecycle = Leaflet.Canvas & { _map?: Leaflet.Map; _redraw(): void };
const MountedCanvas = Leaflet.Canvas.extend({
  _redraw(this: CanvasLifecycle) {
    if (this._map) (Leaflet.Canvas.prototype as CanvasLifecycle)._redraw.call(this);
  },
});

const photonCache = new Map<string, PhotonFeature[]>();
let lastRequest = 0;
interface PhotonFeature { geometry: { coordinates: [number, number] }; properties: Record<string, string> }
const GREY = MAP_UNASSIGNED_COLOUR;
// the vote mix's grey for votes outside the shown blocs or seated lists; black would read as a list of its own
const OTHER = '#9aa1a9';
const share = (v: number, whole: number, digits: number) => whole > 0 ? percent(v, whole, digits) : '—';
let measure: CanvasRenderingContext2D | null = null;
const textWidth = (text: string) => {
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return text.length * 7;
  measure.font = '600 12px "IBM Plex Sans Hebrew", "Segoe UI", sans-serif';
  return measure.measureText(text).width;
};

export function LocalityMap({ s, data, historicalLists, locations, names, locationError, retryLocations }: { s: Scenario; data: LocalityDataset; historicalLists: (SimList | null)[]; locations: LocalityLocations; names: LocalityNames; locationError: boolean; retryLocations: () => void }) {
  const L = useL(), lang = useLang();
  const dark = useStore(st => st.theme === 'dark');
  const [legendOpen,setLegendOpen]=useState(()=>window.matchMedia('(min-width: 700px)').matches);
  useEffect(()=>{const media=window.matchMedia('(min-width: 700px)');const update=()=>setLegendOpen(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  // remembered on this device (Settings → Analysis has the same switch as "All lines and areas")
  const linesOn = useSetting('mapLines'), linesOff = useSetting('mapLinesOff');
  const lineChoice = useMemo(() => ({ on: linesOn, off: linesOff }), [linesOn, linesOff]);
  const lineIds = useMemo<ReadonlySet<string>>(() => new Set(shownLines(LINE_IDS, lineChoice)), [lineChoice]);
  const every = allLines(LINE_IDS, lineChoice);
  const tick = (id: string, show: boolean) => setMapLineChoice(tickLine(LINE_IDS, lineChoice, id, show));
  const [hiddenLines, setHiddenLines] = useState(0);
  const { value: lineData, error: lineError, retry: retryLines } = useJson(`${import.meta.env.BASE_URL}data/map-lines.geojson`, NO_LINES);
  const digits = useDigits();
  const container = useRef<HTMLDivElement>(null), map = useRef<Leaflet.Map | null>(null);
  const [mode, setMode] = useState<'bloc' | 'list'>('bloc');
  const [view, setViewState] = useState<MapView>(readView);
  const setView = (v: MapView) => { setViewState(v); saveView(v); };
  const mix = view === 'mix';
  // the town outlines (1.7 MB) load only once the vote mix is first shown
  const [wantOutlines, setWantOutlines] = useState(mix);
  useEffect(() => { if (mix) setWantOutlines(true); }, [mix]);
  const { value: outlineData, error: outlineError, retry: retryOutlines } = useJson(wantOutlines ? `${import.meta.env.BASE_URL}data/locality-outlines-2022.geojson` : null, NO_OUTLINES);
  const outlines = useMemo(() => new Map(outlineData.features.map(f => [f.properties.code, (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) as number[][][][]])), [outlineData]);
  const [q, setQ] = useState(''), [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [address, setAddress] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [tilesFailed, setTilesFailed] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const nameOf = (i: number) => localityName(names, data.rows[i], i, lang);
  const placed = useMemo(() => data.rows.flatMap((row, index) => {
    if (isEnvelopeRow(row)) return [];
    const p = locations[localityLocationKey(row, index)];
    if (p) return [{ lat: p.lat, lon: p.lon, code: p.code as number | null, row, index, approx: null as null | { en: string; he: string } }];
    // a place with no CBS point that this project placed by hand, marked approximate (Hebron)
    const m = Object.keys(locations).length ? manualPoint(row) : null;
    return m ? [{ lat: m.lat, lon: m.lon, code: m.code as number | null, row, index, approx: { en: m.noteEn, he: m.noteHe } }] : [];
  }), [data, locations]);
  const searchNames = (r: LocalityRow, i: number) => ({ ...locations[localityLocationKey(r, i)], nameHe: localityHebrewName(names, r, i), code: r.code, aliases: [...(locations[localityLocationKey(r, i)]?.aliases ?? []), names.names[i] ?? '', r.nameHe] });
  const matches = useMemo(() => findLocalities(q, data.rows.map((_, i) => i), i => searchNames(data.rows[i], i)), [data, locations, names, q]);
  const winners = useMemo(() => placed.map(p => localityWinner(s, data.listIds, p.row.votes, mode)), [placed,s,data.listIds,mode]);
  const groupName = (key: string | null) => key === null ? (mode === 'bloc' ? L('No bloc', 'ללא גוש') : L('Unassigned', 'ללא שיוך')) : mode === 'bloc'
    ? (() => { const b = s.blocs.find(x => x.id === key); return b ? groupingName(b, lang) : key; })()
    : (() => { const l = s.lists.find(x => x.id === key); return l ? listLabel(l, lang) : key; })();
  const groupColor = (key: string | null) => key === null ? GREY : (mode === 'bloc' ? s.blocs.find(b => b.id === key)?.color : s.lists.find(l => l.id === key)?.color) ?? GREY;
  // The vote mix: each place's votes by bloc or list. Lists that won no seat are one grey "Other". The order is the same in
  // every town: bloc by bloc, in the scenario's bloc order, and inside a bloc the biggest list in the country first.
  const seated = useMemo(() => new Set(allocationOf(s).lists.filter(x => x.seats > 0).map(x => x.id)), [s]);
  const partsOf = (votes: number[]): Part[] => {
    let other = 0; const parts: Part[] = [];
    for (const g of localityTotals(s, data.listIds, votes, mode)) {
      if (g.votes <= 0) continue;
      if (g.key === null || (mode === 'list' && !seated.has(g.key))) { other += g.votes; continue; }
      parts.push({ key: g.key, color: groupColor(g.key), votes: g.votes, label: groupName(g.key) });
    }
    const blocRank = (id: string | null) => { const i = s.blocs.findIndex(b => b.id === id); return i < 0 ? s.blocs.length : i; };
    const rank = (key: string) => { if (mode === 'bloc') return [blocRank(key), 0]; const l = s.lists.find(x => x.id === key); return [blocRank(l?.bloc ?? null), -(l?.votes ?? 0)]; };
    if (biggestFirst()) parts.sort((a, b) => b.votes - a.votes);
    else parts.sort((a, b) => { const x = rank(a.key), y = rank(b.key); return x[0] - y[0] || x[1] - y[1]; });
    if (other > 0) parts.push({ key: '', color: OTHER, votes: other, label: mode === 'bloc' ? L('No bloc', 'ללא גוש') : L('Other', 'אחרות') });
    return parts;
  };
  const areaPlaces = useMemo<AreaPlace[]>(() => !mix ? [] : placed.map(p => ({ index: p.index, name: localityName(names, p.row, p.index, lang), lat: p.lat, lon: p.lon, valid: p.row.valid,
    parts: partsOf(p.row.votes), geom: p.code === null ? null : outlines.get(p.code) ?? null })), [mix, placed, outlines, s, mode, names, lang, seated]);
  // Double-envelope votes belong to no place: an island in the sea west of Tel Aviv, sized like a town's circle
  const envelopeRows = useMemo(() => data.rows.flatMap((r, i) => isEnvelopeRow(r) ? [i] : []), [data]);
  const island = useMemo<Island | null>(() => {
    if (!envelopeRows.length || !placed.length) return null;
    const votes = data.listIds.map((_, k) => envelopeRows.reduce((a, i) => a + (data.rows[i].votes[k] ?? 0), 0));
    const valid = envelopeRows.reduce((a, i) => a + data.rows[i].valid, 0);
    if (valid <= 0) return null;
    const first = envelopeRows[0], ta = placed.find(p => p.code === 5000);
    const taName = ta ? localityName(names, ta.row, ta.index, lang) : '';
    return { lat: 32.0, lon: 34.62, valid, parts: partsOf(votes), winner: localityWinner(s, data.listIds, votes, mode).color,
      title: localityName(names, data.rows[first], first, lang), sub: L(`${fmtInt(valid)} valid votes`, `${fmtInt(valid)} קולות כשרים`),
      keepClear: ta && taName ? { lat: ta.lat, lon: ta.lon, width: Math.ceil(textWidth(taName)) + 4, rtl: lang === 'he' } : null };
  }, [envelopeRows, placed, data, s, mode, names, lang, seated]);
  const fittedFor = useRef<unknown>(null);
  useEffect(() => {
    if (!container.current) return;
    // Tool tabs unmount immediately; Leaflet's delayed zoom completion can outlive the map pane.
    const m = Leaflet.map(container.current, { renderer:new MountedCanvas(), scrollWheelZoom:false, zoomAnimation:false, zoomControl:false, minZoom:2, maxZoom:15, maxBounds:[[-85,-180],[85,180]] }).setView([31.7,35],7);
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
  const areas = useRef<AreasLayer | null>(null);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const layer = new AreasLayer(); layer.addTo(m); areas.current = layer;
    const click = (e: Leaflet.LeafletMouseEvent) => { if (layer.onIsland(e.containerPoint)) setSelectedIndex(envelopeRowsRef.current[0] ?? null); };
    m.on('click', click);
    return () => { m.off('click', click); layer.remove(); areas.current = null; };
  }, []);
  const envelopeRowsRef = useRef(envelopeRows); envelopeRowsRef.current = envelopeRows;
  // CBS open-use licence: the outlines carry their source credit while the vote mix shows them
  useEffect(() => {
    const m = map.current; if (!m || !mix) return;
    const credit = `<a href="https://www.arcgis.com/home/item.html?id=65410312f3ab4c3482f52f8c8a284a3d">${lang === 'he' ? 'גבולות: הלמ״ס, אזורים סטטיסטיים 2022 (מעובד)' : 'Outlines: CBS 2022 statistical areas (adapted)'}</a>`;
    m.attributionControl.addAttribution(credit);
    return () => { m.attributionControl.removeAttribution(credit); };
  }, [mix, lang]);
  useEffect(() => { areas.current?.set(areaPlaces, view, dark, selectedIndex, island); }, [areaPlaces, view, dark, selectedIndex, island]);
  useEffect(() => {
    const m = map.current; if (!m || !lineData.features.length) return;
    return drawMapLines(m, lineData, lineIds, dark, setHiddenLines);
  }, [lineData, lineIds, dark]);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const group = Leaflet.layerGroup().addTo(m);
    placed.forEach((p,i) => {
      const w = winners[i];
      // the tooltip says why the dot has its colour: who leads and by how much
      const tip = document.createElement('span'); tip.className = 'locality-map-tip';
      const title = document.createElement('strong'); title.dir = 'auto'; title.textContent = localityName(names, p.row, p.index, lang);
      const why = document.createElement('span'); why.dir = 'auto';
      // in the vote mix the tooltip gives the biggest shares; on the dots, who leads and by how much
      const mixParts = mix ? areaPlaces.find(a => a.index === p.index)?.parts ?? [] : [];
      const mixSum = mixParts.reduce((a, q) => a + q.votes, 0) || 1;
      why.textContent = mix ? [...mixParts].sort((a, b) => b.votes - a.votes).slice(0, 3).map(q => `${q.label} ${share(q.votes, mixSum, 0)}`).join(' · ')
        : w.tied ? L('Tie', 'שוויון') : w.key === null ? L('Unassigned / no votes', 'ללא שיוך / ללא קולות')
        : `${groupName(w.key)} \u2066+${fmtPoints(w.margin / Math.max(1, p.row.valid) * 100, digits, true)}\u2069 ${L(...PP)}`;
      const source = document.createElement('span'); source.dir = 'auto'; source.textContent = localityNameSource(names, p.row, p.index, lang);
      tip.append(title, why, source);
      if (p.approx) { const note = document.createElement('span'); note.dir = 'auto'; note.textContent = lang === 'he' ? p.approx.he : p.approx.en; tip.append(note); }
      // the vote mix draws its own circles and tiles: the dot stays, unseen, for its tooltip and click
      if (mix) { Leaflet.circleMarker([p.lat,p.lon], {radius:6, stroke:false, fillOpacity:0}).bindTooltip(tip).on('click',()=>setSelectedIndex(p.index)).addTo(group); return; }
      // a thin white outline separates neighbouring dots; a dark ring would darken every colour alike
      Leaflet.circleMarker([p.lat,p.lon], {radius:5, color:'#ffffff',weight:4,fill:false,interactive:false}).addTo(group);
      Leaflet.circleMarker([p.lat,p.lon], {radius:5, color:'#111418',weight:1,fillColor:w.color,fillOpacity:1}).bindTooltip(tip).on('click',()=>setSelectedIndex(p.index)).addTo(group);
      // a place placed by hand (Hebron) has a dashed ring: its position is approximate
      if (p.approx) Leaflet.circleMarker([p.lat,p.lon], {radius:8.5, color:dark?'#f2f4f7':'#111418',weight:1.4,dashArray:'2 2',fill:false,interactive:false,className:'locality-map-approx'}).addTo(group);
    });
    // open fitted to this election's localities (once per election, so a user's own zoom is kept while editing)
    if (placed.length && fittedFor.current !== data) {
      m.fitBounds(Leaflet.latLngBounds(placed.map((p) => [p.lat, p.lon] as [number, number])), { padding: [12, 12] });
      fittedFor.current = data;
    }
    return () => { group.remove(); };
  }, [placed,winners,lang,data,names,digits,mix,areaPlaces,dark]);
  // Same CBS/result keys as the table, both languages at every zoom. Larger localities first; no overlapping labels.
  useEffect(() => {
    const m = map.current, rtl = lang === 'he'; if (!m || (!rtl && !names.names.length)) return;
    const layer = Leaflet.layerGroup().addTo(m);
    const ranked = placed.map(p => ({ p, name: localityName(names, p.row, p.index, lang), weight: p.row.registered ?? p.row.votesCast })).filter(x => x.name).sort((a, b) => b.weight - a.weight);
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
    const p = placed.find(x => x.index === index);
    if (p) map.current?.setView([p.lat,p.lon],12);
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
  const placedRows = new Set(placed.map(p => p.index));
  const unplaced = data.rows.flatMap((r, i) => !isEnvelopeRow(r) && !placedRows.has(i) ? [i] : []);
  const legend = mode === 'bloc' ? s.blocs.map(b => ({ id: b.id, color: b.color, label: groupingName(b, lang), title: b.appDefined ? appGroupingExplanation(lang) : undefined }))
    : s.lists.filter(l => mix ? seated.has(l.id) : winners.some(w => w.key === l.id)).map(l => ({ id: l.id, color: l.color, label: listLabel(l, lang), title: undefined }));
  const shareBar = (v: number, top: number, color: string) => <span className="locality-share"><span><i style={{ width: `${v / (top || 1) * 100}%`, background: color }} /></span><span className="tabnum">{share(v, selected!.valid, digits)}</span></span>;
  return <div className="locality-map-tool">
    <p className="small ink2">{L('Historical votes · current grouping', 'קולות היסטוריים · חלוקה נוכחית')} <Info title={L('Map assumptions', 'הנחות המפה')}>{L('Historical local votes; colours follow your current scenario grouping. National vote edits are not distributed geographically. Split lists use national vote proportions; split blocs use elected-seat proportions, an estimate rather than measured party votes. English place names are CBS locality names; a few localities missing from CBS lists have this project’s transliteration (dotted underline).', 'קולות היסטוריים ביישובים; הצבעים לפי חלוקת הגושים הנוכחית. שינויי קולות ארציים אינם מחולקים גאוגרפית. רשימות שפוצלו מחולקות לפי יחס הקולות הארצי; גושים בתוך רשימה לפי יחס המושבים הנבחרים — אומדן ולא קולות מפלגתיים שנמדדו.')}</Info></p>
    {data.id !== 'k17' && (data.noteEn || data.noteHe) && <p className="small callout">{lang === 'he' ? data.noteHe ?? data.noteEn : data.noteEn ?? data.noteHe}</p>}
    {split && mode === 'bloc' && <p className="callout small">{L('A list spans several blocs: its locality votes are apportioned by its current elected members’ blocs.', 'רשימה משויכת לכמה גושים: קולותיה ביישוב מחולקים לפי שיוך חבריה הנבחרים כיום.')}</p>}
    <div className="row">
      <ChoicePicker label={L('Colour by', 'צביעה לפי')} value={mode} options={[{ value: 'bloc', label: mix ? L('Blocs', 'גושים') : L('Winning bloc', 'הגוש המוביל'), preview: <ResultPreview s={s} /> }, { value: 'list', label: mix ? L('Lists', 'רשימות') : L('Winning list', 'הרשימה המובילה'), preview: <ResultPreview s={s} blocs={false} /> }]} onChange={v => setMode(v as typeof mode)} />
      <label className="field">{L('Find a locality ', 'חיפוש יישוב ')}<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={L('Hebrew, English or code','עברית, אנגלית או סמל')} /></label>
    </div>
    {normalizeLocalityName(q) && <div className="locality-map-matches" aria-label={L('Matching localities','יישובים תואמים')}>
      {matches.slice(0,30).map(i=><button className="btn small" key={i} onClick={()=>choose(i)} dir="auto">{nameOf(i)} ({data.rows[i].code ?? '—'})</button>)}
      <p className="small" role="status">{countOf(matches.length, lang, ['match', 'matches'], ['התאמה אחת', 'התאמות'])}{matches.length > 30 ? L('; the first 30 are shown.', '; מוצגות 30 הראשונות.') : '.'}</p>
    </div>}
    <form className="locality-map-address" onSubmit={e=>{e.preventDefault();void searchAddress();}}>
      <label className="field">{L('Nearest locality to an address ', 'היישוב הקרוב לכתובת ')}<input type="text" value={address} onChange={e=>setAddress(e.target.value)} /></label>
      <button className="btn" disabled={busy || !address.trim()} title={busy ? L('Search in progress', 'החיפוש מתבצע') : !address.trim() ? L('Enter an address first', 'תחילה הזינו כתובת') : undefined}>{busy?L('Searching…','מחפש…'):L('Find address','חיפוש כתובת')}</button>
      <small>{L('Submitting sends the address to ', 'שליחה מעבירה את הכתובת ל־')}<a href="https://photon.komoot.io/">Photon</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a></small>
    </form>
    <p className="small locality-map-status" role="status">{message}</p>
    {suggestions.length>0 && <div className="locality-map-matches">{suggestions.map((f,i)=><button className="btn small" key={i} dir="auto" onClick={()=>{
      const [lon,lat]=f.geometry.coordinates; const near=nearestLocality(placed,{lat,lon});
      if (near) {choose(near.item.index);setMessage(L(`Nearest mapped locality: ${nameOf(near.item.index)}, ${near.km.toFixed(1)} km (straight line).`, `היישוב הממופה הקרוב: ${nameOf(near.item.index)}, ${near.km.toFixed(1)} ק״מ בקו אווירי.`));}
    }}>{[f.properties.name,f.properties.street,f.properties.housenumber,f.properties.city,f.properties.country].filter(Boolean).join(', ')}</button>)}</div>}
    {data.id === 'k17' && <Locality2006Note />}
    <div className="locality-map-legend">
      <span className="locality-map-view">
        <span className="seg" role="group" aria-label={L('Map view', 'תצוגת המפה')}>
          <button type="button" aria-pressed={!mix} onClick={() => setView('winner')}>{L('Winner', 'המוביל')}</button>
          <button type="button" aria-pressed={mix} onClick={() => setView('mix')}>{L('Vote mix', 'תמהיל קולות')}</button>
        </span>
        <Info title={L('Map view', 'תצוגת המפה')}><p>{L('Winner: one dot per place, in the colour of the bloc or list that came first there.', 'המוביל: נקודה לכל יישוב, בצבע הגוש או הרשימה שהגיעו ראשונים בו.')}</p>
          <p>{L('Vote mix: from afar, a circle per place, its size by valid votes, cut by votes. Close up, each town is filled with small squares, one block per bloc or list, its share of the squares its share of the votes. The blocks show shares, not where in the town people voted. The order is the same in every town, bloc by bloc. Lists that won no seat are grey (Other). Double-envelope votes are the dashed island off Tel Aviv. The app remembers your choice on this device.', 'תמהיל קולות: מרחוק, עיגול לכל יישוב, גודלו לפי הקולות הכשרים, מחולק לפי הקולות. מקרוב, כל יישוב ממולא בריבועים קטנים, גוש אחד לכל גוש או רשימה, וחלקו בריבועים כחלקו בקולות. הגושים מראים חלקים, לא היכן ביישוב הצביעו. הסדר זהה בכל יישוב, גוש אחר גוש. רשימות שלא זכו במושב באפור (אחרות). קולות המעטפות הכפולות הם האי המקווקו מול תל אביב. האפליקציה זוכרת את הבחירה במכשיר הזה.')}</p></Info>
      </span>
      {legend.map(x=><span key={x.id} title={x.title}><i style={{background:x.color}} />{x.label}</span>)}<span><i style={{background:mix ? OTHER : GREY}}/>{mix ? (mode === 'bloc' ? L('No bloc', 'ללא גוש') : L('Other: lists without a seat', 'אחרות: רשימות ללא מושב')) : L('Tie / unassigned / no votes','שוויון / ללא שיוך / ללא קולות')}</span>
    </div>
    {mix && outlineError && <p className="small bad" role="status">{L('Town outlines could not load; places show as circles.', 'גבולות היישובים לא נטענו; היישובים מוצגים כעיגולים.')} <button className="btn small" onClick={retryOutlines}>{L('Try again', 'נסו שוב')}</button></p>}
    <details className="locality-boundary-disclosure" open={legendOpen} onToggle={e=>setLegendOpen(e.currentTarget.open)}><summary>{L('Lines and areas', 'קווים ושטחים')}</summary>
    <fieldset className="locality-boundary-legend"><legend className="sr-only">{L('Lines and areas', 'קווים ושטחים')}</legend>
      <label className="locality-boundary-all"><input type="checkbox" checked={every === 'all'} ref={el => { if (el) el.indeterminate = every === 'some'; }}
        onChange={e => setMapLines(e.target.checked)} />{L('All lines and areas', 'כל הקווים והשטחים')}</label>
      {MAP_LINES.map(line => <span className="locality-boundary-entry" key={line.id}>
        <label><input type="checkbox" checked={lineIds.has(line.id)} onChange={e => tick(line.id, e.target.checked)} />
          <svg width="28" height="14" viewBox="0 0 28 14" aria-hidden="true">{line.fill==='solid'?<rect width="28" height="14" fill={dark?line.dark:line.color} fillOpacity=".18"/>:line.fill?<>
            <path d={line.fill==='cross'?'M0 0L8 8 M0 8L8 0 M8 0L16 8 M8 8L16 0 M16 0L24 8 M16 8L24 0 M24 0L32 8 M24 8L32 0 M0 8L8 16 M0 16L8 8 M8 8L16 16 M8 16L16 8 M16 8L24 16 M16 16L24 8 M24 8L32 16 M24 16L32 8':'M-14 14L0 0 M-6 14L8 0 M2 14L16 0 M10 14L24 0 M18 14L32 0 M26 14L40 0'} stroke={dark?line.dark:line.color} strokeWidth="1.4" strokeLinecap="butt"/>
            {line.outline&&<path d="M0 13H28" stroke={dark?line.dark:line.color} strokeWidth="2" strokeLinecap="butt" strokeDasharray={line.dash}/>}
          </>:<path d="M0 7H28" stroke={dark?line.dark:line.color} strokeWidth="2" strokeLinecap="butt" strokeDasharray={line.dash}/>}</svg>
          {lang === 'he' ? line.he : line.en}</label>
        <Info title={lang === 'he' ? line.he : line.en}>
          <p><MapLineText lang={lang} text={lang==='he'?line.detailHe:line.detailEn}/></p>
          {line.quotes?.map(quote=><div key={quote.reference}><p><MapLineText lang={lang} text={lang==='he'?quote.referenceHe??quote.reference:quote.reference}/>{lang==='he'&&quote.translatedHe?L('',' · תרגום מהמקור האנגלי'):''}</p><blockquote className="map-treaty-quote"><MapLineText lang={lang} text={lang==='he'?quote.he:quote.en}/></blockquote></div>)}
          <p><MapLineText lang={lang} text={lang==='he'?line.uncertaintyHe:line.uncertaintyEn}/></p>
          <p>{L('Geometry snapshot: ', 'תצלום מצב של הגאומטריה: ')}<bdi dir="ltr">{MAP_LINE_SNAPSHOT}</bdi></p>
          <p>{L('Sources: ', 'מקורות: ')}{line.sources.map(([label,url],i)=><span key={url}>{i>0?' · ':''}<a href={url} target="_blank" rel="noreferrer"><MapLineText lang={lang} text={mapLineSourceLabel(label,lang)}/></a></span>)}</p>
        </Info>
      </span>)}
    </fieldset></details>
    {<p className="small locality-boundary-limit" style={{visibility:hiddenLines>0?'visible':'hidden'}} aria-hidden={hiddenLines===0} role={hiddenLines>0?'status':undefined}>{L('Some approximate lines are hidden at this zoom. Zoom out to see them.', 'חלק מהקווים המקורבים מוסתרים בהגדלה זו. להצגתם, הקטינו את המפה.')} <Info title={L('Line detail limits','מגבלות פירוט הקווים')}>{L('Each layer stops at its source precision. Measured source differences are limited to roughly 20 screen pixels; outlines whose precision is unknown are shown only at overview zooms. Locality dots and names remain available. Each layer’s explanation states its uncertainty.', 'כל שכבה נעצרת לפי דיוק המקור. פערי המקורות שנמדדו מוגבלים לכ־20 פיקסלים במסך; תוואים שדיוקם אינו ידוע מוצגים רק בקנה מידה כללי. נקודות ושמות היישובים ממשיכים להופיע. אי־הוודאות מצוינת בהסבר של כל שכבה.')}</Info></p>}
    {lineError && <p className="small bad" role="status">{L('Boundary data could not load.', 'נתוני הקווים לא נטענו.')} <button className="btn small" onClick={retryLines}>{L('Try again', 'נסו שוב')}</button></p>}
    <div ref={container} className="locality-map-canvas" role="region" aria-label={L('Locality results map; use search or table for keyboard selection','מפת תוצאות ביישובים; לבחירה במקלדת השתמשו בחיפוש או בטבלה')} />
    {tilesFailed && <p className="small bad">{L('The background map could not load; the locality dots still work.', 'מפת הרקע לא נטענה; נקודות היישובים עדיין פעילות.')}</p>}
    {selected && <section className="locality-map-results" aria-live="polite" aria-label={L('Selected locality results','תוצאות היישוב הנבחר')}>
      <h3><LocalityName names={names} row={selected} index={selectedIndex!} /></h3>
      {/* why the dot has its colour: the leader, and its lead over the runner-up in this locality */}
      <p className="locality-verdict">{selectedWinner!.tied ? L('Tie', 'שוויון') : selectedWinner!.key === null || !groups.length ? L('No assigned votes', 'אין קולות משויכים') : <>
        <span className="swatch" style={{ background: groupColor(selectedWinner!.key) }} /><strong dir="auto">{groupName(selectedWinner!.key)}</strong>
        {groups.length > 1 && <span className="ink2"> · {L('ahead of ', 'ביתרון של ')}{lang === 'en' && <span dir="auto">{groupName(groups[1].key)} {L('by ', '')}</span>}<bdi dir="ltr">{points(selectedWinner!.margin / Math.max(1, selected.valid) * 100, digits, true)}</bdi> {L(...PP)} ({fmtInt(selectedWinner!.margin)} {L('votes', 'קולות')}){lang === 'he' && <span dir="auto"> על {groupName(groups[1].key)}</span>}</span>}
      </>}</p>
      {mode === 'bloc' && groups.length > 0 && <div className="tablewrap"><table className="tbl"><thead><tr><th>{L('Bloc','גוש')}</th><th className="n">{L('Votes','קולות')}</th><th>{L('Share','שיעור')}</th></tr></thead><tbody>
        {groups.map(g => <tr key={g.key ?? 'none'} className={g.key === selectedWinner!.key ? 'sel' : undefined}><td><span className="row" style={{gap:6,flexWrap:'nowrap'}}><span className="swatch" style={{background:groupColor(g.key)}} />{groupName(g.key)}</span></td><td className="n">{fmtInt(g.votes)}</td><td>{shareBar(g.votes, groups[0].votes, groupColor(g.key))}</td></tr>)}
      </tbody></table></div>}
      <p className="small ink2 locality-map-facts">
        <span>{L('Turnout ', 'הצבעה ')}<b className="tabnum">{selected.registered ? percent(selected.votesCast, selected.registered, digits) : '—'}</b></span>
        <span>{L('Valid ', 'כשרים ')}<b className="tabnum">{fmtInt(selected.valid)}</b></span>
        <span>{L('Registered ', 'בעלי זכות ')}<b className="tabnum">{selected.registered === null ? '—' : fmtInt(selected.registered)}</b></span>
        <span>{L('Invalid ', 'פסולים ')}<b className="tabnum">{fmtInt(selected.invalid)}</b></span>
        <Info title={L('Location and turnout', 'מיקום והצבעה')}><p>{localityNameSource(names, selected, selectedIndex!, lang)}</p>{(() => { const a = placed.find(p => p.index === selectedIndex)?.approx; return a && <p>{lang === 'he' ? a.he : a.en}</p>; })()}{L('Turnout excludes double-envelope votes. Coordinates are CBS locality reference points, not polling stations.', 'ההצבעה אינה כוללת מעטפות חיצוניות. המיקום הוא נקודת ייחוס של הלמ״ס ליישוב ולא מיקום קלפי.')}</Info>
      </p>
      {/* each list's share drawn as a bar in its colour, scaled to the leader */}
      <div className="tablewrap"><table className="tbl"><thead><tr><th>{L('List','רשימה')}</th><th className="n">{L('Votes','קולות')}</th><th>{L('Share','שיעור')}</th></tr></thead><tbody>{(()=>{const rows=selected.votes.map((v,k)=>({v,k})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);const top=rows[0]?.v||1;return rows.map(({v,k})=>{
        const l=historicalLists[k];return <tr key={k}><td><span className="row" style={{gap:6,flexWrap:'nowrap'}}><span className="swatch" style={{background:l?.color ?? 'var(--muted)'}} />{l?listLabel(l,lang):data.listIds[k]}</span></td><td className="n">{fmtInt(v)}</td><td>{shareBar(v, top, l?.color ?? 'var(--muted)')}</td></tr>;
      });})()}</tbody></table></div>
    </section>}
    {locationError && <p className="bad" role="alert">{L('Coordinates could not be loaded. The table is still available.', 'לא ניתן לטעון מיקומים. הטבלה עדיין זמינה.')} <button className="btn small" onClick={retryLocations}>{L('Try again', 'נסו שוב')}</button></p>}
    <p className="small ink2">{L(`${fmtInt(placed.length)} of ${fmtInt(localities)} localities placed. Envelope votes have no geographic location.`,`${fmtInt(placed.length)} מתוך ${fmtInt(localities)} יישובים ממופים. למעטפות החיצוניות אין מיקום גאוגרפי.`)}</p>
    <details><summary>{L('Rows without a mapped location','שורות ללא מיקום במפה')}</summary><ul>{unplaced.map(i=><li key={i}><button className="btn small" onClick={()=>choose(i)}><LocalityName names={names} row={data.rows[i]} index={i} /> ({data.rows[i].code ?? '—'})</button></li>)}</ul></details>
  </div>;
}
