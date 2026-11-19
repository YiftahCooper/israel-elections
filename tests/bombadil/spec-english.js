// The Bombadil spec for an English session: everything in spec.js, plus a first step that switches the app (which
// opens in Hebrew) to English. Each run starts in a fresh browser, so this fires once at the start of every run, and
// again soon after the occasional switch back to Hebrew, which keeps the session mostly in English.
import { actions } from "@antithesishq/bombadil/browser";
import { choices, setLanguage } from "./switches.js";

export * from "./spec.js";
export const englishFirst = actions(() => (choices.current.lang === "he" ? [setLanguage("en")] : []));
