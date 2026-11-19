// The custom actions of the Bombadil spec (spec.js, spec-english.js): not a spec itself, so it may export helpers.
import { actions, extract, registerCustomAction } from "@antithesishq/bombadil/browser";

// ---- Custom actions: the three choices random clicks seldom reach (language, election, complexity) ----
// Each handler runs in the page and goes through the app's own controls, opening the phone menu or Settings first when
// the control is not on screen, and closing what it opened. Handlers are self-contained (they run in the browser) and
// deterministic (the generator picks the argument), so a trace replays. They wait with setTimeout, not
// requestAnimationFrame, which chrome-headless-shell only runs when Bombadil asks for a frame.

export const setLanguage = registerCustomAction("setLanguage", async (document, window, lang) => {
  const pause = () => new Promise((done) => window.setTimeout(done, 60));
  const shown = (el) => !!el && el.getClientRects().length > 0;
  const find = () => [...document.querySelectorAll(`.seg[role=group] button[lang="${lang}"]`)].find(shown);
  let opened = null;
  if (!find()) {
    opened = [...document.querySelectorAll(".band-menu-btn, .band-settings")].find(shown) ?? null;
    opened?.click();
    for (let i = 0; i < 20 && !find(); i++) await pause();
  }
  find()?.click();
  await pause();
  // close what was opened: Settings by its × button, the phone menu by its own button
  document.querySelector(".personal-settings[open] .ps-close")?.click();
  if (opened?.matches(".band-menu-btn") && opened.getAttribute("aria-expanded") === "true") opened.click();
});

const pickElection = registerCustomAction("pickElection", async (document, window, id) => {
  const pause = () => new Promise((done) => window.setTimeout(done, 60));
  const shown = (el) => !!el && el.getClientRects().length > 0;
  const trigger = [...document.querySelectorAll(".election .choice-trigger")].find(shown);
  if (!trigger) return;
  trigger.click();
  await pause();
  document.querySelector(`.election-dialog [data-choice-value="${id}"]`)?.click();
});

const setComplexity = registerCustomAction("setComplexity", async (document, window, index) => {
  const pause = () => new Promise((done) => window.setTimeout(done, 60));
  const shown = (el) => !!el && el.getClientRects().length > 0;
  const find = () => [...document.querySelectorAll(".complexity .seg[role=group]")].find(shown)?.querySelectorAll("button")[index];
  let opened = null;
  if (!find()) {
    opened = [...document.querySelectorAll(".band-menu-btn, .band-settings")].find(shown) ?? null;
    opened?.click();
    for (let i = 0; i < 20 && !find(); i++) await pause();
  }
  find()?.click();
  await pause();
  document.querySelector(".personal-settings[open] .ps-close")?.click();
  if (opened?.matches(".band-menu-btn") && opened.getAttribute("aria-expanded") === "true") opened.click();
});

// what the generators need to offer only actions that change something
export const choices = extract((state) => {
  const doc = state.document;
  const elections = [...doc.querySelectorAll(".election-dialog .choice-option:not(:disabled)")]
    .filter((b) => b.getAttribute("aria-current") !== "true")
    .map((b) => b.getAttribute("data-choice-value"))
    .filter(Boolean);
  const seg = doc.querySelector(".complexity .seg[role=group]");
  const pressed = seg ? [...seg.querySelectorAll("button")].findIndex((b) => b.getAttribute("aria-pressed") === "true") : -1;
  return { lang: doc.documentElement.lang, elections: [...new Set(elections)], level: pressed };
});
export const languageSwitch = actions(() => [setLanguage(choices.current.lang === "en" ? "he" : "en")]);
export const electionSwitch = actions(() => choices.current.elections.map((id) => pickElection(id)));
// Simple, Standard, Expert (Custom, the fourth, appears only after a choice of one's own)
export const complexitySwitch = actions(() => [0, 1, 2].filter((i) => i !== choices.current.level).map((i) => setComplexity(i)));
