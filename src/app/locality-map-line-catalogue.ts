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
  fill?:'hatch'|'cross'|'solid';
  outline?:boolean;
  quotes?: readonly {reference:string;referenceHe?:string;en:string;he:string;translatedHe?:boolean}[];
}
export const MAP_LINES: readonly MapLineDefinition[] = [
  {id:'green-line',en:'Armistice lines · Judea and Samaria',he:'קווי שביתת הנשק · יהודה ושומרון',color:'#247449',dark:'#89d2a4',dash:'7 4',
    detailEn:'The 1949 agreement defines the line by sector: the former Iraqi front (VI(2), Map 1 line A); UNTSO truce lines from Kh. Deir Arab to Jerusalem, including Latrun (V(1)(a)); Jerusalem’s 30 November 1948 cease-fire lines (V(1)(b)); and Hebron–Dead Sea (V(1)(c), Map 1 line B), subject to agreed rectifications (VI(11)). The Dead Sea crossing agrees with the signed 1949 map within about 0.5 km. The northern Jerusalem pair ends at UN map 229’s coverage.',
    detailHe:'הסכם 1949 מגדיר את הקו לפי מקטעים: החזית העיראקית לשעבר (VI(2), קו A במפה 1); קווי ההפוגה של אונטס״ו מח׳רבת דיר ערב לירושלים, לרבות לטרון (V(1)(a)); קווי הפסקת האש בירושלים מ־30 בנובמבר 1948 (V(1)(b)); וחברון–ים המלח (V(1)(c), קו B במפה 1), בכפוף לתיקונים מוסכמים (VI(11)). המקטע בים המלח תואם למפה החתומה מ־1949 בטווח של כחצי ק״מ. זוג הקווים בצפון ירושלים מסתיים בגבול כיסוי מפה 229 של האו״ם.',
    uncertaintyEn:'Approximate: central Jerusalem about ±60 m from map registration; elsewhere the source products differ by up to about 843 m, without a surveyed accuracy bound. Approximate sections disappear at closer zooms.',
    uncertaintyHe:'תוואי מקורב: במרכז ירושלים כ־±60 מ׳ לפי רישום המפה; בשאר המקטעים פערים של עד כ־843 מ׳ בין המקורות, ללא גבול דיוק מדוד. המקטעים המקורבים מוסתרים בהגדלה נוספת.',
    quotes:[{reference:'1949 · VI(9)',en:'agreed upon by the Parties without prejudice to future territorial settlements or boundary lines or to claims of either Party relating thereto.',he:'הוסכם עליהם בידי הצדדים בלי לפגוע בהסדרים טריטוריאליים עתידיים או בקווי גבול עתידיים או בתביעות של מי מהצדדים ביחס לכך.',translatedHe:true}],
    sources:[['OpenStreetMap · 7304999',osm+'7304999'],['UN · map 229 (1949)',un229],['UN · S/1302/Rev.1','https://www.un.org/unispal/document/auto-insert-181069/']]},
  {id:'no-mans-land',en:'No-man’s-land · 1949–1967',he:'שטחי הפקר · 1949–1967',color:'#80631f',dark:'#dfc875',dash:'',fill:'hatch',
    detailEn:'Historical no-man’s-land at Latrun and in central Jerusalem. The MFA describes Jerusalem’s no-man’s-land as the area between the lines to which access was prohibited. Government House and Mount Scopus have separate statuses. Latrun’s eastern end was never defined on an agreed map; this fill closes along the published OpenStreetMap outline. The Jerusalem fill ends at UN map 229’s coverage and at the Government House overlay.',
    detailHe:'שטחי הפקר היסטוריים בלטרון ובמרכז ירושלים. משרד החוץ מתאר את שטח ההפקר בירושלים כשטח בין הקווים שהגישה אליו נאסרה. לארמון הנציב ולהר הצופים מעמד נפרד. הקצה המזרחי בלטרון מעולם לא הוגדר במפה מוסכמת; המילוי נסגר לפי התוואי שפורסם ב־OpenStreetMap. המילוי בירושלים מסתיים בגבול כיסוי מפה 229 ובתחום שכבת ארמון הנציב.',
    uncertaintyEn:'Jerusalem approximately ±60 m; Latrun’s source outlines differ by up to about 740 m and its eastern closure is not an agreed boundary. Detailed zooms omit the approximate Latrun outline.',
    uncertaintyHe:'בירושלים כ־±60 מ׳; בלטרון פערים של עד כ־740 מ׳ בין תוואי המקורות, והסגירה המזרחית אינה גבול מוסכם. תוואי לטרון המקורב מוסתר בהגדלה מפורטת.',
    sources:[['OpenStreetMap · 7304999',osm+'7304999'],['UN · map 229 (1949)',un229],['Israel State Archives',archives],['MFA · Jerusalem background',mfaJerusalem],['Frid · TAU, Israel 31–32 (2024), pp. 470–477',frid]]},
  {id:'govt-house-zone',en:'Government House zone · 1949–1967',he:'אזור ארמון הנציב · 1949–1967',color:'#78508a',dark:'#d4b7e3',dash:'4 4',fill:'cross',outline:true,
    detailEn:'Demilitarized area between the lines around the UN headquarters. On 26 June 1949 the Mixed Armistice Commission summarised four-month civilian-residence terms, within grid lines 130 (north) and 128 (south). Jordan’s government refused to approve the civilian division on 28 June. The Nuwar–Dayan line was never formally signed, but both sides recognised it in practice; Frid records de facto confirmation in June 1957. That internal line is not drawn without its map.',
    detailHe:'שטח מפורז בין הקווים סביב מפקדת האו״ם. ב־26 ביוני 1949 סיכמה ועדת שביתת הנשק המעורבת תנאים למגורי אזרחים למשך ארבעה חודשים, בין קו רשת 130 בצפון ל־128 בדרום. ממשלת ירדן סירבה לאשר את החלוקה האזרחית ב־28 ביוני. קו נואר–דיין מעולם לא נחתם רשמית, אך שני הצדדים הכירו בו בפועל; פריד מתעד אישור למצב דה פקטו ביוני 1957. הקו הפנימי אינו מצויר ללא המפה שלו.',
    uncertaintyEn:'The outline follows OpenStreetMap; at grid line 130 it differs from UN map 229 by about 0.5 km. Absolute accuracy is not established. The fill is shown at overview zooms; the armistice edges remain to their own scale limit.',
    uncertaintyHe:'התוואי לפי OpenStreetMap; בקו רשת 130 הוא שונה ממפה 229 של האו״ם בכחצי ק״מ. הדיוק המוחלט לא נקבע. המילוי מוצג בקנה מידה כללי; קווי שביתת הנשק נשארים עד מגבלת ההגדלה שלהם.',
    sources:[['Israel State Archives',archives],['MFA · Jerusalem background',mfaJerusalem],['Frid · TAU, Israel 31–32 (2024), pp. 470–477',frid]]},
  {id:'scopus',en:'Mount Scopus · Israeli enclave · 1948–1967',he:'הר הצופים · המובלעת הישראלית · 1948–1967',color:'#247449',dark:'#89d2a4',dash:'2 3',
    detailEn:'The 7 July 1948 arrangement placed the Israeli enclave (Hebrew University and Hadassah) and adjoining Jordanian Augusta Victoria area under UN protection. The partial northern outline excludes Augusta Victoria. Isawiya was included in the mapped Israeli enclave but controlled by Jordan in practice. The exact limits were disputed; the internal division is not drawn.',
    detailHe:'ההסדר מ־7 ביולי 1948 העמיד את המובלעת הישראלית (האוניברסיטה העברית והדסה) ואת אזור אוגוסטה ויקטוריה הירדני הסמוך תחת הגנת האו״ם. התוואי הצפוני החלקי אינו כולל את אוגוסטה ויקטוריה. עיסאוויה נכללה במובלעת הישראלית במפה אך נשלטה בידי ירדן בפועל. הגבולות המדויקים היו שנויים במחלוקת; קו החלוקה הפנימי אינו מצויר.',
    uncertaintyEn:'Partial historical outline, not a closed perimeter. Positional uncertainty is unquantified; shown only at overview zooms.',
    uncertaintyHe:'תוואי היסטורי חלקי, לא היקף סגור. אי־ודאות המיקום אינה מכומתת; מוצג רק בקנה מידה כללי.',
    sources:[['OpenStreetMap · 7304999',osm+'7304999'],['Israel State Archives',archives],['MFA · Jerusalem background',mfaJerusalem]]},
  {id:'gaza-perimeter',en:'Israel–Gaza Strip boundary',he:'גבול ישראל–רצועת עזה',color:'#9a522b',dark:'#f0b088',dash:'6 3',
    detailEn:'The present cartographic land boundary between Israel and the Gaza Strip, from OpenStreetMap, compared with UN/OCHA. It is not a reconstruction of the original February 1949 armistice line or a present military buffer. The February 1950 modus vivendi established local patrol arrangements; Article III says it does not modify either party’s position relating to the armistice demarcation line.',
    detailHe:'הגבול היבשתי הקרטוגרפי בין ישראל לרצועת עזה כיום, לפי OpenStreetMap ובהשוואה לאו״ם ולאוצ׳ה. אין זה שחזור של קו שביתת הנשק המקורי מפברואר 1949 או אזור חיץ צבאי כיום. הסדר פברואר 1950 קבע סידורי סיור מקומיים; סעיף III קובע שאין בו שינוי בעמדת מי מהצדדים ביחס לקו שביתת הנשק.',
    uncertaintyEn:'Approximate: OpenStreetMap/OCHA differ by up to about 923 m; OpenStreetMap/UN global cartography by about 373 m. Absolute positional accuracy is not established. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב: הפער בין OpenStreetMap לאוצ׳ה מגיע לכ־923 מ׳, ובין OpenStreetMap לקרטוגרפיה העולמית של האו״ם לכ־373 מ׳. הדיוק המוחלט לא נקבע. מוסתר בהגדלה מפורטת.',
    sources:[['OpenStreetMap · 1473938',osm+'1473938'],['UN · S/1471 (1950)','https://www.un.org/unispal/document/auto-insert-183322/']]},
  {id:'egypt-border',en:'Egypt · international border',he:'מצרים · גבול בין־לאומי',color:'#645344',dark:'#dac1a5',dash:'',
    detailEn:'The permanent boundary under Article II of the 1979 peace treaty is quoted below. The cartographic line follows the Israel–Egypt boundary, compared with independent UN cartography.',
    detailHe:'הגבול הקבוע לפי סעיף II להסכם השלום מ־1979 מצוטט להלן. התוואי הקרטוגרפי עוקב אחר גבול ישראל–מצרים, בהשוואה לקרטוגרפיה עצמאית של האו״ם.',
    uncertaintyEn:'OpenStreetMap/UN differ by up to about 360 m; the coarse Natural Earth 1:10 million line by 3.2 km. These are approximate cartographic coordinates, not pillar surveys; detailed zooms are limited.',
    uncertaintyHe:'הפער בין OpenStreetMap לאו״ם מגיע לכ־360 מ׳; מול Natural Earth הכללי בקנ״מ 1:10 מיליון עד 3.2 ק״מ. אלה קואורדינטות קרטוגרפיות מקורבות, לא מדידות עמודי הגבול; ההצגה בהגדלה מפורטת מוגבלת.',
    quotes:[{reference:'1979 · Article II',referenceHe:'1979 · סעיף II',en:treaty.egyptArticleII.en,he:'הגבול הקבוע בין מצרים לישראל הוא הגבול הבין־לאומי המוכר בין מצרים לבין ארץ־ישראל המנדטורית לשעבר, כמוצג במפה שבנספח II, בלי לפגוע בסוגיית מעמדה של רצועת עזה.',translatedHe:true}],
    sources:[['OpenStreetMap · 1473946',osm+'1473946'],['MFA · Egypt peace treaty','https://embassies.gov.il/egypt/en/news/israel-egypt-peace-treaty'],['UNTS 1136 · Article II (1979)','https://treaties.un.org/doc/Publication/UNTS/Volume%201136/v1136.pdf#page=135']]},
  {id:'jordan-border',en:'Jordan · international border',he:'ירדן · גבול בין־לאומי',color:'#645344',dark:'#dac1a5',dash:'',
    detailEn:'The 1994 treaty’s Article 3(2) is quoted below. The line with Judea and Samaria is shown separately, with the presentation and disclaimer required by Annex I(a) 2.A.7. The Yarmouk drawing ends near the 1949 Syrian armistice line’s river junction; the Hamat Gader segment farther east is omitted.',
    detailHe:'סעיף 3(2) להסכם מ־1994 מצוטט להלן. הקו מול יהודה ושומרון מוצג בנפרד, בצורה ובהערת ההסתייגות הנדרשות בנספח I(א), 2.A.7. התוואי בירמוך מסתיים סמוך למפגש קו שביתת הנשק הסורי מ־1949 עם הנהר; מקטע חמת גדר שממזרח לו אינו מוצג.',
    uncertaintyEn:'OpenStreetMap/UN cartographies differ by up to about 764 m; coarse Natural Earth differs by 5.9 km. Not treaty pillar coordinates. Hidden at detailed zooms.',
    uncertaintyHe:'הפער בין OpenStreetMap לקרטוגרפיה של האו״ם מגיע לכ־764 מ׳; מול Natural Earth הכללי עד 5.9 ק״מ. אין אלה קואורדינטות עמודי הגבול של ההסכם. מוסתר בהגדלה מפורטת.',
    quotes:[{reference:'1994 · Article 3(2)',referenceHe:'1994 · סעיף 3(2)',...treaty.jordanArticle3_2}],
    sources:[['OpenStreetMap · 184818',osm+'184818'],['MFA · Jordan peace treaty',treaty.sources.mfaEnglish],['Official Hebrew treaty record',originalTreaty],['UNTS 42 · No.657, Annex I(24)','https://treaties.un.org/doc/publication/unts/volume%2042/v42.pdf']]},
  {id:'jordan-1967-admin',en:'Jordan · line with Judea and Samaria',he:'ירדן · הקו מול יהודה ושומרון',color:'#956333',dark:'#edc48f',dash:'10 3 2 3',
    detailEn:'Distinct presentation under the 1994 treaty, Annex I(a) 2.A.7. The treaty’s wording and required disclaimer are quoted below.',
    detailHe:'הצגה נפרדת לפי הסכם 1994, נספח I(א), 2.A.7. נוסח ההסכם וההסתייגות הנדרשת מצוטטים להלן.',
    uncertaintyEn:'Approximate OpenStreetMap cartography, with source differences up to about 764 m. The treaty’s orthophoto sheets and binding coordinate list were not obtained. Hidden at detailed zooms.',
    uncertaintyHe:'קרטוגרפיה מקורבת של OpenStreetMap, עם פערי מקורות עד כ־764 מ׳. גליונות האורתופוטו ורשימת הקואורדינטות המחייבת של ההסכם לא הושגו. מוסתר בהגדלה מפורטת.',
    quotes:[{reference:'1994 · Annex I(a) 2.A.7',referenceHe:'1994 · נספח I(א) 2.A.7',...treaty.jordanAnnex1a2A7}],
    sources:[['OpenStreetMap · 184818',osm+'184818'],['MFA · Jordan treaty Annex I',treaty.sources.mfaAnnexEnglish],['Official Hebrew treaty record',originalTreaty]]},
  {id:'blue-line',en:'Lebanon · Blue Line',he:'לבנון · הקו הכחול',color:'#2164a5',dark:'#8dbfff',dash:'3 3',
    detailEn:'The UN identified this withdrawal line in 2000. It is not an international border. The complete line shown here is taken from UN withdrawal map 4143 Rev.1, July 2000, including Har Dov. It does not show present military positions.',
    detailHe:'האו״ם זיהה קו נסיגה זה בשנת 2000. אין זה גבול בין־לאומי. הקו המלא המוצג כאן לקוח ממפת קו הנסיגה 4143 של האו״ם, מהדורה 1 מיולי 2000, לרבות הר דב. הוא אינו מציג עמדות צבאיות כיום.',
    uncertaintyEn:'Approximate at the published map scale: about ±200 m. This is not a survey of individual Blue Barrels. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב בקנה המידה של המפה שפורסמה: כ־±200 מ׳. אין זו מדידה של כל חבית כחולה. מוסתר בהגדלה מפורטת.',
    sources:[['UN · withdrawal map 4143 Rev.1 (2000)','https://www.un.org/geospatial/en/content/withdrawal-line-israeli-forces-lebanon'],['UNIFIL · Blue Line','https://unifil.unmissions.org/en/node/28372']]},
  {id:'golan-alpha',en:'Golan · 1974 Alpha line',he:'גולן · קו אלפא 1974',color:'#7550a4',dark:'#c7a5f4',dash:'8 3 2 3',
    detailEn:'Line A (Alpha) in the 1974 disengagement arrangements, from UNDOF map 2916 Rev.143, September 2026. It is distinct from the 1949 armistice line. Alpha-1 is a separate line near Quneitra and is not drawn here. This map does not show current deployments.',
    detailHe:'קו A (אלפא) בהסדרי הפרדת הכוחות מ־1974, לפי מפת אונדו״ף 2916, מהדורה 143 מספטמבר 2026. הוא נבדל מקו שביתת הנשק מ־1949. אלפא־1 הוא קו נפרד ליד קוניטרה ואינו מצויר כאן. המפה אינה מציגה פריסת כוחות כיום.',
    uncertaintyEn:'Approximate: about ±210 m at the published map scale, including about 49 m grid-registration residual. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב: כ־±210 מ׳ בקנה המידה של המפה שפורסמה, לרבות שארית רישום רשת של כ־49 מ׳. מוסתר בהגדלה מפורטת.',
    sources:[['UNDOF · map 2916','https://www.un.org/geospatial/en/content/undof'],['UN · 1974 disengagement agreement','https://docs.un.org/en/S/11302/Add.1']]},
  {id:'golan-bravo',en:'Golan · 1974 Bravo line',he:'גולן · קו בראבו 1974',color:'#486a91',dark:'#a8cbef',dash:'5 3',
    detailEn:'Line B (Bravo), the eastern line of the 1974 area of separation, from UNDOF map 2916 Rev.143, September 2026. This map does not show current deployments.',
    detailHe:'קו B (בראבו), הקו המזרחי של אזור ההפרדה מ־1974, לפי מפת אונדו״ף 2916, מהדורה 143 מספטמבר 2026. המפה אינה מציגה פריסת כוחות כיום.',
    uncertaintyEn:'Approximate: about ±210 m at the published map scale, including about 49 m grid-registration residual. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב: כ־±210 מ׳ בקנה המידה של המפה שפורסמה, לרבות שארית רישום רשת של כ־49 מ׳. מוסתר בהגדלה מפורטת.',
    sources:[['UNDOF · map 2916','https://www.un.org/geospatial/en/content/undof'],['UN · 1974 disengagement agreement','https://docs.un.org/en/S/11302/Add.1']]},
  {id:'golan-separation',en:'Golan · area of separation',he:'גולן · אזור ההפרדה',color:'#8b6fb1',dark:'#bca0df',dash:'',fill:'solid',
    detailEn:'The area of separation between Alpha and Bravo under the 1974 disengagement arrangements, supervised by UNDOF. Drawn from map 2916 Rev.143, September 2026. The additional Alpha–Alpha-1 strip near Quneitra and the wider areas of limitation are excluded. This map does not show current deployments.',
    detailHe:'אזור ההפרדה בין אלפא לבראבו לפי הסדרי הפרדת הכוחות מ־1974, בפיקוח אונדו״ף. התוואי לפי מפה 2916, מהדורה 143 מספטמבר 2026. הרצועה הנוספת בין אלפא לאלפא־1 ליד קוניטרה ואזורי הגבלת הכוחות הרחבים יותר אינם נכללים. המפה אינה מציגה פריסת כוחות כיום.',
    uncertaintyEn:'Approximate: about ±210 m at the published map scale, including about 49 m grid-registration residual. Hidden at detailed zooms.',
    uncertaintyHe:'תוואי מקורב: כ־±210 מ׳ בקנה המידה של המפה שפורסמה, לרבות שארית רישום רשת של כ־49 מ׳. מוסתר בהגדלה מפורטת.',
    sources:[['UNDOF · map 2916','https://www.un.org/geospatial/en/content/undof'],['UN · 1974 disengagement agreement','https://docs.un.org/en/S/11302/Add.1']]},
];
const SOURCE_LABELS_HE: Record<string,string> = {
  'UNTS 1136 · Article II (1979)':'סדרת אמנות האו״ם 1136 · סעיף II (1979)',
  'UN · 1974 disengagement agreement':'או״ם · הסכם הפרדת הכוחות מ־1974','UNIFIL · Blue Line':'יוניפי״ל · הקו הכחול','UNTS 42 · No.657, Annex I(24)':'סדרת אמנות האו״ם 42 · מס׳ 657, נספח I(24)',
  'UN · S/1302/Rev.1':'או״ם · S/1302/Rev.1','UN · map 229 (1949)':'או״ם · מפה 229 (1949)',
  'UN · S/1471 (1950)':'או״ם · S/1471 (1950)','Israel State Archives':'ארכיון המדינה',
  'MFA · Jerusalem background':'משרד החוץ · הרקע למעמד ירושלים','MFA · Egypt peace treaty':'משרד החוץ · הסכם השלום עם מצרים',
  'MFA · Jordan peace treaty':'משרד החוץ · הסכם השלום עם ירדן','MFA · Jordan treaty Annex I':'משרד החוץ · הסכם ירדן, נספח I',
  'Frid · TAU, Israel 31–32 (2024), pp. 470–477':'פריד · אוניברסיטת תל אביב, ישראל 31–32 (2024), עמ׳ 470–477',
  'Official Hebrew treaty record':'התיעוד הממשלתי הרשמי של ההסכם בעברית',
  'UN · withdrawal map 4143 Rev.1 (2000)':'או״ם · מפת קו הנסיגה 4143, מהדורה 1 (2000)',
  'OpenStreetMap · Israel relation':'OpenStreetMap · יחס ישראל','UNDOF · map 2916':'אונדו״ף · מפה 2916','OpenStreetMap · A-Line ways':'OpenStreetMap · תוואי קו A',
};
export const mapLineSourceLabel=(label:string,lang:'he'|'en')=>lang==='he'?SOURCE_LABELS_HE[label]??label:label;
