// Bombadil specification for haknesset (the Israeli elections explorer).
// Run instructions: tests/bombadil/README.md. The @antithesishq/bombadil modules are bundled in the bombadil binary.
import { always } from "@antithesishq/bombadil";
import { isAction } from "@antithesishq/bombadil/actions";
import { extract, weighted } from "@antithesishq/bombadil/browser";
import { clicks, inputs, navigation, scroll, waitOnce } from "@antithesishq/bombadil/browser/defaults/actions";
// the language, election and complexity switches: random clicks seldom reach them
import { complexitySwitch, electionSwitch, languageSwitch } from "./switches.js";

// Bombadil's default properties: uncaught exceptions, unhandled rejections, console errors, HTTP errors.
export * from "@antithesishq/bombadil/browser/defaults/properties";

// Actions: Bombadil's defaults, reweighted. The seat chart's 120 seat buttons otherwise take a third of all clicks,
// and reloads (part of navigation) a tenth of all actions, which keeps the run shallow. The three switches are about
// 1% of actions each, a few times a minute.
const isSeat = (action) => isAction(action, "Click") && action.Click.fingerprint?.tag === "g";
export const actionsMix = weighted([
  [100, clicks.filter((action) => !isSeat(action))],
  [10, clicks.filter(isSeat)],
  [100, inputs],
  [40, scroll],
  [3, navigation],
  [1, waitOnce],
  [2, languageSwitch],
  [3, electionSwitch],
  [3, complexitySwitch],
]);

// The document never scrolls sideways (1 px tolerance for sub-pixel rounding).
const sideways = extract((state) => {
  const root = state.document.documentElement;
  const over = root.scrollWidth - root.clientWidth;
  return over > 1 ? { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth } : null;
});
export const noHorizontalScroll = always(() => sideways.current === null);

// No leaked programming values in visible text.
const leaked = extract((state) => {
  const text = state.document.body?.innerText ?? "";
  const hits = [];
  for (const re of [/\[object Object\]/, /\bundefined\b/, /\bNaN\b/]) {
    const m = re.exec(text);
    if (m) hits.push(text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).replace(/\s+/g, " "));
  }
  return hits;
});
export const noLeakedValues = always(() => leaked.current.length === 0);

// Every Knesset seat chart on screen shows 120 seats, and its centre number agrees.
const chambers = extract((state) =>
  Array.from(state.document.querySelectorAll(".chamber svg[role=group]")).map((svg) => ({
    seats: svg.querySelectorAll("[data-seat], [data-tl-seat]").length, // main chart, term timeline
    centre: svg.querySelector(".centre-total")?.textContent ?? null,
    label: (svg.getAttribute("aria-label") ?? "").slice(0, 80),
  })),
);
export const seatChartsShow120 = always(() =>
  chambers.current.every((c) => c.seats === 120 && (c.centre === null || c.centre.trim() === "120")),
);

// html[dir] and html[lang] agree, and agree with the pressed button in the Language switch when it is on screen.
const language = extract((state) => {
  const root = state.document.documentElement;
  const pressed = state.document.querySelector(
    '.seg[role=group] button[lang="he"][aria-pressed="true"], .seg[role=group] button[lang="en"][aria-pressed="true"]',
  );
  const switchPresent = !!state.document.querySelector('.seg[role=group] button[lang="he"] ~ button[lang="en"]');
  return { lang: root.lang, dir: root.dir, chosen: switchPresent && pressed ? pressed.getAttribute("lang") : null };
});
export const directionMatchesLanguage = always(() => {
  const { lang, dir, chosen } = language.current;
  if (lang !== "he" && lang !== "en") return false;
  if (dir !== (lang === "he" ? "rtl" : "ltr")) return false;
  return chosen === null || chosen === lang;
});

// The Turnout tile's percentage agrees with the ballots cast and registered voters its window lists, to the
// precision shown: "70.5%" (trailing zeros dropped) lies within 0.05 of the exact share; "<0.1%" and ">99.9%" are
// checked as bounds; an exact value cut short ("33.333333…%") lies within one unit of its last digit below the share.
const turnout = extract((state) => {
  const num = (t) => Number(String(t).replace(/[^\d.]/g, ""));
  const out = [];
  for (const fig of state.document.querySelectorAll(".figures .fig")) {
    const more = fig.querySelector(".more");
    const kv = more ? [...more.querySelectorAll(".kv > span")].map((s) => s.textContent.trim()) : [];
    const at = (labels) => { const i = kv.findIndex((t) => labels.includes(t)); return i >= 0 ? kv[i + 1] : null; };
    const registered = at(["Registered voters", "בעלי זכות בחירה"]), cast = at(["Ballots cast", "מצביעים"]);
    const key = fig.querySelector(".k")?.textContent.trim();
    if (!["Turnout", "שיעור ההצבעה"].includes(key) || registered === null || cast === null) continue;
    const shown = (fig.querySelector(".v .percentage")?.textContent ?? "").trim();
    out.push({ shown, registered: num(registered), cast: num(cast) });
  }
  return out;
});
const turnoutAgrees = ({ shown, registered, cast }) => {
  if (registered === 0) return shown === "—%";
  const exact = (100 * cast) / registered;
  const m = /^([<>]?)(\d+(?:\.(\d+))?)(…?)%$/.exec(shown);
  if (!m) return false;
  const value = Number(m[2]), step = 10 ** -(m[3]?.length ?? 0), slack = 1e-9;
  if (m[1] === "<") return exact > 0 && exact < value + slack;
  if (m[1] === ">") return exact > value - slack && exact < 100;
  if (m[4]) return exact >= value - slack && exact < value + step + slack;
  return Math.abs(exact - value) <= step / 2 + slack;
};
export const turnoutMatchesCounts = always(() => turnout.current.every(turnoutAgrees));

