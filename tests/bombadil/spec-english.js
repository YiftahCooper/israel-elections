// The Bombadil spec for an English session: everything in spec.js, with one change to the actions: while the app is in
// Hebrew (it opens in Hebrew, and the random switches go back to it now and then), switching to English is by far the
// likeliest next step, so the session stays mostly in English.
import { actions, weighted } from "@antithesishq/bombadil/browser";
import { actionsMix as mix } from "./spec.js";
import { choices, setLanguage } from "./switches.js";

export * from "./spec.js";
const toEnglish = actions(() => (choices.current.lang === "he" ? [setLanguage("en")] : []));
export const actionsMix = weighted([
  [1000, toEnglish],
  [1, mix],
]);
