import * as Leaflet from 'leaflet';
import type { FeatureCollection } from 'geojson';

export const MAP_LINE_SNAPSHOT = '2026-11-07';
const osm = 'https://www.openstreetmap.org/relation/';
export const MAP_LINES = [
  { id:'green-line', en:'1949 armistice · Judea and Samaria', he:'שביתת הנשק 1949 · יהודה ושומרון', color:'#247449', dark:'#89d2a4', dash:'7 4',
    detailEn:'The pre-1967 armistice demarcation, originating in the 1949 Israel–Jordan agreement and including agreed rectifications. Paired lines are retained where the forces were separated. The agreement did not establish a permanent political border. Cartographic OSM alignment, checked against UN maps; not a cadastral survey.',
    detailHe:'תוואי שביתת הנשק שלפני 1967, שמקורו בהסכם ישראל–ירדן מ־1949 וכולל תיקונים מוסכמים. במקום שהכוחות הופרדו, נשמרו שני הקווים. ההסכם לא קבע גבול מדיני קבוע. תוואי קרטוגרפי של OSM שהושווה למפות האו״ם; אינו מדידה קדסטרית.',
    sources:[['OSM · 7304999',osm+'7304999'],['UN · S/1302/Rev.1','https://www.un.org/unispal/document/auto-insert-181069/']] },
  { id:'no-mans-land', en:'No-man’s-land · 1949–1967', he:'שטחי הפקר · 1949–1967', color:'#80631f', dark:'#dfc875', dash:'',
    detailEn:'Historical areas between the paired armistice lines at Latrun and Jerusalem. Hatching is derived from the closed line rings, not a buffer of fixed width. It does not show present-day military positions. Mount Scopus is shown separately.',
    detailHe:'שטחים היסטוריים בין קווי שביתת הנשק בלטרון ובירושלים. הקווים האלכסוניים ממלאים את התחומים הסגורים שבין הקווים, ולא רצועה ברוחב קבוע. אין כאן תיאור של עמדות צבאיות כיום. הר הצופים מוצג בנפרד.',
    sources:[['OSM · 7304999',osm+'7304999'],['UN · map 229 (1949)','https://commons.wikimedia.org/wiki/File:UN_Map_of_Central_Jerusalem_November_1949.jpg']] },
  { id:'scopus', en:'Mount Scopus enclave · 1949', he:'מובלעת הר הצופים · 1949', color:'#247449', dark:'#89d2a4', dash:'2 3',
    detailEn:'The historical demilitarized Mount Scopus enclave. Its outline is retained separately from the main armistice line and is not hatched as no-man’s-land. Source: OSM historical line relation and the UN armistice map annex.',
    detailHe:'מובלעת הר הצופים המפורזת ההיסטורית. גבולה מוצג בנפרד מקו שביתת הנשק הראשי ואינו מסומן כשטח הפקר. מקור: תוואי הקו ההיסטורי ב־OSM ונספח המפות להסכם שביתת הנשק באו״ם.',
    sources:[['OSM · 7304999',osm+'7304999'],['UN · Treaty Series 42, annex maps','https://treaties.un.org/doc/publication/unts/volume%2042/v42.pdf']] },
  { id:'gaza-perimeter', en:'Israel–Gaza Strip boundary', he:'גבול ישראל–רצועת עזה', color:'#9a522b', dark:'#f0b088', dash:'6 3',
    detailEn:'The present cartographic land boundary between Israel and the Gaza Strip, from OSM, cross-checked with UN/OCHA. This is not a reconstruction of the original February 1949 armistice line, a security barrier, or current military buffer zones. The February 1950 modus vivendi established local patrol arrangements while preserving the parties’ positions on the armistice line.',
    detailHe:'הגבול היבשתי הקרטוגרפי בין ישראל לרצועת עזה כיום, לפי OSM ובהשוואה לאו״ם ולאוצ׳ה. אין זה שחזור של קו שביתת הנשק המקורי מפברואר 1949, גדר ביטחון או אזורי חיץ צבאיים כיום. הסדר פברואר 1950 קבע סידורי סיור מקומיים תוך שמירת עמדות הצדדים לגבי קו שביתת הנשק.',
    sources:[['OSM · 1473938',osm+'1473938'],['UN · international boundaries','https://gis.unocha.org/server/rest/services/Hosted/World_International_Boundaries__Adm0___Line/FeatureServer/0'],['UN · S/1471 (1950)','https://www.un.org/unispal/document/auto-insert-183322/']] },
  { id:'egypt-border', en:'Egypt · international border', he:'מצרים · גבול בין־לאומי', color:'#645344', dark:'#dac1a5', dash:'',
    detailEn:'International land boundary under the 1979 Israel–Egypt peace treaty and subsequent demarcation, including Taba. OSM geometry cross-checked against the UN 1:1 million boundary dataset and Natural Earth 1:10 million. These are cartographic alignments, not boundary-pillar survey coordinates.',
    detailHe:'הגבול היבשתי הבין־לאומי לפי הסכם השלום בין ישראל למצרים מ־1979 ותיחומו בהמשך, לרבות טאבה. תוואי OSM הושווה למאגר הגבולות של האו״ם בקנ״מ 1:1 מיליון ול־Natural Earth בקנ״מ 1:10 מיליון. זהו תוואי קרטוגרפי, לא קואורדינטות מדודות של עמודי גבול.',
    sources:[['OSM · 1473946',osm+'1473946'],['UN · international boundaries','https://gis.unocha.org/server/rest/services/Hosted/World_International_Boundaries__Adm0___Line/FeatureServer/0']] },
  { id:'jordan-border', en:'Jordan · international frontier', he:'ירדן · גבול בין־לאומי', color:'#645344', dark:'#dac1a5', dash:'',
    detailEn:'The frontier with Jordan, cross-checked against UN cartography. The 1994 peace treaty establishes the agreed international boundary without prejudice to the status of territories placed under Israeli military government in 1967. The Judea and Samaria sector is not a claim that the territory is part of Israel. The Golan–Jordan segment is excluded.',
    detailHe:'הגבול עם ירדן, בהשוואה לקרטוגרפיה של האו״ם. הסכם השלום מ־1994 קובע את הגבול הבין־לאומי המוסכם בלי לפגוע במעמד השטחים שהועברו לשליטת הממשל הצבאי הישראלי ב־1967. הצגת מקטע יהודה ושומרון אינה קביעה שהשטח הוא חלק מישראל. מקטע הגולן–ירדן אינו מוצג.',
    sources:[['OSM · 184818',osm+'184818'],['MFA · peace treaty, Article 3 / Annex I','https://www.gov.il/en/pages/israel-jordan-peace-treaty']] },
  { id:'blue-line', en:'Lebanon · Blue Line', he:'לבנון · הקו הכחול', color:'#2164a5', dark:'#8dbfff', dash:'3 3',
    detailEn:'The UN identified the Blue Line in 2000 to verify the withdrawal of Israeli forces from Lebanon. It is not an international border and need not coincide with a physical security fence. OSM ways explicitly tagged “UN 2000 Blue Line”, checked against the UNIFIL March 2026 deployment map and UN boundary vectors in the common western sector.',
    detailHe:'האו״ם זיהה את הקו הכחול בשנת 2000 לאימות נסיגת כוחות ישראל מלבנון. אין זה גבול בין־לאומי והוא אינו בהכרח חופף לגדר ביטחון. תוואי OSM המסומן במפורש כקו הכחול הושווה למפת יוניפי״ל ממרץ 2026 ולווקטור האו״ם במקטע המערבי המשותף.',
    sources:[['UNIFIL · March 2026','https://www.un.org/geospatial/en/content/unifil'],['OSM · Israel relation',osm+'1473946']] },
  { id:'golan-alpha', en:'Golan · 1974 Alpha line', he:'גולן · קו אלפא 1974', color:'#7550a4', dark:'#c7a5f4', dash:'8 3 2 3',
    detailEn:'The 1974 disengagement Alpha (A) line, from explicitly tagged OSM ways, compared with UNDOF map 2916 Rev.131 (March 2024) and Natural Earth’s 1974 ceasefire line. It is distinct from the 1949 Israel–Syria armistice line. Bravo, Alpha-1 and the area-of-separation fill are withheld pending verification; this layer does not show current deployments.',
    detailHe:'קו אלפא (A) של הפרדת הכוחות מ־1974, לפי תוואים מסומנים במפורש ב־OSM ובהשוואה למפת אונדו״ף 2916 מהדורה 131 ממרץ 2024 ולקו 1974 של Natural Earth. הוא נבדל מקו שביתת הנשק ישראל–סוריה מ־1949. קו בראבו, אלפא־1 ומילוי אזור ההפרדה אינם מוצגים עד לאימות; שכבה זו אינה מציגה פריסת כוחות כיום.',
    sources:[['UNDOF · map 2916 Rev.131 (March 2024)','https://undof.unmissions.org/en/undof-deployment-map'],['OSM · A-Line ways',osm+'1473946']] },
] as const;
export type MapLineId = typeof MAP_LINES[number]['id'];