// The seats in the Lists column, and in the results table (Charts → table), add up to 120: the Knesset's size. In
// experimental rules the seat count can be changed; then they add up to the seat chart's centre figure instead.
const listSeats = extract((state) => {
  const doc = state.document;
  const experimental = !!doc.querySelector(".chip.exp");
  const centre = doc.querySelector(".chamber svg[role=group] .centre-total")?.textContent.trim() ?? null;
  const sums = [];
  for (const section of doc.querySelectorAll("section.lbars")) {
    const seats = [...section.querySelectorAll("ol.lb > li > button.lb-row .lb-seats > b")].map((b) => Number(b.textContent));
    if (seats.length) sums.push({ where: "lists", sum: seats.reduce((a, b) => a + b, 0) });
  }
  for (const table of doc.querySelectorAll("table.tbl")) {
    const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    const col = heads.findIndex((h) => h === "Seats" || h === "מנדטים");
    // only the results table (it has a "% seats" column); the walkthrough's tables count seats part of the way
    if (col < 0 || !["List", "רשימה"].includes(heads[0]) || !heads.some((h) => h === "% seats" || h === "% מנדטים")) continue;
    const seats = [...table.querySelectorAll("tbody tr")].map((tr) => Number(tr.children[col]?.textContent.trim()));
    if (seats.length && seats.every(Number.isFinite)) sums.push({ where: "table", sum: seats.reduce((a, b) => a + b, 0) });
  }
  return { experimental, centre, sums };
});
export const listSeatsAddUp = always(() => {
  const { experimental, centre, sums } = listSeats.current;
  const expected = experimental && centre !== null ? Number(centre) : 120;
  return sums.every((s) => s.sum === expected);
});

// At phone width, no visible text runs off the left or right edge of the screen. Left out: text inside a box that
// scrolls sideways (it can be scrolled to), text cut short on purpose (an ellipsis) or cut by a box that stands clear
// of both screen edges (cut inside the screen, not at its edge), and screen-reader-only labels (1 px boxes).
// Checked only below 500 px.
const offscreenText = extract((state) => {
  const doc = state.document, win = state.window, width = win.innerWidth;
  if (width >= 500 || !doc.body) return [];
  const hits = [];
  const walker = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */);
  const range = doc.createRange();
  const excused = new Map();
  const isExcused = (el) => {
    if (excused.has(el)) return excused.get(el);
    let verdict = false;
    for (let a = el; a && a !== doc.documentElement; a = a.parentElement) {
      const cs = win.getComputedStyle(a);
      const box = a.getBoundingClientRect();
      if (box.width <= 1 && box.height <= 1) { verdict = true; break; }
      if (cs.overflowX !== "visible") {
        if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && a.scrollWidth > a.clientWidth) { verdict = true; break; }
        if (cs.textOverflow === "ellipsis") { verdict = true; break; }
        // a clipping box clear of both edges: whatever it cuts off is cut inside the screen, not at its edge (a
        // full-width panel that clips does not count: its cut is the screen's edge)
        if (box.left >= 2 && box.right <= width - 2) { verdict = true; break; }
      }
    }
    excused.set(el, verdict);
    return verdict;
  };
  for (let node = walker.nextNode(); node && hits.length < 3; node = walker.nextNode()) {
    if (!node.data.trim()) continue;
    const el = node.parentElement;
    if (!el || el.closest("script, style, noscript, template")) continue;
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    const bad = rects.find((r) => r.right > width + 1 || r.left < -1);
    if (!bad) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    if (isExcused(el)) continue;
    hits.push({
      text: node.data.trim().slice(0, 60),
      where: `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""}`,
      left: Math.round(bad.left), right: Math.round(bad.right), width,
    });
  }
  return hits;
});
export const noTextOffScreenSideways = always(() => offscreenText.current.length === 0);
