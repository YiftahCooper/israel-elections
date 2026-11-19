// Bombadil specification for the Israeli Elections Explorer.
// Run instructions: tests/bombadil/README.md. The @antithesishq/bombadil modules are bundled in the bombadil binary.
import { always } from "@antithesishq/bombadil";
import { isAction } from "@antithesishq/bombadil/actions";
import { extract, weighted } from "@antithesishq/bombadil/browser";
import { clicks, inputs, navigation, scroll, waitOnce } from "@antithesishq/bombadil/browser/defaults/actions";

// Bombadil's default properties: uncaught exceptions, unhandled rejections, console errors, HTTP errors.
export * from "@antithesishq/bombadil/browser/defaults/properties";

// Actions: Bombadil's defaults, reweighted. The seat chart's 120 seat buttons otherwise take a third of all clicks,
// and reloads (part of navigation) a tenth of all actions, which keeps the run shallow.
const isSeat = (action) => isAction(action, "Click") && action.Click.fingerprint?.tag === "g";
export const actionsMix = weighted([
  [100, clicks.filter((action) => !isSeat(action))],
  [10, clicks.filter(isSeat)],
  [100, inputs],
  [40, scroll],
  [3, navigation],
  [1, waitOnce],
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
