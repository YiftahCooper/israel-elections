import treaty from '../../data/raw/map-lines/official-treaty-excerpts.json';

export const MAP_LINE_SNAPSHOT = '2026-11-07';
const osm = 'https://www.openstreetmap.org/relation/';
const archives = 'https://catalog.archives.gov.il/site/chapter/the-urban-line-2/';
const mfaJerusalem = 'https://www.gov.il/en/pages/jerusalem-legal-and-political-background';
const un229 = 'https://commons.wikimedia.org/wiki/File:UN_Map_of_Central_Jerusalem_November_1949.jpg';
const frid = 'https://humanities.tau.ac.il/sites/humanities.tau.ac.il/files/media_server/humanities/zionism/%D7%99%D7%A9%D7%A8%D7%90%D7%9C/31-32/yoram_frid.pdf';
const originalTreaty = treaty.sources.officialOriginalMirror;
export interface MapLineDefinition {
  id:string; en:string; he:string; color:string; dark:string; dash:string;
  detailEn:string; detailHe:string; uncertaintyEn:string; uncertaintyHe:string;
  sources: readonly (readonly [string,string])[];
  fill?:'hatch'|'cross';
  quotes?: readonly {reference:string;en:string;he:string;translatedHe?:boolean}[];
}
export const MAP_LINES: readonly MapLineDefinition[] = [
  {id:'green-line',en:'Armistice lines · Judea and Samaria',he:'קווי שביתת הנשק · יהודה ושומרון',color:'#247449',dark:'#89d2a4',dash:'7 4',
    detailEn:'The 1949 agreement adopts the 30 November 1948 cease-fire lines in Jerusalem (V(1)(b)) and UNTSO-certified truce lines in the Latrun sector (V(1)(a)), subject to agreed rectifications (VI(11)). Central Jerusalem is checked against UN map 229 only; elsewhere the alignment is OSM cartography. The Dead Sea crossing agrees with modern UN/OCHA cartography but could not be authenticated against the missing 1949 south map sheet. The northern Jerusalem pair and hatch end at that map’s coverage.',
    detailHe:'הסכם 1949 מאמץ בירושלים את קווי הפסקת האש מ־30 בנובמבר 1948 (V(1)(b)), ובמקטע לטרון את קווי ההפוגה שאישר אונטס״ו (V(1)(a)), בכפוף לתיקונים מוסכמים (VI(11)). מרכז ירושלים נבדק מול מפה 229 של האו״ם בלבד; בשאר המקטעים זהו תוואי קרטוגרפי של OSM. המקטע בים המלח תואם לקרטוגרפיה המודרנית של האו״ם ואוצ׳ה, אך לא ניתן היה לאמתו מול גיליון הדרום החסר מ־1949. זוג הקווים וההצללה בצפון ירושלים מסתיימים בגבול כיסוי המפה.',
    uncertaintyEn:'Approximate: central Jerusalem about ±60 m from map registration; elsewhere the source products differ by up to about 843 m, without a surveyed accuracy bound. Approximate sections disappear at closer zooms.',
    uncertaintyHe:'תוואי מקורב: במרכז ירושלים כ־±60 מ׳ לפי רישום המפה; בשאר המקטעים פערים של עד כ־843 מ׳ בין המקורות, ללא גבול דיוק מדוד. המקטעים המקורבים מוסתרים בהגדלה נוספת.',
    quotes:[{reference:'1949 · VI(9)',en:'agreed upon by the Parties without prejudice to future territorial settlements or boundary lines or to claims of either Party relating thereto.',he:'הוסכם עליהם בידי הצדדים בלי לפגוע בהסדרים טריטוריאליים עתידיים או בקווי גבול עתידיים או בתביעות של מי מהצדדים ביחס לכך.',translatedHe:true}],
    sources:[['OSM · 7304999',osm+'7304999'],['UN · map 229 (1949)',un229],['UN · S/1302/Rev.1','https://www.un.org/unispal/document/auto-insert-181069/']]},
  {id:'no-mans-land',en:'No-man’s-land · 1949–1967',he:'שטחי הפקר · 1949–1967',color:'#80631f',dark:'#dfc875',dash:'',fill:'hatch',
    detailEn:'Historical no-man’s-land at Latrun and in central Jerusalem. The MFA describes Jerusalem’s no-man’s-land as the area between the lines to which access was prohibited. Government House and Mount Scopus have separate statuses. The eastern end of the Latrun no-man’s-land was never defined on an agreed map; the closure here follows OSM. The Jerusalem hatch ends at UN map 229’s coverage and at Palestine-grid northing 130, where the Government House zone starts.',
    detailHe:'שטחי הפקר היסטוריים בלטרון ובמרכז ירושלים. משרד החוץ מתאר את שטח ההפקר בירושלים כשטח בין הקווים שהגישה אליו נאסרה. לארמון הנציב ולהר הצופים מעמד נפרד. הקצה המזרחי של שטח ההפקר בלטרון מעולם לא הוגדר במפה מוסכמת; הסגירה כאן היא לפי OSM. ההצללה בירושלים מסתיימת בגבול הכיסוי של מפה 229 ובקו הצפוני 130 של רשת ארץ־ישראל, שבו מתחיל אזור ארמון הנציב.',
    uncertaintyEn:'Jerusalem approximately ±60 m; Latrun’s source outlines differ by up to about 740 m and its eastern closure is not an agreed boundary. Detailed zooms omit the approximate Latrun outline.',
    uncertaintyHe:'בירושלים כ־±60 מ׳; בלטרון פערים של עד כ־740 מ׳ בין תוואי המקורות, והסגירה המזרחית אינה גבול מוסכם. תוואי לטרון המקורב מוסתר בהגדלה מפורטת.',
    sources:[['OSM · 7304999',osm+'7304999'],['UN · map 229 (1949)',un229],['Israel State Archives',archives],['MFA · Jerusalem background',mfaJerusalem],['Frid · TAU, Israel 31–32 (2024), pp. 470–473',frid]]},
  {id:'govt-house-zone',en:'Government House zone · 1949–1967',he:'אזור ארמון הנציב · 1949–1967',color:'#78508a',dark:'#d4b7e3',dash:'4 4',fill:'cross',
    detailEn:'Demilitarized area between the Israeli and Jordanian lines around the UN headquarters. The Mixed Armistice Commission agreed a civilian-use arrangement on 26 June 1949, with a civilian line dividing Israeli and Jordanian parts. Frid records Palestine-grid northing 130 as its northern limit and 128 as its southern limit. It is separate from no-man’s-land. The civilian line itself is not drawn without its map.',
    detailHe:'שטח מפורז בין הקו הישראלי לקו הירדני סביב מפקדת האו״ם. ועדת שביתת הנשק המעורבת הסכימה ב־26 ביוני 1949 על הסדר לשימוש אזרחי, ובו קו אזרחי שחילק את השטח לחלק ישראלי ולחלק ירדני. פריד מציין את הקו הצפוני 130 של רשת ארץ־ישראל כגבולו הצפוני ואת 128 כגבולו הדרומי. מעמדו נפרד משטח הפקר. הקו האזרחי עצמו אינו מצויר ללא המפה שלו.',
    uncertaintyEn:'OSM cartographic outline; positional accuracy is not established. Shown only at overview zooms, with the grid limits derived from the recorded arrangement.',
    uncertaintyHe:'תחום קרטוגרפי של OSM; דיוק המיקום לא נקבע. מוצג רק בקנה מידה כללי, עם גבולות הרשת שנגזרו מן ההסדר המתועד.',
    sources:[['Israel State Archives',archives],['MFA · Jerusalem background',mfaJerusalem],['Frid · TAU, Israel 31–32 (2024), pp. 470–473',frid]]},
  {id:'scopus',en:'Mount Scopus · Israeli enclave (1948)',he:'הר הצופים · המובלעת הישראלית (1948)',color:'#247449',dark:'#89d2a4',dash:'1 4',
    detailEn:'The 7 July 1948 arrangement placed the Israeli enclave (Hebrew University and Hadassah) and the adjoining Jordanian Augusta Victoria area under UN protection. Only the northern OSM arc of the Israeli enclave is shown here: the Augusta Victoria lobe is excluded and no unsourced internal dividing line is invented. Isawiya was included in the mapped Israeli enclave but controlled by Jordan in practice. The exact limits were disputed.',
    detailHe:'ההסדר מ־7 ביולי 1948 העמיד את המובלעת הישראלית (האוניברסיטה העברית והדסה) ואת אזור אוגוסטה ויקטוריה הירדני הסמוך תחת הגנת האו״ם. כאן מוצג רק הקטע הצפוני של תוואי OSM במובלעת הישראלית: שלוחת אוגוסטה ויקטוריה אינה נכללת, ולא הומצא קו חלוקה פנימי ללא מקור. עיסאוויה נכללה במובלעת הישראלית במפה אך נשלטה בידי ירדן בפועל. הגבולות המדויקים היו שנויים במחלוקת.',
    uncertaintyEn:'Partial historical outline, not a closed perimeter. Positional uncertainty is unquantified; shown only at overview zooms.',
    uncertaintyHe:'תוואי היסטורי חלקי, לא היקף סגור. אי־ודאות המיקום אינה מכומתת; מוצג רק בקנה מידה כללי.',
    sources:[['OSM · 7304999',osm+'7304999'],['Israel State Archives',archives],['MFA · Jerusalem background',mfaJerusalem]]},
  {id:'gaza-perimeter',en:'Israel–Gaza Strip boundary',he:'גבול ישראל–רצועת עזה',color:'#9a522b',dark:'#f0b088',dash:'6 3',
    detailEn:'The present cartographic land boundary between Israel and the Gaza Strip, from OSM, compared with UN/OCHA. It is not a reconstruction of the original February 1949 armistice line or a present military buffer. The February 1950 modus vivendi established local patrol arrangements; Article III says it does not modify either party’s position relating to the armistice demarcation line.',
    detailHe:'הגבול היבשתי הקרטוגרפי בין ישראל לרצועת עזה כיום, לפי OSM ובהשוואה לאו״ם ולאוצ׳ה. אין זה שחזור של קו שביתת הנשק המקורי מפברואר 1949 או אזור חיץ צבאי כיום. הסדר פברואר 1950 קבע סידורי סיור מקומיים; סעיף III קובע שאין בו שינוי בעמדת מי מהצדדים ביחס לקו שביתת הנשק.',
    uncertaintyEn:'Approximate: OSM/OCHA differ by up to about 923 m; OSM/UN global cartography by about 373 m. Absolute positional accuracy is not established. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב: פערי OSM/אוצ׳ה עד כ־923 מ׳, ו־OSM/הקרטוגרפיה העולמית של האו״ם כ־373 מ׳. הדיוק המוחלט לא נקבע. מוסתר בהגדלה מפורטת.',
    sources:[['OSM · 1473938',osm+'1473938'],['UN · S/1471 (1950)','https://www.un.org/unispal/document/auto-insert-183322/']]},
  {id:'egypt-border',en:'Egypt · international border',he:'מצרים · גבול בין־לאומי',color:'#645344',dark:'#dac1a5',dash:'',
    detailEn:'The 1979 peace treaty’s Article II defines the recognized international boundary between Egypt and the former mandated territory of Palestine, without prejudice to the issue of the status of the Gaza Strip. The cartographic line includes Taba. Coordinates are OSM, compared with UN and Natural Earth cartography.',
    detailHe:'סעיף II להסכם השלום מ־1979 מגדיר את הגבול הבין־לאומי המוכר בין מצרים לבין ארץ־ישראל המנדטורית לשעבר, בלי לפגוע בסוגיית מעמדה של רצועת עזה. התוואי הקרטוגרפי כולל את טאבה. הקואורדינטות הן של OSM, בהשוואה לקרטוגרפיה של האו״ם ושל Natural Earth.',
    uncertaintyEn:'OSM/UN differ by up to about 360 m; the coarse Natural Earth 1:10 million line by 3.2 km. These are approximate cartographic coordinates, not pillar surveys; detailed zooms are limited.',
    uncertaintyHe:'פערי OSM/או״ם עד כ־360 מ׳; מול Natural Earth הכללי בקנ״מ 1:10 מיליון עד 3.2 ק״מ. אלה קואורדינטות קרטוגרפיות מקורבות, לא מדידות עמודי הגבול; ההצגה בהגדלה מפורטת מוגבלת.',
    sources:[['OSM · 1473946',osm+'1473946'],['MFA · Egypt peace treaty','https://embassies.gov.il/egypt/en/news/israel-egypt-peace-treaty']]},
  {id:'jordan-border',en:'Jordan · international border',he:'ירדן · גבול בין־לאומי',color:'#645344',dark:'#dac1a5',dash:'',
    detailEn:'The 1994 treaty’s Article 3(2) is quoted below. The line with Judea and Samaria is shown separately, with the presentation and disclaimer required by Annex I(a) 2.A.7. The Yarmouk drawing ends near the 1949 Syrian armistice line’s river junction; the Hamat Gader segment farther east is omitted.',
    detailHe:'סעיף 3(2) להסכם מ־1994 מצוטט להלן. הקו מול יהודה ושומרון מוצג בנפרד, בצורה ובהערת ההסתייגות הנדרשות בנספח I(א), 2.A.7. התוואי בירמוך מסתיים סמוך למפגש קו שביתת הנשק הסורי מ־1949 עם הנהר; מקטע חמת גדר שממזרח לו אינו מוצג.',
    uncertaintyEn:'OSM/UN cartographies differ by up to about 764 m; coarse Natural Earth differs by 5.9 km. Not treaty pillar coordinates. Hidden at detailed zooms.',
    uncertaintyHe:'פערי הקרטוגרפיה של OSM/או״ם עד כ־764 מ׳; מול Natural Earth הכללי עד 5.9 ק״מ. אין אלה קואורדינטות עמודי הגבול של ההסכם. מוסתר בהגדלה מפורטת.',
    quotes:[{reference:'1994 · Article 3(2)',...treaty.jordanArticle3_2}],
    sources:[['OSM · 184818',osm+'184818'],['MFA · Jordan peace treaty',treaty.sources.mfaEnglish],['Official Hebrew treaty record',originalTreaty]]},
  {id:'jordan-1967-admin',en:'Jordan · line with Judea and Samaria',he:'ירדן · הקו מול יהודה ושומרון',color:'#956333',dark:'#edc48f',dash:'10 3 2 3',
    detailEn:'Distinct presentation under the 1994 treaty, Annex I(a) 2.A.7. The treaty’s wording and required disclaimer are quoted below.',
    detailHe:'הצגה נפרדת לפי הסכם 1994, נספח I(א), 2.A.7. נוסח ההסכם וההסתייגות הנדרשת מצוטטים להלן.',
    uncertaintyEn:'Approximate OSM cartography, with source differences up to about 764 m. The treaty’s orthophoto sheets and binding coordinate list were not obtained. Hidden at detailed zooms.',
    uncertaintyHe:'קרטוגרפיה מקורבת של OSM, עם פערי מקורות עד כ־764 מ׳. גליונות האורתופוטו ורשימת הקואורדינטות המחייבת של ההסכם לא הושגו. מוסתר בהגדלה מפורטת.',
    quotes:[{reference:'1994 · Annex I(a) 2.A.7',...treaty.jordanAnnex1a2A7}],
    sources:[['OSM · 184818',osm+'184818'],['MFA · Jordan treaty Annex I',treaty.sources.mfaAnnexEnglish],['Official Hebrew treaty record',originalTreaty]]},
  {id:'blue-line',en:'Lebanon · Blue Line (partial)',he:'לבנון · הקו הכחול (חלקי)',color:'#2164a5',dark:'#8dbfff',dash:'3 3',
    detailEn:'The UN identified the withdrawal line in 2000. It is not an international border or necessarily the physical fence. The 1923 boundary adopted by the 1949 armistice (V(1)) is the basis of much of the common route. Only OSM sections consistent with the UN’s explicit withdrawal map 4143 Rev.1 are shown; four unmatched sections, including Ghajar and the northeastern end, are omitted. Pre-2000 CIA provenance alone does not establish Blue Line identity.',
    detailHe:'האו״ם זיהה את קו הנסיגה בשנת 2000. אין זה גבול בין־לאומי או בהכרח תוואי הגדר בפועל. גבול 1923 שאומץ בהסכם שביתת הנשק מ־1949 (V(1)) הוא הבסיס לחלק ניכר מהתוואי המשותף. מוצגים רק מקטעי OSM התואמים למפת קו הנסיגה המפורשת של האו״ם, 4143 מהדורה 1; ארבעה מקטעים שלא תאמו, ובהם בע׳ג׳ר ובקצה הצפון־מזרחי, אינם מוצגים. מקור CIA שקדם ל־2000 אינו מוכיח לבדו שזהו הקו הכחול.',
    uncertaintyEn:'Approximate, about ±200 m at the UN map’s scale; accepted source sections differ by at most about 165 m. This does not certify individual Blue Barrels or resolve coincident 1923/2000 lines more finely. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב, כ־±200 מ׳ בקנה המידה של מפת האו״ם; פערי המקטעים שהתקבלו עד כ־165 מ׳. אין זה אימות של כל חבית כחולה או הבחנה מדויקת יותר בין קווי 1923/2000 החופפים. מוסתר בהגדלה מפורטת.',
    sources:[['UN · withdrawal map 4143 Rev.1 (2000)','https://www.un.org/geospatial/en/content/withdrawal-line-israeli-forces-lebanon'],['OSM · Israel relation',osm+'1473946']]},
  {id:'golan-alpha',en:'Golan · 1974 Alpha line',he:'גולן · קו אלפא 1974',color:'#7550a4',dark:'#c7a5f4',dash:'8 3 2 3',
    detailEn:'The 1974 disengagement Line A (Alpha), distinct from the 1949 Israel–Syria armistice line. The 1974 agreement requires Israeli military forces west of A, except at Quneitra where A-1 applies. This layer shows A only. Bravo, A-1 and the separation-area fill remain withheld; the line does not show current deployments.',
    detailHe:'קו A (אלפא) של הפרדת הכוחות מ־1974, הנבדל מקו שביתת הנשק ישראל–סוריה מ־1949. הסכם 1974 קובע שכוחות צבא ישראליים יהיו ממערב ל־A, למעט באזור קוניטרה שבו חל A-1. שכבה זו מציגה רק את A. בראבו, A-1 ומילוי אזור ההפרדה עדיין אינם מוצגים; הקו אינו מציג פריסת כוחות כיום.',
    uncertaintyEn:'Approximate OSM cartography. The coarse Natural Earth comparison differs by up to 1.1 km; comparison with UNDOF map 2916 Rev.143 (September 2026) differs by up to about 460 m, with about 49 m grid-registration residual. Hidden at detailed zooms.',
    uncertaintyHe:'קרטוגרפיה מקורבת של OSM. בהשוואה ל־Natural Earth הכללי הפער עד 1.1 ק״מ; מול מפת אונדו״ף 2916 מהדורה 143 (ספטמבר 2026) הפער עד כ־460 מ׳, עם שארית רישום רשת של כ־49 מ׳. מוסתר בהגדלה מפורטת.',
    sources:[['UNDOF · map 2916','https://www.un.org/geospatial/en/content/undof'],['OSM · A-Line ways',osm+'1473946']]},
];
const SOURCE_LABELS_HE: Record<string,string> = {
  'UN · S/1302/Rev.1':'או״ם · S/1302/Rev.1','UN · map 229 (1949)':'או״ם · מפה 229 (1949)',
  'UN · S/1471 (1950)':'או״ם · S/1471 (1950)','Israel State Archives':'ארכיון המדינה',
  'MFA · Jerusalem background':'משרד החוץ · הרקע למעמד ירושלים','MFA · Egypt peace treaty':'משרד החוץ · הסכם השלום עם מצרים',
  'MFA · Jordan peace treaty':'משרד החוץ · הסכם השלום עם ירדן','MFA · Jordan treaty Annex I':'משרד החוץ · הסכם ירדן, נספח I',
  'Frid · TAU, Israel 31–32 (2024), pp. 470–473':'פריד · אוניברסיטת תל אביב, ישראל 31–32 (2024), עמ׳ 470–473',
  'Official Hebrew treaty record':'התיעוד הממשלתי הרשמי של ההסכם בעברית',
  'UN · withdrawal map 4143 Rev.1 (2000)':'או״ם · מפת קו הנסיגה 4143, מהדורה 1 (2000)',
  'OSM · Israel relation':'OSM · יחס ישראל','UNDOF · map 2916':'אונדו״ף · מפה 2916','OSM · A-Line ways':'OSM · תוואי קו A',
};
export const mapLineSourceLabel=(label:string,lang:'he'|'en')=>lang==='he'?SOURCE_LABELS_HE[label]??label:label;