/** Boundaries remain usable if vector tiles/WebGL fail. Each category is a separate removable layer. */
export function drawMapLines(map: Leaflet.Map, data: FeatureCollection, enabled: ReadonlySet<string>, dark: boolean) {
  if (!map.getPane('verified-lines')) { const pane = map.createPane('verified-lines'); pane.style.zIndex = '350'; pane.style.pointerEvents = 'none'; }
  const renderer = Leaflet.svg({ pane:'verified-lines' }).addTo(map);
  const svg = map.getPane('verified-lines')!.querySelector('svg')!;
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns,'defs'), pattern = document.createElementNS(ns,'pattern');
  const id = `map-hatch-${Leaflet.stamp(renderer)}`;
  pattern.setAttribute('id',id); pattern.setAttribute('patternUnits','userSpaceOnUse'); pattern.setAttribute('width','8'); pattern.setAttribute('height','8');
  const path = document.createElementNS(ns,'path'); path.setAttribute('d','M-2 2L2-2 M0 8L8 0 M6 10L10 6'); path.setAttribute('stroke',dark?'#dfc875':'#80631f'); path.setAttribute('stroke-width','1.4');
  pattern.append(path); defs.append(pattern); svg.prepend(defs);
  const layers = MAP_LINES.filter(x=>enabled.has(x.id)).map(line=>Leaflet.geoJSON(data, {
    pane:'verified-lines', interactive:false,
    filter: f=>f.properties?.layer === line.id,
    style: { renderer, pane:'verified-lines', color:dark?line.dark:line.color, weight:line.id==='no-mans-land'?0:2, opacity:1,
      dashArray:line.dash || undefined, fill:line.id==='no-mans-land', fillColor:`url(#${id})`, fillOpacity:1 },
  }).addTo(map));
  return () => { layers.forEach(layer=>layer.remove()); renderer.remove(); };
}

const SOURCE_LABELS_HE: Record<string,string> = {
  'UN · S/1302/Rev.1':'או״ם · S/1302/Rev.1',
  'UN · map 229 (1949)':'או״ם · מפה 229 (1949)',
  'UN · Treaty Series 42, annex maps':'או״ם · כרך 42, נספח המפות',
  'UN · S/1471 (1950)':'או״ם · S/1471 (1950)',
  'UN · international boundaries':'או״ם · גבולות בין־לאומיים',
  'MFA · peace treaty, Article 3 / Annex I':'משרד החוץ · הסכם השלום, סעיף 3 ונספח א׳',
  'UNIFIL · March 2026':'יוניפי״ל · מרץ 2026',
  'OSM · Israel relation':'OSM · תוואי הקו הכחול',
  'UNDOF · map 2916 Rev.131 (March 2024)':'אונדו״ף · מפה 2916, מהדורה 131 (מרץ 2024)',
  'OSM · A-Line ways':'OSM · תוואי אלפא',
};
export const mapLineSourceLabel = (label: string, lang:'he'|'en') => lang==='he' ? SOURCE_LABELS_HE[label] ?? label : label;
